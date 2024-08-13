import { BaseComponent, Component, ComponentManager } from '../core/component'
import { Fields, PublicComponent } from '../core/config'
import { Status } from '../core/status'
import { alerpn, lerpn } from '@utils/math'
import { CameraComponent } from './camera'
import { Tick } from './tick'
import { Optional } from '@utils/optional'

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
    tick?: Optional<Tick>
    tickOffset?: number
    readonly last: TransParams

    shouldExit = false

    constructor(
        private config: TransInfo[] = [],
        private exitOnEnd = false
    ) {
        super()
        const lastTo = config[config.length - 1].to

        this.config = config
        this.last = [ 'linear', lastTo, lastTo, 1 ]
    }

    static create({ config, exitOnEnd = false }: { config: TransInfo[], exitOnEnd: boolean }): Component {
        return new CameraFading(config, exitOnEnd)
    }

    dt() {
        return this.tick?.unwrap().dt! - this.tickOffset!
    }

    onAttach(manager: ComponentManager): boolean | void | Promise<boolean | void> {
        if (!(this.tick = manager.getComponent(Tick))) {
            return true
        }

        this.tickOffset = this.tick.unwrap().dt
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

        switch (curve) {
            case 'linear':
                return this.offsetLinear(from, to, progress, offset, rot)
        }

        if (this.shouldExit) {
            manager.detachComponent(CameraFading)
            return
        }

        if (this.exitOnEnd && info === this.last) {
            this.shouldExit = true
        }
    }

    offsetLinear(from: number[], to: number[], progress: number, target: number[], rotation: number[]) {
        const offset = lerpn(from.slice(0, 3), to.slice(0, 3), progress)
        const rot = alerpn(from.slice(3, 5), to.slice(3, 5), progress)

        this.copy(offset, target)
        this.copy(rot, rotation)
    }

    static fadeFromAttackDirection(abuser: any, damageOpt: DamageOption) {
        const { direction } = damageOpt
        let to = null

        switch (direction) {
            case 'left':
                to = [ 2.2, 0, 0.9, -15, 0 ]
                break

            case 'right':
                to = [ 2.2, 0, 0.5, 15, 0 ]
                break
            
            case 'vertical':
                to = [ 2.2, 0.4, 0.7, 15, 0 ]
                break
        
            default:
                to = [ 1.5, 0, 0.7, 0, 0 ]
                break
        }

        Status.get(abuser.xuid).componentManager.attachComponent(new CameraFading([
            {
                from: CameraComponent.defaultStatus,
                to,
                duration: 1
            },
            {
                to: CameraComponent.defaultStatus,
                duration: 1
            }
        ], true))
    }
}