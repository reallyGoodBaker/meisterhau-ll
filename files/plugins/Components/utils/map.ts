export class NonNullMap<K, V> implements Map<K, V> {
    constructor(
        private readonly empty: () => V,
    ) {}

    clear(): void {
        this.map.clear()
    }

    delete(key: K): boolean {
        return this.map.delete(key)
    }

    forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void {
        this.map.forEach(callbackfn, thisArg)
    }

    get(key: K): V {
        const candidate = this.map.get(key)
        if (candidate === undefined || candidate === null) {
            const v = this.empty()
            this.map.set(key, v)
            return v
        }

        return candidate
    }

    set(key: K, value: V): this {
        this.map.set(key, value)
        return this
    }

    has(key: K): boolean {
        return this.map.has(key)
    }

    get size(): number {
        return this.map.size
    }

    entries() {
        return this.map.entries()
    }

    keys() {
        return this.map.keys()
    }

    values() {
        return this.map.values()
    }

    [Symbol.iterator]() {
        return this.map[Symbol.iterator]()
    }

    get [Symbol.toStringTag](): string {
        return this.map[Symbol.toStringTag]
    }

    private readonly map = new Map<K, V>()
}