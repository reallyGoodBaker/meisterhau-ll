import collection from '../collection'
import { checkCompleteness } from './completeness'
import { listenAllMcEvents } from './core/core'

export default async function loadAll() {
    //@ts-ignore
    const mods = Array.from(collection).map(({ tricks }) => tricks)
    const result: [number, number] = [ 0, 0 ]

    listenAllMcEvents(mods as TrickModule[])
    mods.forEach(mod => loadModule((mod as any), result))
    console.log(`加载了 ${mods.length} 个模块，成功 ${result[1]} 个，失败 ${result[0]}`)
}

function loadModule(mod: TrickModule, flags: [number, number]) {
    let errMessage
    if (errMessage = checkCompleteness(mod)) {
        console.error(`${("'" + mod.sid + "'") || '一个'} 模块加载失败${errMessage ? ': ' + errMessage : ''}`)
        flags[0]++
        return false
    }

    flags[1]++
}
