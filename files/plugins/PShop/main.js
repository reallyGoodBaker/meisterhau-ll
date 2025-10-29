// LiteLoader-AIDS automatic generated
/// <reference path="c:/ll3/dev/dts/helperlib/src/index.d.ts" />
const versions = [[3, 0, 0], "3.0.0"];
const fix = " Beta 25.07.18-1 开发版";
const author = "Planet工作室-星辰开发组-春风";
const path = "./plugins/Planet/PShop/";
//释放语言文件
const lang = new JsonConfigFile(path + "lang.json", JSON.stringify({
    "money.error": "经济系统配置错误!",
    "money.error.pl": "经济系统配置错误!请上报服务器管理员!",
    "gui.exit": "表单已关闭,未收到操作",
    "shop.buy.ok": "购买成功!",
    "shop.buy.no": "你没有那么多钱,你只有:",
    "shop.mustnum": "数量必须是整数而且不能是负数",
    "market.mustnum": "价格必须是整数而且不能是负数",
    "shop.sell.ok": "出售成功!",
    "shop.sell.no": "你没有那么多物品,你只有:",
    "market.error.nocount": "你没有填入价格!",
    "market.buy.no": "你没有那么多钱,你只有:",
    "market.buy.no2": "请先清理背包!",
    "market.add.ok": "上架成功!",
    "market.buy.ok": "购买成功!",
    "market.reduce.ok": "下架成功!",
    "market.opmenu.noperm": "你无权操作!"
}));
lang.delete("shop.buy.noroom")
lang.delete("shop.sell.no2")
/**
* 初始化配置项组(方便函数)
* @param {Object} obj 
*/
JsonConfigFile.prototype.inits = function (obj) {
    for (let i = 0; i < Object.keys(obj).length; i++) {
        this.init(Object.keys(obj)[i], obj[Object.keys(obj)[i]]);
    }
}
JsonConfigFile.prototype._get = JsonConfigFile.prototype.get
JsonConfigFile.prototype.get = function (name, _default = null) {
    var getdata = this._get(name, _default); return (getdata == null) ? name : getdata
}
lang.inits({
    "import.error.PVip": "依赖 PVip 未安装,vip打折无法使用!",
    "import.warn.PMail": "依赖 PMail 未安装,已启用文件方式来给予玩家市场获得的经济",
    "import.error.PLib": "依赖 PLib 未安装,插件无法正常运行!插件将在3s后自动卸载!",
    "import.error.FinalTextures": "依赖 FinalTextures 未安装,插件无法正常运行!插件将在3s后自动卸载!",
    "lang.restore.success": "语言文件恢复完成!请重启服务器!!!,服务器将在10s后自动关闭!",
    "config.update.success": "检测到旧版配置文件,已经自动更新!",
    "shop.buy.tip": "购买物品{item.name}\n物品标准类型名:{item.id}\n物品数据值(Aux):{item.aux}\n价格:{price}/个,(原价{original_price}/个)",
    "shop.buy.title": "{info}购买物品:{item.name}",
    "log.shop.buy": "购买物品:{item.name} 物品id:{item.id} 数量:{quantity} 价格:{totalCost}",
    "log.shop.sell": "出售物品:{item.name} 物品id:{item.id} 数量:{quantity} 价格:{totalCost}",
    "gui.cancel": "取消",
    "gui.back": "返回",
    "command.ori.typeerror": "请不要在命令方块或控制台使用商店的命令",
    "command.shop.desc": "商店",
    "command.market.desc": "全球市场",
    "shop.input.buycount": "购买数量",
    "shop.sell.title": "{info}出售物品:{item.name}",
    "shop.sell.tip": "出售物品{data.name}\n物品标准类型名:{itemdata.id}\n价格:{itemdata.money}/个",
    "shop.input.sellcount": "出售数量,你当前拥有{itemCount}个,输入all出售全部",
    "shop.buy.maintitle": "{info}购买商品",
    "shop.sell.maintitle": "{info}出售商品",
    "shop.buy.group": "{info}{name}",
    "shop.sell.group": "{info}{name}",
    "shop.itembuttonname": "{item.name} {item.money}{money.name}/个",
    "shop.groupbuttonname": "{item.name}",
    "shop.button.lastpage": "上一页",
    "shop.button.nextpage": "下一页",
    "shop.group.content": "第 {page} 页,共 {totalPages} 页",
    "market.title": "主菜单",
    "market.button.buy": "购买商品",
    "market.button.ctrl": "管理商品",
    "market.button.add": "上架商品",
    "market.button.edit": "编辑商品",
    "market.money": "商品价格",
    "market.buybypartial": "是否允许部分购买",
    "market.switch.delete": "删除此商品",
})
//释放配置文件
const config = new JsonConfigFile(path + "config.json", JSON.stringify({
    money: {
        type: "llmoney",
        name: "money",
        score: "money"
    },
    commands: {
        shop: "shop",
        market: "market",
    },
    vip: {
        enable: false,
        discount: 0.8
    },
    info: {
        shop: "§l§b[商店] §r",
        market: "§l§b[市场] §r"
    },
    enable: {
        shop: true,
        market: true,
        log: true,
    },
}));
//检测旧版本配置文件自动更新
mc.listen("onServerStarted", function () {
    if (config.get("log") == null) {
        var olddata = JSON.parse(config.read());
        var newconfig = {
            money: {
                type: olddata.money,
                name: olddata.moneyname,
                score: olddata.moneyscore
            },
            commands: {
                shop: "shop",
                market: "market"
            },
            vip: {
                enable: olddata.VIPdiscount,
                discount: olddata.discount
            },
            enable: {
                shop: olddata.shop,
                market: olddata.market,
                log: olddata.log
            }
        }
        File.writeTo(path + "config.json", JSON.stringify(newconfig))
        config.reload()
        logger.warn(lang.get("config.update.success"))
    }
})
config.init("nbt", {
    MatchBucketEntityCustomName: true,
    MatchBucketEntityFallDistance: false,
    MatchBucketEntityFire: true,
    MatchBucketEntityStrength: true,
    MatchBucketEntitySheared: true,
    MatchRepairCost: false,
})
var initlogo = {
    "gui.cancel": "",
    "gui.back": "",
    "shop.buy": "",
    "shop.sell": "",
    "shop.lastpage": "",
    "shop.nextpage": "",
    "market.add": "",
    "market.add.byitemtype": "",
    "market.add.byitemnbt": "",
    "market.buy": "",
    "market.search": "",
    "market.search.normal": "",
    "market.search.better": "",
    "market.manage": "",
    "market.reduce": "",
}
same(config.get("logo"), initlogo) && config.init("logo", initlogo)
config.inits({ "itemsperpage": 10 })
const info = config.get("info").shop || "§l§b[Shop] §r";
const info2 = config.get("info").market || "§l§b[市场] §r";
var addlog
//日志
if (config.get("enable").log) {
    var addlog = function (pl, msg) {
        const date = system.getTimeObj();
        const now = new Date();
        const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        const logfile = new File(`./logs/PShop/${date.Y}-${date.M}-${date.D}.log`, file.AppendMode);
        logfile.writeSync(`${formattedDate} ${pl.realName} ${msg}\n`);
        return logfile
    }
} else var addlog = function () { }
//检测前置插件
const imports = {
    "PMail": {
        enable: false,
        regsyssendp: function () { },
        sendmail: function () { },
    },
    "PVip": {
        enable: false,
        getplvipstatus: function () { },
    },
    "PLib": {
        enable: false,
        getItem: function () { },
    },
    "FinalTextures": {
        enable: false,
        getTextures: function () { },
    },
}
//检测插件并导入相关函数
function ChecAndImportPlugin(Plugins, PluginName, ImportsNames, ImportsToNames, LoggerLevel, LoggerMsgKey, ShouldUnload = false) {
    if (Plugins.includes(PluginName)) {
        imports[PluginName].enable = true
        ImportsNames.forEach((Name, Index) => {
            imports[PluginName][ImportsToNames[Index]] = ll.import(PluginName, Name)
        })
    } else {
        if (LoggerLevel == 0) {
            logger.warn(lang.get(LoggerMsgKey))
        } else if (LoggerLevel == 1) {
            logger.error(lang.get(LoggerMsgKey))
        }
        if (ShouldUnload) {
            setTimeout(() => {
                mc.runcmd("ll unload PShop")
            }, 3000);
        }
    }
}

