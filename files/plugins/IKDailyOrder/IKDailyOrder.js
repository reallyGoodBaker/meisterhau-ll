ll.registerPlugin(
    "IKDailyOrder",
    "每日任务",
    [2, 0, 0],
    { "原作者":"HaiPaya", "重构与修改":"I IKUN2004" }
);

const PlayerData  = new JsonConfigFile("./plugins/IKDailyOrder/data.json");
const conf        = new JsonConfigFile("./plugins/IKDailyOrder/config.json");
const TasksConfig = new JsonConfigFile("./plugins/IKDailyOrder/tasks.json");
TasksConfig.init("tasks", []);

let economyMode         = conf.init("经济模式", "llmoney");
let scoreboardObjective = conf.init("计分板目标名", "money");
let jjname              = conf.init("货币名称", "坤币");
let gudjiangl           = conf.init("固定任务奖励", 20000);
let ewajiangl           = conf.init("额外委托奖励", 50000);
let blockMineReward     = conf.init("挖掘任务奖励", 28888);
let blockPlaceReward    = conf.init("放置任务奖励", 11111);
let mobKillReward       = conf.init("杀死任务奖励", 66666);
let taskStates          = conf.init("taskStates", { fixed: true, extra: true, mine: true, place: true, kill: true });

const nameMap = {
    fixed:'固定任务', extra:'额外委托', mine:'挖掘任务', kill:'杀死任务', place:'放置任务',
    kille:'总击杀', place:'总放置', destroy:'总破坏',
    mineStone:'石头', mineOakLog:'橡树原木', mineDiamondOre:'钻石原矿',
    mineCoalOre:'煤矿', mineIronOre:'铁矿',
    placeTorch:'火把', placeCobblestone:'圆石', placeOakPlanks:'橡木木板',
    killZombie:'僵尸', killSkeleton:'骷髅', killSpider:'蜘蛛', killEnderman:'末影人'
};
const builtInConds = {
    fixed: { kille:100, place:200, destroy:400 },
    extra: { kille:200, place:400, destroy:800 },
    mine:  { mineStone:300, mineOakLog:50, mineDiamondOre:10, mineCoalOre:100, mineIronOre:50 },
    place: { placeTorch:40, placeCobblestone:20, placeOakPlanks:100 },
    kill:  { killZombie:10, killSkeleton:5, killSpider:20, killEnderman:5 }
};
let builtInRews = {
    fixed:gudjiangl, extra:ewajiangl,
    mine:blockMineReward, place:blockPlaceReward, kill:mobKillReward
};

let playerDataCache = {};

function sendCoolRewardNotice(pl, taskName, rewardText) {
    const border = "§e╔═════════════════════════════════╗";
    const borderBottom = "§e╚═════════════════════════════════╝";
    const emptyLine = "§r║                                 ";
    let message = [
        border, emptyLine,
        `§r║      §a✔ §l任务完成 ✔`,
        `§r║      §7恭喜你完成了：§b${taskName}`,
        `§r║      §7获得奖励：§6${rewardText}`,
        emptyLine, borderBottom
    ].join('\n');
    pl.tell(message);
}

function addCurrency(pl, amount) {
    const mode = conf.get("经济模式", "llmoney");
    const objective = conf.get("计分板目标名", "money");
    if (mode === 'llmoney' || mode === 'all') money.add(pl.xuid, amount);
    if (mode === 'scoreboard' || mode === 'all') pl.addScore(objective, amount);
}

