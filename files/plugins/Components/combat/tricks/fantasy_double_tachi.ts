import { playAnimCompatibility } from "@combat/basic"
import { DefaultMoves, DefaultTrickModule } from "@combat/basic/default"

class FantasyDoubleTachi extends DefaultMoves {
    constructor() {
        super()
        this.setup<FantasyDoubleTachi>('resume')
    }

    hold: Move = {
        cast: Infinity,
        onEnter(pl, ctx) {
            playAnimCompatibility(pl, 'animation.fantasy.double_tachi.hold', 'animation.fantasy.double_tachi.hold')
        },
        transitions: {
            hurt: {
                onHurt: null
            },
            kamae: {
                onLock: null
            },
            running: {
                onChangeSprinting: {
                    sprinting: true,
                }
            },
        }
    }

    running: Move = {
        cast: Infinity,
        onEnter(pl, ctx) {
            playAnimCompatibility(pl, 'animation.fantasy.double_tachi.running', 'animation.fantasy.double_tachi.running')
        },
        transitions: {
            hurt: {
                onHurt: null
            },
            kamae: {
                onLock: null
            },
            hold: {
                onChangeSprinting: {
                    sprinting: false,
                }
            },
        }
    }

    resume: Move = {
        transitions: {
            hold: {
                onEndOfLife: {
                    hasTarget: false,
                }
            },
            kamae: {
                onEndOfLife: {
                    hasTarget: true,
                }
            },
            hurt: {
                onHurt: null
            },
            running: {
                onChangeSprinting: {
                    sprinting: true,
                }
            },
        }
    }

    kamae: Move = {
        cast: Infinity,
        onEnter(pl, ctx) {
            playAnimCompatibility(pl, 'animation.fantasy.double_tachi.kamae', 'animation.fantasy.double_tachi.kamae')
        },
        transitions: {
            hurt: {
                onHurt: null
            },
            hold: {
                onReleaseLock: null
            },
        }
    }
}

class FantasyDoubleTachiTricks extends DefaultTrickModule {
    constructor() {
        super(
            'rgb39:fantasy_double_tachi',
            'hold',
            [ 'weapon:fantasy_double_tachi' ],
            new FantasyDoubleTachi()
        )
    }
}

export const tricks = new FantasyDoubleTachiTricks()