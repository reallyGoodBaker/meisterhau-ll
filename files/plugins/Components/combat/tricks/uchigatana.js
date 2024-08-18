const { playAnim, playSoundAll } = require("../basic/index")
const { DefaultMoves, DefaultTrickModule } = require('../basic/default')

class UchigatanaMoves extends DefaultMoves {
    /**
     * @type {Move}
     */
    hold = {
        cast: Infinity,
        onEnter(pl, ctx) {
            ctx.releaseTarget(pl.xuid)
            playAnim(pl, 'animation.weapon.uchigatana.hold', 'animation.weapon.uchigatana.hold')
        },
        transitions: {
            kamae: {
                onLock: null,
            },
        }
    }

    /**
     * @type {Move}
     */
    kamae = {
        cast: Infinity,
        onEnter(pl) {
            playAnim(pl, 'animation.weapon.uchigatana.kamae', 'animation.weapon.uchigatana.kamae')
        },
        transitions: {
            hold: {
                onReleaseLock: null,
                onChangeSprinting: null,
                onJump: null,
            },
            hurt: {
                onHurt: {
                    allowedState: 'both'
                }
            },
            attack1: {
                onAttack: {
                    hasTarget: true
                },
            },
        }
    }

    /**
     * @type {Move}
     */
    resume = {
        transitions: {
            hold: {
                onEndOfLife: {
                    hasTarget: false
                }
            },
            kamae: {
                onEndOfLife: {
                    hasTarget: true
                }
            },
            hurt: {
                onHurt: {
                    allowedState: 'both'
                }
            },
        }
    }

    /**
     * @type {Move}
     */
    attack1 = {
        cast: 8,
        backswing: 13,
        onEnter(pl, ctx) {
            ctx.status.isBlocking = true
            ctx.freeze(pl)
            ctx.lookAtTarget(pl)
            playAnim(pl, 'animation.weapon.uchigatana.attack1')
        },
        onAct(pl, ctx) {
            ctx.selectFromRange(pl).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 12,
                })
            })
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
            ctx.status.isBlocking = false
        },
        timeline: {
            0: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 0.5, 90),
            4: (_, ctx) => ctx.status.isBlocking = false,
            5: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 1.5, 90),
            12: (pl, ctx) => ctx.trap(pl)
        },
        transitions: {
            block: {
                onBlock: null
            },
            resume: {
                onEndOfLife: null
            },
            hurt: {
                onHurt: {
                    allowedState: 'both'
                }
            },
            attack2: {
                onTrap: {
                    preInput: 'onUseItem',
                }
            },
            parried: {
                onParried: {
                    allowedState: 'both'
                }
            },
            blocked: {
                onBlocked: {
                    allowedState: 'both'
                }
            },
        }
    }

    /**
     * @type {Move}
     */
    attack2 = {
        cast: 12,
        backswing: 14,
        onEnter(pl, ctx) {
            ctx.freeze(pl)
            ctx.lookAtTarget(pl)
            playAnim(pl, 'animation.weapon.uchigatana.attack2')
        },
        onAct(pl, ctx) {
            ctx.selectFromRange(pl, {
                radius: 3,
                angle: 180,
                rotation: -90,
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 24,
                })
            })
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
        },
        timeline: {
            3: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 1, 90),
            8: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 2.2, 90),
        },
        transitions: {
            block: {
                onBlock: null
            },
            resume: {
                onEndOfLife: null
            },
            hurt: {
                onHurt: {
                    allowedState: 'both'
                }
            },
            parried: {
                onParried: {
                    allowedState: 'both'
                }
            },
        }
    }

    constructor() {
        super()

        this.setup('resume')
    }
}

class UchigatanaModule extends DefaultTrickModule {
    constructor() {
        super(
            'rgb39.weapon.empty_hand',
            'hold',
            [ 'weapon:uchigatana' ],
            new UchigatanaMoves()
        )
    }
}

/**
 * @type {TrickModule}
 */
exports.tricks = new UchigatanaModule()