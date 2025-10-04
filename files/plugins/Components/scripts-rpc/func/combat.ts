import { Actor } from "@combat/basic/core/inputSimulator"
import { remote } from '../setup'

export async function damage(victim: Actor, damage: number, cause: any, abuser: Actor, projectile: Actor) {
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

export function _damageLL(victim: Actor, damage: number) {
    victim.hurt(damage, 2)
}

export async function setRotation(en: Actor, pitch: number, yaw: number) {
    return await remote.call(
        'setRotation',
        en.uniqueId,
        pitch,
        yaw
    )
}