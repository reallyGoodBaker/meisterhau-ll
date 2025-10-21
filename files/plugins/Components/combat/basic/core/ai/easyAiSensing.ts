import { TargetLock } from "@combat/basic/components/core/target-lock"
import { MeisterhauAI } from "./core"
import { Optional } from "@utils/optional"
import { Status } from "../status"
import { AiHearing } from "@combat/basic/components/ai/hearing"
import { AiVision } from "@combat/basic/components/ai/vision"
import { Actor } from "@utils/actor"

/**
 * 简易AI感知类 - 提供AI目标感知和状态检测功能
 */
export class EasyAISensing {
    /**
     * 构造函数
     * @param ai AI实例
     */
    constructor(
        public readonly ai: MeisterhauAI,
    ) {}

    /**
     * 获取组件管理器
     * @returns 组件管理器实例
     */
    get components() {
        return this.ai.status.componentManager
    }

    /**
     * 检查是否有有效目标
     * @returns 是否有有效目标
     */
    hasTarget(): boolean {
        const target = this.components.getComponent(TargetLock)
        if (target.isEmpty()) {
            return false
        }

        return target.match(
            false,
            targetLock => targetLock.target.match(
                false,
                target => target.health > 0
            )
        )
    }

    /**
     * 获取当前目标
     * @returns 目标角色的Optional对象
     */
    getTarget(): Optional<Actor> {
        return this.components.getComponent(TargetLock).match(
            Optional.none(),
            targetLock => targetLock.target,
        )
    }

    /**
     * 检查目标是否在指定范围内
     * @param range 检测范围
     * @returns 目标是否在范围内
     */
    targetInRange(range: number): boolean {
        return this.getTarget().match(
            false,
            actor => this.ai.actor.match(
                false,
                aiActor => actor.distanceTo(aiActor) <= range
            ),
        )
    }

    /**
     * 获取目标的状态
     * @returns 目标状态的Optional对象
     */
    targetStatus(): Optional<Status> {
        return this.getTarget().match(
            Optional.none(),
            actor => Optional.some(Status.getOrCreate(actor.uniqueId)),
        )
    }

    /**
     * 检查目标是否输入了指定类型的输入
     * @param inputTypes 输入类型数组
     * @returns 目标是否输入了指定类型
     */
    hasTargetInputed(...inputTypes: (keyof InputableTransitionMap)[]): boolean {
        return this.targetStatus().match(
            false,
            status => {
                if (!status.preInput) {
                    return false   
                }

                return inputTypes.includes(status.preInput as any)
            },
        )
    }

    /**
     * 检查是否能听到目标
     * @param hearingCtor 听觉组件构造函数，默认为AiHearing
     * @returns 是否能听到目标
     */
    canHearTarget(hearingCtor: ConstructorOf<AiHearing> = AiHearing): boolean {
        return this.getTarget().match(
            false,
            actor => this.components.getComponent(hearingCtor).match(
                false,
                hearing => hearing.heardActors.has(actor)
            ),
        )
    }

    /**
     * 检查是否能看见目标
     * @param visionCtor 视觉组件构造函数，默认为AiVision
     * @returns 是否能看见目标
     */
    canSeeTarget(visionCtor: ConstructorOf<AiVision> = AiVision): boolean {
        return this.getTarget().match(
            false,
            actor => this.components.getComponent(visionCtor).match(
                false,
                vision => vision.seenActors.has(actor)
            ),
        )
    }

    /**
     * 检查目标是否正在格挡
     * @returns 目标是否正在格挡
     */
    targetIsBlocking(): boolean {
        return this.targetStatus().match(
            false,
            actor => actor.isBlocking,
        )
    }

    /**
     * 检查AI是否处于被中断状态
     * @param iterapted 中断状态数组，默认为['blocked', 'parried', 'hurt']
     * @returns AI是否处于被中断状态
     */
    actorIterapted(iterapted: string[] = [ 'blocked', 'parried', 'hurt' ]): boolean {
        const stateName = this.ai.status.status
        return iterapted.includes(stateName)
    }
}
