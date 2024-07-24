module.exports = path => {
    const _db = new KVDatabase(path)

    const db = {
        get(k) {
            return _db.get(String(k))
        },

        set(k, v) {
            return _db.set(String(k), v)
        },

        delete(k) {
            return _db.delete(String(k))
        },

        listKey() {
            return _db.listKey()
        }
    }

    return db
}