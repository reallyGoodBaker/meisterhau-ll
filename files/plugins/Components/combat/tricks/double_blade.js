/// <reference path="../basic/types.d.ts"/>

const { playAnim, playSoundAll } = require("../../../../../dev/plugins/Components/combat/basic")
const { DefaultMoves, DefaultTrickModule } = require("../../../../../dev/plugins/Components/combat/basic/default")

class DoubleBladeMoves extends DefaultMoves {
    constructor() {
        super()

        this.animations.parry = 'animation.double_blade.parry.left'
        this.animations.block = 'animation.double_blade.block.left'
        this.setup('resume')
    }

    /**
     * @type {Move}
     */
    idle = {
        cast: Infinity,
        onEnter(pl) {
            playAnim(pl, 'animation.double_blade.idle', 'animation.double_blade.idle')
        },
        transitions: {
            i2r: {
                onChangeSprinting: {
                    sprinting: true
                }
            },
            hurt: {
                onHurt: null
            },
            hold: {
                onLock: null
            },
        }
    }

    /**
     * @type {Move}
     */
    running = {
        cast: Infinity,
        onEnter(pl) {
            playAnim(pl, 'animation.double_blade.running', 'animation.double_blade.running')
        },
        transitions: {
            r2i: {
                onChangeSprinting: {
                    sprinting: false
                }
            },
            hurt: {
                onHurt: null
            },
        }
    }

    /** @type {Move} */
    i2r = {
        cast: 5,
        onEnter(pl) {
            playAnim(pl, 'animation.double_blade.i2r')
        },
        transitions: {
            running: {
                onEndOfLife: null
            },
            r2i: {
                onChangeSprinting: {
                    sprinting: false
                }
            }
        }
    }

    /** @type {Move} */
    r2i = {
        cast: 5,
        onEnter(pl) {
            playAnim(pl, 'animation.double_blade.r2i')
        },
        transitions: {
            idle: {
                onEndOfLife: null
            },
            i2r: {
                onChangeSprinting: {
                    sprinting: true
                }
            }
        }
    }

    /** @type {Move} */
    hold = {
        cast: Infinity,
        onEnter(pl) {
            playAnim(pl, 'animation.double_blade.hold', 'animation.double_blade.hold')
        },
        transitions: {
            hurt: {
                onHurt: null
            },
            idle: {
                onReleaseLock: null
            },
            startSweap: {
                onAttack: null
            }
        }
    }

    /** @type {Move} */
    resume = {
        transitions: {
            hold: {
                onEndOfLife: {
                    hasTarget: true
                }
            },
            idle: {
                onEndOfLife: {
                    hasTarget: false
                }
            }
        }
    }

    /** @type {Move} */
    startSweap = {
        cast: 8,
        backswing: 12,
        onEnter(pl, ctx) {
            ctx.freeze(pl)
            ctx.lookAtTarget(pl)
            playAnim(pl, 'animation.double_blade.single_left')
            ctx.status.isBlocking = true
            ctx.adsorbOrSetVelocity(pl, 0.5, 90, 1)
        },
        onLeave(pl, ctx) { 
            ctx.unfreeze(pl)
        },
        onAct(pl, ctx) {
            ctx.selectFromRange(pl, {
                angle: 40,
                radius: 2.2,
                rotation: -20
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 14,
                    damageType: 'entityAttack',
                    knockback: 0.8,
                })
            })
        },
        timeline: {
            3: (_, ctx) => ctx.status.isBlocking = false,
            4: (_, ctx) => ctx.adsorbOrSetVelocity(_, 1.4, 90, 1)
        },
        transitions: {
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
                    allowedState: 'backswing'
                }
            },
            blocked: {
                onBlocked: {
                    allowedState: 'backswing'
                }
            }
        }
    }

    /** @type {Move} */
    
}

class DoubleBlade extends DefaultTrickModule {
    constructor() {
        super(
            'rgb:double_blade',
            'idle',
            [
                'weapon:double_blade',
            ],
            new DoubleBladeMoves()
        )
    }
}

module.exports = new DoubleBlade()