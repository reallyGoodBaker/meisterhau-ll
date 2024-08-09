const console = require('../../../console/main')
const { CameraComponent } = require('../components/camera')
const { Status } = require('../core/status')
const { rotate2, vec2, multiply2 } = require('./vec')

const cameraInput = (pl, enabled=true) => {
    mc.runcmdEx(`inputpermission set "${pl.name}" camera ${enabled ? 'enabled' : 'disabled'}`)
}

const camera = (pl, easeTime, easeType, pos, lookAt) => {
    mc.runcmdEx(`execute as "${pl.name}" run camera @s set minecraft:free ease ${easeTime} ${easeType} pos ${pos.x} ${pos.y} ${pos.z} facing ${lookAt.x} ${lookAt.y} ${lookAt.z}`)
}

function clearCamera(pl) {
    mc.runcmdEx(`camera "${pl.name}" set minecraft:third_person`)
}

const ROT = Math.PI * 1

const battleCameraMiddlePoint = (pl, en) => {
    const plPos = pl.pos
    const enPos = en.pos
    const initVec = vec2(plPos.x, plPos.z, enPos.x, enPos.z)
    const dist = initVec.m
    const offsetZ = 1.5
    const offsetX = 5
    const moduloScale = offsetZ / initVec.m
    
    const middlePoint = {
        x: (plPos.x + enPos.x) / 2,
        y: (plPos.y + enPos.y) / 2,
        z: (plPos.z + enPos.z) / 2,
    }

    const cameraVec = multiply2(
        rotate2(
            initVec,
            Math.acos(
                Math.max(0, Math.min(offsetZ / dist, 1))
            ) - ROT
        ),
        moduloScale
    )
    
    const crossPos = {
        x: plPos.x - cameraVec.dx,
        z: plPos.z - cameraVec.dy,
    }

    const cameraTargetVec = vec2(
        crossPos.x,
        crossPos.z,
        enPos.x, enPos.z
    )

    const cameraPosVec = multiply2(
        rotate2(cameraTargetVec, Math.PI),
        offsetX / cameraTargetVec.m
    )

    const cameraPos = {
        x: crossPos.x + cameraPosVec.dx,
        z: crossPos.z + cameraPosVec.dy,
        y: plPos.y - 0.4,
    }

    camera(pl, 0.1, 'linear', cameraPos, { ...middlePoint, y: cameraPos.y })
}

const battleCamera = (pl, en) => {
    if (!pl) {
        return
    }

    const plPos = pl.pos
    const enPos = en.pos
    const initVec = vec2(plPos.x, plPos.z, enPos.x, enPos.z)
    const dist = initVec.m
    const manager = Status.get(pl.xuid).componentManager
    const cameraComponent = manager.getComponent(CameraComponent)

    if (!cameraComponent) {
        return
    }

    const [ offsetX, offsetY, offsetZ ] = cameraComponent.offset
    const moduloScale = offsetZ / initVec.m

    const cameraVec = multiply2(
        rotate2(
            initVec,
            Math.acos(
                Math.max(0, Math.min(offsetZ / dist, 1))
            ) - ROT
        ),
        moduloScale
    )

    const crossPos = {
        x: plPos.x - cameraVec.dx,
        z: plPos.z - cameraVec.dy,
    }

    const cameraTargetVec = vec2(
        crossPos.x,
        crossPos.z,
        enPos.x, enPos.z
    )

    const cameraPosVec = multiply2(
        rotate2(cameraTargetVec, Math.PI),
        offsetX / cameraTargetVec.m
    )

    const cameraPos = {
        x: crossPos.x + cameraPosVec.dx,
        z: crossPos.z + cameraPosVec.dy,
        y: plPos.y - 0.4,
    }

    camera(pl, 0.1, 'linear', cameraPos, { x: enPos.x, z: enPos.z, y: cameraPos.y + offsetY })
}

module.exports = {
    battleCamera, battleCameraMiddlePoint, cameraInput, clearCamera
}