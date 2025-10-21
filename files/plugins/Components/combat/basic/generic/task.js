/** 任务管理器 - 管理异步任务的队列执行 */
const tasks = new Map()

/**
 * 任务类 - 用于管理异步任务队列
 */
class Task {
    /**
     * 构造函数
     * @param {string} uniqueId 唯一标识符
     */
    constructor(uniqueId) {
        if (!tasks.get(uniqueId)) {
            tasks.set(uniqueId, this)
        }
    }

    /**
     * 获取或创建任务实例
     * @param {string} uniqueId 唯一标识符
     * @returns {Task} 任务实例
     */
    static get(uniqueId) {
        return tasks.get(uniqueId) || new Task(uniqueId)
    }

    /** 任务队列 */
    _queue = []
    /** 当前任务的时间戳 */
    _currentTimeStamp = null

    /**
     * 批量添加任务到队列
     * @param {{handler: () => any, timeout: number}[]} taskList 任务列表
     * @returns {Task} 当前任务实例（支持链式调用）
     */
    queueList(taskList) {
        this._queue = this._queue.concat(taskList)
        return this
    }

    /**
     * 添加单个任务到队列
     * @param {() => any} handler 任务处理函数
     * @param {number} timeout 任务延迟时间（毫秒）
     * @returns {Task} 当前任务实例（支持链式调用）
     */
    queue(handler, timeout=5) {
        this._queue.push({handler, timeout})
        return this
    }

    /**
     * 跳过当前正在执行的任务
     */
    skip() {
        if (!this._currentTimeStamp) {
            return
        }

        clearInterval(this._currentTimeStamp)
        this._currentTimeStamp = null
    }

    /**
     * 执行下一个任务（私有方法）
     */
    #next = () => {
        const _task = this._queue.splice(0, 1)[0]

        if (!_task) {
            return
        }

        const { handler, timeout } = _task

        this._currentTimeStamp = setTimeout(() => {
            handler.call(null)
            this.#next()
        }, timeout)
    }

    /**
     * 取消所有任务
     */
    cancel() {
        this.skip()
        this._queue = []
    }

    /**
     * 开始执行任务队列
     */
    run() {
        this.#next()
    }
}

module.exports = {
    Task
}
