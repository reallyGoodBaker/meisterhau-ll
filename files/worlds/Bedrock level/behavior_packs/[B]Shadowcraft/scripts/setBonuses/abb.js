import {
    world,
    system,
    EntityEquippableComponent,
    EntityInventoryComponent,
    EntityHealthComponent,
    EquipmentSlot,
    ItemStack
} from "@minecraft/server";

// 检测装备辅助函数
function hasEquipment(entity, slot, itemId) {
    const equippable = entity.getComponent(EntityEquippableComponent.componentId);
    const equipment = equippable.getEquipment(slot);
    return equipment?.typeId === itemId;
}

// 检测快捷栏辅助函数
function hasHotbarItem(entity, itemId) {
    const inventory = entity.getComponent(EntityInventoryComponent.componentId);
    const container = inventory.container;

    for (let slot = 0; slot <= 8; slot++) {
        const item = container.getItem(slot);
        if (item?.typeId === itemId) return true;
    }
    return false;
}

// 套装效果激活
system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        const hasSet =
            hasEquipment(player, EquipmentSlot.Head, 'sf:higher_calling') &&
            hasEquipment(player, EquipmentSlot.Chest, 'sf:divine_retribution') &&
            hasHotbarItem(player, 'sf:arbitrator');

        if (hasSet) {
            player.addEffect('health_boost', 20, { amplifier: 4, showParticles: false });

            if (!player.hasTag('is_abdicator_set')) {
                player.addEffect('instant_health', 1, { amplifier: 255, showParticles: false });
                player.addTag('is_abdicator_set');
                player.sendMessage("退位者套装效果: 当你受到致命伤害时, 你将在十秒内战无不胜并造成二倍伤害");
            }
        } else if (player.hasTag('is_abdicator_set')) {
            player.removeTag('is_abdicator_set');
            player.removeEffect('regeneration');
        }
    }
}, 5);

// 无敌效果触发
world.afterEvents.entityHurt.subscribe(event => {
    const player = event.hurtEntity;
    if (player.typeId !== 'minecraft:player') return;

    const health = player.getComponent(EntityHealthComponent.componentId);
    const isNearDeath = health.currentValue < 2; // 更可靠的濒死检测

    if (isNearDeath && player.hasTag('is_abdicator_set')) {
        const hasWeapon = hasEquipment(player, EquipmentSlot.Mainhand, 'sf:arbitrator');

        if (hasWeapon) {
            player.addTag('is_abdicator_set_undying');

            // 使用API直接添加效果
            player.addEffect('instant_health', 1, { amplifier: 255, showParticles: false });
            player.addEffect('strength', 10, { amplifier: 1, showParticles: false });
            player.addEffect('resistance', 10, { amplifier: 4, showParticles: false });
            player.addEffect('fire_resistance', 10, { showParticles: false });

            // 安全计时器
            system.runTimeout(() => {
                if (player.isValid()) {
                    player.removeTag('is_abdicator_set_undying');
                    player.kill();
                }
            }, 200);
        } else {
            system.runTimeout(() => {
                if (player.isValid()) player.kill();
            }, 1);
        }
    }
});