function initPlayerData(pl) {
    const tm = system.getTimeObj();
    const today = `${tm.Y}${tm.M}${tm.D}`;
    let diskData = PlayerData.get(pl.xuid);
    let oldDyn = diskData && diskData.dynamic ? diskData.dynamic : {};
    let data;
    if (!diskData || diskData.time !== today) {
        data = {
            time: today, progressDisplayEnabled: true,
            kille:0, place:0, destroy:0,
            mineStone:0, mineOakLog:0, mineDiamondOre:0, mineCoalOre:0, mineIronOre:0,
            placeTorch:0, placeCobblestone:0, placeOakPlanks:0,
            killZombie:0, killSkeleton:0, killSpider:0, killEnderman:0,
            gd:false, ew:false,
            mineRewarded:false, placeRewarded:false, killRewarded:false,
            dynamic: {}
        };
        for (let t of TasksConfig.get("tasks")||[]) {
            if (!t.resetDaily && oldDyn[t.id]) data.dynamic[t.id] = oldDyn[t.id];
        }
    } else {
        data = diskData;
    }
    if (data.progressDisplayEnabled === undefined) data.progressDisplayEnabled = true;
    if (!data.dynamic) data.dynamic = {};
    playerDataCache[pl.xuid] = data;
    return data;
}

function getPlayerData(pl) {
    return playerDataCache[pl.xuid] || initPlayerData(pl);
}

function savePlayerData(xuid) {
    if (playerDataCache[xuid]) PlayerData.set(xuid, playerDataCache[xuid]);
}

function createProgressBar(current, max, length = 10) {
    if (current > max) current = max;
    const percent = current / max;
    const progress = Math.floor(length * percent);
    const empty = length - progress;
    return `§a${'■'.repeat(progress)}§7${'■'.repeat(empty)}`;
}

function notifyProgress(pl, taskName, current, max) {
    const data = getPlayerData(pl);
    if (!data.progressDisplayEnabled || current > max) return;
    pl.sendText(`§b任务进度: §f${taskName} §e${current} §7/ ${max}`, 5);
}

function updateBossBar(pl) {
    const data = getPlayerData(pl);
    const bossBarId = 1738;
    if (!data.progressDisplayEnabled) {
        pl.removeBossBar(bossBarId);
        return;
    }
    let totalProgress = 0;
    let totalConditions = 0;
    const uniqueKeys = new Set();
    Object.entries(taskStates).forEach(([cat, isEnabled]) => {
        if(isEnabled && builtInConds[cat]) {
            Object.keys(builtInConds[cat]).forEach(key => uniqueKeys.add(key));
        }
    });
    uniqueKeys.forEach(key => {
        let maxNeeded = 0;
        Object.entries(taskStates).forEach(([cat, isEnabled]) => {
            if (isEnabled && builtInConds[cat] && builtInConds[cat][key] > maxNeeded) {
                maxNeeded = builtInConds[cat][key];
            }
        });
        if (maxNeeded > 0) {
            const current = data[key] || 0;
            totalProgress += Math.min(current / maxNeeded, 1.0);
            totalConditions++;
        }
    });
    const percent = totalConditions > 0 ? totalProgress / totalConditions : 0;
    if (percent >= 1.0) {
        pl.removeBossBar(bossBarId);
    } else {
        const title = `§d§l每日任务: §b${(percent * 100).toFixed(1)}%`;
        const barColor = percent < 0.34 ? 0 : (percent < 0.67 ? 2 : 1);
        pl.setBossBar(bossBarId, title, percent, barColor);
    }
}

function checkBuiltIn(pl) {
    const data = getPlayerData(pl);
    Object.keys(builtInConds).forEach(cat => {
        if (!taskStates[cat]) return;
        const conds = builtInConds[cat];
        const allOK = Object.keys(conds).every(k => (data[k] || 0) >= conds[k]);
        const flagKey = cat === "fixed" ? "gd" : cat === "extra" ? "ew" : `${cat}Rewarded`;
        if (allOK && !data[flagKey]) {
            data[flagKey] = true;
            sendCoolRewardNotice(pl, nameMap[cat], `${builtInRews[cat]}${jjname}`);
            mc.runcmdEx(`playsound random.levelup "${pl.realName}"`);
            addCurrency(pl, builtInRews[cat]);
        }
    });
}

