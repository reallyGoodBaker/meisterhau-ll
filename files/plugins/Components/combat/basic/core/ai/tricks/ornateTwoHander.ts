import { entitySelector, playAnimCompatibility, playAnimEntity } from "@combat/basic"
import { DefaultMoves, DefaultTrickModule } from "@combat/basic/default"

// 不继承自DefaultMoves也可以，但是会少很多预设的状态
class OrnateTwoHanderMoves extends DefaultMoves {
    constructor() {
        super()
        //设置一个状态机的恢复点（所有预设的状态结束时都会切换到这个状态
        // 这个状态不是默认起始状态，注意
        this.setup<OrnateTwoHanderMoves>('idle')
    }

    // 定义idle状态
    idle: Move = {
        // 前摇，无限刻
        cast: Infinity,
        // 在这个状态时每一刻执行的代码
        onTick(pl, ctx) {
            // 让npc面向玩家
            mc.runcmdEx(`execute as ${entitySelector(pl as Entity)} at @s run tp ~~~ facing @p`)
        },
        // 状态转换
        transitions: {
            // 转换到hurt状态
            hurt: {
                // 转换条件是 onHurt ，没有多余参数
                onHurt: null
            },
            left: {
                onAttack: null
            },
            top: {
                onSneak: null
            },
            right: {
                onUseItem: null
            }
        }
    }

    left: Move = {
        cast: 27,
        onEnter(pl, ctx) {
            mc.runcmdEx(`execute as ${entitySelector(pl as Entity)} at @s run tp ~~~ facing @p`)
            playAnimEntity(pl as Entity, 'animation.weapon.ai.guard.attack.left')
            ctx.status.hegemony = true
        },
        onLeave(pl, ctx) {
            ctx.status.hegemony = false
        },
        timeline: {
            2: (pl, ctx) => {
                ctx.setVelocity(pl, 90, 0.5, 0)
            },
            5: (pl, ctx) => {
                ctx.setVelocity(pl, 90, 1, 0)
            },
            10: (pl, ctx) => {
                ctx.setVelocity(pl, 90, 1, 0)
            },
            12: (pl, ctx) => {
                ctx.selectFromRange(pl, {
                    angle: 120,
                    radius: 3,
                    rotation: -60
                }).forEach(e => {
                    ctx.attack(pl, e, {
                        damage: 20,
                        direction: 'left',
                    })
                })
            },
            20: (_, ctx) => ctx.trap(_),
        },
        transitions: {
            hurt: {
                onHurt: null
            },
            idle: {
                onEndOfLife: null
            },
            parried: {
                onParried: null
            },
            left2: {
                onTrap: {
                    preInput: 'onAttack'
                }
            }
        }
    }

    top: Move = {
        cast: 27,
        onEnter(pl, ctx) {
            mc.runcmdEx(`execute as ${entitySelector(pl as Entity)} at @s run tp ~~~ facing @p`)
            playAnimEntity(pl as Entity, 'animation.weapon.ai.guard.attack.top')
        },
        timeline: {
            2: (pl, ctx) => {
                ctx.setVelocity(pl, 90, 0.5, 0)
            },
            5: (pl, ctx) => {
                ctx.setVelocity(pl, 90, 1, 0)
            },
            9: (pl, ctx) => {
              ctx.trap(pl)  
            },
            10: (pl, ctx) => {
                ctx.setVelocity(pl, 90, 1, 0)
            },
            14: (pl, ctx) => {
                ctx.selectFromRange(pl, {
                    angle: 60,
                    radius: 4,
                    rotation: -30
                }).forEach(e => {
                    ctx.attack(pl, e, {
                        damage: 20,
                        direction: 'vertical',
                        permeable: true,
                    })
                })
            }
        },
        transitions: {
            hurt: {
                onHurt: null
            },
            idle: {
                onEndOfLife: null,
                onTrap: {
                    preInput: 'onFeint'
                }
            },
            parried: {
                onParried: null
            }
        }
    }

