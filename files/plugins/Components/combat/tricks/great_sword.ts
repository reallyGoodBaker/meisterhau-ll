import { playAnimCompatibility } from "@combat/basic"
import { DefaultMoves, DefaultTrickModule } from "@combat/basic/default"

class GreatSwordMoves extends DefaultMoves {
    constructor() {
        super()

        super.setup<GreatSwordMoves>('resume')
    }

    idle: Move = {
        cast: Infinity,
        onEnter(pl, ctx) {
            playAnimCompatibility(pl, 'animation.meisterhau.great_sword.idle', 'animation.meisterhau.great_sword.idle')
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
            }
        }
    }

    hold: Move = {
        cast: Infinity,
        onEnter(pl, ctx) {
            playAnimCompatibility(pl, 'animation.meisterhau.great_sword.hold', 'animation.meisterhau.great_sword.hold')
        },
        transitions: {
            hurt: {
                onHurt: null
            },
            idle: {
                onReleaseLock: null
            },
            light: {
                onAttack: null
            }
        }
    }

    light: Move = {
        cast: 20,
        onEnter(pl, ctx) {
            ctx.freeze(pl)
            ctx.lookAtTarget(pl)
            playAnimCompatibility(pl, 'animation.meisterhau.great_sword.light', 'animation.meisterhau.great_sword.light')
        },
        onLeave(pl, ctx) {
            ctx.status.isBlocking = false
            ctx.unfreeze(pl)
        },
        timeline: {
            1: (pl, ctx) => {
                ctx.status.isBlocking = true
            },
            2: (pl, ctx) => {
                ctx.adsorbOrSetVelocity(pl, 1)
            },
            5: (pl, ctx) => {
                ctx.status.isBlocking = false
            },
            8: (pl, ctx) => ctx.selectFromSector(pl, {
                angle: 60,
                radius: 3,
                rotation: 30,
            }).forEach(e => ctx.attack(pl, e, {
                damage: 14,
                direction: 'vertical',
            })),
            11: (pl, ctx) => {
                ctx.trap(pl)
            },
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
            lightHeavy: {
                onTrap: {
                    preInput: 'onUseItem'
                }
            },
            light2: {
                onTrap: {
                    preInput: 'onAttack'
                }
            }
        }
    }

    light2: Move = {
        cast: 20,
        onEnter(pl, ctx) {
            ctx.freeze(pl)
            ctx.lookAtTarget(pl)
            playAnimCompatibility(pl, 'animation.meisterhau.great_sword.light2', 'animation.meisterhau.great_sword.light2')
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
        },
        timeline: {
            2: (pl, ctx) => {
                ctx.adsorbOrSetVelocity(pl, 1)
            },
            9: (pl, ctx) => ctx.selectFromSector(pl, {
                angle: 60,
                radius: 3,
                rotation: 30,
            }).forEach(e => ctx.attack(pl, e, {
                damage: 16,
                direction: 'vertical',
            }))
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
            }
        }
    }

    lightHeavy: Move = {
        cast: 23,
        onEnter(pl, ctx) {
            ctx.freeze(pl)
            ctx.lookAtTarget(pl)
            playAnimCompatibility(pl, 'animation.meisterhau.great_sword.light.heavy', 'animation.meisterhau.great_sword.light.heavy')
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
        },
        timeline: {
            2: (pl, ctx) => {
                ctx.adsorbOrSetVelocity(pl, 1)
            },
            4: (pl, ctx) => {
                ctx.adsorbOrSetVelocity(pl, 1)
            },
            6: (pl, ctx) => {
                ctx.adsorbOrSetVelocity(pl, 1)
            },
            8: (pl, ctx) => {
                ctx.adsorbOrSetVelocity(pl, 1)
            },
            11: (pl, ctx) => ctx.selectFromSector(pl, {
                angle: 180,
                radius: 3,
                rotation: 120,
            }).forEach(e => ctx.attack(pl, e, {
                damage: 30,
                direction: 'left',
            })),
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
            }
        }
    }
}

class GreatSwordTrickModule extends DefaultTrickModule {
    constructor() {
        super(
            'rgb39:great_sword',
            'idle',
            [ 'weapon:highground_greatsword' ],
            new GreatSwordMoves()
        )
    }
}

export const tricks = new GreatSwordTrickModule()