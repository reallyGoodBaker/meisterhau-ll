import { Optional } from "@utils/optional"
import { AiHearing } from "./components/ai/hearing"
import { Actor, ActorHelper } from "@utils/actor"

/**
 * 播放动画
 * @param pl - 玩家
 * @param anim - 动画名称
 * @param nextAnim - 下一个动画名称（可选）
 * @param time - 动画时间（可选）
 * @param stopExp - 停止表达式（可选）
 * @param controller - 控制器名称（可选）
 */
export function playAnim(pl: Player, anim: string, nextAnim?: string, time?: number, stopExp?: string, controller?: string) {
    mc.runcmdEx(`/playanimation "${pl.name}" ` + [anim, nextAnim, time, stopExp, controller].filter(x => x).join(' '))
}

/**
 * 兼容性播放动画 - 根据actor类型自动选择播放方式
 * @param actor - 演员对象（玩家或实体）
 * @param anim - 动画名称
 * @param nextAnim - 下一个动画名称（可选）
 * @param time - 动画时间（可选）
 * @param stopExp - 停止表达式（可选）
 * @param controller - 控制器名称（可选）
 */
export function playAnimCompatibility(actor: Actor, anim: string, nextAnim?: string, time?: number, stopExp?: string, controller?: string) {
    if (ActorHelper.isPlayer(actor)) {
        playAnim(actor as Player, anim, nextAnim, time, stopExp, controller)
        return
    }

    playAnimEntity(actor as Entity, anim, nextAnim, time, stopExp, controller)
}

/**
 * 生成实体选择器
 * @param en - 实体对象
 * @returns 实体选择器字符串
 */
export function entitySelector(en: Entity) {
    const pos = Optional.some(en?.pos)
    return pos.match(
        '@e[c=0]',
        pos => `@e[c=1,type=${en.type},x=${pos.x},y=${pos.y},z=${pos.z},r=1]`
    )
}

/**
 * 生成演员选择器 - 根据演员类型返回对应的选择器
 * @param actor - 演员对象（玩家或实体）
 * @returns 玩家名称或实体选择器
 */
export function actorSelector(actor: Actor) {
    if ('xuid' in actor) {
        return `"${actor.name}"`
    }

    return entitySelector(actor)
}

/**
 * 为实体播放动画
 * @param en - 实体对象
 * @param anim - 动画名称
 * @param nextAnim - 下一个动画名称（可选）
 * @param time - 动画时间（可选）
 * @param stopExp - 停止表达式（可选）
 * @param controller - 控制器名称（可选）
 */
export function playAnimEntity(en: Entity, anim: string, nextAnim?: string, time?: number, stopExp?: string, controller?: string) {
    mc.runcmdEx(`/playanimation ${entitySelector(en)} ` + [anim, nextAnim, time, stopExp, controller].filter(x => x).join(' '))
}

/**
 * 为指定玩家播放音效
 * @param pl - 玩家对象
 * @param sound - 音效名称
 * @param pos - 音效位置
 * @param volume - 音量（可选）
 * @param pitch - 音调（可选）
 * @param minVolume - 最小音量（可选）
 */
export function playSound(pl: Player, sound: string, pos: Pos3, volume?: number, pitch?: number, minVolume?: number) {
    mc.runcmdEx(`/playsound ${sound} ${pl.name} ` + [
        pos.x, pos.y, pos.z, volume, pitch, minVolume
    ].join(' '))
}

/**
 * 为所有玩家播放音效
 * @param sound - 音效名称
 * @param pos - 音效位置
 * @param volume - 音量（可选）
 * @param pitch - 音调（可选）
 * @param minVolume - 最小音量（可选）
 */
export function playSoundAll(sound: string, pos: Pos3, volume?: number, pitch?: number, minVolume?: number) {
    mc.runcmdEx(`/playsound ${sound} @a ` + [
        pos.x, pos.y, pos.z, volume, pitch, minVolume
    ].join(' '))
}

/**
 * 在指定位置播放粒子效果
 * @param particle - 粒子名称
 * @param pos - 粒子位置
 */
export function playParticle(particle: string, pos: Pos3) {
    mc.runcmdEx(`/particle ${particle} ` + [
        pos.x, pos.y, pos.z
    ].join(' '))
}

/**
 * 可移动性函数 - 检查角色是否可移动（待实现）
 * @returns 总是返回undefined（函数待实现）
 */
export function movable() {

}

/** 默认移动速度 */
export const DEFAULT_SPEED = 0.1

/** 默认姿态速度 */
export const DEFAULT_POSTURE_SPEED = 0.04
