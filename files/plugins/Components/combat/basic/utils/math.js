/**
 * @param {number} start 
 * @param {number} end 
 * @param {() => number} calcFn 
 * @returns 
 */
function constrictCalc(start, end, calcFn) {
    let result = 0

    try {
        result = calcFn.call(null)
        if (isNaN(result)) throw ''
    } catch {
        return start
    }

    return result > end ? end
            : result < start ? start
                : result
}

exports.constrictCalc = constrictCalc

function randomRange(min=0, max=1, integer=false) {
    const num = Math.random() * (max - min) + min

    return integer ? Math.round(num) : num
}

exports.randomRange = randomRange

/**
 * @param {number[]} from 
 * @param {number[]} to 
 * @param {number} progress 
 */
exports.lerpn = (from, to, progress) => {
    if (from.length !== to.length) {
        return from
    }

    const len = from.length
    const res = new Array(len).fill(0)
    const p = Math.min(Math.max(0, progress), 1)

    for (let i = 0; i < len; i++) {
        res[i] = from[i] + (to[i] - from[i]) * p
    }

    return res
}

exports.alerpn = (from, to, progress) => {
    if (from.length !== to.length) {
        return from
    }

    const len = from.length
    const res = new Array(from.length).fill(0)
    const p = Math.min(Math.max(0, progress), 1)

    for (let i = 0; i < len; i++) {
        const d = (to[i] - from[i]) % 360
        res[i] = from[i] + d * p
    }

    return res
}