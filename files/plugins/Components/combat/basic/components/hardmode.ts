import { cmd, CommandPermission } from "@utils/command"
import { BaseComponent, ComponentManager } from "../core/component"
import { PublicComponent } from "../core/config"
import { DamageModifier } from "./damage-modifier"
import { Status } from "../core/status"
import { Timer } from "./timer"
import { Optional } from "@utils/optional"

@PublicComponent('hardmode')
export class HardmodeComponent extends BaseComponent {
    static readonly damageModifier = 0.6

    static create() {
        return new HardmodeComponent()
    }

    private shouldRemoveDamageModifier = false

    onAttach(manager: ComponentManager): boolean | void | Promise<boolean | void> {
        if (manager.getComponent(DamageModifier).isEmpty()) {
            this.shouldRemoveDamageModifier = true
            manager.attachComponent(new DamageModifier(HardmodeComponent.damageModifier))
        }
    }

    onDetach(manager: ComponentManager): void | Promise<void> {
        if (this.shouldRemoveDamageModifier) {
            manager.detachComponent(DamageModifier)
        }
    }

}

@PublicComponent('raidomode')
export class RaidomodComponent extends BaseComponent {
    static readonly damageModifier = 2

    static create() {
        return new RaidomodComponent()
    }

    private shouldRemoveDamageModifier = false
    private timer: Optional<Timer> = Optional.none()
    private stage = 0

    async onAttach(manager: ComponentManager) {
        if (manager.getComponent(DamageModifier).isEmpty()) {
            this.shouldRemoveDamageModifier = true
            manager.attachComponent(new DamageModifier(RaidomodComponent.damageModifier))
        }

        const [ timer ] = await manager.attachComponent(new Timer(100))
        this.timer = timer as Optional<Timer>
    }

    // onTick(manager: ComponentManager, en: Optional<Player>): void {
    //     const timer = this.timer.unwrap()

    //     if (timer.rest % 19 !== 0) {
    //         return
    //     }

    //     en.use(pl => {
    //         const status = Status.get(pl.uniqueId)

    //         if (timer.done) {
    //             timer.reset()
    //             this.stage++
    //         }

    //         const countdown = Math.floor(timer.rest / 20)
    //         if (this.stage === 0) {
    //             if (status.status === 'raido') {
    //                 pl.setTitle('你输了! 不要提前按下!')
    //                 manager.detachComponent(RaidomodComponent)
    //                 return
    //             }

    //             pl.setTitle(countdown + '', 2, 1)
    //             pl.setTitle(`准备进入居合模式 (倒计时结束按住蹲下)`, 3, 1)
    //         }

    //         if (this.stage === 1) {
    //             if (countdown <= 4 && status.status !== 'raido') {
    //                 pl.setTitle('你输了! 请及时按下居合模式按钮!')
    //                 manager.detachComponent(RaidomodComponent)
    //                 return
    //             }

    //             if (status.preInput === 'onUseItem') {
    //                 pl.setTitle('你输了! 不要提前按下攻击按钮!')
    //                 manager.detachComponent(RaidomodComponent)
    //                 return
    //             }

    //             pl.setTitle(countdown + '', 2, 1)
    //             pl.setTitle('准备决斗! (倒计时结束按下使用物品按键)', 3, 1)
    //         }

    //         if (this.stage === 3) {
    //             manager.detachComponent(RaidomodComponent)
    //         }
    //     })
    // }

    onDetach(manager: ComponentManager): void | Promise<void> {
        if (this.shouldRemoveDamageModifier) {
            manager.detachComponent(DamageModifier)
        }
    }

}

cmd('raidomode', '居合模式', CommandPermission.Everyone).setup(register => {
    register('<pl:player> enable', (cmd, ori, out, res) => {
        (res.pl as Player[]).forEach(pl => {
            Status.getOrCreate(pl.uniqueId).componentManager.attachComponent(new RaidomodComponent())
        })
    })

    register('<pl:player> disable', (cmd, ori, out, res) => {
        (res.pl as Player[]).forEach(pl => {
            Status.getOrCreate(pl.uniqueId).componentManager.detachComponent(RaidomodComponent)
        })
    })
})