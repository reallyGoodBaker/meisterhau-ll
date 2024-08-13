import { CustomComponent, ComponentManager } from "../core/component"
import { Fields, PublicComponent } from "../core/config"
import { Optional } from "@utils/optional"
import { constrictCalc, minmax } from "@utils/math"
import { Timer } from "./timer"

@PublicComponent('stamina')
@Fields([ 'stamina', 'maxStamina', 'restorePerTick', 'restoreCooldown' ])
export class Stamina extends CustomComponent {

    cooldown: Optional<Timer> = Optional.none()
    prevStamina: number

    get stamina() {
        return this.$stamina
    }

    set stamina(v) {
        this.$stamina = minmax(0, this.maxStamina, v)
    }

    constructor(
        public $stamina = 100,
        public maxStamina = 100,
        public restorePerTick = 1.6,
        public restoreCooldown = 20,
    ) {
        super()
        this.prevStamina = this.stamina
    }

    async resetRestore(manager: ComponentManager) {
        this.cooldown = await manager.getOrCreate(Timer, this.restoreCooldown)

        const cooldown = this.cooldown.unwrap()
        cooldown.rest = this.restoreCooldown
        this.prevStamina = this.stamina
    }

    setCooldown(cooldown: number) {
        if (this.cooldown.isEmpty()) {
            return
        }

        this.cooldown.unwrap().rest = cooldown
    }

    onTick(manager: ComponentManager): void {
        if (this.prevStamina > this.stamina) {
            this.resetRestore(manager)
            return
        }

        if (this.cooldown.isEmpty() || this.cooldown.unwrap().done) {
            this.stamina = constrictCalc(0, this.maxStamina, () => this.stamina + this.restorePerTick)
        }

        this.prevStamina = this.stamina
    }

}