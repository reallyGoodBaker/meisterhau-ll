import { Status } from '@core/status'
import { serverStarted } from '@utils/command'
import { Component, ComponentManager, CustomComponent } from '../component'
import { Optional } from '@utils/optional'
import { Actor } from '@utils/actor'

/** AI任务接口 */
export interface MeisterhauAITask {
    (ai: MeisterhauAI): Promise<void>
    (ai: MeisterhauAI): void
    (): Promise<void>
    (): void
}

/** 简单中止控制器 */
export class SimpleAbortController {
    private _aborted = false
    private _listeners: Array<() => void> = []

    /** 获取中止信号 */
    get signal() {
        return {
            aborted: this._aborted,
            addEventListener: (event: string, listener: () => void) => {
                if (event === 'abort') {
                    this._listeners.push(listener)
                }
            },
            removeEventListener: (event: string, listener: () => void) => {
                if (event === 'abort') {
                    const index = this._listeners.indexOf(listener)
                    if (index > -1) {
                        this._listeners.splice(index, 1)
                    }
                }
            }
        }
    }

    /** 中止所有任务 */
    abort() {
        if (!this._aborted) {
            this._aborted = true
            this._listeners.forEach(listener => listener())
            this._listeners = []
        }
    }
}

interface LoopContext {
    breakValue: any
    stopFlag: boolean
}

class MeisterhauAITicker extends CustomComponent {
    constructor(
        readonly ctx: LoopContext,
        readonly loopExpr: (breakLoop: (val: any) => void) => any | Promise<any>,
        readonly resolvers: { resolve: (val: any) => void, reject: (err: any) => void },
        readonly breakLoop: (val: any) => void,
    ) {
        super()

        this.allowTick = true
    }

    onTick(manager: ComponentManager) {
        if (this.ctx.stopFlag) {
            manager.detachComponent(MeisterhauAITicker)
            return this.resolvers.resolve(this.ctx.breakValue)
        }

        ;(this.loopExpr.call(undefined, this.breakLoop) as Promise<any>)
            ?.catch?.(err => this.reject(err))
    }

    reject(err: any) {
        this.ctx.stopFlag = true
        this.resolvers.reject(err)
    }

    resolve(val: any) {
        this.ctx.breakValue = val
        this.ctx.stopFlag = true
        this.resolvers.resolve(val)
    }

    stop() {
        this.ctx.stopFlag = true
    }
}


/** Meisterhau AI 基类 - 管理AI行为和状态机 */
export abstract class MeisterhauAI {
    readonly abortController: SimpleAbortController
    readonly status: Status

    constructor(
        public readonly actor: Optional<Actor>,
        public strategy: string = 'default',
    ) {
        this.status = Status.getOrCreate(actor.unwrap().uniqueId)
        this.abortController = new SimpleAbortController()
        this.setStrategy(strategy)
    }

    abstract getStrategy(strategy: string): AsyncGenerator<MeisterhauAITask, void, unknown> | undefined

    private _fsm?: AsyncGenerator<MeisterhauAITask, void, unknown>
    private _waitExecuting: PromiseWithResolvers<void>[] = []

    /**
     * 检查是否有正在执行的任务
     * @returns 是否有正在执行的任务
     */
    hasAnyExecutingTasks() {
        return this._waitExecuting.length > 0
    }

    /**
     * 检查是否有待执行的任务
     * @returns 是否有待执行的任务
     */
    hasAnyTasks() {
        return this._tasks.length > 0
    }

    /**
     * 提交执行完成，通知所有等待中的任务
     */
    private submitExecuting() {
        this._waitExecuting.forEach(resolver => resolver.resolve())
        this._waitExecuting.length = 0
    }

    /**
     * 等待所有执行中的任务完成
     * @returns Promise，在所有任务完成时解析
     */
    async waitExecutingTasks() {
        if (!this.hasAnyTasks()) {
            return Promise.resolve()
        }

        const resolver = Promise.withResolvers<void>()
        this._waitExecuting.push(resolver)
        return resolver.promise
    }

    /**
     * 等待指定毫秒数，可被中止
     * @param ms 等待的毫秒数，默认为0
     * @returns Promise，在等待时间结束或被中止时解析
     */
    async wait(ms: number = 0) {
        return new Promise<void>((resolve) => {
            if (this.abortController.signal.aborted) {
                resolve()
                return
            }

            const timeout = setTimeout(() => {
                if (!this.abortController.signal.aborted) {
                    resolve()
                }
            }, ms)

            const abortHandler = () => {
                clearTimeout(timeout)
                resolve()
            }

            this.abortController.signal.addEventListener('abort', abortHandler)

            // 确保在Promise完成时清理
            Promise.resolve().then(() => {
                this.abortController.signal.removeEventListener('abort', abortHandler)
            })
        })
    }

    private _tasks: MeisterhauAITask[] = []

    /**
     * 当 force 为 true 时，无论当前是否已有任务正在执行，都将执行该任务
     * 否则，只有当当前没有任务正在执行时，才会执行该任务
     * @param task
     * @param force
     */
        /**
         * 执行AI任务
         * @param task 要执行的AI任务
         * @param force 是否强制执行，忽略当前是否有任务正在执行
         */
        executeTask(task: MeisterhauAITask, force=false) {
            if (force || !this.hasAnyExecutingTasks()) {
                this._tasks.push(task)
            }
        }

