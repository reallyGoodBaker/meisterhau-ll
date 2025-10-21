import { Component } from "@combat/basic/core/component"
import { Optional } from "./optional"
import { Status } from "@combat/basic/core/status"
import { Vector, VectorHelper } from "./math"

/** 演员类型 - 可以是玩家或实体 */
export type Actor = Player | Entity

/** 演员助手类 - 提供对演员（玩家/实体）的各种操作 */
export class ActorHelper {

    /**
     * 将演员转换为实体
     * @param actor - 演员对象
     * @returns
     */
    static toEntity(actor: Actor): Entity {
        // @ts-ignore
        if (actor.xuid) {
            // @ts-ignore
            return mc.getEntity(+actor.uniqueId)
        }

        return actor as Entity
    }

    /**
     * 将演员转换为玩家
     * @param actor - 演员对象
     * @returns
     */
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

    /**
     * 根据信息获取玩家
     * @param info - 玩家信息（名称或标识符）
     * @returns 
     */
    static getPlayer(info: string): Optional<Actor> {
        return Optional.some(mc.getPlayer(info))
    }

    /**
     * 根据信息获取实体
     * @param info - 实体信息（标识符）
     * @returns
     */
    static getEntity(info: string | number): Optional<Actor> {
        // @ts-ignore
        return Optional.some(mc.getEntity(+info))
    }

    /** 玩家标识符集合 */
    private static players = new Set<string>()

    /**
     * 检查演员是否为玩家
     * @param actor - 演员对象
     * @returns
     */
    static isPlayer(actor: Actor): boolean {
        return this.players.has(actor.uniqueId)
    }

    /**
     * 根据信息获取演员（优先尝试获取玩家）
     * @param info - 演员信息
     * @returns
     */
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

    /**
     * 获取演员的组件
     * @param actor - 演员对象
     * @param ctor - 组件构造函数
     * @returns
     */
    static getComponent<T extends Component>(actor: Actor, ctor: ConstructorOf<T>): Optional<T> {
        return Status.getComponentManager(actor.uniqueId).match(
            Optional.none(),
            manager => manager.getComponent(ctor)
        )
    }

    /**
     * 获取演员位置（Optional包装）
     * @param actor - 演员对象
     * @returns
     */
    static pos(actor: Actor): Optional<Vector> {
        return Optional.some(actor?.pos)
    }

    /**
     * 获取演员位置（直接返回，如果不存在则返回零向量）
     * @param actor - 演员对象
     * @returns
     */
    static position(actor: Actor): Vector {
        return actor?.pos ?? VectorHelper.zero()
    }
}
