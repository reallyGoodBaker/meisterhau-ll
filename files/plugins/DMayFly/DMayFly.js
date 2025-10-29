// LiteLoader-AIDS automatic generated
/// <reference path="c:\Users\zjn18\.vscode\LLAPI/dts/helperlib/src/index.d.ts"/> 

ll.registerPlugin(
    /* name */ "DMayFly",
    /* introduction */ "BDS飞行插件",
    /* version */ [1,2,3],
    /* otherInformation */ {
        "作者": "HaiPaya"
    }
)
var ver = "1.2.3"


//Logo
log(`
$$$$$$$\  $$\      $$\                     $$$$$$$$\ $$\           
$$  __$$\ $$$\    $$$ |                    $$  _____|$$ |          
$$ |  $$ |$$$$\  $$$$ | $$$$$$\  $$\   $$\ $$ |      $$ |$$\   $$\ 
$$ |  $$ |$$\$$\$$ $$ | \____$$\ $$ |  $$ |$$$$$\    $$ |$$ |  $$ |
$$ |  $$ |$$ \$$$  $$ | $$$$$$$ |$$ |  $$ |$$  __|   $$ |$$ |  $$ |
$$ |  $$ |$$ |\$  /$$ |$$  __$$ |$$ |  $$ |$$ |      $$ |$$ |  $$ |
$$$$$$$  |$$ | \_/ $$ |\$$$$$$$ |\$$$$$$$ |$$ |      $$ |\$$$$$$$ |
\_______/ \__|     \__| \_______| \____$$ |\__|      \__| \____$$ |
                                 $$\   $$ |              $$\   $$ |
                                 \$$$$$$  |              \$$$$$$  |
                                  \______/                \______/ 
                        DMayFly - ${ver}
`)


//LL版本检测
if(!ll.requireVersion(2,8,1)){
    logger.error(`您的LiteLoaderBDS版本过低,请及时升级!`)
    logger.error(`由于LiteLoaderBDS版本过低,插件将无法使用!`)
    logger.error(`请升级LiteLoaderBDS版本到2.8.1以上,否则插件将无法使用!`)
    mc.listen("onServerStarted",()=>{
        logger.error(`您的LiteLoaderBDS版本过低,请及时升级!`)
        logger.error(`由于LiteLoaderBDS版本过低,插件将无法使用!`)
        logger.error(`请升级LiteLoaderBDS版本到2.8.1以上,否则插件将无法使用!`)
    })
}


//语言文件版本检测
let langc = File.readFrom(`.\\plugins\\DMayFly\\language.json`)
if(langc != null) {
    langc = JSON.parse(langc)
    if(langc.zh_CN["language.ver"] != ver) {
        File.rename(`.\\plugins\\DMayFly\\language.json`, `.\\plugins\\DMayFly\\language.json.old`)
        logger.error(`语言文件过旧,已将其重命名为"language.json.old"`)
    }
}


