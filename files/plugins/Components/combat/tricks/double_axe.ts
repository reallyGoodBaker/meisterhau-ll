import { playAnimCompatibility, playSoundAll } from "@combat/basic"
import { DefaultMoves, DefaultTrickModule } from "@combat/basic/default"
import { randomRange } from "@utils/math"
import { input } from "scripts-rpc/func/input"

class DoubleAxeMoves extends DefaultMoves {
    constructor() {
        super()

        this.setup<DoubleAxeMoves>('resume')
        this.animations.block.left = 'animation.meisterhau.double_axe.block.left'
        this.animations.block.right = 'animation.meisterhau.double_axe.block.right'
        this.animations.parry.left = 'animation.meisterhau.double_axe.parry.left'
        this.animations.parry.right = 'animation.meisterhau.double_axe.parry.right'
    }

    resume: Move = {
        timeline: {
            0: (pl, ctx) => ctx.trap(pl)
        },
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
            }
        }
    }

    idle: Move = {
        cast: Infinity,
        onEnter(pl, ctx) {
            playAnimCompatibility(pl, 'animation.meisterhau.double_axe.idle', 'animation.meisterhau.double_axe.idle')
        },
        transitions: {
            hurt: {
                onHurt: null
            },
            hold: {
                onLock: null
            },
        }
    }


    hold: Move = {
        cast: Infinity,
        onEnter(pl, ctx) {
            playAnimCompatibility(pl, 'animation.meisterhau.double_axe.hold', 'animation.meisterhau.double_axe.hold')
        },
        transitions: {
            hurt: {
                onHurt: null
            },
            idle: {
                onReleaseLock: null
            },
            attackStart: {
                onAttack: null
            },
            heavyStart: {
                onUseItem: null
            },
            dodge: {
                onDodge: null
            },
        }
    }

    attackStart: Move = {
        cast: 17,
        backswing: 7,
        onEnter(pl, ctx) {
            playAnimCompatibility(pl, 'animation.meisterhau.double_axe.light.start', 'animation.meisterhau.double_axe.light.start')
            ctx.lookAtTarget(pl)
            ctx.freeze(pl)
            ctx.status.isBlocking = true
        },
        onLeave(pl, ctx) {
            ctx.status.isBlocking = false
            ctx.unfreeze(pl)
        },
        transitions: {
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
            attack1: {
                onTrap: {
                    preInput: 'onAttack'
                }
            },
            heavy1: {
                onTrap: {
                    preInput: 'onUseItem'
                }
            },
            block: {
                onBlock: null
            },
            dodge: {
                onDodge: {
                    allowedState: 'backswing'
                }
            }
        },
        timeline: {
            2: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 1.5),
            4: (_, ctx) => ctx.status.isBlocking = false,
            6: (pl, ctx) => playSoundAll('weapon.whoosh.thick.' + randomRange(1, 4, true), pl.pos),
            8: (pl, ctx) => ctx.selectFromRange(pl, {
                angle: 90,
                radius: 2.5,
                rotation: 45
            }).forEach(en => ctx.attack(pl, en, {
                damage: 17,
                knockback: 0.2,
                direction: 'vertical',
            })),
            17: (pl, ctx) => ctx.trap(pl)
        }
    }

    attack1: Move = {
        cast: 17,
        backswing: 7,
        onEnter(pl, ctx) {
            playAnimCompatibility(pl, 'animation.meisterhau.double_axe.light.1', 'animation.meisterhau.double_axe.light.1')
            ctx.lookAtTarget(pl)
            ctx.freeze(pl)
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
            ctx.status.hegemony = false
        },
        transitions: {
            resume: {
                onEndOfLife: null
            },
            hurt: {
                onHurt: null,
                onInterrupted: null
            },
            parried: {
                onParried: null
            },
            blocked: {
                onBlocked: null
            },
            attack2: {
                onTrap: {
                    preInput: 'onAttack'
                }
            },
            heavy2: {
                onTrap: {
                    preInput: 'onUseItem'
                }
            },
            dodge: {
                onDodge: {
                    allowedState: 'backswing'
                }
            }
        },
        timeline: {
            2: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 1.5),
            5: (_, ctx) => ctx.status.hegemony = true,
            15: (_, ctx) => ctx.status.hegemony = false,
            6: pl => playSoundAll('weapon.whoosh.thick.' + randomRange(1, 4, true), pl.pos),
            8: (pl, ctx) => ctx.selectFromRange(pl, {
                angle: 90,
                radius: 2.5,
                rotation: 45
            }).forEach(en => ctx.attack(pl, en, {
                damage: 17,
                knockback: 0.2,
                direction: 'vertical',
            })),
            17: (pl, ctx) => ctx.trap(pl)
        }
    }

    attack2: Move = {
        cast: 17,
        backswing: 7,
        onEnter(pl, ctx) {
            playAnimCompatibility(pl, 'animation.meisterhau.double_axe.light.2', 'animation.meisterhau.double_axe.light.2')
            ctx.lookAtTarget(pl)
            ctx.freeze(pl)
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
            ctx.status.hegemony = false
        },
        transitions: {
            resume: {
                onEndOfLife: null
            },
            hurt: {
                onHurt: null,
                onInterrupted: null
            },
            parried: {
                onParried: null
            },
            blocked: {
                onBlocked: null
            },
            attack1: {
                onTrap: {
                    preInput: 'onAttack'
                }
            },
            heavy1: {
                onTrap: {
                    preInput: 'onUseItem'
                }
            },
            dodge: {
                onDodge: {
                    allowedState: 'backswing'
                }
            }
        },
        timeline: {
            2: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 1.5),
            5: (_, ctx) => ctx.status.hegemony = true,
            15: (_, ctx) => ctx.status.hegemony = false,
            6: pl => playSoundAll('weapon.whoosh.thick.' + randomRange(1, 4, true), pl.pos),
            8: (pl, ctx) => ctx.selectFromRange(pl, {
                angle: 90,
                radius: 2.5,
                rotation: 45
            }).forEach(en => ctx.attack(pl, en, {
                damage: 17,
                knockback: 0.2,
                direction: 'vertical',
            })),
            17: (pl, ctx) => ctx.trap(pl)
        }
    }

    heavyStart: Move = {
        cast: 20,
        backswing: 10,
        onEnter(pl, ctx) {
            playAnimCompatibility(pl, 'animation.meisterhau.double_axe.heavy_start', 'animation.meisterhau.double_axe.heavy_start')
            ctx.lookAtTarget(pl)
            ctx.freeze(pl)
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
            ctx.status.hegemony = false
            ctx.status.isWaitingParry = false
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
                onHurt: null,
                onInterrupted: null
            },
            parry: {
                onParry: null
            },
            parried: {
                onParried: null
            },
            attack1: {
                onTrap: {
                    tag: 'counter',
                    preInput: 'onAttack'
                }
            },
            finishLeft: {
                onTrap: {
                    tag: 'counter',
                    preInput: 'onUseItem'
                }
            },
            dodge: {
                onDodge: {
                    allowedState: 'backswing'
                },
                onTrap: {
                    tag: 'feint',
                    preInput: 'onDodge'
                }
            }
        },
        timeline: {
            2: (_, ctx) => ctx.status.isWaitingParry = true,
            5: (_, ctx) => ctx.status.isWaitingParry = false,
            8: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 1.5),
            9: (_, ctx) => ctx.status.hegemony = true,
            7: (pl, ctx) => ctx.trap(pl, { tag: 'feint' }),
            19: (_, ctx) => ctx.status.hegemony = false,
            10: pl => playSoundAll('weapon.whoosh.thick.' + randomRange(1, 4, true), pl.pos),
            12: (pl, ctx) => ctx.selectFromRange(pl, {
                angle: 120,
                radius: 2.8,
                rotation: 60
            }).forEach(en => ctx.attack(pl, en, {
                damage: 22,
                direction: 'left',
            })),
            22: (pl, ctx) => ctx.trap(pl, { tag: 'counter' })
        }
    }

    heavy1: Move = {
        cast: 19,
        backswing: 10,
        onEnter(pl, ctx) {
            playAnimCompatibility(pl, 'animation.meisterhau.double_axe.heavy_left', 'animation.meisterhau.double_axe.heavy_left')
            ctx.lookAtTarget(pl)
            ctx.freeze(pl)
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
            ctx.status.hegemony = false
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
                onHurt: null,
                onInterrupted: null
            },
            parried: {
                onParried: null
            },
            attack1: {
                onTrap: {
                    tag: 'counter',
                    preInput: 'onAttack'
                }
            },
            finishLeft: {
                onTrap: {
                    tag: 'counter',
                    preInput: 'onUseItem'
                }
            },
            dodge: {
                onDodge: {
                    allowedState: 'backswing'
                }
            }
        },
        timeline: {
            2: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 1.5),
            7: (_, ctx) => ctx.status.hegemony = true,
            6: (pl, ctx) => ctx.trap(pl, { tag: 'feint' }),
            19: (_, ctx) => ctx.status.hegemony = false,
            10: pl => playSoundAll('weapon.whoosh.thick.' + randomRange(1, 4, true), pl.pos),
            12: (pl, ctx) => ctx.selectFromRange(pl, {
                angle: 120,
                radius: 2.8,
                rotation: 60
            }).forEach(en => ctx.attack(pl, en, {
                damage: 24,
                direction: 'left',
            })),
            20: (pl, ctx) => ctx.trap(pl, { tag: 'counter' })
        }
    }

    finishLeft: Move = {
        cast: 28,
        onEnter(pl, ctx) {
            playAnimCompatibility(pl, 'animation.meisterhau.double_axe.finish.left', 'animation.meisterhau.double_axe.finish.left')
            ctx.lookAtTarget(pl)
            ctx.freeze(pl)
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
            ctx.status.hegemony = false
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
                onHurt: null,
                onInterrupted: null
            },
            parried: {
                onParried: null
            }
        },
        timeline: {
            2: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 1.5),
            11: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 1.5),
            10: (_, ctx) => {
                ctx.status.hegemony = true
                playSoundAll('weapon.whoosh.thick.' + randomRange(1, 4, true), _.pos)
            },
            8: (pl, ctx) => ctx.trap(pl, { tag: 'feint' }),
            20: (_, ctx) => ctx.status.hegemony = false,
            12: (pl, ctx) => ctx.selectFromRange(pl, {
                angle: 90,
                radius: 2.8,
                rotation: 45
            }).forEach(en => ctx.attack(pl, en, {
                damage: 24,
                direction: 'vertical',
                permeable: true,
            })),
        }
    }

    heavy2: Move = {
        cast: 19,
        backswing: 10,
        onEnter(pl, ctx) {
            playAnimCompatibility(pl, 'animation.meisterhau.double_axe.heavy_right', 'animation.meisterhau.double_axe.heavy_right')
            ctx.lookAtTarget(pl)
            ctx.freeze(pl)
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
            ctx.status.hegemony = false
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
                onHurt: null,
                onInterrupted: null
            },
            parried: {
                onParried: null
            },
            attack2: {
                onTrap: {
                    tag: 'counter',
                    preInput: 'onAttack'
                }
            },
            finishRight: {
                onTrap: {
                    tag: 'counter',
                    preInput: 'onUseItem'
                }
            },
            dodge: {
                onDodge: {
                    allowedState: 'backswing'
                }
            }
        },
        timeline: {
            2: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 1.5),
            7: (_, ctx) => ctx.status.hegemony = true,
            6: (pl, ctx) => ctx.trap(pl, { tag: 'feint' }),
            19: (_, ctx) => ctx.status.hegemony = false,
            10: pl => playSoundAll('weapon.whoosh.thick.' + randomRange(1, 4, true), pl.pos),
            12: (pl, ctx) => ctx.selectFromRange(pl, {
                angle: 120,
                radius: 2.8,
                rotation: 60
            }).forEach(en => ctx.attack(pl, en, {
                damage: 24,
                direction: 'right',
            })),
            20: (pl, ctx) => ctx.trap(pl, { tag: 'counter' })
        }
    }

    finishRight: Move = {
        cast: 28,
        onEnter(pl, ctx) {
            playAnimCompatibility(pl, 'animation.meisterhau.double_axe.finish.right', 'animation.meisterhau.double_axe.finish.right')
            ctx.lookAtTarget(pl)
            ctx.freeze(pl)
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
            ctx.status.hegemony = false
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
                onHurt: null,
                onInterrupted: null
            },
            parried: {
                onParried: null
            }
        },
        timeline: {
            2: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 1.5),
            11: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 1.5),
            10: (_, ctx) => {
                ctx.status.hegemony = true
                playSoundAll('weapon.whoosh.thick.' + randomRange(1, 4, true), _.pos)
            },
            8: (pl, ctx) => ctx.trap(pl, { tag: 'feint' }),
            20: (_, ctx) => ctx.status.hegemony = false,
            12: (pl, ctx) => ctx.selectFromRange(pl, {
                angle: 90,
                radius: 2.8,
                rotation: 45
            }).forEach(en => ctx.attack(pl, en, {
                damage: 24,
                direction: 'vertical',
                permeable: true,
            })),
        }
    }

    dodge: Move = {
        cast: 5,
        backswing: 7,
        onEnter(pl, ctx) {
            ctx.freeze(pl)
            const ori = input.approximateOrientation(pl as Player)
            switch (ori) {
                case input.Orientation.Left:
                    playAnimCompatibility(pl, 'animation.meisterhau.double_axe.dodge.left')
                    ctx.setVelocity(pl, 0, 1.8)
                    break
                
                case input.Orientation.Right:
                    playAnimCompatibility(pl, 'animation.meisterhau.double_axe.dodge.right')
                    ctx.setVelocity(pl, 180, 1.8)
                    break

                case input.Orientation.Forward:
                    playAnimCompatibility(pl, 'animation.meisterhau.double_axe.dodge.front')
                    ctx.adsorbToTarget(pl, 2)
                    break
            
                default:
                    playAnimCompatibility(pl, 'animation.meisterhau.double_axe.dodge.back')
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
            deflection: {
                onDeflection: null
            },
        }
    }

    deflection: Move = {
        cast: 5,
        backswing: 4,
        onEnter(pl, ctx) {
            playSoundAll('weapon.deflection', pl.pos, 1)
            playAnimCompatibility(pl, 'animation.meisterhau.double_axe.deflect', 'animation.meisterhau.double_axe.deflect')
            ctx.freeze(pl)
            ctx.adsorbToTarget(pl, 3)
            ctx.lookAtTarget(pl)
            ctx.status.isWaitingDeflection = true
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
            ctx.status.isWaitingDeflection = false
        },
        transitions: {
            resume: {
                onEndOfLife: null,
            },
            hurt: {
                onHurt: null,
            },
            deflection: {
                onDeflection: null
            },
            break: {
                onUseItem: {
                    allowedState: 'cast'
                }
            }
        }
    }

    break: Move = {
        cast: 20,
        onEnter(pl, ctx) {
            playAnimCompatibility(pl, 'animation.meisterhau.double_axe.break', 'animation.meisterhau.double_axe.break')
            ctx.lookAtTarget(pl)
            ctx.freeze(pl)
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
        },
        timeline: {
            2: (pl, ctx) => ctx.adsorbToTarget(pl, 3, 1),
            3: pl => playSoundAll('weapon.whoosh.break_defense', pl.pos),
            4: (pl, ctx) => ctx.selectFromRange(pl, {
                angle: 180,
                radius: 2.8,
                rotation: 90,
            }).forEach(en => ctx.attack(pl, en, {
                damage: 2,
                permeable: true,
                direction: 'middle',
                parryable: false,
                powerful: true,
                stiffness: 1500,
            })),
            15: (pl, ctx) => ctx.trap(pl, { tag: 'counter' })
        },
        transitions: {
            resume: {
                onEndOfLife: null,
            },
            hurt: {
                onHurt: null,
            },
            breakCounter: {
                onTrap: {
                    tag: 'counter',
                    preInput: 'onUseItem'
                }
            },
            breakKick: {
                onTrap: {
                    tag: 'counter',
                    preInput: 'onAttack'
                }
            }
        }
    }

    breakKick: Move = {
        cast: 14,
        onEnter(pl, ctx) {
            playAnimCompatibility(pl, 'animation.meisterhau.double_axe.kick', 'animation.meisterhau.double_axe.kick')
            ctx.lookAtTarget(pl)
            ctx.freeze(pl)
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
        },
        transitions: {
            resume: {
                onEndOfLife: null,
            },
            hurt: {
                onHurt: null,
                onInterrupted: null
            },
        },
        timeline: {
            2: (pl, ctx) => ctx.adsorbToTarget(pl, 3, 1),
            5: (pl, ctx) => ctx.selectFromRange(pl, {
                angle: 120,
                radius: 2.8,
                rotation: 60
            }).forEach(en => ctx.attack(pl, en, {
                damage: 2,
                direction: 'middle',
                shock: true,
                permeable: true,
                parryable: false,
                knockback: 3,
            })),
        }
    }

    breakCounter: Move = {
        cast: 26,
        onEnter(pl, ctx) {
            playAnimCompatibility(pl, 'animation.meisterhau.double_axe.break_counter', 'animation.meisterhau.double_axe.break_counter')
            ctx.lookAtTarget(pl)
            ctx.freeze(pl)
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
            ctx.status.hegemony = false
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
                onHurt: null,
                onInterrupted: null
            },
            parry: {
                onParry: null
            },
            parried: {
                onParried: null
            },
            attack1: {
                onTrap: {
                    tag: 'counter',
                    preInput: 'onAttack'
                }
            },
            finishLeft: {
                onTrap: {
                    tag: 'counter',
                    preInput: 'onUseItem'
                }
            }
        },
        timeline: {
            4: (pl, ctx) => ctx.adsorbToTarget(pl, 3, 1),
            5: (_, ctx) => ctx.status.hegemony = true,
            3: (pl, ctx) => ctx.trap(pl, { tag: 'feint' }),
            15: (_, ctx) => ctx.status.hegemony = false,
            6: pl => playSoundAll('weapon.whoosh.thick.' + randomRange(1, 4, true), pl.pos),
            8: (pl, ctx) => ctx.selectFromRange(pl, {
                angle: 120,
                radius: 2.8,
                rotation: 60
            }).forEach(en => ctx.attack(pl, en, {
                damage: 22,
                direction: 'left',
            })),
            18: (pl, ctx) => ctx.trap(pl, { tag: 'counter' })
        }
    }
}

class DoubleAxeTrick extends DefaultTrickModule {
    constructor() {
        super(
            'rgb39:double_axe',
            'idle',
            [ 'weapon:double_diamond_axe' ],
            new DoubleAxeMoves(),
        )
    }
}

export const tricks = new DoubleAxeTrick()