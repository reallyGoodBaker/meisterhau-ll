import { BaseComponent } from "../core/component"
import { Tick } from "./tick"

/** 调度器组件 - 按周期执行任务 */
export class Scheduler extends BaseComponent {

    private offset: number = 0
    /** 是否更新标志 */
    public update = false

    constructor(
        /** 调度周期 */
        public period: number = 1
    ) {
        super()

        this.allowTick = true
    }

    /** 组件附加时初始化 */
    onAttach(): boolean | void | Promise<boolean | void> {
        this.offset = Tick.tick
    }

    /** 每tick检查是否需要更新 */
    onTick() {
        this.update = (Tick.tick - this.offset) % this.period === 0
    }
}