function checkDynamic(pl, evtType, target) {
    const data = getPlayerData(pl);
    let tasks = TasksConfig.get("tasks")||[];
    for (let t of tasks) {
        if (t.type !== evtType || t.target !== target) continue;
        if (!data.dynamic[t.id]) data.dynamic[t.id] = {count:0, rewarded:false};
        let rec = data.dynamic[t.id];
        if (rec.rewarded) continue;
        rec.count++;
        notifyProgress(pl, t.name, rec.count, t.need);
        if (rec.count >= t.need) {
            rec.rewarded = true;
            addCurrency(pl, t.reward);
            sendCoolRewardNotice(pl, t.name, `${t.reward}${jjname}`);
        }
    }
}

function shareProgress(pl) {
    const data = getPlayerData(pl);
    let lines = [];
    lines.push(`§d§l[任务分享] §6${pl.realName} §f的今日进度：`);
    Object.keys(builtInConds).forEach(cat => {
        if (!taskStates[cat]) return;
        let flag = cat==="fixed"? data.gd : cat==="extra"? data.ew : data[`${cat}Rewarded`];
        lines.push(`§7• §b${nameMap[cat]}：${flag? "§a✔ 完成" : "§c❌ 未完成"}`);
    });
    let custom = TasksConfig.get("tasks")||[];
    if (custom.length) {
        lines.push("§e自定义任务：");
        custom.forEach(t => {
            let c = data.dynamic[t.id]?.count||0;
            lines.push(` §7- §f${t.name}：§c${c} §7/ §f${t.need}`);
        });
    }
    mc.getOnlinePlayers().forEach(p => p.tell(lines.join("\n")));
}

function openTaskToggleForm(pl) {
    if (!pl.isOP()) return;
    const fm = mc.newCustomForm().setTitle("§6§l管理员任务开关");
    fm.addLabel("§7在这里开启或关闭内置任务大类。关闭后，该任务将对所有玩家隐藏且不计进度。");
    taskStates = conf.get("taskStates");
    Object.keys(builtInConds).forEach(cat => {
        fm.addSwitch(nameMap[cat], taskStates[cat]);
    });
    pl.sendForm(fm, (p, data) => {
        if (data === null) {
            openAdminPanel(p);
            return;
        }
        const newStates = {};
        Object.keys(builtInConds).forEach((cat, index) => {
            newStates[cat] = data[index + 1];
        });
        conf.set("taskStates", newStates);
        taskStates = newStates;
        p.tell("§a任务开关状态已保存！");
        openAdminPanel(p);
    });
}

function openAdminPanel(pl) {
    if (!pl.isOP()) { pl.tell("§c无权限！"); return; }
    const fm = mc.newSimpleForm().setTitle("§6§lIK插件后台管理");
    fm.addButton("§b任务数值配置");
    fm.addButton("§d任务开关管理");
    fm.addButton("§a自定义任务管理");
    pl.sendForm(fm, (p, id) => {
        if (id === null) return;
        switch(id) {
            case 0: openConfigForm(p); break;
            case 1: openTaskToggleForm(p); break;
            case 2: openCustomTaskManager(p); break;
        }
    });
}

function openConfigForm(pl) {
    const fm = mc.newCustomForm().setTitle("§b§l任务数值配置");
    fm.addLabel("§d- 经济与货币设置 -");
    const economyTypes = ["llmoney", "scoreboard", "all"];
    fm.addDropdown("经济模式", economyTypes, economyTypes.indexOf(conf.get("经济模式")));
    fm.addInput("计分板目标名", conf.get("计分板目标名"));
    fm.addInput("货币显示名称", conf.get("货币名称"));
    fm.addLabel("§d- 内置任务奖励数值 -");
    fm.addInput("固定任务奖励", conf.get("固定任务奖励").toString());
    fm.addInput("额外委托奖励", conf.get("额外委托奖励").toString());
    fm.addInput("挖掘任务奖励", conf.get("挖掘任务奖励").toString());
    fm.addInput("放置任务奖励", conf.get("放置任务奖励").toString());
    fm.addInput("杀死任务奖励", conf.get("杀死任务奖励").toString());
    pl.sendForm(fm, (p,data) => {
        if (data === null) {
            openAdminPanel(p);
            return;
        }
        conf.set("经济模式", economyTypes[data[1]]);
        if(data[2] && data[2].trim()) conf.set("计分板目标名", data[2].trim());
        if(data[3] && data[3].trim()) conf.set("货币名称", data[3].trim());
        const keys = ["固定任务奖励","额外委托奖励","挖掘任务奖励","放置任务奖励","杀死任务奖励"];
        for (let i = 4; i < data.length; i++) {
            let v = data[i];
            if (v && v.trim() && !isNaN(parseInt(v.trim(), 10))) {
                conf.set(keys[i - 4], parseInt(v.trim(), 10));
            }
        }
        p.tell("§a数值配置已保存！");
        openAdminPanel(p);
    });
}

