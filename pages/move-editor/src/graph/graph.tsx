import { onMount } from "solid-js"
import { createGraphContext } from "./graph"
import { LiteGraph } from "litegraph.js"

const Graph = ({ location }: any) => {
    let canvas: any

    onMount(() => {
        const [ graph ] = createGraphContext(canvas as any)
        const constNode = LiteGraph.createNode('basic/const')
        constNode.pos = [100, 100]
        graph.add(constNode)

        const style = getComputedStyle(document.getElementById('content') as any)
        const width = style.width.replace('px', '')
        const height = style.height.replace('px', '')

        canvas.width = width
        canvas.height = height
        canvas.style.width = width + 'px'
        canvas.style.height = height + 'px'
    })

    return (
        <div style={`width: 100%; height: 100%; position: relative; overflow: hidden;`}>
            <canvas ref={canvas}></canvas>
        </div>
    )
}

export default Graph