import { Actor } from "@combat/basic/core/inputSimulator"

export class ActorHelper {

    static toEntity(actor: Actor): Entity {
        // @ts-ignore
        if (actor.xuid) {
            return mc.getEntity(actor.uniqueId)
        }

        return actor as Entity
    }

    static toPlayer(actor: Actor): Player | undefined {
        // @ts-ignore
        if (actor.xuid) {
            return actor as Player
        }

        // @ts-ignore
        if (actor.isPlayer()) {
            // @ts-ignore
            return actor.toPlayer()
        }
    }

}