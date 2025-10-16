import { Status } from '@core/status'
import { serverStarted } from '@utils/command'
import { Component, ComponentManager, CustomComponent } from '../component'
import { Optional } from '@utils/optional'
import { Actor } from '@utils/actor'

export interface MeisterhauAITask {
    (ai: MeisterhauAI): Promise<void>
    (ai: MeisterhauAI): void
    (): Promise<void>
    (): void
}

export class SimpleAbortController {
    private _aborted = false
    private _listeners: Array<() => void> = []

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

    hasAnyExecutingTasks() {
        return this._waitExecuting.length > 0
    }

    hasAnyTasks() {
        return this._tasks.length > 0
    }

    private submitExecuting() {
        this._waitExecuting.forEach(resolver => resolver.resolve())
        this._waitExecuting.length = 0
    }

    async waitExecutingTasks() {
        if (!this.hasAnyTasks()) {
            return Promise.resolve()
        }

        const resolver = Promise.withResolvers<void>()
        this._waitExecuting.push(resolver)
        return resolver.promise
    }

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

    onStart(): void {}
    onUpdate(breakVal: (val?: any) => void): void {}
    onStop(breakVal?: any): void {}

    private aiTicker?: MeisterhauAITicker
    
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

    start() {
        this._start(true)
    }

    stop(returnVal?: any) {
        this.abortController.abort()
        this.aiTicker?.stop()
        this._fsm?.return?.(returnVal)
        this.onStop?.(returnVal)
        this._fsm = undefined
    }

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

    get stopped() {
        return this.abortController.signal.aborted
    }

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

export interface AiRegistration {
    type: string
    ai: ConstructorOf<MeisterhauAI>
    tricks: TrickModule
    components?: Component[]
    setup?(ai: MeisterhauAI, entity: Entity): void
}

export namespace ai {
    export function register(registration: AiRegistration) {
        ais[registration.type] = registration
    }

    export function getRegistration(type: string) {
        return ais[type]
    }

    export function getAI(en: Entity): MeisterhauAI | undefined {
        return aiRunning.get(en.uniqueId)
    }

    export function isRegistered(en: Entity) {
        return en.type in ais
    }
}

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