//检测前置插件
mc.listen("onServerStarted", () => {
    const plus = ll.listPlugins();
    const pluginsToCheck = [
        {
            name: "PVip",
            importsNames: ["get_status"],
            importsToNames: ["getplvipstatus"],
            loggerLevel: 0,
            loggerMsgKey: "import.error.PVip",
            shouldUnload: false
        },
        {
            name: "PMail",
            importsNames: ["regsystem", "addnewmail"],
            importsToNames: ["regsyssendp", "sendmail"],
            loggerLevel: 0,
            loggerMsgKey: "import.warn.PMail",
            shouldUnload: false
        },
        {
            name: "PLib",
            importsNames: ["item"],
            importsToNames: ["getItem"],
            loggerLevel: 1,
            loggerMsgKey: "import.error.PLib",
            shouldUnload: true
        },
        {
            name: "FinalTextures",
            importsNames: ["getTextures"],
            importsToNames: ["getTextures"],
            loggerLevel: 1,
            loggerMsgKey: "import.error.FinalTextures",
            shouldUnload: true
        }
    ];
    for (let i = 0; i < pluginsToCheck.length; i++) {
        const plugin = pluginsToCheck[i];
        ChecAndImportPlugin(
            plus,
            plugin.name,
            plugin.importsNames,
            plugin.importsToNames,
            plugin.loggerLevel,
            plugin.loggerMsgKey,
            plugin.shouldUnload
        );
        if (plugin.name === "PMail" && imports.PMail.enable) {
            imports.PMail.regsyssendp(info2);
        }
    }
});
//检测旧版本替换语言文件自动替换回来
mc.listen("onServerStarted", function () {
    function a() {
        if (File.exists("./resource_packs/vanilla/texts/en_US.langbackup")) {
            File.writeTo("./resource_packs/vanilla/texts/en_US.lang", File.readFrom("./resource_packs/vanilla/texts/en_US.langbackup"))
            File.delete("./resource_packs/vanilla/texts/en_US.langbackup")
            logger.warn(lang.get("lang.restore.success"))
            setTimeout(() => {
                mc.runcmd("stop")
            }, 10000)
        }
    }
    //解决部分问题
    setTimeout(a, 2000)
})
//释放商店和市场文件
const shopdatajson = new JsonConfigFile(path + "shopdata.json", JSON.stringify({
    Buy: [
        {
            name: "示例",
            type: "group",
            image: "",
            data: [
                {
                    name: "示例(苹果)",
                    type: "item",
                    image: "",
                    data: [{
                        id: "minecraft:apple",
                        aux: 0,
                        money: 10,
                    }]
                }
            ]
        }
    ],
    Sell: [
        {
            name: "示例",
            type: "group",
            image: "",
            data: [
                {
                    name: "示例(苹果)",
                    type: "item",
                    image: "",
                    data: [{
                        id: "minecraft:apple",
                        aux: 0,
                        money: 10,
                    }]
                }
            ]
        }
    ]
}));
const shopdata = JSON.parse(shopdatajson.read());
const marketdata = new JsonConfigFile(path + "marketdata.json", JSON.stringify({ data: [] }));
//定义经济操作函数
const moneys = {
    get conf() {
        return config.get("money")
    },
    /**
     * 加载配置文件
     * @returns {Boolean} 是否加载成功
     */
    loadconf() {
        try {
            switch (moneys.conf.type) {
                case "llmoney":
                    moneys.get = (player) => {
                        return Number(money.get(player.xuid))
                    }
                    moneys.add = (player, value) => {
                        player.addMoney(Number(value));
                        return true
                    }
                    moneys.reduce = (player, value) => {
                        player.reduceMoney(Number(value));
                        return true
                    }
                    break
                case "score":
                    moneys.get = (player) => {
                        return Number(player.getScore(config.get("moneyscore")))
                    }
                    moneys.add = (player, value) => {
                        player.addScore(config.get("moneyscore"), Number(value));
                        return true
                    }
                    moneys.reduce = (player, value) => {
                        player.reduceScore(config.get("moneyscore"), Number(value));
                        return true
                    }
                    break
                default:
                    function error(player) {
                        player.tell(info + Format.Red + lang.get("money.error.pl"));
                        throw new Error(lang.get("money.error"));
                    }
                    moneys.get = error
                    moneys.add = error
                    moneys.reduce = error
            }
        } catch (e) {
            throw e
        }
    },
    /**获取玩家的经济
     * @param {Player} player 玩家对象
     * @returns {number} 玩家的经济数量
     */
    get(player) { },
    /**
     * 减少玩家经济
     * @param {Player} player 玩家对象
     * @param {number} value 减少的数量
     * @returns {boolean} 是否成功减少
     */
    reduce(player, value) { },
    /**
     * 增加玩家经济
     * @param {Player} player 玩家对象
     * @param {Number} value 增加的数量
     * @returns {Boolean} 是否成功增加
     */
    add(player, value) { },
}
moneys.loadconf()
//检测正整数函数
function isPositiveInteger(number) {
    return Number.isInteger(number) && number > 0;
}
//定义扣除物品函数
/**
 * 使用物品标准类型名扣除物品
 * @param {Player} player 
 * @param {String} itemtype 
 * @param {Number} count 
 */
