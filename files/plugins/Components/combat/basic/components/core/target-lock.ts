import { Actor } from "@utils/actor"
import { BaseComponent } from "../../core/component"
import { Optional } from "@utils/optional"
import { Delegate } from "@utils/events"
import { Status } from "@combat/basic/core/status"
import { IsAI } from "@combat/basic/core/ai/core"

export class TargetLock extends BaseComponent {

    sourceIsPlayer = false
    targetIsPlayer = false
    targetIsAI = false

    get targetIsActor() {
        return this.targetIsAI || this.targetIsPlayer
    }

    constructor(
        public source = Optional.none<Actor>(),
        public target = Optional.none<Actor>(),
    ) {
        super()
        this.resetAttrs()
    }

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

    onAttach() {
        if (this.sourceIsPlayer) {
            this.source.use(p => {
                mc.runcmdEx(`/inputpermission set ${p.name} jump disabled`)
                mc.runcmdEx(`/inputpermission set ${p.name} sneak disabled`)
            })
        }
    }

    selectTarget(target: Actor) {
        this.target = Optional.some(target)
        this.resetAttrs()
    }

    readonly onLoseLock = new Delegate()

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