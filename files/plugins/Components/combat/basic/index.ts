import { Actor } from "./core/inputSimulator"

export function playAnim(pl: Player|Entity, anim: string, nextAnim?: string, time?: number, stopExp?: string, controller?: string) {
    mc.runcmdEx(`/playanimation "${pl.name}" ` + [anim, nextAnim, time, stopExp, controller].filter(x => x).join(' '))
}

export function playAnimCompatibility(actor: Actor, anim: string, nextAnim?: string, time?: number, stopExp?: string, controller?: string) {
    if ('xuid' in actor) {
        playAnim(actor, anim, nextAnim, time, stopExp, controller)
        return
    }

    playAnimEntity(actor, anim, nextAnim, time, stopExp, controller)
}

export function entitySelector(en: Entity) {
    const pos = en.pos
    return `@e[c=1,type=${en.type},x=${pos.x},y=${pos.y},z=${pos.z},r=1]`
}

export function actorSelector(actor: Actor) {
    if ('xuid' in actor) {
        return `"${actor.name}"`
    }

    return entitySelector(actor)
}

export function playAnimEntity(en: Entity, anim: string, nextAnim?: string, time?: number, stopExp?: string, controller?: string) {
    mc.runcmdEx(`/playanimation ${entitySelector(en)} ` + [anim, nextAnim, time, stopExp, controller].filter(x => x).join(' '))
}

export function playSound(pl: Player, sound: string, pos: Pos3, volume?: number, pitch?: number, minVolume?: number) {
    mc.runcmdEx(`/playsound ${sound} ${pl.name} ` + [
        pos.x, pos.y, pos.z, volume, pitch, minVolume
    ].join(' '))
}

export function playSoundAll(sound: string, pos: Pos3, volume?: number, pitch?: number, minVolume?: number) {
    mc.runcmdEx(`/playsound ${sound} @a ` + [
        pos.x, pos.y, pos.z, volume, pitch, minVolume
    ].join(' '))
}

export function playParticle(particle: string, pos: Pos3) {
    mc.runcmdEx(`/particle ${particle} ` + [
        pos.x, pos.y, pos.z
    ].join(' '))
}

export function movable() {
    
}

export const DEFAULT_SPEED = 0.1
export const DEFAULT_POSTURE_SPEED = 0.04