import { BaseComponent, ComponentManager } from "../core/component"
import { PublicComponent } from "../core/config"
import { DamageModifier } from "./damage-modifier"

@PublicComponent('hardmode')
export class HardmodeComponent extends BaseComponent {
    static readonly damageModifier = 0.6

    static create() {
        return new HardmodeComponent()
    }

    private shouldRemoveDamageModifier = false

    onAttach(manager: ComponentManager): boolean | void | Promise<boolean | void> {
        if (manager.getComponent(DamageModifier).isEmpty()) {
            this.shouldRemoveDamageModifier = true
            manager.attachComponent(new DamageModifier(HardmodeComponent.damageModifier))
        }
    }

    onDetach(manager: ComponentManager): void | Promise<void> {
        if (this.shouldRemoveDamageModifier) {
            manager.detachComponent(DamageModifier)
        }
    }

}