function openCustomTaskManager(pl) {
    const fm = mc.newSimpleForm().setTitle("§a§l自定义任务管理");
    fm.addButton("§b添加新任务");
    fm.addButton("§c删除现有任务");
    pl.sendForm(fm, (p,id) => {
        if (id === null) {
            openAdminPanel(p);
            return;
        }
        if (id === 0) openAddTaskForm(p);
        else if (id === 1) openDeleteTaskForm(p);
    });
}

function openDeleteTaskForm(pl) {
    const tasks = TasksConfig.get("tasks") || [];
    if (!tasks.length) {
        pl.tell("§c当前无自定义任务可删除");
        openCustomTaskManager(pl);
        return;
    }
    const fm = mc.newCustomForm().setTitle("§c§l删除自定义任务");
    fm.addLabel("§e请从下方列表中选择要删除的任务。此操作不可逆！");
    const names = tasks.map(t => `${t.name} (ID: ${t.target})`);
    fm.addDropdown("§b任务列表", names);
    pl.sendForm(fm, (p,data) => {
        if (data === null) {
            openCustomTaskManager(p);
            return;
        }
        const idx = data[1];
        const removed = tasks.splice(idx,1)[0];
        TasksConfig.set("tasks", tasks);
        p.tell(`§a已删除自定义任务：§b${removed.name}`);
        openCustomTaskManager(p);
    });
}

function openAddTaskForm(pl) {
    const fm = mc.newCustomForm().setTitle("§b§l添加新自定义任务");
    fm.addLabel("§7请仔细填写新任务的每一个属性。");
    fm.addDropdown("§e任务类型", ["杀死实体","放置方块","破坏方块"]);
    fm.addInput("§f目标ID", "例如: minecraft:zombie");
    fm.addInput("§f任务显示名称", "例如: 击败僵尸");
    fm.addInput("§f目标数量", "10");
    fm.addInput("§f奖励金币", "1000");
    fm.addDropdown("§b刷新策略", ["每日刷新","永久保留"]);
    pl.sendForm(fm, (p,data) => {
        if (data === null) {
            openCustomTaskManager(p);
            return;
        }
        let [, ti, target, name, needStr, rewStr, ri] = data;
        if (!(target && target.trim()) || !(name && name.trim()) || !(needStr && needStr.trim()) || !(rewStr && rewStr.trim())) {
            p.tell("§c所有项目均为必填项！");
            openAddTaskForm(p);
            return;
        }
        let need = parseInt(needStr,10), rew = parseInt(rewStr,10);
        if (isNaN(need) || isNaN(rew)) {
            p.tell("§c数量和奖励必须为有效数字！");
            openAddTaskForm(p);
            return;
        }
        let resetDaily = ri === 0;
        const types = ["kill","place","destroy"];
        let list = TasksConfig.get("tasks")||[];
        let id = list.length > 0 ? Math.max(...list.map(t => t.id)) + 1 : 1;
        list.push({ id, type:types[ti], target: target.trim(), name: name.trim(), need, reward:rew, resetDaily });
        TasksConfig.set("tasks", list);
        p.tell(`§a成功添加任务: §b${name.trim()} §a×${need}，奖励§c${rew}${jjname}`);
        openCustomTaskManager(p);
    });
}

