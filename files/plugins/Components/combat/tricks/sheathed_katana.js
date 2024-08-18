const { playAnim, playSoundAll } = require("../basic/index")

/**
 * @type {TrickModule}
 */
exports.tricks = {
    sid: 'rgb39.weapon.katana',
    bind: 'weapon:katana',
    entry: 'default',
    moves: {
        default: {
            cast: Infinity,
            onEnter(pl, ctx) {
                ctx.status.isBlocking = true
                playAnim(pl, 'animation.general.stand')
            },
            transitions: {
                blocking: {
                    onBlock: null
                },
                knockdown: {
                    onKnockdown: { allowedState: 'both' }
                },
            }
        },

        blocking: {
            cast: 5,
            onEnter(pl) {
                const side = Math.random() > 0.5 ? 'left' : 'right'
                playAnim(pl, 'animation.twohanded.block.' + side, 'animation.twohanded.block.' + side)
            },
            transitions: {
                default: { onEndOfLife: null },
                blocking: { onBlock: null },
                knockdown: {
                    onKnockdown: { allowedState: 'both' }
                },
            }
        },

        knockdown: {
            cast: 30,
            onEnter: (pl, ctx) => {
                ctx.freeze(pl)
                ctx.status.disableInputs([
                    'onAttack',
                    'onUseItem'
                ])
                playAnim(pl, 'animation.general.fell')
            },
            onLeave(pl, ctx) {
                ctx.unfreeze(pl)
                playAnim(pl, 'animation.general.stand')
                ctx.status.enableInputs([
                    'onAttack',
                    'onUseItem'
                ])
            },
            transitions: {
                default: {
                    onEndOfLife: null
                }
            }
        },
    }
}