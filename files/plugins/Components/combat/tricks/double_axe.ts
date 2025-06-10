import { playAnimCompatibility } from "@combat/basic"
import { DefaultMoves, DefaultTrickModule } from "@combat/basic/default"

class DoubleAxeMoves extends DefaultMoves {
    constructor() {
        super()

        this.setup<DoubleAxeMoves>('resume')
    }

    resume: Move = {
        transitions: {
            idle: {
                onEndOfLife: {
                    hasTarget: false
                }
            },
            hold: {
                onEndOfLife: {
                    hasTarget: true
                }
            }
        }
    }

    idle: Move = {
        cast: Infinity,
        onEnter(pl, ctx) {
            playAnimCompatibility(pl, 'animation.meisterhau.double_axe.idle', 'animation.meisterhau.double_axe.idle')
        },
        transitions: {
            hurt: {
                onHurt: null
            },
            hold: {
                onLock: null
            },
        }
    }


    hold: Move = {
        cast: Infinity,
        onEnter(pl, ctx) {
            playAnimCompatibility(pl, 'animation.meisterhau.double_axe.hold', 'animation.meisterhau.double_axe.hold')
        },
        transitions: {
            hurt: {
                onHurt: null
            },
            idle: {
                onReleaseLock: null
            },
            attackStart: {
                onAttack: null
            }
        }
    }

    attackStart: Move = {
        cast: 24,
        onEnter(pl, ctx) {
            playAnimCompatibility(pl, 'animation.meisterhau.double_axe.light.start', 'animation.meisterhau.double_axe.light.start')
            ctx.lookAtTarget(pl)
            ctx.freeze(pl)
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
        },
        transitions: {
            resume: {
                onEndOfLife: null
            },
            hurt: {
                onHurt: null
            },
            parried: {
                onParried: null
            },
            blocked: {
                onBlocked: null
            },
            attack1: {
                onTrap: {
                    preInput: 'onAttack'
                }
            }
        },
        timeline: {
            2: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 1.5),
            8: (pl, ctx) => ctx.selectFromRange(pl, {
                angle: 90,
                radius: 2.5,
                rotation: 45
            }).forEach(en => ctx.attack(pl, en, {
                damage: 16,
                knockback: 0.2,
                direction: 'vertical',
            })),
            17: (pl, ctx) => ctx.trap(pl)
        }
    }

    attack1: Move = {
        cast: 24,
        onEnter(pl, ctx) {
            playAnimCompatibility(pl, 'animation.meisterhau.double_axe.light.1', 'animation.meisterhau.double_axe.light.1')
            ctx.lookAtTarget(pl)
            ctx.freeze(pl)
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
            ctx.status.hegemony = false
        },
        transitions: {
            resume: {
                onEndOfLife: null
            },
            hurt: {
                onInterrupted: null
            },
            parried: {
                onParried: null
            },
            blocked: {
                onBlocked: null
            },
            attack2: {
                onTrap: {
                    preInput: 'onAttack'
                }
            }
        },
        timeline: {
            2: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 1.5),
            5: (_, ctx) => ctx.status.hegemony = true,
            15: (_, ctx) => ctx.status.hegemony = false,
            8: (pl, ctx) => ctx.selectFromRange(pl, {
                angle: 90,
                radius: 2.5,
                rotation: 45
            }).forEach(en => ctx.attack(pl, en, {
                damage: 16,
                knockback: 0.2,
                direction: 'vertical',
            })),
            17: (pl, ctx) => ctx.trap(pl)
        }
    }

    attack2: Move = {
        cast: 24,
        onEnter(pl, ctx) {
            playAnimCompatibility(pl, 'animation.meisterhau.double_axe.light.2', 'animation.meisterhau.double_axe.light.2')
            ctx.lookAtTarget(pl)
            ctx.freeze(pl)
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
            ctx.status.hegemony = false
        },
        transitions: {
            resume: {
                onEndOfLife: null
            },
            hurt: {
                onInterrupted: null
            },
            parried: {
                onParried: null
            },
            blocked: {
                onBlocked: null
            },
            attack1: {
                onTrap: {
                    preInput: 'onAttack'
                }
            }
        },
        timeline: {
            2: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 1.5),
            5: (_, ctx) => ctx.status.hegemony = true,
            15: (_, ctx) => ctx.status.hegemony = false,
            8: (pl, ctx) => ctx.selectFromRange(pl, {
                angle: 90,
                radius: 2.5,
                rotation: 45
            }).forEach(en => ctx.attack(pl, en, {
                damage: 16,
                knockback: 0.2,
                direction: 'vertical',
            })),
            17: (pl, ctx) => ctx.trap(pl)
        }
    }

}

class DoubleAxeTrick extends DefaultTrickModule {
    constructor() {
        super(
            'rgb39:double_axe',
            'idle',
            [ 'weapon:double_diamond_axe' ],
            new DoubleAxeMoves(),
        )
    }
}

export const tricks = new DoubleAxeTrick()