// LiteLoader-AIDS automatic generated
/// <reference path="e:/code/LLSE/dts/helperlib/src/index.d.ts"/>
var EditType;
(function (EditType) {
    EditType["DELETE"] = "\u5220\u9664";
    EditType["REVISE"] = "\u4FEE\u6539";
})(EditType || (EditType = {}));
var ItemType;
(function (ItemType) {
    ItemType["OPEN_MENU"] = "\u6253\u5F00\u83DC\u5355";
    ItemType["EXEC_COMMAND"] = "\u6267\u884C\u6307\u4EE4";
})(ItemType || (ItemType = {}));
const config = redConfig();
let menuPages = readMenu();
registerCommands();
/**
 * 注册命令
 */
function registerCommands() {
    ll.registerPlugin("XMenu", "X菜单", [1, 0, 0, Version.Release], {
        "author": "XCLHove",
        "github": "https://github.com/xclhove/LiteLoaderPlugins-XMenu",
        "gitee": "https://gitee.com/xclhove/LiteLoaderPlugins-XMenu"
    });
    const openMenuCommand = mc.newCommand(config.openMenuCommand, '打开菜单', PermType.Any, 0x80, config.openMenuCommandAlias);
    openMenuCommand.setCallback(openMenuCommandCallback);
    openMenuCommand.overload([]);
    openMenuCommand.setup();
    const editMenuCommand = mc.newCommand(config.editMenuCommand, '编辑菜单', PermType.GameMasters, 0x80, config.editMenuCommandAlias);
    editMenuCommand.setCallback(editMenuCommandCallback);
    editMenuCommand.overload([]);
    editMenuCommand.setup();
    if (config.openMenuByUseItem) {
        onUseItemRunCommand(config.openMenuByUseItem, config.openMenuCommand);
    }
    if (config.openMenuByUseItemOn) {
        onUseItemOnRunCommand(config.openMenuByUseItemOn, config.openMenuCommand);
    }
    mc.listen("onJoin", (player) => {
        player.tell(`使用${Format.Red}${config.openMenuCommand}${Format.Clear}或${Format.Red}${config.openMenuCommandAlias}${Format.Clear}指令即可打开菜单`);
        const itemType = config.openMenuByUseItem ? config.openMenuByUseItem : config.openMenuByUseItemOn;
        const item = mc.newItem(itemType, 1);
        if (config.openMenuByUseItem) {
            player.tell(`使用${Format.Red}${item.name}${Format.Clear}右键即可打开菜单`);
        }
        else {
            player.tell(`使用${Format.Red}${item.name}${Format.Clear}右键方块即可打开菜单`);
        }
        if (player.permLevel >= PermType.GameMasters) {
            player.tell(`使用${Format.Green}${config.editMenuCommand}${Format.Clear}或${Format.Green}${config.editMenuCommandAlias}${Format.Clear}指令即可编辑菜单`);
        }
    });
}
/**
 * 读取配置
 */
function redConfig() {
    const defaultConfig = {
        openMenuCommand: "xmenu",
        openMenuCommandAlias: "xm",
        editMenuCommand: "editxmenu",
        editMenuCommandAlias: "em",
        openMenuByUseItem: "minecraft:clock",
        openMenuByUseItemOn: "",
        menuName: "主菜单"
    };
    const jsonConfigFile = new JsonConfigFile("plugins/XMenu/config.json", JSON.stringify(defaultConfig));
    const config = JSON.parse(jsonConfigFile.read());
    jsonConfigFile.close();
    return config;
}
/**
 * 执行打开菜单命令的回调的函数
 */
function openMenuCommandCallback(cmd, origin, output, result) {
    if (origin.type !== OriginType.Player) {
        return;
    }
    // 打开主菜单
    const player = origin.player;
    openMenu(player, config.menuName);
}
/**
 * 读取菜单
 * @returns 菜单对应的json对象
 */
