import { Component } from "@combat/basic/core/component"
import { Optional } from "./optional"
import { Status } from "@combat/basic/core/status"
import { Vector, VectorHelper } from "./math"

export type Actor = Player | Entity

export class ActorHelper {

    static toEntity(actor: Actor): Entity {
        // @ts-ignore
        if (actor.xuid) {
            // @ts-ignore
            return mc.getEntity(+actor.uniqueId)
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

    static getPlayer(info: string): Optional<Actor> {
        return Optional.some(mc.getPlayer(info))
    }

    static getEntity(info: string | number): Optional<Actor> {
        // @ts-ignore
        return Optional.some(mc.getEntity(+info))
    }

    private static players = new Set<string>()

    static isPlayer(actor: Actor): boolean {
        return this.players.has(actor.uniqueId)
    }

    static getActor(info: string | number): Optional<Actor> {
        return this.getPlayer(String(info)).match(
            () => {
                if (ActorHelper.players.has(String(info))) {
                    ActorHelper.players.delete(String(info))
                }
                return this.getEntity(info)
            },
            actor => {
                ActorHelper.players.add(String(info))
                return Optional.some(actor)
            }
        )
    }

    static getComponent<T extends Component>(actor: Actor, ctor: ConstructorOf<T>): Optional<T> {
        return Status.getComponentManager(actor.uniqueId).match(
            Optional.none(),
            manager => manager.getComponent(ctor)
        )
    }

    static pos(actor: Actor): Optional<Vector> {
        return Optional.some(actor?.pos)
    }

    static position(actor: Actor): Vector {
        return actor?.pos ?? VectorHelper.zero()
    }
}