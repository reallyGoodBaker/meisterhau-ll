import { cmd, CommandPermission } from '@utils/command'
import './entities'
import { transition } from '../core'
import { ai } from './core'
import { Status } from '../status'
import { inputSimulator } from '../inputSimulator'

export function setupAiCommands() {
    cmd('ai', '控制ai行为', CommandPermission.OP)
        .setup(register => {
            register('<en:entity> transition <event_name:string>', (_, ori, out, args) => {
                const { en, event_name } = args as { en: Entity[], event_name: string }
                for (const e of en) {
                    const registration = ai.getRegistration(e.type)
                    if (!registration)
                        continue

                    transition(e, registration[1], Status.get(e.uniqueId), event_name, Function.prototype as any, [ e ])
                }
            })

            register('<en:entity> perform attack', (_, ori, out, args) => {
                const { en } = args as { en: Entity[] }
                for (const e of en) {
                    inputSimulator.attack(e)
                }
            })

            register('<en:entity> perform useItem', (_, ori, out, args) => {
                const { en } = args as { en: Entity[] }
                for (const e of en) {
                    inputSimulator.useItem(e)
                }
            })

            register('<en:entity> perform sneak', (_, ori, out, args) => {
                const { en } = args as { en: Entity[] }
                for (const e of en) {
                    inputSimulator.sneak(e)
                }
            })

            register('<en:entity> perform release_sneak', (_, ori, out, args) => {
                const { en } = args as { en: Entity[] }
                for (const e of en) {
                    inputSimulator.releaseSneak(e)
                }
            })

            register('<en:entity> perform dodge', (_, ori, out, args) => {
                const { en } = args as { en: Entity[] }
                for (const e of en) {
                    inputSimulator.dodge(e)
                }
            })

            register('<en:entity> strategy <name:string>', async (_, ori, out, args) => {
                const { en, name } = args as { en: Entity[], name: string }
                for (const e of en) {
                    const entityAI = ai.getAI(e)
                    if (!entityAI) {
                        continue
                    }

                    entityAI.restart(name)
                }
            })

            register('<en:entity> info', (_, ori, out, args) => {
                const { en } = args as { en: Entity[] }
                for (const e of en) {
                    const entityAI = ai.getAI(e)
                    if (!entityAI) {
                        continue
                    }

                    out.success(`${entityAI.actor.name}\nUID: ${entityAI.actor.uniqueId}\n策略: ${entityAI.strategy}`)
                }
            })
        })
}
