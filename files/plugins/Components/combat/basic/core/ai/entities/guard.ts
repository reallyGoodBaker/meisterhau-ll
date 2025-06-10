import { Timer } from '@combat/basic/components/timer'
import { initCombatComponent } from '../../core'
import { Status } from '../../status'
import { ai, AIEventTriggerContext, MeisterhauAI, MeisterhauAIState } from '../core'
import { tricks } from '../tricks/ornateTwoHander'

export class Guard extends MeisterhauAI {

    target: Entity | null = null
    allowLooping = true

    getStrategy(strategy: string): AsyncGenerator<MeisterhauAIState, void, unknown> {
        switch (strategy) {
            case 'cheater':
                return this.getDefaultStrategy() as any

            case 'crazy':
                return this.getCrazyStrategy() as any

            default:
                return this.getDefaultStrategy()
        }
    }

    getContext(): AIEventTriggerContext {
        return {
            en: this.actor,
            status: this.status,
        }
    }

    getCrazyStrategy() {
        const self = this
        const [ inRangeSignal ] = this.event('inRange', (_, ctx) => {
            this.target = ctx.en.getEntityFromViewVector(5)
            if (this.target) {
                return true
            }

            return false
        })

        async function *moves() {
            while (self.allowLooping) {
                await self.waitTick()

                if (!inRangeSignal()) {
                    continue
                }

                const randomAct = Math.floor(Math.random() * 3)
                switch (randomAct) {
                    case 1:
                        yield () => self.attack()
                        await self.wait(800)
                        break
                
                    case 2:
                        yield () => self.useItem()
                        await self.wait(800)
                        break
                
                    case 3:
                        yield () => self.sneak()
                        await self.wait(800)
                        break
                }
            }
        }

        return moves()
    }

    getDefaultStrategy() {
        const self = this
        const [ inRangeSignal ] = this.event('inRange', (_, ctx) => {
            this.target = ctx.en.getEntityFromViewVector(5)
            if (this.target) {
                return true
            }

            return false
        })

        const [ isBlockingSignal ] = this.event('isBlocking', () => {
            if (!this.target) {
                return false
            }
            return Status.get(this.target.uniqueId).isBlocking
        })

        const [ isPlayerInputSignal ] = this.event<(keyof InputableTransitionMap)[]>('isPlayerInput', (input: (keyof InputableTransitionMap)[]) => {
            if (!this.target) {
                return false
            }

            const preinput = Status.get(this.target.uniqueId)?.preInput
            if (!preinput) {
                return false
            }


            return input.includes(preinput as keyof InputableTransitionMap) 
        })

        // 60 ticks 后进入要是玩家还不操作就自动攻击
        // 这里先获得一个计时器
        const attackIntent = self.status.componentManager.getOrCreate(Timer, 60).unwrap()

        async function *moves() {
            // 使动作反复循环
            while (self.allowLooping) {
                // 等待下一个游戏刻防止卡死
                await self.waitTick()

                // 等待目标进入射程
                if (!inRangeSignal()) {
                    // 重置时间防止攻击意图消失
                    attackIntent.reset()
                    continue
                }

                // 玩家输入闪避
                if (isPlayerInputSignal([ 'onDodge' ])) {
                    // 使用 yield 返回一个函数，而不是直接调用，这样可以让这个函数的执行时机被合理安排
                    yield () => self.attack() as any
                    await self.wait(800)
                    // 玩家匆忙操作时通过连段进行惩罚
                    if (isPlayerInputSignal([ 'onAttack', 'onUseItem', 'onDodge' ])) {
                        yield () => self.attack()
                        await self.wait(1400)
                    }
                    continue
                }

                // 玩家输入攻击
                if (isPlayerInputSignal([ 'onUseItem' ])) {
                    // 霸体换血
                    yield () => self.useItem()
                    await self.wait(800)
                    // 玩家匆忙操作时通过连段进行惩罚
                    if (isPlayerInputSignal([ 'onAttack', 'onUseItem', 'onDodge' ])) {
                        yield () => self.useItem()
                        await self.wait(1400)
                    }
                    continue
                }

                // 玩家在格挡
                if (isBlockingSignal()) {
                    // 火刀破防
                    yield () => self.sneak()
                    await self.wait(400)
                    // 玩家尝试闪避、攻击打断、招架时取消出招
                    if (isPlayerInputSignal([ 'onDodge', 'onAttack', 'onUseItem' ])) {
                        yield () => self.feint()
                        await self.wait(100)
                        // 霸体换血
                        yield () => self.useItem()
                        await self.wait(950)
                        // 连段，惩罚心慌的玩家
                        yield () => self.useItem()
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
                    yield () => self.sneak()
                    await self.wait(400)
                    // 玩家尝试闪避、攻击打断、招架时取消出招
                    if (isPlayerInputSignal([ 'onDodge', 'onAttack', 'onUseItem' ])) {
                        yield () => self.feint()
                        await self.wait(100)
                        // 霸体换血
                        yield () => self.attack()
                        await self.wait(950)
                        // 连段，惩罚心慌的玩家
                        yield () => self.attack()
                        await self.wait(1400)
                        continue
                    }
                    await self.wait(600)
                }
            }
        }

        return moves()
    }

    async run() {
        initCombatComponent(this.actor, tricks, this.status)
        console.log(
            await this.loop(stop => {
                if (!this.allowLooping) {
                    stop('done.')
                    return
                }

                this.tick()
            })
        )
    }

    stop(): void {
        this.allowLooping = false
    }
}

ai.register('meisterhau:guard', Guard, tricks)