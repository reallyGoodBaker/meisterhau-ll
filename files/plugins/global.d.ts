/// <reference types="levilamina" />

import { Status } from './Components/combat/basic/core/status'

declare global {

type ModuleInitializer = () => TrickModule

interface TrickModule {
    /**
     * 模组的名字
     */
    sid: string

    /**
     * 需要绑定的物品identifier`s`，如 `minecraft:apple`, `minecraft:bread`
     */
    bind: string[] | string

    moves: Moves

    /**
     * 初始动作的名字，应为`moves`中的一个键名
     */
    entry: string
}

type Moves = {[p: string]: Move}

interface Move {
    /**
     * 前摇时间，默认`0`tick
     * @example
     * ```ts
     * ({ cast: 1 }) //前摇50ms (1tick)
     * ```
     * 
     * 若使用了 `immediately`，此项无效
     */
    cast?: number

    /**
     * 后摇时间，默认`0`tick
     * 
     * 若使用了 `immediately`，此项无效
     */
    backswing?: number

    /**
     * 立刻结束当前状态，默认 `false`
     * 设置为 `true` 会使部分功能失效
     */
    immediately?: boolean

    /**
     * 从上一个动作切换到这个动作进入cast状态时，执行回调函数，若 `immediately` 为 `true`，此回调函数不会被执行
     */
    onEnter?: MovementCallback

    /**
     * `cast` 完成或者 `immediately` 为 `true` 时, 此函数被调用
     * 
     * 目标的选取范围与`range`有关，
     * 若`immediately`为`true`, 选取的目标就是进入此状态时影响的生物 (如被攻击的生物)
     * 
     * @example
     * ```js
     * function killAllInRange(pl, ctx) {
     *      const mobs = ctx.selectFromRange(pl, {
     *          radius: 5,     //半径
     *          angle: 90,     //扇形区域角度
     *          rotation: -45  //扇形区域相对目标视线旋转角进行旋转的角度
     *      })
     *      mobs.filter(mob => pl.uniqueId !== mob.uniqueId) //排除自己
     *          .forEach(mob => mob.kill()) // 杀死被选取的生物
     * }
     * ```
     */
    onAct?: MovementCallback

    /**
     * 进入此状态后，每tick执行的回调,
     * 与`onAct`不同的是，目标每刻会刷新
     * 
     * **请尽量使用 `onEnter`, `onAct`, `onLeave`**
     * 
     * @example
     * ```js
     * function flyup(pl, ctx) {
     *      const mobs = ctx.selectFromRange(pl, {
     *          radius: 5,     //半径
     *          angle: 90,     //扇形区域角度
     *          rotation: -45  //扇形区域相对目标视线旋转角进行旋转的角度
     *      })
     *      mobs.forEach(mob => {
     *          if (pl.uniqueId === mob.uniqueId) { //排除自己
     *              return
     *          }
     * 
     *          const {x, y, z, dimid} = mob.pos
     *          mob.teleport(x, y + 1, z, dimid)
     *      })
     * } // 在范围内的生物每一刻都会以自己当前的位置向上传送一个单位
     * ```
     * 
     */
    onTick?: MovementCallback

    /**
     * 离开此状态时执行的回调，
     * 若`immediately`为`true`, 此函数不会被调用
     * 
     * 常用来消除进入状态时添加的 effect
     * @example
     */
    onLeave?: MovementCallback

    /**
     * 离开此状态的条件及下一个状态
     */
    transitions: MoveTransition

    /**
     * 以刻为键的时间轴
     */
    timeline?: { [P: number]: MovementCallback }

    /**
     * 时间轴，以毫秒为键
     */
    timeTrack?: { [K: number]: MovementCallback }
}

interface MoveTransition<T=string> {
    /**
     * 下一个动作在`moves`中对应的键名
     */

    [P: T]: TransitionTypeOption
}

type DefaultTransitionOption = {
    prevent?: boolean
    allowedState?: 'cast' | 'backswing' | 'both'
    inAir?: boolean
    inWater?: boolean
    inLava?: boolean
    inRain?: boolean
    inSnow?: boolean
    inWall?: boolean
    inWaterOrRain?: boolean
    isInvisible?: boolean
    isHungry?: boolean
    isOnFire?: boolean
    isOnGround?: boolean
    isOnHotBlock?: boolean
    isGliding?: boolean
    isFlying?: boolean
    isMoving?: boolean
    isSneaking?: boolean
    preInput?: keyof InputableTransitionMap
}

interface InputableTransitionMap {
    onJump: unknown
    onSneak: {
        isSneaking?: boolean
    }
    onUseItem: unknown
    onChangeSprinting: {
        sprinting?: boolean
    }
    onAttack: unknown
    onFeint: unknown
}

interface TransitionTypeOptionMap extends InputableTransitionMap {
    onProjectileHitEntity: unknown
    onEndOfLife: unknown
    onParry: unknown
    onParried: unknown
    onHurt: unknown
    onHit: unknown
    onBlock: unknown
    onBlocked: unknown
    onHurtByMob: unknown
    onLock: unknown
    onReleaseLock: unknown
    onKnockdown: unknown
    onKnockdownOther: unknown
    onTrap: unknown
    onInterrupted: unknown
    onMissAttack: unknown
    onDodge: unknown
    onDeflection: unknown
}
type TransitionTypeOption = {
    [p in keyof TransitionTypeOptionMap]?: null | (TransitionTypeOptionMap[p] & DefaultTransitionOption & TransitionOptMixins)
}

type MovementCallback = (source: any, context: Readonly<MovementContext>) => any | Promise<any>

interface AttackRange {
    /**
     * 从玩家面朝方向进行逆时针旋转扇形区域的角度，默认 `60`deg
     */
    angle?: number

    /**
     * 以玩家面朝方向的 xOz 平面分量为基准进行逆时针旋转，默认值 `-30`deg
     * @example
     * ```js
     * //玩家右侧180°的区域
     * const range = {
     *      rotation: 180,
     *      angle: 180
     * }
     * ```
     */
    rotation?: number

    /**
     * 扇形区域的半径，默认值 `2`
     */
    radius?: number
}

interface Pos3 {
    x: number
    y: number
    z: number
    dimid: number
}

type ParticleCurve = (
    progress: number,
    rootPos: Pos3,
    facing: DirectionAngle
) => {
    type: 'point' | 'number' | 'line' | 'circle' | 'cube' | 'particle'
    pos: Pos3
    particle?: string
    number?: number
    color?: string
    facing?: number
    size?: 1 | 2 | 4 | 8 | 16
    pos2?: Pos3
    lineWidth?: 1 | 2 | 4 | 8 | 16
    minSpacing?: number
    maxParticlesNum?: number
}

type DirectionAngle = {
    /**
     * 俯仰角
     */
    pitch: number

    /**
     * 偏航角（旋转角）
     */
    yaw: number
}

interface ParticleEmitter {
    /**
     * 粒子发射器持续时间，默认`1`tick
     */
    duration?: number

    /**
     * 绑定粒子发射器的生物
     */
    attachTo: any

    /**
     * 粒子动画的曲线
     * @example
     * ```js
     * // 水平方向从-90°到90度的粒子动画
     * const startAngle = -90
     * const angle = 180
     * const radius = 4
     * 
     * function circle(progress, pos, facing) {
     *      const { x, y, z, dimid } = pos
     *      const rotYaw = facing.yaw
     *          + progress * angle
     *          + startAngle // 计算粒子相对当前绑定生物的面朝方向的偏航角
     * 
     *      return {
     *          type: 'particle',
     *          particle: 'minecraft:heart_particle', // 心型粒子
     *          pos: {
     *              x: x + Math.sin(rotYaw * Math.PI / 180), //角度转弧度进行sin计算
     *              y: y, //保证粒子不会在竖直方向上随着视角方向变化
     *              z: z + Math.cos(rotYaw * Math.PI / 180),
     *              dimid: dimid
     *          }
     *      }
     * }
     * ```
     */
    curve: ParticleCurve
}

interface MovementContext {
    /**
     * 从范围中选择目标
     */
    selectFromRange(pl: any, range: AttackRange): any[]
    /**
     * 回调函数接受的参数
     * 详情参照liteloader文档
     */
    readonly rawArgs: any[]
    /**
     * 阻止事件发生
     */
    prevent(): void
    /**
     * -1: immediately
     * 0: cast
     * 1: backswing
     */
    readonly previousMoveState: -1 | 0 | 1
    readonly previousStatus: string
    readonly nextStatus: string
    /**
     * 可用于触发特殊攻击的攻击
     * @param abuser 
     * @param victim 
     * @param damage 
     * @param damageType 
     */
    attack(abuser: Player, victim: Player|Entity, damageOpt?: DamageOption): void
    freeze(player: any): void
    unfreeze(player: any): void
    knockback(en: any, x: number, z: number, horizontal: number, vertical: number): Promise<void>
    clearVelocity(en: any): Promise<void>
    impulse(en: any, x: number, y: number, z: number): Promise<void>
    setVelocity(pl: any, rotation: number, h: number, v?: number): void
    yawToVec2(yaw: number): {x: number, y: number}
    applyKnockbackAtVelocityDirection(en: any, h: number, v: number): Promise<void>
    status: Status
    camera(pl: any, enable?: boolean): void
    movement(pl: any, enable?: boolean): void
    movementInput(pl: any, enable?: boolean): void
    task: Task
    lookAt(pl: any, en: any): void
    lookAtTarget(pl: any): void
    distanceToTarget(pl: any): void
    adsorbToTarget(pl: any, max: number, offset?: number): void
    adsorbTo(pl: any, en: any, max: number, offset?: number): void
    knockdown(abuser: any, victim: any, knockback?: number): void
    releaseTarget(xuid: string): void
    adsorbOrSetVelocity(pl: any, max: number, velocityRot?: number, offset?: number): void
    getMoveDir(pl: any): Promise<number>
    trap(pl: any, data?: any): void
    setSpeed(pl: any, speed?: number): void
}

type TaskList = {
    handler: () => void
    timeout: number
}[]

interface Task {
    queueList(taskList: TaskList): Task
    queue(handler: () => void, timeout?: number): Task
    skip(): void
    cancel(): void
    run(): void
}

type AcceptbleInputTypes = keyof InputableTransitionMap

type EntityDamageCause = 'anvil' | 'blockExplosion' | 'charging' | 'contact' | 'drowning' | 'entityAttack'
    | 'entityExplosion' | 'fall' | 'fallingBlock' | 'fire' | 'fireTick' | 'fireworks' | 'flyIntoWall'
    | 'freezing' | 'lava' | 'lightning' | 'magic' | 'magma' | 'none' | 'override' | 'piston' | 'projectile'
    | 'stalactite' | 'stalagmite' | 'starve' | 'suffocation' | 'suicide' | 'temperature' | 'thorns'
    | 'void' | 'wither'

interface DamageOption {
    damage: number
    damageType?: EntityDamageCause
    damagingProjectile?: any
    /**
     * 可穿透格挡
     */
    permeable?: boolean
    /**
     * 可被招架
     */
    parryable?: boolean
    /**
     * 击退数值
     */
    knockback?: number
    /**
     * 是否冲击对手
     * 受到冲击的对象在碰到墙体时会造成短暂眩晕
     */
    shock?: boolean
    /**
     * 武器进攻方向 （从右往左进攻方向是左方向）
     * 在受到攻击的一方，水平方向为受到攻击的一侧
     * 垂直方向只能从上往下，所以不需要考虑方向
     * 'middle' 用于刺击
     */
    direction?: 'left' | 'right' | 'vertical' | 'middle'
    /**
     * 打断霸体
     */
    powerful?: boolean
    /**
     * 僵直时间（毫秒）
     */
    stiffness?: number
    /**
     * 自定义的受击动画
     */
    customHurtAnimation?: string
    /**
     * 追踪正在闪避的目标
     */
    trace?: boolean
}

interface TransitionOptMixins {
    /**
     * 玩家的精力(不是饱和度也不是生命值)
     */
    stamina?: number
    /**
     * 玩家是否锁定某个实体
     */
    hasTarget?: boolean
    /**
     * 是否可被击退
     */
    repulsible?: boolean
    /**
     * 是否受到冲击
     * 受到冲击的对象在碰到墙体时会造成短暂眩晕
     */
    shocked?: boolean
    /**
     * 是否碰撞
     */
    isCollide?: boolean
}

type ObjKeyType<Obj, Val> = { [K in keyof Obj]: Val extends Obj[K] ? K : never }[keyof Obj]

type ConstructorOf<Ret, Param=any[]> = new (...args: Param) => Ret



}