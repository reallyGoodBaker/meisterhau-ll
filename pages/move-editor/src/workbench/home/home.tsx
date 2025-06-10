import { createSignal, For, Suspense } from 'solid-js'
import styles from './home.module.css'
import File from '../file/file'
import Icon from '../../assets/fonts/icon'
import { useFileSystem } from '../file/fileHook'
import { useAlert } from '../../component/alert/useAlert'

const [ FilePickerPoper, fs, onLoad ] = useFileSystem()
const [ list, setList ] = createSignal([])

const MoveList = () => {
    onLoad(async () => {
        const list = await fs()?.readDirNames()
        setList(list as any)
    })

    return (
        <For each={list()}>
            {move => <File name={move}/>}
        </For>
    )
}

const AddFile = () => {
    const { Alert, setInfo, setOpen } = useAlert()
    

    return (
        <Alert
            ensure='添加'
            cancel='取消'
            onEnsure={() => {
                
            }}
        >

        </Alert>
    )
}

const Home = () => {
    return (
        <div class={styles.c}>
            <MoveList/>
            <div class={styles.header}>
                <Icon codePoint='e145' />
                <div>添加状态图</div>
            </div>
            <FilePickerPoper/>
        </div>
    )
}

export default Home