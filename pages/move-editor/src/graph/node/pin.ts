import { createEdge, edges, setEdges, useLine } from "../line/line"
import { EndpointTypes, getPinPosition } from "./node"

export function usePin(id: string, pin: EndpointTypes, container: HTMLElement, transform: number[], origin: number[]) {
    let source = { x: 0, y: 0 }
    let delta = { x: 0, y: 0 }
    let target = { x: 0, y: 0 }
    const [ closeLine, setAttachable ] = useLine(source, target, container)
    const offset: number[] = []

    let candidateEdge: string[] = []
    let onMouseUp = Function.prototype as any
    let isDragging = false

    const mousedown = (e: MouseEvent) => {
        isDragging = true
        offset[0] = e.offsetX - (e.target as HTMLElement).getBoundingClientRect().width / (2 * transform[2])
        offset[1] = e.offsetY + 19 / transform[2]
    }

    const mousemove = (e: MouseEvent) => {
        if (!isDragging) {
            return
        }

        e.stopPropagation()
        e.preventDefault()
        const { movementX, movementY } = e
        const { x, y } = getPinPosition(id)

        source.x = x
        source.y = y
        delta.x += movementX / transform[2]
        delta.y += movementY / transform[2]
        target.x = x + delta.x + offset[0]
        target.y = y + delta.y + offset[1]

        const el = e.target as HTMLElement
        if (el.hasAttribute('data-pin')) {
            const targetNodeId = (el.parentNode as HTMLElement)?.getAttribute('data-id')
            if (targetNodeId === id || targetNodeId === null) {
                return
            }

            for (const { ids } of edges()) {
                if (ids[0] === id && ids[1] === targetNodeId) {
                    return
                }
            }

            setAttachable(true)
            candidateEdge[0] = id
            candidateEdge[1] = targetNodeId
        } else {
            setAttachable(false)
            candidateEdge.length = 0
        }
    }

    const mouseup = (e: MouseEvent) => {
        if (!isDragging) {
            return
        }

        closeLine()
        e.stopPropagation()
        e.preventDefault()
        document.removeEventListener('mouseup', mouseup)
        document.removeEventListener('mousemove', mousemove)
        document.removeEventListener('mousedown', mousedown)
        if (candidateEdge.length) {
            setEdges(edges => edges.concat(
                createEdge(...(candidateEdge as [ string, string ]))
            ))   
        }
        onMouseUp(candidateEdge !== null)
    }

    document.addEventListener('mouseup', mouseup)
    document.addEventListener('mousemove', mousemove)
    document.addEventListener('mousedown', mousedown)

    return (handler: any) => onMouseUp = handler
}
