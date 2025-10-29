import { Optional } from '@utils/optional'
import { CameraComponent } from '../components/camera'
import { Stamina } from '../components/core/stamina'
import { ComponentManager } from './component'
import { ActorHelper } from '@utils/actor'

export const defaultAcceptableInputs = [
    'onJump', 'onSneak', 'onAttack', 'onUseItem',
    'onChangeSprinting', 'onFeint', 'onDodge',
]

export class Status {
    /** 存储所有状态的映射表 */
    static readonly status = new Map<string, Status>()

    /**
     * 根据唯一ID获取状态
     * @param uniqueId 实体的唯一ID
     * @returns 状态对象，如果不存在则返回undefined
     */
    static get(uniqueId: string) {
        return this.status.get(uniqueId)
    }

    /**
     * 获取实体的组件管理器
     * @param uniqueId 实体的唯一ID
     * @returns 包含组件管理器的Optional对象
     */
    static getComponentManager(uniqueId: string) {
        return Optional.some(this.get(uniqueId)?.componentManager)
    }

    /**
     * 获取或创建状态对象
     * @param uniqueId 实体的唯一ID
     * @returns 状态对象
     */
    static getOrCreate(uniqueId: string) {
        return this.status.get(uniqueId) || new Status(uniqueId)
    }

    /** 全局状态实例 */
    static readonly global = this.get('global_status')

    /**
     * 手上物品的type
     */
    hand = 'minecraft:air'
    /**
     * moves中当前move的名称
     */
    status = 'unknown'
    /**
     * 动作已持续时间
     */
    duration = 0
    /**
     * 玩家预输入
     */
    preInput: string | null = null


    /**
     * 是否可被击退
     */
    repulsible = true
    /**
     * 玩家的精力(不是饱和度也不是生命值)
     */
    stamina = 0
    /**
     * 玩家的硬直
     */
    stiffness = 0
    /**
     * 是否受到冲击
     * 受到冲击的对象在碰到墙体时会造成短暂眩晕
     */
    shocked = false
    /**
     * 是否霸体状态
     */
    hegemony = false
    #preInputTimer: NodeJS.Timeout | null = null
    /**
     * 处于防御状态
     */
    isBlocking = false
    /**
     * 处于招架等待状态
     */
    isWaitingParry = false
    /**
     * 处于偏斜等待状态
     */
    isWaitingDeflection = false
    /**
     * 处于闪避状态
     */
    isDodging = false
    /**
     * 玩家是否处于无敌状态
     */
    isInvulnerable = false
    /**
     * 玩家接受的事件输入
     */
    readonly acceptableInputs = new Set(defaultAcceptableInputs)


    static defaultCameraOffsets = [ 2.2, 0, 0.7 ]
    cameraOffsets = Status.defaultCameraOffsets

    /**
     * 组件管理器
     */
    readonly componentManager: ComponentManager

    constructor(
        private readonly uniqueId: string
    ) {
        Status.status.set(uniqueId, this)
        this.componentManager = new ComponentManager(
            ActorHelper.getActor(uniqueId)
        )

        this.reset()
    }

    reset() {
        this.hand = 'minecraft:air'
        this.status = 'unknown'
        this.duration = 0
        this.repulsible = true
        this.isBlocking = false
        this.isWaitingParry = false
        this.stamina = 0
        this.stiffness = 0
        defaultAcceptableInputs.forEach(type => this.acceptableInputs.add(type))

        this.componentManager.attachComponent(new Stamina(0))

        if (mc.getPlayer(this.uniqueId)) {
            this.componentManager.attachComponent(
                new CameraComponent()
            )
        }
    }

    /**
     * 设置或检查输入是否可接受
     * @param name 输入名称
     * @param accept 是否接受该输入，可选（不提供时返回当前状态）
     * @returns 当不提供accept参数时返回该输入是否可接受
     */
    acceptableInput(name: string, accept?: boolean) {
        if (accept !== undefined) {
            accept
                ? this.acceptableInputs.add(name)
                : this.acceptableInputs.delete(name)
            return
        }

        return this.acceptableInputs.has(name)
    }

    /**
     * 启用指定的输入类型
     * @param inputs 要启用的输入类型数组
     */
    enableInputs(inputs: string[]) {
        inputs.forEach(type => this.acceptableInputs.add(type))
    }

    /**
     * 禁用指定的输入类型
     * @param inputs 要禁用的输入类型数组
     */
    disableInputs(inputs: string[]) {
        inputs.forEach(type => this.acceptableInputs.delete(type))
    }

    /**
     * 设置预输入，500ms后自动清除
     * @param input 预输入类型
     */
    setPreInput(input: AcceptbleInputTypes) {
        if (this.#preInputTimer) {
            clearInterval(this.#preInputTimer)
        }

        this.preInput = input
        this.#preInputTimer = setTimeout(() => {
            this.#preInputTimer = null
            this.preInput = null
        }, 500)
    }
}
