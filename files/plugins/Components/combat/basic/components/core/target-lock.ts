import { CustomComponent } from "../../core/component"
import { Optional } from "@utils/optional"

export class TargetLock extends CustomComponent {
    get sourcePlayer() {
        return Optional.some(mc.getPlayer(this.source))
    }

    get targetIsPlayer() {
        return !this.target.isEmpty() && ('xuid' in this.target.unwrap())
    }

    constructor(
        public source: string,
        public target: Optional<Player | Entity> = Optional.none(),
    ) {
        super()
    }
}