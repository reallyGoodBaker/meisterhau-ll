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

export const inputStates = new Map<string, InputInfo>()

function decodeSyncInput(buffer: ArrayBuffer): InputInfo {
    const view = new DataView(buffer)
    const jump = view.getUint8(0) === 1
    const sneak = view.getUint8(1) === 1
    const x = view.getFloat64(2, true)
    const y = view.getFloat64(10, true)
    return { jump, sneak, x, y }
}

export function updateInput(name: string, encodedInput: string) {
    const buffer = new ArrayBuffer(18)
    const uint8 = new Uint8Array(buffer)
    for (let i = 0; i < 18; i++) {
        uint8[i] = encodedInput.charCodeAt(i)
    }

    const input = decodeSyncInput(buffer)
    inputStates.set(name, input)
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