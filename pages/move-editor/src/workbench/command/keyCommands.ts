import { CommandStack } from "./command"

export function bindUndoRedo() {
    window.addEventListener('keydown', e => {
        if (e.code === 'KeyZ' && e.ctrlKey) {
            e.preventDefault()
            return CommandStack.getCurrent().undo()
        }

        if (e.code === 'KeyY' && e.ctrlKey) {
            e.preventDefault()
            return CommandStack.getCurrent().redo()
        }
    })
}