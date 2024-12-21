import styles from './tab.module.css'
import Icon from '../../assets/fonts/icon'
import { to, usePager, useTab } from '../main/pager'
import { Show } from 'solid-js'
import { useNavigate } from '@solidjs/router'

export interface Tab {
    name: string
    path: string
    persist?: boolean
}

const Tab = ({ tab }: { tab: Tab }) => {
    const [ currentTab, setTab ] = useTab() as any[]
    const nav = useNavigate()

    return (
        <div class={styles['tab-container']}>
            <div
                class={`i ${styles.tab} ${currentTab() === tab ? styles.selected : ''}`}
                on:click={() => {
                    if (currentTab() !== tab) {
                        setTab(tab)
                        to(tab.path, nav)
                    }
                }}
            >
                <Icon codePoint={tab.persist ? 'e88a' : 'f3a0'} />
                {tab.name}
                <Show when={!tab.persist} fallback={<div style="width: 8px;"></div>}>
                    <div class={styles.btn} on:click={ev => {
                        ev.stopPropagation()
                        usePager().close(tab.name, nav)
                    }}>
                        <Icon codePoint='e5cd' />
                    </div>
                </Show>
            </div>
        </div>
    )
}

export default Tab