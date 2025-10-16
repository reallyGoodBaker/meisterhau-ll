export class Optional<T = any> {

    static none<T>(): Optional<T> {
        return optionalNone as any
    }

    static some<T>(value: T | Optional<T> | null | undefined): Optional<T> {
        if (value instanceof Optional) {
            return value
        }

        return new Optional(value) as any
    }

    constructor(
        private value: T
    ) {}

    unwrap(): T {
        if (!this.isEmpty()) {
            return this.value
        }

        throw new Error(`Optional is empty\n${new Error().stack}`)
    }

    isEmpty(): boolean {
        return this.value === void 0 || this.value === null
    }

    orElse(other: T): T {
        return this.value ?? other
    }

    use(fn: (v: T) => void, self?: any) {
        if (!this.isEmpty()) {
            fn.call(self, this.value)
            return true
        }

        return false
    }

    match<R>(
        none: R | (() => R),
        some: (v: T) => R,
    ): R {
        if (this.isEmpty()) {
            // @ts-ignore
            return none.call ? none() : none
        }

        return some(this.value)
    }
}

const optionalNone = new Optional(null)