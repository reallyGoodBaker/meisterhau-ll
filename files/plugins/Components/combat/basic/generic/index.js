const { hasLock } = require("./lock")

function movement(pl, enabled=true) {
    if (!enabled) {
        return pl.setMovementSpeed(0), undefined
    }

    pl.setMovementSpeed(
        hasLock(pl) ? 0.06 : 0.1
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
