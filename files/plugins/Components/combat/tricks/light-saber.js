const { playAnim, playSoundAll } = require("../basic/index")
const { DefaultMoves, DefaultTrickModule } = require('../basic/default')
const { constrictCalc, randomRange } = require('../../utils/math')
const { hud } = require('../basic/hud')

class LightSaberMoves extends DefaultMoves {
    /**
     * @type {Move}
     */
    hold = {
        cast: Infinity,
        onEnter(pl, ctx) {
            playAnimCompatibility(pl, 'animation.weapon.light_saber.hold', 'animation.weapon.light_saber.hold')
        },
        onTick(pl, ctx) {
            const { status } = ctx
            status.stamina = constrictCalc(0, 100, () => status.stamina + 1)
            pl.tell(
                hud(status.stamina/100, 20),
                5
            )
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
            attack1: {
                onAttack: {
                    stamina: v => v >= 10
                }
            },
            beforeBlocking: {
                onSneak: {
                    isSneaking: true,
                    stamina: v => v > 20
                },
            },
            jump: {
                onJump: null
            },
            dodge: {
                onUseItem: null
            },
            knockdown: {
                onKnockdown: null
            }
        }
    }

    /**
     * @type {Move}
     */
    dodge = {
        cast: 15,
        onEnter(pl, ctx) {
            playAnimCompatibility(pl, 'animation.weapon.light_saber.dodge')
            ctx.movement(pl, false)
            ctx.setVelocity(pl, -90, 2, 0)
            ctx.status.stamina = constrictCalc(0, 100, () => ctx.status.stamina - 10)
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
        },
        onTick(pl, ctx) {
            pl.tell(hud(ctx.status.stamina/100, 20), 5)
        },
        timeline: {
            8: (pl, ctx) => ctx.setVelocity(pl, -90, 1, 0)
        },
        transitions: {
            hold: {
                onEndOfLife: null
            },
            hurt: {
                onHurt: null
            }
        }
    }

