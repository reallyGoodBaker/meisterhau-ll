const config = require('../ServerConfig/baseConfig')

module.exports = function() {
    const { motds } = config
    let index = 0

    setInterval(() => {
        if (index == motds.length - 1) {
            index = 0
        } else {
            index++
        }
        const motd = motds[index]
        mc.setMotd(motd)
    }, 5000)
}