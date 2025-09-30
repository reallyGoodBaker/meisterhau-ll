import { Actor, InputSimulator } from '@core/inputSimulator'
import { Status } from '@core/status'
import { serverStarted } from '@utils/command'
import { input } from 'scripts-rpc/func/input'
import { CustomComponent } from '../component'

export interface MeisterhauAIState {
    (ai: MeisterhauAI): Promise<void>
    (ai: MeisterhauAI): void
    (): Promise<void>
    (): void
}

export enum MeisterhauFSMState {
    UNINIT,
    RUNNING,
    PAUSED,
    STOPPED,
}

export interface EventTrigger<Ctx = any, V = any> {
    (value: V, context: Ctx): boolean
}

export interface AIEventTriggerContext {
    actor: Entity | Player
    status: Status
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
    }

    onTick() {
        if (this.ctx.stopFlag) {
            return this.resolvers.resolve(this.ctx.breakValue)
        }

        ;(this.loopExpr.call(undefined, this.breakLoop) as Promise<any>)
            ?.catch?.(this.reject)
    }

    reject(err: any) {
        this.ctx.stopFlag = true
        this.resolvers.reject(err)
    }
}

export type EventSignalReader<T = any> = (value?: T) => boolean
export type EventRemoveListener = () => void

export abstract class EventChannel<Ctx> {
    private _signals: Record<string, EventTrigger<Ctx>> = {}
    //@ts-ignore
    readonly signals: Record<string, boolean> = new Proxy(this._signals, {
        get: (target, prop) => {
            if (prop in target) {
                return this.trigger(prop as string)
            }
            return false
        },

        set() {
            return false
        }
    })

    abstract getContext(): Ctx

    addTrigger<C extends Ctx, V>(signal: string, trigger: EventTrigger<C, V>) {
        this._signals[signal] = trigger as EventTrigger<Ctx>
    }

    removeTrigger(signal: string) {
        delete this._signals[signal]
    }

    trigger(signal: string, value?: any) {
        const trigger = this._signals[signal]
        if (trigger) {
            return trigger(value, this.getContext())
        }
        return false
    }

    signal<T=any>(ev: string, trigger: EventTrigger<Ctx, T>): [
        EventSignalReader<T>, EventRemoveListener
    ] {
        this.addTrigger(ev, trigger)
        return [
            (v?: T) => this.trigger(ev, v),
            () => this.removeTrigger(ev),
        ]
    }
}

export abstract class MeisterhauAI extends EventChannel<AIEventTriggerContext> {
    readonly inputSimulator = new InputSimulator()
    readonly status: Status
    readonly uniqueId: string

    private readonly _fsms: Record<string, any> = {}

    constructor(
        readonly actor: Actor,
        public strategy: string = 'default',
    ) {
        super()
        this.status = Status.get(this.actor.uniqueId)
        this.uniqueId = this.actor.uniqueId

        this.setStrategy(strategy)
    }

    abstract getStrategy(strategy: string): AsyncGenerator<MeisterhauAIState, void, unknown>

    private _fsm?: AsyncGenerator<MeisterhauAIState, void, unknown>

    async wait(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    async tick() {
        if (this._fsm) {
            const { value } = await this._fsm.next()
            if (value) {
                await value(this)
            }
        }
    }

    async jump(timeout=300) {
        input.performPress(this.uniqueId, 'jump')
        this.inputSimulator.jump(this.actor)
        await this.wait(timeout)
        input.performRelease(this.uniqueId, 'jump')
    }

    sneak() {
        input.performPress(this.uniqueId, 'sneak')
        this.inputSimulator.sneak(this.actor)
    }

    releaseSneak() {
        input.performRelease(this.uniqueId,'sneak')
        this.inputSimulator.releaseSneak(this.actor)
    }

    useItem(item?: Item) {
        this.inputSimulator.useItem(this.actor, item)
    }

    changeSprinting(isSprinting=true) {
        this.inputSimulator.changeSprinting(this.actor, isSprinting)
    }

    attack() {
        this.inputSimulator.attack(this.actor)
    }

    feint() {
        this.inputSimulator.feint(this.actor)
    }

    dodge() {
        this.inputSimulator.dodge(this.actor)
    }

    onStart(): void {}
    onUpdate(breakVal: (val?: any) => void): void {}
    onStop(breakVal?: any): void {}
    
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

        return resolvers.promise as Promise<T>
    }

    setStrategy(strategy: string) {
        this.strategy = strategy
        this._fsm = this._fsms[strategy] || (this._fsms[strategy] = this.getStrategy(strategy))
    }

    async _start(cleanStart=false) {
        if (cleanStart) {
            this?.onStart?.()   
        }

        const v = await this.loop(async breakVal => {
            await this.tick()
            this?.onUpdate?.(breakVal)
        })

        if (cleanStart) {
            this?.onStop?.(v)
        }
    }

    start() {
        this._start(true)
    }

    waitTick(ticks: number=1) {
        return new Promise<void>(resolve => {
            let count = 0
            const onTick = () => {
                count++
                if (count >= ticks) {
                    resolve()
                }
            }
            this.status.componentManager.beforeTick(onTick)
        })
    }

    restart(strategy: string = 'default') {
        this?.onStop?.()
        this.setStrategy(strategy)
        this._start()
    }

    randomActions(conf: Record<number, MeisterhauAIState>) {
        const keys = Object.keys(conf)
        const sum = keys.reduce((a, b) => a + Number(b), 0)
        const rands = keys.map(v => Number(v) / sum)

        let rand = Math.random()

        for (const reduce of rands) {
            rand -= reduce
            if (rand < 0) {
                const index = keys[rands.indexOf(reduce)]
                return conf[index as any]
            }
        }

        return conf[0]
    }
}

const ais: Record<string, [ ConstructorOf<MeisterhauAI>, TrickModule ]> = {}
const aiRunning = new Map<string, MeisterhauAI>()

export namespace ai {
    export function register(type: string, ai: ConstructorOf<MeisterhauAI>, tricks: TrickModule) {
        ais[type] = [ ai, tricks ]
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

function setupAIEntity(en?: Entity | null) {
    if (!en || !ais[en.type] || aiRunning.has(en.uniqueId)) {
        return
    }

    const [ ctor ] = ais[en.type]
    if (ctor) {
        const ai = Reflect.construct(ctor, [ en ])
        aiRunning.set(en.uniqueId, ai)
        ai.start()
    }
}

export async function listenEntitiyWithAi() {
    await serverStarted()
    setInterval(() => {
        mc.getAllEntities().forEach(setupAIEntity)
    }, 5000)
}