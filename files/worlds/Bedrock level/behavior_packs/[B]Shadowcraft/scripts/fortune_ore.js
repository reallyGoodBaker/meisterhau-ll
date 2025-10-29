import { world, system, ItemStack } from "@minecraft/server";

// 配置区域
const CUSTOM_BLOCK_ID = "sf:shadow_ore";     // 自定义方块ID
const BASE_DROP_ITEM = "sf:shadow_energy";   // 掉落物品
const BASE_DROP_MAX = 2;                    // 基础最大掉落数量
const FORTUNE_MULTIPLIERS = {               // 时运等级对应的倍数
    1: 2,
    2: 3,
    3: 4
};

// 玩家破坏方块事件监听
world.afterEvents.playerBreakBlock.subscribe(event => {
    const player = event.player;
    const block = event.brokenBlockPermutation;

    // 检查是否为自定义方块
    if (block.type.id !== CUSTOM_BLOCK_ID) return;

    const equipment = player.getComponent('equippable');
    const mainhand = equipment.getEquipment('Mainhand');

    // 检查主手是否持有镐类工具
    if (!mainhand || !mainhand.typeId.includes('pickaxe')) return;

    // 获取时运附魔等级
    let fortuneLevel = 0;
    const enchantments = mainhand.getComponent('enchantable')?.getEnchantments() || [];
    for (const ench of enchantments) {
        if (ench.type.id === 'fortune') {
            fortuneLevel = ench.level;
            break;
        }
    }

    // 如果没有有效的时运等级，跳过处理
    if (!FORTUNE_MULTIPLIERS[fortuneLevel]) return;

    // 获取对应的掉落倍数
    const multiplier = FORTUNE_MULTIPLIERS[fortuneLevel];

    // 计算掉落数量（基础最大掉落量 × 倍数）
    const dropCount = BASE_DROP_MAX * multiplier;

    // 创建掉落物品
    const dropItem = new ItemStack(BASE_DROP_ITEM, dropCount);

    // 在方块位置生成掉落物
    const location = event.block.location;
    const dimension = player.dimension;
    dimension.spawnItem(dropItem, location);

    // 取消原版掉落
    event.cancel = true;

    // 发送玩家提示
});

// 系统启动输出
system.run(() => {
    console.log("精确倍数时运系统已激活");
    console.log(`检测方块: ${CUSTOM_BLOCK_ID}`);
    console.log(`基础物品: ${BASE_DROP_ITEM}`);
    console.log(`最大基础掉落: ${BASE_DROP_MAX}`);
    console.log(`时运I: ×${FORTUNE_MULTIPLIERS[1]} → ${BASE_DROP_MAX * FORTUNE_MULTIPLIERS[1]}`);
    console.log(`时运II: ×${FORTUNE_MULTIPLIERS[2]} → ${BASE_DROP_MAX * FORTUNE_MULTIPLIERS[2]}`);
    console.log(`时运III: ×${FORTUNE_MULTIPLIERS[3]} → ${BASE_DROP_MAX * FORTUNE_MULTIPLIERS[3]}`);
    console.log("注：时运0级或无效等级不会触发任何效果");
});