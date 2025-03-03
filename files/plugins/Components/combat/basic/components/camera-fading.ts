import { BaseComponent, Component, ComponentManager } from '../core/component'
import { Fields, PublicComponent } from '../core/config'
import { Status } from '../core/status'
import { alerpn, lerpn } from '@utils/math'
import { CameraComponent } from './camera'
import { Tick } from './tick'
import { interruptIf } from '@utils/defined'

interface TransInfo {
    curve?: 'linear'
    from?: number[]
    to: number[]
    duration: number
}

type TransParams = [
    string, number[], number[], number
]

@PublicComponent('camera-fading')
@Fields([ 'config' ])
export class CameraFading extends BaseComponent {

    private tickOffset = 0
    private finished = false
    readonly last: TransParams

    constructor(
        private config: TransInfo[] = [],
    ) {
        super()
        const lastTo = config[config.length - 1].to

        this.config = config
        this.last = [ 'linear', lastTo, lastTo, 1 ]
    }

    static create({ config }: { config: TransInfo[] }): Component {
        return new CameraFading(config)
    }

    dt() {
        return Tick.tick - this.tickOffset!
    }

    onAttach(): boolean | void | Promise<boolean | void> {
        this.tickOffset = Tick.tick
    }

    copy(from: number[], to: number[]) {
        const len = Math.min(from.length, to.length)

        for (let i = 0; i < len; i++) {
            to[i] = from[i]
        }
    }

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

    offsetLinear(from: number[], to: number[], progress: number, target: number[], rotation: number[]) {
        const offset = lerpn(from.slice(0, 3), to.slice(0, 3), progress)
        const rot = alerpn(from.slice(3, 5), to.slice(3, 5), progress)

        this.copy(offset, target)
        this.copy(rot, rotation)
    }

    static fadeFromAttackDirection(abuser: Player | Entity, damageOpt: DamageOption) {
        const { direction } = damageOpt
        let to = null

        switch (direction) {
            case 'right':
                to = [ ...CameraComponent.defaultOffset, -15, 0 ]
                break

            case 'left':
                to = [ ...CameraComponent.defaultOffset, 15, 0 ]
                break
            
            case 'vertical':
                to = [ ...CameraComponent.defaultOffset, 0, -30 ]
                break
        
            default:
                to = [ 1.5, 0, 0.5, 0, 0 ]
                break
        }

        const manager = Status.get((abuser as Player).uniqueId).componentManager
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