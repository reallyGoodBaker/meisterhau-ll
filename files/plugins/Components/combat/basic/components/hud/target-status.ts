import { BaseComponent, ComponentManager } from "../../core/component"
import { Optional } from "../../core/optional"
import { Status } from "../../core/status"
import { Stamina } from "../stamina"
import { TargetLock } from "../target-lock"
import { HealthBar } from "./healthbar"
import { StaminaBar } from "./staminabar"

export class TargetStatus extends BaseComponent {
    healthbar: Optional<HealthBar> = Optional.none()
    staminabar: Optional<StaminaBar> = Optional.none()
    targetLock: Optional<TargetLock> = Optional.none()

    async onAttach(manager: ComponentManager): Promise<boolean | void> {
        this.healthbar = await manager.getOrCreate(HealthBar)
        this.staminabar = await manager.getOrCreate(StaminaBar)
    }

    onDetach(manager: ComponentManager): void | Promise<void> {
        this.healthbar.use(c => c.detach(manager))
        this.staminabar.use(c => c.detach(manager))
    }

    onTick(): void {
        if (this.targetLock.isEmpty()) {
            this.healthbar.use(c => c.show = false)
            this.staminabar.use(c => c.show = false)
            return
        }

        const targetLock = this.targetLock.unwrap()
        const { target: optTarget } = targetLock

        if (optTarget.isEmpty()) {
            return
        }

        const target = optTarget.unwrap()
        this.healthbar.use(c => {
            c.show = true
            c.title = target.name
            c.percent = target.health / target.maxHealth * 100
        })

        if ('xuid' in target) {
            this.staminabar.use(staminabar => {
                Status.get(target.xuid)
                    .componentManager
                    .getComponent(Stamina)
                    .use(targetStamina => {
                        staminabar.show = true
                        staminabar.percent = targetStamina.stamina / targetStamina.maxStamina * 100
                    })
            })
        }
    }
}