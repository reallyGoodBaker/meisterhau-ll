import { CustomComponent } from "../core/component"
import { PublicComponent, Fields } from "../core/config"
import { HardmodeComponent } from "./hardmode"

@PublicComponent('damage-modifier')
@Fields([ 'modifier' ])
export class DamageModifier extends CustomComponent {
    static defaultModifier = 0.2
    static defaultModifierOpt = new DamageModifier(DamageModifier.defaultModifier)
    static create({ modifier }: { modifier: number }) {
        return new DamageModifier(modifier)
    }

    #modifier = DamageModifier.defaultModifier

    get modifier() {
        if (this.getManager().has(HardmodeComponent)) {
            return HardmodeComponent.damageModifier
        }

        return this.#modifier
    }

    constructor(
        modifier = DamageModifier.defaultModifier
    ) {
        super()
        this.#modifier = modifier
    }
}