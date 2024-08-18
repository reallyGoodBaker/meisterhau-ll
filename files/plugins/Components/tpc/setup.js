const {widget, action, Input, Switch, alert} = require('../ui')
const {requestCredit} = require('../credit/core')
const priceConf = require('../../ServerConfig/price')
const {defaultHome} = require('../../ServerConfig/baseConfig')

const RECORDS_PATH = './plugins/Components/tpc/ports.data'
const portRecords = File.readFrom(RECORDS_PATH)
    ? JSON.parse(File.readFrom(RECORDS_PATH))
    : {}

function getDeadPos(pl) {
    const nbt = pl.getNbt()

    const x = nbt.getData('DeathPositionX'),
        y = nbt.getData('DeathPositionY'),
        z = nbt.getData('DeathPositionZ'),
        dim = nbt.getData('DeathDimension')

    if (x === null) {
        return null
    }

    return {
        x, y, z, dim
    }
}

function getRespawnPos(pl) {
    const nbt = pl.getNbt()

    let x = nbt.getData('SpawnX'),
        y = nbt.getData('SpawnY'),
        z = nbt.getData('SpawnZ'),
        dim = nbt.getData('SpawnDimension')

    if (x === null) {
       x = defaultHome.x
       y = defaultHome.y
       z = defaultHome.z
       dim = defaultHome.dimid 
    }

    return {
        x, y, z, dim
    }
}

function savePort(name, player, pos) {
    const record = portRecords[player.xuid] || {}

    record[name] = {
        x: pos.x,
        y: pos.y,
        z: pos.z,
        dimid: pos.dimid
    }

    portRecords[player.xuid] = record

    File.writeTo(RECORDS_PATH, JSON.stringify(portRecords))
}

function getPort(name, player) {
    const record = portRecords[player.xuid]

    if (!record) {
        return null
    }

    return record[name] || null
}

function removePort(name, player) {
    const record = portRecords[player.xuid]
    if (!record || !record[name]) {
        return
    }
    delete record[name]
    
    File.writeTo(RECORDS_PATH, JSON.stringify(portRecords))
}

function listPorts(player) {
    const record = portRecords[player.xuid]

    if (!record) {
        return []
    }

    return Object.keys(record)
}

function netherToMainWorld(pos) {
    return {
        x: pos.x * 8,
        y: pos.y,
        z: pos.z * 8,
        dimid: 0
    }
}

function teleportPlayerToCustomPos(pl, name) {
    const currentPos = pl.blockPos
    const targetPos = getPort(name, pl)

    if (!targetPos) {
        return alert('错误', `${pl.realName} 没有保存名为 ${name} 的传送点`, '确定', '取消').send(pl)
    }

    let amount = calcAmountByPos(currentPos, targetPos)

    requestCredit(pl, `传送到: ${name}`, amount, () => {
        pl.teleport(targetPos.x, targetPos.y, targetPos.z, targetPos.dimid)
        pl.tell('传送成功')
    })
}

function requestAddPort(pl, name, pos) {
    const {saveTeleport} = priceConf
    requestCredit(pl, saveTeleport.name, saveTeleport.price, () => {
        savePort(name, pl, pos)
    })
}

function showAddPortUi(pl) {
    let name = '',
        useCurrent = false,
        pos = null

    const cp = pl.blockPos

    widget('添加传送点', [
        Input('传送点名称', (_, value) => {
            name = value
        }),

        Switch(`使用当前坐标 (${cp.x}, ${cp.y}, ${cp.z})`, false, (_, val) => {
            useCurrent = val
        }),

        Input('传送点坐标（若启用了"使用当前坐标"，则此选项不起效果）', '使用空格分隔，如: 100 100 0', (pl, value) => {
            if (useCurrent) {
                pos = pl.blockPos
            } else {
                const valArr = value.split(' ').filter(v => v.trim()).map(v => +v)

                pos = {
                    x: valArr[0],
                    y: valArr[1],
                    z: valArr[2],
                    dimid: pl.blockPos.dimid
                }
            }

            requestAddPort(pl, name, pos)
        }),
    ], (err, pl) => {
        if (err) {
            return
        }

        pl.tell('取消操作')
    }).send(pl)
}

function showTeleportCustomUi(pl) {
    const teleportBtnList = listPorts(pl).map(v => {
        return {
            text: v,
            onClick() {
                teleportPlayerToCustomPos(pl, v)
            }
        }
    })
    action('传送到...', '选择你想要传送的地点', teleportBtnList, (err, pl) => {
        pl.tell(`${err.toString()}\n\n联系管理员获得更多支持`)
    }).send(pl)
}

