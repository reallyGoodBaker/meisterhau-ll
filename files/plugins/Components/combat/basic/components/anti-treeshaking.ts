import { HardmodeComponent } from "./hardmode"
import { HealthModifier } from "./health-modifier"
import { HudComponent } from "./hud/hud"
import { Match } from "./match"

export function antiTreeshaking() {
    return [
        HudComponent,
        HealthModifier,
        HardmodeComponent,
        Match,
    ]
}