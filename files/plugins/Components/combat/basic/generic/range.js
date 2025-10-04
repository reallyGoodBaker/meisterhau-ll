const { ActorHelper } = require('@utils/actor')
const { vec2, getAngleFromVector2 } = require('./vec')

const defaultRange = {
    angle: 60,
    rotation: -30,
    radius: 2.5
}

function selectFromSector(pl, range) {
    const {
        angle, rotation, radius
    } = Object.assign({}, defaultRange, range)
    const pos = pl.pos
    const startAngle = pl.direction.yaw + rotation + 90
    const endAngle = startAngle + angle
    const RAD = Math.PI / 180
    const sx = pos.x
        ,sz = pos.z
        ,tx = sx + Math.cos(startAngle * RAD) * radius
        ,tz = sz + Math.sin(startAngle * RAD) * radius
        ,Tx = sx + Math.cos(endAngle * RAD) * radius
        ,Tz = sz + Math.sin(endAngle * RAD) * radius

    const v1 = vec2(sx, sz, tx, tz)
        ,v2 = vec2(sx, sz, Tx, Tz)
        ,rangeAngle = getAngleFromVector2(v1, v2)

    const result = []
    const distSqr = radius * radius

    const playersShouldBeSelected = mc.getOnlinePlayers()
        .filter(p => p.uniqueId !== pl.uniqueId && p.health > 0 && pl.distanceToSqr(p) <= distSqr)

    playersShouldBeSelected.concat(mc.getEntities(pl.pos, Math.max(1, radius - 2))).forEach(e => {
        if (e.uniqueId === pl.uniqueId) {
            return
        }

        const v = vec2(sx, sz, e.pos.x, e.pos.z)
        const angle = getAngleFromVector2(v1, v)

        if (!isNaN(angle) && angle <= rangeAngle) {
            result.push(e)
        }
    })

    // console.log(result)
    return result
}

module.exports = {
    selectFromSector, defaultRange,
}