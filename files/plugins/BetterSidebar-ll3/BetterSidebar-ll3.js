// LiteLoader-AIDS automatic generated
/// <reference path="c:\Users\Yoyo/dts/helperlib/src/index.d.ts"/> 

/**
 * 插件:更好的侧边栏
 * 作者:Yoyo
 * 版本:0.1.20
 * 想要支持BAPI需要以下前置插件
 * GMLIB - 功能强大的前置库   下载地址  https://www.minebbs.com/resources/gmlib.6636/
 * GMLIB-LegacyRemoteCallApi    下载地址 https://www.minebbs.com/resources/gmlib-legacyremotecallapi-gmlib-remotecallapi.7159/
 */

const pluginName = 'BetterSidebar';//插件名
const pluginVersion = [0, 1, 20];//版本
let sidebarClass = null;//类的实例化对象
ll.registerPlugin(pluginName, '一个丰富的侧边栏插件', pluginVersion, {
    author: 'Yoyo',
    qq: '1294858802'
});//注册插件

const CONFIG = new JsonConfigFile('./plugins/Yoyo/BetterSidebar/newConfig.json', JSON.stringify({
    hz: 800,//刷新频率 毫秒
    on: {
        money: {
            '<=0': '{num}一干二净',//{num}是当前记分项的值
            '=100': '{num}小钱带',
            '500': '{num}钱包鼓鼓',// = 可以忽略不写
            '>1000': '{num}小富',
            '>=5000': '{num}富豪',
            '>=100000': '富可敌国'
        }
    },//记分板监听 显示不同字符串
    title: [
        "§1§g\\§5欢迎您加入! §g\\",
        "§1§g|§5欢迎您加入! §g|",
        "§1§g/§5欢迎您加入! §g/",
        "§1§g-§5欢迎您加入! §g-"
    ],
    data: [
        "§e#§d#§b#§g#个§e人§d信§b息§e#§d#§b#§g#",
        "§e你好,§g{pl.realName}",
        "§gY币:§5{pl.getScore(money)}",
        "§g: §3{pl.llmoney}",
        "§e#§d#§b#§g#其§e它§d信§b息§e#§d#§b#§g#",
        [
            "§g平  台: §5{dv.os}",
            "§g延  迟: {js:(dv.avgPing>=100?'§4':'§2')+dv.avgPing}ms",
            "§g版  本:§6{yoyo.bdsv}"
        ],
        "§g掉落物: §4{js:(yoyo.itemDetailSum>=1000?'§4':'§2')+yoyo.itemDetailSum},§g生  物: §4{yoyo.beingSum}",
        "§g玩  家: §5{yoyo.playerSum},§g朝向:§5{pl.directionStr}",
        "§3{date.D}§g号,§g时间:§3{date.h}:{date.m}:{date.s}",
        [
            "§gTps : §5{yoyo.tps}§g ♪   ",
            "§gTps : §5{yoyo.tps}§g    ♪ ",
            "§gTps : §5{yoyo.tps}§g      ♪",
            "§gTps : §5{yoyo.tps}§g    ♪ ",
            "§gTps : §5{yoyo.tps}§g ♪   "
        ],
        "§g提示: {js:date.h>=22||date.h<4?'§l§8夜深了!':'§3加油肝!'}"
    ]
}));



class Sidebar {

