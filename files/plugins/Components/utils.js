function sameArr(arr1, arr2) {
    if (arr1.length !== arr2.length) {
        return false
    }

    return new Set(arr1.concat(arr2)).size === arr1.length 
}

function vec3ToDirection(vec) {
    const { x, y, z } = vec
    let rad = Math.atan(x / z) / Math.PI * 180
    let radius = Math.sqrt(x**2 + z**2)
    return {
        pitch: x !== 0 ? z < 0 ? rad + 180 : rad
            : z > 0 ? 0 : z < 0 ? 180
                : direction.pitch,
        yaw: -Math.atan(y / radius) / Math.PI * 180
    }
}