import { FormRenderer, FormView, FormWidget, getMapping } from "./core"

export namespace Alert {
    export interface AlertButton {
        text: string
        onClick(pl: Player): void
    }

    export interface State {
        title?: string
        content?: string
        apply?: AlertButton
        cancel?: AlertButton
    }

    export function ApplyButton(
        text: string, 
        onClick: (pl: Player) => void
    ): FormView<State> {
        return context => {
            context.apply = {
                text,
                onClick
            }
        }
    }

    export function CancelButton(
        text: string, 
        onClick: (pl: Player) => void
    ): FormView<State> {
        return context => {
            context.cancel = {
                text,
                onClick
            }
        }
    }

    export function View(title: string, content: string): FormView<State> {
        return context => {
            context.title = title
            context.content = content
        }
    }

    function sendAlert({ title, content, apply, cancel }: State, pl: Player) {
        pl.sendModalForm(
            title!,
            content!,
            apply?.text!,
            cancel?.text!,
            (pl, confirmed) => {
                if (confirmed) {
                    return apply?.onClick(pl)
                }

                return cancel?.onClick(pl)
            }
        )
    }

    function createContext(widget: FormWidget<State>) {
        const ctx: State = {}

        for (const view of widget.render()) {
            view.call(null, ctx)
        }

        if (!ctx.title || !ctx.content) {
            throw new Error('Title and content are required')
        }

        return ctx
    }

    export const start: FormRenderer<State> = (ctor: ConstructorOf<FormWidget<State>>, pl: Player) => {
        const widget = Reflect.construct(ctor, [])
        const ctx = createContext(widget)
        const stack = getMapping(pl.xuid)

        stack.push([ 'alert', widget ])
        sendAlert(ctx, pl)
    }

    export function back(widget: FormWidget<State>, pl: Player) {
        sendAlert(createContext(widget), pl)
    }
}