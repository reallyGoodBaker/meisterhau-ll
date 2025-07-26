import { EventEmitter } from "events"
import { action, alert, Dropdown, Input, Label, Slider, Switch, widget } from "./ui"
import { cmd, CommandPermission } from "@utils/command"
import { JsonConf } from "@utils/jsonConf"
import db from "./db.lib"
import http from 'http'
import qs from 'querystring'
import { Matcher, testMatch } from "@utils/matcher"

const accessibility = db('data/accessibility')
const config = new JsonConf('ServerConfig/accountConf.json', {
    register: {
        title: '注册',
        hint: '注册你的云梦之城账号，请记住你的密码，这里没有机会修改密码',
        error: '你已经注册过了',
        success: '欢迎来到云梦之城',
        timeout: {
            time: 30,
            message: '你注册超时了'
        }
    },
    login: {
        title: '登录',
        hint: '登录你的云梦之城账号，请输入你的密码',
        error: '密码错误',
        success: '欢迎回来',
        timeout: {
            time: 30,
            message: '你登录超时了'
        },
        banned: '你已被封禁，剩余：',
        denied: '你并未受邀在服务器进行游戏',
    },
    ban: {
        title: '封禁',
        hint: '封禁一个玩家',
    },
    persistent: {
        title: '保持登录',
        hint: '设置保持登录时长，在此时长内不更改 IP 即可自动保持登录'
    },
    remove: {
        title: '移除',
        hint: '移除一个玩家'
    },
    server: {
        port: 13487
    }
})

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR
const online = new Set<string>()

export const listeners = new EventEmitter()

export interface PlayerBanInfo {
    time: number
    duration: number
    reason: string
}

export interface PlayerInfo {
    xuid: string
    name: string
    allow: boolean
    passwd: string
    ban?: PlayerBanInfo
    persistent?: PersistentLogin
}

export interface PersistentLogin {
    time: number
    duration: number
    ip: string
}

function kick(pl: Player, reason: string) {
    pl.kick(reason)
    listeners.emit('kick', pl, reason)
}

function verifyPassword(passwd: string) {
    if (
        passwd.length < 6 ||
        passwd.length > 16 ||
        passwd.match(/^[a-z]{6,16}$/) ||
        passwd.match(/^[A-Z]{6,16}$/) ||
        passwd.match(/^[0-9]{6,16}$/)
    ) {
        return false
    }

    return true
}

export function createAccount(pl: Player, passwd: string, allow = true) {
    const registerConf = config.get('register')
    const kickTimer = setTimeout(() => {
        kick(pl, registerConf.timeout.message)
        listeners.emit('timeout', pl)
    }, registerConf.timeout.time * 1000)

    if (accessibility.get(pl.xuid)) {
        pl.sendToast(registerConf.title + '错误', registerConf.error)
        return
    }

    if (!verifyPassword(passwd)) {
        pl.sendToast(registerConf.title + '错误', '密码过于简单')
        return registerUi(pl)
    }

    clearTimeout(kickTimer)

    const info = {
        name: pl.name,
        allow,
        passwd,
    }
    accessibility.set(pl.xuid, info)

    listeners.emit('create', pl, info)
    pl.sendToast(registerConf.title + '成功', registerConf.success)
    online.add(pl.xuid)
}

export function activateAccount(pl: Player) {
    const info = accessibility.get(pl.xuid)
    if (info) {
        info.allow = true
        accessibility.set(pl.xuid, info)
        listeners.emit('activate', pl, info)
    }
}

export function deactivateAccount(pl: Player) {
    const info = accessibility.get(pl.xuid)
    if (info) {
        info.allow = false
        accessibility.set(pl.xuid, info)
        listeners.emit('deactivate', pl, info)
    }
}

export function verifyBanned(pl: Player) {
    const info = accessibility.get(pl.xuid)
    if (info && info.ban) {
        const { ban } = info
        if (ban.time + ban.duration > Date.now()) {
            kick(pl, `由于${ban.reason}\n` + config.get('login').banned + `${Math.ceil((ban.time + ban.duration - Date.now()) / 1000 / 60 / 60)}小时`)
            return true
        }
    }

    return false
}

