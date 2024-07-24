const { loadEntries } = require('./ServerConfig/loaderConfig.js')

exports.load = m => {
    if (typeof m === 'function') {
        return m()
    }

    for (const k of loadEntries) {
        if (typeof m[k] === 'function') {
            return m[k]()
        }
    }
}