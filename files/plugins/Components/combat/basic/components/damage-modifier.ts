import { BaseComponent } from "../core/component"
import { PublicComponent, Fields } from "../core/config"

/** 伤害修正组件 - 调整伤害值 */
@PublicComponent('damage-modifier')
@Fields([ 'modifier' ])
export class DamageModifier extends BaseComponent {
    /** 默认伤害修正值 */
    static defaultModifier = 0.2
    /** 默认伤害修正选项 */
    static defaultModifierOpt = new DamageModifier(DamageModifier.defaultModifier)

    /** 创建伤害修正组件 */
    static create({ modifier }: { modifier: number }) {
        return new DamageModifier(modifier)
    }

    #modifier = DamageModifier.defaultModifier

    /** 获取伤害修正值 */
    get modifier() {
        return this.#modifier
    }

    constructor(
        modifier = DamageModifier.defaultModifier
    ) {
        super()
        this.#modifier = modifier
    }
}
