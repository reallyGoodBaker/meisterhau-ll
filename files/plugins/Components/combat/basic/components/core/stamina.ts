import { CustomComponent, ComponentManager } from "../../core/component"
import { Fields, PublicComponent } from "../../core/config"
import { Optional } from "@utils/optional"
import { constrictCalc, minmax } from "@utils/math"
import { Timer } from "../timer"

/** 体力组件 - 管理角色的体力系统 */
@PublicComponent('stamina')
@Fields([ 'stamina', 'maxStamina', 'restorePerTick', 'restoreCooldown' ])
export class Stamina extends CustomComponent {

    /** 冷却计时器 */
    cooldown: Optional<Timer> = Optional.none()
    /** 上一帧体力值 */
    prevStamina: number

    /** 当前体力值 */
    get stamina() {
        return this.$stamina
    }

    /** 设置体力值（自动限制范围） */
    set stamina(v) {
        this.$stamina = minmax(0, this.maxStamina, v)
    }

    constructor(
        /** 内部体力值 */
        public $stamina = 100,
        /** 最大体力值 */
        public maxStamina = 100,
        /** 每tick恢复量 */
        public restorePerTick = 1.6,
        /** 恢复冷却时间 */
        public restoreCooldown = 20,
    ) {
        super()
        this.prevStamina = this.stamina

        this.allowTick = true
    }

    /** 重置恢复冷却 */
    async resetRestore(manager: ComponentManager) {
        this.cooldown = manager.getOrCreate(Timer, this.restoreCooldown)

        const cooldown = this.cooldown.unwrap()
        cooldown.rest = this.restoreCooldown
        this.prevStamina = this.stamina
    }

    /** 设置冷却时间 */
    setCooldown(cooldown: number) {
        if (this.cooldown.isEmpty()) {
            return
        }

        this.cooldown.unwrap().rest = cooldown
    }

    /** 每tick更新体力状态 */
    onTick(manager: ComponentManager): void {
        if (this.prevStamina > this.stamina) {
            this.resetRestore(manager)
            return
        }

        if (this.cooldown.isEmpty() || this.cooldown.unwrap().done) {
            this.stamina = constrictCalc(0, this.maxStamina, () => this.stamina + this.restorePerTick)
        }

        this.prevStamina = this.stamina
    }

}
