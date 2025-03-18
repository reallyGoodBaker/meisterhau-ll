import { Actor, InputSimulator } from '@core/inputSimulator'
import { Status } from '@core/status'
import { serverStarted } from '@utils/command'
import { input } from 'scripts-rpc/func/input'

export interface MeisterhauAIState {
    (ai: MeisterhauAI): Promise<void>
}

export enum MeisterhauFSMState {
    UNINIT,
    RUNNING,
    PAUSED,
    STOPPED,
}

export abstract class MeisterhauAI {
    readonly inputSimulator = new InputSimulator()
    readonly status: Status
    readonly uniqueId: string

    constructor(
        readonly actor: Actor,
    ) {
        this.status = Status.get(this.actor.uniqueId)
        this.uniqueId = this.actor.uniqueId
    }

    define: () => AsyncGenerator<MeisterhauAIState, void, unknown> = Function.prototype as any

    private _fsm?: AsyncGenerator<MeisterhauAIState, void, unknown>

    async initialize() {
        this._fsm = this.define?.()
    }

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

    abstract run(): void
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
        ai.initialize()
        ai.run()
        aiRunning.set(en.uniqueId, ai)
    }
}

export async function listenEntitiyWithAi() {
    await serverStarted()
    setInterval(() => {
        mc.getAllEntities().forEach(setupAIEntity)
    }, 10000)
}