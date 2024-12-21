import { LGraph, LGraphCanvas, LiteGraph } from 'litegraph.js'
import { MoveStatus } from './nodeTypes/moveStatus'

export function createGraphContext(canvas: HTMLCanvasElement): [ LGraph, LGraphCanvas ] {
    const graph = new LGraph()
    const graphCanvas = new LGraphCanvas(canvas, graph)
    graph.start()
    
    return [ graph, graphCanvas ]
}

export function setupMoveEditorNodeTypes() {
    LiteGraph.registerNodeType('move/status', MoveStatus)
}