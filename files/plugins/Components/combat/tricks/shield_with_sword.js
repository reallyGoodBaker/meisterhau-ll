const { playAnim, playSoundAll } = require('../basic')
const { DefaultMoves, DefaultTrickModule } = require('../basic/default')
const console = require('../../console/main')
const { constrictCalc, randomRange } = require('../basic/utils/math')
const { hud } = require('../basic/hud')

class ShieldSwordTricks extends DefaultTrickModule {
    constructor() {
        super(
            'rgb39.weapon.shield_sword',
            'idle',
            [ 'weapon:shield_with_sword' ],
            new ShieldSwordMoves()
        )
    }
}

class ShieldSwordMoves extends DefaultMoves {
    constructor() {
        super()

        this.animations.parry.left = 'animation.weapon.shield_with_sword.parry'

        this.setup('idle')

        this.setTransition('parry', 'draw', {
            draw: {
                onTrap: {
                    tag: 'parryCounter',
                    preInput: 'onUseItem',
                }
            }
        })

        this.setTransition('parry', 'shieldStrike', {
            onTrap: {
                tag: 'parryCounter',
                preInput: 'onAttack',
            }
        })

        this.block =  {
            cast: 7,
            onEnter(pl, ctx) {
                playSoundAll(`weapon.sheild.hit${randomRange(1, 3, true)}`, pl.pos, 1)
                ctx.status.isBlocking = true
                ctx.freeze(pl)
                ctx.lookAtTarget(pl)
                playAnim(pl, 'animation.weapon.shield_with_sword.block')
            },
            onLeave(pl, ctx) {
                ctx.status.isBlocking = false
                ctx.unfreeze(pl)
            },
            timeline: {
                6: (pl, ctx) => ctx.trap(pl)
            },
            transitions: {
                hurt: {
                    onHurt: null,
                },
                block: {
                    onBlock: null
                },
                blocking: {
                    onEndOfLife: {
                        isSneaking: true
                    }
                },
                afterBlocking: {
                    onEndOfLife: {
                        isSneaking: false
                    }
                },
                swordCounter: {
                    onTrap: {
                        preInput: 'onAttack',
                        allowedState: 'both',
                        hasTarget: true,
                    }
                },
                knockdown: {
                    onKnockdown: null
                },
            },
        }
    }

