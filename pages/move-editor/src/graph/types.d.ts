export interface IGraph {
    transform: number[]
    selected: string
    nodes: INode[]
    edges: IEdge[]
}

export interface Selectable {
    id: string
}

export interface IEdge extends Selectable {
    ids: [string, string]
    conditions: ICondition
}

export interface INode extends Selectable {
    type: string
    name: string
    x: number
    y: number
    color: string
    endpoint?: boolean
    timeline: ITimeline
}

export interface ITimeline {
    [name: string]: ITrack[]
}

export interface ITrack<T=any> {
    [time: number]: ICommand<T>[]
}

export interface ICommand<T=any> {
    type: string
    data: T
}

export interface ICondition<Props=any> {
    [event: string]: Props
}