    private async _executeTasks(appendToTask: MeisterhauAITask) {
        // 在执行Task前再次检查是否已停止
        if (!this.abortController.signal.aborted) {
            for (const task of this._tasks) {
                await task(this)
            }

            if (appendToTask) {
                await appendToTask(this)
            }

            this.submitExecuting()
        }

        this._tasks.length = 0
    }

        /** AI tick更新方法 */
        async tick() {
            if (this._fsm && !this.abortController.signal.aborted) {
                const { value, done } = await this._fsm.next()
                if (done || this.abortController.signal.aborted) {
                    this.aiTicker?.stop()
                    this._fsm = undefined
                    return
                }

                await this._executeTasks(value)
            }
        }

        /** AI启动时调用 */
        onStart(): void {}
        /** AI更新时调用 */
        onUpdate(breakVal: (val?: any) => void): void {}
        /** AI停止时调用 */
        onStop(breakVal?: any): void {}

    private aiTicker?: MeisterhauAITicker

        /** 创建AI循环，在每次tick时执行表达式 */
        loop<T=any>(expr: (value: (val?: T) => void) => T | Promise<T>): T | Promise<T> {
            const context: LoopContext = {
                breakValue: undefined,
                stopFlag: false,
            }
            const value = (val: T) => {
                context.stopFlag = true
                context.breakValue = val
            }

            const resolvers = Promise.withResolvers()
            const aiTicker = new MeisterhauAITicker(
                context,
                expr,
                resolvers,
                value
            )

            this.status.componentManager.attachComponent(aiTicker)
            this.aiTicker = aiTicker

            return resolvers.promise as Promise<T>
        }

        /** 设置AI策略 */
        setStrategy(strategy: string) {
            this.strategy = strategy
            const fsm = this.getStrategy(strategy)
            if (!fsm) {
                return
            }

            return (this._fsm = fsm)
        }

    async _start(cleanStart=false) {
        // 重置abortController
        this.abortController.abort()
        Object.assign(this.abortController, new SimpleAbortController())

        if (cleanStart) {
            this?.onStart?.()
        }

        const v = await this.loop(async breakVal => {
            await this.tick()
            this?.onUpdate?.(breakVal)
        })

        if (cleanStart) {
            this.onStop?.(v)
        }
    }

        /** 启动AI */
        start() {
            this._start(true)
        }

        /** 停止AI */
        stop(returnVal?: any) {
            this.abortController.abort()
            this.aiTicker?.stop()
            this._fsm?.return?.(returnVal)
            this.onStop?.(returnVal)
            this._fsm = undefined
        }

        /** 等待指定tick数 */
        waitTick(ticks: number=1) {
            return new Promise<void>((resolve) => {
                let count = 0
                const onTick = () => {
                    if (this.abortController.signal.aborted) {
                        resolve()
                        return
                    }
                    count++
                    if (count >= ticks) {
                        resolve()
                    }
                }
                this.status.componentManager.beforeTick(onTick)
            })
        }

        /** 获取AI是否已停止 */
        get stopped() {
            return this.abortController.signal.aborted
        }

        /** 重启AI，可选择新策略 */
        async restart(strategy: string = 'default') {
            this.stop()
            await this.waitTick()
            // 重置abortController
            this.abortController.abort()
            Object.assign(this.abortController, new SimpleAbortController())

            if (this.setStrategy(strategy)) {
                this._start()
                return true
            }

            return false
        }

        /** 根据权重随机选择动作 */
        randomActions(...conf: [number, MeisterhauAITask][]) {
            const sum = conf.reduce((a, [ b ]) => a + Number(b), 0)
            const rands = conf.map(([ v ]) => Number(v) / sum)

            let rand = Math.random()
            let index = 0

            for (const reduce of rands) {
                rand -= reduce
                if (rand < 0) {
                    const [ _, task ] = conf[index]
                    return task
                }

                index++
            }

            return conf[0][1]
        }
}

const ais: Record<string, AiRegistration> = {}
const aiRunning = new Map<string, MeisterhauAI>()

/** AI注册信息接口 */
export interface AiRegistration {
    type: string
    ai: ConstructorOf<MeisterhauAI>
    tricks: TrickModule
    components?: Component[]
    setup?(ai: MeisterhauAI, entity: Entity): void
}

/** AI管理器命名空间 */
export namespace ai {
    /** 注册AI类型 */
    export function register(registration: AiRegistration) {
        ais[registration.type] = registration
    }

    /** 获取AI注册信息 */
    export function getRegistration(type: string) {
        return ais[type]
    }

    /** 获取实体的AI实例 */
    export function getAI(en: Entity): MeisterhauAI | undefined {
        return aiRunning.get(en.uniqueId)
    }

    /** 检查实体是否已注册AI */
    export function isRegistered(en: Entity) {
        return en.type in ais
    }
}

/** AI标识组件 */
export class IsAI extends CustomComponent {}
const isAI = new IsAI()

function setupAIEntity(en?: Entity | null) {
    if (!en || !ais[en.type] || aiRunning.has(en.uniqueId)) {
        return
    }

    const { ai: ctor, components, setup } = ais[en.type]
    if (ctor) {
        const ai = Reflect.construct(ctor, [ Optional.some(en) ])
        aiRunning.set(en.uniqueId, ai)
        ai.start()

        if (components) {
            Status.getComponentManager(en.uniqueId).use(comps => {
                comps.attachComponent(isAI, ...components)
            })
        }

        setup?.(ai, en)
    }
}

export async function listenEntitiyWithAi() {
    await serverStarted()
    setInterval(() => {
        mc.getAllEntities().forEach(setupAIEntity)
    }, 5000)
}
