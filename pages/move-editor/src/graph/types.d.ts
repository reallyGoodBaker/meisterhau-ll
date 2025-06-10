import { IFile } from "../workbench/file/IFile"
import { EndpointTypes } from "./node/node"

export interface IGraph extends IFile {
    transform: number[]
    origin: number[]
    selected: string
    nodes: INode[]
    edges: IEdge[]
}

export interface Selectable {
    id: string
}

export interface Configurable<T> {
    readonly properties: T
}

export interface IEdge extends Selectable {
    ids: [string, string]
    conditions: ICondition
}

export interface INode extends Selectable, Configurable<INodeProperties> {
    id: string
    type: string
    name: string
    x: number
    y: number
    color: string
    endpoint: EndpointTypes
    tracks: ITrack[]
}

export interface INodeProperties {
    animation?: string
    duration?: number
    dilation?: number
}

export enum NotifyTypes {
    ENTER_STATE,
    EXIT_STATE,
    NOTIFY,
    EXIT_TRACK,
}

export interface ITrack {
    name: string
    enabled: boolean
    notifies: INotify[]
}

export interface INotify {
    type: NotifyTypes
    name: string
    time: number
}

export interface ICondition<Props=any> {
    [event: string]: Props
}