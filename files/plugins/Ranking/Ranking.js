
ll.registerPlugin("Ranking", "排行榜", [2, 0, 4]);

function ST(player, text) {
    player.tell("§a§l" + text + "");
}


class Ranking_Method {

    constructor() {

        this.CONFIG_FILE = new JsonConfigFile('.\\plugins\\Ranking-Data\\config.json', '{}');
        this.PAHT = ".\\plugins\\Ranking-Data\\data\\";


        this.Mode = this.CONFIG_FILE.init("DisplayMode", {
            mode: "sidebar"
        })

        this.Max = this.CONFIG_FILE.init("Max", {
            max: 10,
            state: true
        })

        this.MoneyRanking = this.CONFIG_FILE.init("Money", {
            Name: "经济排行榜",
            prefix: " ◆ §l",
            state: true
        })

        this.Hide = this.CONFIG_FILE.init("Hide", [])

        // 配置文件
        this.CONFIG = this.CONFIG_FILE.init("CONFIG", {
            Destroy: {
                Name: "挖掘榜",
                prefix: " ◆ §l",
                state: true
            },
            Place: {
                Name: "放置榜",
                prefix: " ◆ §l",
                state: true
            },
            MobDie: {
                Name: "击杀榜",
                prefix: " ◆ §l",
                state: true
            },
            PlayerDie: {
                Name: "死亡榜",
                prefix: " ◆ §l",
                state: true
            },
            OnlineTime: {
                Name: "在线时长榜",
                prefix: " ◆ §l",
                state: true
            },
            ConsumeTotem: {
                Name: "超越生死",
                prefix: " ◆ §l",
                state: true
            },
            Chat: {
                Name: "发言榜",
                prefix: " ◆ §l",
                state: true
            },
            Eat: {
                Name: "大胃王",
                prefix: " ◆ §l",
                state: true
            },
            DropItem: {
                Name: "乱丢垃圾",
                prefix: " ◆ §l",
                state: true
            },
            Jump: {
                Name: "蹦蹦跳跳",
                prefix: " ◆ §l",
                state: true
            }
        })

        // Ranking Data
        this.RK_FILE = new Map()

        Object.keys(this.CONFIG).forEach((key) => {
            if (this.CONFIG[key]["state"]) this.RK_FILE.set(key, new JsonConfigFile(`${this.PAHT + key}.json`, '{}'))
        })

        this.RK_DATA = new Map()

        this.RK_FILE.forEach((value, key) => this.RK_DATA.set(key, value.init("DATA", {})))



    }


    DataWrite(player, type) {

        let ConfJson = this.RK_DATA.get(type)

        ConfJson[player.xuid] ? ConfJson[player.xuid]["data"] += 1 : ConfJson[player.xuid] = {
            name: player.name,
            data: 1
        }
        this.RK_DATA.set(type, ConfJson)

        // save
        this.RK_FILE.get(type).set("DATA", this.RK_DATA.get(type))
    }

    RankingData(type) {
        let data = this.RK_DATA.get(type)
        let Pair = {}

        Object.keys(data).forEach(key => Pair[`${this.CONFIG[type]["prefix"]}${data[key]["name"]}`] = data[key]["data"])

        let PairArr = Object.keys(Pair).sort((a, b) => Pair[b] - Pair[a])

        let PairSort = {}

        PairArr.forEach((params) => {

            if (this.Hide.includes(params.replace(`${this.CONFIG[type]["prefix"]}`, ""))) return

            PairSort[params] = Pair[params]


        })

        if (this.Max["state"] && this.Mode["mode"] == "sidebar") {

            if (this.Max["max"] < PairArr.length) {

                let Deleted = PairArr.splice(this.Max["max"])

                Deleted.forEach(Item => delete PairSort[Item])

            }

        }

        return PairSort
    }


    GuiDisplay(player, type) {
        let GUI = mc.newSimpleForm()
        GUI.setTitle(this.CONFIG[type]["Name"])

        let str = '',
            RK = this.RankingData(type)

        Object.keys(RK).forEach((key, value) => str += `§l§a${value + 1}§r${key}§r  §4${RK[key]}§r\n`)

        GUI.setContent(str);
        player.sendForm(GUI, () => { });

    }

    OpenAssignRanking(type) {

        if (!this.Mode["mode"] == "sidebar") return

        let Tag = [...(this.RK_DATA.keys())]

        let PlayerList = mc.getOnlinePlayers()

        PlayerList.forEach(player => {

            player.removeSidebar()

            Tag.forEach(item => player.hasTag(item) ? player.removeTag(item) : 1)

            player.addTag(type)

            player.setSidebar(this.CONFIG[type]["Name"], this.RankingData(type))

        })


    }


    AllSidebar(player) {

        let fm = mc.newSimpleForm().setTitle("为在线玩家打开榜单")


        this.RK_DATA.forEach((value, key) => fm.addButton(`§l打开/关闭 ${this.CONFIG[key]["Name"]}`))

        player.sendForm(fm, (player, id) => {

            if (id == null) return

            let Tag = [...(this.RK_DATA.keys())]

            this.OpenAssignRanking(Tag[id])

        });


    }