export function verifyAccount(pl: Player, passwd: string) {
    if (online.has(pl.xuid)) {
        return pl.sendText('你已经登录了')
    }

    const info = accessibility.get(pl.xuid)
    const loginConf = config.get('login')

    if (!info) {
        return registerUi(pl)
    }

    if (!info.allow) {
        pl.sendToast(loginConf.title + '错误', loginConf.denied)
    }

    if (info.passwd === passwd) {
        pl.sendToast(loginConf.title + '成功', loginConf.success)
        online.add(pl.xuid)
        listeners.emit('login', pl, info)
    } else {
        pl.sendToast(loginConf.title + '错误', loginConf.error)
        loginUi(pl)
    }
}

export function updatePersistentLogin(pl: Player, duration: number, ip: string) {
    if (!online.has(pl.xuid)) {
        return loginUi(pl)
    }

    const info = accessibility.get(pl.xuid)
    if (!info) {
        return
    }

    info.persistent = {
        time: Date.now(),
        duration,
        ip,
    }

    accessibility.set(pl.xuid, info)
    listeners.emit('updatePersistentLogin', pl, info)
}

export function dropPersistentLogin(pl: Player) {
    const info = accessibility.get(pl.xuid)
    if (!info) {
        return
    }

    delete info.persistent
    accessibility.set(pl.xuid, info)
}

export function verifyPersistentLogin(pl: Player) {
    const info = accessibility.get(pl.xuid)
    if (!info) {
        return false
    }

    const { persistent } = info
    if (!persistent) {
        return false
    }

    const { time, duration, ip } = persistent
    if (time + duration < Date.now()) {
        return false
    }

    if (ip !== pl.getDevice().ip) {
        return false
    }

    listeners.emit('login', pl, info)
    return true
}

export function banAccount(pl: Player, reason: string, duration: number = 4 * HOUR) {
    const info = accessibility.get(pl.xuid)
    const banConf = config.get('ban')

    if (!info) {
        return pl.sendText(banConf.title + '错误')
    }

    info.ban = {
        xuid: pl.xuid,
        time: Date.now(),
        duration,
        reason,
    }

    accessibility.set(pl.xuid, info)
    kick(pl, reason)
}

export function banXuid(xuid: string) {
    const info = accessibility.get(xuid)
    const pl = mc.getPlayer(xuid)

    info.ban = {
        time: Date.now(),
        duration: Number.MAX_SAFE_INTEGER,
        reason: 'Ban from console',
    }

    accessibility.set(xuid, info)
    if (pl) {
        kick(pl, 'Ban from console')
    }
}

export function unbanXuid(xuid: string) {
    const info = accessibility.get(xuid)

    if (info) {
        delete info.ban
        accessibility.set(xuid, info)
    }
}

export function removeAccount(xuid: string) {
    accessibility.delete(xuid)
    const pl = mc.getPlayer(xuid)
    if (pl) {
        kick(pl, '你的账号已被移除')
    }
}

function timeoutWarning(pl: Player, action: string, duration: number) {
    pl.sendToast('警告', `你有${Math.ceil(duration / 1000)}秒的时间完成${action}，否则你将会被踢出服务器`)
}

function registerUi(pl: Player) {
    const registerConf = config.get('register')
    const { time, message } = registerConf.timeout
    const kickTimer = setTimeout(() => {
        kick(pl, message)
    }, time * 1000)

    widget(registerConf.title, [
        Label(registerConf.hint),
        Input('请输入你的密码', '', '', (pl, val) => {
            clearTimeout(kickTimer!)
            createAccount(pl, val)
        })
    ], () => timeoutWarning(pl, '注册', time * 1000)).send(pl)
}

function loginUi(pl: Player) {
    const loginConf = config.get('login')
    const { time } = loginConf.timeout
    const kickTimer = setTimeout(() => {
        kick(pl, loginConf.timeout.message)
        listeners.emit('timeout', pl)
    }, loginConf.timeout.time * 1000)

    widget(loginConf.title, [
        Label(loginConf.hint),
        Input('请输入你的密码', '', '', (pl, val) => {
            clearTimeout(kickTimer!)
            verifyAccount(pl, val)
        })
    ], () => timeoutWarning(pl, loginConf.title, time * 1000)).send(pl)
}

