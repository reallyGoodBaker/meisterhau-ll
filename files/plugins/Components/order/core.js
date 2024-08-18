const newDB = require('../db.lib')
const db = newDB('./data/orders')

let nextId = db.get('__next_id__') ?? 0

function newOrder(vendorXuid, customerXuid, amount, paied=false, delivered=false, attachments=[]) {
    db.set('__next_id__', nextId++)
    return {
        oid: nextId, vid: vendorXuid, cid: customerXuid, amount, paied, delivered, attachments
    }
}

function add(vendorXuid, customerXuid, amount, paied=false, delivered=false, attachments=[]) {
    const o = newOrder(vendorXuid, customerXuid, amount, paied, delivered, attachments)
    const id = o.oid
    const cid = 'c' + customerXuid
    const vid = 'v' + vendorXuid

    db.set(id + '', o)
    db.set(cid, (db.get(cid) ?? []).concat([id]))
    db.set(vid, (db.get(vid) ?? []).concat([id]))
}

function edit(id, data) {
    const o = db.get(id)

    if (!o) {
        return false
    }

    db.set(id, Object.assign(o, data))

    return true
}

function paied(id) {
    return edit(id, { paied: true })
}

function delivered(id) {
    return edit(id, { delivered: true })
}

function filter(data, prop, _cond) {
    const cond = !Array.isArray(_cond)
        ? v => v === _cond
        : v => v >= _cond[0] && v < _cond[1]

    return data.filter(v => cond(v[prop]))
}

function nonenull(v) {
    return v !== null && v !== undefined
}

/**
 * @param {{[K in 'oid'|'cid'|'vid'|'amount'|'paied'|'delivered']?: any}} opt
 */
function query(opt) {
    let data = null

    if (opt.oid) {
        return [db.get(opt.oid)]
    }

    if (opt.cid) {
        data = (db.get('c' + opt.cid) ?? []).map(id => db.get(id))
    }

    if (opt.vid) {
        if (!data) {
            data = (db.get('v' + opt.vid) ?? []).map(id => db.get(id))
        } else {
            data = filter(data, 'vid', 'v' + opt.vid)
        }
    }

    if (!data) return null

    if (opt.amount) {
        data = filter(data, 'amount', opt.amount)
    }

    if (nonenull(opt.paied)) {
        data = filter(data, 'paied', opt.paied)
    }

    if (nonenull(opt.delivered)) {
        data = filter(data, 'delivered', opt.delivered)
    }

    return data
}

function removeElement(arr, el) {
    const set = new Set(arr)
    set.delete(el)
    return Array.from(set)
}

function remove(id) {
    const o = db.get(id)
    if (!o) {
        return false
    }

    const { cid, vid } = o
    db.delete(id)

    const kcid = 'c' + cid
    const kvid = 'v' + vid
    const cids = db.get(kcid)
    const vids = db.get(kvid)

    if (!cids || !vids) {
        return false
    }

    db.set(kcid, removeElement(cids, id))
    db.set(kvid, removeElement(vids, id))

    return true
}

function keys() {
    return db.listKey().filter(k => !isNaN(+k))
}

module.exports = {
    add, edit, paied, delivered, query, remove, keys
}