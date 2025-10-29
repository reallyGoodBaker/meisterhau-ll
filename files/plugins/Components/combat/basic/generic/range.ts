import { Actor, ActorHelper } from '@utils/actor'
import { vec2, getAngleFromVector2 } from './vec'

/** 默认攻击范围配置 */
export const defaultRange = {
    angle: 60,      // 扇形角度
    rotation: -30,  // 旋转偏移角度
    radius: 2.5     // 扇形半径
}

/**
 * 从扇形区域选择目标
 * @param pl 源角色
 * @param range 攻击范围配置
 * @returns 在扇形区域内的目标角色数组
 */
export function selectFromSector(pl: Actor, range: AttackRange=defaultRange) {
    const {
        angle, rotation, radius
    } = Object.assign({}, defaultRange, range)
    const pos = ActorHelper.position(pl)
    const startAngle = pl.direction.yaw + rotation + 90
    const endAngle = startAngle + angle
    const RAD = Math.PI / 180
    const sx = pos.x
        ,sz = pos.z
        ,tx = sx + Math.cos(startAngle * RAD) * radius
        ,tz = sz + Math.sin(startAngle * RAD) * radius
        ,Tx = sx + Math.cos(endAngle * RAD) * radius
        ,Tz = sz + Math.sin(endAngle * RAD) * radius

    // 计算扇形边界向量
    const v1 = vec2(sx, sz, tx, tz)
        ,v2 = vec2(sx, sz, Tx, Tz)
        ,rangeAngle = getAngleFromVector2(v1, v2)

    const result: Actor[] = []
    const distSqr = radius * radius

    // 筛选在线玩家
    const playersShouldBeSelected = (mc.getOnlinePlayers() as Actor[])
        .filter(p => p.uniqueId !== pl.uniqueId && p.health > 0 && pl.distanceToSqr(p) <= distSqr)

    // 筛选实体并检查是否在扇形区域内
    playersShouldBeSelected.concat(mc.getEntities(pl.pos, Math.max(1.5, radius - 1.5)) as Actor[]).forEach(e => {
        if (e.uniqueId === pl.uniqueId) {
            return
        }

        const v = vec2(sx, sz, e.pos.x, e.pos.z)
        const angle = getAngleFromVector2(v1, v)

        if (!isNaN(angle) && angle <= rangeAngle) {
            result.push(e)
        }
    })

    return result
}
