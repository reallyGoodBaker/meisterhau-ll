import { Component, ComponentCtor } from "./component"

/** 可命令构造的组件构造函数类型 */
type CommandConstructableCtor = ComponentCtor & {
    create(...args: any[]): Component
}

/** 公共组件注册表 */
const publicComponentRegistry = new Map<string, CommandConstructableCtor>()
/** 组件ID映射 */
const componentIdMapping = new WeakMap()

/** 根据组件ID获取组件构造函数 */
export const getComponentCtor = (id: string) => {
    return publicComponentRegistry.get(id)
}

/** 根据组件构造函数获取组件ID */
export const getComponentId: (t: ComponentCtor) => string | undefined = (t: ComponentCtor) => {
    return componentIdMapping.get(t)
}

/** 公共组件装饰器 - 注册组件到公共注册表 */
export const PublicComponent: (name: string) => ClassDecorator = name => target => {
    publicComponentRegistry.set(name, target as any)
    componentIdMapping.set(target as any, name as any)
}

/** 字段键映射 */
const fieldKeys = new Map<ComponentCtor, {muts: string[], lets: string[]}>()
/** 字段装饰器 - 定义组件的可变和只读字段 */
export const Fields: (muts: string[], lets?: string[]) => ClassDecorator = (muts, lets=[]) => target => {
    //@ts-ignore
    fieldKeys.set(target, { muts, lets })
}

/** 获取组件的字段条目 */
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
