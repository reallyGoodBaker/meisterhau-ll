import { Actor } from "@combat/basic/core/inputSimulator"
import { BaseComponent } from "../../core/component"
import { Optional } from "@utils/optional"

export class TargetLock extends BaseComponent {

    get sourceIsPlayer() {
        return !this.source.isEmpty() && ('xuid' in this.source.unwrap())
    }

    get targetIsPlayer() {
        return !this.target.isEmpty() && ('xuid' in this.target.unwrap())
    }

    constructor(
        public source = Optional.none<Actor>(),
        public target = Optional.none<Actor>(),
    ) {
        super()
    }

    onAttach() {
        if (this.sourceIsPlayer) {
            this.source.use(p => {
                mc.runcmdEx(`/inputpermission set ${p.name} jump disabled`)
                mc.runcmdEx(`/inputpermission set ${p.name} sneak disabled`)
            })
        }
    }

    onDetach() {
        if (this.sourceIsPlayer) {
            this.source.use(p => {
                mc.runcmdEx(`/inputpermission set ${p.name} jump enabled`)
                mc.runcmdEx(`/inputpermission set ${p.name} sneak enabled`)
            })
        }
    }
}