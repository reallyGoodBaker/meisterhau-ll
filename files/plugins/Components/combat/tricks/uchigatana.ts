import { playAnim, playSoundAll } from "../basic/index"
import { DefaultMoves, DefaultTrickModule, IncomingAttack, setVelocityByOrientation } from '../basic/default'
import { input } from "scripts-rpc/func/input"
import { Stamina } from "@combat/basic/components/core/stamina"

class UchigatanaMoves extends DefaultMoves {
    constructor() {
        super()

        this.setup<UchigatanaMoves>('resume')
        this.animations.block.left = 'animation.weapon.uchigatana.block.left'
        this.animations.block.right = 'animation.weapon.uchigatana.block.right'
        this.animations.parry.left = 'animation.weapon.uchigatana.parry.left'
        this.animations.parry.right = 'animation.weapon.uchigatana.parry.right'

        this.setTransition<UchigatanaMoves>('parry', 'parryCounter', {
            onTrap: {
                tag: 'counter',
                preInput: 'onUseItem',
                stamina: 20
            }
        })
    }

    hold: Move = {
        cast: Infinity,
        onEnter(pl, ctx) {
            playAnim(pl, 'animation.weapon.uchigatana.hold', 'animation.weapon.uchigatana.hold')
        },
        transitions: {
            kamae: {
                onLock: null,
            },
            hurt: {
                onHurt: null
            },
            running: {
                onChangeSprinting: {
                    sprinting: true
                }
            },
        }
    }

    kamae: Move = {
        cast: Infinity,
        onEnter(pl) {
            playAnim(pl, 'animation.weapon.uchigatana.kamae', 'animation.weapon.uchigatana.kamae')
        },
        transitions: {
            hold: {
                onReleaseLock: null,
                onChangeSprinting: null,
                onJump: null,
            },
            hurt: {
                onHurt: null
            },
            attack1: {
                onAttack: {
                    hasTarget: true,
                    stamina: 15,
                },
            },
            attack1Heavy: {
                onUseItem: {
                    hasTarget: true,
                    stamina: 20,
                }
            },
            dodge: {
                onDodge: null
            },
            raidoEnter: {
                onSneak: {
                    stamina: 10,
                }
            }
        }
    }

    running: Move = {
        cast: Infinity,
        onEnter(pl) {
            playAnim(pl, 'animation.weapon.uchigatana.running', 'animation.weapon.uchigatana.running')
        },
        transitions: {
            resume: {
                onChangeSprinting: {
                    sprinting: false
                }
            },
            hurt: {
                onHurt: null
            },
        }
    }

    resume: Move = {
        transitions: {
            hold: {
                onEndOfLife: {
                    hasTarget: false
                }
            },
            kamae: {
                onEndOfLife: {
                    hasTarget: true
                }
            },
            hurt: {
                onHurt: null
            },
        }
    }

