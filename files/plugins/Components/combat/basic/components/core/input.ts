import { BaseComponent } from "../../core/component"
import { Fields, PublicComponent } from "../../core/config"

/** 输入类型定义 */
export type InputTypes = 'jump' | 'sneak' | 'sprint' | 'attack' | 'use' | 'feint'

/** 输入组件 - 管理玩家输入控制 */
@PublicComponent('player-input')
@Fields([
    'allowMove', 'allowCamera', 'allowJump', 'allowSneak', 'allowSprint',
    'allowAttack', 'allowUse', 'allowFeint'
])
export class InputComponent extends BaseComponent {
    /** 允许的输入类型 */
    allowedInputs: { [key in InputTypes]: boolean } = {
        jump: true,
        sneak: true,
        sprint: true,
        attack: true,
        use: true,
        feint: true
    }

    /** 预输入 */
    #preInput: null | InputTypes = null
    /** 预输入计时器 */
    #preInputTimer: NodeJS.Timeout | null = null

    /** 获取预输入 */
    get preInput(): null | InputTypes {
        return this.#preInput
    }

    /** 设置预输入 */
    set preInput(v: InputTypes) {
        if (this.allowedInputs[v]) {
            this.#preInput = v
        }

        if (this.#preInputTimer) {
            clearTimeout(this.#preInputTimer)
        }

        this.#preInputTimer = setTimeout(() => this.#preInput = null, 500)
    }
}
