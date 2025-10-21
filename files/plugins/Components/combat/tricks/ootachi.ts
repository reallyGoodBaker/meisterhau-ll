import { playAnim, playAnimCompatibility, playSoundAll } from '../basic/index';
import { randomRange } from '../../utils/math'
import { setVelocityByOrientation, DefaultMoves, DefaultTrickModule, IncomingAttack } from '../basic/default'
import { Stamina } from '@combat/basic/components/core/stamina'
import { input } from "scripts-rpc/func/input"

class OotachiMoves extends DefaultMoves {
    constructor() {
        super()

        this.setup<OotachiMoves>('resumeKamae')
        this.parry.timeline = {
            14: (pl, ctx) => ctx.trap(pl)
        }

        this.setTransition<OotachiMoves>('parry', 'combo2Sweap', {
            onTrap: {
                preInput: 'onUseItem',
            }
        })

        this.animations.parry.left = 'animation.weapon.ootachi.parry.left'
        this.animations.parry.right = 'animation.weapon.ootachi.parry.right'
        this.animations.block.left = 'animation.weapon.ootachi.block.left'
        this.animations.block.right = 'animation.weapon.ootachi.block.right'
    }

    idle: Move = {
        cast: Infinity,
        onEnter(pl, ctx) {
            ctx.unfreeze(pl)
            ctx.releaseTarget(pl.uniqueId)
            if (ctx.previousStatus === 'running') {
                ctx.task
                    .queue(() => playAnimCompatibility(pl, 'animation.weapon.ootachi.trans.running.idle'), 0)
                    .queue(() => playAnimCompatibility(pl, 'animation.weapon.ootachi.idle', 'animation.weapon.ootachi.idle'), 210)
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
                onHurt: null
            },
        }
    }

    innoKamae: Move = {
        cast: Infinity,
        onEnter(pl, ctx) {
            ctx.freeze(pl)
            playAnimCompatibility(pl, 'animation.weapon.ootachi.kamae.inno', 'animation.weapon.ootachi.kamae.inno')
        },
        onTick(pl, ctx) {
            ctx.lookAtTarget(pl)
        },
        transitions: {
            idle: {
                onReleaseLock: null,
                onJump: null,
            },
            running: {
                onChangeSprinting: {
                    sprinting: true,
                }
            },
            combo1Attack: {
                onAttack: {
                    stamina: 16,
                }
            },
            combo1Chop: {
                onUseItem: {
                    stamina: 22,
                }
            },
            dodgePrepare: {
                onDodge: null
            },
            hurt: {
                onHurt: null
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
                    preInput: 'onDodge'
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
            hurt: {
                onHurt: null
            }
        }
    }

    running: Move = {
        cast: Infinity,
        onEnter(pl, ctx) {
            ctx.releaseTarget(pl.uniqueId)
            ctx.task
                .queue(() => playAnimCompatibility(pl, 'animation.weapon.ootachi.trans.idle.running'), 0)
                .queue(() => playAnimCompatibility(pl, 'animation.weapon.ootachi.running', 'animation.weapon.ootachi.running'), 210)
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
                onHurt: null
            },
        }
    }

