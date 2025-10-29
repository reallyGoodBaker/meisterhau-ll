import { world, system, ItemStack } from '@minecraft/server';
import { ActionFormData } from '@minecraft/server-ui';
// 存储技能冷却时间（玩家ID -> 技能ID -> 冷却结束时间戳）
const skillCooldowns = new Map();
//根据派系更新技能物品
function updateAbilityItemByScore(player_entity) {
    const scoreboardObjectiveId = 'shadow_faction';
    let objective = world.scoreboard.getObjective(scoreboardObjectiveId);
    if (!objective) {
        objective = world.scoreboard.addObjective(scoreboardObjectiveId, '派系');
    }
    let scoreID = player_entity.scoreboardIdentity;
    if (!scoreID) {
        const identities = objective.getParticipants();
        scoreID = identities.find((id) => id.displayName === player.nameTag);
    }
    const targetScore = scoreID ? objective.getScore(scoreID) : 0;
    const inventory = player_entity.getComponent('inventory').container;
    let itemId = '';
    switch (targetScore) {
        case 1234: itemId = 'sf:shadow_ability_legion'; break;
        case 1243: itemId = 'sf:shadow_ability_dynasty'; break;
        case 4321: itemId = 'sf:shadow_ability_herald'; break;
        default: break;
    }
    const newItem = new ItemStack(itemId, 1)
    inventory.setItem(player_entity.selectedSlotIndex, newItem);
}
//选择派系更新物品
function updateFactionItemByScore(player_entity) {
    const scoreboardObjectiveId = 'shadow_faction';
    let objective = world.scoreboard.getObjective(scoreboardObjectiveId);
    if (!objective) {
        objective = world.scoreboard.addObjective(scoreboardObjectiveId, '派系');
    }
    let scoreID = player_entity.scoreboardIdentity;
    if (!scoreID) {
        const identities = objective.getParticipants();
        scoreID = identities.find((id) => id.displayName === player.nameTag);
    }
    const targetScore = scoreID ? objective.getScore(scoreID) : 0;
    const inventory = player_entity.getComponent('inventory').container;
    let itemId = '';
    switch (targetScore) {
        case 1234: itemId = 'sf:shadow_faction_legion'; break;
        case 1243: itemId = 'sf:shadow_faction_dynasty'; break;
        case 4321: itemId = 'sf:shadow_faction_herald'; break;
        default: break;
    }
    const newItem = new ItemStack(itemId, 1)
    inventory.setItem(player_entity.selectedSlotIndex, newItem);
}
//选择派系表单
function select_faction(player) {
    let currentScore = 0;
    try {
        const scoreboardObjectiveId = 'shadow_faction';
        let objective = world.scoreboard.getObjective(scoreboardObjectiveId);
        if (!objective) {
            objective = world.scoreboard.addObjective(scoreboardObjectiveId, '派系');
        }
        if (objective) {
            let scoreID = player.scoreboardIdentity;
            if (!scoreID) {
                const identities = objective.getParticipants();
                scoreID = identities.find((id) => id.displayName === player.nameTag);
            }
            currentScore = scoreID ? objective.getScore(scoreID) : 0;
        }
    } catch (error) {
        console.error('获取技能分数时出错:', error);
        currentScore = 0;
    }
    const btn1Text = currentScore === 1234
        ? '§3军团'
        : '军团';
    const btn2Text = currentScore === 1243
        ? '§3王朝'
        : '王朝';
    const btn3Text = currentScore === 4321
        ? '§3先锋'
        : '先锋';
    let form = new ActionFormData()
        .title('选择你的派系')
        .button(btn1Text, 'textures/ability/legion')
        .button(btn2Text, 'textures/ability/dynasty')
        .button(btn3Text, 'textures/ability/herald');
    form.show(player).then((t) => {
        if (t.canceled) return;
        switch (t.selection) {
            case 0:
                player.runCommand('scoreboard players set @s shadow_faction 1234');
                player.runCommand('scoreboard players set @s shadow_ability 100001');
                updateFactionItemByScore(player)
                player.sendMessage('§3您已选择 军团 派系');
                break;
            case 1:
                player.runCommand('scoreboard players set @s shadow_faction 1243');
                player.runCommand('scoreboard players set @s shadow_ability 100001');
                updateFactionItemByScore(player)
                player.sendMessage('§3您已选择 王朝 派系');
                break;
            case 2:
                player.runCommand('scoreboard players set @s shadow_faction 4321');
                player.runCommand('scoreboard players set @s shadow_ability 100001');
                updateFactionItemByScore(player)
                player.sendMessage('§3您已选择 先锋 派系');
                break;
        }
    }).catch((error) => {
        console.error('技能选择表单错误:', error);
    });
}
//军团技能选择表单
function select_ability_l(player) {
    let currentScore = 0;
    try {
        const scoreboardObjectiveId = 'shadow_ability';
        let objective = world.scoreboard.getObjective(scoreboardObjectiveId);
        if (!objective) {
            objective = world.scoreboard.addObjective(scoreboardObjectiveId, '暗影技能');
        }
        if (objective) {
            let scoreID = player.scoreboardIdentity;
            if (!scoreID) {
                const identities = objective.getParticipants();
                scoreID = identities.find((id) => id.displayName === player.nameTag);
            }
            currentScore = scoreID ? objective.getScore(scoreID) : 0;
        }
    } catch (error) {
        console.error('获取技能分数时出错:', error);
        currentScore = 0;
    }
    const btn2Text = currentScore === 1001
        ? '§3窒息-消耗5级经验(cd 5秒)\n(对敌人锁喉并升空)'
        : '窒息-消耗5级经验(cd 5秒)\n(对敌人锁喉并升空)';
    const btn3Text = currentScore === 1002
        ? '§3上勾拳-消耗5级经验(cd 5秒)\n(使敌人短暂升空并向前位移)'
        : '上勾拳-消耗5级经验(cd 5秒)\n(使敌人短暂升空并向前位移)';
    const btn9Text = currentScore === 100001
        ? '§3不携带技能'
        : '不携带技能';
    let form = new ActionFormData()
        .title('选择你的军团暗影技能')
        .button(btn2Text, 'textures/ability/choke')
        .button(btn3Text, 'textures/ability/uppercut')
        .button(btn9Text, 'textures/items/shadow_energy');
    form.show(player).then((t) => {
        if (t.canceled) return;
        switch (t.selection) {
            case 0:
                player.runCommand('scoreboard players set @s shadow_ability 1001');
                player.sendMessage('§3您已选择 窒息 暗影技能');
                break;
            case 1:
                player.runCommand('scoreboard players set @s shadow_ability 1002');
                player.sendMessage('§3您已选择 上勾拳 暗影技能');
                break;
            case 2:
                player.runCommand('scoreboard players set @s shadow_ability 100001');
                player.sendMessage('§3您取消携带了暗影技能');
                break;
        }
    }).catch((error) => {
        console.error('技能选择表单错误:', error);
    });
}
//王朝技能选择表单
function select_ability_d(player) {
    let currentScore = 0;
    try {
        const scoreboardObjectiveId = 'shadow_ability';
        let objective = world.scoreboard.getObjective(scoreboardObjectiveId);
        if (!objective) {
            objective = world.scoreboard.addObjective(scoreboardObjectiveId, '暗影技能');
        }
        if (objective) {
            let scoreID = player.scoreboardIdentity;
            if (!scoreID) {
                const identities = objective.getParticipants();
                scoreID = identities.find((id) => id.displayName === player.nameTag);
            }
            currentScore = scoreID ? objective.getScore(scoreID) : 0;
        }
    } catch (error) {
        console.error('获取技能分数时出错:', error);
        currentScore = 0;
    }
    const btn1Text = currentScore === 2001
        ? '§3回旋-消耗5级经验(cd 5秒)\n(在敌人位置生成旋风)'
        : '回旋-消耗5级经验(cd 5秒)\n(在敌人位置生成旋风)';
    const btn2Text = currentScore === 2002
        ? '§3移位-消耗5级经验(cd 5秒)\n(瞬间向前位移十格)'
        : '移位-消耗5级经验(cd 5秒)\n(瞬间向前位移十格)';
    const btn9Text = currentScore === 100001
        ? '§3不携带技能'
        : '不携带技能';
    let form = new ActionFormData()
        .title('选择你的王朝暗影技能')
        .button(btn1Text, 'textures/ability/whirl')
        .button(btn2Text, 'textures/ability/shift')
        .button(btn9Text, 'textures/items/shadow_energy');
    form.show(player).then((t) => {
        if (t.canceled) return;
        switch (t.selection) {
            case 0:
                player.runCommand('scoreboard players set @s shadow_ability 2001');
                player.sendMessage('§3您已选择 回旋 暗影技能');
                break;
            case 1:
                player.runCommand('scoreboard players set @s shadow_ability 2002');
                player.sendMessage('§3您已选择 移位 暗影技能');
                break;
            case 8:
                player.runCommand('scoreboard players set @s shadow_ability 100001');
                player.sendMessage('§3您取消携带了暗影技能');
                break;
        }
    }).catch((error) => {
        console.error('技能选择表单错误:', error);
    });
}
//先锋技能选择表单
function select_ability_h(player) {
    let currentScore = 0;
    try {
        const scoreboardObjectiveId = 'shadow_ability';
        let objective = world.scoreboard.getObjective(scoreboardObjectiveId);
        if (!objective) {
            objective = world.scoreboard.addObjective(scoreboardObjectiveId, '暗影技能');
        }
        if (objective) {
            let scoreID = player.scoreboardIdentity;
            if (!scoreID) {
                const identities = objective.getParticipants();
                scoreID = identities.find((id) => id.displayName === player.nameTag);
            }
            currentScore = scoreID ? objective.getScore(scoreID) : 0;
        }
    } catch (error) {
        console.error('获取技能分数时出错:', error);
        currentScore = 0;
    }
    const btn1Text = currentScore === 3001
        ? '§3迸火-消耗5级经验(cd 5秒)\n(在敌人位置迸发暗影火焰)'
        : '迸火-消耗5级经验(cd 5秒)\n(在敌人位置迸发暗影火焰)';
    const btn2Text = currentScore === 3002
        ? '§3摧毁-消耗10级经验(cd 5秒)\n(砸地释放冲击波)'
        : '摧毁-消耗10级经验(cd 5秒)\n(砸地释放冲击波)';
    const btn9Text = currentScore === 100001
        ? '§3不携带技能'
        : '不携带技能';
    let form = new ActionFormData()
        .title('选择你的先锋暗影技能')
        .button(btn1Text, 'textures/ability/eruption')
        .button(btn2Text, 'textures/ability/blast')
        .button(btn9Text, 'textures/items/shadow_energy');
    form.show(player).then((t) => {
        if (t.canceled) return;
        switch (t.selection) {
            case 0:
                player.runCommand('scoreboard players set @s shadow_ability 3001');
                player.sendMessage('§3您已选择 迸火 暗影技能');
                break;
            case 1:
                player.runCommand('scoreboard players set @s shadow_ability 3002');
                player.sendMessage('§3您已选择 摧毁 暗影技能');
                break;
            case 8:
                player.runCommand('scoreboard players set @s shadow_ability 100001');
                player.sendMessage('§3您取消携带了暗影技能');
                break;
        }
    }).catch((error) => {
        console.error('技能选择表单错误:', error);
    });
}
//物品右键事件监听
const ourProjectiles = new Set();
world.afterEvents.itemUse.subscribe((t) => {
    const player = t.source;
    const scoreboardObjectiveId1 = 'shadow_ability';
    let objective1 = world.scoreboard.getObjective(scoreboardObjectiveId1);
    if (!objective1) {
        objective1 = world.scoreboard.addObjective(scoreboardObjectiveId1, '暗影技能');
    }
    let scoreID1 = player.scoreboardIdentity;
    if (!scoreID1) {
        const identities1 = objective1.getParticipants();
        scoreID1 = identities1.find((id1) => id1.displayName === player.nameTag);
    }
    const playerScore = scoreID1 ? objective1.getScore(scoreID1) : 0;

    const scoreboardObjectiveId2 = 'shadow_faction';
    let objective2 = world.scoreboard.getObjective(scoreboardObjectiveId2);
    if (!objective2) {
        objective2 = world.scoreboard.addObjective(scoreboardObjectiveId2, '派系');
    }
    let scoreID2 = player.scoreboardIdentity;
    if (!scoreID2) {
        const identities2 = objective2.getParticipants();
        scoreID2 = identities2.find((id2) => id2.displayName === player.nameTag);
    }
    const targetScore = scoreID2 ? objective2.getScore(scoreID2) : 0;

    if ((t.itemStack.typeId === 'sf:shadow_ability_legion' && playerScore === 100001) || (t.itemStack.typeId === 'sf:shadow_ability_dynasty' && playerScore === 100001) || (t.itemStack.typeId === 'sf:shadow_ability_herald' && playerScore === 100001)) {
        updateAbilityItemByScore(player)
    }
    if (t.itemStack.typeId === 'sf:shadow_faction_legion' && player.isSneaking || t.itemStack.typeId === 'sf:shadow_faction_dynasty' && player.isSneaking || t.itemStack.typeId === 'sf:shadow_faction_herald' && player.isSneaking) {
        select_faction(player)
    }
    if (t.itemStack.typeId === 'sf:shadow_ability_legion' && player.isSneaking) {
        select_ability_l(player);
    }
    if (t.itemStack.typeId === 'sf:shadow_ability_dynasty' && player.isSneaking) {
        select_ability_d(player);
    }
    if (t.itemStack.typeId === 'sf:shadow_ability_herald' && player.isSneaking) {
        select_ability_h(player);
    }
    //窒息
    if (t.itemStack.typeId === 'sf:shadow_ability_legion' && !player.isSneaking && playerScore === 1001) {
        const CHOKE_COOLDOWN = 35 * 20; // 游戏刻（20刻=1秒）
        const playerId = player.id;
        const now = system.currentTick;
        if (skillCooldowns.has(playerId) && skillCooldowns.get(playerId).get(1001) > now) {
            const remaining = Math.ceil((skillCooldowns.get(playerId).get(1001) - now) / 20);
            player.sendMessage(`§c技能冷却中，剩余${remaining}秒`);
            return;
        }
        if (!skillCooldowns.has(playerId)) skillCooldowns.set(playerId, new Map());
        skillCooldowns.get(playerId).set(1001, now + CHOKE_COOLDOWN);
        player.sendMessage('§3您释放了 窒息 暗影技能');
        const viewDir = player.getViewDirection();
        const playerPos = player.location;
        const eyeHeight = 1.62;
        const spawnPos = {
            x: playerPos.x + viewDir.x * 0.5,
            y: playerPos.y + eyeHeight + viewDir.y * 0.5,
            z: playerPos.z + viewDir.z * 0.5
        };
        const projectile = player.dimension.spawnEntity('sf:shadowball1', spawnPos);
        ourProjectiles.add(projectile.id);
        projectile.applyImpulse({
            x: viewDir.x * 2,
            y: viewDir.y * 2,
            z: viewDir.z * 2
        });
        player.runCommand(`playsound mob.shulker.shoot @s ~ ~ ~ 1 1`);
        player.runCommand(`playanimation ${player.nameTag} animation.player.shadow2`)
    }
    //上勾拳
    if (t.itemStack.typeId === 'sf:shadow_ability_legion' && !player.isSneaking && playerScore === 1002) {
        const UPPERCUT_COOLDOWN = 35 * 20;
        const playerId = player.id;
        const now = system.currentTick;
        if (skillCooldowns.has(playerId) && skillCooldowns.get(playerId).get(1002) > now) {
            const remaining = Math.ceil((skillCooldowns.get(playerId).get(1002) - now) / 20);
            player.sendMessage(`§c技能冷却中，剩余${remaining}秒`);
            return;
        }
        if (!skillCooldowns.has(playerId)) skillCooldowns.set(playerId, new Map());
        skillCooldowns.get(playerId).set(1002, now + UPPERCUT_COOLDOWN);
        player.sendMessage('§3您释放了 上勾拳 暗影技能');
        const viewDir = player.getViewDirection();
        const playerPos = player.location;
        const eyeHeight = 1.62;
        const spawnPos = {
            x: playerPos.x + viewDir.x * 0.5,
            y: playerPos.y + eyeHeight + viewDir.y * 0.5,
            z: playerPos.z + viewDir.z * 0.5
        };
        const projectile = player.dimension.spawnEntity('sf:shadowball2', spawnPos);
        ourProjectiles.add(projectile.id);
        projectile.applyImpulse({
            x: viewDir.x * 2,
            y: viewDir.y * 2 + 0.3,
            z: viewDir.z * 2
        });
        player.runCommand(`playsound mob.shulker.shoot @s ~ ~ ~ 1 1`);
        player.runCommand(`playanimation ${player.nameTag} animation.player.shadow3`);
    }
    //回旋
    if (t.itemStack.typeId === 'sf:shadow_ability_dynasty' && !player.isSneaking && playerScore === 2001) {
        const WHIRL_COOLDOWN = 35 * 20;
        const playerId = player.id;
        const now = system.currentTick;
        if (skillCooldowns.has(playerId) && skillCooldowns.get(playerId).get(2001) > now) {
            const remaining = Math.ceil((skillCooldowns.get(playerId).get(2001) - now) / 20);
            player.sendMessage(`§c技能冷却中，剩余${remaining}秒`);
            return;
        }
        if (!skillCooldowns.has(playerId)) skillCooldowns.set(playerId, new Map());
        skillCooldowns.get(playerId).set(2001, now + WHIRL_COOLDOWN);
        player.sendMessage('§3您释放了 回旋 暗影技能');
        const viewDir = player.getViewDirection();
        const playerPos = player.location;
        const eyeHeight = 1.62;
        const spawnPos = {
            x: playerPos.x + viewDir.x * 0.5,
            y: playerPos.y + eyeHeight + viewDir.y * 0.5,
            z: playerPos.z + viewDir.z * 0.5
        };
        const projectile = player.dimension.spawnEntity('sf:shadowball3', spawnPos);
        ourProjectiles.add(projectile.id);
        projectile.applyImpulse({
            x: viewDir.x * 2,
            y: viewDir.y * 2,
            z: viewDir.z * 2
        });
        player.runCommand(`playsound mob.shulker.shoot @s ~ ~ ~ 1 1`);
        player.runCommand(`playanimation ${player.nameTag} animation.player.shadow4`);
    }
    //移位
    if (t.itemStack.typeId === 'sf:shadow_ability_dynasty' && !player.isSneaking && playerScore === 2002) {
        const SHIFT_COOLDOWN = 35 * 20;
        const playerId = player.id;
        const now = system.currentTick;
        if (skillCooldowns.has(playerId) && skillCooldowns.get(playerId).get(2002) > now) {
            const remaining = Math.ceil((skillCooldowns.get(playerId).get(2002) - now) / 20);
            player.sendMessage(`§c技能冷却中，剩余${remaining}秒`);
            return;
        }
        if (!skillCooldowns.has(playerId)) skillCooldowns.set(playerId, new Map());
        skillCooldowns.get(playerId).set(2002, now + SHIFT_COOLDOWN);
        player.sendMessage('§3您释放了 移位 暗影技能');
        player.runCommand(`execute as @s at @s run particle sf:shadow4`);
        player.runCommand(`playanimation ${player.nameTag} animation.player.shadow5`);
        system.runTimeout(() => {
            player.runCommand(`tp ${player.nameTag} ^^^10`)
        }, 40);
        system.runTimeout(() => {
            player.runCommand(`execute as @s at @s run particle sf:shadow4`);
            player.runCommand(`playanimation ${player.nameTag} animation.player.shadow5`);
        }, 45);
    }
    //迸火
    if (t.itemStack.typeId === 'sf:shadow_ability_herald' && !player.isSneaking && playerScore === 3001) {
        const ERUPTION_COOLDOWN = 35 * 20;
        const playerId = player.id;
        const now = system.currentTick;
        if (skillCooldowns.has(playerId) && skillCooldowns.get(playerId).get(3001) > now) {
            const remaining = Math.ceil((skillCooldowns.get(playerId).get(3001) - now) / 20);
            player.sendMessage(`§c技能冷却中，剩余${remaining}秒`);
            return;
        }
        if (!skillCooldowns.has(playerId)) skillCooldowns.set(playerId, new Map());
        skillCooldowns.get(playerId).set(3001, now + ERUPTION_COOLDOWN);
        player.sendMessage('§3您释放了 迸火 暗影技能');
        const viewDir = player.getViewDirection();
        const playerPos = player.location;
        const eyeHeight = 1.62;
        const spawnPos = {
            x: playerPos.x + viewDir.x * 0.5,
            y: playerPos.y + eyeHeight + viewDir.y * 0.5,
            z: playerPos.z + viewDir.z * 0.5
        };
        const projectile = player.dimension.spawnEntity('sf:shadowball4', spawnPos);
        ourProjectiles.add(projectile.id);
        projectile.applyImpulse({
            x: viewDir.x * 2,
            y: viewDir.y * 2 + 0.3,
            z: viewDir.z * 2
        });
        player.runCommand(`playsound mob.ghast.fireball @s ~ ~ ~ 1 1`);
        player.runCommand(`playanimation ${player.nameTag} animation.player.shadow6`);
    }
    //摧毁
    if (t.itemStack.typeId === 'sf:shadow_ability_herald' && !player.isSneaking && playerScore === 3002) {
        const BLAST_COOLDOWN = 35 * 20;
        const playerId = player.id;
        const now = system.currentTick;
        if (skillCooldowns.has(playerId) && skillCooldowns.get(playerId).get(3002) > now) {
            const remaining = Math.ceil((skillCooldowns.get(playerId).get(3002) - now) / 20);
            player.sendMessage(`§c技能冷却中，剩余${remaining}秒`);
            return;
        }
        if (!skillCooldowns.has(playerId)) skillCooldowns.set(playerId, new Map());
        skillCooldowns.get(playerId).set(3002, now + BLAST_COOLDOWN);
        player.sendMessage('§3您释放了 摧毁 暗影技能');
        player.runCommand(`damage @e[r=5,name=!${player.nameTag}] 20 entity_attack entity ${player.nameTag}`);
        player.runCommand(`playanimation ${player.nameTag} animation.player.shadow1`);
        player.runCommand(`camerashake add ${player.nameTag} 2 0.1`);
        player.runCommand(`playsound mob.shulker.shoot ${player.nameTag}`);
        player.runCommand(`execute as ${player.nameTag} at ${player.nameTag} run particle sf:shadow1`);
    }
});
//抛投物击中实体事件监听
world.afterEvents.projectileHitEntity.subscribe((eventData) => {
    const { projectile, source } = eventData;
    const hitEntity = eventData.getEntityHit()?.entity;
    if (projectile.typeId === 'sf:shadowball1' && hitEntity && ourProjectiles.has(projectile.id)) {
        //窒息
        ourProjectiles.delete(projectile.id);
        const effectTag = `shadow_projectile_${hitEntity.id}`;
        hitEntity.addTag(effectTag);
        world.getDimension(hitEntity.dimension.id).runCommand(
            `effect @e[tag=${effectTag}] levitation 2 1 true`
        );
        world.getDimension(hitEntity.dimension.id).runCommand(
            `playanimation @e[tag=${effectTag}] animation.entity.shadow2`
        );
        const particleInterval = system.runInterval(() => {
            if (hitEntity.isValid && hitEntity.hasTag(effectTag)) {
                world.getDimension(hitEntity.dimension.id).spawnParticle(
                    'sf:shadow2',
                    hitEntity.location
                );
            } else {
                system.clearRun(particleInterval);
            }
        }, 1);
        let checkCount = 0;
        let lastPos = null;
        const groundCheckInterval = system.runInterval(() => {
            checkCount++;
            if (!hitEntity.isValid || !hitEntity.hasTag(effectTag) || checkCount > 60) {
                system.clearRun(groundCheckInterval);
                return;
            }
            const currentPos = hitEntity.location;
            if (!lastPos) lastPos = currentPos;
            if (hitEntity.isOnGround ||
                (Math.abs(currentPos.y - lastPos.y) < 0.01 && checkCount > 20)) {
                world.getDimension(hitEntity.dimension.id).runCommand(
                    `execute as @e[tag=${effectTag}] at @s run execute as @p at @s run playsound mace.smash_ground @s`
                );
                world.getDimension(hitEntity.dimension.id).runCommand(
                    `execute as @e[tag=${effectTag}] at @s run execute as @e[r=5,tag=!${effectTag},type=!player] at @s run damage @s 2`
                );
                world.getDimension(hitEntity.dimension.id).runCommand(
                    `execute as @e[tag=${effectTag}] at @s run execute as @e[r=5,tag=!${effectTag},type=!player] at @s run tp @s ^^1^ facing @e[tag=${effectTag}]`
                );
                world.getDimension(hitEntity.dimension.id).runCommand(
                    `execute as @e[tag=${effectTag}] at @s run execute as @e[r=5,tag=!${effectTag},type=!player] at @s run tp @s ^^^-3`
                );
                system.clearRun(groundCheckInterval);
            }
            lastPos = currentPos;
        }, 1);
        system.runTimeout(() => {
            if (hitEntity.isValid) {
                hitEntity.removeTag(effectTag);
            }
            system.clearRun(particleInterval);
            system.clearRun(groundCheckInterval);
        }, 80);
    } else if (projectile.typeId === 'sf:shadowball2' && hitEntity && ourProjectiles.has(projectile.id)) {
        //上勾拳
        ourProjectiles.delete(projectile.id);
        const effectTag = `shadow_upper_${hitEntity.id}`;
        hitEntity.addTag(effectTag);
        world.getDimension(hitEntity.dimension.id).runCommand(
            `damage @e[tag=${effectTag}] 10 entity_attack`
        );
        world.getDimension(hitEntity.dimension.id).runCommand(
            `execute as @e[tag=${effectTag}] at @s run particle sf:hole`
        );
        world.getDimension(hitEntity.dimension.id).runCommand(
            `effect @e[tag=${effectTag}] levitation 1 1 true`
        );
        world.getDimension(hitEntity.dimension.id).runCommand(
            `execute as @e[tag=${effectTag}] at @s run particle sf:shadow3`
        );
        system.runTimeout(() => {
            world.getDimension(hitEntity.dimension.id).runCommand(
                `execute as @e[tag=${effectTag}] at @s run tp @s ^^^ facing @p`
            );
            world.getDimension(hitEntity.dimension.id).runCommand(
                `execute as @e[tag=${effectTag}] at @s run tp @s ^^^3`
            );
        }, 10);
        system.runTimeout(() => {
            world.getDimension(hitEntity.dimension.id).runCommand(
                `playanimation @e[tag=${effectTag}] animation.entity.shadow3`
            );
        }, 19);
        let checkCount = 0;
        let lastPos = null;
        const groundCheckInterval = system.runInterval(() => {
            checkCount++;
            if (!hitEntity.isValid || !hitEntity.hasTag(effectTag) || checkCount > 60) {
                system.clearRun(groundCheckInterval);
                return;
            }
            const currentPos = hitEntity.location;
            if (!lastPos) lastPos = currentPos;
            if (hitEntity.isOnGround ||
                (Math.abs(currentPos.y - lastPos.y) < 0.01 && checkCount > 60)) {
                world.getDimension(hitEntity.dimension.id).runCommand(
                    `execute as @e[tag=${effectTag}] at @s run execute as @p at @s run playsound mace.smash_ground @s ~~~ 0.5 1`
                );
                world.getDimension(hitEntity.dimension.id).runCommand(
                    `execute as @e[tag=${effectTag}] at @s run execute as @e[r=5,tag=!${effectTag},type=!player] at @s run damage @s 1`
                );
                world.getDimension(hitEntity.dimension.id).runCommand(
                    `execute as @e[tag=${effectTag}] at @s run execute as @e[r=5,tag=!${effectTag},type=!player] at @s run tp @s ^^0.5^ facing @e[tag=${effectTag}]`
                );
                world.getDimension(hitEntity.dimension.id).runCommand(
                    `execute as @e[tag=${effectTag}] at @s run execute as @e[r=5,tag=!${effectTag},type=!player] at @s run tp @s ^^^-0.5`
                );
                system.clearRun(groundCheckInterval);
            }
            lastPos = currentPos;
        }, 1);
        system.runTimeout(() => {
            if (hitEntity.isValid) {
                hitEntity.removeTag(effectTag);
            }
            system.clearRun(groundCheckInterval);
        }, 121);
    } else if (projectile.typeId === 'sf:shadowball3' && hitEntity && ourProjectiles.has(projectile.id)) {
        //回旋
        ourProjectiles.delete(projectile.id);
        const effectTag = `shadow_upper_${hitEntity.id}`;
        hitEntity.addTag(effectTag);
        world.getDimension(hitEntity.dimension.id).runCommand(
            `damage @e[tag=${effectTag}] 10 entity_attack`
        );
        world.getDimension(hitEntity.dimension.id).runCommand(
            `execute as @e[tag=${effectTag}] at @s run particle sf:hole`
        );

        world.getDimension(hitEntity.dimension.id).runCommand(
            `execute as @e[tag=${effectTag}] at @s run particle sf:shadow6`
        );
        world.getDimension(hitEntity.dimension.id).runCommand(
            `effect @e[tag=${effectTag}] levitation 1 0 true`
        );
        let checkCount = 0;
        let lastPos = null;
        const groundCheckInterval = system.runInterval(() => {
            checkCount++;
            if (!hitEntity.isValid || !hitEntity.hasTag(effectTag) || checkCount > 60) {
                system.clearRun(groundCheckInterval);
                return;
            }
            const currentPos = hitEntity.location;
            if (!lastPos) lastPos = currentPos;
            if (hitEntity.isOnGround ||
                (Math.abs(currentPos.y - lastPos.y) < 0.01 && checkCount > 40)) {
                world.getDimension(hitEntity.dimension.id).runCommand(
                    `execute as @e[tag=${effectTag}] at @s run execute as @p at @s run playsound mace.smash_ground @s ~~~ 0.5 1`
                );
                world.getDimension(hitEntity.dimension.id).runCommand(
                    `execute as @e[tag=${effectTag}] at @s run execute as @e[r=5,tag=!${effectTag},type=!player] at @s run damage @s 1`
                );
                world.getDimension(hitEntity.dimension.id).runCommand(
                    `execute as @e[tag=${effectTag}] at @s run execute as @e[r=5,tag=!${effectTag},type=!player] at @s run tp @s ^^1^ facing @e[tag=${effectTag}]`
                );
                world.getDimension(hitEntity.dimension.id).runCommand(
                    `execute as @e[tag=${effectTag}] at @s run execute as @e[r=5,tag=!${effectTag},type=!player] at @s run tp @s ^^^-1`
                );
                system.clearRun(groundCheckInterval);
            }
            lastPos = currentPos;
        }, 1);
        system.runTimeout(() => {
            if (hitEntity.isValid) {
                hitEntity.removeTag(effectTag);
            }
            system.clearRun(groundCheckInterval);
        }, 121);
    } else if (projectile.typeId === 'sf:shadowball4' && hitEntity && ourProjectiles.has(projectile.id)) {
        //迸火
        ourProjectiles.delete(projectile.id);
        const effectTag = `shadow_upper_${hitEntity.id}`;
        hitEntity.addTag(effectTag);
        world.getDimension(hitEntity.dimension.id).runCommand(
            `damage @e[tag=${effectTag}] 10 entity_attack`
        );
        world.getDimension(hitEntity.dimension.id).runCommand(
            `execute as @e[tag=${effectTag}] at @s run particle sf:hole`
        );
        world.getDimension(hitEntity.dimension.id).runCommand(
            `effect @e[tag=${effectTag}] levitation 1 1 true`
        );
        world.getDimension(hitEntity.dimension.id).runCommand(
            `execute as @e[tag=${effectTag}] at @s run particle sf:shadow5`
        );
        system.runTimeout(() => {
            world.getDimension(hitEntity.dimension.id).runCommand(
                `playanimation @e[tag=${effectTag}] animation.entity.shadow3`
            );
        }, 19);
        let checkCount = 0;
        let lastPos = null;
        const groundCheckInterval = system.runInterval(() => {
            checkCount++;
            if (!hitEntity.isValid || !hitEntity.hasTag(effectTag) || checkCount > 60) {
                system.clearRun(groundCheckInterval);
                return;
            }
            const currentPos = hitEntity.location;
            if (!lastPos) lastPos = currentPos;
            if (hitEntity.isOnGround ||
                (Math.abs(currentPos.y - lastPos.y) < 0.01 && checkCount > 60)) {
                world.getDimension(hitEntity.dimension.id).runCommand(
                    `execute as @e[tag=${effectTag}] at @s run execute as @p at @s run playsound mace.smash_ground @s ~~~ 0.5 1`
                );
                world.getDimension(hitEntity.dimension.id).runCommand(
                    `execute as @e[tag=${effectTag}] at @s run execute as @e[r=5,tag=!${effectTag},type=!player] at @s run damage @s 1`
                );
                world.getDimension(hitEntity.dimension.id).runCommand(
                    `execute as @e[tag=${effectTag}] at @s run execute as @e[r=5,tag=!${effectTag},type=!player] at @s run tp @s ^^0.5^ facing @e[tag=${effectTag}]`
                );
                world.getDimension(hitEntity.dimension.id).runCommand(
                    `execute as @e[tag=${effectTag}] at @s run execute as @e[r=5,tag=!${effectTag},type=!player] at @s run tp @s ^^^-0.5`
                );
                system.clearRun(groundCheckInterval);
            }
            lastPos = currentPos;
        }, 1);
        system.runTimeout(() => {
            if (hitEntity.isValid) {
                hitEntity.removeTag(effectTag);
            }
            system.clearRun(groundCheckInterval);
        }, 121);
    }
});
