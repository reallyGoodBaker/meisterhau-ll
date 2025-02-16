import { remote } from "../setup"
import { EventEmitter } from '../../events'

export enum ButtonState {
    Pressed = 'Pressed',
    Released = 'Released',
}

export interface InputInfo {
    jump: boolean
    sneak: boolean
    x: number
    y: number
}

export function eventCenter(opt: any) {
    const em = new EventEmitter(opt)

    remote.expose('input.press.jump', (name: string) => {
        const player = mc.getPlayer(name)
        if (player) {
            em.emit('input.jump', mc.getPlayer(name), true)   
        }
    })

    remote.expose('input.release.jump', (name: string) => {
        const player = mc.getPlayer(name)
        if (player) {
            em.emit('input.jump', mc.getPlayer(name), false)
        }
    })

    remote.expose('input.press.sneak', (name: string) => {
        const player = mc.getPlayer(name)
        if (player) {
            em.emit('input.sneak', mc.getPlayer(name), true)
        }
    })

    remote.expose('input.release.sneak', (name: string) => {
        const player = mc.getPlayer(name)
        if (player) {
            em.emit('input.sneak', mc.getPlayer(name), false)
        }
    })

    return em
}

import { inputStates } from '../server'

export namespace input {
    export function isPressing(pl: Player, button: 'jump' | 'sneak') {
        return inputStates.get(pl.name)?.[button] ?? false
    }

    export function movementVector(pl: Player) {
        const inputInfo = inputStates.get(pl.name)
        if (!inputInfo) {
            return { x: 0, y: 0 }
        }

        return { x: inputInfo.x, y: inputInfo.y }
    }

    export enum Direction {
        Forward = 1,
        Backward = 2,
        Left = 4,
        Right = 8,
    }

    export function moveDir(pl: Player) {
        let result = 0
        const { x, y } = movementVector(pl)

        if (x < 0) {
            result |= Direction.Left
        }

        if (x > 0) {
            result |= Direction.Right
        }

        if (y < 0) {
            result |= Direction.Backward
        }

        if (y > 0) {
            result |= Direction.Forward
        }

        return result
    }

    export enum Orientation {
        None = 0,
        Forward = 1,
        Backward = 3,
        Left = 4,
        Right = 2,
    }

    export function approximateOrientation(pl: Player) {
        const { x, y } = movementVector(pl)
        if (x === y && x === 0) {
            return 0
        }

        const preferHorizontal = Math.abs(x) > Math.abs(y)

        if (preferHorizontal) {
            return x < 0 ? Orientation.Right : Orientation.Left
        }

        return y > 0 ? Orientation.Forward : Orientation.Backward
    }
}