function reductItembytype(player, itemtype, count) {
    var inv = player.getInventory()
    var items = inv.getAllItems()
    var remainingcount = count
    var canremovecount = 0
    for (var i = 0; i < items.length; i++) {
        if (items[i].type === itemtype) {
            canremovecount += items[i].count
        }
    }
    if (canremovecount < count) { return false } else {
        for (var i = 0; i < items.length; i++) {
            if (items[i].type === itemtype) {
                inv.removeItem(i, (remainingcount - items[i].count >= 0) ? items[i].count : remainingcount)
                remainingcount -= items[i].count
                player.refreshItems()
                if (remainingcount <= 0) return true
            }
        }
    }
}
/**解析物品NBT !!史山来袭!!
 * @param {NbtCompound} nbt 物品NBT
 * @returns {Object} 物品信息
*/
function parseItemNbt(nbt) {
    try {
        var nbtobj = (Object.prototype.toString(nbt.getData).includes("function")) ? nbt : nbt.toObject();
        var nbtobjItems = null;
        var chargedItem = null;
        // 基础属性
        delete nbtobj.Damage;
        delete nbtobj.WasPickedUp;
        !!nbtobj.Block && delete nbtobj.Block.version;
        // 自定义名称相关属性
        if (typeof nbtobj.tag == "object") {
            if (!config.get("nbt").MatchEntityBucketCustomName) {
                const nameTags = ['CustomName', 'AppendCustomName', 'ColorID', 'ColorID2', 'BodyID', 'GroupName'];
                nameTags.forEach(tag => delete nbtobj.tag[tag]);
            }
            !config.get("nbt").MatchRepairCost && delete nbtobj.tag.RepairCost;
            // 实体属性
            const Tags = [
                'FallDistance', 'Fire', 'Strength', 'Sheared', 'trackingHandle',
                'definitions', 'UniqueID', 'Pos', 'Rotation', 'Motion',
                'CustomNameVisible', 'LastDimensionId', 'OnGround', 'PortalCooldown',
                'IsGlobal', 'IsAutonomous', 'LinksTag', 'LootDropped', 'StrengthMax',
                'OwnerNew', 'Sitting', 'IsOrphaned', 'IsOutOfControl', 'Saddled',
                'Chested', 'ShowBottom', 'IsGliding', 'IsSwimming', 'IsEating',
                'IsScared', 'IsStunned', 'IsRoaring', 'SkinID', 'Persistent', 'Tags',
                'Air', 'InLove', 'LoveCause', 'BreedCooldown', 'ChestItems',
                'InventoryVersion', 'LootTable', 'LootTableSeed', 'DamageTime', 'GeneArray',
                'entries', 'TimeStamp', 'HasExecuted', 'CountTime', 'TrustedPlayersAmount',
                'TrustedPlayer', 'fogCommandStack', 'properties', 'map_uuid', 'map_name_index',
                'wasJustBrewed'
            ];
            Tags.forEach(tag => delete nbtobj.tag[tag]);
            // 特殊处理Items和ChargedItem,Damage
            nbtobj.tag.Items && (nbtobjItems = nbtobj.tag.Items && delete nbtobj.tag.Items);
            nbtobj.tag && (chargedItem = nbtobj.tag.ChargedItem && delete nbtobj.tag.ChargedItem);
            (nbtobj.tag.Damage == 0) && delete nbtobj.tag.Damage;
        }
        return {
            parsednbtobj: nbtobj,
            nbtitems: nbtobjItems,
            chargedItem: chargedItem
        }
    } catch (e) { logger.error(e); }
};
function parseallitems(items) {
    var r = []
    if (items.length == 0) return r
    for (let i = 0; i < items.length; i++) {
        var pd = parseItemNbt(items[i])
        if (pd.nbtitems != null) r.push(...parseallitems(pd.nbtitems))
        if (pd.chargedItem != null) r.push(...parseallitems([pd.chargedItem]))
        r.push(pd.parsednbtobj)
    }
    return r
}

