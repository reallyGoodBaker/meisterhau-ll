import { Accessor, createContext, createSignal, onCleanup, onMount, Setter, Show, Signal, useContext } from "solid-js"
import { createNode, EndpointTypes, Node, nodes, setNodes} from "./node/node"
import { IEdge, IGraph, INode } from "./types"
import styles from '../workbench/status/status.module.css'
import { getWorkbenchStatus } from '../workbench/status/status';
import Icon from '../assets/fonts/icon'
import { edges, setEdges, Line } from "./line/line"
import { usePin } from "./node/pin"
import { GraphSelection, useSelection } from './select';
import { ContextMenuContext } from '../workbench/contextmenu/cmProvider'
import { useTab } from "../workbench/main/pager"
import { useFileSystem } from "../workbench/file/fileHook"
import { mainContentView } from "../workbench/main/main"
import { CommandStack } from "../workbench/command/command"
import { TransformCommand } from "./commands/transformCommand"

export enum BPStateMachineStatus {
    NeedSave,
    NeedCompile,
}

const [ transform, setTransform ] = createSignal([ 0, 0, 1 ])
const [ ,fileSystem ] = useFileSystem()
const [ origin, setOrigin ] = createSignal([ window.outerWidth / 2, window.outerHeight / 2 ])

function on<K extends keyof HTMLElementEventMap>(el: HTMLElement, type: K, listener: (ev: HTMLElementEventMap[K]) => void) {
    el.addEventListener(type, listener)
    return () => el.removeEventListener(type, listener)
}

const bindEvents = (
    path: string,
    displayDiv: HTMLDivElement,
    grid: HTMLElement,
    selection: GraphSelection,
    cs: CommandStack,
    workbenchStatus: Accessor<boolean[]>,
    workbenchStatusSetter: Setter<boolean[]>
) => {
    // 鼠标滚轮缩放
    const removeWheel = on(window as any, 'wheel', ev => {
        const delta = -ev.deltaY / 1000
        const [ x, y, s ] = transform()
        const scale = Math.max(0.1, Math.min(5, s + delta))
        
        displayDiv.style.transform = `translate(${x}px, ${y}px) scale(${scale})`
        workbenchStatusSetter([ true, workbenchStatus()[1] ])
        setTransform([ x, y, scale ])
    })

    // 中键拖拽平移
    const removeMd1 = on(window as any, 'mousedown', ev => {
        if (ev.button !== 1) {
            return
        }

        const startX = ev.screenX
        const startY = ev.screenY
        const startTransform = [...transform()]
        const hw = displayDiv.offsetWidth / 2
        const hh = displayDiv.offsetHeight / 2
        const tCmdBuilder = new TransformCommand.Builder(
            [ ...transform() ],
            [ ...origin() ],
            setTransform,
            setOrigin,
        )

        const onMouseMove = (ev: MouseEvent) => {
            if (hw === 0) {
                return
            }

            const deltaX = (ev.screenX - startX) / startTransform[2]
            const deltaY = (ev.screenY - startY) / startTransform[2]
            const x = startTransform[0] + deltaX
            const y = startTransform[1] + deltaY
            displayDiv.style.transform = `translate(${x}px, ${y}px) scale(${startTransform[2]})`
            grid.style.setProperty('--translateX', `${x}px`)
            grid.style.setProperty('--translateY', `${y}px`)

            setOrigin([ hw - x, hh - y ])
            setTransform(t => {
                t[0] = x
                t[1] = y
                return t
            })
        }

        const onMouseUp = (e: MouseEvent) => {
            if (hw === 0) {
                return
            }

            window.removeEventListener('mousemove', onMouseMove)
            window.removeEventListener('mouseup', onMouseUp)
            const tCmd = tCmdBuilder
                .transform([ ...transform() ])
                .origin([ ...origin() ])
                .build()

            cs.push(tCmd)
        }

        window.addEventListener('mousemove', onMouseMove)
        window.addEventListener('mouseup', onMouseUp)
    })

    // 拖动连线，拖动节点，选择节点
    const removeMd2 = on(displayDiv, 'mousedown', ev => {
        const button = ev.button

        if (button === 1) {
            return
        }

        // 点击到背景清空选择项
        if (ev.target === displayDiv) {
            selection.clear()
        }

        // 左键/右键选中节点
        if (button === 0 || button === 2) {
            for (const element of ev.composedPath()) {
                if (element && (element as any)?.hasAttribute?.('data-id')) {
                    const div = element as HTMLDivElement
                    const id = div.getAttribute('data-id')
    
                    if (id) {
                        // 按下一个已选中的节点不能清空其他选择
                        if (!ev.ctrlKey && !selection.has(id)) {
                            selection.clear()
                        }
                        selection.select(id)
                        break
                    }
                }
            }
        }

        let shouldShowSaveIcon = false

        if (button === 0) {
            const target = ev.target as HTMLElement

            if (!target.hasAttribute('data-pin')) {
                const moveListener = (ev: MouseEvent) => {
                    const dx = ev.movementX / transform()[2]
                    const dy = ev.movementY / transform()[2]
                    for (const id of selection.selected()) {
                        setNodes(nodes => nodes.map(n => n.id === id ? {
                            ...n, x: n.x + dx, y: n.y + dy
                        } : n))

                        shouldShowSaveIcon = true
                    }
                }
        
                const upListener = () => {
                    window.removeEventListener('mousemove', moveListener)
                    window.removeEventListener('mouseup', upListener)

                    if (shouldShowSaveIcon) {
                        workbenchStatusSetter([ true, workbenchStatus()[1] ])
                    }
                }
        
                window.addEventListener('mousemove', moveListener)
                window.addEventListener('mouseup', upListener)
            }

            if (selection.selected().length === 1 && target.hasAttribute('data-pin')) {
                const onMouseUp = usePin(
                    selection.selected()[0],
                    +(target.getAttribute('data-pin') ?? 0) as EndpointTypes,
                    displayDiv,
                    transform(),
                    origin(),
                )

                onMouseUp((done: boolean) => {
                    workbenchStatusSetter([ done, done ])
                })
            }
        }
    })

    // Ctrl + S 保存
    const removeKeydown = on(window as any, 'keydown', ev => {
        if (ev.code === 'KeyS' && ev.ctrlKey) {
            ev.preventDefault()
            return saveGraph(path, selection, workbenchStatusSetter, workbenchStatus)
        }
    })

    return () => {
        removeWheel()
        removeMd1()
        removeMd2()
        removeKeydown()
    }
}

