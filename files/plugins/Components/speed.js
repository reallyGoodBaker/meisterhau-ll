const {EventEmitter} = require('./events')
const eachTick = new EventEmitter()

mc.listen('onTick', () => {
    eachTick.emitNone('tick')
})

function tick(func) {
    eachTick.on('tick', func)
    return {
        cancel: () => {
            eachTick.removeListener('tick', func)
        }
    }
}

const playerCollideBox = {
    dx: 1,
    dy: 2,
    dz: 1
}

function nextPos(point, vec3) {
    return {
        x: point.x + vec3.dx,
        y: point.y + vec3.dy,
        z: point.z + vec3.dz
    }
}

/**
 * @param {any} mob
 * @param {{dx: number, dy: number, dz: number}} collideBox 
 * @param {{dx: number, dy: number, dz: number}} vec3 
 */
function setVelocity(mob, vec3, collideBox=playerCollideBox, resistance=0.05) {
    if (!mob) {
        return
    }

    const phy = {
        mob, speed: vec3, collideBox
    }

    let { cancel } = tick(() => {
        if (!mob) {
            cancel()

            return
        }

        const pos = mob.pos
        const origin = nextPos({
            x: pos.x - 0.5,
            y: pos.y - 0.5,
            z: pos.z - 0.5,
        }, vec3)
        const restrict = {
            x: origin.x + collideBox.dx,
            y: origin.y + collideBox.dy,
            z: origin.z + collideBox.dz,
        }

        const originBlock = mc.getBlock(
            Math.round(origin.x),
            Math.round(origin.y),
            Math.round(origin.z),
            pos.dimid
        )
        const restrictBlock = mc.getBlock(
            Math.round(restrict.x),
            Math.round(restrict.y),
            Math.round(restrict.z),
            pos.dimid
        )

        if (!(originBlock?.isAir && restrictBlock?.isAir)) {
            cancel()

            return
        }

        console.log(1, mob.pos);
        mob.teleport(
            pos.x,
            pos.y - 1.6,
            pos.z,
            pos.dimid
        )
        console.log(2, mob.pos);

        vec3 = {
            dx: vec3.dx > resistance ? vec3.dx - resistance: 0,
            dy: vec3.dy > resistance ? vec3.dy - resistance: 0,
            dz: vec3.dz > resistance ? vec3.dz - resistance: 0,
        }
    })
}

module.exports = {
    tick, setVelocity
}