/**
 * 使用物品snbt扣除物品
 * @param {Player} player 
 * @param {String} itemsnbt 
 * @param {Number} count 
 */
function reductItembysnbt(player, itemsnbt, count) {
    var inv = player.getInventory()
    var items = inv.getAllItems()
    var remainingcount = count
    var canremovecount = 0
    var itemparsed = parseallitems([NBT.parseSNBT(itemsnbt)])
    for (var i = 0; i < items.length; i++) {
        if (same(itemparsed, parseallitems([items[i].getNbt()]))) {
            canremovecount += items[i].count
        }
    }
    if (canremovecount < count) { return false } else {
        for (var i = 0; i < items.length; i++) {
            if (same(itemparsed, parseallitems([items[i].getNbt()]))) {
                inv.removeItem(i, ((remainingcount - items[i].count) >= 0) ? items[i].count : remainingcount)
                remainingcount -= items[i].count
                player.refreshItems()
                if (remainingcount <= 0) return true
            }
        }
    }
}
function same(a, b) {
    if (typeof a == "object" && typeof b == "object") {
        if (Array.isArray(a) && Array.isArray(b)) {
            if (a.length != b.length) return false;
            for (let i = 0; i < a.length; i++) {
                if (!same(a[i], b[i])) return false;
            }
            return true;
        } else {
            for (let key in a) {
                if (!same(a[key], b[key])) return false;
            }
            return true;
        }
    } else {
        return a == b;
    }
}
/**
 * 替换字符串
 * @param {String} str 字符串
 * @param {Object} replaceobj 替换对象
 * @returns {String} 替换后的字符串
 */
