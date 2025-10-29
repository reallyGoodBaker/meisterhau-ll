const HALF_PI = Math.PI / 2

/**
 * 创建二维向量
 * @param {number} x1 起点x坐标
 * @param {number} y1 起点y坐标
 * @param {number} x2 终点x坐标
 * @param {number} y2 终点y坐标
 * @returns {{dx: number, dy: number, m: number}} 向量对象
 */
function vec2(x1, y1, x2, y2) {
    const dx = x2 - x1,
        dy = y2 - y1
    return {
        dx, dy,
        m: Math.sqrt(dx * dx + dy * dy)
    }
}

/**
 * 计算两个向量之间的夹角
 * @param {{dx: number, dy: number, m: number}} v1 第一个向量
 * @param {{dx: number, dy: number, m: number}} v2 第二个向量
 * @returns {number} 夹角（弧度）
 */
function getAngleFromVector2(v1, v2) {
    const dotProduct = v1.dx * v2.dx + v1.dy * v2.dy
    const angle = dotProduct / (v1.m * v2.m)

    return Math.acos(angle)
}

/**
 * 旋转二维向量
 * @param {{dx: number, dy: number, m: number}} v 原始向量
 * @param {number} rad 旋转角度（弧度）
 * @returns {{dx: number, dy: number, m: number}} 旋转后的向量
 */
function rotate2(v, rad) {
    const { dx, dy, m } = v
    const x = dx * Math.cos(rad) - dy * Math.sin(rad)
    const y = dx * Math.sin(rad) + dy * Math.cos(rad)
    return {
        dx: x, dy: y, m
    }
}

/**
 * 缩放二维向量
 * @param {{dx: number, dy: number, m: number}} v 原始向量
 * @param {number} factor 缩放因子
 * @returns {{dx: number, dy: number, m: number}} 缩放后的向量
 */
function multiply2(v, factor) {
    const { dx, dy } = v
    return vec2(0, 0, dx*factor, dy*factor)
}

/**
 * 向量减法
 * @param {{dx: number, dy: number, m: number}} a 被减向量
 * @param {{dx: number, dy: number, m: number}} b 减向量
 * @returns {{dx: number, dy: number, m: number}} 差向量
 */
function minus(a, b) {
    return vec2(
        0, 0,
        a.dx - b.dx,
        a.dy - b.dy
    )
}

/**
 * 将向量转换为角度
 * @param {{dx: number, dy: number, m: number}} v 向量
 * @returns {number} 角度（弧度）
 */
function vec2ToAngle(v) {
    let angle = getAngleFromVector2(v, vec2(0, 0, 0, -1))

    if (v.dx < 0) {
        angle = -angle
    }

    return angle
}

module.exports = {
    vec2, getAngleFromVector2, rotate2, multiply2, minus,
    vec2ToAngle,
}
