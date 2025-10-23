import { tricks } from "@combat/tricks/kokorowatari"
import { ai, MeisterhauAI } from "../core"
import { AiActions } from "../aiActions"
import { EasyAISensing } from "../easyAiSensing"
import { AttackSensor } from "@combat/basic/components/attackSensor"
import { IncomingAttack } from "@combat/basic/default"

/**
 * 忍野忍AI类 - 实现忍野忍角色的AI行为
 * 包含温和策略和守卫策略
 */
export class Shinobu extends MeisterhauAI {

    readonly actions = new AiActions(this)
    readonly sensing = new EasyAISensing(this)

    /**
     * 获取指定策略的状态机
     * @param strategy 策略名称
     * @returns 策略状态机生成器
     */
    getStrategy(strategy: string) {

        // 优先实现 default 策略
        if (strategy === 'default') {
            return this.mildStrategy() as any
        }

        if (strategy === 'guard') {
            return this.guardStrategy() as any
        }

        return undefined
    }

    /**
     * 处理AI选择/放弃目标的逻辑
     * 自动寻找目标并在目标离开范围时放弃
     */
    async tryAcquireOrReleaseTarget() {
        // 获取 sensing 和 actions
        if (!this.sensing.hasTarget()) {
            // 让 ai 看向15格内最近的玩家
            this.actions.lookAtNearest(15, [ 'player' ])
            await this.waitTick()
            // 如果正前方有玩家，则设置目标
            // 如果有别的需求（比如"看到"或"听到"），可以手动调用 setTarget
            this.actions.setForwardActorAsTarget(8)
        }

        // 如果目标不在10格内，则放弃目标
        if (this.sensing.hasTarget() && !this.sensing.targetInRange(10)) {
            this.actions.removeTarget()
        }
    }

    /**
     * 连招1 - 三连击组合
     * 包含攻击-攻击-攻击的连段，可被中断
     */
    combo1 = async () => {
        this.actions.attack()
        await this.wait(600)
        if (this.sensing.actorIterapted()) {
            return
        }

        this.actions.attack()
        await this.wait(650)
        if (this.sensing.actorIterapted()) {
            return
        }

        this.actions.attack()
        await this.wait(1600)
    }

    /**
     * 连招2 - 物品使用+攻击组合
     * 使用物品后接攻击，可被中断
     */
    combo2 = async () => {
        this.actions.useItem()
        await this.wait(600)
        if (this.sensing.actorIterapted()) {
            return
        }
        this.actions.attack()
        await this.wait(600)
    }

    /**
     * 被攻击时的响应处理
     * @param incomingAttack 受到的攻击信息
     */
    async onAttack(incomingAttack: IncomingAttack) {
        this.actions.attack()

        if (this.strategy === 'default') {
            this.actions.useItem()
            this.executeTask(async () => {
                await this.wait(400)
                this.actions.attack()
            })
        }
    }

    /**
     * 温和策略 - 根据目标距离和状态智能选择连招
     * 近距离优先使用连招2，中距离优先使用连招1
     * @returns 温和策略状态机生成器
     */
    async *mildStrategy() {
        // 使用循环可以让 ai 一直执行
        // 一定要在循环中使用 MeisterhauAI.stopped
        // 否则会导致死循环
        while (!this.stopped) {
            // 等待 1 tick防止死循环
            await this.waitTick()
            await this.tryAcquireOrReleaseTarget()

            if (this.hasAnyExecutingTasks()) {
                continue
            }

            // 如果没有目标，则跳过
            if (!this.sensing.hasTarget()) {
                continue
            }

            // 如果目标尝试格挡，则使用剑柄打击
            if (this.sensing.targetIsBlocking()) {
                yield this.combo2
                continue
            }

            // 如果目标在2格内，则更多尝试执行连招2
            if (this.sensing.targetInRange(2) && Math.random() < 0.15) {
                // 随机挑选连招
                yield this.randomActions(
                    [1, this.combo1],
                    [2, this.combo2],
                )
                continue
            }

            // 如果目标在3格内，则更多尝试执行连招1
            if (this.sensing.targetInRange(3) && Math.random() < 0.15) {
                // 随机挑选连招
                yield this.randomActions(
                    [2, this.combo1],
                    [1, this.combo2],
                )
            }
        }
    }

    /**
     * 守卫策略 - 仅保持目标锁定，不主动攻击
     * 用于防御性行为
     * @returns 守卫策略状态机生成器
     */
    async *guardStrategy() {
        // 使用循环可以让 ai 一直执行
        // 一定要在循环中使用 MeisterhauAI.stopped
        // 否则会导致死循环
        while (!this.stopped) {
            // 等待 1 tick防止死循环
            await this.waitTick()
            await this.tryAcquireOrReleaseTarget()

            // 如果没有目标，则跳过
            if (!this.sensing.hasTarget()) {
                continue
            }
        }
    }

}

ai.register({
    type: 'monogatari:shinobu',
    ai: Shinobu,
    tricks,
    components: [
        new AttackSensor()
    ],
    setup(ai: Shinobu) {
        ai.status.componentManager.getComponent(AttackSensor).use(sensor => {
            sensor.onWillAttack.bind(incomingAttack => {
                ai.onAttack(incomingAttack)
            })
        })
    }
})
