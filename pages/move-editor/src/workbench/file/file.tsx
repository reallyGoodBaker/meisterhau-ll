import { A } from '@solidjs/router'
import Icon from '../../assets/fonts/icon'
import { addGraphPage } from '../main/pager'
import styles from './file.module.css'
import { useContext } from 'solid-js'
import { ContextMenuContext } from '../contextmenu/cmProvider'

const File = ({ name }: any) => {
    let el: any

    const contextMenu = useContext(ContextMenuContext)!
    const open = () => {
        contextMenu.addCategory('File', {
            async 删除(close) {
                await fetch(`http://localhost:3001/delete/${name}`)
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
        <A ref={el} onContextMenu={open} href={name}>
            <div class={styles.file} on:click={() => addGraphPage(name, name)}>
                <Icon fontSize='larger' codePoint='f3a0' />
                <div>{name}</div>
            </div>
        </A>
    )
}
export default File