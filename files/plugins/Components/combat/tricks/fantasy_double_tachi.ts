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
            playAnimCompatibility(pl, 'animation.fantasy.double_tachi.init', 'animation.fantasy.double_tachi.init')
        },
        transitions: {
            hurt: {
                onHurt: null
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
            hurt: {
                onHurt: null
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