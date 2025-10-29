import { HardmodeComponent } from "./hardmode"
import { HealthModifier } from "./health-modifier"
import { HudComponent } from "./hud/hud"
import { Match } from "./match"

/** 防止组件被tree-shaking移除 */
export function antiTreeshaking() {
    return [
        HudComponent,
        HealthModifier,
        HardmodeComponent,
        Match,
    ]
}
