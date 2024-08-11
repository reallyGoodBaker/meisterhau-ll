import { BaseComponent, ComponentManager } from "../core/component"
import { Optional } from "../core/optional"
import { getPlayer } from "../utils/mc"

const locks = new Map()
const cooldowns = new Set()

export class TargetLock extends BaseComponent {
    public srcPlayer: Optional<Player> = Optional.none()

    constructor(
        private source: string,
        public target: Optional<Entity|Player>,
    ) {
        super()
        
        locks.set(this.source, this.target)
        this.srcPlayer = getPlayer(source, pl => pl.setMovementSpeed(0.04))
    }

    onAttach(manager: ComponentManager): boolean | void | Promise<boolean | void> {
        
    }
}