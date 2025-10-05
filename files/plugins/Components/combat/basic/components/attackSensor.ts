import { Delegate } from "@utils/events"
import { CustomComponent } from "../core/component"
import { IncomingAttack } from "../default"
import { Actor } from "../core/inputSimulator"

export class AttackSensor extends CustomComponent {
    constructor(
        readonly onlySelf: boolean = true,
        readonly onlyTeammates: boolean = false,
        readonly range: number = 4,
    ) {
        super()
    }

    readonly onWillAttack = new Delegate<[IncomingAttack, Actor]>()
}