const collection = require('../collection')
const console = require('../../console/main')
const { checkCompleteness } = require('./completeness')
const {
    listenAllMcEvents
} = require('./core/core')

module.exports = function loadAll() {
    const mods = Array.from(collection)

    listenAllMcEvents(collection)
    mods.forEach(mod => loadModule(mod))
}

/**
 * @param {TrickModule} mod 
 */
function loadModule(mod) {
    let errMessage
    if (errMessage = checkCompleteness(mod)) {
        console.error(`${("'" + mod.sid + "'") || '一个'} 模块加载失败${errMessage ? ': ' + errMessage : ''}`)
        return false
    }

    

}

