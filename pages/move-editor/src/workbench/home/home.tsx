import { createSignal, For, Suspense } from 'solid-js'
import styles from './home.module.css'
import File from '../file/file'
import Icon from '../../assets/fonts/icon'

const [ getList, setList ] = createSignal(await (await fetch('http://localhost:3001/list')).json() as any[])

const MoveList = () => {
    return (
        <For each={getList()}>
            {move => <File name={move}/>}
        </For>
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
        </div>
    )
}

export default Home