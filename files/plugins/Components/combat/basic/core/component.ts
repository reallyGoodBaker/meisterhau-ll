import { Optional } from '@utils/optional'
import { Status } from './status'

export interface Component {
    onTick(manager: ComponentManager, pl: Optional<Player>, status: Optional<Status>): void
    detach(manager: ComponentManager): void
}

export interface BasicComponent extends Component {
    onAttach(manager: ComponentManager): boolean | void | Promise<boolean|void>
    onDetach(manager: ComponentManager): void | Promise<void>
}

export class CustomComponent implements Component {
    onTick(manager: ComponentManager, pl: Optional<Player>, status: Optional<Status>): void {}

    detach(manager: ComponentManager) {
        const ctor = Object.getPrototypeOf(this).constructor
        return manager.detachComponent(ctor)
    }
}

export class BaseComponent extends CustomComponent implements BasicComponent {
    onAttach(manager: ComponentManager): boolean | void | Promise<boolean|void> {}
    onDetach(manager: ComponentManager): void | Promise<void> {}
}

export interface ComponentCtor<T extends Component | BasicComponent = Component> {
    new(...args: any[]): T
}

export class ComponentManager {
    static profilerEnable = false

    #components = new Map<ComponentCtor, Component>()
    #prependTicks: Function[] = []
    #nextTicks: Function[] = []

    getComponent<T extends Component>(ctor: ComponentCtor<T>): Optional<T> {
        return Optional.some(this.#components.get(ctor)) as Optional<T>
    }

    getComponents(...ctor: ComponentCtor[]): (Component|undefined)[] {
        return ctor.map(c => this.#components.get(c))
    }

    async #attachComponent<T>(ctor: ComponentCtor, component: Component | BasicComponent, shouldRebuild=true): Promise<Optional<T>> {
        let init = !this.#components.get(ctor)

        if (!init && shouldRebuild) {
            await this.detachComponent(ctor) 
            init = true
        }

        if (REQUIRED_COMPONENTS in component) {
            //@ts-ignore
            for (const [ ctor, comp ] of component[REQUIRED_COMPONENTS]) {
                this.#attachComponent(ctor, comp, false)
            }
        }

        if (init && 'onAttach' in component) {
            await component.onAttach(this)   
        }

        this.#components.set(ctor, component)
        return Optional.some(component) as Optional<T>
    }

    async attachComponent(...component: Component[]) {
        const components: Optional<Component>[] = []
        for (const obj of component) {
            components.push(await this.#attachComponent(
                Object.getPrototypeOf(obj).constructor,
                obj
            ))
        }

        return components
    }

    async getOrCreate<T extends Component>(ctor: ComponentCtor<T>, ...args: any[]): Promise<Optional<T>> {
        let component = this.#components.get(ctor) as T

        if (component) {
            return Optional.some(component)
        }

        return this.#attachComponent(ctor, new ctor(...args))
    }

    async detachComponent(ctor: ComponentCtor) {
        const component = this.#components.get(ctor) as BasicComponent
        if (component && 'onDetach' in component) {
            await component.onDetach(this)
        }

        return this.#components.delete(ctor)
    }

    clear() {
        this.#components.clear()
    }

    getComponentKeys() {
        return this.#components.keys()
    }

    has(ctor: ComponentCtor) {
        return this.#components.has(ctor)
    }

    afterTick(fn: (pl: Optional<Player>, status: Optional<Status>) => void) {
        this.#nextTicks.push(fn)
    }

    beforeTick(fn: (pl: Optional<Player>, status: Optional<Status>) => void) {
        this.#prependTicks.unshift(fn)
    }

    handleTicks(pl: Player, status: Status) {
        for (const prependTick of this.#prependTicks) {
            this.profiler(() => prependTick.call(null, Optional.some(pl), Optional.some(status)))
            // prependTick.call(null, Optional.some(pl), Optional.some(status))
        }
        this.#prependTicks.length = 0

        for (const component of this.#components.values()) {
            const { onTick } = component

            if (onTick) {
                this.profiler(
                    () => onTick.call(component, this, Optional.some(pl), Optional.some(status)),
                    component
                )
                // onTick.call(component, this, Optional.some(pl), Optional.some(status))
            }
        }

        for (const afterTick of this.#nextTicks) {
            this.profiler(() => afterTick.call(null, Optional.some(pl), Optional.some(status)))
            // afterTick.call(null, Optional.some(pl), Optional.some(status))
        }
        this.#nextTicks.length = 0
    }

    update<T extends Component>(ctor: ComponentCtor<T>, fn: (component: T) => void) {
        const component = this.#components.get(ctor)

        if (component) {
            fn(component as T)
            return true
        }

        return false
    }

    profiler(fn: Function, component?: Component, name?: string) {
        if (!ComponentManager.profilerEnable) {
            return fn()
        }

        const conponentName = component ? Object.getPrototypeOf(component).constructor.name : ''
        const profileName = name ? name 
            : conponentName ? (`${conponentName}.${fn.name}`)
                : fn.name

        const now = performance.now()
        const val = fn()
        console.log(`[Profiler] ${profileName} took ${performance.now() - now}ms`)
        return val
    }
}

type RequireComponentsParam = ComponentCtor | [ComponentCtor, ...any[]]
const REQUIRED_COMPONENTS = Symbol('REQUIRED_COMPONENTS')

export interface RequiredComponent extends BasicComponent {
    getComponent<T extends Component>(ctor: ComponentCtor): T
}

export function RequireComponents(...params: RequireComponentsParam[]) {
    return class CRequiredComponent extends BaseComponent implements RequiredComponent {
        [REQUIRED_COMPONENTS] = new Map<ComponentCtor, Component>()
        
        constructor() {
            super()
            for (const param of params) {
                if (Array.isArray(param)) {
                    const [ Ctor, ...args ] = param
                    this[REQUIRED_COMPONENTS].set(Ctor, Reflect.construct(Ctor, args))
                    continue
                }

                this[REQUIRED_COMPONENTS].set(param, Reflect.construct(param, []))
            }
        }
    
        getComponent<T extends Component>(ctor: ComponentCtor): T {
            return this[REQUIRED_COMPONENTS].get(ctor) as T
        }
    }
    
}
