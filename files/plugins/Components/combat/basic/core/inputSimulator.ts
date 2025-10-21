import { input } from "scripts-rpc/func/input"
import { es } from "./event"
import { MeisterhauAI } from "./ai/core"
import { Optional } from "@utils/optional"
import { Actor } from "@utils/actor"

/**
 * 全局输入模拟器 - 用于模拟玩家输入事件
 */
class GlobalInputSimulator {
    /**
     * 模拟输入事件
     * @param input 输入事件类型
     * @param actor 目标角色
     * @param extraArgs 额外参数
     */
    simulate(
        input: keyof InputableTransitionMap,
        actor: Actor,
        ...extraArgs: any[]
    ) {
        extraArgs.unshift(actor)
        es.put(input, [ actor, Function.prototype, extraArgs ])
    }

    /**
     * 模拟跳跃输入
     * @param actor 目标角色
     */
    jump(actor: Actor) {
        this.simulate('onJump', actor)
    }

    /**
     * 模拟潜行输入
     * @param actor 目标角色
     * @param isSneaking 是否潜行，默认为true
     */
    sneak(actor: Actor, isSneaking=true) {
        this.simulate('onSneak', actor, isSneaking)
    }

    /**
     * 模拟释放潜行输入
     * @param actor 目标角色
     * @param isSneaking 是否潜行，默认为false
     */
    releaseSneak(actor: Actor, isSneaking=false) {
        this.simulate('onReleaseSneak', actor, isSneaking)
    }

    /**
     * 模拟使用物品输入
     * @param actor 目标角色
     * @param item 物品对象，可选
     */
    useItem(actor: Actor, item?: Item) {
        this.simulate('onUseItem', actor, item)
    }

    /**
     * 模拟切换疾跑输入
     * @param actor 目标角色
     * @param isSprinting 是否疾跑，默认为true
     */
    changeSprinting(actor: Actor, isSprinting=true) {
        this.simulate('onChangeSprinting', actor, isSprinting)
    }

    /**
     * 模拟攻击输入
     * @param actor 目标角色
     */
    attack(actor: Actor) {
        this.simulate('onAttack', actor)
    }

    /**
     * 模拟假动作输入
     * @param actor 目标角色
     */
    feint(actor: Actor) {
        this.simulate('onFeint', actor)
    }

    /**
     * 模拟闪避输入
     * @param actor 目标角色
     */
    dodge(actor: Actor) {
        this.simulate('onDodge', actor)
    }
}

export const inputSimulator = new GlobalInputSimulator()

/**
 * 等待函数 - 创建延迟Promise
 * @param timeout 延迟时间（毫秒），默认为0
 * @returns Promise对象
 */
function wait(timeout: number = 0) {
    const resolvers = Promise.withResolvers<void>()
    setTimeout(resolvers.resolve, timeout)
    return resolvers.promise
}

/**
 * AI输入模拟器 - 为AI角色提供输入模拟功能
 */
export class InputSimulator {
    readonly actor: Optional<Actor>

    /**
     * 构造函数
     * @param ai AI实例
     */
    constructor(
        protected ai: MeisterhauAI
    ) {
        this.actor = ai.actor
    }

    /**
     * 模拟跳跃输入
     * @param timeout 跳跃持续时间（毫秒），默认为300ms
     */
    async jump(timeout=300) {
        if (this.actor.isEmpty()) {
            return
        }

        this.ai.executeTask(async () => {
            const actor = this.actor.unwrap()
            input.performPress(actor.uniqueId, 'jump')
            inputSimulator.jump(actor)
            await wait(timeout)
            input.performRelease(actor.uniqueId, 'jump')
        })
    }

    /**
     * 模拟潜行输入
     */
    sneak() {
        if (this.actor.isEmpty()) {
            return
        }

        const actor = this.actor.unwrap()
        input.performPress(actor.uniqueId, 'sneak')
        inputSimulator.sneak(actor)
    }

    /**
     * 模拟释放潜行输入
     */
    releaseSneak() {
        if (this.actor.isEmpty()) {
            return
        }

        const actor = this.actor.unwrap()
        input.performRelease(actor.uniqueId,'sneak')
        inputSimulator.releaseSneak(actor)
    }

    /**
     * 模拟使用物品输入
     * @param item 物品对象，可选
     */
    useItem(item?: Item) {
        if (this.actor.isEmpty()) {
            return
        }

        const actor = this.actor.unwrap()
        inputSimulator.useItem(actor, item)
    }

    /**
     * 模拟切换疾跑输入
     * @param isSprinting 是否疾跑，默认为true
     */
    changeSprinting(isSprinting=true) {
        if (this.actor.isEmpty()) {
            return
        }

        this.ai.executeTask(async () => {
            const actor = this.actor.unwrap()
            inputSimulator.changeSprinting(actor, isSprinting)
        })
    }

    /**
     * 模拟攻击输入
     */
    attack() {
        if (this.actor.isEmpty()) {
            return
        }

        const actor = this.actor.unwrap()
        inputSimulator.attack(actor)
    }

    /**
     * 模拟假动作输入
     */
    feint() {
        if (this.actor.isEmpty()) {
            return
        }

        const actor = this.actor.unwrap()
        inputSimulator.feint(actor)
    }

    /**
     * 模拟闪避输入
     */
    dodge() {
        if (this.actor.isEmpty()) {
            return
        }

        const actor = this.actor.unwrap()
        inputSimulator.dodge(actor)
    }
}
