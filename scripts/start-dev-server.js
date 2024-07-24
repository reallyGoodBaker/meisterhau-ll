const { start, sync } = require('../server/main')

function doStart() {
    start()
    sync()
}

doStart()