import { Rotation, Vector } from '@utils/math'
import { cmd } from './utils/command'
import { Optional } from '@utils/optional'

const camera = (pl: Player, easeTime: number, easeType: string, dPos: Vector, rot: Rotation) => {
    mc.runcmdEx(`execute as "${pl.name}" at @s run camera @s set minecraft:free ease ${easeTime} ${easeType} pos ^${dPos.x} ^${dPos.y} ^${dPos.z} rot ${rot.pitch} ${rot.yaw}`)
    // mc.runcmdEx(`execute as "${pl.name}" at @s run camera @s set minecraft:free ease ${easeTime} ${easeType} rot ${rot.pitch} ${rot.yaw}`)
    // mc.runcmdEx(`execute as "${pl.name}" at @s run camera @s set minecraft:free ease ${easeTime} ${easeType} pos ^${dPos.x} ^${dPos.y} ^${dPos.z}`)
}

const trackingPlayers = new Map()

function clearCamera(pl: Player) {
    trackingPlayers.delete(pl.uniqueId)
    mc.runcmdEx(`camera "${pl.name}" clear`)
}

function setOnShoulderCamera(uniqueId: string, left=false) {
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

    cmd('overshoulder', '过肩视角', 0).setup(register => {
        register('clear', (_, ori) => {
            Optional.some(ori.player).use(pl => {
                clearCamera(pl)
            })
        })
        register('right', (_, ori) => {
            Optional.some(ori.player).use(pl => {
                setOnShoulderCamera(pl.uniqueId)
            })
        })
        register('left', (_, ori) => {
            Optional.some(ori.player).use(pl => {
                setOnShoulderCamera(pl.uniqueId, true)  
            })
        })
    })
}

module.exports = {
    setup,
    camera, clearCamera, setOnShoulderCamera
}