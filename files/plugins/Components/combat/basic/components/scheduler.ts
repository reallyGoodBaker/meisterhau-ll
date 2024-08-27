import { Optional } from "@utils/optional"
import { BaseComponent, ComponentManager } from "../core/component"
import { Tick } from "./tick"

export class Scheduler extends BaseComponent {

    private offset: number = 0
    public update = false

    constructor(
        public period: number = 1
    ) {
        super()
    }

    onAttach(): boolean | void | Promise<boolean | void> {
        this.offset = Tick.tick
    }

    onTick() {
        this.update = (Tick.tick - this.offset) % this.period === 0
    }
}