import { BaseComponent, ComponentManager } from "../../core/component"
import { Optional } from "@utils/optional"

export class TargetLock extends BaseComponent {
    get sourcePlayer() {
        return Optional.some(mc.getPlayer(this.source))
    }

    get targetIsPlayer() {
        return !this.target.isEmpty() && ('xuid' in this.target.unwrap())
    }

    constructor(
        public source: string,
        public target: Optional<Player|Entity> = Optional.none(),
    ) {
        super()
    }

    onAttach(manager: ComponentManager): boolean | void | Promise<boolean | void> {
        this.sourcePlayer.use(p => {
            mc.runcmdEx(`/inputpermission set ${p.name} jump disabled`)
        })
    }

    onDetach(manager: ComponentManager): void | Promise<void> {
        this.sourcePlayer.use(p => {
            mc.runcmdEx(`/inputpermission set ${p.name} jump enabled`)
        })
    }
}