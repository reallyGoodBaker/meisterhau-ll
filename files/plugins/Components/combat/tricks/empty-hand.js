const { playAnim, playSoundAll } = require("../basic/index")
const { DefaultMoves, DefaultTrickModule } = require('../basic/default')

class EmptyHandMoves extends DefaultMoves {
    /**
     * @type {Move}
     */
    blocking = {
        cast: Infinity,
        onEnter(pl) {
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

        this.setup('blocking')
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

exports.tricks = new EmptyHandTricks()