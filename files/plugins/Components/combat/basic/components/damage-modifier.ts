import { CustomComponent } from "../core/component"
import { PublicComponent, Fields } from "../core/config"

@PublicComponent('damage-modifier')
@Fields([ 'modifier' ])
export class DamageModifier extends CustomComponent {
    static defaultModifier = 0.2
    static defaultModifierOpt = new DamageModifier(DamageModifier.defaultModifier)
    static create({ modifier }: { modifier: number }) {
        return new DamageModifier(modifier)
    }

    constructor(
        public modifier = DamageModifier.defaultModifier
    ) {
        super()
    }
}