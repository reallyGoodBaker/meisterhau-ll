import { CustomComponent } from "../core/component"
import { Optional } from "@utils/optional"

export class TargetLock extends CustomComponent {
    public srcPlayer: Optional<Player> = Optional.none()
    public targetIsPlayer = false

    constructor(
        source: string,
        public target: Optional<Entity|Player> = Optional.none(),
    ) {
        super()
        this.srcPlayer = Optional.some(mc.getPlayer(source))
        if (!target.isEmpty() && 'xuid' in target.unwrap()) {
            this.targetIsPlayer = true
        }
    }
}