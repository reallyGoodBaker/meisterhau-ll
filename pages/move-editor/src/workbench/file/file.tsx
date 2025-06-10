import { A } from '@solidjs/router'
import Icon from '../../assets/fonts/icon'
import { addPage } from '../main/pager'
import styles from './file.module.css'
import { createSignal, onMount, useContext } from 'solid-js'
import { ContextMenuContext } from '../contextmenu/cmProvider'
import { useFileSystem } from './fileHook'

const [ ,fs ] = useFileSystem()

export enum FileIconCodePoints {
    fsm = 'f3a0',
    animclip = 'f3a1',
}

const File = ({ name} = { name: '' }) => {
    let el: any

    const [ value, setValue ] = createSignal<any>({})

    onMount(async () => {
        const file = await fs()?.readFile(name)
        const data = JSON.parse(await file?.text() || '{}')
        setValue(data)
    })

    const contextMenu = useContext(ContextMenuContext)!
    const open = () => {
        contextMenu.addCategory('File', {
            async 删除(close) {
                // await fetch(`http://localhost:3001/delete/${name}`)
                fs()?.remove(name)
                ;(el as HTMLAnchorElement).remove()
                close()
            },
            async 重命名(close) {
                // TODO: 重命名功能
                close()
            },
        })
        .beforeClose(() => contextMenu.removeCategory('File'))
        .open()
    }

    return (
        <A ref={el} onContextMenu={open} href={`${value().type}/${name}`}>
            <div class={styles.file} onClick={() => addPage({
                name,
                path: `${value().type}/${name}`,
                icon: value().type.toLowerCase()
            })}>
                <Icon fontSize='larger' codePoint='f3a0' />
                <div>{name}</div>
            </div>
        </A>
    )
}
export default File