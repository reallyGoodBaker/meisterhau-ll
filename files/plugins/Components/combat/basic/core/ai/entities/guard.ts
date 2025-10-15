import { Timer } from '@combat/basic/components/timer'
import { initCombatComponent } from '../../core'
import { ai, MeisterhauAI } from '../core'
import { tricks } from '../../../../tricks/ornateTwoHander'
import { EasyAISensing } from '../easyAiSensing'
import { AiActions } from '../aiActions'

export class Guard extends MeisterhauAI {

    target: Entity | null = null
    readonly actions = new AiActions(this)
    readonly sensing = new EasyAISensing(this)

    async onStart() {
        this.actor.use(actor => {
            initCombatComponent(actor, tricks, this.status)
        })
    }

    getStrategy(strategy: string) {
        switch (strategy) {
            case 'default':
                return this.getDefaultStrategy()

            case 'crazy':
                return this.getCrazyStrategy()

            case 'left-combo':
                return this.getLeftComboStrategy()

            default:
                return
        }
    }

    async tryAcquireTarget() {
        if (!this.sensing.hasTarget()) {
            this.actions.lookAtNearest(8, [ 'player' ])
            await this.waitTick()
            return this.actions.setForwardActorAsTarget(8)
        }

        return true
    }

    async tryReleaseTarget() {
        if (this.sensing.hasTarget() && !this.sensing.targetInRange(10)) {
            this.actions.removeTarget()
        }
    }

    getCrazyStrategy() {
        const self = this

        async function *moves() {
            // 使动作反复循环，直到AI停止
            while (!self.stopped) {
                await self.waitTick()

                // 没有获得到目标
                if (!await self.tryAcquireTarget()) {
                    continue
                }

                // 在目标离开射程时释放目标
                self.tryReleaseTarget()

                if (!self.sensing.targetInRange(5)) {
                    continue
                }

                const randomAct = Math.floor(Math.random() * 3)
                switch (randomAct) {
                    case 1:
                        yield (() => self.actions.attack()) as any
                        await self.wait(800)
                        break
                
                    case 2:
                        yield () => self.actions.useItem()
                        await self.wait(800)
                        break
                
                    case 3:
                        yield () => self.actions.sneak()
                        await self.wait(800)
                        break
                }
            }
        }

        return moves()
    }

    getDefaultStrategy() {
        const self = this

        // 60 ticks 后进入要是玩家还不操作就自动攻击
        // 这里先获得一个计时器
        const attackIntent = self.status.componentManager.getOrCreate(Timer, 60).unwrap()

        async function *moves() {
            // 使动作反复循环，直到AI停止
            while (!self.stopped) {
                // 等待下一个游戏刻防止卡死
                await self.waitTick()

                // 没有获得到目标
                if (!await self.tryAcquireTarget()) {
                    continue
                }

                // 在目标离开射程时释放目标
                self.tryReleaseTarget()

                // 等待目标进入射程
                if (!self.sensing.targetInRange(5)) {
                    // 重置时间防止攻击意图消失
                    attackIntent.reset()
                    continue
                }

                // 玩家输入闪避
                if (self.sensing.hasTargetInputed('onDodge')) {
                    // 使用 yield 返回一个函数，而不是直接调用，这样可以让这个函数的执行时机被合理安排
                    yield (() => self.actions.attack()) as any
                    await self.wait(800)
                    // 玩家匆忙操作时通过连段进行惩罚
                    if (self.sensing.hasTargetInputed('onAttack', 'onUseItem', 'onDodge')) {
                        yield () => self.actions.attack()
                        await self.wait(1400)
                    }
                    continue
                }

                // 玩家输入攻击
                if (self.sensing.hasTargetInputed('onAttack')) {
                    // 霸体换血
                    yield () => self.actions.useItem()
                    await self.wait(800)
                    // 玩家匆忙操作时通过连段进行惩罚
                    if (self.sensing.hasTargetInputed('onAttack', 'onUseItem', 'onDodge')) {
                        yield () => self.actions.useItem()
                        await self.wait(1400)
                    }
                    continue
                }

                // 玩家在格挡
                if (self.sensing.targetIsBlocking()) {
                    // 火刀破防
                    yield () => self.actions.sneak()
                    await self.wait(400)
                    // 玩家尝试闪避、攻击打断、招架时取消出招
                    if (self.sensing.hasTargetInputed('onDodge', 'onAttack', 'onUseItem')) {
                        yield () => self.actions.feint()
                        await self.wait(100)
                        // 霸体换血
                        yield () => self.actions.useItem()
                        await self.wait(950)
                        // 连段，惩罚心慌的玩家
                        yield () => self.actions.useItem()
                        await self.wait(1800)
                        continue
                    }
                    await self.wait(600)
                    continue
                }

                if (attackIntent.done) {
                    // 立刻释放, 防止卡死
                    attackIntent.reset()
                    // 60 ticks 后进入要是玩家还不操作就自动攻击
                    yield () => self.actions.sneak()
                    await self.wait(400)
                    // 玩家尝试闪避、攻击打断、招架时取消出招
                    if (self.sensing.hasTargetInputed('onDodge', 'onAttack', 'onUseItem')) {
                        yield () => self.actions.feint()
                        await self.wait(100)
                        // 霸体换血
                        yield () => self.actions.attack()
                        await self.wait(950)
                        // 连段，惩罚心慌的玩家
                        yield () => self.actions.attack()
                        await self.wait(1400)
                        continue
                    }
                    await self.wait(600)
                }
            }
        }

        return moves()
    }

    getLeftComboStrategy() {
        const ai = this
        async function *moves() {
            yield (() => ai.actions.attack()) as any
            await ai.wait(800)
            yield () => ai.actions.attack()
            await ai.wait(2000)
        }

        return moves()
    }
}

ai.register({
    type: 'meisterhau:guard',
    ai: Guard,
    tricks,
})
