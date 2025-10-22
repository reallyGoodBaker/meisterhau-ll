import { BaseComponent } from "../../core/component"
import { Fields, PublicComponent } from "../../core/config"

export type InputTypes = 'jump' | 'sneak' | 'sprint' | 'attack' | 'use' | 'feint'

@PublicComponent('player-input')
@Fields([
    'allowMove', 'allowCamera', 'allowJump', 'allowSneak', 'allowSprint',
    'allowAttack', 'allowUse', 'allowFeint'
])
export class InputComponent extends BaseComponent {
    allowedInputs: { [key in InputTypes]: boolean } = {
        jump: true,
        sneak: true,
        sprint: true,
        attack: true,
        use: true,
        feint: true
    }

    #preInput: null | InputTypes = null
    #preInputTimer: NodeJS.Timeout | null = null

    get preInput(): null | InputTypes {
        return this.#preInput
    }

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