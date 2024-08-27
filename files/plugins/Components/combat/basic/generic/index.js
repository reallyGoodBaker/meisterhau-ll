const { DEFAULT_POSTURE_SPEED, DEFAULT_SPEED } = require("../index")
const { hasLock } = require("./lock")

function movement(pl, enabled=true) {
    if (!enabled) {
        return pl.setMovementSpeed(0), undefined
    }

    pl.setMovementSpeed(
        hasLock(pl) ? DEFAULT_POSTURE_SPEED : DEFAULT_SPEED
    )
}

function movementInput(pl, enabled=true) {
    mc.runcmdEx(`inputpermission set "${pl.name}" movement ${enabled ? 'enabled' : 'disabled'}`)
}

function camera(pl, enabled=true) {
    mc.runcmdEx(`inputpermission set "${pl.name}" camera ${enabled ? 'enabled' : 'disabled'}`)
}

module.exports = {
    movement, camera, movementInput
}
