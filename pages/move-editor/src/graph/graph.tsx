import { createContext, createSignal, onCleanup, onMount, Signal, useContext } from "solid-js"
import { createNode, Node, nodes, setNodes} from "./node/node"
import { IEdge, IGraph, INode } from "./types"
import styles from './status.module.css'
import { getStatus, Status } from "./status"
import Icon from '../assets/fonts/icon'
import { edges, setEdges, Line } from "./line/line"
import { usePin } from "./node/pin"
import { useSelect } from "./select"
import { ContextMenuContext } from '../workbench/contextmenu/cmProvider'
import { useTab } from "../workbench/main/pager"

const [ selected, select ] = useSelect()
const [ transform, setTransform ] = createSignal([ 0, 0, 1 ])

function on<K extends keyof HTMLElementEventMap>(el: HTMLElement, type: K, listener: (ev: HTMLElementEventMap[K]) => void) {
    el.addEventListener(type, listener)
    return () => el.removeEventListener(type, listener)
}

const bindEvents = (path: string, displayDiv: HTMLDivElement) => {
    const removeWheel = on(document as any, 'wheel', ev => {
        const delta = -ev.deltaY / 1000
        const [ x, y, s ] = transform()
        const scale = Math.max(0.1, Math.min(5, s + delta))
        
        displayDiv.style.transform = `translate(${x}px, ${y}px) scale(${scale})`
        _setStatus([ true, _status()[1] ])
        setTransform([ x, y, scale ])
    })

    const removeMd1 = on(displayDiv, 'mousedown', ev => {
        if (ev.button !== 1) {
            return
        }

        const startX = ev.clientX
        const startY = ev.clientY
        const startTransform = [...transform()]

        const onMouseMove = (ev: MouseEvent) => {
            const deltaX = ev.clientX - startX
            const deltaY = ev.clientY - startY
            const x = startTransform[0] + deltaX
            const y = startTransform[1] + deltaY
            displayDiv.style.transform = `translate(${x}px, ${y}px) scale(${startTransform[2]})`
            setTransform(t => {
                t[0] = x
                t[1] = y
                return t
            })
        }

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup', onMouseUp)
            _setStatus([ true, _status()[1] ])
        }

        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
    })

    const removeMd2 = on(displayDiv, 'mousedown', ev => {
        const button = ev.button

        if (button === 1) {
            return
        }

        if (ev.target === displayDiv) {
            select('')
        }

        if (button === 0 || button === 2) {
            for (const element of ev.composedPath()) {
                if (element && (element as any)?.hasAttribute?.('data-id')) {
                    const div = element as HTMLDivElement
                    const id = div.getAttribute('data-id')
    
                    if (id) {
                        select(id)
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
                    const id = selected()
                    if (id) {
                        setNodes(nodes => nodes.map(n => n.id === id? {
                            ...n, x: n.x + dx, y: n.y + dy
                        } : n))

                        shouldShowSaveIcon = true
                    }
                }
        
                const upListener = () => {
                    document.removeEventListener('mousemove', moveListener)
                    document.removeEventListener('mouseup', upListener)

                    if (shouldShowSaveIcon) {
                        _setStatus([ true, _status()[1] ])
                    }
                }
        
                document.addEventListener('mousemove', moveListener)
                document.addEventListener('mouseup', upListener)
            }

            if (target.hasAttribute('data-pin')) {
                const onMouseUp = usePin(
                    selected() as string,
                    target.getAttribute('data-pin') as 'input' | 'output',
                    displayDiv,
                    transform()
                )

                onMouseUp((done: boolean) => {
                    _setStatus([ done, done ])
                })
            }
        }
    })

    const removeKeydown = on(document as any, 'keydown', ev => {
        if (ev.code === 'KeyS' && ev.ctrlKey) {
            ev.preventDefault()
            return saveGraph(path)
        }
    })

    return () => {
        removeWheel()
        removeMd1()
        removeMd2()
        removeKeydown()
    }
}

async function saveGraph(path: string) {
    await fetch('http://localhost:3001/save/' + path, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            selected: selected(),
            nodes,
            edges,
            transform: transform(),
        })
    })

    _setStatus([ false, _status()[1] ])

    return 
}

function createNewGraph(path: string) {
    const start = createNode(
        'start',
        '开始',
        200,
        200,
        '#322',
        true
    )
    const resume = createNode(
       'resume',
        '复位',
        200,
        300,
        '#322',
        true
    )

    setNodes([ start, resume ])
    saveGraph(path)
}

function loadFromGraphJson(jsonValue: IGraph) {
    setTransform(jsonValue.transform || [ 0, 0, 1 ])
    select(jsonValue.selected)
    setNodes(jsonValue.nodes)
    setEdges(jsonValue.edges)
}

async function getOrCreateGraph(location: string) {
    try {
        return loadFromGraphJson(await (await fetch(location)).json())
    } catch (e) {
        // console.error(e)
        return createNewGraph(location)
    }
}

let _setStatus = Function.prototype as any,
    _status = () => [ false, false ] as any

export const StatusContext = createContext<Signal<boolean[]>>()

const [ tab ] = useTab()

const Graph = () => {
    let display: any
    let removeEvents: any

    const { path } = tab()
    const [ status, setStatus ] = getStatus(path)
    _setStatus = setStatus
    _status = status

    const contextMenu = useContext(ContextMenuContext)!
    contextMenu.addCategory('图表', {
        '添加节点': close => {
            close()
            console.log('添加节点')
        },
        '保存': close => {
            close()
            saveGraph(path)
        },
        '编译': close => {
            close()
            console.log('编译')
        },
    })

    const openContextMenu = (ev: MouseEvent) => {
        ev.preventDefault()
        contextMenu.open()
    }

    onMount(async () => {
        await getOrCreateGraph('http://localhost:3001/load/' + path)
        removeEvents = bindEvents(path, display)
        document.addEventListener('contextmenu', openContextMenu)
    })

    onCleanup(() => {
        removeEvents?.()
        document.removeEventListener('contextmenu', openContextMenu)
        contextMenu.removeCategory('图表')
    })

    return (
        <StatusContext.Provider value={[ status, setStatus ]}>
            <div style={`
                width: 100%;
                height: 100%;
                position: relative;
                overflow: hidden;
            `}>
                <div class={styles.status_container}>
                    <div on:click={() => saveGraph(path)} class={`${styles.status} ${status()[Status.NeedSave] ? styles.active : ''}`}>
                        <Icon codePoint='e161' fontSize='1.5em' />
                    </div>
                    <div class={`${styles.status} ${status()[Status.NeedCompile] ? styles.active : ''}`}>
                        <Icon codePoint='e86f' fontSize='1.5em'/>
                    </div>
                </div>
                <div ref={display} style={`
                    width: 100%;
                    height: 100%;
                    transform: translate(${transform()[0]}px, ${transform()[1]}px) scale(${transform()[2]});
                `}>
                    {nodes().map((node: INode) => <Node node={node}/>)}
                    {edges().map((edge: IEdge) => <Line edge={edge} />)}
                </div>
            </div>
        </StatusContext.Provider>
    )
}

export default Graph