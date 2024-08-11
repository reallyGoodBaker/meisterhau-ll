/// <reference path="../basic/types.d.ts"/>

const { playAnim } = require('../basic')
const { DefaultMoves, DefaultTrickModule } = require('../basic/default')
const console = require('../../console/main')

class EmptyHandMoves extends DefaultMoves {
    /**
     * @type {Move}
     */
    blocking = {
        cast: Infinity,
        onEnter(pl) {
            playAnim(pl, 'animation.general.empty_hand')
        },
        transitions: {
            cast: {
                onEndOfLife: null
            }
        }
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

/**
 * @type {TrickModule}
 */
module.exports = new EmptyHandTricks()