import { initConsole } from './console'
import { world, system } from '@minecraft/server'

const tConsole = initConsole(msg => world.getDimension('overworld').runCommand(`tellraw @a {"rawtext":[{"text":"${msg.replaceAll('"', '\\"')}"}]}`))
tConsole.setFormatting('minecraft')

system.runInterval(() => {
    // world.sendMessage('tick')
    tConsole.update()
}, 10)

export const console = tConsole.getConsole()