import {
    clear, createStore, get, set, getMany, setMany,
    update, del, delMany, keys, values, entries, UseStore
} from './base'

const idbInstances = new Map<string, IdbKeyValStore>()

function getInstance(name: string) {
    let instance: IdbKeyValStore | undefined

    if (instance = idbInstances.get(name)) {
        return instance
    }

    idbInstances.set(name, instance = new IdbKeyValStore(name))

    return instance
}

class IdbKeyValStore {

    private readonly customStore: UseStore
    constructor(name: string) {
        this.customStore = createStore(name + '-db', name + '-store')
    }

    async clear() {
        await clear(this.customStore)
    }

    async get(key: IDBValidKey) {
        return await get(key, this.customStore)
    }

    async set(key: IDBValidKey, value: any) {
        return await set(key, value, this.customStore)
    }

    async getMany(keys: IDBValidKey[]) {
        return await getMany(keys, this.customStore)
    }

    async setMany(entries: [IDBValidKey, any][]) {
        return await setMany(entries, this.customStore)
    }

    async update(key: IDBValidKey, updater: (oldValue: any) => any) {
        return await update(key, updater, this.customStore)
    }

    async del(key: IDBValidKey) {
        return await del(key, this.customStore)
    }

    async delMany(keys: IDBValidKey[]) {
        return await delMany(keys, this.customStore)
    }

    async keys() {
        return await keys(this.customStore)
    }

    async values() {
        return await values(this.customStore)
    }

    async entries() {
        return await entries(this.customStore)
    }

}

export function open(name: string) {
    return getInstance(name)
}

export const db = open('editor-db') 