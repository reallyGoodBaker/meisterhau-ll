export function calcInRect(target: DOMRect, restrict: DOMRect) {
    let x = target.x
    let y = target.y

    if (target.bottom > restrict.bottom) {
        if (target.height > restrict.height) {
            y = 0
        } else {
            y = restrict.bottom - target.height
        }
    }

    if (target.right > restrict.right) {
        if (target.width > restrict.width) {
            x = 0
        } else {
            x = restrict.right - target.width
        }
    }

    return { x, y }
}

export function offsetRect(rect: DOMRect, x: number, y: number): DOMRect {
    return DOMRect.fromRect({
        x, y,
        width: rect.width,
        height: rect.height,
    })
}