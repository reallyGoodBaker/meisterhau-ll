import { TargetLock } from "@combat/basic/components/core/target-lock"
import { Actor, InputSimulator } from "../inputSimulator"
import { Optional } from "@utils/optional"
import { Status } from "../status"
import { actorSelector } from "@combat/basic"

export class AiActions extends InputSimulator {

    setTarget(target: Actor) {
        this.actor.use(actor => {
            const targetLock = new TargetLock(this.actor, Optional.some(target))
            const components = Status.get(actor.uniqueId)?.componentManager
            components?.attachComponent(targetLock)
        })
    }

    removeTarget() {
        this.actor.use(actor => Status.get(actor.uniqueId)?.componentManager?.detachComponent(TargetLock))
    }

    lookAtNearest(radius = 10, family: string[] = [ 'mob' ]) {
        this.actor.use(actor => {
            const selector = actorSelector(actor)
            const typeFamiliy = family.map(t => `family=${t}`).join(",")
            mc.runcmdEx(`execute at ${selector} as ${selector} run tp @s ~~~ facing @e[c=1,r=${radius}${typeFamiliy ? `,${typeFamiliy}` : ''}]`)
        })
    }

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

    triggerDefinedEvent(event: string) {
        this.actor.use(actor => mc.runcmdEx(`event entity ${actorSelector(actor)} ${event}`))
    }

}