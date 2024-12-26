import { Component, For, onMount } from "solid-js"
import styles from './main.module.css'
import Tab from '../tab/tab'
import { defaultTab, tabs, useTab } from "./pager"
import { useLocation, useNavigate} from "@solidjs/router"

const Main: Component = (props: any) => {
    onMount(() => {
        const [ _, setTab ] = useTab()
        setTab(tabs.find(t => t.name === defaultTab.name) as any)

        if (useLocation().pathname !== '/') {
            useNavigate()('/')
        }
    })

    return (
        <>
            <div class={styles.container}>
                <For each={tabs}>
                    {tab => <Tab tab={tab} />}
                </For>
            </div>
            <div class={styles.content} id="content">
            {props.children}
            </div>
        </>
    )
}

export default Main