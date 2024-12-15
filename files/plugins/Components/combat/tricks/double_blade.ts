import { playAnim } from "../basic/index"
import { DefaultMoves, DefaultTrickModule } from "../basic/default"
import testMoveJson from './test.move.json'

console.log(testMoveJson)

class DoubleBladeMoves extends DefaultMoves {
    constructor() {
        super()

        this.animations.parry.left = 'animation.double_blade.parry.left'
        this.animations.block.left = 'animation.double_blade.block.left'
        this.setup<DoubleBladeMoves>('resume')
    }

    resume: Move = {
        transitions: {
            hold: {
                onEndOfLife: {
                    hasTarget: true
                }
            },
            idle: {
                onEndOfLife: {
                    hasTarget: false
                }
            }
        }
    }

    idle: Move = {
        cast: Infinity,
        onEnter(pl) {
            playAnim(pl, 'animation.double_blade.idle', 'animation.double_blade.idle')
        },
        transitions: {
            i2r: {
                onChangeSprinting: {
                    sprinting: true
                }
            },
            hurt: {
                onHurt: null
            },
            hold: {
                onLock: null
            },
        }
    }

    running: Move = {
        cast: Infinity,
        onEnter(pl) {
            playAnim(pl, 'animation.double_blade.running', 'animation.double_blade.running')
        },
        transitions: {
            r2i: {
                onChangeSprinting: {
                    sprinting: false
                }
            },
            hurt: {
                onHurt: null
            },
        }
    }

    i2r: Move = {
        cast: 5,
        onEnter(pl) {
            playAnim(pl, 'animation.double_blade.i2r')
        },
        transitions: {
            running: {
                onEndOfLife: null
            },
            r2i: {
                onChangeSprinting: {
                    sprinting: false
                }
            }
        }
    }

    r2i: Move = {
        cast: 5,
        onEnter(pl) {
            playAnim(pl, 'animation.double_blade.r2i')
        },
        transitions: {
            idle: {
                onEndOfLife: null
            },
            i2r: {
                onChangeSprinting: {
                    sprinting: true
                }
            }
        }
    }

    hold: Move = {
        cast: Infinity,
        onEnter(pl) {
            playAnim(pl, 'animation.double_blade.hold', 'animation.double_blade.hold')
        },
        transitions: {
            hurt: {
                onHurt: null
            },
            idle: {
                onReleaseLock: null
            },
            startLeft: {
                onAttack: null
            },
            startRight: {
                onUseItem: null
            },
        }
    }

    startLeft: Move = {
        cast: 7,
        backswing: 14,
        onEnter(pl, ctx) {
            ctx.freeze(pl)
            ctx.lookAtTarget(pl)
            playAnim(pl, 'animation.double_blade.start_left')
            ctx.adsorbOrSetVelocity(pl, 0.5, 90)
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
        },
        onAct(pl, ctx) {
            ctx.selectFromRange(pl, {
                angle: 40,
                radius: 2.2,
                rotation: -20
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 17,
                    damageType: 'entityAttack',
                    knockback: 0.8,
                    direction: 'left'
                })
            })
        },
        timeline: {
            4: (_, ctx) => ctx.adsorbOrSetVelocity(_, 1.4, 90),
            13: (_, ctx) => ctx.trap(_),
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
            alternationLR: {
                onTrap: {
                    preInput: 'onUseItem'
                }
            }
        }
    }

    startRight: Move = {
        cast: 7,
        backswing: 14,
        onEnter(pl, ctx) {
            ctx.freeze(pl)
            ctx.lookAtTarget(pl)
            playAnim(pl, 'animation.double_blade.start_right')
            ctx.adsorbOrSetVelocity(pl, 0.5, 90)
        },
        onLeave(pl, ctx) { 
            ctx.unfreeze(pl)
        },
        onAct(pl, ctx) {
            ctx.selectFromRange(pl, {
                angle: 40,
                radius: 2.2,
                rotation: -20
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 17,
                    damageType: 'entityAttack',
                    knockback: 0.8,
                    direction: 'right'
                })
            })
        },
        timeline: {
            4: (_, ctx) => ctx.adsorbOrSetVelocity(_, 1.4, 90),
            13: (_, ctx) => ctx.trap(_),
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
            alternationRL: {
                onTrap: {
                    preInput: 'onAttack'
                }
            }
        }
    }

    alternationLR: Move = {
        cast: 7,
        backswing: 14,
        onEnter(pl, ctx) {
            ctx.freeze(pl)
            ctx.lookAtTarget(pl)
            playAnim(pl, 'animation.double_blade.lr')
            ctx.adsorbOrSetVelocity(pl, 1, 90)
        },
        onLeave(pl, ctx) { 
            ctx.unfreeze(pl)
        },
        onAct(pl, ctx) {
            ctx.selectFromRange(pl, {
                angle: 40,
                radius: 2.2,
                rotation: -20
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 19,
                    damageType: 'entityAttack',
                    knockback: 0.8,
                    direction: 'right'
                })
            })
        },
        timeline: {
            4: (_, ctx) => ctx.adsorbOrSetVelocity(_, 1.4, 90),
            13: (_, ctx) => ctx.trap(_),
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
            alternationRL: {
                onTrap: {
                    preInput: 'onAttack'
                }
            }
        }
    }

    alternationRL: Move = {
        cast: 7,
        backswing: 14,
        onEnter(pl, ctx) {
            ctx.freeze(pl)
            ctx.lookAtTarget(pl)
            playAnim(pl, 'animation.double_blade.rl')
            ctx.adsorbOrSetVelocity(pl, 1, 90)
        },
        onLeave(pl, ctx) { 
            ctx.unfreeze(pl)
        },
        onAct(pl, ctx) {
            ctx.selectFromRange(pl, {
                angle: 40,
                radius: 2.2,
                rotation: -20
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 19,
                    damageType: 'entityAttack',
                    knockback: 0.8,
                    direction: 'left'
                })
            })
        },
        timeline: {
            4: (_, ctx) => ctx.adsorbOrSetVelocity(_, 1.4, 90),
            13: (_, ctx) => ctx.trap(_),
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
            alternationLR: {
                onTrap: {
                    preInput: 'onUseItem'
                }
            }
        }
    }

    finishingL: Move = {
        transitions: {

        }
    }
}

class DoubleBlade extends DefaultTrickModule {
    constructor() {
        super(
            'rgb:double_blade',
            'idle',
            [
                'weapon:double_blade',
                'weapon:db_morphidae',
            ],
            new DoubleBladeMoves()
        )
    }
}

export const tricks = new DoubleBlade()