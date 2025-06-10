import style from './style.module.css'
import { Accessor, createContext, createSignal, For, Setter } from 'solid-js'
import { PrimaryMenu } from './primaryMenu'
import { Divider } from './divider'
import { calcInRect, offsetRect } from './util'

const defaultContextValue = {
    open: false,
    x: 0,
    y: 0,
    categories: [],
}

export type ContextMenuCategories = {
    name: string,
    category: ContextMenuCategory
}[]

export interface ContextMenuCategory {
    [key: string]: ((close: () => void) => void) | ContextMenuSecondaryCategory | null
}

export interface ContextMenuSecondaryCategory {
    [key: string]: ((close: () => void) => void)
}

export const ContextMenuContext = createContext<ContextMenu>()

class ContextMenu {
    constructor(
        private setContextMenu: Setter<{
            open: boolean
            x: number
            y: number
            categories: ContextMenuCategories
        }>,
        private contextMenuRef: Accessor<{
            open: boolean
            x: number
            y: number
            categories: ContextMenuCategories
        }>,
    ) {}

    private _beforeClose: Function[] = []

    open() {
        this.setContextMenu(menu => {
            menu.open = true
            return menu
        })
    }
    
    close = () => {
        this.setContextMenu(menu => {
            menu.open = false
            return menu
        })
    }
    
    setPosition(x: number, y: number) {
        this.setContextMenu(menu => {
            menu.x = x
            menu.y = y
            return menu
        })
    }

    findCategory(name: string) {
        return this.contextMenuRef().categories.find(c => c.name === name)
    }
    
    addCategory(name: string, category: ContextMenuCategory) {
        this.setContextMenu(menu => {
            const candidate = this.findCategory(name)?.category
            if (candidate) {
                return menu
            }

            menu.categories.unshift({ name, category })
            return menu
        })

        return this
    }

    addCategoryOnce(name: string, category: ContextMenuCategory) {
        this.addCategory(name, category)
        this.beforeClose(() => this.removeCategory(name))
        
        return this   
    }
    
    removeCategory(name: string) {
        this.setContextMenu(menu => {
            menu.categories = menu.categories.filter(c => c.name !== name)
            return menu
        })

        return this
    }

    ref() {
        return this.contextMenuRef()
    }

    beforeClose(cb: () => void) {
        this._beforeClose.push(cb)
        return this
    }
}

export function ContextMenuProvider(props: any) {
    const [ contextMenuRef, setContextMenu ] = createSignal<{
        open: boolean
        x: number
        y: number
        categories: ContextMenuCategories
    }>(defaultContextValue, { equals: false })
    
    const contextMenu = new ContextMenu(setContextMenu, contextMenuRef)

    window.addEventListener('contextmenu', ev => {
        ev.preventDefault()
        const { x, y } = calcInRect(
            offsetRect(container!.getBoundingClientRect()!, ev.clientX, ev.clientY),
            document.body.getBoundingClientRect()!,
        )

        setContextMenu({
            ...contextMenuRef(),
            x, y,
        })
    })

    let container: HTMLDivElement | null = null

    window.addEventListener('mousedown', ev => {
        if (container && !ev.composedPath().includes(container)) {
            //@ts-ignore
            contextMenu._beforeClose.splice(0, contextMenu._beforeClose.length).forEach(fn => fn())
            setContextMenu(menu => {
                menu.open = false
                return menu
            })
        }
    })

    return (
        <ContextMenuContext.Provider value={contextMenu}>
            {props.children}
            <div
                ref={container!}
                class={`${style['context_menu']}`}
                style={{
                    '--x': contextMenuRef().x,
                    '--y': contextMenuRef().y,
                    'z-index': contextMenuRef().open && contextMenuRef().categories.length > 0 ? '0' : '-1',
                }}
            >
                {contextMenuRef().categories.map(({ category }, index) => {
                    return index === Object.keys(contextMenuRef().categories).length - 1 ?
                    (
                        <PrimaryMenu category={category}/>
                    ) : (
                        <>
                            <PrimaryMenu category={category}/>
                            <Divider/>
                        </>
                    )
                })}
            </div>
        </ContextMenuContext.Provider>
    )
}