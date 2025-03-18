import { entitySelector, playAnimEntity } from "@combat/basic"
import { DefaultMoves, DefaultTrickModule } from "@combat/basic/default"

class OrnateTwoHanderMoves extends DefaultMoves {
    constructor() {
        super()

        this.setup<OrnateTwoHanderMoves>('idle')
    }

    idle: Move = {
        cast: Infinity,
        onTick(pl, ctx) {
            mc.runcmdEx(`execute as ${entitySelector(pl as Entity)} at @s run tp ~~~ facing @p`)
        },
        transitions: {
            hurt: {
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
            playAnimEntity(pl as Entity, 'animation.weapon.ai.guard.attack.left')
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
                        direction: 'left',
                        trace: true,
                    })
                })
            }
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
            }
        }
    }

    top: Move = {
        cast: 27,
        onEnter(pl, ctx) {
            playAnimEntity(pl as Entity, 'animation.weapon.ai.guard.attack.top')
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
                    angle: 60,
                    radius: 3.3,
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
                onEndOfLife: null
            },
            parried: {
                onParried: null
            }
        }
    }

    right: Move = {
        cast: 27,
        onEnter(pl, ctx) {
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
            }
        }
    }
}

class OrnateTwoHander extends DefaultTrickModule {
    constructor() {
        super(
            'rgb:ai/ornate_two_hander',
            'idle',
            [ 'crossover:ornate_two_hander' ],
            new OrnateTwoHanderMoves()
        )
    }
}

export const tricks = new OrnateTwoHander()