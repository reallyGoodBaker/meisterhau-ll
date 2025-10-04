import { entitySelector, playAnimCompatibility } from "@combat/basic"
import { DefaultMoves, DefaultTrickModule } from "@combat/basic/default"

// 不继承自DefaultMoves也可以，但是会少很多预设的状态
class KokorowatariMoves extends DefaultMoves {
    constructor() {
        super()
        // 设置一个状态机的恢复点（所有预设的状态结束时都会切换到这个状态
        // 这个状态不是默认起始状态，注意
        this.setup<KokorowatariMoves>('idle')
    }

    // 定义idle状态
    idle: Move = {
        // 前摇，无限刻
        cast: Infinity,
        // 在这个状态时每一刻执行的代码
        onTick(actor, ctx) {
            // 让npc面向玩家
            ctx.lookAtTarget(actor)
        },
        // 状态转换
        transitions: {
            // 转换到hurt状态
            hurt: {
                // 转换条件是 onHurt ，没有多余参数
                onHurt: null
            },
            attack1: {
                onAttack: null
            }
        }
    }

    attack1: Move = {
        cast: 14,
        backswing: 6,
        onEnter(actor, ctx) {
            playAnimCompatibility(actor, 'animation.daimyo.ai.attack1', 'animation.daimyo.ai.attack1')
            ctx.lookAtTarget(actor)
        },
        timeline: {
            9: (actor, ctx) => ctx.selectFromSector(actor, {
                radius: 4,
            }).forEach(en => {
                ctx.attack(actor, en, {
                    damage: 12,
                    direction: 'vertical',
                })
            }),
            15: (actor, ctx) => ctx.adsorbOrSetVelocity(actor, 1.2)
        },
        transitions: {
            hurt: {
                onHurt: null
            },
            parried: {
                onParried: null
            },
            blocked: {
                onBlocked: null
            },
            idle: {
                onEndOfLife: null
            }
        }
    }
}

class Kokorowatari extends DefaultTrickModule {
    constructor() {
        super(
            // 只要不重复可以随便写
            'rgb.shinobu',
            // 动作模组的默认起始状态
            'idle',
            [ 'monogatari:kokorowatari' ],
            new KokorowatariMoves()
        )
    }
}

export const tricks = new Kokorowatari()