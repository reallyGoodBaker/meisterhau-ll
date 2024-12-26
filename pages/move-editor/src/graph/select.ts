import { createSignal } from "solid-js"

const [ selected, select ] = createSignal<string|null>(null)

export function useSelect() {
    let onselect = Function.prototype
    const _select = (id: string) => {
        select(id)
        onselect(id)
    }

    return [
        selected,
        _select,
        (fn: (id: string) => void) => { onselect = fn },
    ] as const
}