import { cmd, CommandPermission } from "@utils/command"
import { getComponentId, getComponentCtor, getFieldEntries } from './config';
import { Status } from "./status"

export function registerCommand() {
    cmd('components', '管理组件', 1).setup(register => {
        register('add <pl:player> <name:string> [args:json]', (_, __, output, args) => {
            const targets = args.pl
            const jsonArgs = args.args
            const componentCtor = getComponentCtor(args.name)

            if (!componentCtor || !('create' in componentCtor)) {
                return output.error('无效的组件名')
            }

            try {
                const _args = jsonArgs ? JSON.parse(jsonArgs) : undefined
                const component = componentCtor.create(_args)

                for (const target of targets) {
                    Status.get(target.uniqueId).componentManager.attachComponent(component)
                }
    
                output.success(`已为 ${targets.length} 个玩家添加组件 '${args.name}'`)
            } catch (_) {
                output.error('无效的组件参数')
            }
        })
        register('remove <pl:player> <name:string>', (_, __, output, args) => {
            const targets = args.pl
            const componentCtor = getComponentCtor(args.name)

            if (!componentCtor || !componentCtor.create) {
                return output.error('无效的组件名')
            }

            for (const terget of targets) {
                Status.get(terget.uniqueId).componentManager.detachComponent(componentCtor)
            }

            output.success(`已为 ${targets.length} 个玩家移除组件 '${args.name}'`)
        })
        register('list <pl:player> [detail:bool]', async (_, ori, output, args) => {
            const pl = args.pl
            const useDetail = args.detail ?? false
            
            for (const p of pl) {
                const status = Status.get(p.uniqueId)

                if (!status) {
                    continue
                }

                const componentManager = status.componentManager
                const componentNames = Array.from(componentManager.getComponentKeys())
                    .map(ctor => {
                        const id = getComponentId(ctor)
                        if (useDetail) {
                            return id ? `${ctor.name} (${id})` : ctor.name
                        }

                        return id
                    })
                    .filter(id => id)

                if (componentNames.length === 0) {
                    output.success('玩家没有组件')
                    continue
                }

                output.success(`玩家 ${p.name} 拥有组件:\n${componentNames.join('\n')}`)
            }
        })
        register('check <pl:player> <name:string>', (_, __, output, args) => {
            const componentCtor = getComponentCtor(args.name)

            if (!componentCtor) {
                return output.error('无效的组件名')
            }

            for (const pl of args.pl) {
                const status = Status.get(pl.uniqueId)
                if (!status) {
                    continue
                }

                const component = status.componentManager.getComponent(componentCtor)
                if (component.isEmpty()) {
                    output.success(`玩家 '${pl.name}' 没有此组件`)
                    continue
                }

                const checkableEntries = getFieldEntries(component.unwrap())
                if (!checkableEntries) {
                    output.success('此组件没有检查项')
                    continue
                }

                const entries = []
                for (const [ k, v ] of checkableEntries.muts) {
                    entries.push(`  ${k} = ${JSON.stringify(v)}`)
                }

                for (const [ k, v ] of checkableEntries.lets) {
                    entries.push(`  §9${k}§r = ${JSON.stringify(v)}`)
                }

                if (entries.length === 0) {
                    output.success('此组件没有检查项')
                } else {
                    output.success(`${pl.name} 的组件 ${args.name}:\n${entries.join('\n')}`)
                }
            }
        })
        register('update <pl:player> <name:string> <args:json>', (_, __, output, args) => {
            const { pl, args: jsonArgs, name } = args
            const componentCtor = getComponentCtor(name)

            if (!componentCtor) {
                return output.error('无效的组件名')
            }

            for (const target of pl) {
                const manager = Status.get(target.uniqueId).componentManager

                manager.update(componentCtor, component => {
                    const _args = jsonArgs ? JSON.parse(jsonArgs) : undefined
                    const { muts } = getFieldEntries(component) || {}

                    if (muts) {
                        muts.forEach(([ k ]) => {
                            const newVal = _args[k]
                            if (newVal) {
                                (component as any)[k] = newVal
                            }
                        })
                    }
                })
            }
        })
    })

    cmd('tools', '实用工具', CommandPermission.Everyone)
        .setup(register => {
            register('weapons basic', (_, ori, out) => {
                const pl = ori.player as Player
                const ootachi = mc.newItem('weapon:ootachi', 1)
                const shieldSword = mc.newItem('weapon:shield_with_sword', 1)

                pl.giveItem(ootachi!)
                pl.giveItem(shieldSword!)

                out.success('已给予玩家大太刀, 盾剑')
            })
        })
}