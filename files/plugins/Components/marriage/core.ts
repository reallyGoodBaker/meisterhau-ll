import open from '../db.lib'
import { action, alert, Dropdown, Slider, widget } from "@ui/index"
import { Notification, NotificationImportances } from "../notification"

const married = open('marriage')
const names = new JsonConfigFile('./ServerConfig/names.json')

export function getNameByXuid(xuid: string) {
    return names.get(xuid, '未知')
}

function useMarries(xuid: string, critical: (marries: string[]) => void) {
    const candidate = married.get(xuid)
    if (!candidate) {
        const newSet: any = []
        critical(newSet)
        married.set(xuid, newSet)
        return
    }

    critical(candidate)
    married.set(xuid, candidate)
}

export function propose(xuid: string, xuid2: string) {
    const pl = mc.getPlayer(xuid)
    const pl2 = mc.getPlayer(xuid2)

    if (pl === null || pl2 === null || pl === pl2) {
        return alert('求婚失败', '发生了一些错误').send(pl)
    }

    alert('求婚', `${pl.name} 向你求婚了, 是否接受?`, '接受', '拒绝', () => {
        useMarries(xuid, marries => marries.push(xuid2))
        useMarries(xuid2, marries => marries.push(xuid))
        names.set(xuid, pl.name)
        names.set(xuid2, pl2.name)

        alert('求婚成功', `你和 ${pl2.name} 结婚啦！`).send(pl)
        alert('求婚成功', `你和 ${pl.name} 结婚啦！`).send(pl2)

        function notify(pl: Player) {
            const notif = new Notification()
            notif.title = '结婚'
            notif.content = `${pl.name} 和 ${pl2.name} 结婚啦！`
            notif.importance = NotificationImportances.NORMAL
            notif.notify(pl)
        }

        mc.getOnlinePlayers().forEach(notify)
    }, () => {
        alert('求婚失败', `${pl2.name} 拒绝了你的求婚！`).send(pl)
    }).send(pl2)
}

export function divorce(xuid: string, xuid2: string) {
    const pl = mc.getPlayer(xuid)
    const pl2 = mc.getPlayer(xuid2)

    if (pl === null || pl2 === null || pl === pl2) {
        return alert('离婚失败', '发生了一些错误').send(pl)
    }

    useMarries(xuid, marries => marries.splice(marries.indexOf(xuid2), 1))
    useMarries(xuid2, marries => marries.splice(marries.indexOf(xuid), 1))

    alert('离婚成功', `你和 ${pl2.name} 离婚啦！`).send(pl)
    alert('离婚成功', `你和 ${pl.name} 离婚啦！`).send(pl2)

    //平分财产
    const totalMoney = money.get(pl.xuid) + money.get(pl2.xuid)

    money.set(pl.xuid, totalMoney / 2)
    money.set(pl2.xuid, totalMoney / 2)
}

export interface FamilyQuery {
    filter?: (pl: Player) => boolean
    sort?: (a: Player, b: Player) => number
    name?: string
}

export interface FamilyMember {
    xuid: string
    name: string
    agent: boolean
}

export function queryFamilies(xuid: string, {
    filter, sort, name
}: FamilyQuery = {}) {
    let marriedPlayers: FamilyMember[] = []
    useMarries(xuid, marries => {
        marriedPlayers = marries.map(xuid => ({
            xuid,
            name: mc.getPlayer(xuid)?.name ?? getNameByXuid(xuid),
            agent: true,
        }))

        if (filter) {
            marriedPlayers = marriedPlayers.filter(filter as any)
        }

        if (sort) {
            marriedPlayers.sort(sort as any)
        }

        if (name) {
            marriedPlayers = marriedPlayers.filter(pl => pl.name.includes(name))
        }
    })

    return marriedPlayers
}

export function pay3rdAmount(amount: number, xuid: string, xuid2: string) {
    const moneyA = money.get(xuid)
    const moneyB = money.get(xuid2)
    const total = moneyA + moneyB
    if (total < amount) {
        return null
    }

    const partialA = Math.floor(amount * moneyA / total)
    return [
        partialA,
        amount - partialA
    ]
}

export function getFamiliesNullable(xuid: string) {
    return married.get(xuid)
}

export function selectFamiliyMember(pl: Player): Promise<FamilyMember> {
    const families = getFamiliesNullable(pl.xuid)
    if (!families) {
        alert('失败', '你还没有加入任何家庭').send(pl)
        return Promise.reject(null)
    }

    // const plNames = mc.getOnlinePlayers()
    //     .filter(p => families.includes(p.xuid))
    //     .map(p => p.name)
    const plNames = (families as string[]).map(xuid => mc.getPlayer(xuid)?.name ?? getNameByXuid(xuid))
    plNames.unshift('选择成员')

    const opt: FamilyQuery = {}
    const sortByTypes = ['名称', '存款']
    const { promise, resolve, reject } = Promise.withResolvers<FamilyMember>()

    widget('家庭支付', [
        Dropdown('选择成员', plNames, 0, (_, v) => {
            if (v) {
                opt.name = plNames[v]
            }
        }),
        Slider('存款大于', 0, 1000000, 1, 0, (_, v) => {
            if (v > 0) {
                opt.filter = pl => money.get(pl.xuid) > v
            }
        }),
        Dropdown('排序方式', sortByTypes, 0, (_, v) => {
            opt.sort = v == 0
                ? (a, b) => a.name.localeCompare(b.name)
                : (a, b) => money.get(b.xuid) - money.get(a.xuid)

            const families = queryFamilies(pl.xuid, opt)
            const familiesButtons = families.map(family => ({
                text: `${family.name}`,
                onClick() {
                    resolve(family)
                }
            })) as any
            action(
                '匹配的成员',
                `已找到${families.length}个成员`,
                familiesButtons,
                reject,
            ).send(pl)
        })
    ]).send(pl)

    return promise
}