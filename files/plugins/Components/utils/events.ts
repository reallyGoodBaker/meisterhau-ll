export class Delegate<A extends any[] = []> {
    private _listener?: CallableFunction

    bind(listener: (...args: A) => void) {
        this._listener = listener
    }

    unbind() {
        this._listener = undefined
    }

    call(...args: A) {
        this._listener?.(...args)
    }
}