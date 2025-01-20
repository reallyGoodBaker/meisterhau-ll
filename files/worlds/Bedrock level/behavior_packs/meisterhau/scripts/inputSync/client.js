import { ButtonState, InputButton, InputInfo, world } from '@minecraft/server'
import { http, HttpRequest } from '@minecraft/server-net'

export class SyncPacket {

    /**
     * @param {InputInfo} inputInfo 
     */
    static sendPackFromInputInfo(name, inputInfo) {
        const jump = inputInfo.getButtonState(InputButton.Jump) === ButtonState.Pressed
        const sneak = inputInfo.getButtonState(InputButton.Sneak) === ButtonState.Pressed
        const { x, y } = inputInfo.getMovementVector()

        const req = new HttpRequest(`http://localhost:19999/sync/${name}`)
        req.setMethod('Post')
            .setBody(JSON.stringify([ jump, sneak, x, y ]))

        http.request(req).catch(err => world.sendMessage(err + ''))
    }
}