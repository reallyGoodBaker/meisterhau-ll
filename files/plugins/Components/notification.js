const {action, alert, widget, Switch, StepSlider, Input, Dropdown} = require('./ui')

function queryPlayer(realName) {
    for (const pl of mc.getOnlinePlayers()) {
        if (pl.realName === realName) {
            return pl
        }
    }

    return null
}

/**@type {Map<string, Notification[]>}*/
const playerNotifs = new Map()

const NotificationImportances = {
    NORMAL: 0,
    IMPORTANT: 1
}

const NotificationTypes = {
    MESSAGE: 0,
    ACTION: 1,
    MODAL: 2
}

class Notification {
    importance = NotificationImportances.NORMAL
    type = NotificationTypes.MESSAGE
    title = ''
    preview = ''
    sound = 'random.orb'
    content = null
    /**@private*/viewed = false
    /**@private*/notified = false
    /**@private*/timeStamp = ''
    /**@private*/expired = false
    onerror = () => {}

    /**@private*/_buildMsgNotification() {
        return `§l§e${this.title}\n§7${this.preview.replace(/§[\w]/gm, '')}`
    }

    /**@private*/_buildActionNotification() {
        let header = this._buildMsgNotification()

        if (!Array.isArray(this.content)) {
            return
        }

        const labelLen = this.content.length.toString().length

        this.content.forEach(({text}, i) => {
            i += ''
            header += `\n§3${i.padStart(labelLen, ' ')} §b${text}$r`
        })

        return header
    }

    /**@private*/_buildModalNotification() {
        let notif = `§l§e${this.title}$r`

        this.content.map(({type, args}) => {
            if (type === 'Label') {
                notif += `\n${args[0]}`
            }
        })

        return notif
    }

    _buildMessage() {
        return this.type === NotificationTypes.MODAL? this._buildModalNotification()
            : this.type === NotificationTypes.ACTION? this._buildActionNotification()
                : this._buildMsgNotification()
    }

    /**@private*/_notifyNormalMsg(pl) {
        pl.tell(this._buildMessage())
    }

    /**@private*/_notifyImportantMsg(pl) {
        this.viewed = true

        if (this.type === NotificationTypes.MESSAGE) {
            const {btn1, btn2, onEnsure, onReject} = this.content
            return alert(this.title, this.preview, btn1, btn2, onEnsure, onReject, () => {
                this.viewed = false
                this._notifyNormalMsg(pl)
            }).send(pl)
        }

        if (this.type === NotificationTypes.ACTION) {
            return action(this.title, this.preview, this.content, (err, pl) => {
                if (err === -1) {
                    this.viewed = false
                    return this._notifyNormalMsg(pl)
                }
                this.onerror(err, pl)
            }).send(pl)
        }

        if (this.type === NotificationTypes.MODAL) {
            return widget(this.title, this.content, (err, pl) => {
                if (err === -1) {
                    this.viewed = false
                    return this._notifyNormalMsg(pl)
                }
                this.onerror(err, pl)
            }).send(pl)
        }
    }

    getListTilePreview() {
        const color = this.expired ? '§7§m'
            : this.viewed ? '§0' : '§b'
        return `${color + this.title}\n§8${this.timeStamp}`
    }

    displayFullContent(pl) {
        if (this.expired) {
            return pl.tell('该消息已过期')
        }
        this._notifyImportantMsg(pl)
    }

    expire() {
        this.expired = true
    }

    notify(pl) {
        if (this.notified) {
            return
        }

        this.timeStamp = new Date().toLocaleString()

        this.importance === NotificationImportances.NORMAL ? this._notifyNormalMsg(pl)
            : this._notifyImportantMsg(pl)
    
        mc.runcmd(`playsound ${this.sound} ${pl.realName}`)
        pl.tell('§a/inbox 查看详细内容')

        if (!playerNotifs.has(pl.xuid)) {
            playerNotifs.set(pl.xuid, [])
        }

        playerNotifs.get(pl.xuid).unshift(this)

        this.notified = true
    }
}

function regNotifComponent() {
    const inbox = mc.newCommand('inbox', '查看收件箱', 0)
    inbox.overload([])
    inbox.setCallback((_, origin) => {
        const pl = origin.player
        const notifs = playerNotifs.get(pl.xuid)

        if (!Array.isArray(notifs)) {
            return pl.tell('没有收到任何信息')
        }

        action('收件箱', `${notifs.length} 条消息`, notifs.map(notif => {
            return {
                text: notif.getListTilePreview(),
                onClick() {
                    notif.displayFullContent(pl)
                }
            }
        }), () => {}).send(pl)
    })
    inbox.setup()

    mc.regPlayerCmd('messenger', '发送消息', pl => {
        let shouldExpire = false
            ,importance = 0
            ,title = ''
            ,content = ''
            ,players = mc.getOnlinePlayers().map(pl => pl.realName).concat(['@a'])
            ,player = ''

        
        widget('编辑消息', [
            Dropdown('发送给:', players, 0, (_, i) => {
                player = players[i]
            }),

            Input('标题', '', title, (_, val) => {
                title = val
            }),

            Input('内容', '', content, (_, val) => {
                content = val
            }),

            Switch('阅后即焚', shouldExpire, (_, val) => {
                shouldExpire = val
            }),

            StepSlider('重要程度', ['一般', '重要'], importance, (_, i) => {
                importance = i

                function sendNotif(pl) {
                    const notif = new Notification()
                    notif.type = NotificationTypes.MESSAGE
                    notif.title = title
                    notif.preview = content
                    notif.importance = importance

                    const handler = () => {
                        if (shouldExpire) {
                            notif.expire()
                        }
                    }

                    notif.content = {
                        btn1: '确定', btn2: '取消',
                        onEnsure: handler,
                        onReject: handler
                    }

                    notif.notify(pl)
                }

                

                if (player === '@a') {
                    if (!pl.permLevel) {
                        alert('错误', '权限不足', '是', '取消').send(pl)
                        return
                    }
    
                    mc.getOnlinePlayers().forEach(pl => sendNotif(pl))
                    return
                }

                sendNotif(queryPlayer(player))
                
            }),
        ]).send(pl)
    })
}

module.exports = {
    Notification, NotificationImportances, NotificationTypes, setup: regNotifComponent
}