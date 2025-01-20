import { ButtonState, InputButton, world } from "@minecraft/server"
import { remote } from "../llrpc"
import { SyncPacket } from "../inputSync/client"

const inputStates = new Map()

export function syncInputButtons() {
    world.getAllPlayers().forEach(cur => {
        const { inputInfo, name } = cur
        const prevState = inputStates.get(name)
        const currentState = {
            jump: inputInfo.getButtonState(InputButton.Jump),
            sneak: inputInfo.getButtonState(InputButton.Sneak),
            vec: inputInfo.getMovementVector()
        }

        if (prevState) {
            if (prevState.jump !== currentState.jump) {
                if (currentState.jump === ButtonState.Pressed) {
                    remote.call('input.press.jump', name)
                } else {
                    remote.call('input.release.jump', name)
                }
            }

            if (prevState.sneak !== currentState.sneak) {
                if (currentState.sneak === ButtonState.Pressed) {
                    remote.call('input.press.sneak', name)
                } else {
                    remote.call('input.release.sneak', name)
                }
            }
        }

        inputStates.set(name, currentState)
        SyncPacket.sendPackFromInputInfo(name, inputInfo)
    })
}