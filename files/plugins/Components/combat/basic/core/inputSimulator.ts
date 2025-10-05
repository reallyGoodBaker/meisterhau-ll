import { input } from "scripts-rpc/func/input"
import { es } from "./event"
import { MeisterhauAI } from "./ai/core"
import { Optional } from "@utils/optional"

export type Actor = Player | Entity
class GlobalInputSimulator {
    simulate(
        input: keyof InputableTransitionMap,
        actor: Actor,
        ...extraArgs: any[]
    ) {
        extraArgs.unshift(actor)
        es.put(input, [ actor, Function.prototype, extraArgs ])
    }

    jump(actor: Actor) {
        this.simulate('onJump', actor)
    }

    sneak(actor: Actor, isSneaking=true) {
        this.simulate('onSneak', actor, isSneaking)
    }

    releaseSneak(actor: Actor, isSneaking=false) {
        this.simulate('onReleaseSneak', actor, isSneaking)
    }

    useItem(actor: Actor, item?: Item) {
        this.simulate('onUseItem', actor, item)
    }

    changeSprinting(actor: Actor, isSprinting=true) {
        this.simulate('onChangeSprinting', actor, isSprinting)
    }

    attack(actor: Actor) {
        this.simulate('onAttack', actor)
    }

    feint(actor: Actor) {
        this.simulate('onFeint', actor)
    }

    dodge(actor: Actor) {
        this.simulate('onDodge', actor)
    }
}

export const inputSimulator = new GlobalInputSimulator()

function wait(timeout: number = 0) {
    const resolvers = Promise.withResolvers<void>()
    setTimeout(resolvers.resolve, timeout)
    return resolvers.promise
}

export class InputSimulator {
    readonly actor: Optional<Actor>

    constructor(
        protected ai: MeisterhauAI
    ) {
        this.actor = ai.actor
    }

    async jump(timeout=300) {
        if (this.actor.isEmpty()) {
            return
        }

        this.ai.executeTask(async () => {
            const actor = this.actor.unwrap()
            input.performPress(actor.uniqueId, 'jump')
            inputSimulator.jump(actor)
            await wait(timeout)
            input.performRelease(actor.uniqueId, 'jump')
        })
    }

    sneak() {
        if (this.actor.isEmpty()) {
            return
        }

        const actor = this.actor.unwrap()
        input.performPress(actor.uniqueId, 'sneak')
        inputSimulator.sneak(actor)
    }

    releaseSneak() {
        if (this.actor.isEmpty()) {
            return
        }

        const actor = this.actor.unwrap()
        input.performRelease(actor.uniqueId,'sneak')
        inputSimulator.releaseSneak(actor)
    }

    useItem(item?: Item) {
        if (this.actor.isEmpty()) {
            return
        }

        const actor = this.actor.unwrap()
        inputSimulator.useItem(actor, item)
    }

    changeSprinting(isSprinting=true) {
        if (this.actor.isEmpty()) {
            return
        }

        this.ai.executeTask(async () => {
            const actor = this.actor.unwrap()
            inputSimulator.changeSprinting(actor, isSprinting)
        })
    }

    attack() {
        if (this.actor.isEmpty()) {
            return
        }

        const actor = this.actor.unwrap()
        inputSimulator.attack(actor)
    }

    feint() {
        if (this.actor.isEmpty()) {
            return
        }

        const actor = this.actor.unwrap()
        inputSimulator.feint(actor)
    }

    dodge() {
        if (this.actor.isEmpty()) {
            return
        }

        const actor = this.actor.unwrap()
        inputSimulator.dodge(actor)
    }
}