const tasks = new Map()

class Task {
    constructor(uniqueId) {
        if (!tasks.get(uniqueId)) {
            tasks.set(uniqueId, this)
        }
    }

    /**
     * @param {string} uniqueId 
     * @returns {Task}
     */
    static get(uniqueId) {
        return tasks.get(uniqueId) || new Task(uniqueId)
    }

    _queue = []
    _currentTimeStamp = null

    /**
     * @param {{handler: () => any, timeout: number}[]} taskList 
     */
    queueList(taskList) {
        this._queue = this._queue.concat(taskList)
        return this
    }

    queue(handler, timeout=5) {
        this._queue.push({handler, timeout})
        return this
    }

    skip() {
        if (!this._currentTimeStamp) {
            return
        }

        clearInterval(this._currentTimeStamp)
        this._currentTimeStamp = null
    }

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

    cancel() {
        this.skip()
        this._queue = []
    }

    run() {
        this.#next()
    }
}

module.exports = {
    Task
}