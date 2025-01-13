const { vec2, getAngleFromVector2 } = require('./vec')

const defaultRange = {
    angle: 60,
    rotation: -30,
    radius: 2.5
}

function selectFromRange(pl, range) {
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

    mc.getOnlinePlayers().concat(mc.getAllEntities()).forEach(e => {
        const dist = pl.distanceTo(e.pos)

        if (dist > radius) {
            return
        }

        if (dist <= 1) {
            result.push(e)
            return
        }

        const v = vec2(sx, sz, e.pos.x, e.pos.z)
        const angle = getAngleFromVector2(v1, v)

        if (!isNaN(angle) && angle <= rangeAngle) {
            result.push(e)
        }
    })

    return result.filter(e => e.uniqueId !== pl.uniqueId)
}

module.exports = {
    selectFromRange, defaultRange,
}