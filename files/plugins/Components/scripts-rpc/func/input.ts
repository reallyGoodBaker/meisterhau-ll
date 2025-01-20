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
import { getAngleFromVector2 } from "@combat/basic/generic/vec"

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

    export function moveDir(pl: Player) {
        const yaw = pl.direction.yaw
        const vx = Math.cos(yaw)
        const vy = Math.sin(yaw)
        const vdir = { x: vx, y: vy }
        const result = getAngleFromVector2(vdir, movementVector(pl))

        console.log(result)
    }
}