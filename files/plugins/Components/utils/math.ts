/** 限制计算函数结果在指定范围内 */
export function constrictCalc(start: number, end: number, calcFn: () => number) {
    try {
        return minmax(start, end, calcFn.call(null))
    } catch {
        return start
    }
}

/** 将数值限制在最小值和最大值之间 */
export function minmax(min: number, max: number, val: number) {
    if (isNaN(val)) {
        return min
    }

    return Math.max(min, Math.min(max, val))
}

/** 生成指定范围内的随机数 */
export function randomRange(min=0, max=1, integer=false) {
    const num = Math.random() * (max - min) + min

    return integer ? Math.round(num) : num
}

/** 数值数组线性插值 */
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

/** 角度数组线性插值（处理360度循环） */
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

/** 三维向量接口 */
export interface Vector {
    x: number
    y: number
    z: number
}

/** 向量工具类 */
export class VectorHelper {
    /** 创建零向量 */
    static zero(): Vector {
        return { x: 0, y: 0, z: 0 }
    }
}

/** 旋转角度接口 */
export interface Rotation {
    yaw: number
    pitch: number
}

const PiDiv180 = Math.PI / 180.0

/** 将偏航角转换为二维向量 */
export function yawToVec2(yaw: number) {
    const rad = yaw * PiDiv180
    return {
        x: Math.cos(rad),
        y: Math.sin(rad)
    }
}
