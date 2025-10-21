import { CustomComponent } from "@combat/basic/core/component"
import { Tick } from "../tick"
import { yawToVec2 } from "@utils/math"
import { vec2 } from "@combat/basic/generic/vec"
import { Delegate } from "@utils/events"
import { Actor } from "@utils/actor"

/** AI视觉配置接口 */
export interface AiVisionConfig {
    /** 视野角度（弧度） */
    fov: number
    /** 视野范围 */
    range: number
    /** 检测间隔（tick数） */
    interval: number
}

/** AI视觉组件 - 管理AI的视野检测功能 */
export class AiVision extends CustomComponent {

    /**
     * 获取视野范围内的角色
     * @param config 视觉配置
     * @param actor 源角色
     * @returns 视野范围内的角色数组
     */
    static getActorsInSight(config: AiVisionConfig, actor: Actor): Actor[] {
        const { fov, range } = config
        const maybeSeenActors = mc.getEntities(actor.pos, range)

        return maybeSeenActors.filter(maybeSeenActor => {
            const direction = yawToVec2(actor.direction.yaw)
            const actorOffset = vec2(actor.pos.x, actor.pos.y, maybeSeenActor.pos.x, maybeSeenActor.pos.y)

            // 使用点积计算角色是否在视野范围内
            return (direction.x * actorOffset.dx + direction.y * actorOffset.dy) / actorOffset.m > Math.cos(fov / 2)
        })
    }

    /** 组件附加时间 */
    readonly #attachTime = Tick.tick

    /**
     * 构造函数
     * @param config AI视觉配置
     */
    constructor(readonly config: AiVisionConfig) {
        super()

        this.allowTick = true
    }

    /** 当角色进入视野时触发的事件 */
    readonly onSeen = new Delegate<[Actor]>()
    /** 当角色离开视野时触发的事件 */
    readonly onUnseen = new Delegate<[Actor]>()

    /** 当前视野中可见的角色集合 */
    readonly seenActors = new Set<Actor>()

    /** 每tick更新视野检测 */
    onTick(): void {
        // 按配置间隔进行视野检测
        if ((Tick.tick - this.#attachTime) % this.config.interval === 0) {
            this.getActor().use(actor => {
                // 获取当前视野中的角色
                const actorsInSight = new Set(AiVision.getActorsInSight(this.config, actor))
                // 计算离开视野的角色
                const unseenActors = this.seenActors.difference(actorsInSight)
                // 计算进入视野的角色
                const seenActors = actorsInSight.difference(this.seenActors)

                // 触发离开视野事件
                unseenActors.forEach(actor => this.onUnseen.call(actor))
                // 触发进入视野事件
                seenActors.forEach(actor => this.onSeen.call(actor))
            })
        }
    }
}
