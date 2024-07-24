const {affairToken, Affair, on, off} = require('./affair')
const enums = require('./enum')

const affairs = new Map()

const getXid = pl => {
    return pl.getScore(affairToken.xid)
}

function init() {

    for (const key in enums) {
        on(key, enums[key])
    }

    mc.listen('onScoreChanged', (pl, newScore, scoreName) => {
        const xid = getXid(pl)

        if (scoreName === affairToken.xid) {
            if (newScore == 0) {
                affairs.delete(xid)
                return
            }

            const _xid = newScore
            affairs.set(_xid, new Affair(_xid))
            return
        }

        if (scoreName === affairToken.form) {
            const recev = newScore
            const affair = affairs.get(xid)
            if (!affair) {
                return
            }
            if (recev == -1) {
                affair.onRecevAllArgs.call(affair, affair.form)
                return
            }
            affair.form.push(recev)
        }

    })
}

module.exports = {
    init
}