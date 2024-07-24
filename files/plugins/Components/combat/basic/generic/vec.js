const HALF_PI = Math.PI / 2

function vec2(x1, y1, x2, y2) {
    const dx = x2 - x1,
        dy = y2 - y1
    return {
        dx, dy,
        m: Math.sqrt(dx * dx + dy * dy)
    }
}

function getAngleFromVector2(v1, v2) {
    const dotProduct = v1.dx * v2.dx + v1.dy * v2.dy
    const angle = dotProduct / (v1.m * v2.m)

    return Math.acos(angle)
}

function rotate2(v, rad) {
    const { dx, dy, m } = v
    const x = dx * Math.cos(rad) - dy * Math.sin(rad)
    const y = dx * Math.sin(rad) + dy * Math.cos(rad)
    return {
        dx: x, dy: y, m
    }
}

function multiply2(v, factor) {
    const { dx, dy } = v
    return vec2(0, 0, dx*factor, dy*factor)
}

function minus(a, b) {
    return vec2(
        0, 0,
        a.dx - b.dx,
        a.dy - b.dy
    )
}

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