    combo1Attack: Move = {
        cast: 8,
        backswing: 12,
        timeline: {
            2: (pl, ctx) => setVelocityByOrientation(pl as Player, ctx, 1.4, 1),
            4: (_, ctx) => ctx.status.isBlocking = false,
            7: pl => playSoundAll(`weapon.woosh.${randomRange(2, 4, true)}`, pl.pos, 1),
            14: (pl, ctx) => ctx.trap(pl, { tag: 'combo' })
        },
        onEnter(pl, ctx) {
            ctx.status.componentManager.getComponent(Stamina).unwrap().stamina -= 16
            ctx.status.isBlocking = true
            ctx.freeze(pl)
            setVelocityByOrientation(pl as Player, ctx, 0.5, 1)
            playAnimCompatibility(pl, 'animation.weapon.ootachi.combo1.attack')
        },
        onAct(pl, ctx) {
            ctx.selectFromSector(pl, {
                radius: 3,
                angle: 45,
                rotation: -20,
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 18,
                    knockback: 1,
                    direction: 'left',
                })
                ctx.lookAtTarget(pl)
            })
        },
        onLeave(_, ctx) {
            ctx.status.isBlocking = false
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
                onParried: null
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
                onBlocked: null
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
            ctx.task.queueList([
                { handler: () => ctx.adsorbOrSetVelocity(pl, 1, 90), timeout: 0 },
                { handler: () => {
                    ctx.adsorbOrSetVelocity(pl, 1.2, 90)
                }, timeout: 200 },
                { handler: () => ctx.adsorbOrSetVelocity(pl, 0.5, 90), timeout: 400 },
            ]).run()
            playAnimCompatibility(pl, 'animation.weapon.ootachi.combo1.chop')
            ctx.lookAtTarget(pl)
        },
        onAct(pl, ctx) {
            playSoundAll(`weapon.woosh.${randomRange(2, 4, true)}`, pl.pos, 1)
            ctx.selectFromSector(pl, {
                radius: 3,
                angle: 120,
                rotation: -60,
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 26,
                    knockback: 1.5,
                    direction: 'left',
                })
                ctx.lookAtTarget(pl)
            })
        },
        onLeave(pl, ctx) {
            ctx.task.cancel()
            ctx.status.isWaitingParry = false
        },
        timeline: {
            1: (_, ctx) => ctx.status.isWaitingParry = true,
            4: (_, ctx) => ctx.status.isWaitingParry = false,
            8: (pl, ctx) => {
                ctx.trap(pl, { tag: 'feint' })
            },
            9: (pl, ctx) => ctx.trap(pl, { tag: 'hlit' }),
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
                onHurt: null
            },
            parry: {
                onParry: null
            },
            parried: {
                onParried: null
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
            playAnimCompatibility(pl, `animation.weapon.ootachi.combo2.cut.${
                ctx.previousStatus === 'combo1Attack' ? 'l' : 'r'
            }`)
            ctx.adsorbOrSetVelocity(pl, 1, 90, 1.5)
        },
        onAct(pl, ctx) {
            playSoundAll(`weapon.woosh.${randomRange(2, 4, true)}`, pl.pos, 1)
            ctx.selectFromSector(pl, {
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
                ctx.lookAtTarget(pl)
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
                onHurt: null
            },
            parried: {
                onParried: null
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
        cast: 13,
        backswing: 13,
        onEnter(pl, ctx) {
            ctx.status.componentManager.getComponent(Stamina).unwrap().stamina -= 28
            ctx.lookAtTarget(pl)
            ctx.freeze(pl)
            ctx.status.hegemony = true
            ctx.status.repulsible = false
            if (ctx.previousStatus === 'parry') {
                const parryDir = ctx.components.getComponent(IncomingAttack).unwrap().approximateAttackDirection()
                if (parryDir === 'left') {
                    playAnimCompatibility(pl, 'animation.weapon.ootachi.combo2.sweap.r2')
                    ctx.adsorbOrSetVelocity(pl, 1, 180)
                } else {
                    playAnimCompatibility(pl, 'animation.weapon.ootachi.combo2.sweap.r')
                    ctx.adsorbOrSetVelocity(pl, 0.2, 90)
                }
            } else {
                playAnimCompatibility(pl, `animation.weapon.ootachi.combo2.sweap.${ctx.previousStatus === 'combo1Attack' ? 'l' : 'r'}`)
                ctx.adsorbOrSetVelocity(pl, 0.2, 90)
            }
            ctx.task
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
                    direction: 'right',
                })
            })
            ctx.lookAtTarget(pl)
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
                onParried: null
            },
            hurt: {
                onInterrupted: null
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
        cast: 9,
        backswing: 16,
        onEnter(pl, ctx) {
            ctx.status.componentManager.getComponent(Stamina).unwrap().stamina -= 17
            ctx.freeze(pl)
            playAnimCompatibility(pl, `animation.weapon.ootachi.combo3.stab.${
                ctx.previousStatus === 'combo2Sweap' ? 'r' : 'l'
            }`)
            ctx.task
                .queue(() => ctx.adsorbOrSetVelocity(pl, 0.5, 90), 0)
                .queue(() => ctx.adsorbOrSetVelocity(pl, 1, 90), 200)
                .run()
        },
        onAct(pl, ctx) {
            ctx.lookAtTarget(pl)
            playSoundAll(`weapon.woosh.${randomRange(2, 4, true)}`, pl.pos, 1)
            ctx.selectFromSector(pl, {
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
                onHurt: null
            },
            parried: {
                onParried: null
            },
            blocked: {
                onBlocked: null
            },
        }
    }

    combo3Sweap: Move = {
        cast: 18,
        backswing: 17,
        onEnter(pl, ctx) {
            ctx.status.componentManager.getComponent(Stamina).unwrap().stamina -= 33
            ctx.lookAtTarget(pl)
            ctx.freeze(pl)
            ctx.adsorbOrSetVelocity(pl, 1, 90)
            playAnimCompatibility(pl, `animation.weapon.ootachi.combo3.sweap.${
                ctx.previousStatus === 'combo2Sweap' ? 'r' : 'l'
            }`)
            ctx.task
                .queue(() => ctx.adsorbOrSetVelocity(pl, 1, 90), 200)
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
                    direction: 'vertical',
                })
            })
            ctx.lookAtTarget(pl)
        },
        onLeave(_, ctx) {
            ctx.task.cancel()
            ctx.unfreeze(_)
            ctx.status.hegemony = false
        },
        timeline: {
            9: (_, ctx) => ctx.status.hegemony = true,
            8: (pl, ctx) => ctx.trap(pl),
            25: (_, ctx) => ctx.status.hegemony = false,
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
                onInterrupted: null
            },
            parried: {
                onParried: null
            },
        }
    }

    dodgePrepare: Move = {
        cast: 0,
        backswing: 1,
        onEnter(pl, ctx) {
            ctx.movement(pl)
            const direct = input.approximateOrientation(pl as Player)
            if (direct !== 1) {
                ctx.setVelocity(pl, direct * 90, 2.5)
            } else {
                ctx.adsorbToTarget(pl, 2)
            }

            if (direct !== 3) {
                playAnimCompatibility(pl, 'animation.weapon.ootachi.dodge.front')
            } else {
                playAnimCompatibility(pl, 'animation.weapon.ootachi.dodge.back')
            }

            ctx.trap(pl, { tag: direct === 1 ? 'front' : 'side' })
        },
        onLeave(pl, ctx) {
            ctx.movement(pl, false)
        },
        transitions: {
            dodge: {
                onTrap: {
                    tag: 'side'
                }
            },
            dodgeFront: {
                onTrap: {
                    tag: 'front'
                }
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
                onBlock: null
            },
            hurt: {
                onHurt: null
            }
        }
    }

    dodgeFront: Move = {
        cast: 4,
        backswing: 4,
        onEnter(_, ctx) {
            ctx.status.repulsible = false
            const manager = ctx.status.componentManager
            manager.getComponent(Stamina).unwrap().setCooldown(10)
            ctx.status.isBlocking = true
        },
        onAct(_, ctx) {
            ctx.status.isBlocking = false
        },
        onLeave(_, ctx) {
            ctx.status.repulsible = true
            ctx.status.isBlocking = false
        },
        timeline: {
            3: (pl, ctx) => ctx.trap(pl)
        },
        transitions: {
            resumeKamae: {
                onEndOfLife: null
            },
            dodgeBlocking: {
                onBlock: null
            },
            hurt: {
                onHurt: null
            },
            dodgeChop: {
                onTrap: {
                    preInput: 'onUseItem',
                }
            }
        }
    }

    dodgeChop: Move = {
        cast: 20,
        transitions: {
            parried: {
                onParried: null
            },
            hurt: {
                onHurt: null
            },
            resumeKamae: {
                onEndOfLife: null
            },
            combo3Stab: {
                onTrap: {
                    preInput: 'onAttack',
                }
            },
            combo3Sweap: {
                onTrap: {
                    preInput: 'onUseItem',
                }
            }
        },
        onEnter(pl, ctx) {
            ctx.freeze(pl)
            ctx.status.componentManager.getComponent(Stamina).unwrap().stamina -= 20
            ctx.lookAtTarget(pl)
            playAnimCompatibility(pl, 'animation.weapon.ootachi.dodge.heavy', 'animation.weapon.ootachi.dodge.heavy')
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
        },
        timeline: {
            14: (pl, ctx) => ctx.trap(pl),
            8: pl => playSoundAll('weapon.woosh.3', pl.pos, 1),
            10: (pl, ctx) => ctx.selectFromSector(pl, {
                angle: 40,
                radius: 3,
                rotation: -20,
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 18,
                    direction: 'vertical'
                })
            }),
            3: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 0.8, 90),
            5: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 1, 90),
            7: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 0.5, 90),
        }
    }

    dodgeBlocking: Move = {
        onEnter(pl, ctx) {
            ctx.status.repulsible = false
            mc.runcmdEx(`execute as ${pl.name} at @s run particle minecraft:lava_particle ^^1^0.5`)
            mc.runcmdEx(`execute as ${pl.name} at @s run particle minecraft:lava_particle ^-0.1^1^0.5`)
            mc.runcmdEx(`execute as ${pl.name} at @s run particle minecraft:lava_particle ^0.1^1^0.5`)
            playSoundAll('weapon.heavy', pl.pos, 1)
        },
        onLeave(pl, ctx) {
            ctx.status.repulsible = true
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
        cast: 7,
        backswing: 3,
        onEnter(pl, ctx) {
            ctx.status.repulsible = false
            ctx.status.componentManager.getComponent(Stamina).unwrap().stamina -= 12
            playAnimCompatibility(pl, 'animation.weapon.ootachi.hlit')
            ctx.adsorbOrSetVelocity(pl, 3, 90, 0.5)
        },
        onAct(pl, ctx) {
            ctx.selectFromSector(pl, {
                radius: 1.5,
                angle: 60,
                rotation: -30
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 8,
                    knockback: 3,
                    parryable: false,
                    permeable: true,
                    stiffness: 700,
                    shock: true,
                    powerful: true,
                    direction: 'middle',
                })
            })
        },
        onLeave(_, ctx) {
            ctx.status.repulsible = false
        },
        timeline: {
            9: (pl, ctx) => ctx.trap(pl)
        },
        transitions: {
            resumeKamae: {
                onEndOfLife: null
            },
            hurt: {
                onHurt: null
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
            [ 'weapon:ootachi', 'weapon:ootachi_akaoni', 'weapon:ootachi_dragon', 'monogatari:kokorowatari' ],
            new OotachiMoves()
        )
    }
}

export const tricks = new OotachiTricks()