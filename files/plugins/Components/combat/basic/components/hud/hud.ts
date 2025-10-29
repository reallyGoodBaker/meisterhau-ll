import { BaseComponent, ComponentManager } from '../../core/component';
import { PublicComponent, Fields } from "../../core/config"
import { Optional } from "@utils/optional"

/** HUD组件参数接口 */
export interface HudComponentParams {
    /** HUD内容 */
    content?: string
    /**
     * HUD类型
     * @link https://lse.liteldev.com/zh/apis/GameAPI/Player/#_6
     */
    type?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
    /** 淡入时间 */
    fadeIn?: number
    /** 停留时间 */
    stay?: number
    /** 淡出时间 */
    fadeOut?: number
}

/** HUD组件 - 显示屏幕提示信息 */
@PublicComponent('hud')
@Fields([ 'content', 'type', 'fadeIn', 'fadeOut', 'stay' ])
export class HudComponent extends BaseComponent {

    /** HUD符号定义 */
    static symbols = {
        sword: '⚔',
        bodyTech: '✴',
        trace: '↪',
    }

    static id = 0
    
    /** 创建HUD组件 */
    static create({ content, type, fadeIn, fadeOut, stay }: HudComponentParams = {}) {
        return new HudComponent(content, type, fadeIn, fadeOut, stay)
    }

    readonly id = HudComponent.id++

    constructor(
        public content: string = '',
        public type: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 = 4,
        public fadeIn = 10,
        public fadeOut = 10,
        public stay = 50,
    ) {
        super()
    }

    /** 每tick渲染HUD */
    onTick(manager: ComponentManager, pl: Optional<Player>): void {
        this.renderHud(pl)   
    }

    /** 渲染HUD到玩家屏幕 */
    renderHud(pl: Optional<Player>) {
        pl.unwrap()
            .setTitle(this.content, this.type as any, this.fadeIn, this.fadeOut, this.stay)
            // .tell(this.content, 5)
    }
}
