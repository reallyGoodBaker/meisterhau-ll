import { Fields, PublicComponent } from "../../core/config"
import { BossbarComponent, BossbarComponentParams } from "./bossbar"

@PublicComponent('staminabar')
@Fields([ 'title', 'color', 'percent' ], [ 'id' ])
export class StaminaBar extends BossbarComponent {
    static create({ title, color, percent, show }: BossbarComponentParams = {}): BossbarComponent {
        return new StaminaBar(title, color, percent, show)
    }

    constructor(
        title = '',
        color = 7,
        percent = 100,
        show = false,
    ) {
        super(title, color, percent, show)
    }
}