    attack1: Move = {
        cast: 12,
        backswing: 9,
        onEnter(pl, ctx) {
            ctx.components.getComponent(Stamina).unwrap().stamina -= 15
            ctx.status.isBlocking = true
            ctx.freeze(pl)
            ctx.lookAtTarget(pl)
            playAnim(pl, 'animation.weapon.uchigatana.attack1')
        },
        onAct(pl, ctx) {
            ctx.trap(pl)
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
            ctx.status.isBlocking = false
        },
        timeline: {
            0: (pl, ctx) => setVelocityByOrientation(pl as Player, ctx, 0.5),
            4: (pl, ctx) => {
                ctx.status.isBlocking = false
                setVelocityByOrientation(pl as Player, ctx, 1.5)
            },
            6: pl => playSoundAll(`weapon.woosh.2`, pl.pos, 1),
            7: (pl, ctx) => ctx.selectFromRange(pl).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 12,
                    direction: 'right',
                })
            }),
        },
        transitions: {
            block: {
                onBlock: {
                    direction(v: AttackDirection) {
                        return v === 'left' || v === 'right'
                    }
                }
            },
            resume: {
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
            attack2: {
                onTrap: {
                    preInput: 'onAttack',
                }
            },
            attack2Heavy: {
                onTrap: {
                    preInput: 'onUseItem',
                }
            },
            dodge: {
                onDodge: {
                    allowedState: 'backswing'
                }
            },
        }
    }

    attack1Heavy: Move = {
        cast: 17,
        backswing: 9,
        onEnter(pl, ctx) {
            ctx.components.getComponent(Stamina).unwrap().stamina -= 10
            ctx.freeze(pl)
            ctx.lookAtTarget(pl)
            playAnim(pl, 'animation.weapon.uchigatana.attack1.heavy')
        },
        onAct(pl, ctx) {
            ctx.trap(pl, { tag: 'counter' })
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
            ctx.status.isWaitingParry = false
        },
        timeline: {
            1: (_, ctx) => ctx.status.isWaitingParry = true,
            3: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 1, 90),
            5: (_, ctx) => ctx.status.isWaitingParry = false,
            6: (pl, ctx) => ctx.trap(pl, { tag: 'feint' }),
            7: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 1, 90),
            9: pl => playSoundAll(`weapon.woosh.2`, pl.pos, 1),
            11: (pl, ctx) => {
                ctx.components.getComponent(Stamina).unwrap().stamina -= 10
                ctx.selectFromRange(pl, {
                    radius: 3,
                    angle: 180,
                    rotation: -90,
                }).forEach(en => {
                    ctx.attack(pl, en, {
                        damage: 20,
                        direction: 'right',
                    })
                })
            },
        },
        transitions: {
            parry: {
                onParry: null
            },
            block: {
                onBlock: null
            },
            resume: {
                onTrap: {
                    tag: 'feint',
                    preInput: 'onFeint'
                },
                onEndOfLife: null,
            },
            attack2Heavy: {
                onTrap: {
                    tag: 'counter',
                    preInput: 'onUseItem'
                }
            },
            attack2: {
                onTrap: {
                    tag: 'counter',
                    preInput: 'onAttack'
                }
            },
            hurt: {
                onHurt: null
            },
            parried: {
                onParried: null
            },
            dodge: {
                onDodge: {
                    allowedState: 'backswing'
                }
            },
        }
    }

    attack2: Move = {
        cast: 14,
        backswing: 6,
        onEnter(pl, ctx) {
            ctx.components.getComponent(Stamina).unwrap().stamina -= 18
            ctx.freeze(pl)
            ctx.lookAtTarget(pl)
            playAnim(
                pl,
                ctx.previousStatus === 'attack1'
                    ? 'animation.weapon.uchigatana.attack2.ll'
                    : 'animation.weapon.uchigatana.attack2.hl'
            )
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
        },
        transitions: {
            resume: {
                onEndOfLife: null
            },
            hurt: {
                onHurt: null
            },
            blocked: {
                onBlocked: null
            },
            parried: {
                onParried: null
            },
            dodge: {
                onDodge: {
                    allowedState: 'backswing'
                }
            },
        },
        timeline: {
            3: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 1.5, 90),
            9: pl => playSoundAll(`weapon.woosh.2`, pl.pos, 1),
            10: (pl, ctx) => ctx.selectFromRange(pl, {
                radius: 2.6,
                angle: 40,
                rotation: 20,
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 18,
                    direction: 'vertical',
                })
            }),
        }
    }

    attack2Heavy: Move = {
        cast: 18,
        backswing: 7,
        onEnter(pl, ctx) {
            ctx.components.getComponent(Stamina).unwrap().stamina -= 10
            ctx.freeze(pl)
            const prev = ctx.previousStatus
        
            switch (prev) {
                case 'attack1':
                case 'dcRightL':
                    playAnim(pl, 'animation.weapon.uchigatana.attack2.lh')
                    break
                case 'dcLeftL':
                    playAnim(pl, 'animation.weapon.uchigatana.dc.llh')
                    break
                default:
                    playAnim(pl, 'animation.weapon.uchigatana.attack2.hh')
            }

            ctx.lookAtTarget(pl)
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
        },
        timeline: {
            3: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 1.5, 90),
            8: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 1.5, 90),
            10: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 1.5, 90),
            13: pl => playSoundAll('weapon.woosh.2', pl.pos),
            7: (pl, ctx) => ctx.trap(pl, { tag: 'feint' }),
            14: (pl, ctx) => {
                ctx.components.getComponent(Stamina).unwrap().stamina -= 15
                ctx.selectFromRange(pl, {
                    radius: 2.6,
                    angle: 40,
                    rotation: 20,
                }).forEach(en => {
                    ctx.attack(pl, en, {
                        damage: 22,
                        permeable: true,
                        direction: 'vertical',
                    })
                })
            },
        },
        transitions: {
            resume: {
                onEndOfLife: null,
                onTrap: {
                    tag: 'feint',
                    preInput: 'onFeint'
                }
            },
            hurt: {
                onHurt: null
            },
            parried: {
                onParried: null
            },
            dodge: {
                onDodge: {
                    allowedState: 'backswing'
                }
            },
        }
    }

    dodge: Move = {
        cast: 4,
        backswing: 6,
        onEnter(pl, ctx) {
            ctx.components.getComponent(Stamina).unwrap().setCooldown(20)
            ctx.freeze(pl)
            const ori = input.approximateOrientation(pl as Player)
            switch (ori) {
                case input.Orientation.Left:
                    playAnim(pl, 'animation.weapon.uchigatana.dodge.left')
                    ctx.setVelocity(pl, 0, 1.8)
                    break
                
                case input.Orientation.Right:
                    playAnim(pl, 'animation.weapon.uchigatana.dodge.right')
                    ctx.setVelocity(pl, 180, 1.8)
                    break

                case input.Orientation.Forward:
                    playAnim(pl, 'animation.weapon.uchigatana.dodge.front')
                    ctx.adsorbToTarget(pl, 2)
                    break
            
                default:
                    playAnim(pl, 'animation.weapon.uchigatana.dodge.back')
                    ctx.setVelocity(pl, -90, 1.5)
                    break
            }

            if (ori !== input.Orientation.Backward && ori !== input.Orientation.None) {
                ctx.status.isWaitingDeflection = true
            }

            if (ori !== input.Orientation.Forward) {
                ctx.status.isDodging = true
            }
        },
        onAct(_, ctx) {
            ctx.status.isDodging = false
            ctx.status.isWaitingDeflection = false
        },
        onLeave(_, ctx) {
            ctx.lookAtTarget(_)
            ctx.unfreeze(_)
            ctx.status.isDodging = false
            ctx.status.isWaitingDeflection = false
        },
        transitions: {
            hurt: {
                onHurt: null
            },
            resume: {
                onEndOfLife: null
            },
            deflectionFront: {
                onDeflection: {
                    direction: 'vertical'
                }
            },
            deflectionLeft: {
                onDeflection: {
                    direction: 'left'
                }
            },
            deflectionRight: {
                onDeflection: {
                    direction: 'right'
                }
            }
        }
    }

    deflectionFront: Move = {
        cast: 6,
        backswing: 6,
        transitions: {
            hurt: {
                onHurt: null
            },
            resume: {
                onEndOfLife: null
            },
            deflectionFront: {
                onDeflection: null
            },
            dodge: {
                onDodge: null
            },
            dcFront: {
                onTrap: {
                    preInput: 'onUseItem'
                }
            }
        },
        onEnter(pl, ctx) {
            ctx.lookAtTarget(pl)
            ctx.status.isWaitingDeflection = true
            playSoundAll('weapon.deflection', pl.pos, 1)
            playAnim(pl, 'animation.weapon.uchigatana.deflect.front')
            ctx.adsorbToTarget(pl, 0.2)
        },
        onAct(pl, ctx) {
            ctx.status.isWaitingDeflection = false
            ctx.trap(pl)
        },
        onLeave(_, ctx) {
            ctx.status.isWaitingDeflection = false
        }
    }

    deflectionLeft: Move = {
        cast: 6,
        backswing: 6,
        transitions: {
            hurt: {
                onHurt: null
            },
            resume: {
                onEndOfLife: null
            },
            deflectionLeft: {
                onDeflection: null
            },
            dodge: {
                onDodge: null
            },
            dcLeftL: {
                onTrap: {
                    preInput: 'onAttack'
                }
            },
            dcLeftH: {
                onTrap: {
                    preInput: 'onUseItem'
                }
            }
        },
        onEnter(pl, ctx) {
            ctx.lookAtTarget(pl)
            playSoundAll('weapon.deflection', pl.pos, 1)
            ctx.status.isWaitingDeflection = true
            playAnim(pl, 'animation.weapon.uchigatana.deflect.left')
            ctx.adsorbToTarget(pl, 0.2)
        },
        onAct(pl, ctx) {
            ctx.status.isWaitingDeflection = false
            ctx.trap(pl)
        },
        onLeave(_, ctx) {
            ctx.status.isWaitingDeflection = false
        }
    }

    deflectionRight: Move = {
        cast: 6,
        backswing: 6,
        transitions: {
            hurt: {
                onHurt: null
            },
            resume: {
                onEndOfLife: null
            },
            deflectionRight: {
                onDeflection: null
            },
            dodge: {
                onDodge: null
            },
            dcRightL: {
                onTrap: {
                    preInput: 'onAttack'
                }
            },
            dcRightH: {
                onTrap: {
                    preInput: 'onUseItem'
                }
            }
        },
        onEnter(pl, ctx) {
            ctx.lookAtTarget(pl)
            playSoundAll('weapon.deflection', pl.pos, 1)
            ctx.status.isWaitingDeflection = true
            playAnim(pl, 'animation.weapon.uchigatana.deflect.right')
            ctx.adsorbToTarget(pl, 0.2)
        },
        onAct(pl, ctx) {
            ctx.status.isWaitingDeflection = false
            ctx.trap(pl)
        },
        onLeave(_, ctx) {
            ctx.status.isWaitingDeflection = false
        }
    }

    dcFront: Move = {
        cast: 9,
        backswing: 4,
        transitions: {
            hurt: {
                onHurt: null
            },
            resume: {
                onEndOfLife: null
            },
            dodge: {
                onDodge: {
                    allowedState: 'backswing'
                }
            },
            parried: {
                onParried: null
            }
        },
        onEnter(pl, ctx) {
            ctx.components.getComponent(Stamina).unwrap().stamina -= 18
            ctx.lookAtTarget(pl)
            ctx.freeze(pl)
            playAnim(pl, 'animation.weapon.uchigatana.dc.fh')
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
        },
        timeline: {
            1: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 1.5, 90),
            6: pl => playSoundAll(`weapon.woosh.3`, pl.pos, 1),
            8: (pl, ctx) => ctx.selectFromRange(pl, {
                radius: 2.4,
                angle: 40,
                rotation: -20,
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 18,
                    direction: 'vertical',
                    knockback: 1,
                    permeable: true,
                })
            }),
        }
    }

    dcLeftL: Move = {
        cast: 10,
        backswing: 5,
        transitions: {
            hurt: {
                onHurt: null
            },
            resume: {
                onEndOfLife: null
            },
            dodge: {
                onDodge: {
                    allowedState: 'backswing'
                }
            },
            parried: {
                onParried: null
            },
            attack2Heavy: {
                onTrap: {
                    preInput: 'onUseItem'
                }
            }
        },
        onEnter(pl, ctx) {
            ctx.components.getComponent(Stamina).unwrap().stamina -= 12
            ctx.freeze(pl)
            playAnim(pl, 'animation.weapon.uchigatana.dc.ll')
            ctx.adsorbToTarget(pl, 1.5)
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
        },
        timeline: {
            3: pl => playSoundAll(`weapon.woosh.3`, pl.pos, 1),
            4: (pl, ctx) => ctx.selectFromRange(pl, {
                radius: 2.4,
                angle: 90,
                rotation: -45,
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 18,
                    direction: 'right',
                    permeable: false,
                })
            }),
            8: (pl, ctx) => ctx.trap(pl),
        }
    }

    dcRightL: Move = {
        cast: 10,
        backswing: 5,
        transitions: {
            hurt: {
                onHurt: null
            },
            resume: {
                onEndOfLife: null
            },
            dodge: {
                onDodge: {
                    allowedState: 'backswing'
                }
            },
            parried: {
                onParried: null
            },
            attack2Heavy: {
                onTrap: {
                    preInput: 'onUseItem'
                }
            }
        },
        onEnter(pl, ctx) {
            ctx.components.getComponent(Stamina).unwrap().stamina -= 12
            ctx.freeze(pl)
            playAnim(pl, 'animation.weapon.uchigatana.dc.rl')
            ctx.adsorbToTarget(pl, 1.5)
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
        },
        timeline: {
            3: pl => playSoundAll(`weapon.woosh.3`, pl.pos, 1),
            4: (pl, ctx) => ctx.selectFromRange(pl, {
                radius: 2.4,
                angle: 90,
                rotation: -45,
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 18,
                    direction: 'left',
                    permeable: false,
                })
            }),
            8: (pl, ctx) => ctx.trap(pl),
        }
    }

    dcLeftH: Move = {
        cast: 16,
        backswing: 9,
        transitions: {
            hurt: {
                onHurt: {
                    hegemony: false
                },
                onInterrupted: null
            },
            resume: {
                onEndOfLife: null,
                onTrap: {
                    tag: 'feint',
                    preInput: 'onFeint'
                }
            },
            dodge: {
                onTrap: {
                    tag: 'dodge',
                    preInput: 'onDodge'
                }
            },
        },
        onEnter(pl, ctx) {
            ctx.components.getComponent(Stamina).unwrap().stamina -= 10
            ctx.freeze(pl)
            playAnim(pl, 'animation.weapon.uchigatana.dc.lh')
            ctx.adsorbToTarget(pl, 3, 1.5)
        },
        onLeave(pl, ctx) {
            ctx.status.hegemony = false
            ctx.status.repulsible = true
            ctx.unfreeze(pl)
        },
        timeline: {
            8: (pl, ctx) => ctx.trap(pl, { tag: 'feint' }),
            9: (pl, ctx) => ctx.lookAtTarget(pl),
            10: (_, ctx) => {
                ctx.status.hegemony = true
                ctx.status.repulsible = false
                ctx.adsorbToTarget(_, 3, 1.2)
            },
            13: (pl, ctx) => {
                ctx.components.getComponent(Stamina).unwrap().stamina -= 15
                ctx.selectFromRange(pl, {
                    radius: 2.4,
                    angle: 90,
                    rotation: -45,
                }).forEach(en => {
                    ctx.attack(pl, en, {
                        damage: 35,
                        direction: 'middle',
                        permeable: true,
                        parryable: false,
                        powerful: true,
                        knockback: 2.5,
                    })
                })
                ctx.status.hegemony = false
                ctx.status.repulsible = true
            },
            18: (pl, ctx) => ctx.trap(pl, { tag: 'dodge' }),
        }
    }

    dcRightH: Move = {
        cast: 16,
        backswing: 9,
        transitions: {
            hurt: {
                onHurt: {
                    hegemony: false
                },
                onInterrupted: null
            },
            resume: {
                onEndOfLife: null,
                onTrap: {
                    tag: 'feint',
                    preInput: 'onFeint'
                }
            },
            dodge: {
                onTrap: {
                    tag: 'dodge',
                    preInput: 'onDodge'
                }
            },
        },
        onEnter(pl, ctx) {
            ctx.components.getComponent(Stamina).unwrap().stamina -= 10
            ctx.freeze(pl)
            playAnim(pl, 'animation.weapon.uchigatana.dc.rh')
            ctx.adsorbToTarget(pl, 3, 1.6)
        },
        onLeave(pl, ctx) {
            ctx.status.hegemony = false
            ctx.status.repulsible = true
            ctx.unfreeze(pl)
        },
        timeline: {
            8: (pl, ctx) => ctx.trap(pl, { tag: 'feint' }),
            9: (pl, ctx) => ctx.lookAtTarget(pl),
            10: (_, ctx) => {
                ctx.status.hegemony = true
                ctx.status.repulsible = false
                ctx.adsorbToTarget(_, 3, 1.2)
            },
            13: (pl, ctx) => {
                ctx.components.getComponent(Stamina).unwrap().stamina -= 15
                ctx.selectFromRange(pl, {
                    radius: 2.4,
                    angle: 90,
                    rotation: -45,
                }).forEach(en => {
                    ctx.attack(pl, en, {
                        damage: 30,
                        direction: 'middle',
                        permeable: true,
                        parryable: false,
                        powerful: true,
                        knockback: 2.5,
                    })
                })
                ctx.status.hegemony = false
                ctx.status.repulsible = true
            },
            18: (pl, ctx) => ctx.trap(pl, { tag: 'dodge' }),
        }
    }

    raidoEnter: Move = {
        cast: 12,
        onEnter(pl, ctx) {
            ctx.status.componentManager.getComponent(Stamina).unwrap().stamina -= 10
            ctx.freeze(pl)
            playAnim(pl, 'animation.weapon.uchigatana.raido.enter')
            ctx.lookAtTarget(pl)
            ctx.status.isDodging = true
        },
        onLeave(pl, ctx) {
            ctx.status.isDodging = false
            ctx.unfreeze(pl)
        },
        transitions: {
            hurt: {
                onHurt: null
            },
            raidoAttack: {
                onEndOfLife: {
                    preInput: 'onAttack',
                    isSneaking: true,
                    stamina: 20
                }
            },
            raidoExit: {
                onEndOfLife: {
                    isSneaking: false
                }
            },
            raido: {
                onEndOfLife: {
                    isSneaking: true
                }
            },
        },
        timeline: {
            1: (pl, ctx) => ctx.setVelocity(pl, -90, 0.5),
            3: (pl, ctx) => ctx.setVelocity(pl, -90, 1),
            4: (_, ctx) => ctx.status.isDodging = false,
            5: (pl, ctx) => ctx.setVelocity(pl, -90, 1),
            7: (pl, ctx) => ctx.setVelocity(pl, -90, 0.5),
        }
    }

    raido: Move = {
        cast: Infinity,
        onEnter(pl, ctx) {
            playAnim(pl, 'animation.weapon.uchigatana.raido', 'animation.weapon.uchigatana.raido')
            ctx.freeze(pl)
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
        },
        transitions: {
            hurt: {
                onHurt: null
            },
            raidoExit: {
                onReleaseSneak: null
            },
            raidoAttack: {
                onUseItem: {
                    stamina: 20
                }
            }
        }
    }

    raidoExit: Move = {
        cast: 7,
        onEnter(pl, ctx) {
            playAnim(pl, 'animation.weapon.uchigatana.raido.exit')
            ctx.freeze(pl)
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
        },
        transitions: {
            hurt: {
                onHurt: null
            },
            raidoEnter: {
                onEndOfLife: {
                    isSneaking: true
                }
            },
            resume: {
                onEndOfLife: {
                    isSneaking: false
                }
            },
        }
    }

    raidoAttack: Move = {
        cast: 16,
        backswing: 4,
        onEnter(pl, ctx) {
            ctx.status.componentManager.getComponent(Stamina).unwrap().stamina -= 18
            playAnim(pl, 'animation.weapon.uchigatana.raido.attack')
            ctx.freeze(pl)
            ctx.lookAtTarget(pl)
            ctx.status.isBlocking = true
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
            ctx.status.isBlocking = false
        },
        transitions: {
            hurt: {
                onHurt: null
            },
            blocked: {
                onBlocked: null
            },
            parried: {
                onParried: null
            },
            resume: {
                onEndOfLife: null
            },
            dodge: {
                onDodge: {
                    allowedState: 'backswing'
                }
            }
        },
        timeline: {
            1: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 0.5, 90),
            3: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 1, 90),
            4: (_, ctx) => ctx.status.isBlocking = false,
            5: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 2, 90),
            8: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 1.5, 90),
            9: pl => playSoundAll(`weapon.woosh.2`, pl.pos, 1),
            10: (pl, ctx) => ctx.selectFromRange(pl, {
                radius: 2.5,
                angle: 90,
                rotation: -45,
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 16,
                    direction: 'left',
                    trace: true,
                })
            }),
        }
    }

    parryCounter: Move = {
        cast: 12,
        backswing: 7,
        onEnter(pl, ctx) {
            ctx.status.componentManager.getComponent(Stamina).unwrap().stamina -= 10
            ctx.freeze(pl)
            ctx.lookAtTarget(pl)
            const parryDir = ctx.components.getComponent(IncomingAttack).unwrap().approximateAttackDirection()
            playAnim(pl, `animation.weapon.uchigatana.parry_counter.${parryDir}`)
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
        },
        onAct(pl, ctx) {
            ctx.trap(pl)
        },
        transitions: {
            hurt: {
                onHurt: null
            },
            parried: {
                onParried: null
            },
            resume: {
                onEndOfLife: null
            },
            attack2: {
                onTrap: {
                    preInput: 'onAttack',
                    stamina: 18,
                }
            },
            attack2Heavy: {
                onTrap: {
                    preInput: 'onUseItem',
                    stamina: 25
                }
            },
            dodge: {
                onDodge: {
                    allowedState: 'backswing'
                }
            }
        },
        timeline: {
            1: (pl, ctx) => ctx.setVelocity(pl, 90, 1),
            3: (pl, ctx) => ctx.setVelocity(pl, 90, 1.5),
            5: (pl, ctx) => ctx.setVelocity(pl, 90, 1),
            6: pl => playSoundAll(`weapon.woosh.2`, pl.pos, 1),
            7: (pl, ctx) => {
                ctx.selectFromRange(pl, {
                    radius: 2.5,
                    angle: 120,
                    rotation: -60,
                }).forEach(en => {
                    ctx.attack(pl, en, {
                        damage: 16,
                        direction: 'right',
                    })
                })
            },
        }
    }
}

class UchigatanaModule extends DefaultTrickModule {
    constructor() {
        super(
            'rgb39.weapon.uchigatana',
            'hold',
            [
                'weapon:uchigatana',
                'weapon:morphidae',
                'crossover:keen_katana',
                'crossover:hermit_katana',
            ],
            new UchigatanaMoves()
        )
    }
}

export const tricks = new UchigatanaModule()