function main(pl) {
    const data = getPlayerData(pl);
    updateBossBar(pl);
    mc.runcmdEx(`playsound ui.button.click "${pl.realName}"`);
    let content = `§6§l玩家 §f${pl.name} §6§l的每日面板\n§7今日日期: ${data.time}\n\n`;
    content += '§e§l★ 内置核心任务 ★\n';
    let hasVisibleBuiltIn = false;
    Object.keys(builtInConds).forEach(cat => {
        if (!taskStates[cat]) return;
        hasVisibleBuiltIn = true;
        let isDone = cat==="fixed"? data.gd : cat==="extra"? data.ew : data[`${cat}Rewarded`];
        content += `§b${nameMap[cat]} §r${isDone ? '§a(已完成)' : '§c(进行中)'} §e» §6${builtInRews[cat]}${jjname}\n`;
        for (let k in builtInConds[cat]) {
            let need = builtInConds[cat][k];
            let value = data[k]||0;
            let valueColor = value >= need ? '§a' : '§e';
            content += `  §f${nameMap[k]} §7${createProgressBar(value, need)} §r${valueColor}${value}§7/${need}\n`;
        }
    });
    if (!hasVisibleBuiltIn) content += '§7今日所有内置任务均已关闭。\n';

    let tasks = TasksConfig.get("tasks")||[];
    if (tasks.length > 0) {
        content += '\n§d§l◈ 自定义挑战 ◈\n';
        let pending = tasks.filter(t=>!(data.dynamic[t.id]?.rewarded));
        if (tasks.length === 0 || pending.length === 0 && tasks.length > 0) {
            content += '§a所有自定义挑战均已完成！\n';
        } else {
            pending.forEach(t => {
                let c = data.dynamic[t.id]?.count||0;
                let valueColor = c >= t.need ? '§a' : '§e';
                content += `§b${t.name} §7${createProgressBar(c, t.need, 12)} ${valueColor}${c}§7/${t.need} §e» §6${t.reward}${jjname}\n`;
            });
        }
    }

    const fm = mc.newSimpleForm().setTitle("§e§l每日任务");
    fm.setContent(content);
    const progressButtonText = data.progressDisplayEnabled ? "§c关闭进度显示" : "§a开启进度显示";
    const progressButtonIcon = data.progressDisplayEnabled ? "textures/ui/realms_red_x" : "textures/ui/realms_green_check";
    fm.addButton(progressButtonText, progressButtonIcon);
    fm.addButton("§2分享我的进度","textures/ui/color_plus");
    fm.addButton("§1任务说明","textures/ui/icon_book_writable");
    if (pl.isOP()) fm.addButton("§6管理员后台","textures/ui/op");

    pl.sendForm(fm, (p,id) => {
        if (id === null) return;
        switch(id) {
            case 0:
                data.progressDisplayEnabled = !data.progressDisplayEnabled;
                updateBossBar(p);
                main(p);
                break;
            case 1: shareProgress(p); break;
            case 2: uijs(p); break;
            case 3: if(p.isOP()) openAdminPanel(p); break;
        }
    });
}

function uijs(pl) {
    const fm = mc.newSimpleForm();
    fm.setTitle("§1任务说明");
    fm.setContent(
        `§b每日任务§r是一系列每天都会重置的目标，完成后可以获得丰厚的奖励。\n\n`+
        `§e内置任务§r是所有玩家都相同的固定任务，但管理员可能会暂时关闭部分任务。\n\n`+
        `§d自定义任务§r由管理员添加，部分任务可能是永久性的，不会每日重置，请注意查看任务列表。\n\n`+
        `§a祝您游戏愉快！`
    );
    fm.addButton("§r返回主菜单");
    pl.sendForm(fm, (p, id) => {
        if (id === null) return;
        if (id === 0) main(p);
    });
}

mc.regPlayerCmd("dor","§cIK每日任务",main);

