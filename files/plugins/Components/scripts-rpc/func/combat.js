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

function _damageLL(victim, damage) {
    victim.hurt(damage, ActorDamageCause.EntityAttack)
}

module.exports = {
    damage, _damageLL,
}