import { BaseComponent, ComponentManager } from "../core/component"
import { PublicComponent, Fields } from "../core/config"
import { HardmodeComponent } from "./hardmode"

@PublicComponent('damage-modifier')
@Fields([ 'modifier' ])
export class DamageModifier extends BaseComponent {
    static defaultModifier = 0.2
    static defaultModifierOpt = new DamageModifier(DamageModifier.defaultModifier)
    static create({ modifier }: { modifier: number }) {
        return new DamageModifier(modifier)
    }

    #modifier = DamageModifier.defaultModifier

    get modifier() {
        return this.#modifier
    }

    onAttach(manager: ComponentManager): boolean | void | Promise<boolean | void> {
        const hardmode = manager.getComponent(HardmodeComponent)
        if (hardmode.isEmpty()) {
            return
        }

        this.#modifier = HardmodeComponent.damageModifier
    }

    constructor(
        modifier = DamageModifier.defaultModifier
    ) {
        super()
        this.#modifier = modifier
    }
}