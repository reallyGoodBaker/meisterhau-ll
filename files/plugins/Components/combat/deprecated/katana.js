const { hud } = require('../basic/hud')
// const ps = mc.newParticleSpawner()
const { playAnim } = require('../basic')

function stabbingParticle(from, to) {
    ps.drawOrientedLine(from, to, 2)
}

/**
 * @type {TrickModule}
 */
module.exports = {
    sid: 'rgb39.weapon.katana',
    bind: [ 'weapon:katana_unsheathed' ],
    moves: {
        default: {
            cast: Infinity,
            onEnter(pl) {
                pl.setSprinting(false)
                playAnim(pl, 'animation.general.stand')
            },
            transitions: {
                attack: {
                    onAttack: null
                },
                sneak: {
                    onSneak: { isSneaking: true }
                },
                running: {
                    onChangeSprinting: { sprinting: true }
                },
                pryingAttack: {
                    onUseItem: null
                },
                hit: {
                    onHurt: null
                }
            }

        },

        heavyAttack: {
            cast: 10,
            backswing: 10,
            onEnter(pl, ctx) {
                const { status, task } = ctx
                status.isWaitingParry = true
                task.queue(() => status.isWaitingParry = false, 200)
                    .run()

                ctx.setVelocity(pl, 90, 0.8, 0)
                playAnim(pl, 'animation.twohanded.chop.midline.cast', 'default', 1000)
            },
            onAct(pl, ctx) {
                ctx.setVelocity(pl, 90, 0.8, 0)
                ctx.camera(pl, false)
                const targets = ctx.selectFromSector(pl, {
                    angle: 10,
                    rotation: -5,
                    radius: 5
                })
                playAnim(pl, 'animation.twohanded.chop.midline.draw')
                targets.forEach(e => {
                    if (e.uniqueId === pl.uniqueId) {
                        return
                    }

                    ctx.attack(pl, e, {
                        damage: 24
                    })
                })
            },
            onLeave(pl, ctx) {
                ctx.unfreeze(pl)
                ctx.task.cancel()
            },
            transitions: {
                sneak: {
                    onEndOfLife: null
                },
                default: {
                    onSneak: {
                        isSneaking: false,
                        allowedState: 'both'
                    }
                },
                parring: { onParry: null },
                parried: { onParried: null },
                hit: {
                    onHurt: { allowedState: 'both' }
                }
            }
        },

        running: {
            cast: Infinity,
            onEnter(pl) {
                playAnim(pl, 'animation.twohanded.run.onehanded', 'animation.twohanded.run.onehanded')
            },
            transitions: {
                default: {
                    onChangeSprinting: { sprinting: false }
                },
                attack: {
                    onAttack: null
                },
                runningAttack: { onUseItem: null },
                hit: { onHurt: null }
            },
        },

        runningAttack: {
            cast: 12,
            backswing: 10,
            onEnter(pl) {
                pl.addEffect(1, 12, 1, false)
                playAnim(pl, 'animation.twohanded.run.twohanded', 'animation.twohanded.run.twohanded')
            },
            onAct(pl, ctx) {
                if (pl.isOnGround) {
                    ctx.setVelocity(pl, 90, 2, 0)
                }

                ctx.freeze(pl)
                playAnim(pl, 'animation.twohanded.pry.draw')

                const entities = ctx.selectFromSector(pl, {
                    radius: 4,
                    angle: 120,
                    rotation: -60
                })

                entities.filter(e => e.uniqueId !== pl.uniqueId)
                    .forEach(e => ctx.attack(pl, e, {
                        damage: 16
                    }))
            },
            onLeave(pl, ctx) {
                ctx.unfreeze(pl)
            },
            transitions: {
                default: { onEndOfLife: null },
                parried: { onParried: null },
                hit: {
                    onHurt: { allowedState: 'both' }
                }
            }
        },

        attack: {
            cast: 3,
            backswing: 7,
            onEnter(pl, ctx) {
                ctx.freeze(pl)
                pl.setSprinting(false)
                ctx.setVelocity(pl, 90, 0.5, 0)
                playAnim(pl, `animation.twohanded.chop.${Math.random() > 0.5? 'left': 'right'}`, 'animation.general.stand', 0.2)
            },
            onAct(pl, ctx) {
                const { selectFromSector } = ctx

                const entities = selectFromSector(pl, {
                    radius: 2.2,
                    angle: 90,
                    rotation: -45
                })

                entities.filter(e => e.uniqueId !== pl.uniqueId)
                    .forEach(e => ctx.attack(pl, e, {
                        damage: 8,
                    }))
            },
            onLeave(pl, ctx) {
                ctx.unfreeze(pl)
            },
            transitions: {
                default: {
                    onEndOfLife: null
                },
                parried: { onParried: null },
                hit: {
                    onHurt: { allowedState: 'both' }
                }
            }
        },

        block: {
            cast: 4,
            onEnter(pl, ctx) {
                const { rawArgs } = ctx
                const [ victim, abuser, damage ] = rawArgs

                const side = Math.random() > 0.5 ? 'left' : 'right'
                playAnim(pl, 'animation.twohanded.block.' + side, 'animation.twohanded.block.' + side)

                if (damage < 2) {
                    return
                }

                pl.hurt(Math.ceil(damage * 0.8 - 1.6))
            },
            transitions: {
                block: {
                    onBlock: null,
                    onHurtByMob: {
                        prevent: true
                    },
                },

                sneak: {
                    onEndOfLife: null
                },

                default: {
                    onSneak: { isSneaking: false }
                }
            }
        },

        sneak: {
            cast: Infinity,
            onEnter(pl, ctx) {
                ctx.status.isBlocking = true
                playAnim(pl, 'animation.twohanded.hold', 'animation.twohanded.hold')
            },
            onLeave(pl, ctx) {
                ctx.status.isBlocking = false
                playAnim(pl, 'animation.twohanded.hold', 'default', 0)
            },
            transitions: {
                default: {
                    onSneak: { isSneaking: false }
                },
                attack: {
                    onAttack: null
                },
                block: {
                    onBlock: null,
                    onHurtByMob: {
                        prevent: true
                    },
                },
                heavyAttack: {
                    onUseItem: null
                }
            }
        },

        pryingAttack: {
            cast: 8,
            backswing: 10,
            onEnter(pl, ctx) {
                ctx.status.isWaitingParry = true
                ctx.task
                    .queue(() => ctx.status.isWaitingParry = false, 200)
                    .run()

                ctx.movement(pl, false)
                ctx.setVelocity(pl, 90, 0.5, 0)
                playAnim(pl, 'animation.twohanded.pry.cast', 'animation.twohanded.pry.draw', 1000)
            },
            onAct(pl, ctx) {
                ctx.camera(pl, false)
                ctx.setVelocity(pl, 90, 1, 0)
                playAnim(pl, 'animation.twohanded.pry.draw')
                
                const entities = ctx.selectFromSector(pl, {
                    radius: 3.5,
                    angle: 60,
                    rotation: -30
                })

                entities.filter(e => e.uniqueId !== pl.uniqueId)
                    .forEach(e => ctx.attack(pl, e, {
                        damage: 16,
                        doParry: true,
                    }))
            },
            onLeave(pl, ctx) {
                ctx.unfreeze(pl)
                ctx.task.cancel()
            },
            transitions: {
                default: { onEndOfLife: null },
                sneak: {
                    onSneak: { isSneaking: true }
                },
                runningAttack: {
                    onUseItem: {
                        allowedState: 'cast',
                    }
                },
                parring: {
                    onParry: null
                },
                parried: {
                    onParried: {
                        allowedState: 'backswing',
                    }
                },
                hit: {
                    onHurt: { allowedState: 'both' }
                }
            }
        },

        parring: {
            cast: 10,
            onEnter(pl, ctx) {
                playAnim(pl, 'animation.twohanded.parry.left')
                const { status, task } = ctx
                status.isWaitingParry = true
                task.queue(() => status.isWaitingParry = false, 200)
                    .run()
            },
            onLeave(_, ctx) {
                ctx.task.cancel()
            },
            transitions: {
                default: {
                    onEndOfLife: null
                },
                parring: {
                    onParry: null
                }
            }
        },

        parried: {
            cast: 35,
            onEnter(pl, ctx) {
                playAnim(pl, 'animation.general.parried.right')
                ctx.setVelocity(pl, -90, 1.5)
                ctx.freeze(pl)
            },
            onLeave(pl, ctx) {
                ctx.unfreeze(pl)
            },
            transitions: {
                default: {
                    onEndOfLife: null
                },
                hit: {
                    onHurt: { allowedState: 'both' }
                }
            }
        },

        hit: {
            cast: 6,
            onEnter(pl, ctx) {
                ctx.setVelocity(pl, -90, 1, 0)
                playAnim(pl, 'animation.general.hit', 'default', 0.3)
                ctx.freeze(pl)
            },
            onLeave(pl, ctx) {
                ctx.unfreeze(pl)
            },
            transitions: {
                default: {
                    onEndOfLife: null
                }
            }
        }
    },
    entry: 'default'
}