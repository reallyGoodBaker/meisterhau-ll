const { cmd } = require('../utils/command')
const newDB = require('../db.lib')
const db = newDB('./data/orders/virts')

function getVirtEntityLeader(name) {
    return db.get('v:' + name)
}

function getControlledEntites(xuid) {
    return db.get('c:' + xuid) || []
}

function addVirtEntites(xuid, ...entites) {
    let enArr = new Set(getControlledEntites(xuid))

    entites.forEach(e => {
        if (!getVirtEntityLeader(e)) {
            db.set(`v:${e}`, xuid)
            enArr.add(e)
        }
    })

    db.set('c:' + xuid, Array.from(enArr))
}

function deleteEntity(entity) {
    let xuid = getVirtEntityLeader(entity)
    let enArr = new Set(getControlledEntites(xuid))

    enArr.delete(entity)
    
    db.set('c:' + xuid, Array.from(enArr))
    db.delete('v:' + entity)
}

function setup() {
    const done = (pl, handler) => {
        try {
            handler.call(null)
            pl.tell('操作成功')
        } catch (_) {
            pl.tell(`操作失败\n${_.toString()}`)
        }
    }

    cmd('virtentity', '操作虚拟实体', 1).setup(register => {
        register('add <pl:player> <entites:string>', (_, ori, out, res) => {
            const pl = res.pl[0]
            done(pl, () => addVirtEntites(pl.xuid, ...res.entites.split(',').map(en => en.trim())))
        })
        register('delete <entity:string>', (_, ori, out, res) => {
            const pl = ori.player
            done(pl, () => deleteEntity(res.entity))
        })
        register('owner <entity:string>', (_, ori, out, res) => {
            ori.player.tell(mc.getPlayer(getVirtEntityLeader(res.entity)).name)
        })
        register('list <pl:player>', (_, ori, out, res) => {
            const pl = res.pl[0]
            ori.player.tell(getControlledEntites(pl.xuid).join('\n'))
            
        })
    })
}

function n(uid) {
    if (uid.startsWith('virt:')) {
        return uid.slice(5)
    }

    return mc.getPlayer(uid).name
}

function ref(uid) {
    let refUid = uid

    if (uid.startsWith('virt:')) {
        refUid = getVirtEntityLeader(uid.slice(5))
    }

    return mc.getPlayer(refUid)
}

module.exports = {
    getVirtEntityLeader,
    getControlledEntites,
    addVirtEntites,
    deleteEntity,
    setup,
    n, ref
}