//文件
/*
PlayerDB格式
{
    "玩家XUID": {
        "etime": 剩余飞行时长,单位:秒
        "openfly": 是否开启飞行
    }
}
*/
var conf = new JsonConfigFile(`.\\plugins\\DMayFly\\config.json`)
conf.init("available_world", [true,true,true])
conf.init("command", "dmayfly")
conf.init("command_alias", "dmf")
conf.init("currencyName", "弟弟币")
conf.init("economy", "llmoney")
conf.init("language", "zh_CN")
var PlayerDB = new KVDatabase(`.\\plugins\\DMayFly\\PlayerDB`)
i18n.load(".\\plugins\\DMayFly\\language.json", conf.get("language"), {
    "zh_CN": {
        //版本
        "language.ver": ver,
        //命令
        "cmd.introduce": "生存飞行",
        "cmd.introduce.op": "生存飞行 - OP管理页面",
        "cmd.err.noop": "您没有权限执行此命令!",
        "cmd.err.nopl": "您无法执行本命令!",
        //UI主页
        "ui.main.title": "飞行",
        "ui.main.shutdown": "关闭飞行",
        "ui.main.open": "开启飞行",
        "ui.main.content": "您的剩余飞行时长为:{}s",
        "ui.main.purchase": "购买时长",
        "ui.main.op": "OP管理",
        //UI主页=>开关飞行
        "ui.main.switch.title": "错误",
        "ui.main.switch.content": "无法开启飞行,您的剩余飞行时长不足!",
        "ui.main.switch.purchase": "购买",
        "ui.main.switch.shutdown": "关闭",
        "ui.main.switch.content_nf": "您所在的世界无法开启飞行!",
        "ui.main.switch.return": "返回",
        //UI购买页面
        "ui.purchase.title": "购买时长",
        "ui.purchase.button": "{}\n时长:{}s价格:{}",
        //UI购买页面=>详情
        "ui.purchase.detail.title": "套餐详情",
        "ui.purchase.detail.content": "套餐名称:{}\n套餐时长:{}s\n套餐价格:{}",
        "ui.purchase.detail.purchase": "确认购买",
        //UI购买页面=>详情=>穷
        "ui.purchase.poor.title": "错误",
        "ui.purchase.poor.content": "购买飞行需要花费{},可您只有{}!",
        "ui.purchase.poor.return": "返回",
        "ui.purchase.poor.shutdown": "关闭",
        //UI购买页面=>详情=>成功
        "ui.purchase.succeed.title": "成功",
        "ui.purchase.succeed.content": "购买成功!",
        "ui.purchase.succeed.return": "返回",
        "ui.purchase.succeed.shutdown": "关闭",
        //UI主页OP
        "ui.main.op.title": "飞行 - OP",
        "ui.main.op.package": "套餐管理\n增删改套餐",
        "ui.main.op.player": "玩家管理\n修改玩家剩余时长",
        "ui.main.op.aworld": "可用世界\n设置可以开启飞行的世界",
        //UI主页OP=>套餐管理
        "ui.main.op.package.title": "飞行 - 套餐管理",
        "ui.main.op.package.add_package": "新增套餐",
        "ui.main.op.package.button": "{}\n时长:{}s价格:{}",
        //UI主页OP=>套餐管理=>新增套餐
        "ui.main.op.package.add.title": "套餐管理 - 新增套餐",
        "ui.main.op.package.add.name": "套餐名称:",
        "ui.main.op.package.add.image": "套餐图标:",
        "ui.main.op.package.add.money": "套餐价格:",
        "ui.main.op.package.add.time": "套餐时长(秒):",
        "ui.main.op.package.err.title": "错误",
        "ui.main.op.package.err.msg": "参数异常!\n套餐时长需大于0,套餐价格需大于等于0!",
        "ui.main.op.package.ok.title": "成功:",
        "ui.main.op.package.ok.msg": "已成功添加套餐!",
        //UI主页OP=>套餐管理=>详情
        "ui.main.op.package.detail.title": "套餐详情",
        "ui.main.op.package.detail.content": "套餐名称:{}\n套餐时长:{}s\n套餐价格:{}",
        "ui.main.op.package.detail.purchase": "删除套餐",
        "ui.main.op.package.detail.ok.title": "成功!",
        "ui.main.op.package.detail.ok.msg": "已删除套餐!",
        //UI主页OP=>可用世界
        "ui.main.op.aworld.title": "飞行 - 可用世界",
        "ui.main.op.aworld.w0": "主世界",
        "ui.main.op.aworld.w1": "下界",
        "ui.main.op.aworld.w2": "末地",
        //提示
        "prompt.expire": "[§a提示§r] 您的飞行时长到期,已关闭飞行!",
        "prompt.statusexception": "[§c飞行状态异常§r] 飞行状态异常,已关闭飞行!",
        "prompt.warn": "[§c警告§r] 您的剩余飞行时长不足60s,请尽快返回地面!",
        "prompt.aworld.err": "[§a提示§r] 您所在的世界无法启用飞行, 飞行已自动关闭!"
    }
})
var tr = i18n.tr
if(!File.exists(`.\\plugins\\DMayFly\\Package.json`)){
    let ls=`[
        {
            "name": "套餐1",
            "image": "textures/ui/promo_gift_small_green.png",
            "money": 1000,
            "time": 2000
        },
        {
            "name": "套餐2",
            "image": "textures/ui/promo_gift_small_pink.png",
            "money": 3000,
            "time": 7000
        },
        {
            "name": "套餐3",
            "image": "textures/ui/promo_gift_small_yellow.png",
            "money": 6000,
            "time": 15000
        }
    ]`
    File.writeTo(`.\\plugins\\DMayFly\\Package.json`, ls)
}
var Package = data.parseJson(File.readFrom(`.\\plugins\\DMayFly\\Package.json`))


