import { TargetLock } from "@combat/basic/components/core/target-lock"
import { InputSimulator } from "../inputSimulator"
import { Optional } from "@utils/optional"
import { Status } from "../status"
import { actorSelector } from "@combat/basic"
import { Actor } from "@utils/actor"

/**
 * AI动作类 - 扩展输入模拟器，提供AI特定的动作功能
 * 包括目标设置、视线追踪、事件触发等
 */
export class AiActions extends InputSimulator {

    /**
     * 设置AI的目标
     * @param target 目标角色
     */
    setTarget(target: Actor) {
        this.actor.use(actor => {
            const targetLock = new TargetLock(this.actor, Optional.some(target))
            const components = Status.get(actor.uniqueId)?.componentManager
            components?.attachComponent(targetLock)
        })
    }

    /**
     * 移除AI的目标
     */
    removeTarget() {
        this.actor.use(actor => Status.get(actor.uniqueId)?.componentManager?.detachComponent(TargetLock))
    }

    /**
     * 看向最近的实体
     * @param radius 搜索半径，默认为10
     * @param family 实体类型数组，默认为['mob']
     */
    lookAtNearest(radius = 10, family: string[] = [ 'mob' ]) {
        this.actor.use(actor => {
            const selector = actorSelector(actor)
            const typeFamiliy = family.map(t => `family=${t}`).join(",")
            mc.runcmdEx(`execute at ${selector} as ${selector} run tp @s ~~~ facing @e[c=1,r=${radius}${typeFamiliy ? `,${typeFamiliy}` : ''}]`)
        })
    }

    /**
     * 将前方实体设置为目标
     * @param length 视线距离，默认为8
     * @returns 是否成功设置目标
     */
    setForwardActorAsTarget(length = 8) {
        if (this.actor.isEmpty()) {
            return false
        }

        const entity = this.actor.unwrap().getEntityFromViewVector(length)
        if (!entity) {
            return false
        }

        if (entity.isPlayer()) {
            const player = entity.toPlayer()
            if (player) {
                this.setTarget(player)
            }
        } else {
            this.setTarget(entity)
        }

        return true
    }

    /**
     * 触发预定义的事件
     * @param event 事件名称
     */
    triggerDefinedEvent(event: string) {
        this.actor.use(actor => mc.runcmdEx(`event entity ${actorSelector(actor)} ${event}`))
    }

}
