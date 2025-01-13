import { ButtonState, InputButton, world } from "@minecraft/server"
import { remote } from "../llrpc"

const inputStates = {}

export function syncInputButtons() {
    const states = world.getAllPlayers().reduce((prev, cur) => {
        const { inputInfo, name } = cur
        const prevState = inputStates[name]
        const currentState = {
            jump: inputInfo.getButtonState(InputButton.Jump),
            sneak: inputInfo.getButtonState(InputButton.Sneak),
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

        inputStates[name] = currentState
        prev[name] = currentState

        return prev
    }, {})

    remote.call('input.states.buttons', states)
}