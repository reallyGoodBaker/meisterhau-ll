const { playAnim, playSoundAll, DEFAULT_POSTURE_SPEED } = require("../basic/index")
const { DefaultMoves, DefaultTrickModule } = require('../basic/default')
const { constrictCalc } = require('../../utils/math')
const { hud } = require('../basic/hud')

class MoonGlaiveTricks extends DefaultTrickModule {
    constructor() {
        super(
            'rgb39.weapon.moon_glaive',
            'hold',
            [ 'weapon:moon_glaive' ],
            new MoonGlaiveMoves()
        )
    }
}

class MoonGlaiveMoves extends DefaultMoves {

    constructor() {
        super()

        this.setup('backToDefault')
        this.animations.parry.left = 'animation.weapon.moon_glaive.parry'

        this.setTransition('parry', 'parryKnock', {
            onTrap: {
                tag: 'parryCounter',
                preInput: 'onAttack',
                allowedState: 'both'
            }
        })

        this.setTransition('parry', 'parryChop', {
            onTrap: {
                tag: 'parryCounter',
                preInput: 'onUseItem',
                allowedState: 'both'
            }
        })
    }

    /**
     * @type {Move}
     */
    hold = {
        cast: Infinity,
        onEnter(pl, ctx) {
            ctx.releaseTarget(pl.xuid)
            playAnim(pl, 'animation.weapon.moon_glaive.hold', 'animation.weapon.moon_glaive.hold')
        },
        transitions: {
            hurt: {
                onHurt: null
            },
            running: {
                onChangeSprinting: {
                    sprinting: true
                }
            },
            holdLocked: {
                onLock: {
                    isOnGround: true
                }
            },
        }
    }

    /**
     * @type {Move}
     */
    running = {
        cast: Infinity,
        onEnter(pl, ctx) {
            ctx.releaseTarget(pl.xuid)
            playAnim(pl, 'animation.weapon.moon_glaive.running', 'animation.weapon.moon_glaive.running')
        },
        transitions: {
            hurt: {
                onHurt: null
            },
            hold: {
                onChangeSprinting: {
                    sprinting: false
                }
            },
            holdLocked: {
                onLock: {
                    isOnGround: true,
                }
            },
        }
    }

