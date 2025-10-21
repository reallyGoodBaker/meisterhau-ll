const { EventEmitter } = require("../../../events")

/**
 * 事件输入流类 - 用于过滤和转发事件
 */
class EventInputStream {
    /** 静态映射表，存储事件发射器到输入流的映射 */
    static #ends = new Map()
    
    /**
     * 获取或创建事件输入流实例
     * @param {EventEmitter} end 事件发射器
     * @returns {EventInputStream} 事件输入流实例
     */
    static get(end) {
        return this.#ends.get(end) || new EventInputStream(end)
    }

    /** 过滤器集合 */
    #filters = new Set()
    /** 目标事件发射器 */
    #end = null

    /**
     * 构造函数
     * @param {EventEmitter} end 事件发射器
     */
    constructor(end) {
        this.setEnd(end)
    }

    /**
     * 添加事件过滤器
     * @param {(val: {type: string; args: any[]}) => boolean} filter 过滤器函数
     */
    addFilter(filter) {
        this.#filters.add(filter)
    }

    /**
     * 移除事件过滤器
     * @param {(val: {type: string; args: any[]}) => boolean} filter 过滤器函数
     */
    removeFilter(filter) {
        this.#filters.delete(filter)
    }

    /**
     * 过滤事件（私有方法）
     * @param {{type: string; args: any[]}} input 输入事件
     * @returns {boolean} 是否通过过滤
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

    /**
     * 设置目标事件发射器
     * @param {EventEmitter} end 事件发射器
     */
    setEnd(end) {
        this.#end = end
        EventInputStream.#ends.set(end, this)
    }

    /**
     * 推送事件到输入流
     * @param {string} type 事件类型
     * @param {any[]} args 事件参数
     */
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
