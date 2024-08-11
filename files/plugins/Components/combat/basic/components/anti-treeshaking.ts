import { BossbarComponent } from "./hud/bossbar"
import { HealthBar } from "./hud/healthbar"
import { StaminaBar } from "./hud/staminabar"

export function antiTreeshaking() {
    return [
        BossbarComponent,
        HealthBar,
        StaminaBar,
    ]
}