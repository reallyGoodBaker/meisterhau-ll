const { alert, Label, Input, Switch, Dropdown, action, widget } = require('../ui/index')
const { keys, query, edit, add } = require('./core')
const { requestCredit } = require('../credit/core')
const { n, ref, getControlledEntites, getVirtEntityLeader } = require('./virt')
const console = require('../console/main')
const newDB = require('../db.lib')
// const db = newDB('./data/orders/vendors')

function Menu() {
    return [
        '商家操作', '', [
            {
                text: '交付订单',
                onClick(_, pl) {
                    action(...DeliveryList(pl.xuid)).send(pl)
                }
            }
        ]
    ]
}

function DeliveryList(xuid) {
    const host = [xuid, ...getControlledEntites(xuid).map(e => 'virt:' + e)]
    const orders = host.map(vid => query({ vid, delivered: false })).flat()
    const btnGroup = orders.map(o => ({
        text: `${n(o.cid)} -${o.amount}-> ${n(o.vid)}`,
        onClick(_, pl) {
            widget(...Delivery(o)).send(pl)
        }
    }))

    return [
        '待交付', '', btnGroup
    ]
}

function getTargetUid(uid) {
    if (uid.startsWith('virt:')) {
        return getVirtEntityLeader(uid.slice(5))
    }

    return uid
}

function Delivery(o) {
    const delivered = o.attachments.slice(1).join('\n')

    return [
        '交付', [
            Label(`交付要求: ${o.attachments[0]}`),
            Label(`已交付: ${delivered || '无'}`),
            Input('交付内容:\n例如物品: [minecraft:glass*64], 金额: (1000), 指令: {time set day}, 使用","分开', '[minecraft:glass*1],(100)', '', (pl, val) => {
                const xuid = pl.xuid
                const handlers = []
                val.split(',').forEach(control => {
                    control = control.trim()
                    let result

                    if (result = /\((\d*?)\)/.exec(control)) {
                        const [_, amount] = result

                        handlers.push(() => {
                            if (money.get(xuid) >= +amount) {
                                money.trans(xuid, getTargetUid(o.cid), amount)
                                o.attachments.push(control)
                                edit(o.oid, o)
                            }
                        })
                        return
                    }

                    if (result = /\[(.*)\]/.exec(result)) {
                        return handlers.push(() => {
                            mc.runcmdEx(result[1])
                            o.attachments.push(control)
                            edit(o.oid, o)
                        })
                    }

                    const itemType = control.split(/[\*\^]/)[0].trim()
                    const count = +(/\*(\d+)/.exec(control) || [, '0'])[1].trim()
                    const tile = +(/\^(\d+)/.exec(control) || [, '0'])[1].trim()
                    const srcPl = mc.getPlayer(xuid)
                    const targetPl = mc.getPlayer(getTargetUid(o.cid))
                    const inv = srcPl.getInventory()
                    const target = targetPl.getInventory()

                    inv.getAllItems().forEach((item, i) => {
                        const targetItem = item.clone()

                        if (
                            item.type === itemType &&
                            item.aux === tile &&
                            item.count >= count
                        ) {
                            if (target.hasRoomFor(targetItem)) {
                                inv.removeItem(i, count)
                                target.addItem(targetItem, count)
                                o.attachments.push(control)
                                edit(o.oid, o)

                                srcPl.refreshItems()
                                targetPl.refreshItems()
                            }
                        }
                    })
                })
            })
        ]
    ]
}

module.exports = Menu