import { playAnim, playSoundAll } from "../basic/index"
import { DefaultMoves, DefaultTrickModule } from '../basic/default'
import { input } from "scripts-rpc/func/input"

class UchigatanaMoves extends DefaultMoves {
    constructor() {
        super()

        this.setup<UchigatanaMoves>('resume')
        this.animations.block.left = 'animation.weapon.uchigatana.block.left'
        this.animations.block.right = 'animation.weapon.uchigatana.block.right'
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
                    hasTarget: true
                },
            },
            attack1Heavy: {
                onUseItem: {
                    hasTarget: true
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
        cast: 8,
        backswing: 13,
        onEnter(pl, ctx) {
            ctx.status.isBlocking = true
            ctx.freeze(pl)
            ctx.lookAtTarget(pl)
            playAnim(pl, 'animation.weapon.uchigatana.attack1')
        },
        onAct(pl, ctx) {
            ctx.selectFromRange(pl).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 12,
                    direction: 'right',
                })
            })
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
            ctx.status.isBlocking = false
        },
        timeline: {
            0: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 0.5, 90),
            4: (_, ctx) => ctx.status.isBlocking = false,
            5: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 1.5, 90),
            7: pl => playSoundAll(`weapon.woosh.2`, pl.pos, 1),
            11: (pl, ctx) => ctx.trap(pl)
        },
        transitions: {
            block: {
                onBlock: null
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
        }
    }

    attack1Heavy: Move = {
        cast: 11,
        backswing: 15,
        onEnter(pl, ctx) {
            ctx.freeze(pl)
            ctx.lookAtTarget(pl)
            playAnim(pl, 'animation.weapon.uchigatana.attack1.heavy')
        },
        onAct(pl, ctx) {
            playSoundAll(`weapon.woosh.2`, pl.pos, 1)
            ctx.selectFromRange(pl, {
                radius: 3,
                angle: 180,
                rotation: -90,
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 24,
                    direction: 'right',
                })
            })
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
        },
        timeline: {
            3: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 1, 90),
            6: (pl, ctx) => ctx.trap(pl, { tag: 'feint' }),
            7: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 1, 90),
            17: (pl, ctx) => ctx.trap(pl, { tag: 'counter' }),
        },
        transitions: {
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
        }
    }

    attack2: Move = {
        cast: 11,
        backswing: 9,
        onEnter(pl, ctx) {
            ctx.freeze(pl)
            playAnim(
                pl,
                ctx.previousStatus === 'attack1'
                    ? 'animation.weapon.uchigatana.attack2.ll'
                    : 'animation.weapon.uchigatana.attack2.hl'
            )
            ctx.adsorbOrSetVelocity(pl, 1.5, 90, 1)
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
        },
        onAct(pl, ctx) {
            playSoundAll('weapon.woosh.2', pl.pos)
            ctx.selectFromRange(pl, {
                radius: 2.6,
                angle: 40,
                rotation: 20,
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 18,
                    direction: 'vertical',
                })
            })
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
            }
        }
    }

    attack2Heavy: Move = {
        cast: 15,
        backswing: 10,
        onEnter(pl, ctx) {
            ctx.freeze(pl)
            playAnim(
                pl,
                ctx.previousStatus === 'attack1'
                    ? 'animation.weapon.uchigatana.attack2.lh'
                    : 'animation.weapon.uchigatana.attack2.hh'
            )
            ctx.adsorbOrSetVelocity(pl, 1.5, 90, 1)
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
        },
        onAct(pl, ctx) {
            ctx.selectFromRange(pl, {
                radius: 2.6,
                angle: 40,
                rotation: 20,
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 25,
                    permeable: true,
                    direction: 'vertical',
                })
            })
        },
        timeline: {
            8: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 1.5, 90, 1),
            10: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 1.5, 90, 1),
            13: pl => playSoundAll('weapon.woosh.2', pl.pos),
            7: (pl, ctx) => ctx.trap(pl, { tag: 'fient' }),
            18: (pl, ctx) => ctx.trap(pl, { tag: 'dodge' }),
        },
        transitions: {
            resume: {
                onEndOfLife: null,
                onTrap: {
                    tag: 'fient',
                    preInput: 'onFeint'
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
}

class UchigatanaModule extends DefaultTrickModule {
    constructor() {
        super(
            'rgb39.weapon.empty_hand',
            'hold',
            [ 'weapon:uchigatana', 'weapon:morphidae' ],
            new UchigatanaMoves()
        )
    }
}

export const tricks = new UchigatanaModule()