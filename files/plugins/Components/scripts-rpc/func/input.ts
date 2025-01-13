import { remote } from "../setup"
import { EventEmitter } from '../../events'

export enum ButtonState {
    Pressed = 'Pressed',
    Released = 'Released',
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

    remote.expose('input.states.buttons', (states: { [key: string]: { jump: ButtonState, sneak: ButtonState } }) => {
        // console.log(states)
    })

    return em
}