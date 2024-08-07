/// <reference path="../types.d.ts"/>
const console = require('../../../console/main')

const defaultAcceptableInputs = [
    'onJump', 'onSneak', 'onAttack', 'onUseItem',
    'onChangeSprinting', 'onFeint'
]

/**@type {PlayerStatus}*/
class Status {
    /**
     * @type {Map<string, PlayerStatus>}
     */
    static status = new Map()
    /**
     * @param {string} xuid 
     * @returns {PlayerStatus}
     */
    static get(xuid) {
        return this.status.get(xuid) ?? new Status(xuid)
    }

    hand = 'minecraft:air'
    status = 'unknown'
    duration = 0
    repulsible = true
    acceptableInputs = new Set(defaultAcceptableInputs)
    stamina = 0
    shocked = false
    preInput = null
    hegemony = false
    #preInputTimer = null

    isBlocking = false
    isWaitingParry = false
    isWaitingDeflection = false
    isDodging = false

    static defaultCameraOffsets = [ 2.2, 0, 0.7 ]
    cameraOffsets = Status.defaultCameraOffsets

    constructor(xuid) {
        Status.status.set(xuid, this)
        this.clear()
    }

    clear() {
        this.hand = 'minecraft:air'
        this.status = 'unknown'
        this.duration = 0
        this.repulsible = true
        this.isBlocking = false
        this.isWaitingParry = false
        this.acceptableInputs = new Set(defaultAcceptableInputs)
        this.stamina = 0
        this.stiffness = 0
    }

    edit(obj) {
        for (const k in obj) {
            if (k in this) {
                this[k] = obj[k]
            }
        }
    }

    acceptableInput(name, accept) {
        if (accept !== undefined) {
            accept
                ? this.acceptableInputs.add(name)
                : this.acceptableInputs.delete(name)
            return
        }

        return this.acceptableInputs.has(name)
    }

    /**
     * @param {AcceptbleInputTypes[]} inputs 
     */
    enableInputs(inputs) {
        inputs.forEach(type => this.acceptableInputs.add(type))
    }

    /**
     * @param {AcceptbleInputTypes[]} inputs 
     */
    disableInputs(inputs) {
        inputs.forEach(type => this.acceptableInputs.delete(type))
    }

    /**
     * @param {AcceptbleInputTypes} input 
     */
    setPreInput(input) {
        if (this.#preInputTimer) {
            clearInterval(this.#preInputTimer)
        }

        this.preInput = input
        this.#preInputTimer = setTimeout(() => {
            this.#preInputTimer = null
            this.preInput = null
        }, 500)
    }
}

module.exports = {
    Status, defaultAcceptableInputs
}