import { Status } from "@combat/basic/core/status"
import { cmd } from "@utils/command"
import { HurtDisplay } from "./hurtDisplay"

export function registerHudCommands() {
    cmd('display', '切换 HUD 显示状态').setup(register => {
        register('hurt [enabled:bool]', (cmd, ori, out, res) => {
            const { enabled } = res as { enabled: boolean }
            const id = ori.player?.uniqueId ?? ori.entity?.uniqueId!
            if (enabled) {
                Status.getOrCreate(id).componentManager.attachComponent(new HurtDisplay())
            } else {
                Status.getOrCreate(id).componentManager.detachComponent(HurtDisplay)
            }
        })
    })
}