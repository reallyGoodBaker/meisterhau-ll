const { Notification, NotificationImportances } = require('../notification')
const { action, alert, widget, Dropdown, Input } = require('../ui')
const { pay3rdAmount, getFamiliesNullable, selectFamiliyMember } = require('marriage/core')

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

function recevConfirm(pl2, amount, onEnsure=Function.prototype, onReject=Function.prototype) {
    const notif = new Notification()
    notif.title = '收账确认'
    notif.preview = `来自 §b${pl2.realName}§r 的转账 §6${amount}§r, 确认收账？`
    notif.importance = NotificationImportances.IMPORTANT
    notif.content = {
        btn1: '确认', btn2: '取消',
        onEnsure(pl) {
            notif.expire()
            onEnsure(pl)
        },

        onReject(pl) {
            notif.expire()
            onReject(pl)
            // const fail = alert('结果', '操作失败', '确认', '取消')
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
        recevConfirm(pl, amount, () => {
            money.trans(pl.xuid, pl2.xuid, amount)
            const suc = alert('结果', '操作成功', '确认', '取消')
            suc.send(pl)
            suc.send(pl2)
        }, () => {
            const fail = alert('结果', '操作失败', '确认', '取消')
            fail.send(pl)
            fail.send(pl2)
        }).notify(pl2)
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

function familyTransfer(pl) {
    const pls = mc.getOnlinePlayers()
    const names = pls.map(p => p.name)

    let pl2 = null

    widget('家庭转账', [
        Dropdown('选择转账目标', names, (_, i) => {
            pl2 = pls[i]
        }),
        Input('金额', '', '0', async (_, v) => {
            v = +v

            const member = await selectFamiliyMember(pl)

            if (!member) {
                return alert('失败', '转账失败', '确认', '取消').send(pl)
            }

            const strategy = pay3rdAmount(v, pl.xuid, member.xuid)
            if (!strategy) {
                return alert('失败', '转账失败', '确认', '取消').send(pl)
            }

            const [ ,b ] = strategy
            recevConfirm(pl2, v, () => {
                money.trans(member.xuid, pl.xuid, b)
                money.trans(pl.xuid, pl2.xuid, v)

                alert('成功', '转账成功', '确认', '取消').send(pl)
                const notification = new Notification()
                notification.title = '家庭转账'
                notification.preview = notification.content = `${pl.name} 使用了你 ${b} 的余额, 转账 ${v} 给 ${pl2.name}`
                const memberPlayer = mc.getPlayer(member.xuid)
                notification.notify(memberPlayer ?? member)
            }, () => {
                alert('失败', '转账失败', '确认', '取消').send(pl)
            }).notify(pl2)

        }),

    ]).send(pl)
}

function creditUi(pl) {
    const ui = action('账户', `我的余额: ${money.get(pl.xuid)}`, [
        {
            text: '转账', onClick() {
                transferUi(pl)
            }
        },

        {
            text: '收款', onClick() {
                requestUi(pl)
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

function familyRequest(
    fromFamily,
    serviceName,
    amount,
    onsuccess = Function.prototype,
    onfail = Function.prototype,
) {
    if (!getFamiliesNullable(fromFamily.xuid)) {
        return onfail(fromFamily)
    }

    const family = selectFamiliyMember(fromFamily.xuid)
    if (!family) {
        return onfail(fromFamily)
    }

    const strategy = pay3rdAmount(amount, fromFamily.xuid, family.xuid)
    if (!strategy) {
        return onfail(fromFamily)
    }

    const [ a, b ] = strategy

    alert('账户', `为 §b${serviceName}§r 支付 §6${a}§r ?\n(家庭代付 ${b})`, '确认', '取消', () => {
        try {
            onsuccess(fromFamily)
            money.reduce(fromFamily.xuid, a)
            money.reduce(family.xuid, b)
        } catch {
            onfail(fromFamily)
        }
    }, onfail).send(fromFamily)
}

function transferUi(pl) {
    if (!getFamiliesNullable(pl.xuid)) {
        return transferCreditUi().send(pl)
    }

    return action('账户', '选择支付方式', [
        {
            text: '个人账户',
            onClick() {
                transferCreditUi().send(pl)
            }
        },
        {
            text: '家庭账户',
            onClick() {
                familyTransfer(pl)
            }
        }
    ]).send(pl)
}

function requestFamilyUi(pl) {
    const pls = mc.getOnlinePlayers()

    let data = {
        who: -1,
        amount: 0
    }

    widget('收款', [
        Dropdown('向他人收款', pls.map(p => p.name), 0, (_, i) => {
            data.who = pls[i]
        }),
        
        Input('金额', '', '', (_, val) => {
            data.amount = isNaN(+val)? 0 : +val

            if (data.amount <= 0 || !data.who) {
                return
            }

            const target = data.who
            familyRequest(target, `付款给 ${pl.realName}`, data.amount, () => {
                target.tell('付款成功')
                pl.tell('收款成功')
            }, defaultRequestCreditFailed, () => {
                target.tell('付款失败')
                pl.tell('收款失败')
            })
        }),
    ]).send(pl)
}

function requestUi(pl) {
    if (!getFamiliesNullable(pl.xuid)) {
        return requestFromUi(pl)
    }

    return action('账户', '选择收款方式', [
        {
            text: '个人账户',
            onClick() {
                requestFromUi(pl)
            }
        },
        {
            text: '家庭账户',
            onClick() {
                requestFamilyUi(pl)
            }
        }
    ])
}

module.exports = {
    doRegisterCredit, transferCredit, requestCredit, defaultRequestCreditFailed,
    familyTransfer, familyRequest, transferUi, requestUi,
}