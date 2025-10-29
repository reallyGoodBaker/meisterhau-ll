import { world } from '@minecraft/server'
import { ActionFormData, MessageFormData, ModalFormData } from '@minecraft/server-ui'
world.afterEvents.itemUse.subscribe(t => {
	if (t.itemStack.typeId == 'sf:skin_editor') {
		skin(t.source)
	}
})
function skin(player) {
	let form = new ActionFormData()
	form.title('皮肤切换器')
		.body('选择你的皮肤')
		.button(`${player.nameTag}\n(你)`, 'textures/items/skin_editor')
		.button('萨奇', 'textures/items/sarge_head')
		.button('伽林', 'textures/items/galen_head')
		.button('奇士摩', 'textures/items/gizmo_head')
		.button('琼\n(公主)', 'textures/items/june_head')
		.button('项楚\n(王朝)', 'textures/items/xiangtzu_head')
		.button('项楚\n(三种风格大师)', 'textures/items/xiangtzu2_head')
		.button('伊图', 'textures/items/itu_head')
		.button('马库斯', 'textures/items/markus_head')
		.button('吉特森-1', 'textures/items/kitsune1_head')
		.button('陌生人', 'textures/items/stranger_head')
	form.show(player).then(t => {
		switch (t.selection) {
			case 0:
				skinCustom(player)
				player.triggerEvent('skin_custom:custom_skin')
				break
			case 1:
				player.triggerEvent('skin_custom:sarge')
				break
			case 2:
				player.triggerEvent('skin_custom:galen')
				break
			case 3:
				player.triggerEvent('skin_custom:gizmo')
				break
			case 4:
				player.triggerEvent('skin_custom:june')
				break
			case 5:
				player.triggerEvent('skin_custom:xiang_tzu')
				break
			case 6:
				player.triggerEvent('skin_custom:xiang_tzu2')
				break
			case 7:
				player.triggerEvent('skin_custom:itu')
				break
			case 8:
				player.triggerEvent('skin_custom:marcus')
				break
			case 9:
				player.triggerEvent('skin_custom:kitsune1')
				break
			case 10:
				player.triggerEvent('skin_custom:stranger')
				break
		}
	})
}
function skinCustom(player) {
	const modalForm = new ModalFormData()
	modalForm.title('皮肤编辑器')
	modalForm.dropdown('选择你的性别', ['随机', '男性', '女性'])
	modalForm.dropdown('选择你的发色', ['随机', '黑色', '棕色', '金色'])
	modalForm.dropdown('选择你的发型', ['随机', '一', '二', '三', '四'])
	modalForm.dropdown('选择你的脸型', ['随机', '一', '二', '三'])
	modalForm.show(player).then(t => {
		if (t.canceled) {
			skin(player)
		}
		const formValues = t.formValues
		switch (formValues[0]) {
			case 0:
				player.triggerEvent('skin_custom:gender_random')
				break
			case 1:
				player.triggerEvent('skin_custom:gender_set_man')
				break
			case 2:
				player.triggerEvent('skin_custom:gender_set_woman')
				break
		}
		switch (formValues[1]) {
			case 0:
				player.triggerEvent('skin_custom:hair_color_random')
				break
			case 1:
				player.triggerEvent('skin_custom:hair_color_1')
				break
			case 2:
				player.triggerEvent('skin_custom:hair_color_2')
				break
			case 3:
				player.triggerEvent('skin_custom:hair_color_3')
				break
		}
		switch (formValues[2]) {
			case 0:
				player.triggerEvent('skin_custom:hair_random')
				break
			case 1:
				player.triggerEvent('skin_custom:hair_1')
				break
			case 2:
				player.triggerEvent('skin_custom:hair_2')
				break
			case 3:
				player.triggerEvent('skin_custom:hair_3')
				break
			case 4:
				player.triggerEvent('skin_custom:hair_4')
				break
		}
		switch (formValues[3]) {
			case 0:
				player.triggerEvent('skin_custom:face_random')
				break
			case 1:
				player.triggerEvent('skin_custom:face_1')
				break
			case 2:
				player.triggerEvent('skin_custom:face_2')
				break
			case 3:
				player.triggerEvent('skin_custom:face_3')
				break
		}
	})
}
