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
        },

        init(k, defaultVal) {
            let candidate = _db.get(k)
            if (!candidate) {
                _db.set(k, defaultVal)
                return defaultVal
            } else {
                return candidate
            }
        }
    }

    return db
}