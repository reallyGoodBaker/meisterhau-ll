export function constrictCalc(start: number, end: number, calcFn: () => number) {
    try {
        return minmax(start, end, calcFn.call(null))
    } catch {
        return start
    }
}

export function minmax(min: number, max: number, val: number) {
    if (isNaN(val)) {
        return min
    }

    return Math.max(min, Math.min(max, val))
}

export function randomRange(min=0, max=1, integer=false) {
    const num = Math.random() * (max - min) + min

    return integer ? Math.round(num) : num
}

export const lerpn = (from: number[], to: number[], progress: number) => {
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

export const alerpn = (from: number[], to: number[], progress: number) => {
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

export interface Vector {
    x: number
    y: number
    z: number
}

export interface Rotation {
    yaw: number
    pitch: number
}

const PiDiv180 = Math.PI / 180.0

export function yawToVec2(yaw: number) {
    const rad = yaw * PiDiv180
    return {
        x: Math.cos(rad),
        y: Math.sin(rad)
    }
}