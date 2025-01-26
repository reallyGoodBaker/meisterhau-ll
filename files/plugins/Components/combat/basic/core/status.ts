import { CameraComponent } from '../components/camera'
import { Stamina } from '../components/core/stamina'
import { ComponentManager } from './component'

export const defaultAcceptableInputs = [
    'onJump', 'onSneak', 'onAttack', 'onUseItem',
    'onChangeSprinting', 'onFeint'
]

export class Status {
    static readonly status = new Map<string, Status>()
    static get(uniqueId: string) {
        return this.status.get(uniqueId) || new Status(uniqueId)
    }

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
     * 玩家接受的事件输入
     */
    readonly acceptableInputs = new Set(defaultAcceptableInputs)


    static defaultCameraOffsets = [ 2.2, 0, 0.7 ]
    cameraOffsets = Status.defaultCameraOffsets

    /**
     * 组件管理器
     */
    readonly componentManager = new ComponentManager()

    constructor(
        private readonly uniqueId: string
    ) {
        Status.status.set(uniqueId, this)
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

    acceptableInput(name: string, accept: boolean) {
        if (accept !== undefined) {
            accept
                ? this.acceptableInputs.add(name)
                : this.acceptableInputs.delete(name)
            return
        }

        return this.acceptableInputs.has(name)
    }

    /**
     * @param {AcceptbleInputTypes[]} inputs 
     */
    enableInputs(inputs: string[]) {
        inputs.forEach(type => this.acceptableInputs.add(type))
    }

    /**
     * @param {AcceptbleInputTypes[]} inputs 
     */
    disableInputs(inputs: string[]) {
        inputs.forEach(type => this.acceptableInputs.delete(type))
    }

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