import { Ref } from './ref'

export interface Component {
    onTick(): void
}

export interface BasicComponent extends Component {
    onAttach(): boolean | void | Promise<boolean|void>
    onDetach(): void | Promise<void>
}

export class CustomComponent implements Component {
    onTick() {}
}

export class BaseComponent extends CustomComponent {
    onAttach() {}
    onDetach() {}

    getPlayer() {
        return Ref.player
    }

    getManager() {
        return Ref.status?.componentManager!
    }

    getStatus() {
        return Ref.status!
    }

}

export interface ComponentCtor<T extends Component | BasicComponent = Component> {
    new(...args: any[]): T
}

export class ComponentManager {
    #components = new Map<ComponentCtor, Component>()

    getComponent<T extends Component>(ctor: ComponentCtor<T>): T | undefined {
        return this.#components.get(ctor) as T
    }

    async #attachComponent(component: Component | BasicComponent) {
        const ctor = Object.getPrototypeOf(component).constructor
        if ('onAttach' in component && await component.onAttach()) {
            return
        }

        this.#components.set(ctor, component)
    }

    async attachComponent(...component: Component[]) {
        for (const obj of component) {
            await this.#attachComponent(obj)
        }
    }

    async detachComponent(ctor: ComponentCtor) {
        const component = this.#components.get(ctor) as BasicComponent
        if (component && 'onDetach' in component) {
            await component.onDetach()
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
}