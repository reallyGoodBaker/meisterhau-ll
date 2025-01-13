import { remote } from './llrpc.js'
import { system, world } from '@minecraft/server'
import { syncInputButtons } from './remote/input.js'

remote.expose('cat', (str1, str2) => {
    return str1 + str2
})

function numbers(...args) {
    return args.map(arg => +arg)
}

remote.expose('knockback', (id, _x, _z, _h, _v) => {
    const en = world.getEntity(id)

    if (!en) {
        return
    }

    const [ x, z, h, v ] = numbers(_x, _z, _h, _v)

    en.applyKnockback(x, z, h, v)
})

remote.expose('impulse', (id, _x, _y, _z) => {
    const en = world.getEntity(id)

    if (!en) {
        return
    }

    const [ x, y, z ] = numbers(_x, _y, _z)

    en.applyImpulse({ x, y, z })
})

remote.expose('damage', (victim, damage, cause, abuser, projectile) => {
    const vic = world.getEntity(victim)
    const ab = world.getEntity(abuser)

    let damageOpt = {
        cause,
        damagingEntity: ab,
    }

    if (projectile) {
        damageOpt.damagingProjectile = world.getEntity(projectile)
    }

    try {
        return vic.applyDamage(+damage, damageOpt)
    } catch (error) {
        world.sendMessage(error + '')
    }
})

remote.expose('clearVelocity', enId => {
    const entity = world.getEntity(enId)

    if (!entity) {
        return
    }

    entity.clearVelocity()
})

remote.expose('applyKnockbackAtVelocityDirection', (en, h, v) => {
    const entity = world.getEntity(en)

    if (!entity) {
        return false
    }

    const v3 = entity.getVelocity()
    entity.applyKnockback(v3.x, v3.z, +h, +v)
})

remote.expose('velocity', (en, x, y, z) => {
    const entity = world.getEntity(en)

    if (!entity) {
        return false
    }

    entity.applyKnockback(+x, +z, Math.sqrt(x*x + z*z), +y)
})

remote.expose('rotate', (en, pitch, yaw) => {
    try {
        const entity = world.getEntity(en)

        if (!entity) {
            return false
        }

        world.sendMessage(`x: ${pitch}, y: ${yaw}`)
        entity.setRotation({
            x: pitch,
            y: yaw
        })
    } catch (error) {
        world.sendMessage(error + '')
    }
})

remote.expose('faceTo', (src, t) => {
    const source = world.getEntity(src)
    const target = world.getEntity(t)

    if (!source || !target) {
        return false
    }

    try {
        source.teleport(source.location, {
            keepVelocity: true,
            facingLocation: target.location
        })
    } catch (error) {
        world.sendMessage(error + '')
    }
})

system.runInterval(() => {
    // world.getAllPlayers().forEach(pl => {
    //     pl.sendMessage('' + pl.inputInfo.getButtonState(InputButton.Jump))
    // })
    syncInputButtons()
})