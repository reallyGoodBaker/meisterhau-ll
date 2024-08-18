const { loadEntries } = require('./ServerConfig/loaderConfig.js')

function load(m) {
    if (typeof m === 'function') {
        return m()
    }

    for (const k of loadEntries) {
        if (typeof m[k] === 'function') {
            return m[k]()
        }
    }
}

module.exports = {
    load
}