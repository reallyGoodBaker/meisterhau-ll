const { playAnim, playSoundAll } = require("../basic/index")
const { DefaultMoves, DefaultTrickModule } = require("../basic/default")

class DoubleDaggerMoves extends DefaultMoves {
    constructor() {
        super()

        this.animations.parry.left = 'animation.double_dagger.parry'
        this.animations.block.left = 'animation.double_dagger.block'
        this.setup('resumeHold')
    }

    /**
     * @type {Move}
     */
    resumeHold = {
        transitions: {
            hold: {
                onEndOfLife: {
                    hasTarget: true
                }
            },
            init: {
                onEndOfLife: {
                    hasTarget: false
                }
            },
            dodge: {
                onEndOfLife: {
                    hasTarget: true,
                    isSneaking: true
                },
            },
            hurt: {
                onHurt: null
            },
        }
    }

    /**
     * @type {Move}
     */
    init = {
        cast: Infinity,
        onEnter(pl) {
            playAnim(pl, 'animation.posture.clear')
        },
        transitions: {
            hold: {
                onLock: null
            },
            hurt: {
                onHurt: null
            },
        }
    }

    /**
     * @type {Move}
     */
    hold = {
        cast: Infinity,
        onEnter(pl, ctx) {
            playAnim(pl, 'animation.double_dagger.hold', 'animation.double_dagger.hold')
        },
        transitions: {
            init: {
                onReleaseLock: null
            },
            hurt: {
                onHurt: null
            },
            horizontalSwing: {
                onAttack: null,
            },
            stab: {
                onUseItem: null
            },
            dodge: {
                onSneak: {
                    isSneaking: true
                },
            },
        }
    }

