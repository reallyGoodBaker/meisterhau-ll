import { BaseComponent, ComponentManager } from "../core/component"
import { Fields, PublicComponent } from "../core/config"

@PublicComponent('timer')
@Fields([ 'rest' ], [ 'duration', 'done' ])
export class Timer extends BaseComponent {

    rest: number

    get done() {
        return this.rest <= 0
    }

    constructor(
        public readonly duration: number = 0
    ) {
        super()
        this.rest = this.duration
    }

    onTick() {
        this.rest--
    }

    reset() {
        this.rest = this.duration
    }

}