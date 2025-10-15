import { ComponentManager, CustomComponent } from "@combat/basic/core/component"
import { tricks as emptyHandTrick } from '../../../tricks/empty-hand'
import { Optional } from "@utils/optional"

export class TrickComponent extends CustomComponent {
    static readonly tricks = new Map<string, TrickModule>()
    /**
     * moves中当前move的名称
     */
    moveName = emptyHandTrick.entry
    /**
     * 当前move
     */
    move = emptyHandTrick.moves[emptyHandTrick.entry as keyof typeof emptyHandTrick.moves]
    /**
     * 动作已持续时间
     */
    duration = 0
    /**
     * 绑定的模组
     */
    //@ts-ignore
    trick: TrickModule = emptyHandTrick

    loadTrick(sid: string) {
        const trick = TrickComponent.tricks.get(sid)
        if (trick) {
            this.trick = trick
            this.move = trick.moves.getMove(trick.entry)
            this.moveName = trick.entry
            this.duration = 0

            if (this.move.onEnter) {
                this.move.onEnter(
                    this.getEntity().unwrap(),
                    {} as any
                )
            }
            
        }
    }

    onTick(manager: ComponentManager, pl: Optional<Player>): void {
        
    }
}