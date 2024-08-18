import { Alert } from "./alert"
import { getMapping, FormWidget, FormView } from './core'

export abstract class Widget<Ctx> implements FormWidget<Ctx> {
    abstract render(): FormView<Ctx>[]

    back(pl: Player) {
        back(this, pl)
    }
}

export function back(widget: FormWidget<any>, pl: Player) {
    const formStack = getMapping(pl.xuid)
    if (!formStack.length) {
        return
    }

    let [ type, currentWidget ] = formStack.pop()!
    if (currentWidget === widget) {
        [ type, currentWidget ] = formStack.pop()!
    }

    switch (type) {
        case 'alert':
            return Alert.back(widget, pl)

    }
}