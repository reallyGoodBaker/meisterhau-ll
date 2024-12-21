import { A } from '@solidjs/router'
import Icon from '../../assets/fonts/icon'
import { addGraphPage } from '../main/pager'
import styles from './file.module.css'

const File = ({ name }: any) =>
<A href={name}>
    <div class={styles.file} on:click={() => addGraphPage(name, name)}>
        <Icon fontSize='larger' codePoint='f3a0' />
        <div>{name}</div>
    </div>
</A>

export default File