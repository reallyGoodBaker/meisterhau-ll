import { BaseComponent } from '../core/component'

export class CameraComponent extends BaseComponent {
    static defaultOffset: [ number, number, number ] = [ 2.2, 0, 0.7 ]
    readonly offset: [ number, number, number ] = [ ...CameraComponent.defaultOffset ]
}