//设置飞行时长
function setFlyTime(xuid, time) {
    let ls = PlayerDB.get(xuid)
    if(ls == null) {
        return false
    }
    ls.etime = time
    return PlayerDB.set(xuid, ls)
}
//获取飞行时长
function getFlyTime(xuid) {
    let ls = PlayerDB.get(xuid)
    if(ls == null) {
        return 0
    }
    return ls.etime
}
//经济
if(conf.get("economy") != "llmoney") {
    if(mc.getScoreObjective(conf.get("economy")) == null) {
        mc.newScoreObjective(conf.get("economy"), conf.get("currencyName"))
        logger.warn(`检测到"${conf.get("economy")}"积分板不存在,已创建!`)
    }
}
//减少余额
function reduceMoney(pl, my) {
    if(conf.get("economy") == "llmoney") {
        return money.reduce(pl.xuid, my)
    }
    else {
        if(pl.getScore(conf.get("economy")) < my) {
            return false
        }
        else {
            return pl.reduceScore(conf.get("economy"), my)
        }
    }
}
//获取余额
function getMoney(pl) {
    if(conf.get("economy") == "llmoney") {
        return money.get(pl.xuid)
    }
    else {
        return pl.getScore(conf.get("economy"))
    }
}
//判断当前世界是否允许飞行
function isAvailableWorld(dimid) {
    return conf.get("available_world")[dimid]
}
//UI主页
function ui_main(pl) {
    let PLS = PlayerDB.get(pl.xuid)
    let fm = mc.newSimpleForm()
    fm.setTitle(tr("ui.main.title"))
    fm.setContent(tr("ui.main.content", getFlyTime(pl.xuid)))
    if(PLS.openfly) {
        fm.addButton(tr("ui.main.shutdown"), "textures/ui/cancel.png")
    }
    else {
        fm.addButton(tr("ui.main.open"), "textures/ui/check.png")
    }
    fm.addButton(tr("ui.main.purchase"), "textures/ui/promo_gift_small_blue.png")
    if(pl.isOP()) {
        fm.addButton(tr("ui.main.op"), "textures/ui/permissions_op_crown_hover.png")
    }
    pl.sendForm(fm, (pl, id) => {
        if(id == 0) {
            if(PLS.openfly) {
                //关闭飞行
                pl.setAbility(10,false)
                PLS.openfly = false
                PlayerDB.set(pl.xuid, PLS)
                ui_main(pl)
            }
            else {
                //开启飞行
                //当前世界是否可以开启
                if(!isAvailableWorld(pl.pos.dimid)) {
                    pl.sendModalForm(tr("ui.main.switch.title"), tr("ui.main.switch.content_nf"), tr("ui.main.switch.return"), tr("ui.main.switch.shutdown"), (pl, s) => {
                        if(s) {
                            ui_main(pl)
                        }
                    })
                    return
                }

                //飞行时间是否足够
                if(getFlyTime(pl.xuid) <= 0) {
                    pl.sendModalForm(tr("ui.main.switch.title"), tr("ui.main.switch.content"), tr("ui.main.switch.purchase"), tr("ui.main.switch.shutdown"), (pl, s) => {
                        if(s) {
                            ui_purchase(pl)
                        }
                    })
                    return
                }

                pl.setAbility(10,true)
                PLS.openfly = true
                PlayerDB.set(pl.xuid, PLS)
                ui_main(pl)
            }
        }
        if(id == 1) {
            ui_purchase(pl)
        }
        if(id == 2) {
            ui_main_op(pl)
        }
    })
}
//UI购买页面
function ui_purchase(pl) {
    let fm = mc.newSimpleForm()
    fm.setTitle(tr("ui.purchase.title"))
    for(let i = 0; Package[i]; i++) {
        fm.addButton(tr("ui.purchase.button", Package[i].name, Package[i].time, `${Package[i].money}${conf.get("currencyName")}`), Package[i].image)
    }
    pl.sendForm(fm, (pl, id) => {
        if(id == null) {
            ui_main(pl)
            return
        }

        let fm = mc.newSimpleForm()
        fm.setTitle(tr("ui.purchase.detail.title"))
        fm.setContent(tr("ui.purchase.detail.content", Package[id].name, Package[id].time, `${Package[id].money}${conf.get("currencyName")}`))
        fm.addButton(tr("ui.purchase.detail.purchase"), "textures/ui/check.png")
        pl.sendForm(fm, (pl, id_) => {
            if(id_ == null) {
                ui_purchase(pl)
                return
            }

            //判断钱是否足够
            if(!reduceMoney(pl, Package[id].money)) {
                pl.sendModalForm(tr("ui.purchase.poor.title"), tr("ui.purchase.poor.content", `${Package[id].money}${conf.get("currencyName")}`, `${getMoney(pl)}${conf.get("currencyName")}`), tr("ui.purchase.poor.return"), tr("ui.purchase.poor.shutdown"), (pl, s) => {
                    if(s) {
                        ui_purchase(pl)
                    }
                })
                return
            }

            setFlyTime(pl.xuid, getFlyTime(pl.xuid) + Package[id].time)
            
            pl.sendModalForm(tr("ui.purchase.succeed.title"), tr("ui.purchase.succeed.content"), tr("ui.purchase.succeed.return"), tr("ui.purchase.succeed.shutdown"), (pl, s) => {
                if(s) {
                    ui_main(pl)
                }
            })
        })
    })
}
//UI主页OP
function ui_main_op(pl) {
    let fm = mc.newSimpleForm()
    fm.setTitle(tr("ui.main.op.title"))
    fm.addButton(tr("ui.main.op.package"), "textures/ui/promo_gift_small_blue.png")
    fm.addButton(tr("ui.main.op.player"), "textures/ui/classrooms_icon.png")
    fm.addButton(tr("ui.main.op.aworld"), "textures/ui/lock_color.png")
    pl.sendForm(fm, (pl, id) => {
        if(id == 0) {
            //套餐管理
            ui_package(pl)
        }
        if(id == 1) {
            //玩家管理
            pl.tell("咕咕咕...")
            ui_main_op(pl)
        }
        if(id == 2) {
            //可用世界
            ui_aworld(pl)
        }
    })
}
//UI套餐管理
function ui_package(pl) {
    let fm = mc.newSimpleForm()
    fm.setTitle(tr("ui.main.op.package.title"))
    fm.addButton(tr("ui.main.op.package.add_package"), "textures/ui/color_plus.png")
    for(let i = 0; Package[i]; i++) {
        fm.addButton(tr("ui.main.op.package.button", Package[i].name, Package[i].time, `${Package[i].money}${conf.get("currencyName")}`), Package[i].image)
    }
    pl.sendForm(fm, (pl, id) => {
        if(id == null) { 
            ui_main_op(pl)
            return
        }
        if(id == 0) {
            let fm = mc.newCustomForm()
            fm.setTitle(tr("ui.main.op.package.add.title"))
            fm.addInput(tr("ui.main.op.package.add.name"))
            fm.addInput(tr("ui.main.op.package.add.image"), "textures/ui/promo_gift_small_pink.png", "textures/ui/promo_gift_small_pink.png")
            fm.addInput(tr("ui.main.op.package.add.money"), "0", "0")
            fm.addInput(tr("ui.main.op.package.add.time"), "1", "1")
            pl.sendForm(fm, (pl, dt) => {
                if(dt == null) ui_package(pl)
                let money = Number(dt[2])
                let time = Number(dt[3])

                //参数是否合法
                if(money <0 || time <=0) {
                    pl.sendModalForm(tr("ui.main.op.package.err.title"), tr("ui.main.op.package.err.msg"), tr("ui.purchase.succeed.return"), tr("ui.purchase.succeed.shutdown"), (pl, s) => {
                        if(s) {
                            ui_package(pl)
                        }
                    })
                    return
                }

                //增加套餐
                Package.push({
                    "name": dt[0],
                    "image": dt[1],
                    "money": money,
                    "time": time
                })
                File.writeTo(`.\\plugins\\DMayFly\\Package.json`, data.toJson(Package, 4))

                pl.sendModalForm(tr("ui.main.op.package.ok.title"), tr("ui.main.op.package.ok.msg"), tr("ui.purchase.succeed.return"), tr("ui.purchase.succeed.shutdown"), (pl, s) => {
                    if(s) {
                        ui_package(pl)
                    }
                })
            })
            return
        }

        let fm = mc.newSimpleForm()
        fm.setTitle(tr("ui.main.op.package.detail.title"))
        fm.setContent(tr("ui.main.op.package.detail.content", Package[id -1].name, Package[id -1].time, `${Package[id -1].money}${conf.get("currencyName")}`))
        fm.addButton(tr("ui.main.op.package.detail.purchase"), "textures/ui/anvil_icon.png")
        pl.sendForm(fm, (pl, id_) => {
            if(id_ == null) {
                ui_package(pl)
                return
            }

            //删除
            Package.splice(id - 1, 1)
            File.writeTo(`.\\plugins\\DMayFly\\Package.json`, data.toJson(Package, 4))
            
            pl.sendModalForm(tr("ui.main.op.package.detail.ok.title"), tr("ui.main.op.package.detail.ok.msg"), tr("ui.purchase.succeed.return"), tr("ui.purchase.succeed.shutdown"), (pl, s) => {
                if(s) {
                    ui_package(pl)
                }
            })
        })
    })
}
//可用世界
function ui_aworld(pl) {
    let ls = conf.get("available_world")
    let fm = mc.newCustomForm()
    fm.setTitle(tr('ui.main.op.aworld.title'))
    fm.addSwitch(tr("ui.main.op.aworld.w0"), ls[0])
    fm.addSwitch(tr("ui.main.op.aworld.w1"), ls[1])
    fm.addSwitch(tr("ui.main.op.aworld.w2"), ls[2])
    pl.sendForm(fm, (pl, dt) => {
        if(dt == null) {
            ui_main_op(pl)
            return
        }

        conf.set("available_world", [dt[0], dt[1], dt[2]])
        ui_main_op(pl)
    })
}


