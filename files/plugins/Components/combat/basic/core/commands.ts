import { cmd } from "../../../command"
import { getComponentId, getComponentCtor, getFieldEntries } from "./config"
import { Status } from "./status"

export function registerCommand() {
    cmd('components', '管理组件', 1).setup(registry => {
        registry.register('add <pl:player> <name:string> [args:json]', (_, __, output, args) => {
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
                    Status.get(target.xuid).componentManager.attachComponent(component)
                }
    
                output.success(`已为 ${targets.length} 个玩家添加组件 '${args.name}'`)
            } catch (_) {
                output.error('无效的组件参数')
            }
        })
        .register('remove <pl:player> <name:string>', (_, __, output, args) => {
            const targets = args.pl
            const componentCtor = getComponentCtor(args.name)

            if (!componentCtor || !componentCtor.create) {
                return output.error('无效的组件名')
            }

            for (const terget of targets) {
                Status.get(terget.xuid).componentManager.detachComponent(componentCtor)
            }

            output.success(`已为 ${targets.length} 个玩家移除组件 '${args.name}'`)
        })
        .register('list <pl:player> [detail:bool]', async (_, ori, output, args) => {
            const pl = args.pl
            const useDetail = args.detail ?? false
            
            for (const p of pl) {
                const status = Status.get(p.xuid)

                if (!status) {
                    return
                }

                const componentManager = status.componentManager
                const componentNames = Array.from(componentManager.getComponentNames())
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
                    return
                }

                output.success(`玩家 ${p.name} 拥有组件:\n${componentNames.join('\n')}`)
            }
        })
        .register('check <pl:player> <name:string>', (_, __, output, args) => {
            const componentCtor = getComponentCtor(args.name)

            if (!componentCtor || !componentCtor.create) {
                return output.error('无效的组件名')
            }

            for (const pl of args.pl) {
                const status = Status.get(pl.xuid)
                if (!status) {
                    continue
                }

                const component = status.componentManager.getComponent(componentCtor)
                if (!component) {
                    output.success(`玩家 '${pl.name}' 没有此组件`)
                    continue
                }

                const checkableEntries = getFieldEntries(component)
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
        .submit()
    })
}