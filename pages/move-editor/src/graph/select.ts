import { useTab } from "../workbench/main/pager"

export class GraphSelection {
    readonly _selected = new Set<string>()
    static readonly mapping = new Map<string, GraphSelection>()

    constructor(readonly id: string) {
        GraphSelection.mapping.set(id, this)
    }

    private _onChangeCb: ((removes: string[], adds: string[]) => void)[] = []

    has(id: string) {
        return this._selected.has(id)
    }

    select(...id: string[]) {
        for (const _id of id) {
            this._selected.add(_id)
        }
        this._onChangeCb.forEach(cb => cb([], id))
    }

    drop(...id: string[]) {
        for (const _id of id) {
            this._selected.delete(_id)
        }
        this._onChangeCb.forEach(cb => cb(id, []))
    }

    clear() {
        const selected = [...this._selected]
        this._selected.clear()
        this._onChangeCb.forEach(cb => cb(selected, []))
    }

    selected() {
        return [...this._selected]
    }

    onChange(cb: (removes: string[], adds: string[]) => void) {
        this._onChangeCb.push(cb)
    }

    offChange(cb: () => void) {
        this._onChangeCb = this._onChangeCb.filter(_cb => _cb !== cb)
    }
}

const [ tab ] = useTab()

export function useSelection() {
    const id = tab().name
    const candidate = GraphSelection.mapping.get(id)
    return candidate ?? new GraphSelection(id)
}