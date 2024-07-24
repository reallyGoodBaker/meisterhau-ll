const console = require("../console/main")

function parseBatchCommands() {
    
}

/**
 * @param {{type: 'string'|'command', value: string}[]} strs 
 */
function splitCommands(strs) {
    strs.map(({ type, value }) => {
        if (type === 'string') {
            return { type, value }
        }

        let val = ''
        let ctx = 0
        const wordRegExp = /\w/
        const numRegExp = /\d/


    })
}

/**
 * @param {string} cmd 
 */
function splitStrings(cmd) {
    const strs = []
    let rest = cmd
    let ctx = false
    let i = -1

    while (i = rest.indexOf("'")) {
        const value = rest.slice(0, i).trim()

        if (i === -1) {
            if (ctx) {
                return []
            }

            strs.push(...rest.split(/\s+/).map(value => ({ type: 'command', value })))
            return strs
        }
        
        ctx ? strs.push({ type: 'string', value })
            : strs.push(...value.split(/\s+/).map(value => ({ type: 'command', value })))
        ctx = !ctx
        rest = rest.slice(i + 1)
    }
}

module.exports = {
    splitStrings
}