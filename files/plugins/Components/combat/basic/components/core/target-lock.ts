import { Actor } from "@utils/actor"
import { BaseComponent } from "../../core/component"
import { Optional } from "@utils/optional"
import { Delegate } from "@utils/events"
import { Status } from "@combat/basic/core/status"
import { IsAI } from "@combat/basic/core/ai/core"

/** 目标锁定组件 - 管理战斗中的目标锁定 */
export class TargetLock extends BaseComponent {

    /** 源是否为玩家 */
    sourceIsPlayer = false
    /** 目标是否为玩家 */
    targetIsPlayer = false
    /** 目标是否为AI */
    targetIsAI = false

    /** 目标是否为角色 */
    get targetIsActor() {
        return this.targetIsAI || this.targetIsPlayer
    }

    constructor(
        /** 源角色 */
        public source = Optional.none<Actor>(),
        /** 目标角色 */
        public target = Optional.none<Actor>(),
    ) {
        super()
        this.resetAttrs()
    }

    /** 重置属性 */
    resetAttrs() {
        this.sourceIsPlayer = !this.source.isEmpty() && ('xuid' in this.source.unwrap())
        this.targetIsPlayer = !this.target.isEmpty() && ('xuid' in this.target.unwrap())
        this.targetIsAI = this.target.match(
            false,
            t => Status.getComponentManager(t.uniqueId).match(
                false,
                m => !m.getComponent(IsAI).isEmpty()
            )
        )
    }

    /** 组件附加时禁用跳跃和潜行 */
    onAttach() {
        if (this.sourceIsPlayer) {
            this.source.use(p => {
                mc.runcmdEx(`/inputpermission set ${p.name} jump disabled`)
                mc.runcmdEx(`/inputpermission set ${p.name} sneak disabled`)
            })
        }
    }

    /** 选择目标 */
    selectTarget(target: Actor) {
        this.target = Optional.some(target)
        this.resetAttrs()
    }

    /** 失去锁定事件 */
    readonly onLoseLock = new Delegate()

    /** 组件分离时恢复跳跃和潜行 */
    onDetach() {
        if (this.sourceIsPlayer) {
            this.source.use(p => {
                this.onLoseLock.call()
                mc.runcmdEx(`/inputpermission set ${p.name} jump enabled`)
                mc.runcmdEx(`/inputpermission set ${p.name} sneak enabled`)
            })
        }
    }
}
