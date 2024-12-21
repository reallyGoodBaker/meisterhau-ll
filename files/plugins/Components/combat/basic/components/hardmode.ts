import { CustomComponent } from "../core/component"
import { PublicComponent } from "../core/config"

@PublicComponent('hardmode')
export class HardmodeComponent extends CustomComponent {
    static readonly damageModifier = 0.6

    static create() {
        return new HardmodeComponent()
    }
}