    Money(player) {
        let xuid1 = data.getAllPlayerInfo()
        xuid1.sort((a, b) => money.get(b.xuid) - money.get(a.xuid))
        let MoneyGui = mc.newSimpleForm()
        let str = ""
        xuid1.forEach((key, index) => str += `§l§a${index + 1}§r${this.MoneyRanking.prefix}${key.name}§r  §4${money.get(key.xuid)}§r\n`);
        MoneyGui.setTitle(this.MoneyRanking.Name)
        MoneyGui.setContent(str);
        player.sendForm(MoneyGui, player => { })
    }


    EventTriggered(player, type) {

        if (!this.CONFIG[type]["state"]) return;

        this.DataWrite(player, type)

        let players = mc.getOnlinePlayers()

        players.forEach(id => {

            if (id.hasTag(type) && this.Mode["mode"] == "sidebar") {

                id.setSidebar(this.CONFIG[type]["Name"], this.RankingData(type))

            }

        })

    }

    Menu(player) {

        let menu = mc.newSimpleForm().setTitle("排行榜");

        this.RK_DATA.forEach((value, key) => menu.addButton(`§l打开/关闭 ${this.CONFIG[key]["Name"]}`));

        player.sendForm(menu, (player, id) => {

            if (id == null) return

            let Tag = [...(this.RK_DATA.keys())]

            switch (this.Mode["mode"]) {
                case "sidebar":

                    player.removeSidebar()

                    if (player.hasTag(Tag[id])) {

                        player.removeTag(Tag[id])
                        ST(player, `已为你 §c关闭§r§a§l ${this.CONFIG[Tag[id]]["Name"]}`)

                    } else {

                        Tag.forEach(item => player.hasTag(item) ? player.removeTag(item) : 1);

                        player.addTag(Tag[id])

                        ST(player, `已为你 §c打开§r§a§l ${this.CONFIG[Tag[id]]["Name"]}`)

                        player.setSidebar(this.CONFIG[Tag[id]]["Name"], this.RankingData(Tag[id]))

                    }

                    break;

                case "gui":

                    this.GuiDisplay(player, Tag[id])

                    break;

                default:

                    break;
            }



        })
    }


    _Hide(player) {

        let name = []

        mc.getOnlinePlayers().forEach(player => name.push(player.realName))

        let fm = mc.newCustomForm().setTitle("排行榜")

        fm.addDropdown("选择要操作的玩家", name)

        player.sendForm(fm, (player, data) => {

            if (data == null) return

            this.Hide.push(mc.getPlayer(name[data[0]]).name)

            this.CONFIG_FILE.set("Hide", this.Hide)

            player.tell("操作成功")

        })

    }


}

let Ranking = new Ranking_Method();


/* --------------- 事件 --------------- */

mc.listen("onDestroyBlock", (player) => Ranking.EventTriggered(player, "Destroy"))

// 适配
let Event_Place = ll.requireVersion(2, 4, 1) ? "afterPlaceBlock" : "onPlaceBlock"

mc.listen(Event_Place, (player) => Ranking.EventTriggered(player, "Place"))

mc.listen("onConsumeTotem", (player) => Ranking.EventTriggered(player, "ConsumeTotem"))

mc.listen("onChat", (player) => Ranking.EventTriggered(player, "Chat"))

mc.listen("onEat", (player) => Ranking.EventTriggered(player, "Eat"))

mc.listen("onDropItem", (player) => Ranking.EventTriggered(player, "DropItem"))

mc.listen("onPlayerDie", (player) => Ranking.EventTriggered(player, "PlayerDie"))

mc.listen("onJump", (player) => Ranking.EventTriggered(player, "Jump"))

setInterval(() => mc.getOnlinePlayers().forEach(player => Ranking.EventTriggered(player, "OnlineTime")), 60000)

mc.listen("onMobDie", (mob, source) => {
    if (source != null && source.isPlayer()) {
        let player = source.toPlayer();
        Ranking.EventTriggered(player, "MobDie")
    }
});


// 防抖

function debounce(fn, delay = 500) {

    let timer

    return function () {

        if (timer) clearTimeout(timer)

        timer = setTimeout(() => {

            fn.apply(this, arguments)

            timer = null

        }, delay)
    }
}

/**

// 防抖调用示例

mc.listen("afterPlaceBlock", (player, block) => {

    debounce(() => Ranking.EventTriggered(player, "Place"))  

})

**/


/* --------------- 命令注册 --------------- */

