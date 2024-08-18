const dbLib = require("../db.lib")
const { widget, Input } = require("../ui")
const db = dbLib('./data/trap')
const { splitStrings } = require('./batch')

function pos2str(pos) {
    return `${pos.x},${pos.y},${pos.z},${pos.dimid}`
}

function debounce(fn, wait = 1) {
    var timer = null
    return (...args) => {
        if (!timer) {
            fn.apply(null, args)

            timer = setTimeout(() => {
                timer = null
            }, wait)
        }
    }
}

const cooldowns = new Set()

function listenItemUse() {
    mc.listen('onUseItemOn', debounce((player, item, block) => {
        const pos = block.pos
        const id = pos2str(block.pos)
        let commands = db.get(id) || []

        if (cooldowns.has(id)) {
            return
        }

        if (item.type === 'ym:trap') {
            /**@type {string}*/
            let strs = []
            widget('设置陷阱', [
                Input('添加指令', '', commands[0] || '', (pl, v) => strs[0] = v),
                Input('添加指令', '', commands[1] || '', (pl, v) => strs[1] = v),
                Input('添加指令', '', commands[2] || '', (pl, v) => strs[2] = v),
                Input('添加指令', '', commands[3] || '', (pl, v) => {
                    strs[3] = v
                    db.set(id, strs)
                })
            ]).send(player)

            return
        }

        commands = commands.join('').split(/\\\\/g)
        for (const cmd of commands) {
            const [cond, res] = cmd.split('|>')
            const [then, or] = (res ?? '').split(':>')

            const condVal = runSequnces(cond, pos, player)
            if (then && condVal) {
                runSequnces(then, pos, player)
                continue
            }

            if (or && !condVal) {
                runSequnces(or, pos, player)
                continue
            }
        }

        cooldowns.add(id)
        setTimeout(() => cooldowns.delete(id), 500)
    }), 500)
}

function runSequnces(seq, pos, pl) {
    const seqs = seq.split('&&')
    let seqReturnVal = true

    for (const item of seqs) {
        seqReturnVal = mc.runcmdEx(`execute positioned ${pos.x} ${pos.y} ${pos.z} as "${pl.name}" run ${item}`).success

        if (!seqReturnVal) {
            return seqReturnVal
        }
    }

    return seqReturnVal
}

module.exports = {
    listenItemUse
}
