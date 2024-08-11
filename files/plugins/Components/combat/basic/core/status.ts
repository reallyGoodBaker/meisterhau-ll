/// <reference path="../types.d.ts"/>
import console from '../../../console/main'
import { CameraComponent } from '../components/camera'
import { Tick } from '../components/tick'
import { AcceptbleInputTypes } from '../types'
import { ComponentManager } from './component'

export const defaultAcceptableInputs = [
    'onJump', 'onSneak', 'onAttack', 'onUseItem',
    'onChangeSprinting', 'onFeint'
]

export class Status {
    static status = new Map<string, Status>()
    static get(xuid: string) {
        return this.status.get(xuid) ?? new Status(xuid)
    }

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
    #preInputTimer: number | null = null
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

    constructor(xuid: string) {
        Status.status.set(xuid, this)
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
        this.componentManager.clear()
        defaultAcceptableInputs.forEach(type => this.acceptableInputs.add(type))

        this.componentManager.attachComponent(
            new Tick(),
            new CameraComponent(),
        )
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