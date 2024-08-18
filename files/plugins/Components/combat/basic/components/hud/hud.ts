import { BaseComponent, ComponentManager } from "../../core/component"
import { PublicComponent, Fields } from "../../core/config"
import { Optional } from "@utils/optional"

export interface HudComponentParams {
    content?: string
    /**
     * @link https://lse.liteldev.com/zh/apis/GameAPI/Player/#_6
     */
    type?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
    fadeIn?: number
    stay?: number
    fadeOut?: number
}

@PublicComponent('hud')
@Fields([ 'content', 'type', 'fadeIn', 'fadeOut', 'stay' ])
export class HudComponent extends BaseComponent {

    static symbols = {
        sword: '⚔',
        bodyTech: '✴',
        trace: '↪',
    }

    static id = 0
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

    onTick(_: ComponentManager, pl: Optional<Player>): void {
        this.renderHud(pl)
    }

    renderHud(pl: Optional<Player>) {
        pl.unwrap()
            .setTitle(this.content, this.type as any, this.fadeIn, this.fadeOut, this.stay)
            // .tell(this.content, 5)
    }
}