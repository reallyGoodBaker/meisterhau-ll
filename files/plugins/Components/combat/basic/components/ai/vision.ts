import { CustomComponent } from "@combat/basic/core/component"
import { Tick } from "../tick"
import { yawToVec2 } from "@utils/math"
import { vec2 } from "@combat/basic/generic/vec"
import { Delegate } from "@utils/events"
import { Actor } from "@utils/actor"

export interface AiVisionConfig {
    fov: number
    range: number
    interval: number
}

export class AiVision extends CustomComponent {

    static getActorsInSight(config: AiVisionConfig, actor: Actor): Actor[] {
        const { fov, range } = config
        const maybeSeenActors = mc.getEntities(actor.pos, range)

        return maybeSeenActors.filter(maybeSeenActor => {
            const direction = yawToVec2(actor.direction.yaw)
            const actorOffset = vec2(actor.pos.x, actor.pos.y, maybeSeenActor.pos.x, maybeSeenActor.pos.y)

            // dot product
            return (direction.x * actorOffset.dx + direction.y * actorOffset.dy) / actorOffset.m > Math.cos(fov / 2)
        })
    }

    readonly #attachTime = Tick.tick

    constructor(readonly config: AiVisionConfig) {
        super()

        this.allowTick = true
    }

    readonly onSeen = new Delegate<[Actor]>()
    readonly onUnseen = new Delegate<[Actor]>()

    readonly seenActors = new Set<Actor>()

    onTick(): void {
        if ((Tick.tick - this.#attachTime) % this.config.interval === 0) {
            this.getActor().use(actor => {
                const actorsInSight = new Set(AiVision.getActorsInSight(this.config, actor))
                const unseenActors = this.seenActors.difference(actorsInSight)
                const seenActors = actorsInSight.difference(this.seenActors)

                unseenActors.forEach(actor => this.onUnseen.call(actor))
                seenActors.forEach(actor => this.onSeen.call(actor))
            })
        }
    }
}