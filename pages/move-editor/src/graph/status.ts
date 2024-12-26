import { createSignal, Signal } from "solid-js"

const status = new Map<string, Signal<boolean[]>>()

export enum Status {
    NeedSave,
    NeedCompile,
}

export function getStatus(name: string) {
    if (!status.has(name)) {
        status.set(name, createSignal([ false, false ] as boolean[]))
    }

    return status.get(name) as Signal<boolean[]>
}