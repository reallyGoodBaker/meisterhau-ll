import { createSignal, Show, useContext } from "solid-js"
import { INode, ITimeline } from "../types"
import styles from './node.module.css'
import { createStore } from "solid-js/store"
import { useSelect } from '../select.ts'
import { ContextMenuContext } from '../../workbench/contextmenu/cmProvider'

const [selected] = useSelect()

export function createNode(
    type: string,
    name: string,
    x: number,
    y: number,
    color: string = '#1a222a',
    endpoint: boolean = false
): INode {
    const maxId = nodes().map(({ id }) => parseInt(id.slice(1))).sort((a, b) => b - a)[0]
    const id = 'n' + (maxId + 1)
    return {
        id,
        type,
        name,
        x,
        y,
        color,
        endpoint,
        timeline: {} as ITimeline
    }
}

export function Node({ node }: { node: INode }) {
    const contextMenu = useContext(ContextMenuContext)!

    const openContextMenu = (e: MouseEvent) => {
        e.preventDefault()
        contextMenu.addCategory('节点', {
            删除(close) {
                if (!node.endpoint) {
                    setNodes(nodes => nodes.filter(n => n.id !== node.id))
                } else {
                    alert('不能删除此节点')
                }

                close()
            },
            重命名(close) {
                // TODO: 重命名
                close()
            },
            编辑Timeline(close) {
                // TODO: 编辑Timeline
                close()
            }
        })
        .beforeClose(() => contextMenu.removeCategory('节点'))
        .open()
    }

    return (
        <div onContextMenu={openContextMenu} data-id={node.id} class={`${styles.node} ${selected() === node.id ? styles.selected : ''}`} style={`--color: ${node.color}; --x: ${node.x}px; --y: ${node.y}px;`}>
            <div class={styles['node-header']}>
                {node.name}
            </div>
            <div class={styles['node-content']}>
                <Show when={!node.endpoint}>
                    <div data-pin="input" class={`${styles.pin} ${styles.left}`}></div>
                </Show>
                <div data-pin="output" class={`${styles.pin} ${styles.right}`}></div>
            </div>
        </div>
    )
}

export function findNodeById(id: string) {
    return nodes().find(node => node.id == id)
}

export const [nodes, setNodes] = createSignal<INode[]>([])

export function getPinPosition(id: string, pin: 'input' | 'output') {
    const { x, y } = findNodeById(id) as INode

    if (pin === 'input') {
        return { x: x + 16, y: y + 68 - 16 }
    } else {
        return { x: x + 180 - 16, y: y + 68 - 15 }
    }
}