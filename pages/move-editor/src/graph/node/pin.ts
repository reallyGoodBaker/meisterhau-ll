import { createEdge, edges, setEdges, useLine } from "../line/line"
import { getPinPosition } from "./node"

export function usePin(id: string, pin: 'input' | 'output', container: HTMLElement, transform: number[]) {
    let source = { x: 0, y: 0 }
    let delta = { x: 0, y: 0 }
    let target = { x: 0, y: 0 }
    const [ closeLine, setAttachable ] = useLine(source, target, container)

    let candidateEdge: string[] = []
    let onMouseUp = Function.prototype as any

    const mousemove = (e: MouseEvent) => {
        e.stopPropagation()
        e.preventDefault()
        const { movementX, movementY } = e
        const { x, y } = getPinPosition(id, pin)

        source.x = x
        source.y = y
        delta.x += movementX / transform[2]
        delta.y += movementY / transform[2]
        target.x = x + delta.x
        target.y = y + delta.y

        const el = e.target as HTMLElement
        if (el.hasAttribute('data-pin')) {
            if (el.getAttribute('data-pin') === pin) {
                return
            }

            const targetNodeId = (el.parentNode?.parentNode as HTMLElement)?.getAttribute('data-id')
            if (targetNodeId === id || targetNodeId === null) {
                return
            }

            for (const { ids } of edges) {
                if (ids.includes(id) && ids.includes(targetNodeId || '')) {
                    return
                }
            }

            setAttachable(true)
            if (pin === 'output') {
                candidateEdge[0] = id
                candidateEdge[1] = targetNodeId
            } else {
                candidateEdge[0] = targetNodeId
                candidateEdge[1] = id
            }
        } else {
            setAttachable(false)
            candidateEdge.length = 0
        }
    }

    const mouseup = (e: MouseEvent) => {
        closeLine()
        e.stopPropagation()
        e.preventDefault()
        document.removeEventListener('mouseup', mouseup)
        document.removeEventListener('mousemove', mousemove)
        if (candidateEdge.length) {
            setEdges(edges => edges.concat(
                createEdge(...(candidateEdge as [ string, string ]))
            ))   
        }
        onMouseUp(candidateEdge !== null)
    }

    document.addEventListener('mouseup', mouseup)
    document.addEventListener('mousemove', mousemove)

    return (handler: any) => onMouseUp = handler
}