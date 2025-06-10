import { createSignal, Signal } from "solid-js"
import { useTab } from "../main/pager"

const status = new Map<string, Signal<any>>()

export function getWorkbenchStatus<T>(name: string, defaultValue: T) {
    if (!status.has(name)) {
        status.set(name, createSignal(defaultValue as T))
    }

    return status.get(name) as Signal<T>
}

export function getCurrentWorkbenchStatus<T>() {
    const [ tab ] = useTab()
    return getWorkbenchStatus(tab().name, null as T)
}