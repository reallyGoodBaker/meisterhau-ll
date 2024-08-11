import { Component, ComponentCtor, CustomComponent } from "./component"

export interface CommandConstructableComponentCtor extends ComponentCtor {
    create(args: any): Component
}

const commandComponentRegistry = new Map<string, CommandConstructableComponentCtor>()
const componentIdMapping = new WeakMap()

export const CommandConstructable: (name: string) => ClassDecorator = name => target => {
    if ('create' in target) {
        commandComponentRegistry.set(name, target as any)
        componentIdMapping.set(target as any, name as any)
    }
}

export const getComponentCtor = (id: string) => {
    return commandComponentRegistry.get(id)
}

export const getComponentId: (t: ComponentCtor) => string | undefined = (t: ComponentCtor) => {
    return componentIdMapping.get(t)
}

const checkableKeys = new Map<ComponentCtor, string[]>()
export const Checkable: (keys: string[]) => ClassDecorator = keys => target => {
    //@ts-ignore
    checkableKeys.set(target, keys)
}

export function getCheckableEntries(t: any): [string, any][] | null {
    const keys = checkableKeys.get(Object.getPrototypeOf(t).constructor)

    if (!keys) {
        return null
    }

    return keys.map(k => [k, t[k]])
}

@CommandConstructable('damage-modifier')
@Checkable([ 'modifier' ])
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