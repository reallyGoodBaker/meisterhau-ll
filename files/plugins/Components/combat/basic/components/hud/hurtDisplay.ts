import { CustomComponent } from "@combat/basic/core/component"
import { Actor, ActorHelper } from "@utils/actor"
import { TargetLock } from "../core/target-lock"
import { r, rawtext } from "@utils/rawtext"

const lang: Record<AttackDirection, string> = {
    left: '左侧',
    right: '右侧',
    middle: '刺击',
    vertical: '上侧',
}

export class HurtDisplay extends CustomComponent {
    static notifyHurt(instigator: Actor, victim: Actor, damageOpt: Required<DamageOption>) {
        ActorHelper.getComponent(instigator, HurtDisplay).use(display => display.onDamage(instigator, victim, damageOpt))
        ActorHelper.getComponent(victim, HurtDisplay).use(display => display.onHurt(instigator, victim, damageOpt))
    }

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