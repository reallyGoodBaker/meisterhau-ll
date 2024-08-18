const { action, alert, widget, Dropdown, Input } = require('../ui')
const { Notification, NotificationImportances } = require('../notification')

function queryPlayer(realName) {
    for (const pl of mc.getOnlinePlayers()) {
        if (pl.realName === realName) {
            return pl
        }
    }

    return null
}

const creditNormal = {
    transfer: transferCredit,
    balance: showBalance,
}

const creditOp = {
    add: addCreditOp,
    reduce: reduceCreditOp,
    set: setCreditOp,
}

function checkIfCreditEnough(pl, need) {
    return money.get(pl.xuid) >= need
}

function showBalance(pl) {
    pl.tell(`你的余额: §6${money.get(pl.xuid)}`)
}

function recevConfirm(pl2, amount) {
    const notif = new Notification()
    notif.title = '收账确认'
    notif.preview = `来自 §b${pl2.realName}§r 的转账 §6${amount}§r, 确认收账？`
    notif.importance = NotificationImportances.IMPORTANT
    notif.content = {
        btn1: '确认', btn2: '取消',
        onEnsure(pl) {
            notif.expire()
            money.trans(pl2.xuid, pl.xuid, amount)
            const suc = alert('结果', '操作成功', '确认', '取消')
            suc.send(pl)
            suc.send(pl2)
        },

        onReject(pl) {
            notif.expire()
            const fail = alert('结果', '操作失败', '确认', '取消')
            fail.send(pl)
            fail.send(pl2)
        }
    }

    return notif
}

function transferConfirm(name, amount) {
    return alert('转账确认', `向 §b${name}§r 转账 §6${amount}§r, 确认操作？`, '确认', '取消', pl => {
        const pl2 = queryPlayer(name)
        if (!checkIfCreditEnough(pl, amount)) {
            return alert('失败', `余额不足: ${money.get(pl.xuid)}, 需要: ${amount}`, '确认', '取消').send(pl)
        }
        recevConfirm(pl, amount).notify(pl2)
    })
}

function transferCredit(pl, name, amount) {
    amount = +amount
    transferConfirm(name, amount).send(pl)
}

function setCreditOp(pl, name, amount) {
    if (money.set(queryPlayer(name).xuid, +amount)) {
        pl.tell('操作成功')
    } else {
        pl.tell('操作失败')
    }
}

function addCreditOp(pl, name, amount) {
    if (money.add(queryPlayer(name).xuid, +amount)) {
        pl.tell('操作成功')
    } else {
        pl.tell('操作失败')
    }
}

function reduceCreditOp(pl, name, amount) {
    if (money.reduce(queryPlayer(name).xuid, +amount)) {
        pl.tell('操作成功')
    } else {
        pl.tell('操作失败')
    }
}

function requestFromUi(pl) {
    const pls = mc.getOnlinePlayers()

    let data = {
        who: -1,
        amount: 0
    }

    widget('收款', [
        Dropdown('向他人收款', pls.map(p => p.realName), 0, (_, i) => {
            data.who = pls[i]
        }),
        
        Input('金额', '', '', (_, val) => {
            data.amount = isNaN(+val)? 0 : +val

            if (data.amount <= 0 || !data.who) {
                return
            }

            const target = data.who
            requestCredit(target, `付款给 ${pl.realName}`, data.amount, () => {
                target.tell('付款成功')
                pl.tell('收款成功')
            }, defaultRequestCreditFailed, () => {
                target.tell('付款失败')
                pl.tell('收款失败')
            })
        }),
    ]).send(pl)
}

function creditUi(pl) {
    const ui = action('账户', `我的余额: ${money.get(pl.xuid)}`, [
        {
            text: '进行转账', onClick() {
                transferCreditUi(ui).send(pl)
            }
        },

        {
            text: '收款', onClick() {
                requestFromUi(pl)
            }
        }
    ], (err, pl) => {
        pl.tell('取消操作')
    })

    ui.send(pl)
}

function transferCreditUi(parent) {
    const pls = mc.getOnlinePlayers().map(v => v.realName)
    let name = ''

    return widget('向目标转账', [
        Dropdown('选择转账目标', pls, (_, i) => {
            name = pls[i]
        }),
        Input('数量', (pl, amount) => {
            transferCredit.call(null, pl, name, amount)
        }),
    ], (err, pl) => {
        pl.tell('设置失败')

        if (parent) {
            parent.send(pl)
        }
    })
}

function creditOpUi(pl) {
    const pls = mc.getOnlinePlayers().map(v => v.realName)
    const op = ['set', 'add', 'reduce']

    const fm = mc.newCustomForm()
        .addDropdown('目标玩家', pls)
        .addDropdown('操作', op)
        .addInput('数量')

    pl.sendForm(fm, (_, data) => {
        if (!data) {
            return pl.tell('设置失败')
        }
        const [name, func, amount] = data
        creditOp[op[func]].call(null, pl, pls[name], amount)
        pl.tell('设置成功')
    })
}

function doRegisterCredit() {
    mc.regPlayerCmd('credit', `<transfer|balance> [name] [amount]`, (pl, [func, name, amount]) => {
        if (!func) {
            return creditUi(pl)
        }

        if (!name && func === 'transfer') {
            return transferCreditUi().send(pl)
        }

        if (creditNormal[func]) {
            creditNormal[func].call(null, pl, name, amount)
        }
    })

    mc.regPlayerCmd('creditop', `<set|add|reduce> <name> <amount>`, (pl, [func, name, amount]) => {
        if (!func) {
            creditOpUi(pl)
        }

        if (creditOp[func]) {
            creditOp[func].call(null, pl, name, amount)
        }
    }, 1)
}

const defaultRequestCreditFailed = (pl, amount) => {
    pl.tell(`余额不足\n§4${money.get(pl.xuid)} < ${amount}`)
}

function requestCredit(
    fromPlayer,
    serviceName,
    amount,
    success,
    failure = defaultRequestCreditFailed,
    cancel = Function.prototype
) {
    alert('账户', `为 §b${serviceName}§r 支付 §6${amount}§r ?`, '确认', '取消', async () => {
        if (checkIfCreditEnough(fromPlayer, amount)) {
            try {
                await success.call(null, fromPlayer)
                money.reduce(fromPlayer.xuid, amount)
                return
            } catch (_) { }
        }

        await failure.call(null, fromPlayer, amount)
    }, cancel).send(fromPlayer)
}

module.exports = {
    doRegisterCredit, transferCredit, requestCredit, defaultRequestCreditFailed
}