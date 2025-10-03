import { TargetLock } from "@combat/basic/components/core/target-lock"
import { Actor, InputSimulator } from "../inputSimulator"
import { Optional } from "@utils/optional"
import { Status } from "../status"
import { actorSelector } from "@combat/basic"

export class AiActions extends InputSimulator {

    setTarget(target: Actor) {
        const targetLock = new TargetLock(this.actor.uniqueId, Optional.some(target))
        const components = Status.get(this.actor.uniqueId).componentManager
        components.attachComponent(targetLock)
    }

    lookAtNearest(radius = 10, family: string[] = [ 'mob' ]) {
        const selector = actorSelector(this.actor)
        const typeFamiliy = family.map(t => `family=${t}`).join(",")
        mc.runcmdEx(`execute at ${selector} as ${selector} run tp @s ~~~ facing @e[c=1,r=${radius}${typeFamiliy ? `,${typeFamiliy}` : ''}]`)
    }


}