async function saveGraph(path: string, selection: GraphSelection, setStatus: Setter<boolean[]>, status: Accessor<boolean[]>) {
    // await fetch('http://localhost:3001/save/' + path, {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({
    //         selected: selected(),
    //         nodes,
    //         edges,
    //         transform: transform(),
    //     })
    // })

    fileSystem(fs => {
        fs.writeFile(path, JSON.stringify({
            type: 'fsm',
            selected: selection.selected(),
            nodes: nodes(),
            edges: edges(),
            transform: transform(),
            origin: origin(),
        }, null, 4))

        setStatus([ false, status()[1] ])
    })
}

function createNewGraph(path: string, selection: GraphSelection, setStatus: Setter<boolean[]>, status: Accessor<boolean[]>) {
    const start = createNode(
        'start',
        '开始',
        200,
        200,
        '#322',
        EndpointTypes.Both
    )
    const resume = createNode(
       'resume',
        '复位',
        200,
        300,
        '#322',
        EndpointTypes.Both
    )

    setNodes([ start, resume ])
    saveGraph(path, selection, setStatus, status)
}

function loadFromGraphJson(jsonValue: IGraph, selection: GraphSelection) {
    setTransform(jsonValue.transform || [ 0, 0, 1 ])
    setOrigin(jsonValue.origin || [ 0, 0 ])
    selection.select(...jsonValue.selected)
    setNodes(jsonValue.nodes)
    setEdges(jsonValue.edges)
}

async function getOrCreateGraph(location: string, selection: GraphSelection, setStatus: Setter<boolean[]>, status: Accessor<boolean[]>) {
    try {
        return loadFromGraphJson(
            JSON.parse(
                await ((await fileSystem()?.readFile(location))?.text()) || '{}'
            ),
            selection
        )
    } catch (e) {
        // console.error(e)
        return createNewGraph(location, selection, setStatus, status)
    }
}

export const StatusContext = createContext<Signal<boolean[]>>()

const [ tab ] = useTab()

const Graph = () => {
    let display: any
    let removeEvents: any

    const commandStack = CommandStack.getCurrent()
    const selection = useSelection()
    const [ selected, select ] = createSignal(selection.selected())
    const { name: path } = tab()
    const [ status, setStatus ] = getWorkbenchStatus(path, [ false, false ] as const)
    const contextMenu = useContext(ContextMenuContext)!

    const openContextMenu = (ev: MouseEvent) => {
        ev.preventDefault()
        contextMenu.addCategory('图表', {
            '添加节点': close => {
                close()
                console.log('添加节点')
            },
            '保存': close => {
                close()
                saveGraph(path, selection, setStatus as any, status as any)
            },
            '编译': close => {
                close()
                console.log('编译')
            },
        })
            .beforeClose(() => contextMenu.removeCategory('图表'))
            .open()
    }

    let grid

    const onchange = () => select(selection.selected())

    onMount(async () => {
        await getOrCreateGraph(path, selection, setStatus as any, status as any)
        removeEvents = bindEvents(path, display, grid as any, selection, commandStack, status as any, setStatus as any)
        mainContentView().addEventListener('contextmenu', openContextMenu)
        selection.onChange(onchange)
    })

    onCleanup(() => {
        removeEvents?.()
        mainContentView().removeEventListener('contextmenu', openContextMenu)
        contextMenu.removeCategory('图表')
        selection.offChange(onchange)
    })

    return (
        <Show when={true} keyed>
            <StatusContext.Provider value={[ status, setStatus ] as any}>
                <div ref={grid} class={styles.grid} style={`
                    width: 100%;
                    height: 100%;
                    position: relative;
                    overflow: hidden;
                    --translateX: ${origin()[0]}px;
                    --translateY: ${origin()[1]}px;
                    --scale: ${transform()[2]};
                `}>
                    <div class={styles.status_container}>
                        <div on:click={() => saveGraph(path, selection, setStatus as any, status as any)} class={`${styles.status} ${status()[BPStateMachineStatus.NeedSave] ? styles.active : ''}`}>
                            <Icon codePoint='e161' fontSize='1.5em' />
                        </div>
                        <div class={`${styles.status} ${status()[BPStateMachineStatus.NeedCompile] ? styles.active : ''}`}>
                            <Icon codePoint='e86f' fontSize='1.5em'/>
                        </div>
                    </div>
                    <div ref={display} style={`
                        outline: solid 4px red;
                        position: absolute;
                        width: 100%;
                        height: 100%;
                        transform-origin: ${origin()[0]}px ${origin()[1]}px;
                        transform: translate(${transform()[0]}px, ${transform()[1]}px) scale(${transform()[2]});
                    `}>
                        {nodes()?.map((node: INode) => <Node selected={selected} node={node}/>)}
                        {edges()?.map((edge: IEdge) => <Line select={select} selected={selected} edge={edge} />)}
                    </div>
                </div>
            </StatusContext.Provider>
        </Show>
    )
}

export default Graph