    #hz = 800;//刷新频率
    #title = [];//侧边栏标题数据
    #data = [];//侧边栏数据
    #variableAll = {};//当前侧边栏配置使用的变量集合
    #variableAllData = {
        yoyo: {
            playerSum: 0,//在线玩家数量
            itemSum: 0,//掉落物实体数量
            itemDetailSum: 0,//掉落物物品数量
            beingSum: 0,//生物实体数量(除玩家)
            llv: ll.versionString(),//ll加载器版本
            bdsv: mc.getBDSVersion(),//bds版本
            bdsa: mc.getServerProtocolVersion(),//bds版本协议
            tps: 0,//游戏tps
        },
        dv: {},
        pl: {},
        date: {}
    };//公共变量数据缓存

    #traverseIndexs = {
        title: 0,
        data: {}
    };//遍历索引(实现每个数组都能各种按顺序动态跳动)

    constructor() {
        this.init();//初始化配置
        // 开始定时遍历
        this.#TimingTraversal();
    }

    /**
     * 初始化配置
     */
    init() {
        this.#hz = CONFIG.get('hz');//初始化hz
        this.#title = CONFIG.get('title');//初始化标题
        this.#data = CONFIG.get('data');//初始化内容
        // 得到侧边栏配置 所有在使用的变量
        this.#getSidebarVariable();
        // 初始化所有索引
        this.#getTraverseIndexs();
    }

    /**
     * 开始定时递归任务
     */
    #TimingTraversal() {
        // 普通定时周期 方式
        setInterval(() => {
            this.#TraversalAll();//遍历全部
        }, this.#hz);
    }

    /**
     * 遍历玩家
     */
    #TraversalPlayer(pl) {
        // 在这里初始化每个玩家自身的
        this.getdv(pl);//获取用户设备
        if (this.#variableAll.pl > 0) this.getpl(pl);
        // 开始渲染玩家侧边栏
        let siTitle = this.#Rendering(Array.isArray(this.#title) ? this.#title.concat() : this.#title, 'title');
        let siDataArr = this.#Rendering(this.#data.concat(), 'data');
        let siData = {};
        siDataArr.forEach((v, k) => {
            siData[v] = k;
        });

        pl.removeSidebar();//先移除
        pl.setSidebar(siTitle, siData, 0);
    }

    /**
     * 渲染(变量)数据
     * @param {String|Array} data 需要渲染的数据
     * @returns {String|Array} 渲染好的数据
     */
    #Rendering(datas, type = 'title') {
        if (type == 'title') {
            if (this.#traverseIndexs.title == null) {
                return this.#varToData(datas);//返回设置好的文本
            } else {
                if (this.#traverseIndexs.title.index >= (this.#traverseIndexs.title.len - 1)) {
                    this.#traverseIndexs.title.index = 0;
                } else {
                    this.#traverseIndexs.title.index++;
                }

                return this.#varToData(datas[this.#traverseIndexs.title.index]);//返回设置好的文本
            }
        } else {
            //data数据
            let dataArr = [];
            for (let inx in datas) {
                if (this.#traverseIndexs.data[inx] == null) {
                    dataArr = dataArr.concat(this.#varToData(datas[inx]));//返回设置好的文本
                } else {
                    if (this.#traverseIndexs.data[inx].index >= (this.#traverseIndexs.data[inx].len - 1)) {
                        this.#traverseIndexs.data[inx].index = 0;
                    } else {
                        this.#traverseIndexs.data[inx].index++;
                    }
                    dataArr = dataArr.concat(this.#varToData(datas[inx][this.#traverseIndexs.data[inx].index]));//返回设置好的文本
                }
            }
            return dataArr;
        }
    }


    #varToData(str) {
        let dass = this.#parseVar(str);
        for (let index in dass) {
            let repData = '';
            if (dass[index].key.toLowerCase() == 'js:') {
                // 是JS表达式
                try {
                    let { pl, yoyo, date, dv } = this.#variableAllData;//方便js表达式调用内部数据
                    repData = eval(dass[index].value);
                    repData = this.#isTypeof(repData) == 'undefined' ? 'null' : repData;//空的返回null
                } catch (error) {
                    repData = '{js:error}';//发生错误替换默认文本
                    logger.error(`配置第${(Number(index) + 1)}个js表达式出现错误:\n`, error);
                }
            } else {
                // 正常变量调用
                if (/.+\)$/.test(dass[index].value)) {
                    // 是调用函数
                    dass[index].value.replace(/(.+)\((.+)?\)$/, (...ages) => {
                        // 调用函数
                        if (/\./.test(dass[index].key)) {
                            // 多层
                            let keyarr = dass[index].key.match(/[^\.]+/g);
                            repData = this.#variableAllData;
                            for (let index in keyarr) {
                                repData = repData[keyarr[index]];
                            }
                            repData = repData[ages[1]](ages[2]);

                        } else {
                            repData = this.#variableAllData[dass[index].key][ages[1]](ages[2]);
                        }
                    });
                } else {
                    if (/\./.test(dass[index].key)) {
                        // 多层
                        let keyarr = dass[index].key.match(/[^\.]+/g);
                        repData = this.#variableAllData;
                        for (let index in keyarr) {
                            repData = repData[keyarr[index]];
                        }
                        repData = repData[dass[index].value];

                    } else {
                        if (/(bep|b)/i.test(dass[index].key)) {
                            if (isBEP) {
                                if (/:(player|pl)$/i.test(dass[index].value)) {
                                    // 玩家变量
                                    let values = String(dass[index].value).split(':');
                                    repData = PAPI.translateStringWithPlayer(`%${values[0]}%`, this.#variableAllData.pl);
                                } else {
                                    // 服务器变量
                                    repData = PAPI.translateString(`%${dass[index].value}%`);
                                }
                            } else {
                                repData = '{NoBep}';
                            }
                        } else {
                            repData = this.#variableAllData[dass[index].key][dass[index].value];
                        }
                    }
                }
            }



            if (dass[index].key.toLowerCase() == 'js:') {
                // 把js表达式替换成 指定内容
                str = str.replaceAll(`{${dass[index].key}${dass[index].value}}`, repData);
            } else {
                // 把布尔值转中文
                if (this.#isTypeof(repData) == 'boolean') {
                    repData = repData ? '是' : '否';
                }

                // 把小数保留两位小数
                if (Number(repData) == repData && /\./.test(repData)) {
                    repData = Number(repData).toFixed(2);
                }
                // 把变量替换成 指定内容
                str = str.replaceAll(`{${dass[index].key}.${dass[index].value}}`, repData);
            }
        }
        return str;
    }

    /**
     * 遍历全部
     */
    #TraversalAll() {
        this.#initPublicVariable();//初始化公告变量库 初始化后设置为缓存 (玩家调用就可以直接获取值 降低性能开销)
        let players = mc.getOnlinePlayers();//获取所有在线玩家
        this.#variableAllData.yoyo.playerSum = players.length;//更新玩家数量
        for (let index in players) {
            if (!this.#FilterPlayer(players[index])) {
                continue;//如果不符合就跳过这个玩家
            }
            try {
                this.#TraversalPlayer(players[index]);//对该玩家进行侧边栏更新
            } catch (error) {
                logger.error('[插件内部:错误拦截] 设置玩家[' + players[index].realName + ']侧边栏出现错误:', error);
            }

        }
        return true;//一轮更新完成
    }

    /**
     * 过滤不需要的玩家(提高效率)
     * @param {player} pl 
     */
    #FilterPlayer(pl) {
        if (pl.isSimulatedPlayer()) return false;//过滤模拟玩家
        if (pl.isLoading) return false;//过滤没有加载的玩家
        if (pl.isInsidePortal) return false;//过滤在传送们中的玩家
        if (pl.isSleeping) return false;//过滤在睡觉的玩家
        if (pl.getExtraData('sidebarYoyo') == 'false') return false;//过滤已经关闭的玩家
        return true;
    }

    /**
     * 初始化公告变量库 初始化后设置为缓存 (玩家调用就可以直接获取值 降低性能开销)
     */
    #initPublicVariable() {

        /**
         * yoyo公共的初始化
         */
        if (this.#variableAll.yoyo > 0) this.getyoyo();

        /**
         * 时间公共的
         */
        if (this.#variableAll.date > 0) {
            this.#variableAllData.date = this.getdate();
        }
    }

    /**
     * 得到侧边栏配置 所有在使用的变量(用啥调用啥 合理安排资源 杜绝浪费 )
     */
    #getSidebarVariable() {
        let varAllList = [];
        varAllList = varAllList.concat(this.#RecuOutVar(this.#data));
        varAllList = varAllList.concat(this.#RecuOutVar(this.#title));
        let allvarType = {};
        varAllList.forEach(v => {
            if (allvarType[v.key]) {
                allvarType[v.key]++;
            } else {
                allvarType[v.key] = 1;
            }
        });
        this.#variableAll = allvarType;
    }

    /**
     * 根据数据结构得到遍历的索引初始化
     */
    #getTraverseIndexs() {
        if (this.#isTypeof(this.#title) == 'array') {
            this.#traverseIndexs.title = { index: 0, len: this.#title.length };
        } else {
            this.#traverseIndexs.title = null;//就是没有下级或者不是数组
        }


        this.#traverseIndexs.data = {};

        for (let index in this.#data) {
            if (this.#isTypeof(this.#data[index]) == 'array') {
                this.#traverseIndexs.data[index] = { index: 0, len: this.#data[index].length };
            } else {
                this.#traverseIndexs.data[index] = null;
            }
        }

    }

    /**
     * 递归出变量
     */
    #RecuOutVar(arr) {
        let variableList = [];
        for (let index in arr) {
            if (this.#isTypeof(arr[index]) == 'array') {
                variableList = variableList.concat(this.#RecuOutVar(arr[index]));
            } else {
                variableList = variableList.concat(this.#parseVar(String(arr[index])));
            }
        }
        return variableList;
    }
    /**
     * 解析字符串变量
     * @param {String} str 
     */
    #parseVar(str) {
        str = String(str);//防止意外错误
        let varList = str.match(/\{[^\{\}]+\.[^\{\}]+\}/g) || [];
        return varList.map(v =>
            JSON.parse(v.replace(/^\{(js:)?([^\{\}]+)\.([^\{\}]+)\}$/i, (...ages) => {
                if (String(ages[1]).toLowerCase() == 'js:') {
                    // 是JS表达式
                    return JSON.stringify({ key: ages[1], value: ages[2] + '.' + ages[3] });
                } else {
                    // 正常变量
                    return JSON.stringify({ key: ages[2], value: ages[3] });
                }
            })));
    }

    /**
         * 判断类型 
         * @param {Any} data 
         * @returns {string} 小写
         */
    #isTypeof(data) {
        let type = Object.prototype.toString.call(data);
        return type.replace(/^\[object (.+)\]$/, '$1').toLowerCase();
    }

    // 其它变量获取函数

    getdv(pl) {
        this.#variableAllData.dv = pl.getDevice();
    }

    getyoyo() {
        let entAll = mc.getAllEntities();

        this.#variableAllData.yoyo.tps = yoyo['tps'];
        let itemSum = 0;
        let itemDetailSum = 0;
        let beingSum = 0;
        for (let index in entAll) {
            if (entAll[index].isItemEntity()) {
                itemSum++;
                itemDetailSum += entAll[index].toItem().count;
            } else {
                beingSum++;
            }
        }

        this.#variableAllData.yoyo.itemSum = itemSum;
        this.#variableAllData.yoyo.itemDetailSum = itemDetailSum;
        this.#variableAllData.yoyo.beingSum = beingSum;
    }

    /**
     * 暴露#variableAllData
     * @returns 
     */
    getVariableAllData() {
        return this.#variableAllData;
    }

    getdate() {
        return system.getTimeObj();
    }

    getpl(pl) {
        Object.defineProperty(pl, 'llmoney', {
            get(key) {
                return money.get(pl.xuid) || 0;
            }
        });
        pl.getScore = (function (oriFunc) {
            return function (name) {
                if (!mc.getScoreObjective(name)) {
                    // 当不存在的时候自动帮忙创建记分板
                    mc.newScoreObjective(name, 'BetterSidebar_Create');
                }
                // 加载on监听
                let scoreOn = CONFIG.get('on');
                if (scoreOn && scoreOn[name]) {
                    //存在 并且符合规则才管 
                    let scoreOnList = Object.keys(scoreOn[name])
                        .filter(v => /^(=|<=|>=|<|>)?(\d+)$/.test(v))
                        .map(v => ({ str: v, ...JSON.parse(v.replace(/^(=|<=|>=|<|>)?(\d+)$/, (...ages) => JSON.stringify({ eq: ages[1] || '==', value: ages[2] }))) }));
                    let scoreNum = oriFunc.call(pl, name);
                    let scoreShow = scoreNum;
                    scoreOnList.forEach(v => {
                        if (v.eq == '=') v.eq = '==';
                        if (eval(scoreNum + v.eq + v.value)) {
                            scoreShow = scoreOn[name][v.str];//设置监听显示对应内容
                        }
                    });
                    scoreShow = String(scoreShow).replaceAll('{num}', scoreNum);//替换金额
                    return scoreShow;//返回显示
                }
                return oriFunc.call(pl, name);
            }
        }(pl.getScore));//重构getScore函数

        pl.directionStr = pl.direction == 0 ? '东' : (pl.direction == 1 ? '南' : (pl.direction == 2 ? '西' : '北'));
        this.#variableAllData.pl = pl;
    }

}