//扣费
function deductions() {
    //获取所有玩家
    let allPL = mc.getOnlinePlayers()
    for(let i = 0; allPL[i]; i++) {
        let pl = allPL[i]
        let PLS = PlayerDB.get(pl.xuid)
        //是飞行状态
        if(pl.isFlying) {
            //排除创造
            if(allPL[i].gameMode == 1) break

            if(!PLS.openfly) {
                //非法飞行,关闭并警告
                pl.setAbility(10,false)
                pl.tell(tr("prompt.statusexception"))
            }
            else {
                //是否位于可飞行世界
                if(!isAvailableWorld(pl.pos.dimid)) {
                    //关闭飞行并警告
                    pl.setAbility(10,false)
                    pl.tell(tr("prompt.aworld.err"))
                    PLS.openfly = false
                    PlayerDB.set(pl.xuid, PLS)
                }

                //合法飞行状态,是否到期
                if(PLS.etime <= 0 ) {
                    //飞行到期
                    pl.setAbility(10,false)
                    pl.tell(tr("prompt.expire"))
                    PLS.openfly = false
                    PlayerDB.set(pl.xuid, PLS)
                }
                else {
                    //未到期,减少时间
                    PLS.etime --
                    PlayerDB.set(pl.xuid, PLS)
                    if(PLS.etime == 60) {
                        pl.tell(tr("prompt.warn"))
                    }
                }
            }
        }
    }
}