function replacestr(str, replaceobj) {
    for (let key in replaceobj) {
        str = str.replaceAll("{" + key + "}", replaceobj[key])
    }
    return str
}
/**
 * 商店组gui
 * @param {Number} type 
 * @param {Player} player 玩家
 * @param {Object} data 商品数据
 * @param {Number} [page=0] 当前页码,默认为0
 */
function shopgroupgui(type, player, path, page = 0, backpages) {
    log(path)
    const groupdata = (path != "shopdata.Buy" && path != "shopdata.Sell") ? eval(path).data : eval(path);
    const ITEMS_PER_PAGE = config.get("itemsperpage"); // 每页显示的条目数
    const startIndex = page * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentPageData = groupdata.slice(startIndex, endIndex);
    const totalPages = Math.ceil(groupdata.length / ITEMS_PER_PAGE);
    const gui = mc.newSimpleForm();
    if (path == "shopdata.Buy" || path == "shopdata.Sell") {
        type == 0 ? gui.setTitle(replacestr(lang.get("shop.buy.maintitle"), { info: info })) : gui.setTitle(replacestr(lang.get("shop.sell.maintitle"), { info: info }));
    } else {
        type == 0 ? gui.setTitle(replacestr(lang.get("shop.buy.group"), { info: info, name: eval(path).name })) : gui.setTitle(replacestr(lang.get("shop.sell.group"), { info: info, name: eval(path).name }));
    }
    gui.setContent(replacestr(lang.get("shop.group.content"), { page: page + 1, totalPages: totalPages }));
    currentPageData.forEach(item => {
        var str = item.type == "item" ? str = replacestr(lang.get("shop.itembuttonname"), { "item.name": item.name, "item.money": item.data[0].money, "money.name": moneys.conf.name }) : str = replacestr(lang.get("shop.groupbuttonname"), { "item.name": item.name })
        if (item.image != null && item.image != "") {
            gui.addButton(str, item.image)
        } else if (item.type == "item") {
            gui.addButton(str, imports.FinalTextures.getTextures(item.data[0].id))
        } else {
            gui.addButton(str)
        }
    });
    // 添加翻页按钮
    if (page > 0) {
        gui.addButton(lang.get("shop.button.lastpage"), config.get("logo")["shop.lastpage"]);
    }
    if (endIndex < groupdata.length) {
        gui.addButton(lang.get("shop.button.nextpage"), config.get("logo")["shop.nextpage"]);
    }
    if (!same(backpages, [])) {
        gui.addButton(lang.get("gui.back"), config.get("logo")["gui.back"]);
    }
    player.sendForm(gui, (pl, id) => {
        if (id == null) {
            pl.tell(info + lang.get("gui.exit"));
            return;
        }
        const lastButtonIndex = currentPageData.length + (page > 0 ? 1 : 0) + (endIndex < groupdata.length ? 1 : 0);
        if (id === lastButtonIndex) {
            var path1 = path.replace(/\./g, ' ').replace(/\[/g, ' [').trim().split(/\s+/);
            var path2 = path1.slice(0, path1.length - 1)
            if (path2.at(-1) == "data") path2.pop()
            shopgroupgui(type, player, path2.reduce((acc, cur) => { if (cur.startsWith('[')) { return acc + cur; } else { return acc + (acc ? '.' : '') + cur; } }, ''), backpages[backpages.length - 1], backpages.slice(0, backpages.length - 1));
            return;
        }
        if (page > 0 && id === currentPageData.length) {
            // 上一页
            shopgroupgui(type, player, path, page - 1, backpages);
        } else if (endIndex < groupdata.length && id === currentPageData.length + (page > 0 ? 1 : 0)) {
            // 下一页
            shopgroupgui(type, player, path, page + 1, backpages);
        } else {
            const selectedData = groupdata[startIndex + id];
            if (path != "shopdata.Buy" && path != "shopdata.Sell")
                var path1 = path + ".data[" + (startIndex + id) + "]"
            else var path1 = path + "[" + (startIndex + id) + "]"
            type == 0 ? shop.buy(selectedData.type == "item" ? 0 : 1, pl, path1, backpages.concat(page)) : shop.sell(selectedData.type == "item" ? 0 : 1, pl, path1, backpages.concat(page))
        }
    });
}
//shop部分
const shop = {
    /**
     * 购买
     * @param {Number} type 0物品 1组
     * @param {Player} player 玩家
     * @param {Object} data 商品信息
     */
    buy(type, player, path, backpages) {
        if (type == 0) {
            var data = eval(path);
            var _data = data
            const itemdata = data.data[0];
            const gui = mc.newCustomForm();
            const price = config.get("VIPdiscount") && imports.PVip.getplvipstatus(player.realName) ? itemdata.money * config.get("discount") : itemdata.money;
            gui.setTitle(replacestr(lang.get("shop.buy.title"), { info: info, "item.name": data.name, "item.money": itemdata.money }));
            gui.addLabel(replacestr(lang.get("shop.buy.tip"), { "item.name": data.name, "price": price, "item.id": itemdata.id, "item.aux": itemdata.aux, "original_price": itemdata.money }));
            gui.addInput(lang.get("shop.input.buycount"));
            player.sendForm(gui, (pl, data) => {
                if (data == null || data[1] == "") {
                    var path1 = path.replace(/\./g, ' ').replace(/\[/g, ' [').trim().split(/\s+/);
                    var path2 = path1.slice(0, path1.length - 1)
                    if (path2.at(-1) == "data") path2.pop()
                    shopgroupgui(type, player, path2.reduce((acc, cur) => { if (cur.startsWith('[')) { return acc + cur; } else { return acc + (acc ? '.' : '') + cur; } }, ''), backpages[backpages.length - 1], backpages.slice(0, backpages.length - 1));
                    return
                }
                const quantity = Number(data[1]);
                if (!isPositiveInteger(quantity)) {
                    pl.tell(info + lang.get("shop.mustnum"));
                    return
                }
                const totalCost = price * quantity;
                if (moneys.get(pl) < totalCost) {
                    pl.tell(info + lang.get("shop.buy.no") + moneys.get(pl));
                } else {
                    moneys.reduce(pl, totalCost) && mc.runcmdEx(`give "${pl.realName}" ${itemdata.id} ${quantity} ${itemdata.aux} `)
                    addlog(player, replacestr(lang.get("log.shop.buy"), { "item.name": _data.name, "item.id": itemdata.id, "quantity": quantity, "totalCost": totalCost }))
                }
            })
        } else {
            shopgroupgui(0, player, path, 0, backpages)
        }
    },
    sell(type, player, path, backpages) {
        if (type == 0) {
            var data = eval(path);
            var _data = data
            const itemdata = data.data[0];
            const gui = mc.newCustomForm();
            gui.setTitle(replacestr(lang.get("shop.sell.title"), { info: info, "item.name": data.name }));
            gui.addLabel(replacestr(lang.get("shop.sell.tip"), { "data.name": data.name, "itemdata.id": itemdata.id, "itemdata.money": itemdata.money }));
            const itemCount = player.getInventory().getAllItems().reduce((acc, item) => item.type === itemdata.id && item.aux === itemdata.aux ? acc + item.count : acc, 0);
            gui.addInput(replacestr(lang.get("shop.input.sellcount"), { itemCount: itemCount }))
            player.sendForm(gui, (pl, data) => {
                if (data == null || data[1] == "") {
                    var path1 = path.replace(/\./g, ' ').replace(/\[/g, ' [').trim().split(/\s+/);
                    var path2 = path1.slice(0, path1.length - 1)
                    if (path2.at(-1) == "data") path2.pop()
                    shopgroupgui(type, player, path2.reduce((acc, cur) => { if (cur.startsWith('[')) { return acc + cur; } else { return acc + (acc ? '.' : '') + cur; } }, ''), backpages[backpages.length - 1], backpages.slice(0, backpages.length - 1));
                    return
                }
                const quantity = data[1] == "all" ? itemCount : Number(data[1]);
                if (!isPositiveInteger(quantity) && quantity != 0) {
                    pl.tell(info + lang.get("shop.mustnum"));
                    return
                } else if (quantity == 0) {
                    pl.tell(info + lang.get("shop.sell.no") + itemCount)
                    return
                }
                const totalgive = quantity * itemdata.money;
                if (itemCount < quantity) {
                    pl.tell(info + lang.get("shop.sell.no") + itemCount);
                } else {
                    reductItembytype(pl, itemdata.id, quantity) && moneys.add(pl, totalgive)
                    pl.tell(info + lang.get("shop.sell.ok"))
                    addlog(player, replacestr(lang.get("log.shop.sell"), { "item.name": _data.name, "item.id": itemdata.id, "quantity": quantity, "totalCost": totalgive }))
                }
            })
        } else {
            shopgroupgui(1, player, path, 0, backpages)
        }
    }
}
if (config.get("enable").shop) {
    const com = mc.newCommand(config.get("commands").shop, lang.get("command.shop.desc"), PermType.Any);
    com.setEnum("action", ["gui", "buy", "sell"]);
    com.optional("action", ParamType.Enum, "action", "action", 1);
    com.overload(["action"]);
    com.setCallback((_cmd, ori, out, res) => {
        if (ori.type !== 0) {
            out.error(lang.get("command.ori.typeerror"));
            return;
        }
        const player = ori.player;
        const action = res.action || "gui";
        switch (action) {
            case "gui":
                const shopGui = mc.newSimpleForm();
                shopGui.setTitle(info);
                shopGui.addButton(replacestr(lang.get("shop.buy.maintitle"), { info: "" }), config.get("logo")["shop.buy"]);
                shopGui.addButton(replacestr(lang.get("shop.sell.maintitle"), { info: "" }), config.get("logo")["shop.sell"]);
                shopGui.addButton(lang.get("gui.cancel"), config.get("logo")["gui.cancel"]);
                player.sendForm(shopGui, (pl, id) => {
                    if (id == null || id === 2) {
                        pl.tell(info + lang.get("gui.exit"));
                        return;
                    }
                    const menuType = id === 0 ? "Buy" : "Sell";
                    shopgroupgui(id, player, "shopdata." + menuType, 0, [])
                });
                break;
            case "buy":
                shop.buy(1, player, { name: replacestr(lang.get("shop.buy.maintitle"), { info: "" }), data: shopdata.Buy, type: "group" });
                break;
            case "sell":
                shop.sell(1, player, { name: replacestr(lang.get("shop.sell.maintitle"), { info: "" }), data: shopdata.Sell, type: "group" });
                break;
        }
    });
    com.setup();
}


//market部分咕咕咕
const market = {
    /**
     * 打开主GUI
     * @param {Player} player 
     */
    main(player) {
        const gui = mc.newSimpleForm();
        gui.setTitle(info2)
        gui.addButton(lang.get("market.button.buy"))
        gui.addButton(lang.get("market.button.ctrl"))
        gui.addButton(lang.get("gui.cancel"))
        player.sendForm(gui, (pl, id) => {
            if (id == null || id === 2) {
                pl.tell(info + lang.get("gui.exit"));
                return;
            }
        })
    }
}










mc.listen("onServerStarted", () => {
    log(`PShop 商店系统插件---加载成功,当前版本:${versions[1]}${fix} 作者: ${author}`);
    if (fix != "" && fix != " Release") logger.warn("你现在使用的版本为开发版,请勿用于生产环境!!!")
})
/*debug命令
mc.regConsoleCmd("d", "debug", (args) => {
    eval(args[0])
})
mc.regPlayerCmd("d", "debug", (player, args) => {
    player.tell(JSON.stringify(eval(args[0])) || "canttojson")
    player.tell(String(eval(args[0])) || "canttostr")
})
var var1, var2 = null
mc.regPlayerCmd("dd", "debug", (player, args) => {
    var1 = eval(args[0])
})
mc.regPlayerCmd("ddd", "debug", (player, args) => {
    var2 = eval(args[0])
})*/