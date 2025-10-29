import { Actor } from "@utils/actor"

import { playAnimCompatibility } from "../basic/index"
import { DefaultMoves, DefaultTrickModule } from '../basic/default'

class EmptyHandMoves extends DefaultMoves {

    blocking: Move = {
        cast: Infinity,
        onEnter(pl: Actor) {
            playAnimCompatibility(pl, 'animation.general.empty_hand')
        },
        transitions: {
            cast: {
                onEndOfLife: null
            }
        }
    }

    hold = {
        cast: Infinity,
    }

    constructor() {
        super()

        this.setup<EmptyHandMoves>('blocking')
    }
}

class EmptyHandTricks extends DefaultTrickModule {
    constructor() {
        super(
            'rgb39.weapon.empty_hand',
            'blocking',
            [ '*' ],
            new EmptyHandMoves()
        )
    }
}

export const tricks = new EmptyHandTricks()