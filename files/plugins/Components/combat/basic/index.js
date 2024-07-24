const console = require('../../console/main')

function playAnim(pl, anim, nextAnim, time, stopExp, controller) {
    mc.runcmdEx(`/playanimation "${pl.name}" ` + [anim, nextAnim, time, stopExp, controller].filter(x => x).join(' '))
}

function playSound(pl, sound, pos, volume, pitch, minVolume) {
    mc.runcmdEx(`/playsound ${sound} ${pl.name} ` + [
        pos.x, pos.y, pos.z, volume, pitch, minVolume
    ].join(' '))
}

function playSoundAll(sound, pos, volume, pitch, minVolume) {
    mc.runcmdEx(`/playsound ${sound} @a ` + [
        pos.x, pos.y, pos.z, volume, pitch, minVolume
    ].join(' '))
}

function playParticle(particle, pos) {
    mc.runcmdEx(`/particle ${particle} ` + [
        pos.x, pos.y, pos.z
    ].join(' '))
}

function movable() {
    
}

module.exports = {
    playAnim, playSound, playSoundAll, playParticle,
}