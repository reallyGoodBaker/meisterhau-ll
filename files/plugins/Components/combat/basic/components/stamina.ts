import { CustomComponent, ComponentManager } from "../core/component"
import { Fields, PublicComponent } from "../core/config"
import { Optional } from "../core/optional"
import { constrictCalc, minmax } from "../utils/math"
import { Timer } from "./timer"

@PublicComponent('stamina')
@Fields([ 'exhausted', 'stamina', 'maxStamina', 'restorePerTick', 'restoreCooldown' ])
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
        public restorePerTick = 1,
        public restoreCooldown = 40,
    ) {
        super()
        this.prevStamina = this.stamina
    }

    onTick(manager: ComponentManager): void {
        if (this.prevStamina > this.stamina) {
            let cooldown: Timer

            if (this.cooldown.isEmpty()) {
                cooldown = new Timer(this.restoreCooldown)
                manager.attachComponent(cooldown)
                this.cooldown = Optional.some(cooldown)
                this.prevStamina = this.stamina
                return
            }

            cooldown = this.cooldown.unwrap()
            cooldown.rest = cooldown.duration
            this.prevStamina = this.stamina
            return
        }

        if (this.cooldown.isEmpty() || this.cooldown.unwrap().done) {
            constrictCalc(0, this.maxStamina, () => this.stamina += this.restorePerTick)
        }
    }

}