import { ButtonState, InputButton, InputInfo } from '@minecraft/server'
import { http, HttpRequest, HttpRequestMethod } from '@minecraft/server-net'

export class SyncPacket {

    /**
     * @param {InputInfo} inputInfo 
     */
    static sendPackFromInputInfo(name, inputInfo) {
        const jump = inputInfo.getButtonState(InputButton.Jump) === ButtonState.Pressed
        const sneak = inputInfo.getButtonState(InputButton.Sneak) === ButtonState.Pressed
        const { x, y } = inputInfo.getMovementVector()
        const buffer = new ArrayBuffer(18)
        const view = new DataView(buffer)
        view.setUint8(0, jump ? 1 : 0)
        view.setUint8(1, sneak ? 1 : 0)
        view.setFloat64(2, x, true)
        view.setFloat64(10, y, true)

        const body = new Uint8Array(buffer).map(byte => String.fromCharCode(byte)).join('')
        const req = new HttpRequest(`http://localhost:19999/sync/${name}`)
        req.setMethod(HttpRequestMethod.POST)
            .setBody(body)

        http.request(req)
    }
}