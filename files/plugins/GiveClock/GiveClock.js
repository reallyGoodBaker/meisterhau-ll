/// <reference path="e:/code/LLSE/dts/helperlib/src/index.d.ts"/>
const config = readConfig();
loadPlugin();
/**
 * 读取配置文件
 */
function readConfig() {
    const defaultConfig = {
        getClockCommand: "getclock",
        getClockCommandAlias: "gc",
        runCommandOnUseClock: false,
        onUseClockRunCommand: 'list',
        runCommandOnUseClockOn: false,
        onUseClockOnRunCommand: 'list'
    };
    const jsonConfigFile = new JsonConfigFile("plugins/GiveClock/config.json", JSON.stringify(defaultConfig));
    const config = JSON.parse(jsonConfigFile.read());
    jsonConfigFile.close();
    return config;
}
/**
 * 加载插件
 */
function loadPlugin() {
    ll.registerPlugin("GiveClock", "进服检测背包自动给钟，指令获取钟，建议配合钟菜单使用。", [1, 2, 0, Version.Release], {
        "author": "XCLHove",
        "github": "https://github.com/xclhove/LiteLoaderPlugins-GiveClock",
        "gitee": "https://gitee.com/xclhove/LiteLoaderPlugins-GiveClock"
    });
    logger.setTitle("GiveClock");
    logger.setConsole(true, 4);
    //在服务器开服后注册命令
    mc.listen("onServerStarted", () => {
        try {
            registerCommands();
        }
        catch (e) {
            logger.error(`'${config}', /getclock命令注册失败!请检查是否有其他插件占用!`);
            logger.error("Message: ", e.message);
        }
    });
    logger.info("给钟插件已加载！");
    logger.info("插件开源地址(gitee)：https://gitee.com/xclhove/LiteLoaderPlugins-GiveClock");
    logger.info("插件开源地址(github)：https://github.com/xclhove/LiteLoaderPlugins-GiveClock");
}
/**
 * 注册命令
 */
function registerCommands() {
    mc.listen("onJoin", (player) => {
        //进服给钟
        givePlayerClock(player);
        //进服提示
        const message = `${Format.Italics}${Format.DarkGreen}获取钟请输入：/${config.getClockCommand} 或 /${config.getClockCommandAlias}`;
        player.tell(message);
    });
    //注册指令：注册获取钟的顶层指令
    const getClockCommand = mc.newCommand(config.getClockCommand, `${Format.Italics}${Format.DarkGreen}获取钟`, PermType.Any, 0x80, config.getClockCommandAlias);
    //配置指令：新增一条指令重载
    getClockCommand.overload([]);
    //配置指令：设置指令回调函数(执行指令就会执行回调函数)
    getClockCommand.setCallback((command, origin) => {
        //非玩家执行命令不给钟
        if (origin.type !== OriginType.Player) {
            return;
        }
        //给玩家发放钟
        const player = origin.player;
        givePlayerClock(player);
    });
    //安装指令：安装指令
    getClockCommand.setup();
    //玩家使用钟时执行命令
    if (config.runCommandOnUseClock) {
        onUseClockRunCommand(config.onUseClockRunCommand);
    }
    //玩家对方块使用钟时执行命令
    if (config.runCommandOnUseClockOn) {
        onUseClockOnRunCommand(config.onUseClockOnRunCommand);
    }
}
/**
 * 给玩家发放钟
 * @param player 要发放钟的玩家
 */
function givePlayerClock(player) {
    // 获取背包
    const playerBackpack = player.getInventory();
    //通过设置nbt使钟不会掉落
    const clock = mc.newItem("minecraft:clock", 1);
    const clockNbt = clock.getNbt();
    clockNbt.setTag("tag", new NbtCompound({
        "minecraft:item_lock": new NbtByte(2)
    }));
    clock.setNbt(clockNbt);
    //检查玩家背包空间是否充足
    if (!playerBackpack.hasRoomFor(clock)) {
        //背包空间不足则提示
        player.tell(`${Format.Italics}${Format.DarkGreen}背包空间不足，请清理后再获取！`);
        return;
    }
    //检查玩家背包中是否有钟
    for (let index = 0; index < playerBackpack.size; index++) {
        const item = playerBackpack.getItem(index);
        //为空则跳过
        if (!item.type) {
            continue;
        }
        //背包中有钟则提示
        if (item.match(clock)) {
            player.tell(`${Format.Italics}${Format.DarkGreen}背包中已有钟！`);
            return;
        }
    }
    //给玩家发放钟并提示
    player.giveItem(clock);
    player.tell(`${Format.Italics}${Format.DarkGreen}钟已发放，请查看背包!`);
}
/**
 * 玩家使用钟时让玩家执行指定命令
 * @param {String} command 执行的命令
 */
function onUseClockRunCommand(command) {
    const clock = mc.newItem("minecraft:clock", 1);
    mc.listen("onUseItem", (player, item) => {
        if (item.type === clock.type) {
            player.runcmd(command);
        }
    });
}
/**
 * 玩家对方块使用钟时让玩家执行指定命令
 * @param {String} command 执行的命令
 */
function onUseClockOnRunCommand(command) {
    const clock = mc.newItem("minecraft:clock", 1);
    mc.listen("onUseItemOn", (player, item) => {
        if (item.type === clock.type) {
            player.runcmd(command);
        }
    });
}
