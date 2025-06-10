import { Accessor, createSignal, Show, useContext } from "solid-js"
import { INode, ITrack } from "../types.js"
import styles from './node.module.css'
import { ContextMenuContext } from '../../workbench/contextmenu/cmProvider'

export enum EndpointTypes {
    None = 0,
    Input = 1,
    Output = 2,
    Both = 3,
}

export function createNode(
    type: string,
    name: string,
    x: number,
    y: number,
    color: string = '#1a222a',
    endpoint: EndpointTypes = EndpointTypes.Both
): INode {
    const maxId = nodes().map(({ id }) => parseInt(id.slice(1))).sort((a, b) => b - a)[0] ?? 0
    const id = 'n' + (maxId + 1)
    return {
        id,
        type,
        name,
        x,
        y,
        color,
        endpoint,
        tracks: [] as ITrack[],
        properties: {}
    }
}

export function Node({ node, selected }: { node: INode, selected: Accessor<string[]> }) {
    const contextMenu = useContext(ContextMenuContext)!

    const openContextMenu = (e: MouseEvent) => {
        e.preventDefault()
        contextMenu.addCategoryOnce('节点', {
            删除(close) {
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
        .open()
    }

    return (
        <div onContextMenu={openContextMenu} data-id={node.id} class={`${styles.node} ${selected().includes(node.id) ? styles.selected : ''}`} style={`--color: ${node.color ?? '#1a1a1a'}; --x: ${node.x}px; --y: ${node.y}px;`}>
            <div class={styles['node-header']}>
                {node.name}
            </div>
            <div class={styles['node-content']} data-pin={node.endpoint}>
                <Show when={node.endpoint & 1}>
                    <div class={`${styles.pin} ${styles.left}`}></div>
                </Show>
                <Show when={node.endpoint & 2}>
                    <div class={`${styles.pin} ${styles.right}`}></div>
                </Show>
            </div>
        </div>
    )
}

export function findNodeById(id: string) {
    return nodes().find(node => node.id == id)
}

export const [ nodes, setNodes ] = createSignal<INode[]>([])

export function getPinPosition(id: string) {
    const { x, y } = findNodeById(id) as INode
    return {
        x, y
    }
}