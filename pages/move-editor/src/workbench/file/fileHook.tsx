import { createSignal, Show, Suspense } from 'solid-js'
import { FileSystem } from '../../browser/fileSystem'
import { useAlert } from '../../component/alert/useAlert'
import AlertBtnStyle from '../../component/alert/style.module.css'
import { open } from '../../browser/db'

let fs: FileSystem | null = null
const { Alert, setOpen, setInfo } = useAlert()
const [ useHistory, setUseHistory ] = createSignal(false)

export const [ getList, setList ] = createSignal()

export function useFileSystem() {
    let fsLoaded = Function.prototype

    const callFsLoaded = async () => {
        try {
            await fsLoaded()
        } catch (e) {
            console.log(e)
            setOpen(true)
        }
    }

    const FilePickerPoper = () => (
        <>
            <Alert
                ensure='选择文件夹'
                info='选择一个文件夹保存数据'
                onEnsure={async () => {
                    fs = await FileSystem.fromDirPicker()
                    if (fs) {
                        setOpen(false)
                        callFsLoaded()
                    } else {
                        setInfo('选择失败，请重试')
                    }
                }}>
                <Show when={useHistory()}>
                    <button onClick={callFsLoaded} class={`${AlertBtnStyle.button} ${AlertBtnStyle.accent}`}>
                        <div style={{ 'margin-right': '4px' }}>上一次打开的文件夹</div>
                        <b>"{fs?.root.name}"</b>
                    </button>
                </Show>
            </Alert>
        </>
    )

    FileSystem.fromHistory().then(_fs => {
        if (_fs) {
            fs = _fs
            setUseHistory(true)
            callFsLoaded()
        }
    })

    return [
        FilePickerPoper,
        (fn?: (fs: FileSystem) => void) => {
            if (fs && fn) {
                fn(fs)
            }

            return fs
        },
        (fn: Function) => fsLoaded = fn
    ] as const
}