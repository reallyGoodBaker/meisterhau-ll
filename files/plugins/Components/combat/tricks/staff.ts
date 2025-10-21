import { DefaultMoves, DefaultTrickModule } from "combat/basic/default"
import { playAnim, playAnimCompatibility } from "combat/basic/index"

class StaffMoves extends DefaultMoves {
    constructor() {
        super()

        this.setup<StaffMoves>('resume')
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
            },
        }
    }

    idle: Move = {
        cast: Infinity,
        onEnter(pl) {
            playAnimCompatibility(pl, 'animation.weapon.staff.idle', 'animation.weapon.staff.idle')
        },
        transitions: {
            transI2R: {
                onChangeSprinting: {
                    sprinting: true
                },
            },
            hold: {
                onLock: null
            },
            hurt: {
                onHurt: null
            },
        }
    }

    transI2R: Move = {
        cast: 4,
        onEnter(pl) {
            playAnimCompatibility(pl, 'animation.weapon.staff.trans.i2r')
        },
        transitions: {
            running: {
                onEndOfLife: null
            },
            transR2I: {
                onChangeSprinting: {
                    sprinting: false
                }
            },
            hurt: {
                onHurt: null
            },
        }
    }

    transR2I: Move = {
        cast: 4,
        onEnter(pl) {
            playAnimCompatibility(pl, 'animation.weapon.staff.trans.r2i')
        },
        transitions: {
            idle: {
                onEndOfLife: null
            },
            transI2R: {
                onChangeSprinting: {
                    sprinting: true
                }
            },
            hurt: {
                onHurt: null
            },
        }
    }

    running: Move = {
        cast: Infinity,
        onEnter(pl) {
            playAnimCompatibility(pl, 'animation.weapon.staff.running', 'animation.weapon.staff.running')
        },
        transitions: {
            transR2I: {
                onChangeSprinting: {
                    sprinting: false
                }
            },
            hurt: {
                onHurt: null
            },
        }
    }

    hold: Move = {
        cast: Infinity,
        onEnter(pl) {
            playAnimCompatibility(pl, 'animation.weapon.staff.hold', 'animation.weapon.staff.hold')
        },
        transitions: {
            idle: {
                onReleaseLock: null,
            },
            hurt: {
                onHurt: null,
            },
        }
    }
}

class StaffModule extends DefaultTrickModule {
    constructor() {
        super(
            'rgb:staff',
            'idle',
            [ 'weapon:staff' ],
            new StaffMoves()
        )
    }
}

export const tricks = new StaffModule()