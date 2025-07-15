import { cmd } from "@utils/command"
import { divorce, propose } from "./core"

export function setup() {
    cmd('marriage', '结婚', PermType.Any).setup(register => {
        register('marry <pl:player>', (cmd, ori, out, { pl }) => {
            const player = (pl as Player[])[0]
            if (!player) {
                return out.error('找不到玩家')
            }

            propose(ori.player?.xuid as string, player.xuid)
        })

        register('divorce <pl:player>', (cmd, ori, out, { pl }) => {
            const player = (pl as Player[])[0]
            if (!player) {
                return out.error('找不到玩家')
            }

            divorce(ori.player?.xuid as string, player.xuid)
        })
    })
}