function showRemovePosUi(pl) {
    const portList = listPorts(pl).map(v => {
        return {
            text: v,
            onClick() {
                alert('确定移除', `移除 "${v}" 传送点，确认？`, '确定', '取消', () => {
                    removePort(v, pl)
                    pl.tell(`已移除 "${v}" 传送点`)
                }).send(pl)
            }
        }
    })
    action('移除传送点', '选择你想要移除的传送点', portList, (err, pl) => {
        pl.tell(`${err.toString()}\n\n联系管理员获得更多支持`)
    }).send(pl)
}

function calcAmountByPos(currentPos, targetPos) {
    let amount = 0

    if (currentPos.dimid === targetPos.dimid) {
        const dx = currentPos.x - targetPos.x,
            dz = currentPos.z - targetPos.z,
            dist = Math.sqrt(dx * dx + dz * dz)

        amount = Math.ceil(dist/80)
    } else if(currentPos.dimid === 1 && targetPos.dimid === 0) {   
        const translatedPos = netherToMainWorld(currentPos)
        const dx = translatedPos.x - targetPos.x,
            dz = translatedPos.z - targetPos.z,
            dist = Math.sqrt(dx * dx + dz * dz)

        amount = Math.ceil(dist/60)
    } else if(targetPos.dimid === 1 && currentPos.dimid === 0) {
        const translatedPos = netherToMainWorld(targetPos)
        const dx = currentPos.x - translatedPos.x,
            dz = currentPos.z - translatedPos.z,
            dist = Math.sqrt(dx * dx + dz * dz)

        amount = Math.ceil(dist/60)
    } else {
        amount = 100
    }

    return amount
}

function requestTeleportToPlayer(from, to) {
    return new Promise((res, rej) => {
        alert('传送请求', `${from.realName} 想要传送到你的位置，同意？`, '同意', '拒绝',
            () => {
                from.teleport(to.pos)
                res()
            },
            () => {
                alert('拒绝', `${to.realName} 拒绝了你的传送请求`, '确认', '取消').send(from)
                rej()
            }
        ).send(to)
    })
}

const actions = {
    h: pl => {
        const {x, y, z, dim} = getRespawnPos(pl)
        const {name, price} = priceConf.home
        requestCredit(pl, name, price, () => {
            pl.teleport(x, y, z, dim)
        }, () => {
            pl.tell('余额不足')
        })
    },

    b: pl => {
        const deadPos = getDeadPos(pl)

        if (deadPos === null) {
            return pl.tell('没有死亡过')
        }

        const {x, y, z, dim} = deadPos
        const {name, price} = priceConf.back
        requestCredit(pl, name, price, () => {
            pl.teleport(x, y, z, dim)
        }, () => {
            pl.tell('余额不足')
        })
    },

    c: (pl, act, target) => {
        if (!act) {
            action('', '要做些什么？\n', [
                {text: '使用传送点', onClick(err, pl) {
                    if (err) {
                        return
                    }

                    showTeleportCustomUi(pl)
                }},

                {text: '添加传送点', onClick(err, pl) {
                    if (err) {
                        return
                    }

                    showAddPortUi(pl)
                }},
                
                {text: '移除传送点', onClick(err, pl) {
                    if (err) {
                        return
                    }

                    showRemovePosUi(pl)
                }}
            ]).send(pl)

            return
        }

        if (target) {
            if (act === 'add') {
                return requestAddPort(pl, target, pl.blockPos)
            }
    
            if (act === 'rm') {
                return removePort(target, pl)
            }
    
            if (act === 'tp') {
                return teleportPlayerToCustomPos(pl, target)
            }
        }

        if (act === 'add') {
            return showAddPortUi(pl)
        }

        if (act === 'rm') {
            return showRemovePosUi(pl)
        }

        if (act === 'tp') {
            return showTeleportCustomUi(pl)
        }
    },

    a: pl => {
        const btnGroups = mc.getOnlinePlayers()
            .map(pl2 => ({
                text: pl2.realName,
                onClick() {
                    requestCredit(pl, `传送到玩家: ${pl2.realName}`, calcAmountByPos(pl.blockPos, pl2.blockPos), async () => {
                        await requestTeleportToPlayer(pl, pl2)
                    })
                }
            }))
        action('传送到玩家', '选择一名玩家', btnGroups).send(pl)
    },

    w: pl => {
        if (pl.permLevel) {
            return worldTeleportUiOp(pl)
        }
    
        worldTeleportUiPlayer(pl)
    }

}

