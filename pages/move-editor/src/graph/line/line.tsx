import { IEdge } from '../types'
import styles from './line.module.css'
import { getPinPosition } from '../node/node'
import { Accessor, createSignal, onCleanup, Setter, useContext } from 'solid-js'
import { ContextMenuContext } from '../../workbench/contextmenu/cmProvider'
import { StatusContext } from '../graph'

export const [ edges, setEdges ] = createSignal<IEdge[]>([])

export function createEdge(nid1: string, nid2: string): IEdge {
    const maxId = edges().map(({ id }) => parseInt(id.slice(1)) || 0).sort((a, b) => b - a)[0]
    const id = 'e' + (maxId + 1)
    return {
        ids: [nid1, nid2],
        id,
        conditions: [],
    }
}

export function Line({ edge, selected, select }: { edge: IEdge, selected: Accessor<string[]>, select: Setter<string[]> }) {
    const contextMenu = useContext(ContextMenuContext)!
    const [ _, setStatus ] = useContext(StatusContext)!

    let el: HTMLDivElement | undefined
    let stop = false

    const popup = () => {
        contextMenu.addCategory('连线', {
            '断开': close => {
                setEdges(edges().filter(e => e.id !== edge.id))
                setStatus([ true, true ])
                close()
            },
            '编辑条件': close => {
                setStatus([ true, true ])
                console.log('编辑条件')
                close()
            }
        })
    
        contextMenu.open()
        contextMenu.beforeClose(() => contextMenu.removeCategory('连线'))
    }

    function update() {
        if (!stop && el) {
            const { x, y } = getPinPosition(edge.ids[0])
            const { x: x1, y: y1 } = getPinPosition(edge.ids[1])
            const dy = y1 - y
            const dx = x1 - x
            const angle = Math.atan2(dy, dx) * 180 / Math.PI
            const rotate = `rotate(${angle}deg)`
            const centerX = (x + x1) / 2
            const centerY = (y + y1) / 2
            const length = Math.sqrt(dx ** 2 + dy ** 2)
            el.style.cssText = `width: ${length}px; left: ${centerX}px; top: ${centerY}px; transform: translate(-50%, -50%) ${rotate};`  
        }

        requestAnimationFrame(update)
    }

    update()
    onCleanup(() => stop = true)

    return (
        <div onContextMenu={popup} onMouseDown={() => select([ edge.id ])} ref={el} class={`${styles.line} ${
            selected().includes(edge.id)
                ? styles.selected
                : ''
        }`}/>
    )
}

export function useLine(p1: { x: number, y: number }, p2: { x: number, y: number }, parent: HTMLElement) {
    const el = document.createElement('div')
    el.className = `${styles.line} ${styles.none_events}`
    let stop = false

    function update() {
        if (!stop && el) {
            const dy = p2.y - p1.y
            const dx = p2.x - p1.x
            const angle = Math.atan2(dy, dx) * 180 / Math.PI
            const rotate = `rotate(${angle}deg)`
            const centerX = (p1.x + p2.x) / 2
            const centerY = (p1.y + p2.y) / 2
            const length = Math.sqrt(dx ** 2 + dy ** 2)
            el.style.cssText = `width: ${length}px; left: ${centerX}px; top: ${centerY}px; transform: translate(-50%, -50%) ${rotate};`
        }

        requestAnimationFrame(update)
    }

    update()
    parent.appendChild(el)

    return [
        () => {
            stop = true
            el.remove()
        },
        (bool: boolean) => {
            el.classList.toggle(styles.canAttach, bool)
        }
    ] as const
}