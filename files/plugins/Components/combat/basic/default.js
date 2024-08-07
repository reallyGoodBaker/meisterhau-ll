/// <reference path="../basic/types.d.ts"/>

const { playAnim, playSoundAll, playParticle } = require("./index")
const console = require('../../console/main')
const { isCollide } = require("./generic/kinematic")
const { Status } = require("./generic/status")

class DefaultMoves {
    animations = {
        parried: 'animation.general.parried.right',
        hit: 'animation.general.hit',
        parry: '',
        knockdown: 'animation.general.fell',
        blocked: 'animation.general.blocked.right',
        block: '',
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
        cast: 9,
        onEnter: (pl, ctx) => {
            playAnim(pl, this.animations.blocked)
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
            ctx.status.isBlocking = true
            playAnim(pl, this.animations.block)
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
            ctx.movementInput(pl, false)
            ctx.freeze(pl)
            ctx.status.disableInputs([
                'onAttack',
                'onUseItem',
            ])
            const [ ,, { stiffness, customHurtAnimation } ] = ctx.rawArgs
            const hurtAnim = customHurtAnimation ?? this.animations.hit

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
            ctx.movementInput(pl, false)
            ctx.freeze(pl)
            ctx.status.disableInputs([
                'onAttack',
                'onUseItem',
            ])
            playAnim(pl, this.animations.parried)
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
            ctx.movementInput(pl, false)
            playSoundAll(this.sounds.parry, pl.pos, 1)
            ctx.status.isWaitingParry = true
            playAnim(pl, this.animations.parry)
            ctx.lookAtTarget(pl)
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl)
            ctx.status.isWaitingParry = false
            ctx.status.cameraOffsets = Status.defaultCameraOffsets
        },
        timeline: {
            5: (pl, ctx) => {
                const offsets = ctx.status.cameraOffsets

                offsets[0] = 0.6
                offsets[2] = 0.6
            },
            8: (pl, ctx) => {
                const offsets = ctx.status.cameraOffsets

                offsets[0] = 2.2
                offsets[2] = 0.7
            },
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
    DefaultTrickModule, DefaultMoves
}