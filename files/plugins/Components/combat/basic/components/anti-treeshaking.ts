import { HardmodeComponent } from "./hardmode"
import { HealthModifier } from "./health-modifier"
import { HudComponent } from "./hud/hud"

export function antiTreeshaking() {
    return [
        HudComponent,
        HealthModifier,
        HardmodeComponent,
    ]
}