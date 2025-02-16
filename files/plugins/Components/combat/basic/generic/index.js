const { DEFAULT_POSTURE_SPEED, DEFAULT_SPEED } = require("../index")
const { hasLock } = require("./lock")

function movement(pl, enabled=true) {
    if (!enabled) {
        pl.setMovementSpeed(0)
        return
    }

    pl.setMovementSpeed(
        hasLock(pl) ? DEFAULT_POSTURE_SPEED : DEFAULT_SPEED
    )
}

function movementInput(pl, enabled=true) {
    mc.runcmdEx(`inputpermission set "${pl.name}" lateral_movement ${enabled ? 'enabled' : 'disabled'}`)
}

function camera(pl, enabled=true) {
    mc.runcmdEx(`inputpermission set "${pl.name}" camera ${enabled ? 'enabled' : 'disabled'}`)
}

module.exports = {
    movement, camera, movementInput
}
