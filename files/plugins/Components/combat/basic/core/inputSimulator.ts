import { es } from "./event"

export type Actor = Player | Entity
export class InputSimulator {
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