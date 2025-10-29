import { BaseComponent } from "../core/component"
import { Fields, PublicComponent } from "../core/config"

/** 计时器组件 - 倒计时功能 */
@PublicComponent('timer')
@Fields([ 'rest' ], [ 'duration', 'done' ])
export class Timer extends BaseComponent {

    /** 剩余时间 */
    rest: number

    /** 是否完成计时 */
    get done() {
        return this.rest <= 0
    }

    constructor(
        /** 计时器总时长 */
        public readonly duration: number = 0
    ) {
        super()
        this.allowTick = true
        this.rest = this.duration
    }

    /** 每tick减少剩余时间 */
    onTick() {
        this.rest--
    }

    /** 重置计时器 */
    reset() {
        this.rest = this.duration
    }

}
