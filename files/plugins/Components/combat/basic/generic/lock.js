const { remote } = require('../../../scripts-rpc/setup')
const console = require('../../../console/main')
const { selectFromRange } = require('./range')
const { battleCamera, cameraInput, clearCamera } = require('./camera')
const { knockback, faceTo } = require('../../../scripts-rpc/func/kinematics')
const { setVelocity } = require('./kinematic')
const { playAnim } = require('../index')

const locks = new Map()
const cooldowns = new Set()

function lockTarget(src, target) {
    const pl = mc.getPlayer(src)

    if (cooldowns.has(pl.xuid)) {
        return
    }

    if (target) {
        cameraInput(pl, false)
        locks.set(src, target)
        pl.setMovementSpeed(0.04)
    } else {
        clearCamera(pl)
    }
}

function releaseTarget(src) {
    const pl = mc.getPlayer(src)
    cameraInput(pl)
    clearCamera(pl)
    locks.delete(src)
    pl.setMovementSpeed(0.1)
    cooldowns.add(pl.xuid)
    setTimeout(() => cooldowns.delete(pl.xuid), 500)
}

function toggleLock(src) {
    if (locks.has(src)) {
        releaseTarget(src)
        return null
    }

    const pl = mc.getPlayer(src)
    const target = getClosedEntity(pl)

    if (!target) {
        return false
    }

    lockTarget(src, target)
    return target
}

function getAngle(a, b) {
    a = a.pos
    b = b.pos
    const dx = b.x - a.x
    const dy = b.y - a.y
    const dz = b.z - a.z
    const angleXZ = Math.atan2(dz, dx) * 180 / Math.PI
    const angleY = Math.atan2(dy, Math.sqrt(dx * dx + dz * dz)) * 180 / Math.PI
    return [angleXZ - 90, -angleY]
}

function lookAt(pl, en) {
    if (!en) {
        return releaseTarget(pl)
    }

    const [ yaw, pitch ] = getAngle(pl, en)

    pl.teleport(pl.feetPos, new DirectionAngle(pitch, yaw))
    // const bs = new BinaryStream()
    // bs.writeVarInt64(+pl.uniqueId)
    // bs.writeVec3(pl.pos)
    // bs.writeVec3(new FloatPos(
    //     pitch, yaw, yaw,
    //     pl.pos.dimid
    // ))
    // bs.writeByte(3)
    // bs.writeBool(true)
    // bs.writeFloat(0)
    // bs.writeVarInt64(0)
    // const pack = bs.createPacket(0x13)

    // mc.getOnlinePlayers().forEach(pl => {
    //     pl.sendPacket(pack)
    // })
    // mc.runcmdEx(`execute as "${pl.name}" at @s run tp @s ~~~ ${yaw} 0 false`)
    // faceTo(pl, en)
}

function lookAtTarget(pl) {
    const en = locks.get(pl.xuid)
    if (!en) {
        return
    }
    lookAt(pl, en)
}

function hasLock(pl) {
    return locks.has(pl.xuid)
}

function adsorbTo(pl, en, max, offset=2) {
    const dist = en.distanceTo(pl.pos) - offset

    knockback(
        pl,
        en.pos.x - pl.pos.x,
        en.pos.z - pl.pos.z,
        Math.min(dist, max),
        0
    )
}

function adsorbToTarget(pl, max, offset) {
    const en = locks.get(pl.xuid)
    if (!en) {
        return
    }

    adsorbTo(pl, en, max, offset)
}

function adsorbOrSetVelocity(pl, max, velocityRot=90, offset=1.5) {
    const en = locks.get(pl.xuid)
    if (en) {
        // lookAtTarget(pl)
        adsorbToTarget(pl, max, offset)
        return
    }

    setVelocity(pl, velocityRot, max, -1)
}

function distanceToTarget(pl) {
    const en = locks.get(pl.xuid)

    if (!en) {
        return Infinity
    }

    return en.distanceTo(pl.pos)
}

const onTick = em => () => {
    locks.forEach(async (t, s) => {
        const _s = mc.getPlayer(s)

        if (t.health) {
            battleCamera(_s, t)
        } else {
            em.emitNone('onReleaseLock', _s, _s.getHand().type)
            releaseTarget(s)
        }
    })
}

function getClosedEntity(en) {
    let closed = null
        ,dist = Infinity

    selectFromRange(en, {
        radius: 10,
    }).forEach(e => {
        if (['coptaine:physics', 'minecraft:item'].includes(e.type)) {
            return
        }

        if (!closed) {
            return closed = e
        }

        const _dist = e.distanceTo(en.pos)

        if (_dist < dist) {
            dist = _dist
            closed = e
        }
    })

    return closed
}

module.exports = {
    onTick, getClosedEntity, lockTarget, releaseTarget, toggleLock,
    lookAt, lookAtTarget, distanceToTarget, hasLock, adsorbToTarget,
    adsorbTo, adsorbOrSetVelocity
}