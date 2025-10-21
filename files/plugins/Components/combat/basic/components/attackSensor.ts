import { Delegate } from "@utils/events"
import { CustomComponent } from "../core/component"
import { IncomingAttack } from "../default"
import { Actor } from "@utils/actor"

/** 攻击传感器组件 - 检测来袭攻击 */
export class AttackSensor extends CustomComponent {
    constructor(
        readonly onlySelf: boolean = true,
        readonly onlyTeammates: boolean = false,
        readonly range: number = 4,
    ) {
        super()
    }

    /** 当有攻击来袭时触发的事件委托 */
    readonly onWillAttack = new Delegate<[IncomingAttack, Actor]>()
}
