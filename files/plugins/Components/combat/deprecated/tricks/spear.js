const { playAnim, playAnimCompatibility } = require('../../basic')

/**
 * @type {TrickModule}
 */
module.exports = {
    sid: 'fare.weapon.spear',
    bind: 'weapon:spear',
    entry: 'default',
    moves: {
        default: {
            cast: Infinity,
            onEnter(pl,ctx) {
                playAnimCompatibility(pl, 'animation.weapon.spear.hold', 'animation.weapon.spear.hold')
                pl.setSprinting(false)
            },
            transitions: {
                run: {
                    onChangeSprinting: {
                        sprinting: true
                    }
                },
                attack: {
                    onAttack: {
                      isOnGround: true
                    } 
                },
                knockdown: {
                    onKnockdown: { allowedState: 'both' }
                },
            }
        },
        run: {
            cast: Infinity,
            onEnter(pl) {
                playAnimCompatibility(pl, 'animation.weapon.spear.run','animation.weapon.spear.run')

            },
            transitions: {
                default: {
                    onChangeSprinting: {
                        sprinting: false
                    }
                },
                stab: {
                    onAttack: {
                        isOnGround: true
                    } 
                },
                knockdown: {
                    onKnockdown: { allowedState: 'both' }
                },
            }
        },
        stab: {
            cast: 9,
            backswing: 6,
            transitions: {
                default: {
                    onEndOfLife: null,
                },
                knockdown: {
                    onKnockdown: { allowedState: 'both' }
                },
            },
            onEnter(pl,ctx) {
                playAnimCompatibility(pl, 'animation.weapon.spear.stab')
                ctx.freeze(pl,false)
                ctx.setVelocity(pl,90,2,0)
            },
            onAct(pl,ctx){
                ctx.selectFromSector(pl, {
                    radius: 4,
                    angle: 15,
                    rotation: -7.5
                }).forEach(function(en) {
                    ctx.attack(pl,en,{
                        damage: 18,
                        knockback: 1.2,
                    })
                })
            },
            onLeave(pl,ctx){
                ctx.unfreeze(pl)
            }
        },
        attack: {
            cast: 9,
            backswing: 6,
            transitions: {
                default: {
                    onEndOfLife: null,
                },
                knockdown: {
                    onKnockdown: { allowedState: 'both' }
                },
            },
            onEnter(pl,ctx) {
                playAnimCompatibility(pl, 'animation.weapon.spear.attack')
                pl.setSprinting(false)
                ctx.freeze(pl,false)
                ctx.setVelocity(pl,90,1,0)
            },
            onAct(pl,ctx){
                ctx.selectFromSector(pl, {
                    radius: 3.2,
                    angle: 20,
                    rotation: -10
                }).forEach(function(en) {
                    ctx.attack(pl,en,{
                        damage: 12,
                        knockback: 0.75,
                    })
                })
            },
            onLeave(pl,ctx){
                ctx.unfreeze(pl)
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
                playAnimCompatibility(pl, 'animation.general.fell')
            },
            onLeave(pl, ctx) {
                ctx.unfreeze(pl)
                playAnimCompatibility(pl, 'animation.general.stand')
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