function banUi(player: Player) {
    if (!accessibility.get(player.xuid)) {
        return player.sendText(`${player.name} 没有注册`)
    }

    const banConf = config.get('ban')
    const players = mc.getOnlinePlayers()
    let banArgs: any = {}
    widget(banConf.title, [
        Label(banConf.hint),
        Dropdown('选择玩家', players.map(pl => pl.name), 0, (_, val) => {
            banArgs.player = players[val]
        }),
        Switch('永久封禁', false, (_, val) => banArgs.permanent = val),
        Slider('封禁时长 (小时)', 1, 168, 1, 1, (_, val) => {
            banArgs.duration = val * HOUR
        }),
        Input('理由', '', '', (pl, val) => {
            banArgs.reason = val
            if (banArgs.permanent) {
                banArgs.duration = Infinity
            }

            banAccount(banArgs.player, banArgs.reason, banArgs.duration)
        })
    ]).send(player)
}

function persistentUi(player: Player) {
    const persistConf = config.get('persistent')
    const persistentPrev = accessibility.get(player.xuid)?.persistent
    const persistent = {
        enable: Boolean(persistentPrev),
        time: persistentPrev?.time ?? Date.now(),
        duration: persistentPrev?.duration ?? 0,
        ip: persistentPrev?.ip ?? player.getDevice().ip,
    }

    widget(persistConf.title, [
        Label(persistConf.hint),
        Switch('启用保持登录', persistent.enable, (_, val) => {
            persistent.enable = val
        }),
        Slider('保持时长(天) ', 1, 30, 1, persistent.duration / DAY, (_, val) => {
            persistent.duration = val * DAY
            if (persistent.enable) {
                updatePersistentLogin(player, persistent.duration, persistent.ip)
                player.sendText(`保持登录已开启，有效时长为${persistent.duration / DAY}天`)
            } else {
                dropPersistentLogin(player)
                player.sendText('保持登录已关闭')
            }
        })
    ]).send(player)
}

function removeUi(pl: Player) {
    const removeConf = config.get('remove')
    action(removeConf.title, removeConf.hint, selectAccount({}).map(pl_ => ({
        text: pl_.name,
        onClick() {
            alert(removeConf.title, `移除玩家: ${pl_.name}`, '确定', '取消', () => removeAccount(pl_.xuid)).send(pl)
        }
    }))).send(pl)
}

function AccountServerEmitter() {
    return `
    <script>
        window.open('/ui', 'AccountServiceUi', 'popup=true,width=400,height=500')
        window.close()
    </script>
    `
}

function AccountServerUI() {
    return `
    <head>
        <title>Account Service</title>
    </head>
    <style>
        body {
            padding: 0;
            margin: 0;
        }

        #app {
            display: flex;
            flex-direction: column;
            height: 100vh;
            width: 100vw;
        }
        .item {
            padding: 10px;
        }
        .item:hover {
            background-color: #eee;
            padding: 10px;
        }
    </style>
    <script>
        function onClick(xuid, ev) {
            console.log(xuid, ev.target.checked)
            fetch('/ban?xuid=' + xuid + '&ban=' + ev.target.checked)
        }
    </script>
    <div id='app'>
        <div class="item" style="display: flex; justify-content: space-between; align-items: center; background-color: #ddd; font-weight: bold;">
            <label>PLAYER</label>
            <label>BANNED</label>
        </div>
        ${accessibility.listKey().map(xuid => {
            const { name, ban } = accessibility.get(xuid)
            const banned = !!ban
            return `
            <div class="item" style="display: flex; justify-content: space-between; align-items: center;">
                ${name}
                <lable>
                    <input type="checkbox" ${banned ? 'checked' : ''}" onclick="onClick('${xuid}', event)" />
                </label>
            </div>
            `
        }).join('')}
    </div>
    `
}

function makeServer() {
    http.createServer((req, res) => {
        if (req.url === '/') {
            return res.end(AccountServerEmitter())
        }

        if (req.url === '/ui') {
            return res.end(AccountServerUI())
        }

        if (req.url?.startsWith('/ban')) {
            const { xuid, ban } = qs.parse(req.url.split('?')[1])
            if (ban === 'true') {
                banXuid(xuid as string)
            } else {
                unbanXuid(xuid as string)
            }
            res.end()
        }
    })
    .listen(config.get('server').port, () => {
        console.log(`Account service is running on http://localhost:${config.get('server').port}`)
    })
}

