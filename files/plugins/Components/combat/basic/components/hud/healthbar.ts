import { PublicComponent, Fields } from "../../core/config"
import { BossbarComponent, BossbarComponentParams } from "./bossbar"

@PublicComponent('healthbar')
@Fields([ 'title', 'color', 'percent' ], [ 'id' ])
export class HealthBar extends BossbarComponent {
    constructor(
        title = '',
        color = 3,
        percent = 100,
        show = false,
    ) {
        super(title, color, percent, show)
    }

    static create({ title, color, percent, show }: BossbarComponentParams = {}): BossbarComponent {
        return new HealthBar(title, color, percent, show)
    }
}