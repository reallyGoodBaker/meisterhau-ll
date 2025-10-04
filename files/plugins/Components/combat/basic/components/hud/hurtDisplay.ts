import { BaseComponent, ComponentManager } from "@combat/basic/core/component"
import { IncomingAttack } from "@combat/basic/default"

const lang = {
    left: '左侧',
    right: '右侧',
    middle: '刺击',
    vertical: '上侧',
}

export class HurtDisplay extends BaseComponent {
    constructor() {
        super()

        this.allowTick = true
    }

    onTick(manager: ComponentManager) {
        manager.getComponent(IncomingAttack).use(incoming => {
            const dirText = lang[incoming.direction]
            const text = `受到来自 ${dirText} 的 ${incoming.damage} 点伤害`
            this.getEntity().use(player => (player as Player).tell(text))
        })
    }
}