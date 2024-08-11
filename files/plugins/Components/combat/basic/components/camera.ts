import { BaseComponent } from '../core/component'

export class CameraComponent extends BaseComponent {
    /**
     * [ x, y, z ]
     */
    static defaultOffset: [ number, number, number ] = [ 2.2, 0, 0.8 ]
    /**
     * [ yaw, pitch ]
     */
    static defaultRot: [ number, number ] = [ 0, 0 ]
    /**
     * [ x, y, z, yaw, pitch ]
     */
    static defaultStatus: number[] = this.defaultOffset.concat(this.defaultRot)
    readonly offset: [ number, number, number ] = CameraComponent.defaultOffset.slice() as [ number, number, number ]
    readonly rot: [ number, number ] = [ 0, 0 ]
}