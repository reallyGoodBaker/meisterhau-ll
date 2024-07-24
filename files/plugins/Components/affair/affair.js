const {EventEmitter} = require('../events')
const em = new EventEmitter()

const affairToken = {
    form: 'affair_form',
    result: 'affair_result',
    xid: 'affair_xid',
}

function getScoreboard(name) {
    let sc = null
    if (sc = mc.getScoreObjective(name)) {
        return sc
    }
    return mc.newScoreObjective(name, name)
}

function getAffairTarget(xid) {
    const pls = mc.getOnlinePlayers()

    for (const pl of pls) {
        if (pl.getScore(affairToken.xid) == xid) {
            return pl
        }
    }

    return null
}

let formUpload = null,
    result = null,
    xid = null

mc.listen('onServerStarted', () => {
    formUpload = getScoreboard(affairToken.form),
    result = getScoreboard(affairToken.result),
    xid = getScoreboard(affairToken.xid)
})


class Affair {

    xid = 0
    form = []
    operation = 0
    target = null

    constructor(xid) {
        xid = xid + ''
        this.xid = +xid
        this.operation = +(xid.slice(0, -3))
        this.target = getAffairTarget(xid)
    }

    onRecevAllArgs(args) {
        em.emit(this.operation, this, ...args)
    }

    writeResult(score) {
        result.setScore(this.target, score)
    }

    close() {
        formUpload.setScore(this.target, 0)
        result.setScore(this.target, 0)
        xid.setScore(this.target, 0)
    }

}


module.exports = {
    Affair, affairToken,
    on(type, handler) {
        em.on(type, handler)
    },
    off(type, handler) {
        em.off(type, handler)
    }
}