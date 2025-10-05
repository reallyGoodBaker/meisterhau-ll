import { tricks } from "@combat/tricks/kokorowatari"
import { ai, MeisterhauAI } from "../core"
import { AiActions } from "../aiActions"
import { EasyAISensing } from "../easyAiSensing"
import { AttackSensor } from "@combat/basic/components/attackSensor"
import { IncomingAttack } from "@combat/basic/default"

export class Shinobu extends MeisterhauAI {

    readonly actions = new AiActions(this)
    readonly sensing = new EasyAISensing(this)

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

    // 处理 ai 选择/放弃目标的逻辑
    async tryAcquireOrReleaseTarget() {
        // 获取 sensing 和 actions
        if (!this.sensing.hasTarget()) {
            // 让 ai 看向15格内最近的玩家
            this.actions.lookAtNearest(15, [ 'player' ])
            await this.waitTick()
            // 如果正前方有玩家，则设置目标
            // 如果有别的需求（比如“看到”或“听到”），可以手动调用 setTarget
            this.actions.setForwardActorAsTarget(8)
        }

        // 如果目标不在10格内，则放弃目标
        if (this.sensing.hasTarget() && !this.sensing.targetInRange(10)) {
            this.actions.removeTarget()
        }
    }

    async combo1() {
        // 等待所有任务完成
        await this.waitExecutingTasks()

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

    onAttack(incomingAttack: IncomingAttack) {
        this.actions.attack()
    }

    async *mildStrategy() {
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

            // 如果目标在3格内，则执行连招1
            if (this.sensing.targetInRange(3)) {
                // 执行第一个连招
                yield () => this.combo1()
            }
        }
    }

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

            // 等待所有任务完成（从executeTask提交的任务）
            await this.waitExecutingTasks()
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