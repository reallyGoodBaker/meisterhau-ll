const { remote } = require('../setup')

async function knockback(en, x, z, h, v) {
    return await remote.call('knockback', en.uniqueId, x, z, h, v)
}

async function impulse(en, x, y, z) {
    return await remote.call('impulse', en.uniqueId, x, y, z)
}

async function clearVelocity(en) {
    return await remote.call('clearVelocity', en.uniqueId)
}

async function applyKnockbackAtVelocityDirection(en, h, v) {
    return await remote.call('applyKnockbackAtVelocityDirection', en.uniqueId, h, v)
}

async function rotate(en, pitch, yaw) {
    return await remote.call('rotate', en.uniqueId, pitch, yaw)
}

async function faceTo(src, t) {
    return await remote.call('faceTo', src.uniqueId, t.uniqueId)
}

module.exports = {
    knockback, impulse, clearVelocity, applyKnockbackAtVelocityDirection, rotate, faceTo
}