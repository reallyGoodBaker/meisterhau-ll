import { playAnimCompatibility } from "@combat/basic"
import { DefaultMoves, DefaultTrickModule } from "@combat/basic/default"

class OneHandedMoves extends DefaultMoves {
    constructor() {
        super()

        this.setup<OneHandedMoves>('resume')
        this.animations.block.left = 'animation.onhanded.block'
    }

    resume: Move = {
        transitions: {
            idle: {
                onEndOfLife: {
                    hasTarget: false
                }
            },
            holding: {
                onEndOfLife: {
                    hasTarget: true
                }
            },
        }
    }

    idle: Move = {
        cast: Infinity,
        onEnter(pl, ctx) {
            playAnimCompatibility(pl, 'animation.onhanded.idle', 'animation.onhanded.idle')
        },
        transitions: {
            hurt: {
                onHurt: null,
            },
            i2r: {
                onChangeSprinting: {
                    sprinting: true
                }
            },
            holding: {
                onLock: null
            }
        }
    }

    running: Move = {
        cast: Infinity,
        onEnter(pl, ctx) {
            playAnimCompatibility(pl, 'animation.onhanded.running', 'animation.onhanded.running')
        },
        transitions: {
            r2i: {
                onChangeSprinting: {
                    sprinting: false
                }
            },
            hurt: {
                onHurt: null,
            },
        }
    }

    i2r: Move = {
        cast: 4,
        onEnter(pl, ctx) {
            playAnimCompatibility(pl, 'animation.onhanded.i2r', 'animation.onhanded.i2r')
        },
        transitions: {
            hurt: {
                onHurt: null,
            },
            running: {
                onEndOfLife: null
            },
            r2i: {
                onChangeSprinting: {
                    sprinting: false
                }
            },
        }
    }

    r2i: Move = {
        cast: 4,
        onEnter(pl, ctx) {
            playAnimCompatibility(pl, 'animation.onhanded.r2i', 'animation.onhanded.r2i')
        },
        transitions: {
            hurt: {
                onHurt: null,
            },
            idle: {
                onEndOfLife: null
            },
            r2i: {
                onChangeSprinting: {
                    sprinting: true
                }
            }
        }
    }

    holding: Move = {
        cast: Infinity,
        onEnter(pl, ctx) {
            playAnimCompatibility(pl, 'animation.onhanded.holding', 'animation.onhanded.holding')
        },
        transitions: {
            hurt: {
                onHurt: null,
            },
            idle: {
                onEndOfLife: {
                    hasTarget: false
                }
            },
            i2r: {
                onChangeSprinting: {
                    sprinting: true
                }
            },
            attack1: {
                onAttack: null
            },
        }
    }

    attack1: Move = {
        cast: 12,
        backswing: 6,
        onEnter(pl, ctx) {
            ctx.lookAtTarget(pl)
            playAnimCompatibility(pl, 'animation.onhanded.attack1', 'animation.onhanded.attack1')
            ctx.freeze(pl)
            ctx.status.isBlocking = true
        },
        onLeave(pl, ctx) {
            ctx.status.isBlocking = false
            ctx.unfreeze(pl)
        },
        onAct(pl, ctx) {
            ctx.trap(pl)
        },
        transitions: {
            block: {
                onBlock: null
            },
            resume: {
                onEndOfLife: null
            },
            hurt: {
                onHurt: null,
            },
            blocked: {
                onBlocked: null
            },
            parried: {
                onParried: null
            },
            attack2: {
                onTrap: {
                    preInput: 'onAttack'
                }
            },
        },
        timeline: {
            4: (_, ctx) => ctx.status.isBlocking = false,
            6: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 0.5),
            7: (pl, ctx) => ctx.selectFromSector(pl, {
                radius: 3,
                angle: 30,
                rotation: 15
            }).forEach(en => ctx.attack(pl, en, {
                damage: 13,
                knockback: 0.2,
                direction: 'middle'
            }))
        }
    }

    attack2: Move = {
        cast: 20,
        onEnter(pl, ctx) {
            ctx.lookAtTarget(pl)
            playAnimCompatibility(pl, 'animation.onhanded.attack2', 'animation.onhanded.attack2')
            ctx.freeze(pl)
            ctx.adsorbOrSetVelocity(pl, 1)
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
        },
        transitions: {
            resume: {
                onEndOfLife: null
            },
            hurt: {
                onHurt: null,
            },
            blocked: {
                onBlocked: null
            },
            parried: {
                onParried: null
            }
        },
        timeline: {
            6: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 1),
            8: (pl, ctx) => ctx.selectFromSector(pl, {
                radius: 3,
            }).forEach(en => ctx.attack(pl, en, {
                damage: 14,
                permeable: true,
                direction: 'vertical',
            })),
            12: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 0.5),
        }
    }
}

class OneHandedSword extends DefaultTrickModule {
    constructor() {
        super(
            'meisterhau:onehanded',
            'idle',
            [
                'weapon:shiver_blade'
            ],
            new OneHandedMoves()
        )
    }
}

export const tricks = new OneHandedSword()