function readMenu() {
    const defaultConfig = [
        {
            name: '主菜单',
            items: [
                {
                    name: '管理员菜单',
                    permLevel: 1,
                    type: ItemType.OPEN_MENU,
                    toMenu: '管理员菜单'
                },
            ]
        },
        {
            name: '管理员菜单',
            items: [
                {
                    name: '编辑菜单',
                    permLevel: 1,
                    type: ItemType.EXEC_COMMAND,
                    command: 'editxmenu'
                },
            ]
        }
    ];
    const jsonConfigFile = new JsonConfigFile("plugins/XMenu/data/menu.json", JSON.stringify(defaultConfig));
    const menu = JSON.parse(jsonConfigFile.read());
    if (menu.length === 0) {
        jsonConfigFile.write(JSON.stringify(defaultConfig));
        return defaultConfig;
    }
    jsonConfigFile.close();
    return menu;
}
/**
 * 打开菜单
 */
function openMenu(player, menuName) {
    let menu = null;
    menuPages.forEach(item => {
        if (item.name === menuName) {
            menu = item;
        }
    });
    if (!menu) {
        player.tell(`${Format.Green}菜单页${Format.Red}${menuName}${Format.Green}不存在`);
        return;
    }
    const form = mc.newSimpleForm();
    form.setTitle(menu.name);
    form.setContent('');
    const menuItems = menu.items;
    for (const index in menuItems) {
        form.addButton(menuItems[index].name);
    }
    player.sendForm(form, (player, id) => {
        // 关闭表单
        if (id == null) {
            return;
        }
        // 权限不足！
        if (player.permLevel < menuItems[id].permLevel) {
            let message = `${Format.Red}${Format.Bold} 权限不足！`;
            promptPlayer(player, message, (player) => {
                openMenu(player, menuName);
            });
            return;
        }
        // 打开子菜单
        if (menuItems[id].type === ItemType.OPEN_MENU) {
            openMenu(player, menuItems[id].toMenu);
            return;
        }
        // 执行指令
        player.runcmd(menuItems[id].command);
    });
}
/**
 * 窗口提示
 */
function promptPlayer(player, message, callback) {
    let form = mc.newCustomForm();
    form.setTitle(`${Format.Red}${Format.Bold}提示`);
    form.addLabel(message);
    player.sendForm(form, callback);
}
/**
 * 编辑菜单命令的回调函数
 */
function editMenuCommandCallback(cmd, origin, output, result) {
    editMenu(origin.player);
}
/**
 * 编辑菜单
 */
function editMenu(player) {
    const form = mc.newSimpleForm();
    form.setTitle('选择要编辑的菜单页');
    form.setContent('');
    menuPages.forEach(menuPage => {
        form.addButton(menuPage.name);
    });
    form.addButton(`${Format.Green}添加菜单页`);
    player.sendForm(form, (player, id) => {
        // 取消编辑
        if (id == null) {
            return;
        }
        // 添加菜单页
        if (id === menuPages.length) {
            addMenuPage(player, (newMenuPage) => {
                menuPages.push(newMenuPage);
                saveMenu(menuPages);
                editMenu(player);
            });
            return;
        }
        // 编辑菜单页
        let newMenuPages = menuPages.filter((item, index) => {
            return index !== id;
        });
        editMenuPage(player, menuPages[id], (newMenuPage) => {
            if (newMenuPage) {
                newMenuPages.push(newMenuPage);
            }
            else {
                newMenuPages = removeItemFromMainMenuByToMenu(newMenuPages, menuPages[id].name);
            }
            saveMenu(newMenuPages);
            editMenu(player);
        });
    });
}
/**
 * 编辑指定菜单页
 */
