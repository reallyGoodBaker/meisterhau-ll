const { cmd } = require('./utils/command')

const camera = (pl, easeTime, easeType, dPos, rot) => {
    mc.runcmdEx(`execute as "${pl.name}" at @s run camera @s set minecraft:free ease ${easeTime} ${easeType} pos ^${dPos.x} ^${dPos.y} ^${dPos.z} rot ${rot.pitch} ${rot.yaw}`)
    // mc.runcmdEx(`execute as "${pl.name}" at @s run camera @s set minecraft:free ease ${easeTime} ${easeType} rot ${rot.pitch} ${rot.yaw}`)
    // mc.runcmdEx(`execute as "${pl.name}" at @s run camera @s set minecraft:free ease ${easeTime} ${easeType} pos ^${dPos.x} ^${dPos.y} ^${dPos.z}`)
}

const trackingPlayers = new Map()

function clearCamera(pl) {
    trackingPlayers.delete(pl.uniqueId)
    mc.runcmdEx(`camera "${pl.name}" clear`)
}

function setOnShoulderCamera(uniqueId, left=false) {
    trackingPlayers.set(uniqueId, left)
}

function setup() {
    mc.listen('onTick', () => {
        trackingPlayers.forEach((left, uniqueId) => {
            const pl = mc.getPlayer(uniqueId)

            if (!pl) {
                return
            }

            const { yaw, pitch } = pl.direction

            camera(pl, 0.1, 'linear', {
                x: left ? 1 : -1,
                y: 1.5,
                z: -2.5
            }, { yaw, pitch })
        })
    })

    cmd('overshoulder', '过肩视角', 0).setup(registry => {
        registry.register('clear', (_, ori) => {
            clearCamera(ori.player)
        })
        .register('right', (_, ori) => {
            setOnShoulderCamera(ori.player.uniqueId)
        })
        .register('left', (_, ori) => {
            setOnShoulderCamera(ori.player.uniqueId, true)
        })
        .submit()
    })
}

module.exports = {
    setup,
    camera, clearCamera, setOnShoulderCamera
}