const globalPreserved = {xuid: 'global-preserved'}
function worldTeleportUiOp(pl) {
    action('', '世界传送', [
        {
            text: '添加传送点',
            onClick(_, pl) {
                worldTeleportAddUi(pl)
            }
        },

        {
            text: '移除传送点',
            onClick(_) {
                worldTeleportRmUi(pl)
            }
        },

        {
            text: '使用传送点',
            onClick(_, pl) {
                worldTeleportUiPlayer(pl)
            }
        },
    ]).send(pl)
}


function worldTeleportUiPlayer(pl) {
    let current
    for (const name of listPorts(globalPreserved)) {
        const {x, z, dimid} = getPort(name, globalPreserved)
        const plPos = pl.pos

        if (
            dimid === plPos.dimid &&
            Math.abs(plPos.x - x) < 6 &&
            Math.abs(plPos.z - z) < 6
        ) {
            current = name
            break
        }
    }

    if (!current) {
        alert('错误', '不在可用传送区域', '确定', '取消').send(pl)
        return
    }

    action('世界传送', '选择你要传送的地点',
        listPorts(globalPreserved)
            .filter(v => v != current)
            .map(name => ({
                text: name,
                onClick() {
                    const targetPos = getPort(name, globalPreserved)
                    requestCredit(
                        pl, `传送到 ${name}`,
                        Math.ceil(calcAmountByPos(pl.pos, targetPos) * 0.1),
                        () => {
                            const {x, y, z, dimid} = targetPos
                            pl.teleport(x, y, z, dimid)
                        }
                    )
                }
            }))
    ).send(pl)
}

function worldTeleportAddUi(pl) {
    let name,
        pos

    const plPos = pl.blockPos

    widget('添加传送点', [
        Input('传送点名称', (_, val) => {
            name = val
        }),
        Switch(`使用当前坐标 §b(${plPos.x},${plPos.y},${plPos.z})`, (_, val) => {
            pos = plPos
        }),
        Input(
            '传送点坐标 (若选择了“使用当前坐标”, 则此项无效)',
            '使用空格分开的数字, 如: "100 100 100"', '',
            (_, val) => {
                if (!pos) {
                    if (val.match(/\d+ \d+ \d+/)) {
                        const [x, y, z] = val.split(' ')
                        pos = {
                            x, y, z, dimid: pl.dimid
                        }
                    } else {
                        pos = plPos
                    }
                }

                savePort(name, globalPreserved, pos)
            }
        )
    ]).send(pl)
}

function worldTeleportRmUi(pl) {
    action(
        '删除传送点', '', listPorts(globalPreserved)
            .map(name => ({
                text: name,
                onClick() {
                    alert(
                        '删除传送点', `确定删除传送点 §b${name}§r ?`,
                        '确定', '取消',
                        () => {
                            removePort(name, globalPreserved)
                        }
                    ).send(pl)
                }
            }))
    ).send(pl)
}

function regTelCmds() {
    const cmd = mc.newCommand('tpc', '自定义传送', 0)
    cmd.setEnum('action', ['h', 'b', 'a', 'w'])
    cmd.setEnum('customEvent', ['add', 'rm', 'tp'])
    cmd.setEnum('custom', ['c'])
    cmd.mandatory('Action', ParamType.Enum, 'action', 'Action', 1)
    cmd.mandatory('Custom', ParamType.Enum, 'custom', 'Custom', 1)
    cmd.optional('CustomEvent', ParamType.Enum, 'customEvent', 'CustomEvent', 1)
    cmd.optional('teleportName', ParamType.String)

    cmd.overload(['Action'])
    cmd.overload(['Custom', 'CustomEvent', 'teleportName'])

    cmd.setCallback((_, origin, output, args) => {
        const cmd = args.Action ?? args.Custom
        const argArr = [args.CustomEvent, args.teleportName]
        const handler = actions[cmd]

        if (!handler) {
            output.error('错误的指令格式')
        }

        handler.call(null, origin.player ?? origin.entity, ...argArr)
    })

    cmd.setup()
}

module.exports = {
    setup: regTelCmds, getDeadPos, getRespawnPos
}