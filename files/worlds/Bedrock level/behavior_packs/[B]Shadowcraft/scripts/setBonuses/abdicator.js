import { world, system } from "@minecraft/server"

// 检测【指定实体】的【指定装备槽】是否有【指定物品】
function hasEquipment(entity, slot, itemId) {
	return (typeof entity.getComponent('minecraft:equippable').getEquipment(slot) !== 'undefined' ? entity.getComponent('minecraft:equippable').getEquipment(slot).typeId : 'undefined') === itemId
}

// 检测【指定实体】的【快捷栏】是否有【指定物品】
function hasHotbarItem(entity, itemId) {
	const container = entity.getComponent('minecraft:inventory').container
	let boolean = false
	for (let slot = 0; slot <= 8; slot++) {
		if ((typeof container.getItem(slot) !== 'undefined' ? container.getItem(slot).typeId : 'undefined') === itemId) {
			boolean = true
			break
		}
	}
	return boolean
}

// 激活套装效果
system.runInterval(() => {
	for (const player of world.getAllPlayers()) {
		if (
			hasEquipment(player, 'Head', 'sf:higher_calling') &&
			hasEquipment(player, 'Chest', 'sf:divine_retribution') &&
			hasHotbarItem(player, 'sf:arbitrator')
		) {
			player.runCommand('effect @s health_boost 5 4 true')
			if (!player.hasTag('is_abdicator_set')) {
				player.runCommand('effect @s regeneration 1 255 true')
				player.addTag('is_abdicator_set')
				player.sendMessage("退位者套装效果:当你受到致命伤害时,你将在十秒内战无不胜并造成二倍伤害")
			}
		} else if (player.hasTag('is_abdicator_set')) {
			player.removeTag('is_abdicator_set')
		}
	}
}, 5)

// 触发无敌效果
world.afterEvents.entityHurt.subscribe(t => {
	const player = t.hurtEntity
	if (
		player.typeId === 'minecraft:player' &&
		player.getComponent('minecraft:health').currentValue < 1 &&
		player.getComponent('minecraft:health').currentValue > 0 &&
		player.hasTag('is_abdicator_set')
	) {
		if (hasEquipment(player, 'Mainhand', 'sf:arbitrator')) {
			player.addTag('is_abdicator_set_undying')
			player.runCommand('effect @s regeneration 10 5 true')
			player.runCommand('effect @s strength 10 2 true')
			player.runCommand('effect @s resistance 10 4 true')
			player.runCommand('effect @s fire_resistance 10 0 true')
			system.runTimeout(() => {
				player.kill()
			}, 200)
		} else {
			system.runTimeout(() => {
				player.kill()
			}, 1)
		}
	}
})
