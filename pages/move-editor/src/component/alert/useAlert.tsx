import { Component, createSignal, JSX } from "solid-js"
import { usePopup } from "../popup/usePopup"
import styles from './style.module.css'

export type Alert = Component<{
    // 确认按钮文字
    readonly ensure?: string
    // 取消按钮文字
    readonly cancel?: string
    // 弹窗内容
    info?: string
    onEnsure?: () => void
    onCancel?: () => void
    children?: JSX.Element
}>


export function useAlert() {
    const [ Popup, setOpen ] = usePopup()
    const [ info, setInfo ] = createSignal('')

    const Alert: Alert = props => {
        setInfo(props.info ?? '')

        return (
            <Popup>
                <div>{info()}</div>
                {props.children}
                <div style={{
                    display: 'flex',
                    'flex-direction': 'column',
                    "justify-content": 'center',
                    'align-items': 'center',
                    width: '100%',
                    gap: '4px',
                }}>
                    <button class={`${styles.button} ${styles.accent}`} onClick={props.onEnsure ?? Function.prototype as any}>{props.ensure ?? '确认'}</button>
                    <button class={`${styles.button}`} onClick={props.onCancel ?? Function.prototype as any}>{props.cancel ?? '取消'}</button>
                </div>
            </Popup>
        )
    }

    return {
        Alert,
        setOpen,
        setInfo
    }
}