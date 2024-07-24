const { cmd } = require('../command')
const { action, widget, Label, Input, Switch, Dropdown, StepSlider } = require('../ui/index')
const { keys, query, edit, add, remove } = require('./core')
const { n } = require('./virt.js')
const console = require('../console/main')

const EditOrder = order => [
    `修改订单`, [
        Label(`订单编号: ${order.oid}`),
        Label(`顾客：${n(order.cid)}`),
        Label(`商家：${n(order.vid)}`),
        Input('价格', '', `${order.amount}`, (_, v) => order.amount = parseFloat(v)),
        Switch('已支付', order.paied, (_, v) => order.paied = v),
        Switch('已交付', order.delivered, (_, v) => {
            order.delivered = v

            edit(order.oid, order)
        }),
    ]
]

const ConfirmDelete = order => [
    '确认', `删除订单 ${order.oid} ?`, '是', '否', pl => {
        remove(order.oid)
        pl.tell('删除成功')
    }, pl => pl.tell('删除失败')
]

const ManageOrder = order => {
    return [
        '管理订单', '', [
            {
                text: '编辑', onClick(_, pl) {
                    this.openWidget(...EditOrder(order)).send(pl)
                }
            },
            {
                text: '删除', onClick(_, pl) {
                    this.openAlert(...ConfirmDelete(order)).send(pl)
                }
            }
        ]
    ]
}

function listOrders(pl) {
    if (!pl) {
        return
    }

    const list = keys()

    if (!list.length) {
        return pl.tell('无订单')
    }

    action('列表', '', list.map(k => ({
        text: k,
        onClick(_, pl) {
            const order = query({ oid: k })[0]
            action(...ManageOrder(order)).send(pl)
        }
    }))).send(pl)
}

function addOrder(pl) {
    const pls = mc.getOnlinePlayers()
    const plsStr = pls.map(p => p.name)

    let cid, vid, amount, paied, delivered

    widget(`修改订单`, [
        Dropdown('顾客', plsStr, 0, (_, i) => cid = pls[i].xuid),
        Dropdown('商家', plsStr, 0, (_, i) => vid = pls[i].xuid),
        Input('价格', '', '0', (_, v) => amount = parseFloat(v)),
        Switch('已支付', false, (_, v) => paied = v),
        Switch('已交付', false, (_, v) => {
            delivered = v

            add(vid, cid, amount, paied, delivered)
        }),
    ]).send(pl)
}

function queryOrder(pl) {
    const q = {}
    const pls = mc.getOnlinePlayers()
    const plsNames = ['无', ...pls.map(p => p.realName)]
    const checkLabels = ['未知', '是', '否']

    widget('查询订单', [
        Input('订单id', '', '', (_, v) => {
            if (v) {
                q.oid = v.trim()
            }
        }),

        Dropdown('客户id', plsNames, 0, (_, i) => {
            if (i) {
                q.cid = pls[i-1].xuid 
            }
        }),

        Dropdown('商家id', plsNames, 0, (_, i) => {
            if (i) {
                q.vid = pls[i-1].xuid
            }
        }),

        Input('价格', '数字如：100 或 范围如 10..100', '', (_, v) => {
            if (v) {
                if (v.includes('..')) {
                    let [ min, max ] = v.split('..')
                    min = isNaN(+min)? -Infinity: +min
                    max = isNaN(+max)? Infinity: +max
                    q.amount = [min, max]
                } else {
                    q.amount = parseFloat(v) || 0
                }
            }
        }),

        StepSlider('已支付', checkLabels, (_, v) => {
            if (v) {
                q.paied = v < 2
            }
        }),

        StepSlider('已交付', checkLabels, function(pl, v) {
            if (v) {
                q.delivered = v < 2
            }

            const result = query(q)
            if (!result || !result.length) {
                return pl.tell('无结果')
            }

            action('查询结果', '', result.map(o => {
                return {
                    text: `${o.oid} ${
                        n(o.cid)
                    } -§5${o.amount}§r-> ${
                        n(o.vid)
                    }`,
                    onClick(_, pl) {
                        action(...ManageOrder(o)).send(pl)
                    }
                }
            })).send(pl)
        }),
    ], (_, e) => console.log(e)).send(pl)
}

function setupOrder() {
    cmd('orderop', '管理订单', 1)
    .setup(registry => {
        registry
        .register('list', (_, { player }) => {
            listOrders(player)
        })
        .register('add', (_, { player }) => addOrder(player))
        .register('query', (_, { player }) => queryOrder(player))


        registry.submit()
    })
}

module.exports = setupOrder