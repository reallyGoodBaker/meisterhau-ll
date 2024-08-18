export function checkCompleteness(mod: TrickModule) {
    if (!mod.sid || !mod.bind || !mod.entry || !mod.moves) {
        return '缺少必要的属性: sid | bind | entry | moves'
    }

    if (!Object.keys(mod.moves).includes(mod.entry)) {
        return `无效的 entry: '${mod.entry}'`
    }

    return false
}