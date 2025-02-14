import { Alert } from "./alert"
import { getMapping, FormWidget, FormView } from './core'

export abstract class Widget<Ctx> implements FormWidget<Ctx> {
    abstract render(): FormView<Ctx>[]

    back(pl: Player) {
        return back(pl)
    }
}

export function back(pl: Player) {
    const formStack = getMapping(pl.xuid)
    if (!formStack.length) {
        return
    }

    formStack.pop()
    if (!formStack.length) {
        return
    }

    let [ type, widget ] = formStack.at(-1)!

    switch (type) {
        case 'alert':
            return Alert.back(widget, pl)

    }
}