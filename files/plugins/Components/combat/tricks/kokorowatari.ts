import { playAnimCompatibility, playSoundAll } from "@combat/basic"
import { DefaultMoves, DefaultTrickModule } from "@combat/basic/default"

// 不继承自DefaultMoves也可以，但是会少很多预设的状态
class KokorowatariMoves extends DefaultMoves {
    constructor() {
        super()
        // 设置一个状态机的恢复点（所有预设的状态结束时都会切换到这个状态
        // 这个状态不是默认起始状态，注意
        this.setup<KokorowatariMoves>('idle')

        this.animations.block.left = 'animation.shinobu.ai.block'

        this.setTransition<KokorowatariMoves>('block', 'blockHilt', {
            onTrap: {
                tag: 'blockCounter',
                preInput: 'onUseItem',
            }
        })
    }

    // 定义idle状态
    idle: Move = {
        // 前摇，无限刻
        cast: Infinity,
        // 在这个状态时每一刻执行的代码
        onEnter(actor, ctx) {
            playAnimCompatibility(actor, 'animation.shinobu.ai.hold', 'animation.shinobu.ai.hold')
        },
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
            },
            hilt: {
                onUseItem: null
            }
        }
    }

    attack1: Move = {
        cast: 14,
        backswing: 6,
        onEnter(actor, ctx) {
            playAnimCompatibility(actor, 'animation.shinobu.ai.attack1', 'animation.shinobu.ai.hold')
            ctx.lookAtTarget(actor)
            ctx.status.isBlocking = true
        },
        onLeave(actor, ctx) {
            ctx.status.isBlocking = false
        },
        timeline: {
            5: actor => playSoundAll('weapon.whoosh.thick.2', actor.pos),
            8: (actor, ctx) => ctx.selectFromSector(actor, {
                radius: 4,
            }).forEach(en => {
                ctx.attack(actor, en, {
                    damage: 12,
                    direction: 'vertical',
                    knockback: 0.5,
                })
            }),
            13: (actor, ctx) => ctx.trap(actor),
            0: (actor, ctx) => ctx.adsorbOrSetVelocity(actor, 1.2),
            4: (actor, ctx) => ctx.status.isBlocking = false,
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
            },
            attack2: {
                onTrap: {
                    preInput: 'onAttack'
                }
            },
            block: {
                onBlock: null
            },
        }
    }

    attack2: Move = {
        cast: 23,
        onEnter(actor, ctx) {
            playAnimCompatibility(actor, 'animation.shinobu.ai.attack2', 'animation.shinobu.ai.hold')
            ctx.lookAtTarget(actor)
        },
        timeline: {
            3: (actor, ctx) => ctx.adsorbOrSetVelocity(actor, 2),
            4: actor => playSoundAll('weapon.whoosh.thick.1', actor.pos),
            7: (actor, ctx) => ctx.selectFromSector(actor, {
                angle: 30,
                radius: 3.5,
                rotation: 15
            }).forEach(en => {
                ctx.attack(actor, en, {
                    damage: 14,
                    direction: 'middle',
                    knockback: 1,
                })
            }),
            15: (actor, ctx) => ctx.trap(actor),
        },
        transitions: {
            hurt: {
                onHurt: null
            },
            parried: {
                onParried: null
            },
            idle: {
                onEndOfLife: null
            },
            attack3: {
                onTrap: {
                    preInput: 'onAttack'
                }
            },
            blocked: {
                onBlocked: null
            },
        }
    }

    attack3: Move = {
        cast: 30,
        onEnter(actor, ctx) {
            playAnimCompatibility(actor, 'animation.shinobu.ai.attack3', 'animation.shinobu.ai.hold')
            ctx.lookAtTarget(actor)
        },
        timeline: {
            3: (actor, ctx) => ctx.adsorbOrSetVelocity(actor, 2),
            7: actor => playSoundAll('weapon.whoosh.thick.4', actor.pos),
            11: (actor, ctx) => ctx.selectFromSector(actor, {
                angle: 30,
                radius: 3,
                rotation: 15
            }).forEach(en => {
                ctx.attack(actor, en, {
                    damage: 25,
                    direction: 'vertical',
                    permeable: true,
                    knockback: 2,
                    stiffness: 800,
                })
            }),
        },
        transitions: {
            hurt: {
                onHurt: null
            },
            parried: {
                onParried: null
            },
            idle: {
                onEndOfLife: null
            },
        }
    }

    hilt: Move = {
        cast: 7,
        backswing: 17,
        onEnter(actor, ctx) {
            playAnimCompatibility(actor, 'animation.shinobu.ai.hilt', 'animation.shinobu.ai.hold')
            ctx.lookAtTarget(actor)
        },
        timeline: {
            5: (actor, ctx) => ctx.adsorbOrSetVelocity(actor, 1.2),
            10: (actor, ctx) => ctx.selectFromSector(actor, {
                radius: 2.5,
                angle: 30,
                rotation: 15
            }).forEach(en => ctx.attack(actor, en, {
                damage: 2,
                direction: 'middle',
                permeable: true,
                parryable: false,
                knockback: 0.2,
            })),
            12: (actor, ctx) => ctx.adsorbOrSetVelocity(actor, 1.2),
            18: (actor, ctx) => ctx.trap(actor),
        },
        transitions: {
            hurt: {
                onHurt: null
            },
            idle: {
                onEndOfLife: null
            },
            hiltCounter: {
                onTrap: {
                    preInput: 'onAttack'
                }
            }
        }
    }

    blockHilt: Move = {
        cast: 21,
        onEnter(actor, ctx) {
            playAnimCompatibility(actor, 'animation.shinobu.ai.counter.hilt', 'animation.shinobu.ai.hold')
            ctx.lookAtTarget(actor)
        },
        timeline: {
            2: (actor, ctx) => ctx.adsorbOrSetVelocity(actor, 1.2),
            7: (actor, ctx) => ctx.selectFromSector(actor, {
                radius: 2.5,
                angle: 30,
                rotation: 15
            }).forEach(en => ctx.attack(actor, en, {
                damage: 2,
                direction: 'middle',
                permeable: true,
                parryable: false,
                knockback: 0.2,
            })),
            9: (actor, ctx) => ctx.adsorbOrSetVelocity(actor, 1.2),
            15: (actor, ctx) => ctx.trap(actor),
        },
        transitions: {
            hurt: {
                onHurt: null
            },
            idle: {
                onEndOfLife: null
            },
            hiltCounter: {
                onTrap: {
                    preInput: 'onAttack'
                }
            }
        }
    }

    hiltCounter: Move = {
        cast: 16,
        onEnter(actor, ctx) {
            playAnimCompatibility(actor, 'animation.shinobu.ai.hilt.counter', 'animation.shinobu.ai.hold')
            ctx.lookAtTarget(actor)
        },
        timeline: {
            1: (actor, ctx) => {
                ctx.adsorbOrSetVelocity(actor, 1.2)
                playSoundAll('weapon.whoosh.thick.1', actor.pos)
            },
            3: (actor, ctx) => ctx.selectFromSector(actor, {
                radius: 3.2,
                angle: 60,
                rotation: 30
            }).forEach(en => ctx.attack(
                actor, en, {
                    damage: 16,
                    direction: 'vertical',
                }
            )),
            9: (actor, ctx) => ctx.trap(actor),
        },
        transitions: {
            hurt: {
                onHurt: null
            },
            idle: {
                onEndOfLife: null
            },
            attack2: {
                onTrap: {
                    preInput: 'onAttack'
                }
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