    /**
     * @type {Move}
     */
    jump = {
        cast: 6,
        transitions: {
            hold: {
                onEndOfLife: null,
            },
            jumpAttack: {
                onAttack: {
                    stamina: v => v > 20
                }
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
    jumpAttack = {
        cast: 10,
        backswing: 10,
        onEnter(pl, ctx) {
            pl.setSprinting(false)
            playAnimCompatibility(pl, 'animation.weapon.light_saber.jump_attack')
            ctx.status.stamina = constrictCalc(0, 100, () => ctx.status.stamina - 15)
            ctx.freeze(pl)
        },
        onAct(pl, ctx) {
            ctx.selectFromSector(pl, {
                angle: 25,
                rotation: -12,
                radius: 3.2
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 26,
                    knockback: 1.5,
                    permeable: true,
                })
            })

            ctx.status.repulsible = true
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
        },
        onTick(pl, ctx) {
            const { status } = ctx
            status.stamina = constrictCalc(0, 100, () => status.stamina)
            pl.tell(hud(status.stamina/100, 20), 5)
        },
        timeline: {
            2: (_, ctx) => ctx.status.repulsible = false,
            8: (pl, ctx) => {
                ctx.adsorbOrSetVelocity(pl, 2, 90)
            }
        },
        transitions: {
            hold: {
                onEndOfLife: null
            },
            hurt: {
                onHurt: null
            },
            parried: {
                onParried: {
                    allowedState: 'both'
                }
            },
        }
    }

    /**
     * @type {Move}
     */
    beforeBlocking = {
        cast: 4,
        onEnter(pl, ctx) {
            playAnimCompatibility(pl, 'animation.weapon.light_saber.blocking', 'animation.weapon.light_saber.blocking')
            ctx.status.isWaitingParry = true
        },
        onLeave(pl, ctx) {
            ctx.status.isWaitingParry = false
        },
        transitions: {
            blocking: {
                onEndOfLife: {
                    isSneaking: true
                }
            },
            parry: {
                onParry: null
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
        },
        onLeave(_, ctx) {
            ctx.status.isBlocking = false
        },
        onTick(pl, ctx) {
            pl.tell(hud(ctx.status.stamina/100, 20), 5)
        },
        transitions: {
            afterBlocking: {
                onSneak: { isSneaking:false }
            },
            hurt: {
                onHurt: null
            },
            block: {
                onBlock: null
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
        transitions: {
            hold: {
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
    block = {
        onEnter(pl, ctx) {
            const damageOpt = ctx.rawArgs[2]
            const result = ctx.status.stamina - (damageOpt.damage || 0)
            ctx.status.stamina = result < 0 ? 0 : result
            playSoundAll(`weapon.sword.hit${randomRange(1, 4, true)}`, pl.pos, 1)
        },
        transitions: {
            blocking: {
                onEndOfLife: {
                    stamina: v => v > 0
                }
            },
            hold: {
                onEndOfLife: {
                    stamina: 0
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
    running = {
        cast: Infinity,
        onEnter(pl) {
            playAnimCompatibility(pl, 'animation.weapon.light_saber.run', 'animation.weapon.light_saber.run')
        },
        onTick(pl, ctx) {
            pl.tell(hud(ctx.status.stamina/100, 20), 5)
        },
        transitions: {
            hurt: {
                onHit: null
            },
            hold: {
                onChangeSprinting: {
                    sprinting: false
                },
            },
            runningJump: {
                onJump: null
            },
            strike: {
                onAttack: {
                    stamina: v => v > 30
                }
            },
            dash: {
                onUseItem: {
                    stamina: v => v > 10
                }
            },
            blocking: {
                onSneak: {
                    isSneaking: true
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
    dash = {
        cast: 15,
        onEnter(pl, ctx) {
            ctx.status.stamina = constrictCalc(0, 100, () => ctx.status.stamina - 10)
            ctx.movement(pl, false)
            ctx.setVelocity(pl, 90, 3, 0)
            pl.setSprinting(false)
            playAnimCompatibility(pl, 'animation.weapon.light_saber.dash')
        },
        onTick(pl, ctx) {
            pl.tell(hud(ctx.status.stamina/100, 20), 5)
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
        },
        timeline: {
            8: (pl, ctx) => {
                ctx.trap(pl)
                ctx.setVelocity(pl, 90, 1, 0)
            },
        },
        transitions: {
            strike: {
                onTrap: {
                    preInput: 'onAttack',
                    stamina: v => v >= 20
                }
            },
            hold: {
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
    runningJump = {
        cast: 6,
        timeline: {
            6: (pl, ctx) => {
                ctx.trap(pl)
            }
        },
        transitions: {
            running: {
                onEndOfLife: null
            },
            hold: {
                onTrap: {
                    preInput: 'onChangeSprinting',
                },
                onAttack: {
                    stamina: v => v < 30
                }
            },
            strike: {
                onAttack: {
                    stamina: v => v > 30
                }
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
    strike = {
        cast: 10,
        backswing: 10,
        onEnter(pl, ctx) {
            playAnimCompatibility(pl, 'animation.weapon.light_saber.strike')
            ctx.status.stamina = constrictCalc(0, 100, () => ctx.status.stamina - 20)
            ctx.freeze(pl)
            ctx.adsorbOrSetVelocity(pl, 1, 90)
        },
        onTick(pl, ctx) {
            const { status } = ctx
            status.stamina = constrictCalc(0, 100, () => status.stamina)
            pl.tell(hud(status.stamina/100, 20), 5)
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
        },
        onAct(pl, ctx) {
            ctx.selectFromSector(pl, {
                radius: 3.2,
                angle: 20,
                rotation: -10
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 25,
                    knockback: 2,
                })
            })
        },
        timeline: {
            6: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 2.5, 90)
        },
        transitions: {
            hurt: {
                onHurt: {
                    allowedState: 'both'
                },
            },
            hold: {
                onEndOfLife: null
            },
            parried: {
                onParried: {
                    allowedState: 'both'
                }
            },
        },
    }

    /**
     * @type {Move}
     */
    attack1 = {
        cast: 9,
        backswing: 11,
        onEnter(pl, ctx) {
            ctx.movement(pl, false)
            playAnimCompatibility(pl, 'animation.weapon.light_saber.attack1')
            ctx.status.stamina = constrictCalc(0, 100, () => ctx.status.stamina - 10)
        },
        onTick(pl, ctx) {
            pl.tell(hud(ctx.status.stamina/100, 20), 5)
        },
        onAct(pl, ctx) {
            ctx.selectFromSector(pl, {
                angle: 45,
                rotation: -22.5,
                radius: 2.5
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 18,
                    knockback: 1,
                })
            })
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
        },
        timeline: {
            2: (_, ctx) => ctx.status.isBlocking = true,
            5: (pl, ctx) => ctx.setVelocity(pl, 90, 1, 0),
            6: (_, ctx) => ctx.status.isBlocking = false,
            14: (pl, ctx) => ctx.trap(pl)
        },
        transitions: {
            hurt: {
                onHurt: {
                    allowedState: 'both'
                }
            },
            hold: {
                onEndOfLife: null
            },
            attack2: {
                onTrap: {
                    preInput: 'onAttack',
                    allowedState: 'backswing',
                    stamina: v => v >= 12,
                }
            },
            parried: {
                onParried: {
                    allowedState: 'both'
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
    attack2 = {
        cast: 11,
        backswing: 12,
        onEnter(pl, ctx) {
            ctx.movement(pl, false)
            playAnimCompatibility(pl, 'animation.weapon.light_saber.attack2')
            ctx.status.stamina = constrictCalc(0, 100, () => ctx.status.stamina - 12)
        },
        onAct(pl, ctx) {
            ctx.selectFromSector(pl, {
                angle: 45,
                rotation: -22.5,
                radius: 2.5
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 22,
                    knockback: 1,
                })
            })
        },
        onTick(pl, ctx) {
            pl.tell(hud(ctx.status.stamina/100, 20), 5)
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
        },
        timeline: {
            2: (_, ctx) => ctx.status.isBlocking = true,
            6: (pl, ctx) => {
                ctx.setVelocity(pl, 90, 1, 0)
                ctx.status.isBlocking = false
            },
        },
        transitions: {
            hurt: {
                onHurt: {
                    allowedState: 'both'
                }
            },
            hold: {
                onEndOfLife: null
            },
            parried: {
                onParried: {
                    allowedState: 'both'
                }
            },
            knockdown: {
                onKnockdown: null
            },
        }
    }

    constructor() {
        super()

        this.animations.parry = 'animation.weapon.light_saber.parry'

        this.knockdown.transitions = {
            hold: {
                onEndOfLife: null
            }
        }

        this.setup('hold')
    }
}

class LightSaberTrick extends DefaultTrickModule {
    constructor() {
        super(
            'rgb39.weapon.light_saber',
            'hold',
            [ 'weapon:light_saber' ],
            new LightSaberMoves()
        )
    }
}

exports.tricks = new LightSaberTrick()