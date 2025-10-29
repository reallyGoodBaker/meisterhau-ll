import { system, CommandPermissionLevel, CustomCommandStatus, CustomCommandParamType, world } from "@minecraft/server";
import * as sbook from "forms/shadowBook.js";

system.beforeEvents.startup.subscribe((init) => {
    init.customCommandRegistry.registerCommand({
        name: "sf:openshadowbook",
        description: "为目标玩家打开暗影大典",
        permissionLevel: CommandPermissionLevel.GameDirectors,
        optionalParameters: [
            {
                type: CustomCommandParamType.EntitySelector,
                name: "target",
                description: "目标玩家选择器（如 @p、@a）"
            }
        ]
    }, handleOpenShadowBook);
});

/**
 * 处理命令逻辑，第二个参数为选择器返回的实体数组
 * @param {import("@minecraft/server").CustomCommandExecutionContext} command 命令上下文
 * @param {import("@minecraft/server").Entity[]} targetEntities 选择器返回的实体数组（可能为空）
 */
function handleOpenShadowBook(command, targetEntities = []) {
    try {
        const source = command.sourceEntity;
        const isCommandBlock = !source;
        let targetPlayers = [];

        // 1. 处理选择器返回的实体数组（第二个参数）
        if (targetEntities.length > 0) {
            // 筛选出玩家实体
            targetPlayers = targetEntities.filter(entity =>
                entity?.typeId === "minecraft:player"
            );
        }

        // 2. 解析参数（为targetEntities赋值的备用逻辑）
        if (targetPlayers.length === 0) {
            try {
                // 从命令上下文解析参数，填充targetEntities
                const selectorResults = command.getEntitySelectorResults("target");
                targetEntities = selectorResults; // 为第二个参数赋值
                targetPlayers = selectorResults.filter(entity =>
                    entity?.typeId === "minecraft:player"
                );
            } catch (error) {
                // 未传入参数时的处理
                if (isCommandBlock) {
                    return {
                        status: CustomCommandStatus.Failure,
                        message: "命令方块必须指定目标玩家（如 sf:openshadowbook @p）"
                    };
                }
            }
        }

        // 3. 确定最终目标玩家
        if (targetPlayers.length === 0) {
            if (source?.typeId === "minecraft:player") {
                // 玩家执行时默认自己
                targetPlayers = [source];
                targetEntities = [source]; // 同步更新实体数组参数
            } else {
                return {
                    status: CustomCommandStatus.Failure,
                    message: "未找到有效的目标玩家"
                };
            }
        }

        // 4. 使用实体数组参数执行核心逻辑
        openShadowBookForEntities(targetPlayers);

        return {
            status: CustomCommandStatus.Success,
            message: `已为 ${targetPlayers.map(p => p.name).join(", ")} 打开暗影大典`
        };

    } catch (error) {
        console.error("命令执行错误:", error);
        return {
            status: CustomCommandStatus.Failure,
            message: `执行失败: ${error.message}`
        };
    }
}

/**
 * 专门处理实体数组的业务逻辑函数
 * @param {import("@minecraft/server").Player[]} players 玩家实体数组
 */
function openShadowBookForEntities(players) {
    players.forEach(player => {
        system.run(() => {
            if (typeof sbook.book === "function") {
                sbook.book(player);
            } else {
                throw new Error("sbook模块中未定义book函数");
            }
        });
    });
}
