import { Component, ComponentCtor, CustomComponent } from "./component"

type CommandConstructableCtor = ComponentCtor & {
    create(...args: any[]): Component
}

const publicComponentRegistry = new Map<string, CommandConstructableCtor>()
const componentIdMapping = new WeakMap()

export const getComponentCtor = (id: string) => {
    return publicComponentRegistry.get(id)
}

export const getComponentId: (t: ComponentCtor) => string | undefined = (t: ComponentCtor) => {
    return componentIdMapping.get(t)
}

export const PublicComponent: (name: string) => ClassDecorator = name => target => {
    publicComponentRegistry.set(name, target as any)
    componentIdMapping.set(target as any, name as any)
}

const fieldKeys = new Map<ComponentCtor, {muts: string[], lets: string[]}>()
export const Fields: (muts: string[], lets?: string[]) => ClassDecorator = (muts, lets=[]) => target => {
    //@ts-ignore
    fieldKeys.set(target, { muts, lets })
}

export function getFieldEntries(t: any): {muts: any[], lets: any[]} | null {
    const keys = fieldKeys.get(Object.getPrototypeOf(t).constructor)

    if (!keys) {
        return null
    }

    return {
        muts: keys.muts.map(k => [k, t[k]]),
        lets: keys.lets.map(k => [k, t[k]]),
    }
}

@PublicComponent('damage-modifier')
@Fields([ 'modifier' ])
export class DamageModifier extends CustomComponent {
    static defaultModifier = 0.2
    static create({ modifier }: { modifier: number }) {
        return new DamageModifier(modifier)
    }

    constructor(
        public modifier = DamageModifier.defaultModifier
    ) {
        super()
    }
}