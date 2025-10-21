import { selectFromSector } from './range'
import { battleCamera, cameraInput, clearCamera } from './camera'
import { knockback } from '../../../scripts-rpc/func/kinematics'
import { setVelocity } from './kinematic'
import { DEFAULT_POSTURE_SPEED, DEFAULT_SPEED } from '../index'
import { Status } from '../core/status'
import { TargetLock } from '../components/core/target-lock'
import { Optional } from '@utils/optional'
import { StatusHud } from '../components/hud/statushud'
import { Actor } from '@utils/actor'
import { EventEmitter } from '../../../events'

/** 锁定目标映射表 - 存储玩家ID到目标角色的映射 */
const locks = new Map<string, Actor>()
/** 冷却集合 - 防止重复锁定操作 */
const cooldowns = new Set<string>()

/**
 * 锁定目标
 * @param src 源玩家ID
 * @param target 目标角色
 */
export function lockTarget(src: string, target: Actor) {
    const pl = mc.getPlayer(src)

    if (cooldowns.has(pl.uniqueId)) {
        return
    }

    if (target) {
        locks.set(src, target)
        pl.setMovementSpeed(DEFAULT_POSTURE_SPEED)
        Status.getOrCreate(src).componentManager.attachComponent(
            new TargetLock(
                Optional.some(pl),
                Optional.some(target)
            ),
            new StatusHud(),
        )
    } else {
        clearCamera(pl)
    }
}

/**
 * 释放目标锁定
 * @param src 源玩家ID
 */
export function releaseTarget(src: string) {
    const pl = mc.getPlayer(src)
    const manager = Status.getOrCreate(src).componentManager
    manager.detachComponent(StatusHud)
    manager.detachComponent(TargetLock)
    cameraInput(pl)
    clearCamera(pl)
    locks.delete(src)
    pl.setMovementSpeed(DEFAULT_SPEED)
    cooldowns.add(pl.uniqueId)
    setTimeout(() => cooldowns.delete(pl.uniqueId), 500)
}

/**
 * 切换锁定状态
 * @param src 源玩家ID
 * @returns 目标角色或null/false
 */
export function toggleLock(src: string) {
    if (locks.has(src)) {
        releaseTarget(src)
        return null
    }

    const pl = mc.getPlayer(src)
    const target = getClosedEntity(pl)

    if (!target) {
        return false
    }

    lockTarget(src, target)
    return target
}

/**
 * 计算两个角色之间的角度
 * @param actor 源角色
 * @param actor2 目标角色
 * @returns [水平角度, 垂直角度]
 */
export function getAngle(actor: Actor, actor2: Actor) {
    const a = actor.pos
    const b = actor2.pos
    const dx = b.x - a.x
    const dy = b.y - a.y
    const dz = b.z - a.z
    const angleXZ = Math.atan2(dz, dx) * 180 / Math.PI
    const angleY = Math.atan2(dy, Math.sqrt(dx * dx + dz * dz)) * 180 / Math.PI
    return [angleXZ - 90, -angleY]
}

/**
 * 让角色看向目标
 * @param actor 源角色
 * @param target 目标角色
 */
export function lookAt(actor: Actor, target: Actor) {
    if (!target) {
        return releaseTarget(actor.uniqueId)
    }

    const [ yaw, pitch ] = getAngle(actor, target)

    actor.teleport(actor.feetPos, new DirectionAngle(0, yaw))
}

/**
 * 从锁定组件获取目标角色
 * @param actor 源角色
 * @returns 目标角色的Optional包装
 */
export function getTargetFromLock(actor: Actor): Optional<Actor> {
    return Status.getComponentManager(actor.uniqueId).match(
        Optional.none(),
        comps => comps.getComponent(TargetLock).match(
            Optional.none(),
            lock => lock.target
        )
    )
}

/**
 * 让角色看向锁定的目标
 * @param pl 源角色
 */
export function lookAtTarget(pl: Actor) {
    const targetEntity = getTargetFromLock(pl)

    if (targetEntity.isEmpty()) {
        return
    }

    lookAt(pl, targetEntity.unwrap())
}

/**
 * 检查角色是否有锁定目标
 * @param pl 源角色
 * @returns 是否有锁定目标
 */
export function hasLock(pl: Actor) {
    return !getTargetFromLock(pl).isEmpty()
}

/**
 * 吸附到目标角色
 * @param pl 源角色
 * @param en 目标角色
 * @param max 最大吸附距离
 * @param offset 偏移距离
 */
export function adsorbTo(pl: Actor, en: Actor, max: number, offset=2) {
    const dist = en.distanceTo(pl.pos) - offset

    knockback(
        pl,
        en.pos.x - pl.pos.x,
        en.pos.z - pl.pos.z,
        Math.min(dist, max),
        0
    )
}

/**
 * 吸附到锁定的目标
 * @param pl 源角色
 * @param max 最大吸附距离
 * @param offset 偏移距离
 */
export function adsorbToTarget(pl: Actor, max: number, offset: number) {
    const en = getTargetFromLock(pl)
    if (en.isEmpty()) {
        return
    }

    adsorbTo(pl, en.unwrap(), max, offset)
}

/**
 * 吸附到目标或设置速度
 * @param pl 源角色
 * @param max 最大距离/速度
 * @param velocityRot 速度角度
 * @param offset 偏移距离
 */
export function adsorbOrSetVelocity(pl: Actor, max: number, velocityRot=90, offset=1.5) {
    const en = getTargetFromLock(pl)
    if (!en.isEmpty()) {
        adsorbToTarget(pl, max, offset)
        return
    }

    setVelocity(pl, velocityRot, max, -1)
}

/**
 * 计算到锁定目标的距离
 * @param pl 源角色
 * @returns 到目标的距离，无目标时返回Infinity
 */
export function distanceToTarget(pl: Actor) {
    const en = getTargetFromLock(pl)

    if (en.isEmpty()) {
        return Infinity
    }

    return en.unwrap().distanceTo(pl.pos)
}

/**
 * 每tick更新锁定状态
 * @param em 事件发射器
 * @returns 更新函数
 */
export const onTick = (em: EventEmitter) => () => {
    locks.forEach(async (t, s) => {
        const _s = mc.getPlayer(s)

        if (t.health) {
            battleCamera(_s, t)
        } else if (_s) {
            em.emitNone('onReleaseLock', _s, _s.getHand().type)
            releaseTarget(s)
        }
    })
}

const ignoreEntities = [
    'minecraft:item',
    'minecraft:xp_orb',
]

/**
 * 获取最近的实体
 * @param en 源角色
 * @returns 最近的实体或null
 */
export function getClosedEntity(en: Actor) {
    let closed: Actor | null = null
        ,dist = Infinity

    selectFromSector(en, {
        radius: 10,
        angle: 46,
        rotation: -23,
    }).forEach(e => {
        if (ignoreEntities.includes((e as Entity).type)) {
            return
        }

        if (!closed) {
            return closed = e
        }

        const _dist = e.distanceTo(en.pos)

        if (_dist < dist) {
            dist = _dist
            closed = e
        }
    })

    return closed
}
