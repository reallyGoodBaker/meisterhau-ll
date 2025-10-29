import { CustomComponent } from "@combat/basic/core/component"
import { Actor, ActorHelper } from "@utils/actor"
import { TargetLock } from "../core/target-lock"
import { r, rawtext } from "@utils/rawtext"

/** 攻击方向本地化映射 */
const lang: Record<AttackDirection, string> = {
    left: '左侧',
    right: '右侧',
    middle: '刺击',
    vertical: '上侧',
}

/** 伤害显示组件 - 显示伤害信息 */
export class HurtDisplay extends CustomComponent {
    /** 通知伤害事件 */
    static notifyHurt(instigator: Actor, victim: Actor, damageOpt: Required<DamageOption>) {
        ActorHelper.getComponent(instigator, HurtDisplay).use(display => display.onDamage(instigator, victim, damageOpt))
        ActorHelper.getComponent(victim, HurtDisplay).use(display => display.onHurt(instigator, victim, damageOpt))
    }

    /** 处理受到伤害事件 */
    onHurt(instigator: Actor, victim: Actor, damageOpt: Required<DamageOption>) {
        if (!ActorHelper.isPlayer(victim)) {
            return
        }

        const targetLock = this.getManager().getComponent(TargetLock)
        if (targetLock.isEmpty()) {
            return
        }

        const self = victim as Player
        const damage = targetLock.unwrap().targetIsActor ? damageOpt.damage * 5 : damageOpt.damage
        self.sendText(rawtext`受到来自 ${r.t(instigator.name)} 的 ${lang[damageOpt.direction]} §c${damage.toFixed(1)}§r 点伤害`, 9)
    }

    /** 处理造成伤害事件 */
    onDamage(instigator: Actor, victim: Actor, damageOpt: Required<DamageOption>) {
        if (!ActorHelper.isPlayer(instigator)) {
            return
        }

        const targetLock = this.getManager().getComponent(TargetLock)
        if (targetLock.isEmpty()) {
            return
        }

        const self = instigator as Player
        const damage = targetLock.unwrap().targetIsActor ? damageOpt.damage * 5 : damageOpt.damage
        self.sendText(rawtext`对 ${r.t(victim.name)} 造成了 ${lang[damageOpt.direction]} §a${damage.toFixed(1)}§r 点伤害`, 9)
    }
}
