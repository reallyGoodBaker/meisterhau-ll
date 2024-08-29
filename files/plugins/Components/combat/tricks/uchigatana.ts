import { playAnim, playSoundAll } from "../basic/index"
import { DefaultMoves, DefaultTrickModule } from '../basic/default'
import { randomRange } from "@utils/math"

class UchigatanaMoves extends DefaultMoves {
    constructor() {
        super()

        this.setup<UchigatanaMoves>('resume')
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
                onHurt: {
                    allowedState: 'both'
                }
            },
            attack1: {
                onAttack: {
                    hasTarget: true
                },
            },
        }
    }

    jodanKamae: Move = {
        cast: 10,
        backswing: 10,
        onEnter(pl, ctx) {
            ctx.freeze(pl)
            playAnim(pl, 'animation.weapon.uchigatana.kamae.jodan')
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
        },
        transitions: {
            resume: {
                onEndOfLife: null,
            },
            hurt: {
                onHurt: null
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
                onHurt: {
                    allowedState: 'both'
                }
            },
        }
    }

    attack1: Move = {
        cast: 9,
        backswing: 12,
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
            7: pl => playSoundAll(`weapon.woosh.${randomRange(2, 4, true)}`, pl.pos, 1),
            12: (pl, ctx) => ctx.trap(pl)
        },
        transitions: {
            block: {
                onBlock: null
            },
            jodanKamae: {
                onEndOfLife: null
            },
            hurt: {
                onHurt: {
                    allowedState: 'both'
                }
            },
            attack2: {
                onTrap: {
                    preInput: 'onUseItem',
                }
            },
            parried: {
                onParried: {
                    allowedState: 'both'
                }
            },
            blocked: {
                onBlocked: {
                    allowedState: 'both'
                }
            },
        }
    }

    attack2: Move = {
        cast: 12,
        backswing: 14,
        onEnter(pl, ctx) {
            ctx.freeze(pl)
            ctx.lookAtTarget(pl)
            playAnim(pl, 'animation.weapon.uchigatana.attack2')
        },
        onAct(pl, ctx) {
            ctx.selectFromRange(pl, {
                radius: 3,
                angle: 180,
                rotation: -90,
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 24,
                })
            })
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
        },
        timeline: {
            3: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 1, 90),
            8: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 2.2, 90),
        },
        transitions: {
            block: {
                onBlock: null
            },
            resume: {
                onEndOfLife: null
            },
            hurt: {
                onHurt: {
                    allowedState: 'both'
                }
            },
            parried: {
                onParried: {
                    allowedState: 'both'
                }
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