export interface AccountFilter {
    name?: Matcher<string>
    allow?: Matcher<boolean>
    ban?: Matcher<Partial<PlayerBanInfo>>
    persistent?: Matcher<PersistentLogin>
}

export function selectAccount(xuid: string): PlayerInfo[]
export function selectAccount(filter: AccountFilter): PlayerInfo[]
export function selectAccount(opt: AccountFilter | string): PlayerInfo[] {
    if (typeof opt === 'string') {
        const info = accessibility.get(opt)
        if (info) {
            return [ info ]
        } else {
            throw new Error(`No account found for xuid: ${opt}`)
        }
    }

    const xuids = accessibility.listKey()
    return xuids
        .map(xuid => ({ xuid, ...accessibility.get(xuid) }))
        .filter(info => {
            if (!info) {
                return false
            }

            const { name, allow, ban, persistent } = info as PlayerInfo

            if (opt.name && !testMatch(name, opt.name)) {
                return false
            }

            if (opt.allow && !testMatch(allow, opt.allow)) {
                return false
            }

            if (ban && opt.ban && !testMatch(ban, opt.ban)) {
                return false
            }

            if (persistent && opt.persistent && !testMatch(persistent, opt.persistent)) {
                return false
            }

            return true
        })
}

export function selectAccountUi(operator: Player) {
    
}

export function setup() {
    cmd('account', '账户操作', CommandPermission.Everyone).setup(register => {
        register('register', (cmd, { player }) => registerUi(player!))
        register('login', (cmd, { player }) => loginUi(player!))
        register('persistent', (cmd, { player }) => persistentUi(player!))
        register('resetpwd <pwd:text> <verify_pwd:text>', (cmd,{player}, out, args)=>setPlayerPasswd(player!,player!.xuid,args.pwd,args.verify_pwd))
    })

    cmd('account_op', '管理员账户操作', CommandPermission.OP).setup(register => {
        register('ban', (cmd, { player }) => banUi(player!))
        register('remove', (cmd, { player }) => removeUi(player!))
        register('listinfo', (cmd, { player }) => getAllPlayerInfo(player!))
        register('info <player_name:text>',(cmd,{player}, out, args)=>getPlayerInfo(player!,args.name))
        register('resetpwd <xuid:text> <pwd:text> <verify_pwd:text>', (cmd,{player}, out, args)=>setPlayerPasswd(player!,args.xuid,args.pwd,args.verify_pwd))
    })

    mc.listen('onJoin', pl => {
        if (!accessibility.get(pl.xuid)) {
            return registerUi(pl)
        }

        if (verifyPersistentLogin(pl)) {
            pl.sendToast('提示', '你已保持登录')
            return online.add(pl.xuid)
        }

        loginUi(pl) 
    })

    mc.listen('onPreJoin', pl => {
        verifyBanned(pl)
    })

    mc.listen('onLeft', pl => {
        online.delete(pl.xuid)
    })

    makeServer()
}


function setPlayerPasswd(pl: Player, xuid:string,pwd:string,verify_pwd:string) {
    const info = accessibility.get(xuid)
    if (!info) {
        return pl.sendText(`${info.name} 没有注册`)
    }

    if (!verifyPassword(pwd)) {
        return pl.sendText('密码过于简单')
    }
    if(pwd !== verify_pwd) {
        return pl.sendText('密码前后不一致')
    }

    info.passwd = pwd
    accessibility.set(xuid, info)
    pl.sendText(`玩家 ${xuid} 的密码已设置为 ${pwd}`)
}

function getAllPlayerInfo(pl?:Player){
    const res = accessibility.listKey().map(xuid => {
        const { name, passwd } = accessibility.get(xuid)
        return `[${name},${xuid},${passwd}],`
    }).join('')

    if(pl){
        pl.sendText(res)
    }
    return res
}

function getPlayerInfo(pl:Player,player_name:string){
    const res = accessibility.listKey().map(xuid => {
        const { name, passwd } = accessibility.get(xuid)
        if( player_name == name) return `[${name},${xuid},${passwd}],`
    }).join('')

    if(pl){
        pl.sendText(res)
    }
    return res
}