    /**
     * @type {Move}
     */
    draw = {
        cast: 10,
        backswing: 11,
        onEnter(pl, ctx) {
            ctx.freeze(pl)
            playAnim(pl, 'animation.weapon.shield_with_sword.draw')
            ctx.task.queueList([
                { handler() { ctx.status.isWaitingParry = true }, timeout: 0 },
                { handler() { ctx.status.isWaitingParry = false }, timeout: 150 },
            ]).run()
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
            ctx.task.cancel()
        },
        onAct(pl, ctx) {
            playSoundAll(`weapon.woosh.${randomRange(1, 3, true)}`, pl.pos, 1)
            ctx.selectFromRange(pl, {
                radius: 2.8,
                angle: 60,
                rotation: -30
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 14,
                    knockback: 0.5,
                    direction: 'left'
                })
            })
        },
        timeline: {
            0: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 0.5, 90),
            3: (pl, ctx) => ctx.lookAtTarget(pl),
            4: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 1, 90),
            16: (pl, ctx) => ctx.trap(pl)
        },
        transitions: {
            hurt: {
                onHurt: null
            },
            idle: {
                onEndOfLife: null
            },
            parried: {
                onParried: {
                    allowedState: 'backswing'
                }
            },
            punch: {
                onTrap: {
                    preInput: 'onAttack',
                    allowedState: 'backswing',
                }
            },
            heavyChopPre: {
                onTrap: {
                    preInput: 'onUseItem',
                    allowedState: 'backswing',
                }
            },
            knockdown: {
                onKnockdown: null
            },
            parry: {
                onParry: null
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
    heavyChopPre = {
        cast: 5,
        onEnter(pl, ctx) {
            ctx.freeze(pl)
            playAnim(pl, 'animation.weapon.shield_with_sword.heavy_chop_pre')
            ctx.adsorbToTarget(pl, 5, 1)
        },
        timeline: {
            4: (pl, ctx) => ctx.trap(pl)
        },
        transitions: {
            idle: {
                onTrap: {
                    preInput: 'onFeint',
                    allowedState: 'both',
                }
            },
            heavyChopAct: {
                onEndOfLife: null
            },
            hurt: {
                onHurt: null
            },
            knockdown: {
                onKnockdown: null
            },
        }
    }

    /**
     * @type {Move}
     */
    heavyChopAct = {
        cast: 5,
        backswing: 8,
        onEnter(pl, ctx) {
            ctx.freeze(pl)
            ctx.adsorbOrSetVelocity(pl, 1, 90)
            playAnim(pl, 'animation.weapon.shield_with_sword.heavy_chop_act')
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
        },
        onAct(pl, ctx) {
            playSoundAll(`weapon.woosh.${randomRange(3, 5, true)}`, pl.pos, 1)
            ctx.selectFromRange(pl, {
                angle: 40,
                rotation: -20,
                radius: 3.2
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 20,
                    knockback: 1.5,
                    trace: true,
                    direction: 'vertical'
                })
            })
        },
        timeline: {
            3: (pl, ctx) => ctx.lookAtTarget(pl)
        },
        transitions: {
            idle: {
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
            knockdown: {
                onKnockdown: null
            },
        }
    }

    /**
     * @type {Move}
     */
    shieldStrike = {
        cast: 10,
        backswing: 15,
        onEnter(pl, ctx) {
            ctx.freeze(pl)
            playAnim(pl, 'animation.weapon.shield_with_sword.shield_strike')
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
        },
        onAct(pl, ctx) {
            ctx.selectFromRange(pl, {
                radius: 2.2,
                angle: 120,
                rotation: -60
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 4,
                    permeable: true,
                    parryable: false,
                    knockback: 0,
                    direction: 'middle'
                })
            })
        },
        timeline: {
            2: (pl, ctx) => ctx.lookAtTarget(pl),
            0: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 0.8, 90, 1),
            6: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 2.6, 90, 1),
        },
        transitions: {
            hurt: {
                onHurt: null
            },
            punchSomeone: {
                onHit: {
                    allowedState: 'both'
                }
            },
            idle: {
                onEndOfLife: null
            },
            knockdown: {
                onKnockdown: null
            },
        }
    }

    /**
     * @type {Move}
     */
    punch = {
        cast: 10,
        backswing: 15,
        onEnter(pl, ctx) {
            ctx.freeze(pl)
            playAnim(pl, 'animation.weapon.shield_with_sword.punch')
            
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
        },
        onAct(pl, ctx) {
            ctx.selectFromRange(pl, {
                radius: 2.2,
                angle: 120,
                rotation: -60
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 4,
                    permeable: true,
                    parryable: false,
                    knockback: 0.05,
                    direction: 'middle',
                })
            })
        },
        timeline: {
            0: (pl, ctx) => ctx.lookAtTarget(pl),
            2: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 3, 90, 1),
            12: (pl, ctx) => ctx.trap(pl),
        },
        transitions: {
            hurt: {
                onHurt: null,
            },
            idle: {
                onEndOfLife: null
            },
            punchSomeone: {
                onHit: {
                    allowedState: 'backswing'
                }
            },
            knockdown: {
                onKnockdown: null
            },
        }
    }

    /**
     * @type {Move}
     */
    punchSomeone = {
        cast: 15,
        onEnter(pl, ctx) {
            playSoundAll(`weapon.sheild.hit${randomRange(1, 3, true)}`, pl.pos, 0.5)
            ctx.trap(pl)
        },
        transitions: {
            chopCombo: {
                onTrap: {
                    preInput: 'onUseItem',
                    allowedState: 'both'
                }
            },
            idle: {
                onEndOfLife: null
            },
            knockdown: {
                onKnockdown: null
            },
        }
    }

    /**
     * @type {Move}
     */
    chopCombo = {
        cast: 5,
        backswing: 7,
        onEnter(pl, ctx) {
            ctx.freeze(pl)
            playAnim(pl, 'animation.weapon.shield_with_sword.chop_combo')
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
        },
        onAct(pl, ctx) {
            playSoundAll(`weapon.woosh.${randomRange(1, 2, true)}`, pl.pos, 1)
            ctx.selectFromRange(pl, {
                radius: 3,
                angle: 46,
                rotation: -23
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 14,
                    knockback: 0.5,
                    direction: 'vertical'
                })
            })
        },
        timeline: {
            2: (pl, ctx) => ctx.adsorbToTarget(pl),
            0: (pl, ctx) => ctx.lookAtTarget(pl),
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
        }
    }

    /**
     * @type {Move}
     */
    idle = {
        cast: Infinity,
        onEnter(pl, ctx) {
            ctx.trap(pl)
            ctx.unfreeze(pl)
            playAnim(pl, 'animation.weapon.shield_with_sword.idle', 'animation.weapon.shield_with_sword.idle')
            pl.setSprinting(false)
        },
        transitions: {
            hurt: {
                onHurt: null,
            },
            running: {
                onChangeSprinting: { sprinting: true }
            },
            beforeBlocking: {
                onSneak: {
                    isSneaking: true,
                },
                onTrap: {
                    preInput: 'onSneak',
                    isSneaking: true,
                }
            },
            draw: {
                onUseItem: {
                    hasTarget: true,
                }
            },
            shieldStrike: {
                onAttack: null
            },
            jump: {
                onJump: null
            },
            knockdown: {
                onKnockdown: null
            },
        }
    }

    /**
     * @type {Move}
     */
    jump = {
        onEnter(pl, ctx) {
            ctx.releaseTarget(pl.xuid)
        },
        transitions: {
            idle: {
                onEndOfLife: null
            },
            knockdown: {
                onKnockdown: null
            },
        }
    }

    /**
     * @type {Move}
     */
    running = {
        cast: Infinity,
        onEnter(pl, ctx) {
            playAnim(pl, 'animation.weapon.shield_with_sword.running', 'animation.weapon.shield_with_sword.running')
            ctx.releaseTarget(pl.xuid)
        },
        transitions: {
            hurt: {
                onHurt: null,
            },
            idle: {
                onChangeSprinting: { sprinting: false }
            },
            knockdown: {
                onKnockdown: null
            },
        }
    }

    /**
     * @type {Move}
     */
    beforeBlocking = {
        cast: 2,
        onEnter(pl) {
            playAnim(pl, 'animation.weapon.shield_with_sword.idle_to_blocking')
        },
        transitions: {
            hurt: {
                onHurt: null,
            },
            blocking: {
                onEndOfLife: {
                    isSneaking: true
                }
            },
            afterBlocking: {
                onEndOfLife: {
                    isSneaking: false
                }
            },
            knockdown: {
                onKnockdown: null
            },
        }
    }

    /**
     * @type {Move}
     */
    blocking = {
        cast: Infinity,
        onEnter(pl, ctx) {
            ctx.status.isBlocking = true
            playAnim(pl, 'animation.weapon.shield_with_sword.blocking', 'animation.weapon.shield_with_sword.blocking')
        },
        onLeave(pl, ctx) {
            ctx.status.isBlocking = false
        },
        transitions: {
            hurt: {
                onHurt: null,
            },
            running: {
                onChangeSprinting: { sprinting: true }
            },
            afterBlocking: {
                onSneak: {
                    isSneaking: false
                },
            },
            block: {
                onBlock: null
            },
            rockSolid: {
                onUseItem: {
                    hasTarget: true
                }
            },
            jump: {
                onJump: null
            },
            knockdown: {
                onKnockdown: null
            },
        }
    }

    /**
     * @type {Move}
     */
    rockSolid = {
        cast: 4,
        backswing: 7,
        onEnter(pl, ctx) {
            ctx.freeze(pl)
            ctx.status.repulsible = false
            playAnim(pl, 'animation.weapon.shield_with_sword.rock_solid')
        },
        onAct(pl, ctx) {
            ctx.status.repulsible = true
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
        },
        transitions: {
            idle: {
                onEndOfLife: {
                    isSneaking: false
                }
            },
            sweapCounter: {
                onHurt: {
                    allowedState: 'cast',
                    prevent: true,
                },
                onKnockdown: {
                    allowedState: 'cast'
                },
            },
            hurt: {
                onHurt: {
                    allowedState: 'backswing'
                }
            },
            knockdown: {
                onKnockdown: {
                    allowedState: 'backswing'
                }
            },
            beforeBlocking: {
                onEndOfLife: {
                    isSneaking: true
                }
            }
        }
    }

    /**
     * @type {Move}
     */
    sweapCounter = {
        cast: 11,
        backswing: 10,
        onEnter(pl, ctx) {
            ctx.freeze(pl)
            ctx.adsorbToTarget(pl, 4, 0.5)
            playAnim(pl, 'animation.weapon.shield_with_sword.sweap_counter')
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
        },
        onAct(pl, ctx) {
            ctx.lookAtTarget(pl)
            ctx.selectFromRange(pl, {
                radius: 3,
                angle: 120,
                rotation: -90,
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 24,
                    parryable: false,
                    permeable: true,
                    knockback: 1.5,
                })
            })
        },
        timeline: {
            4: (pl, ctx) => {
                ctx.selectFromRange(pl, {
                    radius: 2.5,
                    angle: 120,
                    rotation: -60,
                }).forEach(en => {
                    ctx.attack(pl, en, {
                        damage: 4,
                        parryable: false,
                        permeable: true,
                        knockback: 0.05,
                        direction: 'left'
                    })
                })
            },

        },
        transitions: {
            hurt: {
                onHurt: null
            },
            idle: {
                onEndOfLife: null
            },
            knockdown: {
                onKnockdown: null
            },
        }
    }

    /**
     * @type {Move}
     */
    afterBlocking = {
        cast: 3,
        onEnter(pl) {
            playAnim(pl, 'animation.weapon.shield_with_sword.blocking_to_idle')
        },
        transitions: {
            hurt: {
                onHurt: null,
            },
            idle: {
                onEndOfLife: null
            },
            knockdown: {
                onKnockdown: null
            },
        }
    }

    /**
     * @type {Move}
     */
    swordCounter = {
        cast: 6,
        backswing: 7,
        onEnter(pl, ctx) {
            ctx.freeze(pl)
            ctx.lookAtTarget(pl)
            playAnim(pl, 'animation.weapon.shield_with_sword.sword_counter')
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
        },
        onAct(pl, ctx) {
            playSoundAll(`weapon.woosh.${randomRange(1,3, true)}`, pl.pos, 1)
            ctx.selectFromRange(pl, {
                angle: 30,
                rotation: -15,
                radius: 3.5,
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 12,
                    knockback: 1,
                    parryable: false,
                    permeable: true,
                    direction: 'middle',
                })
            })
        },
        timeline: {
            3: (pl, ctx) => {
                ctx.adsorbToTarget(pl, 2, 0.8)
            }
        },
        transitions: {
            hurt: {
                onHurt: null,
            },
            idle: {
                onEndOfLife: {
                    isSneaking: false
                },
            },
            blocking: {
                onEndOfLife: {
                    isSneaking: true
                },
            }
        }
    }
}

module.exports = new ShieldSwordTricks()