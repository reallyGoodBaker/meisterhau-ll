import { Vector } from "@utils/math"
import { CameraComponent } from '../components/camera'
import { Status } from '../core/status'
import { rotate2, vec2, multiply2 } from './vec'
import { Actor } from "@utils/actor"

/**
 * 设置相机输入权限
 * @param pl 玩家对象
 * @param enabled 是否启用相机输入
 */
export const cameraInput = (pl: Player, enabled=true) => {
    mc.runcmdEx(`inputpermission set "${pl.name}" camera ${enabled ? 'enabled' : 'disabled'}`)
}

/**
 * 设置相机位置和朝向
 * @param pl 玩家对象
 * @param easeTime 缓动时间
 * @param easeType 缓动类型
 * @param pos 相机位置
 * @param lookAt 相机朝向位置
 */
const camera = (pl: Player, easeTime: number, easeType: string, pos: Vector, lookAt: Vector) => {
    mc.runcmdEx(`camera "${pl.name}" set minecraft:free ease ${easeTime} ${easeType} pos ${pos.x} ${pos.y} ${pos.z} facing ${lookAt.x} ${lookAt.y} ${lookAt.z}`)
}

/**
 * 设置相机位置和旋转角度
 * @param pl 玩家对象
 * @param easeTime 缓动时间
 * @param easeType 缓动类型
 * @param pos 相机位置
 * @param rotX X轴旋转角度
 * @param rotY Y轴旋转角度
 */
const cameraRot = (pl: Player, easeTime: number, easeType: string, pos: Vector, rotX: number, rotY: number) => {
    mc.runcmdEx(`camera "${pl.name}" set minecraft:free ease ${easeTime} ${easeType} pos ${pos.x} ${pos.y} ${pos.z} rot ${rotX} ${rotY}`) 
}

/**
 * 清除相机设置，恢复默认相机
 * @param pl 玩家对象
 */
export function clearCamera(pl: Player) {
    mc.runcmdEx(`camera "${pl.name}" set meisterhau:battle`)
}

const ROT = Math.PI * 1
const ANGLE = 180 / Math.PI

/**
 * 设置战斗相机到中间点位置
 * @param pl 玩家对象
 * @param en 目标角色
 */
export const battleCameraMiddlePoint = (pl: Player, en: Actor) => {
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

/**
 * 设置战斗相机
 * @param pl 玩家对象
 * @param en 目标角色
 */
export const battleCamera = (pl: Player, en: Actor) => {
    if (!pl) {
        return
    }

    const plPos = pl.pos
    let enPos: Vector = en.pos
    let initVec = vec2(plPos.x, plPos.z, enPos.x, enPos.z)
    const dist = initVec.m

    if (dist < 3) {
        const dxn = initVec.dx / dist
        const dyn = initVec.dy / dist
        initVec = {
            dx: dxn * 3,
            dy: dyn * 3,
            m: 3,
        }

        enPos = {
            x: plPos.x + dxn * 3,
            y: enPos.y,
            z: plPos.z + dyn * 3,
        }
    }

    const manager = Status.getOrCreate(pl.uniqueId).componentManager
    const cameraComponentOpt = manager.getComponent(CameraComponent)
    if (cameraComponentOpt.isEmpty()) {
        return
    }

    const cameraComponent = cameraComponentOpt.unwrap()
    const [ offsetX, offsetY, offsetZ ] = cameraComponent.offset
    const moduloScale = offsetZ / initVec.m

    const cameraVec = multiply2(
        rotate2(
            initVec,
            Math.acos(
                Math.max(0, Math.min(offsetZ / dist, 0.5))
            ) - ROT
        ),
        moduloScale
    )

    const crossPos = {
        x: plPos.x - cameraVec.dx,
        z: plPos.z - cameraVec.dy,
    }

    const cameraTargetVec = vec2(
        crossPos.x, crossPos.z,
        enPos.x, enPos.z
    )

    const cameraPosVec = multiply2(
        rotate2(cameraTargetVec, Math.PI),
        offsetX / cameraTargetVec.m
    )

    const cameraPos = {
        x: crossPos.x + cameraPosVec.dx,
        z: crossPos.z + cameraPosVec.dy,
        y: plPos.y - .2 + offsetY,
    }

    // camera(pl, 0.1, 'linear', cameraPos, {
    //     x: enPos.x,
    //     z: enPos.z,
    //     y: cameraPos.y
    // })
    const cameraEntityVec = {
        x: enPos.x - cameraPos.x,
        z: enPos.z - cameraPos.z,
        y: cameraPos.y
    }

    const yaw = Math.atan2(cameraEntityVec.z, cameraEntityVec.x) * ANGLE - 90
    const pitch = (Math.atan2(Math.sqrt(cameraEntityVec.x * cameraEntityVec.x + cameraEntityVec.z * cameraEntityVec.z), cameraEntityVec.y)) * ANGLE
    const [ dYaw, dPitch ] = cameraComponent.rot
    cameraRot(pl, 0.1, 'linear', cameraPos, dPitch, yaw + dYaw)
}
