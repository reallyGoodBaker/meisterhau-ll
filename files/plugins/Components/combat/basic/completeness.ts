/** 检查技巧模块的完整性 */
export function checkCompleteness(mod: TrickModule) {
    if (!mod.sid || !mod.bind || !mod.entry || !mod.moves) {
        return '缺少必要的属性: sid | bind | entry | moves'
    }

    if (!mod.moves.hasMove(mod.entry)) {
        return `无效的 entry: '${mod.entry}'`
    }

    return false
}
