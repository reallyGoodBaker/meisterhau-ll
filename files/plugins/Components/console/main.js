const {initConsole} = require('./console')

const tConsole = initConsole(msg => log(`${msg}`))
tConsole.setFormatting('ansiEscapeSeq')

setInterval(() => tConsole.update(), 20)

module.exports = tConsole.getConsole()
exports.tConsole = tConsole