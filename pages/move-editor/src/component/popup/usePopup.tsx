import { createEffect, createSignal, onMount, Show } from "solid-js"
import styles from './style.module.css'

export function usePopup() {
    const [open, setOpen] = createSignal(false)
    let ref: HTMLDialogElement | undefined

    // 定义一个名为Popup的函数组件，接收一个children参数
    const Popup = ({ children }: any) => {
        return (
            <Show when={open()}>
                <dialog ref={ref} class={styles.poper}>
                    {children}
                </dialog>
            </Show>
        )
    }

    return [
        Popup,
        setOpen,
    ] as const
}