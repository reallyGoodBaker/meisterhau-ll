import { playAnim, playSoundAll } from "../basic/index"
import { DefaultMoves, DefaultTrickModule } from '../basic/default'
import { randomRange } from '@utils/math'

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

        this.setup<ShieldSwordMoves>('resume')
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
                        hasTarget: true,
                    }
                },
            },
        }
    }

    idle: Move = {
        cast: Infinity,
        onEnter(pl, ctx) {
            ctx.unfreeze(pl)
            playAnim(pl, 'animation.weapon.shield_with_sword.idle', 'animation.weapon.shield_with_sword.idle')
        },
        transitions: {
            hurt: {
                onHurt: null,
            },
            running: {
                onChangeSprinting: {
                    sprinting: true
                }
            },
            hold: {
                onLock: null
            }
        }
    }

    hold: Move = {
        cast: Infinity,
        onEnter(pl, ctx) {
            playAnim(pl, 'animation.weapon.shield_with_sword.hold', 'animation.weapon.shield_with_sword.hold')
        },
        transitions: {
            idle: {
                onReleaseLock: null
            },
            beforeBlocking: {
                onSneak: {
                    isSneaking: true,
                },
            },
            draw: {
                onUseItem: {
                    hasTarget: true,
                }
            },
            punch: {
                onAttack: {
                    hasTarget: true
                }
            },
            hurt: {
                onHurt: null,
            },
        }
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
            },
            hurt: {
                onHurt: null,
            },
            beforeBlocking: {
                onEndOfLife: {
                    isSneaking: true,
                },
            },
            draw: {
                onEndOfLife: {
                    preInput: 'onUseItem',
                    hasTarget: true
                }
            },
            punch: {
                onEndOfLife: {
                    preInput: 'onAttack',
                    hasTarget: true
                }
            },
        }
    }

    draw: Move = {
        cast: 7,
        backswing: 13,
        onEnter(pl, ctx) {
            ctx.freeze(pl)
            playAnim(pl, 'animation.weapon.shield_with_sword.draw')
            ctx.adsorbOrSetVelocity(pl, 1, 90)
            ctx.status.isBlocking = true
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
            ctx.status.isBlocking = false
        },
        onAct(pl, ctx) {
            playSoundAll(`weapon.woosh.${randomRange(1, 3, true)}`, pl.pos, 1)
            ctx.selectFromRange(pl, {
                radius: 2.8,
                angle: 60,
                rotation: -30
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 16,
                    direction: 'left'
                })
            })
        },
        timeline: {
            3: (_, ctx) => ctx.status.isBlocking = false,
            6: (pl, ctx) => ctx.lookAtTarget(pl),
            14: (pl, ctx) => ctx.trap(pl, { tag: 'heavy' }),
            16: (pl, ctx) => ctx.trap(pl, { tag: 'punch' })
        },
        transitions: {
            hurt: {
                onHurt: null
            },
            resume: {
                onEndOfLife: null
            },
            parried: {
                onParried: null
            },
            heavyChopAct: {
                onTrap: {
                    tag: 'heavy',
                    preInput: 'onUseItem',
                }
            },
            punch: {
                onTrap: {
                    tag: 'punch',
                    preInput: 'onAttack',
                }
            },
            blocked: {
                onBlocked: null
            },
        }
    }

    heavyChopAct: Move = {
        cast: 8,
        backswing: 15,
        onEnter(pl, ctx) {
            ctx.freeze(pl)
            ctx.adsorbOrSetVelocity(pl, 2, 90)
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
            3: (pl, ctx) => ctx.lookAtTarget(pl),
            6: (pl, ctx) => ctx.trap(pl),
            8: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 2.5, 90)
        },
        transitions: {
            resume: {
                onEndOfLife: null,
                onTrap: {
                    preInput: 'onFeint',
                }
            },
            hurt: {
                onHurt: null
            },
            parried: {
                onParried: null
            },
        }
    }

    punch: Move = {
        cast: 7,
        backswing: 13,
        onEnter(pl, ctx) {
            ctx.freeze(pl)
            playAnim(pl, 'animation.weapon.shield_with_sword.punch')
            ctx.adsorbOrSetVelocity(pl, 2, 90, 0.5)
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
        },
        onAct(pl, ctx) {
            ctx.selectFromRange(pl, {
                radius: 1,
                angle: 120,
                rotation: -60
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 4,
                    permeable: true,
                    parryable: false,
                    knockback: 0.1,
                    direction: 'middle',
                })
            })
        },
        transitions: {
            hurt: {
                onHurt: null
            },
            punchSomeone: {
                onHit: null
            },
            resume: {
                onEndOfLife: null
            },
        }
    }

    punchSomeone: Move = {
        cast: 2,
        backswing: 8,
        onEnter(pl) {
            playSoundAll(`weapon.sheild.hit${randomRange(1, 3, true)}`, pl.pos, 0.5)
        },
        onAct(pl, ctx) {
            ctx.trap(pl)
        },
        transitions: {
            chopCombo: {
                onTrap: {
                    preInput: 'onUseItem',
                }
            },
            resume: {
                onEndOfLife: null
            },
            hurt: {
                onHurt: null,
            },
        }
    }

    chopCombo: Move = {
        cast: 7,
        backswing: 13,
        onEnter(pl, ctx) {
            ctx.freeze(pl)
            ctx.adsorbOrSetVelocity(pl, 2, 90)
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
                    damage: 12,
                    knockback: 0.5,
                    direction: 'left'
                })
            })
        },
        timeline: {
            2: (pl, ctx) => ctx.adsorbToTarget(pl, 2),
            0: (pl, ctx) => ctx.lookAtTarget(pl),
        },
        transitions: {
            hurt: {
                onHurt: null
            },
            resume: {
                onEndOfLife: null
            },
            parried: {
                onParried: null
            },
        }
    }

    running: Move = {
        cast: Infinity,
        onEnter(pl, ctx) {
            playAnim(pl, 'animation.weapon.shield_with_sword.running', 'animation.weapon.shield_with_sword.running')
            ctx.releaseTarget(pl.uniqueId)
        },
        transitions: {
            hurt: {
                onHurt: null,
            },
            resume: {
                onChangeSprinting: { sprinting: false }
            },
        }
    }

    beforeBlocking: Move = {
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
        }
    }

    blocking: Move = {
        cast: Infinity,
        onEnter(pl, ctx) {
            ctx.status.isBlocking = true
            playAnim(pl, 'animation.weapon.shield_with_sword.blocking', 'animation.weapon.shield_with_sword.blocking')
        },
        onLeave(_, ctx) {
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
                onReleaseSneak: null,
            },
            block: {
                onBlock: null
            },
            rockSolid: {
                onUseItem: {
                    hasTarget: true
                }
            },
        }
    }

    rockSolid: Move = {
        cast: 3,
        backswing: 8,
        onEnter(pl, ctx) {
            ctx.freeze(pl)
            ctx.status.repulsible = false
            playAnim(pl, 'animation.weapon.shield_with_sword.rock_solid')
        },
        onAct(_, ctx) {
            ctx.status.repulsible = true
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
        },
        transitions: {
            resume: {
                onEndOfLife: {
                    isSneaking: false
                }
            },
            sweapCounter: {
                onHurt: {
                    prevent: true,
                    allowedState: 'cast',
                },
            },
            blocking: {
                onEndOfLife: {
                    isSneaking: true
                }
            },
            hurt: {
                onHurt: null,
            }
        }
    }

    sweapCounter: Move = {
        cast: 12,
        backswing: 9,
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
            resume: {
                onEndOfLife: null
            },
        }
    }

    afterBlocking: Move = {
        cast: 3,
        onEnter(pl) {
            playAnim(pl, 'animation.weapon.shield_with_sword.blocking_to_idle')
        },
        transitions: {
            hurt: {
                onHurt: null,
            },
            resume: {
                onEndOfLife: null
            },
        }
    }

    swordCounter: Move = {
        cast: 7,
        backswing: 6,
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
            resume: {
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

export const tricks = new ShieldSwordTricks()