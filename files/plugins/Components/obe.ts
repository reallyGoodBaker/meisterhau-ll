import { cmd } from "@utils/command"
import { despawn, spawn } from "simulate-player"

const simMapping = new Map<string, SimulatedPlayer>()

export function setup() {
    cmd('obe', '灵魂出窍').setup(register => {
        register('on', (_, ori, out) => {
            const { player } = ori
            if (!player) {
                return
            }

            if (simMapping.has(player.uniqueId)) {
                return out.error('已经灵魂出窍')
            }

            const simplayer = spawn(player.blockPos, player.name + ' (sim)')
            if (!simplayer) {
                return out.error('无法灵魂出窍')
            }

            simMapping.set(player.uniqueId, simplayer)
        })
        register('off', (_, ori, out) => {
            const { player } = ori
            if (!player) {
                return
            }

            const simplayer = simMapping.get(player.uniqueId)
            if (!simplayer) {
                return out.error('无法恢复')
            }

            despawn(simplayer)
            simMapping.delete(player.uniqueId)
        })
    })
}