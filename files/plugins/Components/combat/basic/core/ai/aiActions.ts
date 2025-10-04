import { TargetLock } from "@combat/basic/components/core/target-lock"
import { Actor, InputSimulator } from "../inputSimulator"
import { Optional } from "@utils/optional"
import { Status } from "../status"
import { actorSelector } from "@combat/basic"

export class AiActions extends InputSimulator {

    setTarget(target: Actor) {
        const targetLock = new TargetLock(Optional.some(this.actor), Optional.some(target))
        const components = Status.get(this.actor.uniqueId)?.componentManager
        components?.attachComponent(targetLock)
    }

    removeTarget() {
        Status.get(this.actor.uniqueId)?.componentManager?.detachComponent(TargetLock)
    }

    lookAtNearest(radius = 10, family: string[] = [ 'mob' ]) {
        const selector = actorSelector(this.actor)
        const typeFamiliy = family.map(t => `family=${t}`).join(",")
        mc.runcmdEx(`execute at ${selector} as ${selector} run tp @s ~~~ facing @e[c=1,r=${radius}${typeFamiliy ? `,${typeFamiliy}` : ''}]`)
    }

    setForwardActorAsTarget(length = 8) {
        const entity = this.actor.getEntityFromViewVector(length)
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

    triggerDefinedEvent(event: string) {
        mc.runcmdEx(`event entity ${actorSelector(this.actor)} ${event}`)
    }

}