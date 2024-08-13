const { playAnim, playSoundAll } = require("./index")
const { CameraFading } = require("./components/camera-fading")
const { CameraComponent } = require("./components/camera")
const { Stamina } = require("./components/stamina")

function getAnim(animCategory, direction) {
    const anim = animCategory[direction]

    if (!anim) {
        switch (direction) {
            case 'middle':
                return animCategory.right || animCategory.left

            default:
                return animCategory.left
        }
    }

    return anim
}

class DefaultMoves {
    animations = {
        parried: {
            /**
             * left and vertical
             */
            left: 'animation.general.parried.left',
            vertical: 'animation.general.parried.left',
            /**
             * right and stab
             */
            right: 'animation.general.parried.right',
            middle: 'animation.general.parried.right',
        },
        hit: {
            left: 'animation.general.hit.left',
            right: 'animation.general.hit.right',
            vertical: 'animation.general.hit.vertical',
            middle: 'animation.general.hit.middle',
        },
        parry: {
            /**
             * left and vertical
             */
            left: '',
            vertical: '',
            /**
             * right and stab
             */
            right: '',
            middle: '',
        },
        knockdown: 'animation.general.fell',
        blocked: {
            /**
             * left and vertical
             */
            left: 'animation.general.blocked.left',
            vertical: 'animation.general.blocked.left',
            /**
             * right and stab
             */
            right: 'animation.general.blocked.right',
            middle: 'animation.general.blocked.right',
        },
        block: {
            /**
             * left and vertical
             */
            left: '',
            vertical: '',
            /**
             * right and stab
             */
            right: '',
            middle: '',
        },
    }

    sounds = {
        parry: 'weapon.parry',
        blocked: 'weapon.sword.hit3',
        block: 'weapon.sword.hit2',
    }

    /**
     * @type {Move}
     */
    blocked = {
        cast: 10,
        onEnter: (pl, ctx) => {
            const { direction } = ctx.rawArgs[2]

            ctx.status.componentManager.getComponent(Stamina).unwrap().stamina -= 10
            playAnim(pl, getAnim(this.animations.blocked, direction))
            playSoundAll(this.sounds.blocked, pl.pos, 1)
            ctx.movementInput(pl, false)
            ctx.freeze(pl)
            ctx.setVelocity(pl, -100, 0.8, -2)
        },
        onLeave(pl, ctx) {
            ctx.movementInput(pl, true)
            ctx.unfreeze(pl)
        },
        timeline: {
            8: (pl, ctx) => ctx.trap(pl, { tag: 'blockedCounter' })
        },
        transitions: {}
    }

    /**
     * @type {Move}
     */
    block = {
        cast: 5,
        onEnter: (pl, ctx) => {
            const { direction } = ctx.rawArgs[2]
            const stamina = ctx.status.componentManager.getComponent(Stamina).unwrap()
            stamina.setCooldown(5)
            stamina.stamina += 15
            ctx.status.isBlocking = true
            playAnim(pl, getAnim(this.animations.block, direction))
            playSoundAll(this.sounds.block, pl.pos, 1)
            ctx.movementInput(pl, false)
            ctx.freeze(pl)
        },
        onLeave(pl, ctx) {
            ctx.movementInput(pl, true)
            ctx.unfreeze(pl)
            ctx.status.isBlocking = false
        },
        timeline: {
            4: (pl, ctx) => ctx.trap(pl, { tag: 'blockCounter' })
        },
        transitions: {}
    }

    /**
     * @type {Move}
     */
    hurt = {
        cast: Infinity,
        onEnter: (pl, ctx) => {
            const manager = ctx.status.componentManager
            manager.getComponent(Stamina).unwrap().setCooldown(5)
            ctx.movementInput(pl, false)
            ctx.freeze(pl)
            ctx.status.disableInputs([
                'onAttack',
                'onUseItem',
            ])
            const { stiffness, customHurtAnimation, direction } = ctx.rawArgs[2]
            const hurtAnim = customHurtAnimation ?? this.animations.hit[direction]

            playAnim(pl, hurtAnim)
            ctx.task.queue(() => {
                ctx.trap(pl, { tag: 'recover' })
            }, stiffness).run()
        },
        onLeave(pl, ctx) {
            ctx.status.shocked = false
            ctx.status.enableInputs([
                'onAttack',
                'onUseItem',
            ])
            ctx.unfreeze(pl)
        },
        onTick(pl, ctx) {
            if (ctx.status.shocked) {
                ctx.trap(pl, { tag: 'hitWall' })
            }
        },
        transitions: { }
    }

