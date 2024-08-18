export function playAnim(pl: Player, anim: string, nextAnim?: string, time?: number, stopExp?: string, controller?: string) {
    mc.runcmdEx(`/playanimation "${pl.name}" ` + [anim, nextAnim, time, stopExp, controller].filter(x => x).join(' '))
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