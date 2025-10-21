import { BaseComponent } from '../core/component'

/** 相机组件 - 控制相机位置和旋转 */
export class CameraComponent extends BaseComponent {
    /** 默认相机偏移 [x, y, z] */
    static defaultOffset: [ number, number, number ] = [ 2.5, 0, 1 ]
    /** 默认相机旋转 [yaw, pitch] */
    static defaultRot: [ number, number ] = [ 0, 0 ]
    /** 默认相机状态 [x, y, z, yaw, pitch] */
    static defaultStatus: number[] = this.defaultOffset.concat(this.defaultRot)
    /** 当前相机偏移 */
    readonly offset: [ number, number, number ] = CameraComponent.defaultOffset.slice() as [ number, number, number ]
    /** 当前相机旋转 */
    readonly rot: [ number, number ] = [ 0, 0 ]
}
