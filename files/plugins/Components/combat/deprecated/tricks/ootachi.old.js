const { playAnim, playSoundAll } = require('../basic')
const { randomRange } = require('../../../utils/math')

/**
 * @type {TrickModule}
 */
module.exports = {
    sid: 'rgb39.weapon.ootachi',
    bind: [ 'weapon:ootachi', 'weapon:ootachi_akaoni', 'weapon:ootachi_dragon' ],
    entry: 'idle',
    moves: {
        idle: {
            cast: Infinity,
            onEnter(pl, ctx) {
                ctx.unfreeze(pl)
                ctx.releaseTarget(pl.uniqueId)
                if (ctx.previousStatus === 'running') {
                    ctx.task
                        .queue(() => playAnimCompatibility(pl, 'animation.weapon.ootachi.trans.running.idle'), 0)
                        .queue(() => playAnimCompatibility(pl, 'animation.weapon.ootachi.idle', 'animation.weapon.ootachi.idle'), 80)
                        .run()
                } else playAnimCompatibility(pl, 'animation.weapon.ootachi.idle', 'animation.weapon.ootachi.idle')
            },
            onLeave(_, ctx) {
                ctx.task.cancel()
            },
            transitions: {
                innoKamae: {
                    onLock: {
                        isOnGround: true
                    }
                },
                running: {
                    onChangeSprinting: { sprinting: true }
                },
                hurt: {
                    onHurt: {
                        allowedState: 'both'
                    }
                },
                combo1Attack: {
                    onAttack: null
                },
                combo1Chop: {
                    onUseItem: null
                },
                knockdown: {
                    onKnockdown: { allowedState: 'both' }
                },
            }
        },
        innoKamae: {
            cast: Infinity,
            onEnter(pl, ctx) {
                ctx.movement(pl)
                ctx.camera(pl, false)
                playAnimCompatibility(pl, 'animation.weapon.ootachi.kamae.inno', 'animation.weapon.ootachi.kamae.inno')
            },
            onTick(pl, ctx) {
                ctx.lookAtTarget(pl)
            },
            transitions: {
                idle: {
                    onReleaseLock: { allowedState: 'both' },
                    onJump: { allowedState: 'both' },
                },
                running: {
                    onChangeSprinting: {
                        sprinting: true,
                        allowedState: 'both'
                    }
                },
                combo1Attack: {
                    onAttack: { allowedState: 'both' }
                },
                combo1Chop: {
                    onUseItem: { allowedState: 'both' }
                },
                dodgePrepare: {
                    onSneak: { allowedState: 'both' }
                },
                hurt: {
                    onHurt: {
                        allowedState: 'both'
                    }
                },
                knockdown: {
                    onKnockdown: { allowedState: 'both' }
                },
            }
        },
        resumeKamae: {
            transitions: {
                idle: {
                    onEndOfLife: { hasTarget: false }
                },
                innoKamae: {
                    onEndOfLife: { hasTarget: true }
                },
            }
        },
        running: {
            cast: Infinity,
            onEnter(pl, ctx) {
                ctx.releaseTarget(pl.uniqueId)
                ctx.task
                    .queue(() => playAnimCompatibility(pl, 'animation.weapon.ootachi.trans.idle.running'), 0)
                    .queue(() => playAnimCompatibility(pl, 'animation.weapon.ootachi.running', 'animation.weapon.ootachi.running'), 80)
                    .run()
                
            },
            onLeave(_, ctx) {
                ctx.task.cancel()
            },
            transitions: {
                idle: {
                    onChangeSprinting: { sprinting: false }
                },
                hurt: {
                    onHurt: {
                        allowedState: 'both'
                    }
                },
                knockdown: {
                    onKnockdown: { allowedState: 'both' }
                },
            }
        },
        combo1Attack: {
            cast: 9,
            backswing: 1,
            onEnter(pl, ctx) {
                ctx.freeze(pl)
                ctx.task.queueList([
                    { handler: () => ctx.adsorbOrSetVelocity(pl, 0.5, 90), timeout: 0 },
                    { handler: () => ctx.adsorbOrSetVelocity(pl, 1, 90), timeout: 100 },
                    { handler: () => ctx.adsorbOrSetVelocity(pl, 0.8, 90), timeout: 300 },
                ]).run()
                playAnimCompatibility(pl, 'animation.weapon.ootachi.combo1.attack')
            },
            onAct(pl, ctx) {
                playSoundAll(`weapon.woosh.${randomRange(2, 4, true)}`, pl.pos, 1)
                ctx.selectFromSector(pl, {
                    radius: 3,
                    angle: 45,
                    rotation: -20,
                }).forEach(en => {
                    ctx.attack(pl, en, {
                        damage: 18,
                        knockback: 1,
                    })
                })
            },
            onLeave(_, ctx) {
                ctx.task.cancel()
            },
            transitions: {
                combo1Wait: {
                    onEndOfLife: null,
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
                knockdown: {
                    onKnockdown: { allowedState: 'both' }
                },
            }
        },
        combo1Chop: {
            cast: 11,
            backswing: 4,
            onEnter(pl, ctx) {
                ctx.freeze(pl)
                ctx.task.queueList([
                    { handler: () => {
                        ctx.adsorbOrSetVelocity(pl, 0.5, 90)
                        ctx.status.isWaitingParry = true
                    }, timeout: 0 },
                    { handler: () => ctx.status.isWaitingParry = false, timeout: 200 },
                    { handler: () => ctx.adsorbOrSetVelocity(pl, 1, 90), timeout: 200 },
                    { handler: () => ctx.adsorbOrSetVelocity(pl, 0.8, 90), timeout: 550 },
                ]).run()
                playAnimCompatibility(pl, 'animation.weapon.ootachi.combo1.chop')
            },
            onAct(pl, ctx) {
                playSoundAll(`weapon.woosh.${randomRange(2, 4, true)}`, pl.pos, 1)
                ctx.selectFromSector(pl, {
                    radius: 3,
                    angle: 30,
                    rotation: -15,
                }).forEach(en => {
                    ctx.attack(pl, en, {
                        damage: 24,
                        knockback: 1.5,
                    })
                })
            },
            onLeave(pl, ctx) {
                ctx.task.cancel()
            },
            timeline: {
                8: (pl, ctx) => {
                    ctx.trap(pl)
                }
            },
            transitions: {
                resumeKamae: {
                    onTrap: {
                        isOnGround: true,
                        preInput: 'onFeint'
                    },
                },
                combo1Wait: {
                    onEndOfLife: null,
                },
                hurt: {
                    onHurt: {
                        allowedState: 'both'
                    }
                },
                parry: {
                    onParry: {
                        allowedState: 'both'
                    }
                },
                parried: {
                    onParried: {
                        allowedState: 'backswing'
                    }
                },
                knockdown: {
                    onKnockdown: { allowedState: 'both' }
                },
            }
        },
        combo1Wait: {
            cast: 5,
            backswing: 6,
            onTick(pl, ctx) {
                ctx.lookAtTarget(pl)
            },
            timeline: {
                4: (pl, ctx) => ctx.trap(pl)
            },
            transitions: {
                combo2Cut: {
                    onTrap: {
                        preInput: 'onAttack'
                    },
                },
                combo2Sweap: {
                    onTrap: {
                        preInput: 'onUseItem'
                    },
                },
                resumeKamae: {
                    onEndOfLife: null,
                },
                hurt: {
                    onHurt: {
                        allowedState: 'both'
                    }
                },
            }
        },
        combo2Cut: {
            cast: 11,
            backswing: 4,
            onEnter(pl, ctx) {
                ctx.task.queue(() => {
                    playAnimCompatibility(pl, 'animation.weapon.ootachi.combo2.cut')
                    ctx.adsorbOrSetVelocity(pl, 0.2, 90)
                }, 100)
                    .queue(() => ctx.adsorbOrSetVelocity(pl, 1.2, 90), 350)
                    .run()
            },
            onAct(pl, ctx) {
                playSoundAll(`weapon.woosh.${randomRange(2, 4, true)}`, pl.pos, 1)
                ctx.selectFromSector(pl, {
                    radius: 2.6,
                    angle: 60,
                    rotation: -30
                }).forEach(en => {
                    ctx.attack(pl, en, {
                        damage: 20,
                        knockback: 1.2,
                    })
                })
            },
            onLeave(_, ctx) {
                ctx.task.cancel()
            },
            transitions: {
                combo2Wait: {
                    onEndOfLife: null,
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
                knockdown: {
                    onKnockdown: { allowedState: 'both' }
                },
            }
        },
        combo2Sweap: {
            cast: 16,
            backswing: 2,
            onEnter(pl, ctx) {
                ctx.task.queue(() => {
                    playAnimCompatibility(pl, 'animation.weapon.ootachi.combo2.sweap')
                    ctx.adsorbOrSetVelocity(pl, 0.2, 90)
                }, 100)
                    .queue(() => ctx.adsorbOrSetVelocity(pl, 1.2, 90), 200)
                    .run()
            },
            onAct(pl, ctx) {
                playSoundAll(`weapon.woosh.${randomRange(2, 4, true)}`, pl.pos, 1)
                ctx.selectFromSector(pl, {
                    radius: 3,
                    angle: 80,
                    rotation: -40
                }).forEach(en => {
                    ctx.attack(pl, en, {
                        damage: 28,
                        knockback: 1.2,
                    })
                })
            },
            onLeave(_, ctx) {
                ctx.task.cancel()
            },
            timeline: {
                10: (pl, ctx) => ctx.trap(pl)
            },
            transitions: {
                resumeKamae: {
                    onTrap: {
                        isOnGround: true,
                        preInput: 'onFeint'
                    },
                },
                combo2Wait: {
                    onEndOfLife: null,
                },
                parried: {
                    onParried: {
                        allowedState: 'backswing'
                    }
                },
                knockdown: {
                    onKnockdown: { allowedState: 'both' }
                },
            }
        },
        combo2Wait: {
            cast: 5,
            backswing: 4,
            onTick(pl, ctx) {
                ctx.lookAtTarget(pl)
            },
            timeline: {
                3: (pl, ctx) => ctx.trap(pl)
            },
            transitions: {
                resumeKamae: {
                    onEndOfLife: null,
                },
                combo3Stab: {
                    onTrap: {
                        preInput: 'onAttack'
                    }
                },
                combo3Sweap: {
                    onTrap: {
                        preInput: 'onUseItem'
                    }
                },
            }
        },
        combo3Stab: {
            cast: 8,
            backswing: 6,
            onEnter(pl, ctx) {
                playAnimCompatibility(pl, 'animation.weapon.ootachi.combo3.stab')
                ctx.task
                    .queue(() => ctx.adsorbOrSetVelocity(pl, 0.5, 90), 0)
                    .queue(() => ctx.adsorbOrSetVelocity(pl, 1, 90), 200)
                    .run()
            },
            onAct(pl, ctx) {
                playSoundAll(`weapon.woosh.${randomRange(2, 4, true)}`, pl.pos, 1)
                ctx.selectFromSector(pl, {
                    radius: 3.5,
                    angle: 30,
                    rotation: -15
                }).forEach(en => {
                    ctx.attack(pl, en, {
                        damage: 16,
                        knockback: 0.8,
                    })
                })
            },
            onLeave(_, ctx) {
                ctx.task.cancel()
            },
            transitions: {
                resumeKamae: {
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
                knockdown: {
                    onKnockdown: { allowedState: 'both' }
                },
            }
        },
        combo3Sweap: {
            cast: 17,
            backswing: 12,
            onEnter(pl, ctx) {
                playAnimCompatibility(pl, 'animation.weapon.ootachi.combo3.sweap')
                ctx.task
                    .queue(() => ctx.adsorbOrSetVelocity(pl, 2.5, 90), 700)
                    .queue(() => ctx.adsorbOrSetVelocity(pl, 1, 90), 280)
                    .run()
            },
            onAct(pl, ctx) {
                playSoundAll(`weapon.woosh.${randomRange(2, 4, true)}`, pl.pos, 1)
                ctx.selectFromSector(pl, {
                    radius: 3.5,
                    angle: 90,
                    rotation: -45
                }).forEach(en => {
                    ctx.attack(pl, en, {
                        damage: 35,
                        permeable: true,
                        knockback: 1.2,
                    })
                })
            },
            onLeave(_, ctx) {
                ctx.task.cancel()
            },
            timeline: {
                10: (pl, ctx) => ctx.trap(pl)
            },
            transitions: {
                resumeKamae: {
                    onEndOfLife: null,
                    onTrap: {
                        isOnGround: true,
                        preInput: 'onFeint'
                    }
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
                knockdown: {
                    onKnockdown: { allowedState: 'both' }
                },
            }
        },
        dodgePrepare: {
            cast: 1,
            backswing: 1,
            onEnter(pl, ctx) {
                ctx.movement(pl)
            },
            onAct(pl, ctx) {
                ctx.getMoveDir(pl).then(direct => {
                    direct = direct || 1
                    ctx.setVelocity(pl, direct * 90, 2)
                    direct !== 3 && ctx.adsorbToTarget(pl, 0.3)

                    if (direct !== 3) {
                        playAnimCompatibility(pl, 'animation.weapon.ootachi.dodge.front')
                    } else {
                        playAnimCompatibility(pl, 'animation.weapon.ootachi.dodge.back')
                    }
                })
            },
            onLeave(pl, ctx) {
                ctx.movement(pl, false)
            },
            transitions: {
                dodge: {
                    onEndOfLife: null
                }
            }
        },
        dodge: {
            cast: 8,
            onEnter(_, ctx) {
                ctx.status.isBlocking = true
            },
            onLeave(_, ctx) {
                ctx.status.isBlocking = false
            },
            timeline: {
                7: (pl, ctx) => ctx.trap(pl)
            },
            transitions: {
                resumeKamae: {
                    onEndOfLife: null
                },
                hlitStrike: {
                    onTrap: {
                        preInput: 'onUseItem'
                    }
                },
                dodgeBlocking: {
                    onBlock: {
                        allowedState: 'both'
                    }
                },
                knockdown: {
                    onKnockdown: {
                        allowedState: 'both'
                    }
                }
            }
        },
        dodgeBlocking: {
            cast: 0,
            onEnter(pl, ctx) {
                mc.runcmdEx(`execute as ${pl.name} at @s run particle minecraft:lava_particle ^^1^0.5`)
                mc.runcmdEx(`execute as ${pl.name} at @s run particle minecraft:lava_particle ^-0.1^1^0.5`)
                mc.runcmdEx(`execute as ${pl.name} at @s run particle minecraft:lava_particle ^0.1^1^0.5`)
                playSoundAll('weapon.heavy', pl.pos, 1)
            },
            transitions: {
                hlitStrike: {
                    onEndOfLife: null
                }
            }
        },
        hlitStrike: {
            cast: 6,
            backswing: 1,
            onEnter(pl, ctx) {
                playAnimCompatibility(pl, 'animation.weapon.ootachi.hlit')
                ctx.adsorbOrSetVelocity(pl, 3, 90)
            },
            onAct(pl, ctx) {
                ctx.selectFromSector(pl, {
                    radius: 2.6,
                    angle: 60,
                    rotation: -30
                }).forEach(en => {
                    ctx.attack(pl, en, {
                        damage: 8,
                        knockback: 3,
                        parryable: false,
                        permeable: true,
                        shock: true,
                    })
                })
            },
            transitions: {
                combo2Wait: {
                    onEndOfLife: null
                },
                hurt: {
                    onHurt: {
                        allowedState: 'both'
                    }
                },
                knockdown: {
                    onKnockdown: { allowedState: 'both' }
                },
            }
        },
        parry: {
            cast: 10,
            backswing: 10,
            onEnter(pl, ctx) {
                playSoundAll('weapon.parry', pl.pos, 1)
                ctx.status.isWaitingParry = true
                playAnimCompatibility(pl, 'animation.weapon.ootachi.parry')
                ctx.adsorbOrSetVelocity(pl, 8, 90)
            },
            onLeave(pl, ctx) {
                ctx.status.isWaitingParry = false
            },
            timeline: {
                14: (pl, ctx) => ctx.trap(pl)
            },
            transitions: {
                combo2Cut: {
                    onTrap: {
                        preInput: 'onAttack',
                        allowedState: 'both'
                    },
                },
                combo2Sweap: {
                    onTrap: {
                        preInput: 'onUseItem',
                        allowedState: 'both'
                    },
                },
                resumeKamae: {
                    onEndOfLife: null
                },
                parry: {
                    onParry: {
                        allowedState: 'both'
                    }
                },
                knockdown: {
                    onKnockdown: { allowedState: 'both' }
                },
            }
        },
        parried: {
            cast: 35,
            onEnter(pl, ctx) {
                ctx.status.disableInputs([
                    'onAttack',
                    'onUseItem'
                ])
                playAnimCompatibility(pl, 'animation.general.parried.right')
            },
            onLeave(pl, ctx) {
                ctx.status.enableInputs([
                    'onAttack',
                    'onUseItem'
                ])
            },
            transitions: {
                resumeKamae: {
                    onEndOfLife: null
                },
                hurt: {
                    onHurt: {
                        allowedState: 'both'
                    }
                },
                knockdown: {
                    onKnockdown: { allowedState: 'both' }
                },
            }
        },
        hurt: {
            cast: 8,
            onEnter(pl, ctx) {
                ctx.status.disableInputs([
                    'onAttack',
                    'onUseItem',
                ])
                playAnimCompatibility(pl, 'animation.general.hit', 'animation.general.hit')
            },
            onLeave(pl, ctx) {
                ctx.status.enableInputs([
                    'onAttack',
                    'onUseItem',
                ])
            },
            timeline: {
                7: (pl, ctx) => {
                    if (ctx.status.shocked) {
                        ctx.trap(pl, { tag: 'hitWall' })
                    }
                }
            },
            transitions: {
                resumeKamae: {
                    onEndOfLife: null
                },
                knockdown: {
                    onKnockdown: { allowedState: 'both' }
                },
                hitWall: {
                    onTrap: {
                        tag: 'hitWall',
                        allowedState: 'both',
                        isCollide: true,
                    }
                },
            }
        },
        knockdown: {
            cast: 30,
            onEnter: (pl, ctx) => {
                ctx.freeze(pl)
                ctx.status.disableInputs([
                    'onAttack',
                    'onUseItem'
                ])
                playAnimCompatibility(pl, 'animation.general.fell')
            },
            onLeave(pl, ctx) {
                ctx.unfreeze(pl)
                playAnimCompatibility(pl, 'animation.general.stand')
                ctx.status.enableInputs([
                    'onAttack',
                    'onUseItem'
                ])
            },
            transitions: {
                resumeKamae: {
                    onEndOfLife: null
                }
            }
        },

        hitWall: {
            cast: 25,
            onEnter: (pl, ctx) => {
                ctx.freeze(pl)
                ctx.status.disableInputs([
                    'onAttack',
                    'onUseItem',
                ])
                playAnimCompatibility(pl, 'animation.general.hit_wall')
            },
            onLeave(pl, ctx) {
                ctx.unfreeze(pl)
                ctx.status.enableInputs([
                    'onAttack',
                    'onUseItem',
                ])
            },
            transitions: {
                resumeKamae: {
                    onEndOfLife: null
                }
            }
        }
    }
}