//监听
//进服
mc.listen("onJoin", (pl) => {
    //初始化
    if(PlayerDB.get(pl.xuid) == null) {
        PlayerDB.set(pl.xuid, {
            "etime": 0,
            "openfly": false
        })
    }
    //启用飞行
    if(PlayerDB.get(pl.xuid).openfly) {
        pl.setAbility(10,true)
    }
})
//TPS
var tps_r = 0
mc.listen("onTick", () => {
    tps_r ++
    if(tps_r >= 20) {
        tps_r = 0

        //执行扣费
        deductions()
    }
})


//命令
mc.listen("onServerStarted", () => {
    try{
        let Command = mc.newCommand(conf.get("command"), tr("cmd.introduce"), PermType.Any, 0x80, conf.get("command_alias"))

        Command.setEnum("op", ["op"])
        Command.mandatory("OP", ParamType.Enum, "op")

        Command.setEnum("ly", ["addtime", "dectime"])
        Command.mandatory("LY", ParamType.Enum, "ly")

        Command.setEnum("gt", ["gettime"])
        Command.mandatory("GT", ParamType.Enum, "gt")

        Command.mandatory("Player", ParamType.Player)
        Command.mandatory("Int", ParamType.Int)

        Command.overload([])
        Command.overload(["OP"])
        Command.overload(["LY", "Player", "Int"])
        Command.overload(["GT", "Player"])

        Command.setCallback((cmd,ori,outp,res) => {
            //ui
            if(res["OP"] == "op") {
                if(ori.player == null) {
                    outp.error(tr("cmd.err.nopl"))
                    return
                }

                if(ori.player.isOP()) {
                    ui_main_op(ori.player)
                }
                else {
                    outp.error(tr("cmd.err.noop"))
                }
            }
            if(res["OP"] == null && res["LY"] == null && res["GT"] == null) {
                if(ori.player == null) {
                    outp.error(tr("cmd.err.nopl"))
                    return
                }

                ui_main(ori.player)
            }

            //增加时长
            if(res["LY"] == "addtime") {
                if(ori.player == null || ori.player.isOP()) {
                    //遍历所有玩家
                    for(let i = 0; res["Player"][i]; i++) {
                        setFlyTime(res["Player"][i].xuid, getFlyTime(res["Player"][i].xuid) + res["Int"])
                        outp.addMessage(`${res["Player"][i].name}: +${res["Int"]}s`)
                    }
                    outp.success()
                }
                else {
                    outp.error(tr("cmd.err.noop"))
                }
            }
            //减少时长
            if(res["LY"] == "dectime") {
                if(ori.player == null || ori.player.isOP()) {
                    //遍历所有玩家
                    for(let i = 0; res["Player"][i]; i++) {
                        setFlyTime(res["Player"][i].xuid, getFlyTime(res["Player"][i].xuid) - res["Int"])
                        outp.addMessage(`${res["Player"][i].name}: -${res["Int"]}s`)
                    }
                    outp.success()
                }
                else {
                    outp.error(tr("cmd.err.noop"))
                }
            }
            //获取时长
            if(res["GT"] == "gettime") {
                if(ori.player == null || ori.player.isOP()) {
                    //遍历所有玩家
                    for(let i = 0; res["Player"][i]; i++) {
                        outp.addMessage(`${res["Player"][i].name}: ${getFlyTime(res["Player"][i].xuid)}s`)
                    }
                    outp.success()
                }
                else {
                    outp.error(tr("cmd.err.noop"))
                }
            }
        })
        Command.setup()
    }catch(err) {
        logger.error(`"${conf.get("command")}"和"${conf.get("command_alias")}"命令注册失败,请确保未被占用!`)
    }
})


//变量注册
if(File.exists(`.\\plugins\\lib\\BEPlaceholderAPI-JS.js`)) {
    log(`检测到"BEPlaceholderAPI",正在注册变量!`)
    let PAPI = require('./lib/BEPlaceholderAPI-JS').PAPI

    function papiGetFlyTime(pl) {
        return String(getFlyTime(pl.xuid))
    }
    PAPI.registerPlayerPlaceholder(papiGetFlyTime, "DMayFly", "playerFlyTime")
    log(`已注册变量 "playerFlyTime" - 玩家剩余飞行时长`)
}


//导出函数
//设置飞行时长
ll.export(setFlyTime, "DMayFly", "setFlyTime")
//获取飞行时长
ll.export(getFlyTime, "DMayFly", "getFlyTime")
//设置飞行状态
ll.export((xuid, state) => {
    let ls = PlayerDB.get(xuid)
    if(ls == null) {
        return false
    }
    ls.openfly = state
    return PlayerDB.set(xuid, ls)
}, "DMayFly", "setFlyState")