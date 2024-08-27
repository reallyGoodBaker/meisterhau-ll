import { playAnim, playSoundAll } from "../basic/index"
import { randomRange } from '../../utils/math'
import { DefaultMoves, DefaultTrickModule } from '../basic/default'
import { Stamina } from 'combat/basic/components/stamina'

class OotachiMoves extends DefaultMoves {
    constructor() {
        super()

        this.setup<OotachiMoves>('resumeKamae')
        this.parry.timeline = {
            14: (pl, ctx) => ctx.trap(pl)
        }
        this.parry.transitions = {
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

        this.parried.transitions = {
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

        this.animations.parry.left = 'animation.weapon.ootachi.parry.left'
        this.animations.parry.right = 'animation.weapon.ootachi.parry.right'
        this.animations.block.left = 'animation.weapon.ootachi.block.left'
        this.animations.block.right = 'animation.weapon.ootachi.block.right'
    }

    idle: Move = {
        cast: Infinity,
        onEnter(pl, ctx) {
            ctx.unfreeze(pl)
            ctx.releaseTarget(pl.xuid)
            if (ctx.previousStatus === 'running') {
                ctx.task
                    .queue(() => playAnim(pl, 'animation.weapon.ootachi.trans.running.idle'), 0)
                    .queue(() => playAnim(pl, 'animation.weapon.ootachi.idle', 'animation.weapon.ootachi.idle'), 210)
                    .run()
            } else playAnim(pl, 'animation.weapon.ootachi.idle', 'animation.weapon.ootachi.idle')
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
                onAttack: {
                    stamina: 16,
                }
            },
            knockdown: {
                onKnockdown: { allowedState: 'both' }
            },
        }
    }

    innoKamae: Move = {
        cast: Infinity,
        onEnter(pl, ctx) {
            ctx.freeze(pl)
            playAnim(pl, 'animation.weapon.ootachi.kamae.inno', 'animation.weapon.ootachi.kamae.inno')
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
                onAttack: {
                    allowedState: 'both',
                    stamina: 16,
                }
            },
            combo1Chop: {
                onUseItem: {
                    allowedState: 'both',
                    stamina: 22,
                }
            },
            dodgePrepare: {
                onSneak: null
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
    }

    resumeKamae: Move = {
        transitions: {
            idle: {
                onEndOfLife: {
                    hasTarget: false
                }
            },
            dodgePrepare: {
                onEndOfLife: {
                    hasTarget: true,
                    preInput: 'onSneak'
                }
            },
            combo1Attack: {
                onEndOfLife: {
                    hasTarget: true,
                    preInput: 'onAttack'
                }
            },
            combo1Chop: {
                onEndOfLife: {
                    hasTarget: true,
                    preInput: 'onUseItem'
                }
            },
            innoKamae: {
                onEndOfLife: {
                    hasTarget: true
                }
            },
        }
    }

    running: Move = {
        cast: Infinity,
        onEnter(pl, ctx) {
            ctx.releaseTarget(pl.xuid)
            ctx.task
                .queue(() => playAnim(pl, 'animation.weapon.ootachi.trans.idle.running'), 0)
                .queue(() => playAnim(pl, 'animation.weapon.ootachi.running', 'animation.weapon.ootachi.running'), 210)
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
    }

    combo1Attack: Move = {
        cast: 7,
        backswing: 13,
        timeline: {
            5: (_, ctx) => ctx.status.isBlocking = false,
            7: pl => playSoundAll(`weapon.woosh.${randomRange(2, 4, true)}`, pl.pos, 1),
            14: (pl, ctx) => ctx.trap(pl, { tag: 'combo' })
        },
        onEnter(pl, ctx) {
            ctx.status.componentManager.getComponent(Stamina).unwrap().stamina -= 16
            ctx.status.isBlocking = true
            ctx.freeze(pl)
            ctx.task.queueList([
                { handler: () => ctx.adsorbOrSetVelocity(pl, 0.5, 90), timeout: 0 },
                { handler: () => ctx.adsorbOrSetVelocity(pl, 1, 90), timeout: 100 },
                { handler: () => ctx.adsorbOrSetVelocity(pl, 0.8, 90), timeout: 300 },
            ]).run()
            playAnim(pl, 'animation.weapon.ootachi.combo1.attack')
            ctx.lookAtTarget(pl)
        },
        onAct(pl, ctx) {
            ctx.selectFromRange(pl, {
                radius: 3,
                angle: 45,
                rotation: -20,
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 18,
                    knockback: 1,
                    direction: 'left',
                })
            })
        },
        onLeave(_, ctx) {
            ctx.status.isBlocking = false
            ctx.task.cancel()
        },
        transitions: {
            resumeKamae: {
                onEndOfLife: null,
                onBlock: null,
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
                onKnockdown: { allowedState: 'both' }
            },
            combo2Cut: {
                onTrap: {
                    tag: 'combo',
                    hasTarget: true,
                    preInput: 'onAttack',
                    stamina: 16,
                }
            },
            combo2Sweap: {
                onTrap: {
                    tag: 'combo',
                    hasTarget: true,
                    preInput: 'onUseItem',
                    stamina: 28,
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

    combo1Chop: Move = {
        cast: 11,
        backswing: 13,
        onEnter(pl, ctx) {
            ctx.freeze(pl)
            ctx.status.componentManager.getComponent(Stamina).unwrap().stamina -= 22
            ctx.status.isWaitingParry = true
            ctx.task.queueList([
                { handler: () => ctx.adsorbOrSetVelocity(pl, 1, 90), timeout: 0 },
                { handler: () => ctx.status.isWaitingParry = false, timeout: 150 },
                { handler: () => {
                    ctx.adsorbOrSetVelocity(pl, 1.2, 90)
                }, timeout: 50 },
                { handler: () => ctx.adsorbOrSetVelocity(pl, 0.5, 90), timeout: 400 },
            ]).run()
            playAnim(pl, 'animation.weapon.ootachi.combo1.chop')
            ctx.lookAtTarget(pl)
        },
        onAct(pl, ctx) {
            playSoundAll(`weapon.woosh.${randomRange(2, 4, true)}`, pl.pos, 1)
            ctx.selectFromRange(pl, {
                radius: 3,
                angle: 120,
                rotation: -60,
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 24,
                    knockback: 1.5,
                    direction: 'left',
                })
            })
        },
        onLeave(pl, ctx) {
            ctx.task.cancel()
            ctx.status.isWaitingParry = false
        },
        timeline: {
            8: (pl, ctx) => {
                ctx.trap(pl, { tag: 'feint' })
            },
            10: (pl, ctx) => {
                ctx.trap(pl, { tag: 'hlit' })
            },
            17: (pl, ctx) => ctx.trap(pl, { tag: 'combo' })
        },
        transitions: {
            resumeKamae: {
                onTrap: {
                    tag: 'feint',
                    isOnGround: true,
                    preInput: 'onFeint'
                },
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
            combo2Cut: {
                onTrap: {
                    tag: 'combo',
                    hasTarget: true,
                    preInput: 'onAttack',
                    stamina: 16,
                }
            },
            combo2Sweap: {
                onTrap: {
                    tag: 'combo',
                    hasTarget: true,
                    preInput: 'onUseItem',
                    stamina: 28,
                }
            },
            hlitStrike: {
                onTrap: {
                    tag: 'hlit',
                    hasTarget: true,
                    preInput: 'onAttack'
                }
            }
        }
    }

    combo2Cut: Move = {
        cast: 9,
        backswing: 17,
        onEnter(pl, ctx) {
            ctx.status.componentManager.getComponent(Stamina).unwrap().stamina -= 18
            ctx.lookAtTarget(pl)
            ctx.freeze(pl)
            playAnim(pl, `animation.weapon.ootachi.combo2.cut.${
                ctx.previousStatus === 'combo1Attack' ? 'l' : 'r'
            }`)
            ctx.adsorbOrSetVelocity(pl, 1, 90, 1.5)
        },
        onAct(pl, ctx) {
            playSoundAll(`weapon.woosh.${randomRange(2, 4, true)}`, pl.pos, 1)
            ctx.selectFromRange(pl, {
                radius: 3.5,
                angle: 50,
                rotation: -25
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 18,
                    knockback: 1.2,
                    trace: true,
                    direction: 'middle',
                })
            })
        },
        onLeave(_, ctx) {
            ctx.unfreeze(_)
            ctx.task.cancel()
        },
        timeline: {
            7: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 2, 90),
            16: (pl, ctx) => ctx.trap(pl, { tag: 'combo' })
        },
        transitions: {
            resumeKamae: {
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
            combo3Stab: {
                onTrap: {
                    tag: 'combo',
                    preInput: 'onAttack',
                    hasTarget: true,
                    stamina: 12,
                }
            },
            combo3Sweap: {
                onTrap: {
                    tag: 'combo',
                    preInput: 'onUseItem',
                    hasTarget: true,
                    stamina: 33,
                }
            },
            blocked: {
                onBlocked: null
            },
        }
    }


    combo2Sweap: Move = {
        cast: 12,
        backswing: 14,
        onEnter(pl, ctx) {
            ctx.status.componentManager.getComponent(Stamina).unwrap().stamina -= 28
            ctx.lookAtTarget(pl)
            ctx.freeze(pl)
            ctx.status.hegemony = true
            ctx.status.repulsible = false
            playAnim(pl, `animation.weapon.ootachi.combo2.sweap.${
                ctx.previousStatus === 'combo1Attack' ? 'l' : 'r'
            }`)
            ctx.adsorbOrSetVelocity(pl, 0.2, 90)
            ctx.task
                .queue(() => ctx.adsorbOrSetVelocity(pl, 1.2, 90), 200)
                .run()
        },
        onAct(pl, ctx) {
            playSoundAll(`weapon.woosh.${randomRange(2, 4, true)}`, pl.pos, 1)
            ctx.selectFromRange(pl, {
                radius: 3,
                angle: 80,
                rotation: -40
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 28,
                    knockback: 1.2,
                    direction: 'right',
                })
            })
        },
        onLeave(_, ctx) {
            ctx.status.hegemony = false
            ctx.status.repulsible = true
            ctx.task.cancel()
            ctx.unfreeze(_)
        },
        timeline: {
            10: (pl, ctx) => ctx.trap(pl, { tag: 'feint' }),
            20: (pl, ctx) => ctx.trap(pl, { tag: 'combo' }),
        },
        transitions: {
            resumeKamae: {
                onTrap: {
                    tag: 'feint',
                    isOnGround: true,
                    preInput: 'onFeint'
                },
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
            hurt: {
                onInterrupted: { allowedState: 'both' }
            },
            combo3Stab: {
                onTrap: {
                    tag: 'combo',
                    preInput: 'onAttack',
                    hasTarget: true,
                    stamina: 12,
                }
            },
            combo3Sweap: {
                onTrap: {
                    tag: 'combo',
                    preInput: 'onUseItem',
                    hasTarget: true,
                    stamina: 33,
                }
            },
        }
    }

    combo3Stab: Move = {
        cast: 8,
        backswing: 17,
        onEnter(pl, ctx) {
            ctx.status.componentManager.getComponent(Stamina).unwrap().stamina -= 17
            ctx.freeze(pl)
            playAnim(pl, `animation.weapon.ootachi.combo3.stab.${
                ctx.previousStatus === 'combo2Cut' ? 'l' : 'r'
            }`)
            ctx.task
                .queue(() => ctx.adsorbOrSetVelocity(pl, 0.5, 90), 0)
                .queue(() => ctx.adsorbOrSetVelocity(pl, 1, 90), 200)
                .run()
        },
        onAct(pl, ctx) {
            ctx.lookAtTarget(pl)
            playSoundAll(`weapon.woosh.${randomRange(2, 4, true)}`, pl.pos, 1)
            ctx.selectFromRange(pl, {
                radius: 3.5,
                angle: 30,
                rotation: -15
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 16,
                    knockback: 0.8,
                    direction: 'left',
                })
            })
        },
        onLeave(_, ctx) {
            ctx.task.cancel()
            ctx.unfreeze(_)
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
            blocked: {
                onBlocked: {
                    allowedState: 'backswing',
                }
            },
        }
    }

    combo3Sweap: Move = {
        cast: 16,
        backswing: 19,
        onEnter(pl, ctx) {
            ctx.status.componentManager.getComponent(Stamina).unwrap().stamina -= 33
            ctx.lookAtTarget(pl)
            ctx.freeze(pl)
            ctx.adsorbOrSetVelocity(pl, 1, 90)
            playAnim(pl, `animation.weapon.ootachi.combo3.sweap.${
                ctx.previousStatus === 'combo2Cut' ? 'l' : 'r'
            }`)
            ctx.task
                .queue(() => ctx.adsorbOrSetVelocity(pl, 1, 90), 200)
                .queue(() => ctx.adsorbOrSetVelocity(pl, 1, 90), 280)
                .run()
        },
        onAct(pl, ctx) {
            playSoundAll(`weapon.woosh.${randomRange(2, 4, true)}`, pl.pos, 1)
            ctx.selectFromRange(pl, {
                radius: 3.5,
                angle: 90,
                rotation: -45
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 35,
                    permeable: true,
                    knockback: 1.2,
                    direction: 'vertical',
                })
            })
        },
        onLeave(_, ctx) {
            ctx.task.cancel()
            ctx.unfreeze(_)
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
    }

    dodgePrepare: Move = {
        cast: 0,
        backswing: 1,
        onEnter(pl, ctx) {
            ctx.movement(pl)
            ctx.getMoveDir(pl).then(direct => {
                direct = direct || 1
                if (direct !== 1) {
                    ctx.setVelocity(pl, direct * 90, 2)
                } else {
                    ctx.adsorbToTarget(pl, 2)
                }
                direct !== 3 && ctx.adsorbToTarget(pl, 0.3)

                if (direct !== 3) {
                    playAnim(pl, 'animation.weapon.ootachi.dodge.front')
                } else {
                    playAnim(pl, 'animation.weapon.ootachi.dodge.back')
                }
            })
        },
        onLeave(pl, ctx) {
            ctx.movement(pl, false)
        },
        transitions: {
            dodge: {
                onEndOfLife: null
            },
            hurt: {
                onHurt: null
            }
        }
    }

    dodge: Move = {
        cast: 3,
        backswing: 5,
        onEnter(_, ctx) {
            const manager = ctx.status.componentManager
            manager.getComponent(Stamina).unwrap().setCooldown(10)
            ctx.status.isBlocking = true
        },
        onAct(_, ctx) {
            ctx.status.isBlocking = false
            ctx.status.isDodging = true
        },
        onLeave(_, ctx) {
            ctx.status.isBlocking = false
            ctx.status.isDodging = false
        },
        timeline: {
            7: (_, ctx) => ctx.status.isDodging = false
        },
        transitions: {
            resumeKamae: {
                onEndOfLife: null
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
            },
            hurt: {
                onHurt: { allowedState: 'both' }
            }
        }
    }

    dodgeBlocking: Move = {
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
            },
            hurt: {
                onHurt: null
            }
        }
    }

    /**
     * @type {Move}
     */
    hlitStrike: Move = {
        cast: 6,
        backswing: 4,
        onEnter(pl, ctx) {
            ctx.status.componentManager.getComponent(Stamina).unwrap().stamina -= 12
            playAnim(pl, 'animation.weapon.ootachi.hlit')
            ctx.adsorbOrSetVelocity(pl, 3, 90, 0.5)
        },
        onAct(pl, ctx) {
            ctx.selectFromRange(pl, {
                radius: 1.5,
                angle: 60,
                rotation: -30
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 8,
                    knockback: 3,
                    parryable: false,
                    permeable: true,
                    stiffness: 900,
                    shock: true,
                    powerful: true,
                    direction: 'middle',
                })
            })
        },
        timeline: {
            9: (pl, ctx) => ctx.trap(pl)
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
            combo3Stab: {
                onTrap: {
                    preInput: 'onAttack',
                    hasTarget: true,
                    stamina: 12,
                }
            },
            combo3Sweap: {
                onTrap: {
                    preInput: 'onUseItem',
                    hasTarget: true,
                    stamina: 33,
                }
            },
        }
    }
}

class OotachiTricks extends DefaultTrickModule {
    constructor() {
        super(
            'rgb39.weapon.ootachi',
            'idle',
            [ 'weapon:ootachi', 'weapon:ootachi_akaoni', 'weapon:ootachi_dragon' ],
            new OotachiMoves()
        )
    }
}

export const tricks = new OotachiTricks()