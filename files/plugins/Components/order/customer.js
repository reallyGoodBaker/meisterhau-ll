const { alert, Input, Switch, Dropdown } = require('../ui/index')
const { keys, query, edit, add } = require('./core')
const { requestCredit } = require('../credit/core')
const { n, ref, getVirtEntityLeader } = require('./virt')
const console = require('../console/main')

function Menu() {
    return ['客户', '', [
        {
            text: '添加订单',
            onClick(err, pl) {
                if (err) {
                    return pl.tell('出错了')
                }

                this.openWidget(...Add()).send(pl)
            }
        },
        {
            text: '支付订单',
            onClick(err, pl) {
                if (err) {
                    return pl.tell('出错了')
                }

                this.openAction(...Payments(pl.xuid)).send(pl)
            }
        },
        {
            text: '确认交付',
            onClick(err, pl) {
                if (err) {
                    return pl.tell('出错了')
                }

                this.openAction(...Confirm(pl.xuid)).send(pl)
            }
        }
    ]]
}

function Add() {
    let useId = false,
        vendor,
        players = mc.getOnlinePlayers(),
        amount,
        request

    return ['添加', [
        Input('订单要求', '写出你对订单的要求，尽可能详细', '', (_, val) => request = val),
        Switch('使用虚拟商家标识符', false, (pl, val) => useId = val),
        Input('虚拟商家标识符', '如: "bank"', '', (pl, val) => vendor = 'virt:' + val),
        Dropdown('选择个人', players.map(p => p.name), 0, (pl, i) => {
            if (!useId) {
                vendor = players[i].xuid
            }
        }),
        Input('金额', '0', '', (pl, val) => {
            amount = isNaN(+val) ? 0 : +val

            add(vendor, pl.xuid, amount, false, false, [request])
            pl.tell('添加成功')
        })
    ]]
}

function Payments(xuid) {
    const data = query({
        cid: xuid,
        paied: false
    })

    const btnGroup = data.map(o => {
        return {
            text: `${n(o.cid)} -${o.amount}-> ${n(o.vid)}`,
            onClick() {
                requestCredit(
                    ref(o.vid),
                    '订购',
                    o.amount,
                    () => {
                        money.add(o.cid.startsWith('virt:') ? getVirtEntityLeader(n(o.cid)) : o.cid, o.amount)
                        o.paied = true
                        edit(o.oid, o)
                        ref(o.vid).tell('已完成支付')
                    }
                )
            }
        }
    })

    return [
        '待支付', '', btnGroup
    ]
}

function Confirm(xuid) {
    const data = query({
        cid: xuid,
        delivered: false
    })

    const btnGroup = data.map(o => {
        return {
            text: `${n(o.cid)} -${o.amount}-> ${n(o.vid)}`,
            onClick(_, pl) {
                alert('确认', '此订单已交付？', '是', '否', pl => {
                    o.delivered = true
                    edit(o.oid, o)
                    pl.tell('已确认交付')
                }).send(pl)
            }
        }
    })

    return [
        '确认交付', '', btnGroup
    ]
}

module.exports = {
    Menu
}