import { LGraphNode, LiteGraph } from "litegraph.js"


export class MoveStatus extends LGraphNode {
    title: string = "Move Status"

    constructor() {
        super()
        this.addInput('process', LiteGraph.ACTION)
        this.addOutput('end', LiteGraph.ACTION)
        this.addOutput('start', LiteGraph.EVENT)
        this.addOutput('act', LiteGraph.EVENT)
        this.addOutput('leave', LiteGraph.EVENT)
    }

    onAction(action: number, data: any) {
        console.log(action, data)
    }
}