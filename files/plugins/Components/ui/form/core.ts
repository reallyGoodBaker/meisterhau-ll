export interface FormWidget<Ctx> {
    render(): FormView<Ctx>[]
    
}

export interface FormRenderer<Ctx> {
    (widget: ConstructorOf<FormWidget<Ctx>>, pl: Player): void
}

export interface FormView<T> {
    (context: T): void
}

const formStackMapping: Map<string, [string, FormWidget<any>][]> = new Map()

export function getMapping(xuid: string) {
    let formStack = formStackMapping.get(xuid)

    if (!formStack) {
        formStack = []
        formStackMapping.set(xuid, formStack)
    }

    return formStack
}