    /**
     * @type {Move}
     */
    retentionSpinning = {
        cast: 13,
        backswing: 14,
        onEnter(pl, ctx) {
            ctx.setSpeed(pl, 0)
            ctx.camera(pl, false)
            playAnim(pl, 'animation.weapon.moon_glaive.retention.negative_spinning')
            ctx.adsorbOrSetVelocity(pl, 1, 90, 1)
        },
        onAct(pl, ctx) {
            ctx.selectFromRange(pl, {
                radius: 2.5,
                angle: 120,
                rotation: -60
            }).forEach(en => ctx.attack(pl, en, {
                damage: 24,
                knockback: 2.5,
                permeable: true,
                direction: 'right'
            }))
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
            ctx.setSpeed(pl, DEFAULT_POSTURE_SPEED)
        },
        timeline: {
            4: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 1, 90, 1),
            8: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 1.5, 120, 1),
            26: (pl, ctx) => ctx.trap(pl),
        },
        transitions: {
            hurt: {
                onHurt: { allowedState: 'both' }
            },
            parried: {
                onParried: { allowedState: 'both' }
            },
            dodge: {
                onTrap: {
                    preInput: 'onUseItem',
                }
            },
            retention: {
                onEndOfLife: {
                    hasTarget: true
                }
            },
            hold: {
                onEndOfLife: {
                    hasTarget: false
                }
            },
        }
    }

    /**
     * @type {Move}
     */
    retention = {
        cast: Infinity,
        onEnter(pl, ctx) {
            ctx.freeze(pl)
            playAnim(pl, 'animation.weapon.moon_glaive.retention', 'animation.weapon.moon_glaive.retention')
        },
        onTick(pl, ctx) {
            ctx.lookAtTarget(pl)
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
        },
        timeline: {
            1: (pl, ctx) => ctx.trap(pl)
        },
        transitions: {
            hurt: {
                onHurt: null
            },
            hold: {
                onReleaseLock: null
            },
            retentionSpinning: {
                onAttack: null
            },
            dodge: {
                onUseItem: null
            },
            fromRetention: {
                onSneak: { isSneaking: false },
                onTrap: { isSneaking: false },
            }
        }
    }

    /**
     * @type {Move}
     */
    toRetention = {
        cast: 5,
        onEnter(pl, ctx) {
            ctx.camera(pl, false)
            playAnim(pl, 'animation.weapon.moon_glaive.to_retention')
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
        },
        timeline: {
            4: (pl, ctx) => ctx.trap(pl)
        },
        transitions: {
            hurt: {
                onHurt: null
            },
            retention: {
                onEndOfLife: {
                    isSneaking: true
                },
            },
            fromRetention: {
                onEndOfLife: {
                    isSneaking: false
                }
            },
            dodge: {
                onTrap: {
                    preInput: 'onUseItem'
                }
            },
        }
    }

    /**
     * @type {Move}
     */
    fromRetention = {
        cast: 5,
        onEnter(pl, ctx) {
            ctx.camera(pl, false)
            playAnim(pl, 'animation.weapon.moon_glaive.from_retention')
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
        },
        transitions: {
            hurt: {
                onHurt: null
            },
            backToDefault: {
                onEndOfLife: null
            }
        }
    }

    /**
     * @type {Move}
     */
    holdLocked = {
        cast: Infinity,
        onEnter(pl, ctx) {
            pl.setSprinting(false)
            playAnim(pl, 'animation.weapon.moon_glaive.hold_locked', 'animation.weapon.moon_glaive.hold_locked')
            ctx.trap(pl)
        },
        transitions: {
            toRetention: {
                onSneak: {
                    isSneaking: true,
                },
                onTrap: {
                    isSneaking: true
                }
            },
            hold: {
                onReleaseLock: null,
                onJump: null
            },
            running: {
                onChangeSprinting: {
                    sprinting: true
                }
            },
            push: {
                onAttack: null
            },
            sweap: {
                onUseItem: null,
            },
            hurt: {
                onHurt: { allowedState: 'both' }
            }
        }
    }

    /**
     * @type {Move}
     */
    backToDefault = {
        transitions: {
            holdLocked: {
                onEndOfLife: {
                    hasTarget: true
                }
            },
            hold: {
                onEndOfLife: {
                    hasTarget: false
                }
            },
            hurt: {
                onHurt: null
            },
        }
    }

    /**
     * @type {Move}
     */
    dodge = {
        cast: 11,
        onEnter(pl, ctx) {
            ctx.status.isDodging = true
            ctx.setSpeed(pl, 0)
            ctx.camera(pl)
            playAnim(pl, 'animation.weapon.moon_glaive.dodge')
            ctx.setVelocity(pl, -90, 2.5, 0)
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
            ctx.setSpeed(pl, DEFAULT_POSTURE_SPEED)
        },
        timeline: {
            4: (pl, ctx) => ctx.status.isDodging = false,
            10: (pl, ctx) => ctx.trap(pl)
        },
        transitions: {
            retention: {
                onEndOfLife: {
                    hasTarget: true
                }
            },
            backToDefault: {
                onEndOfLife: {
                    hasTarget: false
                }
            },
            retentionSpinning: {
                onTrap: {
                    preInput: 'onAttack'
                }
            },
            hurt: {
                onHurt: {
                    allowedState: 'both'
                }
            }
        }
    }

    /**
     * @type {Move}
     */
    push = {
        cast: 9,
        backswing: 10,
        onEnter(pl, ctx) {
            ctx.freeze(pl)
            ctx.lookAtTarget(pl)
            playAnim(pl, 'animation.weapon.moon_glaive.push')
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
        },
        onAct(pl, ctx) {
            ctx.selectFromRange(pl, {
                angle: 50,
                rotation: -25,
                radius: 2.6,
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 16,
                    direction: 'middle'
                })
            })
        },
        timeline: {
            0: (_, c) => c.status.isBlocking = true,
            4: (_, c) => c.status.isBlocking = false,
            7: (pl, ctx) => ctx.adsorbToTarget(pl, 2),
            15: (pl, ctx) => ctx.trap(pl)
        },
        transitions: {
            backToDefault: {
                onEndOfLife: null
            },
            chop: {
                onTrap: {
                    preInput: 'onAttack',
                    hasTarget: true,
                    allowedState: 'both',
                }
            },
            verticalChop : {
                onTrap: {
                    preInput: 'onUseItem',
                    hasTarget: true,
                    allowedState: 'both',
                }
            },
            parried: {
                onParried: {
                    allowedState: 'both',
                }
            },
            hurt: {
                onHurt: { allowedState: 'both' }
            },
            blocked: {
                onBlocked: {
                    allowedState: 'backswing',
                }
            },
        }
    }

    /**
     * @type {Move}
     */
    chop = {
        cast: 10,
        backswing: 8,
        onEnter(pl, ctx) {
            ctx.freeze(pl)
            ctx.lookAtTarget(pl)
            playAnim(pl, 'animation.weapon.moon_glaive.chop')
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
        },
        timeline: {
            4: (pl, ctx) => ctx.adsorbToTarget(pl, 1.2),
            8: (pl, ctx) => ctx.adsorbToTarget(pl, 1.2),
            11: (pl, ctx) => ctx.adsorbToTarget(pl, 0.5),
        },
        onAct(pl, ctx) {
            ctx.selectFromRange(pl, {
                angle: 70,
                rotation: -35,
                radius: 2.6,
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 18,
                    direction: 'vertical'
                })
            })
        },
        transitions: {
            backToDefault: {
                onEndOfLife: null
            },
            hurt: {
                onHurt: null,
            },
            parried: {
                onParried: {
                    allowedState: 'both',
                }
            },
        }
    }

    /**
     * @type {Move}
     */
    verticalChop = {
        cast: 15,
        backswing: 10,
        onEnter(pl, ctx) {
            ctx.status.hegemony = true
            ctx.freeze(pl)
            ctx.lookAtTarget(pl)
            ctx.status.repulsible = false
            playAnim(pl, 'animation.weapon.moon_glaive.vertical_chop')
        },
        onLeave(pl, ctx) {
            ctx.status.hegemony = true
            ctx.status.repulsible = true
            ctx.unfreeze(pl)
        },
        timeline: {
            3: (pl, ctx) => ctx.adsorbToTarget(pl, 2),
            6: (pl, ctx) => ctx.adsorbToTarget(pl, 4),
            13: (pl, ctx) => ctx.trap(pl),
            18: (pl, ctx) => ctx.adsorbToTarget(pl, 0.5),
        },
        onAct(pl, ctx) {
            ctx.selectFromRange(pl, {
                angle: 46,
                rotation: -23,
                radius: 2.8,
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 32,
                    permeable: true,
                    knockback: 1,
                    direction: 'vertical',
                })
            })
        },
        transitions: {
            backToDefault: {
                onEndOfLife: null,
                onTrap: {
                    preInput: 'onFeint',

                },
            },
            parried: {
                onParried: {
                    allowedState: 'both',
                }
            },
            hurt: {
                onInterrupted: {
                    allowedState: 'both'
                }
            },
        }
    }

    /**
     * @type {Move}
     */
    sweap = {
        cast: 16,
        backswing: 14,
        onEnter(pl, ctx) {
            ctx.freeze(pl)
            ctx.lookAtTarget(pl)
            playAnim(pl, 'animation.weapon.moon_glaive.heavy_sweap')
            ctx.status.isWaitingParry = true
        },
        onLeave(pl, ctx) {
            ctx.status.repulsible = true
            ctx.unfreeze(pl)
        },
        onAct(pl, ctx) {
            ctx.selectFromRange(pl, {
                angle: 90,
                rotation: -50,
                radius: 2.8,
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 22,
                    knockback: 0.4,
                    direction: 'left',
                })
            })
        },
        timeline: {
            2: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 1, 90),
            3: (_, ctx) => ctx.status.isWaitingParry = false,
            6: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 0.5, 90),
            8: (pl, ctx) => ctx.trap(pl, { tag: 'feint' }),
            12: (_, ctx) => ctx.status.repulsible = false,
            14: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 2, 90),
            21: (pl, ctx) => {
                ctx.status.repulsible = true
                ctx.trap(pl, { tag: 'combo' })
            },
        },
        transitions: {
            backToDefault: {
                onEndOfLife: null,
                onTrap: {
                    tag: 'feint',
                    preInput: 'onFeint',
                },
            },
            sweapCombo: {
                onTrap: {
                    tag: 'combo',
                    preInput: 'onAttack',
                    allowedState: 'backswing',
                }
            },
            sweapComboSpinning: {
                onTrap: {
                    tag: 'combo',
                    preInput: 'onUseItem',
                    allowedState: 'backswing',
                }
            },
            hurt: {
                onHurt: {
                    repulsible: true,
                }
            },
            parried: {
                onParried: {
                    allowedState: 'both',
                }
            },
            parry: {
                onParry: {
                    allowedState: 'both',
                }
            },
        }
    }

    /**
     * @type {Move}
     */
    sweapCombo = {
        cast: 10,
        backswing: 8,
        onEnter(pl, ctx) {
            ctx.freeze(pl)
            ctx.lookAtTarget(pl)
            playAnim(pl, 'animation.weapon.moon_glaive.chop.combo')
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
        },
        timeline: {
            4: (pl, ctx) => ctx.adsorbToTarget(pl, 1.2),
            8: (pl, ctx) => ctx.adsorbToTarget(pl, 1.2),
            11: (pl, ctx) => ctx.adsorbToTarget(pl, 0.5),
        },
        onAct(pl, ctx) {
            ctx.selectFromRange(pl, {
                angle: 70,
                rotation: -35,
                radius: 2.6,
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 18,
                    direction: 'right',
                })
            })
        },
        transitions: {
            backToDefault: {
                onEndOfLife: null
            },
            hurt: {
                onHurt: null,
            },
            parried: {
                onParried: {
                    allowedState: 'both',
                }
            },
        }
    }

    /**
     * @type {Move}
     */
    sweapComboSpinning = {
        cast: 15,
        backswing: 14,
        onEnter(pl, ctx) {
            ctx.status.hegemony = true
            ctx.freeze(pl)
            ctx.lookAtTarget(pl)
            playAnim(pl, 'animation.weapon.moon_glaive.positive_spinning')
        },
        onLeave(pl, ctx) {
            ctx.status.hegemony = false
            ctx.unfreeze(pl)
        },
        onAct(pl, ctx) {
            ctx.selectFromRange(pl, {
                angle: 120,
                rotation: -60,
                radius: 2.8,
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 30,
                    knockback: 1.5,
                    permeable: true,
                    direction: 'left',
                })
            })
        },
        timeline: {
            0: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 1, 90),
            8: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 4, 90),
            13: (pl, ctx) => ctx.trap(pl),
        },
        transitions: {
            parried: {
                onParried: {
                    allowedState: 'both'
                },
            },
            backToDefault: {
                onEndOfLife: null,
                onTrap: {
                    preInput: 'onFeint',
                }
            },
            hurt: {
                onInterrupted: {
                    allowedState: 'both'
                }
            }
        }
    }

    /**
     * @type {Move}
     */
    parryKnock = {
        cast: 7,
        backswing: 11,
        onEnter(pl, ctx) {
            ctx.freeze(pl)
            ctx.lookAtTarget(pl)
            playAnim(pl, 'animation.weapon.moon_glaive.parry.knock')
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
        },
        onAct(pl, ctx) {
            ctx.selectFromRange(pl, {
                angle: 60,
                rotation: -30,
                radius: 2.6,
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 18,
                    knockback: 4,
                    shock: true,
                    parryable: false,
                    direction: 'middle',
                })
            })
        },
        timeline: {
            0: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 1, 90),
            6: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 1, 90),
        },
        transitions: {
            backToDefault: {
                onEndOfLife: null,
            }
        }
    }

    /**
     * @type {Move}
     */
    parryChop = {
        cast: 13,
        backswing: 13,
        onEnter(pl, ctx) {
            ctx.freeze(pl)
            ctx.lookAtTarget(pl)
            ctx.status.repulsible = false
            playAnim(pl, 'animation.weapon.moon_glaive.parry.chop')
        },
        onLeave(pl, ctx) {
            ctx.status.repulsible = true
            ctx.unfreeze(pl)
        },
        timeline: {
            5: (pl, ctx) => ctx.adsorbToTarget(pl, 2),
            8: (pl, ctx) => ctx.adsorbToTarget(pl, 4, 1),
            20: (pl, ctx) => ctx.adsorbToTarget(pl, 0.5),
        },
        onAct(pl, ctx) {
            ctx.selectFromRange(pl, {
                angle: 46,
                rotation: -23,
                radius: 2.8,
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 22,
                    permeable: true,
                    knockback: 2,
                    direction: 'right',
                })
            })
        },
        transitions: {
            backToDefault: {
                onEndOfLife: null,
            },
            parried: {
                onParried: {
                    allowedState: 'both',
                }
            },
        }
    }
}

exports.tricks = new MoonGlaiveTricks()