mc.listen("onServerStarted", () => {

    let Tag = Object.keys(Ranking.CONFIG)

    let keys = []

    Tag.forEach((item) => keys.push(item.toLowerCase()))

    const cmd = mc.newCommand("ranking", "排行榜", PermType.Any)

    cmd.setAlias("rk")

    cmd.setEnum("type", ["all"]);

    cmd.setEnum("ranking", keys);

    cmd.setEnum("economy", ["money"])

    cmd.setEnum("_hide", ["hide"])

    cmd.optional("mode", ParamType.Enum, "type", 1);

    cmd.optional("name", ParamType.Enum, "ranking");

    cmd.optional("money", ParamType.Enum, "economy");

    cmd.optional("hide", ParamType.Enum, "_hide");

    cmd.overload(["mode"]);

    cmd.overload(["mode", "name"]);

    cmd.overload(["money"]);

    cmd.overload(["hide"]);


    cmd.setCallback((_cmd, _ori, out, res) => {

        // log(res.type)

        if (res.money == "money") return Ranking.Money(_ori.player)
        if (res.hide == "hide") return Ranking._Hide(_ori.player)

        if (res.mode == "all") {

            if (Ranking.Mode["mode"] != "sidebar") return out.error("仅'sidebar'模式下可用")

            if (_ori.type == 0 && !_ori.player.isOP()) return out.error("无权使用")

            if (!res.name) return Ranking.AllSidebar(_ori.player)

            Ranking.OpenAssignRanking(Tag[keys.indexOf(res.name)])

            return out.success("操作成功")

        }

        Ranking.Menu(_ori.player)

    })

    cmd.setup()

})



/* --------------- API导出 --------------- */



function GetRankingData(type) {

    if (!type) {
        let DATA = {}
        Ranking.RK_DATA.forEach((key, value) => DATA[value] = key)
        return DATA
    }

    return Ranking.RK_DATA.get(type)
}


ll.export(GetRankingData, "GetRankingData")




/* --------------- 对接PAPI --------------- */




/**
 * 
 * 由于不太会用 IAPI 导致此处的代码十分臃肿 ， 尝试过批量创建函数 ， 但是会出现问题 。
 * 
 * IAPI的文档中提及了一个object参数 ， 但是不太理解 ， 如果您看到这里并且您对IAPI十分熟悉 ，可以联系我优化这段代码 ， 十分感谢！
 * 
 */





function RegisterRanking_PAPI() {

    const PAPI = require('./lib/BEPlaceholderAPI-JS').PAPI

    PAPI.registerPlayerPlaceholder(function Destroy(xuid) {

        return GetRankingData("Destroy")[xuid] != null ? GetRankingData("Destroy")[xuid]["data"].toString() : "0"

    }, "Ranking", "player_Destroy")



    PAPI.registerPlayerPlaceholder(function Place(xuid) {

        return GetRankingData("Place")[xuid] != null ? GetRankingData("Place")[xuid]["data"].toString() : "0"

    }, "Ranking", "player_Place")




    PAPI.registerPlayerPlaceholder(function MobDie(xuid) {

        return GetRankingData("MobDie")[xuid] != null ? GetRankingData("MobDie")[xuid]["data"].toString() : "0"

    }, "Ranking", "player_MobDie")



    PAPI.registerPlayerPlaceholder(function PlayerDie(xuid) {

        return GetRankingData("PlayerDie")[xuid] != null ? GetRankingData("PlayerDie")[xuid]["data"].toString() : "0"

    }, "Ranking", "player_PlayerDie")



    PAPI.registerPlayerPlaceholder(function OnlineTime(xuid) {

        return GetRankingData("OnlineTime")[xuid] != null ? GetRankingData("OnlineTime")[xuid]["data"].toString() : "0"

    }, "Ranking", "player_OnlineTime")



    PAPI.registerPlayerPlaceholder(function ConsumeTotem(xuid) {

        return GetRankingData("ConsumeTotem")[xuid] != null ? GetRankingData("ConsumeTotem")[xuid]["data"].toString() : "0"

    }, "Ranking", "player_ConsumeTotem")



    PAPI.registerPlayerPlaceholder(function Chat(xuid) {

        return GetRankingData("Chat")[xuid] != null ? GetRankingData("Chat")[xuid]["data"].toString() : "0"

    }, "Ranking", "player_Chat")

    PAPI.registerPlayerPlaceholder(function Eat(xuid) {

        return GetRankingData("Eat")[xuid] != null ? GetRankingData("Eat")[xuid]["data"].toString() : "0"

    }, "Ranking", "player_Eat")


    PAPI.registerPlayerPlaceholder(function DropItem(xuid) {

        return GetRankingData("DropItem")[xuid] != null ? GetRankingData("DropItem:")[xuid]["data"].toString() : "0"

    }, "Ranking", "player_DropItem")


    PAPI.registerPlayerPlaceholder(function Jump(xuid) {

        return GetRankingData("Jump")[xuid] != null ? GetRankingData("Jump")[xuid]["data"].toString() : "0"

    }, "Ranking", "player_Jump")



}


mc.listen("onServerStarted", () => {


    if (ll.listPlugins().includes("BEPlaceholderAPI")) {

        RegisterRanking_PAPI()

        log("[Ranking] 检测到PAPI - 已注册PAPI变量!");

    }

})



/**
 * 
    %player_Destroy% 挖掘
    %player_Place% 放置
    %player_MobDie% 击杀
    %player_PlayerDie% 死亡
    %player_OnlineTime% 在线时长
    %player_ConsumeTotem% 图腾消耗
    %player_Chat% 聊天
    %player_Eat% 食用
    %player_DropItem:% 丢出物品
    %player_Jump% 跳跃

 */




log("[Ranking] 排行榜已加载!");