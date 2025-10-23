import { BaseComponent, Component, ComponentManager } from '../core/component'
import { Fields, PublicComponent } from '../core/config'
import { Status } from '../core/status'
import { alerpn, lerpn } from '@utils/math'
import { CameraComponent } from './camera'
import { Tick } from './tick'
import { interruptIf } from '@utils/defined'

/** 过渡信息接口 */
interface TransInfo {
    /** 过渡曲线类型 */
    curve?: 'linear'
    /** 起始状态 [x, y, z, yaw, pitch] */
    from?: number[]
    /** 目标状态 [x, y, z, yaw, pitch] */
    to: number[]
    /** 过渡持续时间（tick数） */
    duration: number
}

/** 过渡参数类型 */
type TransParams = [
    string, number[], number[], number
]

/** 相机淡入淡出组件 - 处理相机过渡效果 */
@PublicComponent('camera-fading')
@Fields([ 'config' ])
export class CameraFading extends BaseComponent {

    /** 开始tick数 */
    private tickOffset = 0
    /** 是否已完成过渡 */
    private finished = false
    /** 最终过渡参数 */
    readonly last: TransParams

    /**
     * 构造函数
     * @param config 过渡配置数组
     */
    constructor(
        private config: TransInfo[] = [],
    ) {
        super()
        const lastTo = config[config.length - 1].to

        this.allowTick = true
        this.config = config
        this.last = [ 'linear', lastTo, lastTo, 1 ]
    }

    /** 创建相机淡入淡出组件 */
    static create({ config }: { config: TransInfo[] }): Component {
        return new CameraFading(config)
    }

    /** 获取从开始到现在的tick数 */
    dt() {
        return Tick.tick - this.tickOffset!
    }

    /** 组件附加时记录开始时间 */
    onAttach(): boolean | void | Promise<boolean | void> {
        this.tickOffset = Tick.tick
    }

    /** 复制数组内容 */
    copy(from: number[], to: number[]) {
        const len = Math.min(from.length, to.length)

        for (let i = 0; i < len; i++) {
            to[i] = from[i]
        }
    }

    /** 获取当前过渡信息 */
    getTransInfo(): TransParams {
        const len = this.config.length
        let remain = this.dt()
        for (let i = 0; i < len; i++) {
            const { duration, curve, from, to } = this.config[i]

            if (remain >= duration) {
                remain -= duration
                continue
            }

            if (remain < duration) {
                return [
                    curve ?? 'linear',
                    from ?? this.config[i - 1].to,
                    to,
                    remain / duration,
                ]
            }
        }

        return this.last
    }

    /** 每tick更新相机过渡效果 */
    onTick(manager: ComponentManager): void {
        const { offset, rot } = manager.getComponent(CameraComponent).unwrap()
        const info = this.getTransInfo()
        const [ curve, from, to, progress ] = info

        interruptIf(this.finished)
        switch (curve) {
            case 'linear':
                this.offsetLinear(from, to, progress, offset, rot)
        }

        if (this.last === info) {
            this.finished = true
        }
    }

    /** 线性偏移计算 */
    offsetLinear(from: number[], to: number[], progress: number, target: number[], rotation: number[]) {
        const offset = lerpn(from.slice(0, 3), to.slice(0, 3), progress)
        const rot = alerpn(from.slice(3, 5), to.slice(3, 5), progress)

        this.copy(offset, target)
        this.copy(rot, rotation)
    }

    /** 根据攻击方向创建淡入淡出效果 */
    static fadeFromAttackDirection(abuser: Player | Entity, damageOpt: DamageOption) {
        const { direction } = damageOpt
        let to = null

        // 根据攻击方向设置不同的相机偏移
        switch (direction) {
            case 'right':
                to = [ ...CameraComponent.defaultOffset, -15, 0 ]
                break

            case 'left':
                to = [ ...CameraComponent.defaultOffset, 15, 0 ]
                break

            case 'vertical':
                to = [ ...CameraComponent.defaultOffset, 0, -5 ]
                break

            default:
                to = [ 1.5, 0, 0.5, 0, 0 ]
                break
        }

        const manager = Status.getOrCreate((abuser as Player).uniqueId).componentManager
        manager.beforeTick(() => {
            manager.attachComponent(new CameraFading([
                {
                    from: CameraComponent.defaultStatus,
                    to,
                    duration: 1
                },
                {
                    to: CameraComponent.defaultStatus,
                    duration: 1
                }
            ]))
        })
    }
}