function editMenuPage(player, menuPage, callback) {
    const form = mc.newSimpleForm();
    form.setTitle(`[${menuPage.name}]选择要编辑的选项`);
    form.setContent('');
    const menuItems = menuPage.items;
    for (const index in menuItems) {
        form.addButton(menuItems[index].name);
    }
    form.addButton(`${Format.Green}添加按钮`);
    form.addButton(`${Format.Red}删除当前菜单页(${menuPage.name})`);
    player.sendForm(form, (player, id) => {
        const newMenuItems = menuItems.filter((item, index) => {
            return index !== id;
        });
        // 取消表单
        if (id == null) {
            player.tell(`${Format.Green}关闭菜单！`);
            return;
        }
        // 添加按钮
        if (id === (menuItems.length)) {
            addItem(player, (newItem) => {
                newMenuItems.push(newItem);
                menuPage.items = newMenuItems;
                callback(menuPage);
            });
            return;
        }
        // 删除当前菜单页
        if (id === (menuItems.length + 1)) {
            // 禁止删除主菜单
            if (menuPage.name === config.menuName) {
                promptPlayer(player, '不能删除主菜单', (player, id) => {
                    editMenu(player);
                });
                callback(menuPage);
                return;
            }
            callback(null);
            return;
        }
        editItem(player, menuItems[id], (newItem) => {
            // 修改选项
            if (newItem) {
                newMenuItems.push(newItem);
            }
            // 删除选项，无需操作，上面已经filter了
            menuPage.items = newMenuItems;
            callback(menuPage);
        });
    });
}
/**
 * 添加菜单页
 */
function addMenuPage(player, callback) {
    const form = mc.newCustomForm();
    form.addInput('菜单页名', '请输入菜单页名称');
    player.sendForm(form, (player, data) => {
        // 取消表单
        if (!data) {
            callback(null);
            return;
        }
        const menuPageName = data[0];
        const newItem = {
            name: menuPageName,
            permLevel: 0,
            type: ItemType.OPEN_MENU,
            toMenu: menuPageName,
        };
        menuPages = addItemToMainMenu(menuPages, newItem);
        const newMenuPage = {
            name: menuPageName,
            items: [],
        };
        callback(newMenuPage);
    });
}
/**
 * 编辑菜单页中的选项(按钮)
 */
function editItem(player, menuItem, callback) {
    const dropDownMenuList = [];
    let dropDownIndex = 0;
    menuPages.forEach((menuPage, index) => {
        dropDownMenuList.push(menuPage.name);
        if (menuItem.toMenu === menuPage.name) {
            dropDownIndex = index;
        }
    });
    const dropDownItemTypeList = [];
    let dropDownItemTypeIndex = 0;
    for (const index in ItemType) {
        const itemType = ItemType[index];
        dropDownItemTypeList.push(itemType);
    }
    dropDownItemTypeList.forEach((itemType, index) => {
        if (itemType === menuItem.type) {
            dropDownItemTypeIndex = index;
        }
    });
    const dropDownEditTypeList = [];
    let dropDownEditTypeIndex = 0;
    for (const index in EditType) {
        const editType = EditType[index];
        dropDownEditTypeList.push(editType);
    }
    dropDownEditTypeList.forEach((item, index) => {
        if (item === EditType.REVISE) {
            dropDownEditTypeIndex = index;
        }
    });
    const form = mc.newCustomForm();
    form.setTitle('编辑菜单选项');
    form.addDropdown('编辑类型', dropDownEditTypeList, dropDownEditTypeIndex);
    form.addInput('选项名称', '支持中英文', menuItem.name);
    form.addSwitch('需要管理员(op)权限', menuItem.permLevel === 1);
    form.addDropdown(`按钮类型:${ItemType.EXEC_COMMAND}/${ItemType.OPEN_MENU}`, dropDownItemTypeList, dropDownItemTypeIndex);
    form.addDropdown(`要打开的菜单(若按钮要${Format.Red}${ItemType.OPEN_MENU}${Format.Clear}则不用管此项)`, dropDownMenuList, dropDownIndex);
    form.addInput(`要执行的指令(若按钮要${Format.Red}${ItemType.EXEC_COMMAND}${Format.Clear}令则不用管此项)`, '请输入要执行的指令', menuItem.command ? menuItem.command : '');
    player.sendForm(form, (player, data) => {
        let formDataIndex = 0;
        // 取消表单
        if (!data) {
            callback(menuItem);
            return;
        }
        // 删除选项
        if (dropDownEditTypeList[data[formDataIndex++]] === EditType.DELETE) {
            callback(null);
            return;
        }
        // 修改选项
        const newItem = { name: "", permLevel: 0, type: ItemType.EXEC_COMMAND };
        newItem.name = data[formDataIndex++];
        newItem.permLevel = data[formDataIndex++] ? 1 : 0;
        newItem.type = dropDownItemTypeList[data[formDataIndex++]];
        newItem.toMenu = dropDownMenuList[data[formDataIndex++]];
        newItem.command = data[formDataIndex++];
        callback(newItem);
    });
}
/**
 * 菜单页中添加选项(按钮)
 * @param player
 * @param callback
 */
