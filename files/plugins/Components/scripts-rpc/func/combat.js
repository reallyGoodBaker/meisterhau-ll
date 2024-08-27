const { remote } = require('../setup')

async function damage(victim, damage, cause, abuser, projectile) {
    return await remote.call(
        'damage',
        victim.uniqueId,
        damage,
        cause,
        abuser.uniqueId,
        projectile?.uniqueId
    )
    // _damageLL(victim, damage)
}

/**
 * 
 * @param {Entity} victim
 */
function _damageLL(victim, damage, cause, abuser, projectile) {
    victim.hurt(damage, ActorDamageCause.EntityAttack)
}

module.exports = {
    damage, _damageLL
}