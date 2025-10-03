import { input } from "scripts-rpc/func/input"
import { es } from "./event"

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

function wait(timeout: number) {
    const resolvers = Promise.withResolvers<void>()
    setTimeout(resolvers.resolve, timeout)
    return resolvers.promise
}

export class InputSimulator {
    constructor(
        protected actor: Actor
    ) {}

    async jump(timeout=300) {
        input.performPress(this.actor.uniqueId, 'jump')
        inputSimulator.jump(this.actor)
        await wait(timeout)
        input.performRelease(this.actor.uniqueId, 'jump')
    }

    sneak() {
        input.performPress(this.actor.uniqueId, 'sneak')
        inputSimulator.sneak(this.actor)
    }

    releaseSneak() {
        input.performRelease(this.actor.uniqueId,'sneak')
        inputSimulator.releaseSneak(this.actor)
    }

    useItem(item?: Item) {
        inputSimulator.useItem(this.actor, item)
    }

    changeSprinting(isSprinting=true) {
        inputSimulator.changeSprinting(this.actor, isSprinting)
    }

    attack() {
        inputSimulator.attack(this.actor)
    }

    feint() {
        inputSimulator.feint(this.actor)
    }

    dodge() {
        inputSimulator.dodge(this.actor)
    }
}