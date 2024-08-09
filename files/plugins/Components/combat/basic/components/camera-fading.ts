import { BaseComponent } from '../core/component'
import { lerpn } from '../utils/math'
import { CameraComponent } from './camera'
import { Tick } from './tick'

interface TransInfo {
    curve?: 'linear'
    from?: number[]
    to: number[]
    duration: number
}

type TransParams = [
    string, number[], number[], number
]

export class CameraFading extends BaseComponent {
    tick?: Tick
    tickOffset?: number
    readonly last: TransParams

    constructor(
        private config: TransInfo[] = [],
        private exitOnEnd = false
    ) {
        super()
        const lastTo = config[config.length - 1].to

        this.config = config
        this.last = [ 'linear', lastTo, lastTo, 1 ]
    }

    dt() {
        return this.tick!.dt - this.tickOffset!
    }

    onAttach() {
        if (!(this.tick = this.getManager().getComponent(Tick))) {
            return true
        }

        this.tickOffset = this.tick.dt
    }

    copyOffset(from: number[], to: number[]) {
        to[0] = from[0]
        to[1] = from[1]
        to[2] = from[2]
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

    onTick() {
        const { offset } = this.getManager().getComponent(CameraComponent)!
        const info = this.getTransInfo()
        const [ curve, from, to, progress ] = info

        switch (curve) {
            case 'linear':
                return this.offsetLinear(from, to, progress, offset)
        }

        if (this.exitOnEnd && info === this.last) {
            this.getManager().detachComponent(CameraFading)
        }
    }

    /**
     * @param {[number, number, number]} origin 
     */
    offsetLinear(from: number[], to: number[], progress: number, target: number[]) {
        const offset = lerpn(from, to, progress)

        this.copyOffset(offset, target)
    }
}