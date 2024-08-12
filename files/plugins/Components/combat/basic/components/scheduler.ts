import { Optional } from "@utils/optional"
import { BaseComponent, ComponentManager } from "../core/component"
import { Tick } from "./tick"

export class Scheduler extends BaseComponent {

    private tick: Optional<Tick> = Optional.none()
    private offset: number = 0
    public update = false

    constructor(
        public period: number = 1
    ) {
        super()
    }

    onAttach(manager: ComponentManager): boolean | void | Promise<boolean | void> {
        if (!(this.tick = manager.getComponent(Tick))) {
            return true
        }

        this.offset = this.tick.unwrap().dt
    }

    onTick() {
        this.update = (this.tick.unwrap().dt - this.offset) % this.period === 0
    }
}