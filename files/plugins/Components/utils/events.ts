export class Delegate<A extends any[] = []> {
    private _listener = Function.prototype

    bind(listener: (...args: A) => void) {
        this._listener = listener
    }

    call(...args: A) {
        this._listener(...args)
    }
}