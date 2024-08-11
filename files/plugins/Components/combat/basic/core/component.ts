import { Optional } from './optional'
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
    #components = new Map<ComponentCtor, Component>()
    #prependTicks: Function[] = []
    #nextTicks: Function[] = []

    getComponent<T extends Component>(ctor: ComponentCtor<T>): Optional<T> {
        return Optional.some(this.#components.get(ctor)) as Optional<T>
    }

    async #attachComponent<T>(ctor: ComponentCtor, component: Component | BasicComponent): Promise<Optional<T>> {
        if (this.#components.get(ctor)) {
            await this.detachComponent(ctor) 
        }

        if ('onAttach' in component) {
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

        this.#components.delete(ctor)
    }

    clear() {
        this.#components.clear()
    }

    getComponents() {
        return this.#components.values()
    }

    getComponentNames() {
        return this.#components.keys()
    }

    has(ctor: ComponentCtor) {
        return this.#components.has(ctor)
    }

    nextTick(fn: (pl: Optional<Player>, status: Optional<Status>) => void) {
        this.#nextTicks.push(fn)
    }

    prependNextTick(fn: (pl: Optional<Player>, status: Optional<Status>) => void) {
        this.#prependTicks.unshift(fn)
    }

    handleTicks(pl: Player, status: Status) {
        for (const prependTick of this.#prependTicks) {
            prependTick.call(null, Optional.some(pl), Optional.some(status))
        }

        for (const component of this.#components.values()) {
            const { onTick } = component

            if (onTick) {
                onTick.call(component, this, Optional.some(pl), Optional.some(status))
            }
        }

        for (const nextTick of this.#nextTicks) {
            nextTick.call(null, Optional.some(pl), Optional.some(status))
        }
    }
}