    /**
     * @type {Move}
     */
    hitWall = {
        cast: 25,
        onEnter: (pl, ctx) => {
            ctx.movementInput(pl, false)
            ctx.freeze(pl)
            ctx.status.disableInputs([
                'onAttack',
                'onUseItem',
            ])
            playAnim(pl, 'animation.general.hit_wall')
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
            ctx.status.enableInputs([
                'onAttack',
                'onUseItem',
            ])
        },
        transitions: { }
    }

    /**
     * @type {Move}
     */
    parried = {
        cast: 35,
        onEnter: (pl, ctx) => {
            ctx.status.componentManager.getComponent(Stamina).unwrap().stamina -= 15
            ctx.movementInput(pl, false)
            ctx.freeze(pl)
            ctx.status.disableInputs([
                'onAttack',
                'onUseItem',
            ])
            const { direction } = ctx.rawArgs[2]
            playAnim(pl, getAnim(this.animations.parried, direction))
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
            ctx.status.enableInputs([
                'onAttack',
                'onUseItem'
            ])
        },
        timeline: {
            4: (pl, ctx) => ctx.setVelocity(pl, -140, 1.5, -2),
            12: (pl, ctx) => ctx.lookAtTarget(pl),
        },
        transitions: { }
    }

    /**
     * @type {Move}
     */
    parry = {
        cast: 10,
        backswing: 11,
        onEnter: (pl, ctx) => {
            const { direction } = ctx.rawArgs[2]

            ctx.status.componentManager.getComponent(Stamina).unwrap().stamina += 10
            ctx.movementInput(pl, false)
            playSoundAll(this.sounds.parry, pl.pos, 1)
            ctx.status.isWaitingParry = true
            playAnim(pl, getAnim(this.animations.parry, direction))
            ctx.lookAtTarget(pl)

            ctx.status.componentManager.attachComponent(new CameraFading([
                {
                    from: CameraComponent.defaultOffset,
                    to: [ 0.6, 0, 0.8, 0, 0 ],
                    duration: 2
                },
                {
                    to: CameraComponent.defaultOffset,
                    duration: 3
                }
            ]))
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
            ctx.status.isWaitingParry = false
            ctx.status.componentManager.detachComponent(CameraFading)
        },
        timeline: {
            13: (pl, ctx) => ctx.trap(pl, { tag: 'parryCounter' })
        },
        transitions: { }
    }

    /**
     * @type {Move}
     */
    knockdown = {
        cast: 30,
        onEnter: (pl, ctx) => {
            ctx.freeze(pl)
            ctx.status.disableInputs([
                'onAttack',
                'onUseItem'
            ])
            playAnim(pl, this.animations.knockdown)
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
            playAnim(pl, 'animation.general.stand')
            ctx.status.enableInputs([
                'onAttack',
                'onUseItem'
            ])
        },
        transitions: { }
    }

    setup(init) {
        this.hitWall.transitions = {
            hurt: {
                onHurt: null
            },
            [init]: {
                onEndOfLife: null
            },
        }

        this.parry.transitions = {
            parry: {
                onParry: null
            },
            [init]: {
                onEndOfLife: null
            },
            hurt: {
                onHurt: null
            },
        }

        this.parried.transitions = {
            [init]: {
                onEndOfLife: null
            },
            hurt: {
                onHurt: { allowedState: 'both' }
            },
        }

        this.hurt.transitions = {
            [init]: {
                onTrap: {
                    tag: 'recover'
                }
            },
            hurt: {
                onHurt: { allowedState: 'both' }
            },
            hitWall: {
                onTrap: {
                    tag: 'hitWall',
                    allowedState: 'both',
                    isCollide: true,
                }
            },
        }

        this.blocked.transitions = {
            [init]: {
                onEndOfLife: null
            },
            hurt: {
                onHurt: { allowedState: 'both' }
            },
        }

        this.block.transitions = {
            [init]: {
                onEndOfLife: null
            },
            hurt: {
                onHurt: { allowedState: 'both' }
            },
            block: {
                onBlock: null
            }
        }
    }

    /**
     * @param {keyof this} state 
     * @param {Move} obj 
     */
    mixin(state, obj) {
        this[state] = Object.assign(this[state], obj)
    }

    /**
     * @param {keyof this} state 
     * @param {string} state 
     * @param {TransitionTypeOption} obj 
     */
    setTransition(state, transitionName, obj) {
        const _state = this[state]
        if (!_state) {
            return
        }

        _state.transitions[transitionName] = obj
    }
}

/**
 * @implements {TrickModule}
 */
class DefaultTrickModule {
    /**
     * @param {string} sid 
     * @param {string} entry 
     * @param {string|string[]} bind 
     * @param {Moves} moves
     */
    constructor(sid, entry, bind, moves) {
        this.sid = sid
        this.entry = entry
        this.bind = bind
        this.moves = moves
    }

}

module.exports = {
    DefaultTrickModule, DefaultMoves,
}