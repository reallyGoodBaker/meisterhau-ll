import { ComponentManager, CustomComponent } from "@combat/basic/core/component"
import { tricks as emptyHandTrick } from '../../../tricks/empty-hand'
import { Optional } from "@utils/optional"

/** 技巧组件 - 管理战斗动作和技能 */
export class TrickComponent extends CustomComponent {
    /** 所有注册的技巧模块 */
    static readonly tricks = new Map<string, TrickModule>()
    /** 当前动作名称 */
    moveName = emptyHandTrick.entry
    /** 当前动作 */
    move = emptyHandTrick.moves[emptyHandTrick.entry as keyof typeof emptyHandTrick.moves]
    /** 动作已持续时间 */
    duration = 0
    /** 绑定的技巧模块 */
    //@ts-ignore
    trick: TrickModule = emptyHandTrick

    /** 加载技巧模块 */
    loadTrick(sid: string) {
        const trick = TrickComponent.tricks.get(sid)
        if (trick) {
            this.trick = trick
            this.move = trick.moves.getMove(trick.entry)
            this.moveName = trick.entry
            this.duration = 0

            if (this.move.onEnter) {
                this.move.onEnter(
                    this.getActor().unwrap(),
                    {} as any
                )
            }
            
        }
    }

    /** 每tick更新技巧状态 */
    onTick(manager: ComponentManager, pl: Optional<Player>): void {
        
    }
}