mc.listen("onJoin", (pl) => {
    initPlayerData(pl);
    updateBossBar(pl);
});
mc.listen("onLeft", (pl) => {
    savePlayerData(pl.xuid);
    delete playerDataCache[pl.xuid];
});

mc.listen("onServerStarted", () => {
    const objectiveName = conf.get("计分板目标名", "money");
    if (mc.getScoreObjective(objectiveName) === null) {
        mc.newScoreObjective(objectiveName, objectiveName);
        log(`[IKDailyOrder] 成功创建计分板经济目标: ${objectiveName}`);
    }
    setInterval(() => {
        for (const xuid in playerDataCache) {
            savePlayerData(xuid);
        }
        log("[IKDailyOrder] 已执行定时玩家数据自动保存。");
    }, 300000);
});

function processKill(pl, mo) {
    const data = getPlayerData(pl);
    if (taskStates.fixed || taskStates.extra) {
        data.kille++;
        notifyProgress(pl, nameMap.kille, data.kille, Math.max(builtInConds.fixed.kille, builtInConds.extra.kille));
    }
    if (taskStates.kill) {
        let mobType = mo.type;
        let taskKey;
        if (mobType === "minecraft:zombie") taskKey = "killZombie";
        else if (mobType === "minecraft:skeleton") taskKey = "killSkeleton";
        else if (mobType === "minecraft:spider") taskKey = "killSpider";
        else if (mobType === "minecraft:enderman") taskKey = "killEnderman";
        if (taskKey) {
            data[taskKey]++;
            notifyProgress(pl, nameMap[taskKey], data[taskKey], builtInConds.kill[taskKey]);
        }
    }
    checkBuiltIn(pl);
    checkDynamic(pl, "kill", mo.type);
    updateBossBar(pl);
}

function processPlace(pl, block) {
    const data = getPlayerData(pl);
    if (taskStates.fixed || taskStates.extra) {
        data.place++;
        notifyProgress(pl, nameMap.place, data.place, Math.max(builtInConds.fixed.place, builtInConds.extra.place));
    }
    if (taskStates.place) {
        let blockType = block.type;
        let taskKey;
        if (blockType === "minecraft:torch") taskKey = "placeTorch";
        else if (blockType === "minecraft:cobblestone") taskKey = "placeCobblestone";
        else if (blockType === "minecraft:oak_planks") taskKey = "placeOakPlanks";
        if (taskKey) {
            data[taskKey]++;
            notifyProgress(pl, nameMap[taskKey], data[taskKey], builtInConds.place[taskKey]);
        }
    }
    checkBuiltIn(pl);
    checkDynamic(pl, "place", block.type);
    updateBossBar(pl);
}

function processDestroy(pl, block) {
    const data = getPlayerData(pl);
    if (taskStates.fixed || taskStates.extra) {
        data.destroy++;
        notifyProgress(pl, nameMap.destroy, data.destroy, Math.max(builtInConds.fixed.destroy, builtInConds.extra.destroy));
    }
    if (taskStates.mine) {
        let blockType = block.type;
        let taskKey;
        if (blockType === "minecraft:stone") taskKey = "mineStone";
        else if (blockType === "minecraft:oak_log") taskKey = "mineOakLog";
        else if (blockType.includes("diamond_ore")) taskKey = "mineDiamondOre";
        else if (blockType.includes("coal_ore")) taskKey = "mineCoalOre";
        else if (blockType.includes("iron_ore")) taskKey = "mineIronOre";
        if (taskKey) {
            data[taskKey]++;
            notifyProgress(pl, nameMap[taskKey], data[taskKey], builtInConds.mine[taskKey]);
        }
    }
    checkBuiltIn(pl);
    checkDynamic(pl, "destroy", block.type);
    updateBossBar(pl);
}

mc.listen("onMobDie", (mo, en) => {
    if (en && en.isPlayer()) processKill(en.toPlayer(), mo);
});
mc.listen("afterPlaceBlock", (pl, block) => {
    processPlace(pl, block);
});
mc.listen("onDestroyBlock", (pl, block) => {
    processDestroy(pl, block);
});