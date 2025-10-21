import { ComponentManager } from "../core/component"
import { Scheduler } from "./scheduler"
import { RequireComponents } from '../core/component'
import { Timer } from "./timer"
import { Fields, PublicComponent } from "../core/config"
import { Optional } from '@utils/optional'

/** 生命值修正组件 - 随时间调整生命值 */
@PublicComponent('health-modifier')
@Fields([ 'remain' ], [ 'delta', 'duration' ])
export class HealthModifier extends RequireComponents([Scheduler, 20], Timer) {

    private scheduler: Scheduler
    private timer: Timer
    private deltaTick: number
    private atom: number = 0
    public remain: number

    constructor(
        public readonly delta: number,
        public readonly duration: number
    ) {
        super()
        this.remain = delta
        this.deltaTick = delta / duration * 20
        this.scheduler = this.getComponent(Scheduler)
        this.timer = this.getComponent(Timer)
        this.timer.rest = duration
    }

    /** 每tick更新生命值 */
    onTick(manager: ComponentManager, pl: Optional<Player>): void {
        if (!this.scheduler.update) {
            return
        }

        const player = pl.unwrap()
        if (this.timer.done) {
            player.setHealth(player.health + this.atom)
            manager.beforeTick(() => {
                this.scheduler.detach(manager)
                this.detach(manager)
            })
            return
        }

        this.remain += this.deltaTick
        if (this.deltaTick < 0) {
            if (this.atom <= -1) {
                this.atom += 1
                player.setHealth(player.health - 1)
            } else {
                this.atom += this.deltaTick
            }
        } else {
            if (this.atom >= 1) {
                this.atom -= 1
                player.setHealth(player.health + 1)
            } else {
                this.atom += this.deltaTick
            }
        }
    }

    /** 创建生命值修正组件 */
    static create({ delta, duration }: { delta: number, duration: number }) {
        return new HealthModifier(delta, duration)
    }
}
