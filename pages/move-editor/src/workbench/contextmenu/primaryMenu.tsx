import { For, useContext } from 'solid-js'
import { ContextMenuCategory, ContextMenuContext } from './cmProvider';
import style from './style.module.css'

export function PrimaryMenu({ category }: { category: ContextMenuCategory }) {
    const menu = useContext(ContextMenuContext)!

    return (
        <For each={Object.entries(category)}>
            {([ name, item ], index) => {
                if (typeof item === 'function') {
                    return (
                        <div class={style.menu_item} onClick={() => {
                            item(menu.close)
                        }}>{ name }</div>
                    )
                } else {
                    return (
                        // TODO
                        <div></div>
                    )
                }
            }}
        </For>
    )
}