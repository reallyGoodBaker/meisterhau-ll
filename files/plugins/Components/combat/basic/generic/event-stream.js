/// <reference path="../types.d.ts"/>

const { EventEmitter } = require("../../../events")

class EventInputStream {
    static #ends = new Map()
    /**@type {(em: EventEmitter) => EventInputStream}*/
    static get(end) {
        return this.#ends.get(end) || new EventInputStream(end)
    }

    #filters = new Set()
    /**@type {EventEmitter}*/
    #end = null

    constructor(end) {
        this.setEnd(end)
    }

    /**
     * @param {(val: {type: string; args: any[]}) => boolean} filter 
     */
    addFilter(filter) {
        this.#filters.add(filter)
    }

    /**
     * @param {(val: {type: string; args: any[]}) => boolean} filter 
     */
    removeFilter(filter) {
        this.#filters.delete(filter)
    }

    /**
     * @param {{type: string; args: any[]}} input 
     */
    #filter(input) {
        let nextVal = input
        for (const filter of this.#filters) {
            try {
                if ((nextVal = filter.call(null, nextVal)) === false) {
                    return false
                }
            } catch (_) {
                return false
            }
        }

        return true
    }

    setEnd(end) {
        this.#end = end
        EventInputStream.#ends.set(end, this)
    }

    put(type, args) {
        if (!this.#filter({ type, args })) {
            return
        }

        if (!this.#end) {
            return
        }

        this.#end.emitNone(type, ...args)
    }
}

module.exports = {
    EventInputStream
}