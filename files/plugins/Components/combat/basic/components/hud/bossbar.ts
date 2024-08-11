import { BaseComponent, ComponentManager } from "../../core/component"
import { PublicComponent, Fields } from "../../core/config"
import { Optional } from "../../core/optional"

export interface BossbarComponentParams {
    title?: string
    color?: number
    percent?: number
    show?: boolean
}

@PublicComponent('bossbar')
@Fields([ 'title', 'color', 'percent', 'show' ], [ 'id' ])
export class BossbarComponent extends BaseComponent {

    static id = 0
    static create({ title, color, percent, show }: BossbarComponentParams = {}) {
        return new BossbarComponent(title, color, percent, show)
    }

    readonly id = BossbarComponent.id++
    private prevPercent = 0
    private plOpt?: Optional<Player>
    private showing = false

    constructor(
        public title = 'bossbar',
        public color = 2,
        public percent = 50,
        public show = false,
    ) {
        super()
    }

    onDetach(): void {
        this.plOpt?.use(pl => {
            pl.removeBossBar(this.id)
        })
    }

    setBossbar = (p: any) => {
        p.setBossBar(this.id, this.title, this.percent, this.color)
        this.showing = true
    }

    onTick(_: ComponentManager, pl: Optional<Player>): void {
        if (this.prevPercent === this.percent) {
            return
        }

        if (!this.show) {
            if (this.showing) {
                this.showing = false
                pl.use(pl => pl.removeBossBar(this.id))
            }
            return
        }

        this.plOpt = pl
        this.prevPercent = this.percent
        pl.use(this.setBossbar)
    }

}