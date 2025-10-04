const { selectFromSector } = require('./range')
const { battleCamera, cameraInput, clearCamera } = require('./camera')
const { knockback } = require('../../../scripts-rpc/func/kinematics')
const { setVelocity } = require('./kinematic')
const { DEFAULT_POSTURE_SPEED, DEFAULT_SPEED } = require('../index')
const { Status } = require('../core/status')
const { TargetLock } = require('../components/core/target-lock')
const { Optional } = require('@utils/optional')
const { StatusHud } = require('../components/hud/statushud')

const locks = new Map()
const cooldowns = new Set()

function lockTarget(src, target) {
    const pl = mc.getPlayer(src)

    if (cooldowns.has(pl.uniqueId)) {
        return
    }

    if (target) {
        // cameraInput(pl, false)
        locks.set(src, target)
        pl.setMovementSpeed(DEFAULT_POSTURE_SPEED)
        Status.getOrCreate(src).componentManager.attachComponent(
            new TargetLock(Optional.some(pl), Optional.some(target)),
            new StatusHud(),
        )
    } else {
        clearCamera(pl)
    }
}

function releaseTarget(src) {
    const pl = mc.getPlayer(src)
    const manager = Status.getOrCreate(src).componentManager
    manager.detachComponent(StatusHud)
    manager.detachComponent(TargetLock)
    cameraInput(pl)
    clearCamera(pl)
    locks.delete(src)
    pl.setMovementSpeed(DEFAULT_SPEED)
    cooldowns.add(pl.uniqueId)
    setTimeout(() => cooldowns.delete(pl.uniqueId), 500)
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

/**
 * @param {import('../core/inputSimulator').Actor} actor 
 * @param {import('../core/inputSimulator').Actor} target 
 * @returns 
 */
function lookAt(actor, target) {
    if (!target) {
        return releaseTarget(actor)
    }

    const [ yaw, pitch ] = getAngle(actor, target)

    actor.teleport(actor.feetPos, new DirectionAngle(0, yaw))

    // setRotation(actor, yaw, pitch)

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
    // faceTo(actor, target)
}

function getTargetFromLock(actor) {
    return Status.getComponentManager(actor.uniqueId).match(
        Optional.none(),
        comps => comps.getComponent(TargetLock).match(
            Optional.none(),
            lock => lock.target
        )
    )
}

function lookAtTarget(pl) {
    // const en = locks.get(pl.uniqueId)
    // if (!en) {
    //     return
    // }
    const targetEntity = getTargetFromLock(pl)

    if (targetEntity.isEmpty()) {
        return
    }

    lookAt(pl, targetEntity.unwrap())
}

function hasLock(pl) {
    // return locks.has(pl.uniqueId)
    return !getTargetFromLock(pl).isEmpty()
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
    const en = getTargetFromLock(pl)
    if (en.isEmpty()) {
        return
    }

    adsorbTo(pl, en.unwrap(), max, offset)
}

function adsorbOrSetVelocity(pl, max, velocityRot=90, offset=1.5) {
    const en = getTargetFromLock(pl)
    if (!en.isEmpty()) {
        // lookAtTarget(pl)
        adsorbToTarget(pl, max, offset)
        return
    }

    setVelocity(pl, velocityRot, max, -1)
}

function distanceToTarget(pl) {
    // const en = locks.get(pl.uniqueId)
    const en = getTargetFromLock(pl)

    if (en.isEmpty()) {
        return Infinity
    }

    return en.unwrap().distanceTo(pl.pos)
}

const onTick = em => () => {
    locks.forEach(async (t, s) => {
        const _s = mc.getPlayer(s)

        if (t.health) {
            battleCamera(_s, t)
        } else if (_s) {
            em.emitNone('onReleaseLock', _s, _s.getHand().type)
            releaseTarget(s)
        }
    })
}

const ignoreEntities = [
    'minecraft:item',
    'minecraft:xp_orb',
]

function getClosedEntity(en) {
    let closed = null
        ,dist = Infinity

    selectFromSector(en, {
        radius: 10,
        angle: 46,
        rotate: -23,
    }).forEach(e => {
        if (ignoreEntities.includes(e.type)) {
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