    right: Move = {
        cast: 27,
        onEnter(pl, ctx) {
            mc.runcmdEx(`execute as ${entitySelector(pl as Entity)} at @s run tp ~~~ facing @p`)
            playAnimEntity(pl as Entity, 'animation.weapon.ai.guard.attack.right')
        },
        onLeave(pl, ctx) {
            ctx.status.hegemony = false
        },
        timeline: {
            2: (pl, ctx) => {
                ctx.setVelocity(pl, 90, 0.5, 0)
            },
            5: (pl, ctx) => {
                ctx.setVelocity(pl, 90, 1, 0)
            },
            10: (pl, ctx) => {
                ctx.setVelocity(pl, 90, 1, 0)
            },
            14: (pl, ctx) => {
                ctx.selectFromRange(pl, {
                    angle: 120,
                    radius: 3,
                    rotation: -60
                }).forEach(e => {
                    ctx.attack(pl, e, {
                        damage: 20,
                        direction: 'right',
                    })
                })
            },
            7: (_, ctx) => ctx.status.hegemony = true,
            15: (_, ctx) => ctx.status.hegemony = false,
            20: (_, ctx) => ctx.trap(_),
        },
        transitions: {
            hurt: {
                onHurt: null
            },
            idle: {
                onEndOfLife: null
            },
            parried: {
                onParried: null
            },
            right2: {
                onTrap: {
                    preInput: 'onUseItem'
                }
            }
        }
    }

    left2: Move = {
        cast: 30,
        onEnter(pl, ctx) {
            mc.runcmdEx(`execute as ${entitySelector(pl as Entity)} at @s run tp ~~~ facing @p`)
            playAnimCompatibility(pl, 'animation.weapon.ai.guard.attack.left2', 'left2')
            ctx.status.hegemony = true
        },
        onLeave(pl, ctx) {
            ctx.status.hegemony = false
        },
        timeline: {
            12: (pl, ctx) => {
                ctx.selectFromRange(pl, {
                    angle: 180,
                    radius: 3,
                    rotation: -90
                }).forEach(e => {
                    ctx.attack(pl, e, {
                        damage: 28,
                        direction: 'left',
                    })
                })
            },
            4: (pl, ctx) => {
                ctx.setVelocity(pl, 90, 0.5, 0)
            },
            11: (pl, ctx) => {
                ctx.setVelocity(pl, 90, 1, 0)
            }
        },
        transitions: {
            hurt: {
                onInterrupted: null
            },
            idle: {
                onEndOfLife: null
            },
            parried: {
                onParried: null
            }
        }
    }

    right2: Move = {
        cast: 28,
        onEnter(pl, ctx) {
            mc.runcmdEx(`execute as ${entitySelector(pl as Entity)} at @s run tp ~~~ facing @p`)
            playAnimCompatibility(pl, 'animation.weapon.ai.guard.attack.right2', 'left2')
            ctx.status.hegemony = true
        },
        onLeave(pl, ctx) {
            ctx.status.hegemony = false
        },
        timeline: {
            9: (pl, ctx) => {
                ctx.selectFromRange(pl, {
                    angle: 180,
                    radius: 3,
                    rotation: -90
                }).forEach(e => {
                    ctx.attack(pl, e, {
                        damage: 20,
                        direction: 'right',
                    })
                })
            },
            4: (pl, ctx) => {
                ctx.setVelocity(pl, 90, 0.5, 0)
            },
            7: (pl, ctx) => {
                ctx.setVelocity(pl, 90, 0.5, 0)
            }
        },
        transitions: {
            hurt: {
                onInterrupted: null
            },
            idle: {
                onEndOfLife: null
            },
            parried: {
                onParried: null
            }
        }
    }
}

class OrnateTwoHander extends DefaultTrickModule {
    constructor() {
        super(
            // 只要不重复可以随便写
            'rgb:ai/ornate_two_hander',
            // 动作模组的默认起始状态
            'idle',
            [ 'crossover:ornate_two_hander' ],
            new OrnateTwoHanderMoves()
        )
    }
}

export const tricks = new OrnateTwoHander()