const isBEP = ll.hasExported("BEPlaceholderAPI", "GetValue");
let PAPI = null;
Function.prototype.getName = function () {
    return this.name || this.toString().match(/function\s*([^(]*)\(/)[1];
}
if (isBEP) {
    // 自己引入 防止删除 BEPlaceholderAPI.dll 然后库还在导致的问题
    PAPI = {
        getValue: ll.import("BEPlaceholderAPI", "GetValue"),
        getValueByPlayer: ll.import("BEPlaceholderAPI", "GetValueWithPlayer"),
        PAPIregisterServerPlaceholderAPI: ll.import("BEPlaceholderAPI", "registerServerPlaceholder"),
        PAPIregisterPlayerPlaceholderAPI: ll.import("BEPlaceholderAPI", "registerPlayerPlaceholder"),
        PAPIregisterStaticPlaceholderAPI: ll.import("BEPlaceholderAPI", "registerStaticPlaceholder"),
        registerServerPlaceholder(func, PluginName, PAPIName) {
            ll.export(func, PluginName, func.getName());
            this.PAPIregisterServerPlaceholderAPI(PluginName, func.getName(), PAPIName);
        },
        registerPlayerPlaceholder(func, PluginName, PAPIName) {

            ll.export(func, PluginName, func.getName());
            this.PAPIregisterPlayerPlaceholderAPI(PluginName, func.getName(), PAPIName);
        },
        registerStaticPlaceholder(func, PluginName, PAPIName, UpdateInterval) {
            ll.export(func, PluginName, func.getName());
            this.PAPIregisterStaticPlaceholderAPI(PluginName, func.getName(), PAPIName, UpdateInterval);
        },
        translateString: ll.import("BEPlaceholderAPI", "translateString"),//转换模板
        translateStringWithPlayer: ll.import("BEPlaceholderAPI", "translateStringWithPlayer"),//转换玩家模板
        unRegisterPlaceholder: ll.import("BEPlaceholderAPI", "unRegisterPlaceholder"),

    };
}



mc.listen("onServerStarted", () => {
    regCmd();//注册命令
    sidebarClass = new Sidebar();
    if (isBEP) {
        // 注册一些变量(yoyo里面的)
        PAPI.registerServerPlaceholder(function (obj) {
            if (obj['<value>']) {
                let VariableAllData = sidebarClass.getVariableAllData();
                let getValues = VariableAllData.yoyo[obj['<value>']];
                if (typeof getValues !== 'undefined') {
                    return JSON.stringify(getValues);
                }
            }
            return '{error}';
        }, pluginName, 's_yoyo_<value>');
    }
    logger.warn('[更好的侧边栏] 加载完成! v ' + pluginVersion.join('.') + ' 作者: Yoyo qq: 1294858802');
});

//注册命令
function regCmd() {
    const cmd = mc.newCommand("sidebar", "§l§g设置侧边栏开关(§2开|§4关) 菜单", PermType.Any);
    cmd.setEnum("plActions", ["off", "on", "true", "false", "开", "关"]);//完全是兼容旧版本
    cmd.setEnum("opActions", ["reload"]);
    cmd.mandatory("plAction", ParamType.Enum, "plActions", 1);
    cmd.mandatory("opAction", ParamType.Enum, "opActions", 1);
    cmd.overload(["plAction"]);
    cmd.overload(["opAction"]);
    cmd.overload([]);
    cmd.setCallback((_cmd, _ori, out, res) => {
        const cmdpl = _ori.player;

        // 都没选择就是打开表单(只能玩家)
        if (!res.plAction && !res.opAction) {
            if (!cmdpl) return out.error('需要玩家自身才能执行！');
            // 显示操作菜单
            let utw = mc.newSimpleForm();
            utw.setTitle('§l§5更好的侧边栏');
            utw.addButton('§l§2开启侧边栏');
            utw.addButton('§l§4关闭侧边栏');
            if (cmdpl.isOP()) {
                utw.addButton('§l§g重载侧边栏配置§5(OP)');
            }
            cmdpl.sendForm(utw, (pl, id) => {
                if (id == null && id !== 0) return;
                if (id == 0) {
                    pl.setExtraData('sidebarYoyo', 'true');
                    pl.tell('§l§e[更好的侧边栏]§g 状态更新:§2开');
                } else if (id == 1) {
                    pl.setExtraData('sidebarYoyo', 'false');
                    pl.tell('§l§e[更好的侧边栏]§g 状态更新:§4关');
                    pl.removeSidebar();//先移除
                } else if (id == 2 && pl.isOP()) {
                    CONFIG.reload();
                    sidebarClass.init();//初始化配置
                    mc.sendCmdOutput('[更好的侧边栏] 配置文件已重新加载完成! 作者:Yoyo QQ:1294858802 接定制插件哦!信誉诚信!');
                    pl.tell('§l§e[更好的侧边栏]§g 配置文件已重新加载完成! §d作者:§5Yoyo §dQQ:§51294858802 §e接定制插件哦!信誉诚信!');
                } else {
                    pl.tell('§l§e[更好的侧边栏]§4 您的操作失败,请检查是否有权限!');
                }
            });
            return;
        }

        // 需要玩家执行的命令
        if (res.plAction) {
            if (!cmdpl) return out.error('需要玩家自身才能执行！');
            let status = 'true';
            if (["off", "false", "关"].includes(res.plAction)) {

                status = 'false';
                cmdpl.removeSidebar();//先移除
            }
            cmdpl.setExtraData('sidebarYoyo', status);
            cmdpl.tell('§l§e[更好的侧边栏]§g 状态更新:' + (status == 'true' ? '§2开' : '§4关'));
        }

        // op专属的（命令方块和npc和后台控制可以无视）
        if (res.opAction && cmdpl && !cmdpl.isOP()) return out.error('你没有权限使用该命令!');

        if (res.opAction == 'reload') {
            CONFIG.reload();
            sidebarClass.init();//初始化配置
            return out.success('[更好的侧边栏] 配置文件已重新加载完成! 作者:Yoyo QQ:1294858802 接定制插件哦!信誉诚信!');
        }

    });
    cmd.setup();
}

const yoyo = { tps: '20.00' };
mc.listen("onTick", () => {
    if (yoyo['tps_Count'] == null) {
        yoyo['tps_Time_start'] = Date.now();
        yoyo['tps_Time_end'] = 0;
        yoyo['tps_Count'] = 0;
    } else {
        yoyo['tps_Count']++;
    }
    if (yoyo['tps_Count'] != null && yoyo['tps_Count'] >= 20) {
        yoyo['tps_Time_end'] = Date.now();
        let indirect = Math.floor((yoyo['tps_Time_end'] - yoyo['tps_Time_start']) / 1000 * 100) / 100;
        yoyo['tps'] = (20 / indirect).toFixed(2) > 20 ? '20.00' : (20 / indirect).toFixed(2);
        yoyo['tps_Count'] = null;
    }
});