    /**
     * @type {Move}
     */
    horizontalSwing = {
        cast: 10,
        backswing: 10,
        onEnter(pl, ctx) {
            ctx.status.isBlocking = true
            ctx.freeze(pl)
            playAnim(pl, 'animation.double_dagger.horizontal_swing')
            ctx.lookAtTarget(pl)
        },
        onAct(pl, ctx) {
            playSoundAll('weapon.woosh.1', pl.pos, 1)
            ctx.selectFromRange(pl, {
                angle: 90,
                radius: 2,
                rotation: 30
            }).forEach(e => {
                ctx.attack(pl, e, {
                    damage: 16,
                    knockback: 0.8,
                })
            })
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
            ctx.status.isBlocking = false
        },
        timeline: {
            0: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 1, 120, 1),
            4: (_, ctx) =>  ctx.status.isBlocking = false,
            6: (pl, ctx) => ctx.trap(pl, { tag: 'chop' }),
            7: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 3, 80, 0.8),
            11: (pl, ctx) => ctx.trap(pl, { tag: 'dodge' }),
        },
        transitions: {
            resumeHold: {
                onEndOfLife: null,
            },
            hurt: {
                onHurt: {
                    allowedState: 'both'
                }
            },
            horizontalSwingToVeticalChop: {
                onTrap: {
                    tag: 'chop',
                    preInput: 'onUseItem',
                }
            },
            parried: {
                onParried: {
                    allowedState: 'backswing'
                }
            },
            dodge: {
                onSneak: {
                    allowedState: 'backswing',
                    isSneaking: true
                },
                onTrap: {
                    tag: 'dodge',
                    preInput: 'onSneak',
                    isSneaking: true
                }
            },
            blocked: {
                onBlocked: {
                    allowedState: 'backswing',
                }
            },
            block: {
                onBlock: null
            }
        }
    }

    /**
     * @type {Move}
     */
    horizontalSwingToVeticalChop = {
        cast: 11,
        backswing: 10,
        onEnter(pl, ctx) {
            ctx.freeze(pl)
            playAnim(pl, 'animation.double_dagger.horizontal_swing.to.vertical_chop')
            ctx.lookAtTarget(pl)
        },
        onAct(pl, ctx) {
            ctx.selectFromRange(pl, {
                angle: 60,
                radius: 2.5,
                rotation: 30
            }).forEach(e => {
                ctx.attack(pl, e, {
                    damage: 22,
                    knockback: 1.8,
                    permeable: true,
                })
            })
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
        },
        timeline: {
            0: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 1, 90, 1),
            4: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 2, 90, 0.8),
            9: pl => playSoundAll('weapon.woosh.3', pl.pos, 1),
            10: (pl, ctx) => ctx.trap(pl)
        },
        transitions: {
            resumeHold: {
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
            dodge: {
                onSneak: {
                    allowedState: 'backswing',
                    isSneaking: true
                },
                onTrap: {
                    tag: 'dodge',
                    preInput: 'onSneak',
                    isSneaking: true
                }
            }
        }
    }

    /**
     * @type {Move}
     */
    stab = {
        cast: 11,
        backswing: 11,
        onEnter(pl, ctx) {
            ctx.status.isWaitingParry = true
            ctx.freeze(pl)
            ctx.lookAtTarget(pl)
            playAnim(pl, 'animation.double_dagger.stab')
        },
        onAct(pl, ctx) {
            ctx.selectFromRange(pl, {
                angle: 60,
                radius: 3,
                rotation: 30
            }).forEach(e => {
                ctx.attack(pl, e, {
                    damage: 18,
                    knockback: 1.8,
                    direction: 'middle',
                })
            })
        },
        onLeave(pl, ctx) {
            ctx.status.isWaitingParry = false
            ctx.status.isBlocking = false
            ctx.unfreeze(pl)
        },
        timeline: {
            3: (_, ctx) => ctx.status.isWaitingParry = false,
            6: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 2, 90, 0.8),
            8: (_, ctx) => ctx.status.isBlocking = true,
            9: pl => playSoundAll('weapon.woosh.2', pl.pos, 1),
            12: (_, ctx) => ctx.status.isBlocking = false,
            14: (pl, ctx) => ctx.trap(pl)
        },
        transitions: {
            resumeHold: {
                onEndOfLife: null
            },
            hurt: {
                onHurt: null
            },
            parried: {
                onParried: {
                    allowedState: 'backswing'
                }
            },
            parry: {
                onParry: {
                    allowedState: 'both'
                }
            },
            dodge: {
                onSneak: {
                    allowedState: 'backswing',
                    isSneaking: true
                },
                onTrap: {
                    tag: 'dodge',
                    preInput: 'onSneak',
                    isSneaking: true
                }
            }
        }
    }

    /**
     * @type {Move}
     */
    dodge = {
        cast: 4,
        backswing: 14,
        onEnter(pl, ctx) {
            ctx.status.isWaitingDeflection = true
            ctx.freeze(pl)
            playAnim(pl, 'animation.double_dagger.dodge.front')
            ctx.lookAtTarget(pl)
        },
        onAct(_, ctx) {
            ctx.status.isWaitingDeflection = false
            ctx.status.isDodging = true
        },
        onLeave(pl, ctx) {
            ctx.status.isWaitingDeflection = false
            ctx.status.isDodging = false
            ctx.unfreeze(pl)
        },
        timeline: {
            1: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 3, 90, 2),
            8: (_, ctx) => ctx.status.isDodging = false,
            10: (pl, ctx) => ctx.trap(pl)
        },
        transitions: {
            resumeHold: {
                onEndOfLife: null
            },
            deflection: {
                onDeflection: {
                    allowedState: 'both'
                }
            },
            hurt: {
                onHurt: {
                    allowedState: 'both'
                }
            },
            deflectionPunch: {
                onTrap: {
                    preInput: 'onUseItem'
                }
            }
        }
    }

    /**
     * @type {Move}
     */
    deflection = {
        cast: 8,
        backswing: 8,
        onEnter(pl, ctx) {
            ctx.status.isDodging = true
            ctx.freeze(pl)
            ctx.lookAtTarget(pl)
            playSoundAll('weapon.deflection', pl.pos, 1)
            playAnim(pl, 'animation.double_dagger.deflection')
        },
        onAct(_, ctx) {
            ctx.status.isDodging = false
        },
        onLeave(pl, ctx) {
            ctx.status.isDodging = false
            ctx.unfreeze(pl)
        },
        timeline: {
            1: (pl, ctx) => ctx.setVelocity(pl, 180, 0.6, 0),
            7: (pl, ctx) => ctx.trap(pl, { tag: 'counter' }),
        },
        transitions: {
            deflection: {
                onDodge: {
                    allowedState: 'both'
                }
            },
            hurt: {
                onHurt: {
                    allowedState: 'both'
                }
            },
            resumeHold: {
                onEndOfLife: null
            },
            catchTargrt: {
                onTrap: {
                    tag: 'counter',
                    preInput: 'onUseItem'
                }
            },
            quickStab: {
                onTrap: {
                    tag: 'counter',
                    preInput: 'onAttack'
                }
            },
            dodge: {
                onSneak: {
                    isSneaking: true,
                    allowedState: 'backswing',
                }
            }
        }
    }

    /**
     * @type {Move}
     */
    deflectionStab = {
        cast: 8,
        backswing: 8,
        onEnter(pl, ctx) {
            ctx.freeze(pl)
            playAnim(pl, 'animation.double_dagger.deflection.stab')
        },
        onAct(pl, ctx) {
            ctx.lookAtTarget(pl)
            ctx.selectFromRange(pl, {
                radius: 2.5,
                angle: 60,
                rotation: -30,
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 22,
                    knockback: 1,
                    direction: 'middle',
                })
            })
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
        },
        timeline: {
            5: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 2, 60, 0),
            6: pl => playSoundAll('weapon.woosh.2', pl.pos, 1)
        },
        transitions: {
            hurt: {
                onHurt: {
                    allowedState: 'backswing'
                }
            },
            parried: {
                onParried: {
                    allowedState: 'backswing'
                }
            },
            resumeHold: {
                onEndOfLife: null
            }
        }
    }

    /**
     * @type {Move}
     */
    deflectionPunch = {
        cast: 4,
        backswing: 8,
        onEnter(pl, ctx) {
            ctx.freeze(pl)
            ctx.adsorbOrSetVelocity(pl, 1.5, 90, 0.8)
            playAnim(pl, 'animation.double_dagger.deflection.punch')
        },
        onAct(pl, ctx) {
            ctx.lookAtTarget(pl)
            ctx.selectFromRange(pl, {
                radius: 2,
                angle: 60,
                rotation: -30,
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 4,
                    parryable: false,
                    permeable: true,
                    knockback: 2,
                    direction: 'middle',
                })
            })
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
        },
        transitions: {
            hurt: {
                onHurt: {
                    allowedState: 'backswing'
                }
            },
            resumeHold: {
                onEndOfLife: null
            }
        }
    }

    /**
     * @type {Move}
     */
    catchTargrt = {
        cast: 6,
        backswing: 14,
        onEnter(pl, ctx) {
            ctx.freeze(pl)
            playAnim(pl, 'animation.double_dagger.dodge.catch')
            ctx.adsorbOrSetVelocity(pl, 3, 90, 0.8)
        },
        onAct(pl, ctx) {
            ctx.selectFromRange(pl, {
                angle: 120,
                rotation: -60,
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 2,
                    knockback: 0.1,
                    permeable: true,
                    parryable: false,
                    stiffness: 1500,
                    powerful: true,
                })
            })
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
        },
        timeline: {
            15: (pl, ctx) => ctx.trap(pl)
        },
        transitions: {
            resumeHold: {
                onEndOfLife: null
            },
            catched: {
                onHit: null
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
    catched = {
        cast: 10,
        backswing: 5,
        onEnter(pl, ctx) {
            ctx.freeze(pl)
        },
        onAct(pl, ctx) {
            ctx.trap(pl)
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
        },
        transitions: {
            resumeHold: {
                onEndOfLife: null
            },
            deflectionStab: {
                onTrap: {
                    preInput: 'onUseItem',
                    allowedState: 'both'
                }
            },
            kick: {
                onTrap: {
                    preInput: 'onAttack',
                    allowedState: 'both'
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
    quickStab = {
        cast: 5,
        backswing: 11,
        onEnter(pl, ctx) {
            ctx.freeze(pl)
            playAnim(pl, 'animation.double_dagger.catch.stab')
            ctx.adsorbOrSetVelocity(pl, 3, 90, 0.8)
        },
        onAct(pl, ctx) {
            ctx.selectFromRange(pl).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 18,
                    knockback: 2,
                    parryable: false,
                })
            })
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
        },
        transitions: {
            resumeHold: {
                onEndOfLife: null
            },
            hurt: {
                onHurt: {
                    allowedState: 'both'
                }
            },
            dodge: {
                onSneak: {
                    isSneaking: true,
                    allowedState: 'backswing'
                }
            }
        }
    }

    /**
     * @type {Move}
     */
    kick = {
        cast: 6,
        backswing: 10,
        onEnter(pl, ctx) {
            ctx.freeze(pl)
            playAnim(pl, 'animation.double_dagger.catch.kick')
            ctx.adsorbOrSetVelocity(pl, 2, 90, 0.8)
        },
        onAct(pl, ctx) {
            ctx.selectFromRange(pl).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 8,
                    knockback: 5,
                    parryable: false,
                    permeable: true,
                    shock: true,
                    powerful: true,
                })
            })
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
        },
        transitions: {
            resumeHold: {
                onEndOfLife: null
            },
            hurt: {
                onHurt: {
                    allowedState: 'both'
                }
            }
        }
    }
}

class DoubleDaggerTricks extends DefaultTrickModule {
    constructor() {
        super(
            'rgb:double_dagger',
            'init',
            [ 'weapon:double_dagger' ],
            new DoubleDaggerMoves()
        )
    }
}

exports.tricks = new DoubleDaggerTricks()