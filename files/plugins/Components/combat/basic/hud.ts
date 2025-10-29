/** 创建HUD进度条 */
export function hud(progress: number, size: number, style=['', '§6▮', '§4▯', '']) {
    const duration = Math.ceil(size * progress)
    const [ left, bar, empty, right ] = style

    return left +
        bar.repeat(duration) +
        empty.repeat(size - duration) + right
}