function addItem(player, callback) {
    const dropDownMenuList = [];
    menuPages.forEach((menuPage, index) => {
        dropDownMenuList.push(menuPage.name);
    });
    const dropDownItemTypeList = [];
    for (const index in ItemType) {
        const itemType = ItemType[index];
        dropDownItemTypeList.push(itemType);
    }
    const form = mc.newCustomForm();
    form.setTitle('添加按钮');
    form.addInput('选项名称', '支持中英文');
    form.addSwitch('需要管理员(op)权限', false);
    form.addDropdown('按钮类型:打开菜单/执行指令', dropDownItemTypeList, 0);
    form.addDropdown('要打开的菜单', dropDownMenuList, 0);
    form.addInput('按钮要执行的指令(不用加‘/’)', '输入指令');
    player.sendForm(form, (player, data) => {
        let dataIndex = 0;
        const newItem = {
            name: '',
            type: ItemType.EXEC_COMMAND,
            permLevel: 1,
            toMenu: "",
            command: "",
        };
        newItem.name = data[dataIndex++];
        newItem.permLevel = data[dataIndex++] ? 1 : 0;
        newItem.type = dropDownItemTypeList[data[dataIndex++]];
        newItem.toMenu = dropDownMenuList[data[dataIndex++]];
        newItem.command = data[dataIndex++];
        callback(newItem);
    });
}
/**
 * 保存菜单
 */
function saveMenu(newMenuPages) {
    const jsonConfigFile = new JsonConfigFile("plugins/XMenu/data/menu.json");
    const saveSuccess = jsonConfigFile.write(JSON.stringify(newMenuPages));
    jsonConfigFile.close();
    menuPages = newMenuPages;
    return saveSuccess;
}
/**
 * 玩家使用指定物品时让玩家执行指定命令
 */
function onUseItemRunCommand(setItem, command) {
    mc.listen('onUseItem', (player, item) => {
        if (item.type === setItem) {
            player.runcmd(command);
        }
    });
}
/**
 * 玩家对方块使用指定物品时让玩家执行指定命令
 */
function onUseItemOnRunCommand(setItem, command) {
    mc.listen('onUseItemOn', (player, item) => {
        if (item.type === setItem) {
            player.runcmd(command);
        }
    });
}
/**
 * 添加选项(按钮)到主菜单
 */
function addItemToMainMenu(menu, item) {
    let mainMenu;
    menu = menu.filter(item => {
        if (item.name === config.menuName) {
            mainMenu = item;
            return false;
        }
        return true;
    });
    mainMenu.items.push(item);
    menu.push(mainMenu);
    return menu;
}
/**
 * 从主菜单移除打开菜单的按钮
 */
function removeItemFromMainMenuByToMenu(menu, menuName) {
    let mainMenu;
    menu = menu.filter(item => {
        if (item.name === config.menuName) {
            mainMenu = item;
            return false;
        }
        return true;
    });
    mainMenu.items = mainMenu.items.filter(item => {
        return item.toMenu !== menuName;
    });
    menu.push(mainMenu);
    return menu;
}
function debugLog(...data) {
    colorLog('green', ...data);
}
