import { world, system } from '@minecraft/server'
import { ActionFormData, MessageFormData, ModalFormData } from '@minecraft/server-ui'
export { book }
world.afterEvents.itemUse.subscribe(t => {
    if (t.itemStack.typeId == 'sf:shadow_book') {
        book(t.source)
    }
})
function book(player) {
    let form = new ActionFormData()
    form.title('暗影大典')
        .body('冒险者，欢迎来到暗影世界！您可以了解以下内容')
        .button('派系', 'textures/Legion')
        .button('装备', 'textures/armors')
        .button('人物', 'textures/items/skin_editor')
        .button('货币', 'textures/currency')
    form.show(player).then(t => {
        switch (t.selection) {
            case 0:
                factions(player)
                break
            case 1:
                equipment(player)
                break
            case 2:
                characters(player)
                break
            case 3:
                currency(player)
                break
        }
    })
}
function factions(player) {
    let form = new ActionFormData()
    form.title('暗影大典')
        .body('冒险者，欢迎来到暗影世界！以下是三个派系')
        .button('军团', 'textures/Legion')
        .button('王朝', 'textures/Dynasty')
        .button('先锋', 'textures/Heralds')
    form.show(player).then(t => {
        if (t.canceled) {
            book(player)
        }
        switch (t.selection) {
            case 0:
                legion(player)
                break
            case 1:
                dynasty(player)
                break
            case 2:
                heralds(player)
                break
        }
    })
}
function legion(player) {
    let form = new ActionFormData()
    form.title('暗影大典')
        .body('军团是一个旨在摧毁暗影能量的好战派系。军团遵循严格的法律，并且愿意接受任何不愿停止工作的人加入他们的队伍\n军团是一个军国主义派别。它的目标简单明了:消除世界各地的暗影能量，防止它再次出现。它的意识形态是严厉的:它不接受任何弱点，不为自己的行为道歉或解释，愿意为人类做出一切牺牲。这就是为什么其他派系不喜欢军团，至少可以这么说。\n军团士兵遵守严格的军法，重视服从、奉献和意志高于一切。 他们对人类恒常性的信念是全面的。 真正的军团战士是在成为一名伟大战士的道路上拒绝所有弱点，并依靠力量和不懈努力的人。 成为他们中的一员是有风险的，因为接下来的每一场战斗都可能成为最后一场。 不管怎样，那些自愿站在他们旗帜下的人的涌入从未停止，因为有许多人愿意成为战争英雄和世界的拯救者。 现在，军团欣然接受每一个能够忍受其艰苦训练的人，之后战士就会获得坚定的盟友，他们会站在他或她的身后。\n(来自暗影格斗3Wiki)')
        .button('我已知晓')
    form.show(player).then(t => {
        if (t.canceled) {
            factions(player)
        }
    })
}
function dynasty(player) {
    let form = new ActionFormData()
    form.title('暗影大典')
        .body('王朝是一个高度发达国家的统治家族。它的首都是一个真正的跨国城市，以各种格斗艺术学校而闻名。与其他派系不同的是，王朝对暗影能量的态度是务实的;只要它有用，他们就会使用它，而不认为它是危险的东西。\n这个王朝的首都是一千所武术学校的所在地;一个城市密集的蚁丘，在那里好斗和有魅力的人可以聚集一群忠实的追随者。首都的生活节奏非常快。这个王朝的人民根本不知道其他的生活方式。这就是为什么你将遇到的战士敏捷而优雅，更喜欢轻型武器。\n首都以一年一度的格斗艺术大赛而闻名，在这一活动中，不同流派的高手可以争夺人群的注意力和帝国元首的仁慈。\n后者受到他的人民的特别尊重。在暗影能量上，皇帝已经在实践中证明，如果明智地使用它，它可以为人类带来好处。令许多人惊讶的是，这个国家繁荣起来了!但是军团被这种反复无常的性格搞糊涂了。从那时起，这两个派系就闹翻了。\n(来自暗影格斗3Wiki)')
        .button('我已知晓')
    form.show(player).then(t => {
        if (t.canceled) {
            factions(player)
        }
    })
}
function heralds(player) {
    let form = new ActionFormData()
    form.title('暗影大典')
        .body('先锋比其他派系更了解暗影能量及其潜力。它的人民生活在一个巨大的、看不见的穹顶之下，周围充满了只有先驱才能克服的幻觉。\n先锋是一个动机不明的神秘派系。它经常被比作随时可能爆发的休眠火山。军团的士兵在猎鹰峡谷的战斗中遇到了先锋，他们对此深有体会。先锋在暗影能量和基于暗影的技术方面非常博学。\n狡猾的王朝发现这些知识非常有用。皇帝的家人对先锋在首都自由活动视而不见。唉，平民百姓可没那么有同情心。先锋兵是穿着深色服装、阴郁、沉默寡言的战士。平民百姓对他们敬而远之，在背后低声咒骂。\n先锋兵很少拔出剑，但当他们拔出剑时（例如自卫），敌人就注定要灭亡。他们的动作在数学上是精确的、快速的和致命的，因此即使是最有权势的人也宁愿避免与先锋直接对抗。\n(来自暗影格斗3Wiki)')
        .button('我已知晓')
    form.show(player).then(t => {
        if (t.canceled) {
            factions(player)
        }
    })
}
function equipment(player) {
    let form = new ActionFormData()
    form.title('暗影大典')
        .body('冒险者，欢迎来到暗影世界！，以下类别中展示了目前模组的所有装备以及套装')
        .button('头盔', 'textures/helmets')
        .button('盔甲', 'textures/armors')
        .button('近战武器', 'textures/weapons')
        .button('远程武器', 'textures/ranged_weapons')
        .button('套装', 'textures/armors')
    form.show(player).then(t => {
        if (t.canceled) {
            book(player)
        }
        switch (t.selection) {
            case 0:
                helmets(player)
                break
            case 1:
                armors(player)
                break
            case 2:
                weapons(player)
                break
            case 3:
                ranged_weapons(player)
                break
            case 4:
                equipment_sets(player)
                break
        }
    })
}
function helmets(player) {
    let form = new ActionFormData()
    form.title('暗影大典')
        .body('冒险者，欢迎来到暗影世界！，以下展示了目前模组的所有头盔')
        .button('游牧皮帽\n§7【军团】普通头盔', 'textures/items/nomads_cap')
        .button('基础头盔\n§3【军团】稀有头盔', 'textures/items/bedrock_helm')
        .button('面罩头盔\n§3【军团】稀有头盔', 'textures/items/visored_casque')
        .button('刚硬面盔\n§6【军团】史诗头盔', 'textures/items/rigid_barbute')
        .button('沼泽护盔\n§6【军团】史诗头盔', 'textures/items/swampers_headgear')
        .button('精致头盔\n§e【军团】传奇头盔', 'textures/items/higher_calling')
        .button('旧头巾\n§7【王朝】普通头盔', 'textures/items/rag')
        .button('顿悟帽\n§7【王朝】普通头盔', 'textures/items/epiphany_kasa')
        .button('海马环罩帽\n§7【王朝】普通头盔', 'textures/items/seahorse_veil')
        .button('海上恶魔面具\n§3【王朝】稀有头盔', 'textures/items/sea_devils_mask')
        .button('勇气头盔\n§6【王朝】史诗头盔', 'textures/items/courage')
        .button('金牙圣盔\n§e【王朝】传奇头盔', 'textures/items/golden_fang_crown')
        .button('皮盔\n§7【先锋】普通头盔', 'textures/items/leather_casque')
    form.show(player).then(t => {
        if (t.canceled) {
            equipment(player)
        }
    })
}
function armors(player) {
    let form = new ActionFormData()
    form.title('暗影大典')
        .body('冒险者，欢迎来到暗影世界！，以下展示了目前模组的所有盔甲')
        .button('训练服\n§7【军团】普通盔甲', 'textures/items/training_uniform')
        .button('基础盔甲\n§3【军团】稀有盔甲', 'textures/items/bedrock_armor')
        .button('加固外套\n§3【军团】稀有盔甲', 'textures/items/reinforced_coat')
        .button('铁板胸甲 \n§6【军团】史诗盔甲', 'textures/items/laminar_cuirass')
        .button('沼泽迷彩服\n§6【军团】史诗盔甲', 'textures/items/swampers_camouflage')
        .button('天谴之铠\n§e【军团】传奇盔甲', 'textures/items/divine_retribution')
        .button('刺绣长袍\n§7【王朝】普通盔甲', 'textures/items/embroidered_suit')
        .button('角斗士之铠\n§7【王朝】普通盔甲', 'textures/items/gladiator_armor')
        .button('朴素马甲\n§7【王朝】普通盔甲', 'textures/items/plain_waistcoat')
        .button('毛皮铠甲\n§3【王朝】稀有盔甲', 'textures/items/fur_lined_armor')
        .button('镀金背心\n§3【王朝】稀有盔甲', 'textures/items/gilded_vest')
        .button('长官制服\n§6【王朝】史诗盔甲', 'textures/items/prefects_robe')
        .button('三箭铠甲\n§3【王朝】传奇盔甲', 'textures/items/three_arrows_glory')
        .button('压缩上衣\n§7【先锋】普通盔甲', 'textures/items/compression_suit')
    form.show(player).then(t => {
        if (t.canceled) {
            equipment(player)
        }
    })
}
function weapons(player) {
    let form = new ActionFormData()
    form.title('暗影大典')
        .body('冒险者，欢迎来到暗影世界！，以下展示了目前模组的所有近战武器')
        .button('放血者之刃\n§7【军团】普通单手剑', 'textures/items/bloodletter_blade')
        .button('涟锤\n§7【军团】普通锤', 'textures/items/riffle_hammers')
        .button('坚硬双斧\n§7【军团】普通斧', 'textures/items/solid_hatchets')
        .button('双刃斧\n§3【军团】稀有斧', 'textures/items/labryses')
        .button('合金刺刀\n§3【军团】稀有矛', 'textures/items/metal_sting')
        .button('银色暴风剑\n§3【军团】稀有双手剑', 'textures/items/silver_squall')
        .button('夜魇双斧\n§6【军团】史诗斧', 'textures/items/nightbanes')
        .button('古式大剑\n§6【军团】史诗巨剑', 'textures/items/old_timer')
        .button('华丽双手剑\n§6【军团】史诗双手剑', 'textures/items/ornate_two_hander')
        .button('沼泽狼牙棒\n§6【军团】史诗狼牙棒', 'textures/items/swampers_grinders')
        .button('双邪锤\n§6【军团】史诗锤', 'textures/items/weightened_nunchaku')
        .button('裁决之剑\n§e【军团】传奇双手剑', 'textures/items/arbitrator')
        .button('普通法棒\n§7【王朝】普通木棒', 'textures/items/common_staff')
        .button('双弯刀\n§7【王朝】普通佩刀', 'textures/items/double_scimitars')
        .button('轻盈佩刀\n§3【王朝】稀有佩刀', 'textures/items/lightweight_sabers')
        .button('叛徒双节棍\n§3【王朝】稀有双节棍', 'textures/items/rebel_nunchaku')
        .button('哨兵关刀\n§3【王朝】稀有关刀', 'textures/items/sentrys_guandao')
        .button('木棒\n§3【王朝】稀有木棒', 'textures/items/wooden_staff')
        .button('飞旋莲花链\n§6【王朝】史诗链刀', 'textures/items/aerial_lotus')
        .button('金头棒\n§6【王朝】史诗木棒', 'textures/items/gilded_staff')
        .button('重型双节棍\n§6【王朝】史诗双节棍', 'textures/items/weightened_nunchaku')
        .button('正义之手\n§e【王朝】传奇链刀', 'textures/items/hand_of_justice')
        .button('隐士武士刀\n§7【先锋】普通居合道武士刀', 'textures/items/hermit_katana')
        .button('锋利武士刀\n§7【先锋】普通武士刀', 'textures/items/keen_katana')
        .button('钢钗\n§7【先锋】普通铁尺', 'textures/items/sai')
    form.show(player).then(t => {
        if (t.canceled) {
            equipment(player)
        }
    })
}
function ranged_weapons(player) {
    let form = new ActionFormData()
    form.title('暗影大典')
        .body('冒险者，欢迎来到暗影世界！，以下展示了目前模组的所有远程武器')
        .button('十字飞刀\n§3【军团】稀有飞刀', 'textures/items/iron_crosses')
    form.show(player).then(t => {
        if (t.canceled) {
            equipment(player)
        }
    })
}
function equipment_sets(player) {
    let form = new ActionFormData()
    form.title('暗影大典')
        .body('冒险者，欢迎来到暗影世界！，以下展示了目前已加入模组的套装(部分传奇和独特套装含有套装效果)')
        .button('军团-稀有-A')
        .button('军团-稀有-B')
        .button('军团-史诗-A')
        .button('军团-传奇-退位者', 'textures/abdicator')
        .button('王朝-普通-A')
    form.show(player).then(t => {
        if (t.canceled) {
            equipment(player)
        }
        switch (t.selection) {
            case 0:
                legion_rare_A(player)
                break
            case 1:
                legion_rare_B(player)
                break
            case 2:
                legion_epic_A(player)
                break
            case 3:
                legion_legendary_abdicator(player)
                break
            case 4:
                dynasty_common_A(player)
                break
        }
    })
}
// 检测【指定实体】的【背包】是否有【指定物品】
function hasInventoryItem(entity, itemId) {
    const container = entity.getComponent('minecraft:inventory').container
    let boolean = false
    for (let slot = 0; slot < container.size; slot++) {
        const itemStack = container.getItem(slot)
        if (!itemStack || itemStack.typeId != itemId) continue
        boolean = true
        break
    }
    return boolean
}
function legion_rare_A(player) {
    let form = new ActionFormData()
    form.title('暗影大典')
        .body('面罩头盔\n§3【军团】稀有头盔\n\n§r加固外套\n§3【军团】稀有盔甲\n\n§r双刃斧\n§3【军团】稀有斧\n\n§r预备飞斧\n§3【军团】稀有飞斧\n§r（未加入模组）\n\n§r收集奖励:铜币 64 宝石 10 暗影能量 10')
        .button('领取奖励')
    form.show(player).then(t => {
        if (t.canceled) {
            equipment_sets(player)
        }
        if (t.selection == 0 && hasInventoryItem(player, 'sf:visored_casque') && hasInventoryItem(player, 'sf:reinforced_coat') && hasInventoryItem(player, 'sf:labryses') && !player.hasTag('collect_legion_rare_A')) {
            player.runCommand('give @s sf:copper_coin 64')
            player.runCommand('scoreboard players add @s gem 10')
            player.runCommand('give @s sf:shadow_energy 10')
            player.addTag('collect_legion_rare_A')
            player.sendMessage('§a你已成功领取军团-稀有-A套装的奖励')
        }
        if (t.selection == 0 && player.hasTag('collect_legion_rare_A')) {
            player.sendMessage('§a你已领取过该套装的奖励')
        }
    })
}
function legion_rare_B(player) {
    let form = new ActionFormData()
    form.title('暗影大典')
        .body('基础头盔\n§3【军团】稀有头盔\n\n§r基础盔甲\n§3【军团】稀有盔甲\n\n§r银色暴风剑\n§3【军团】稀有双手剑\n\n§r十字飞刀\n§3【军团】稀有飞刀\n\n§r收集奖励:铜币 64 宝石 10 暗影能量 10')
        .button('领取奖励')
    form.show(player).then(t => {
        if (t.canceled) {
            equipment_sets(player)
        }
        if (t.selection == 0 && hasInventoryItem(player, 'sf:bedrock_helm') && hasInventoryItem(player, 'sf:bedrock_armor') && hasInventoryItem(player, 'sf:silver_squall') && hasInventoryItem(player, 'sf:iron_crosses') && !player.hasTag('collect_legion_rare_B')) {
            player.runCommand('give @s sf:copper_coin 64')
            player.runCommand('scoreboard players add @s gem 10')
            player.runCommand('give @s sf:shadow_energy 10')
            player.addTag('collect_legion_rare_B')
            player.sendMessage('§a你已成功领取军团-稀有-B套装的奖励')
        }
        if (t.selection == 0 && player.hasTag('collect_legion_rare_B')) {
            player.sendMessage('§a你已领取过该套装的奖励')
        }
    })
}
function legion_epic_A(player) {
    let form = new ActionFormData()
    form.title('暗影大典')
        .body('沼泽护盔\n§6【军团】史诗头盔\n\n§r沼泽迷彩服\n§6【军团】史诗盔甲\n\n§r沼泽狼牙棒\n§6【军团】史诗狼牙棒\n\n§r沼泽飞斧\n§6【军团】史诗飞斧§r\n（未加入模组）\n\n§r收集奖励:铜币 128 宝石 20 暗影能量 20')
        .button('领取奖励')
    form.show(player).then(t => {
        if (t.canceled) {
            equipment_sets(player)
        }
        if (t.selection == 0 && hasInventoryItem(player, 'sf:swampers_headgear') && hasInventoryItem(player, 'sf:swampers_camouflage') && hasInventoryItem(player, 'sf:swampers_grinders') && !player.hasTag('collect_legion_epic_A')) {
            player.runCommand('give @s sf:copper_coin 128')
            player.runCommand('scoreboard players add @s gem 20')
            player.runCommand('give @s sf:shadow_energy 20')
            player.addTag('collect_legion_epic_A')
            player.sendMessage('§a你已成功领取军团-史诗-A套装的奖励')
        }
        if (t.selection == 0 && player.hasTag('collect_legion_epic_A')) {
            player.sendMessage('§a你已领取过该套装的奖励')
        }
    })
}
function legion_legendary_abdicator(player) {
    let form = new ActionFormData()
    form.title('暗影大典')
        .body('精致头盔\n§e【军团】传奇头盔\n\n§f天谴之铠\n§e【军团】传奇盔甲\n\n§f裁决之剑\n§e【军团】传奇双手剑\n\n§f宽恕手枪\n§e【军团】传奇手枪\n§r（未加入模组）§f\n\n收集奖励:铜币 192 宝石 30 暗影能量 30\n\n套装效果：光明之力使你获得进攻与防御性技能，并在你受到致命伤害时保护你')
        .button('领取奖励')
    form.show(player).then(t => {
        if (t.canceled) {
            equipment_sets(player)
        }
        if (t.selection == 0 && hasInventoryItem(player, 'sf:higher_calling') && hasInventoryItem(player, 'sf:divine_retribution') && hasInventoryItem(player, 'sf:arbitrator') && !player.hasTag('collect_legion_legendary_abdicator')) {
            player.runCommand('give @s sf:copper_coin 192')
            player.runCommand('scoreboard players add @s gem 30')
            player.runCommand('give @s sf:shadow_energy 30')
            player.addTag('collect_legion_legendary_abdicator')
            player.sendMessage('§a你已成功领取军团-传奇-退位者套装的奖励')
        }
        if (t.selection == 0 && player.hasTag('collect_legion_legendary_abdicator')) {
            player.sendMessage('§a你已领取过该套装的奖励')
        }
    })
}
function dynasty_common_A(player) {
    let form = new ActionFormData()
    form.title('暗影大典')
        .body('海马环罩帽\n§7【王朝】普通头盔\n\n§r刺绣长袍\n§7【王朝】普通盔甲\n\n双弯刀\n§7【王朝】普通佩刀\n\n§r新手飞匕\n§7【王朝】普通飞匕\n（未加入模组）\n\n§r收集奖励:铜币 32 宝石 5 暗影能量 5')
        .button('领取奖励')
    form.show(player).then(t => {
        if (t.canceled) {
            equipment_sets(player)
        }
        if (t.selection == 0 && hasInventoryItem(player, 'sf:seahorse_veil') && hasInventoryItem(player, 'sf:embroidered_suit') && hasInventoryItem(player, 'sf:double_scimitars') && !player.hasTag('collect_dynasty_common_A')) {
            player.runCommand('give @s sf:copper_coin 32')
            player.runCommand('scoreboard players add @s gem 5')
            player.runCommand('give @s sf:shadow_energy 5')
            player.addTag('collect_dynasty_common_A')
            player.sendMessage('§a你已成功领取王朝-普通-A套装的奖励')
        }
        if (t.selection == 0 && player.hasTag('collect_dynasty_common_A')) {
            player.sendMessage('§a你已领取过该套装的奖励')
        }
    })
}
function characters(player) {
    let form = new ActionFormData()
    form.title('暗影大典')
        .body('冒险者，欢迎来到暗影世界！以下展示了目前出场的所有人物')
        .button('马库斯', 'textures/items/markus_head')
        .button('琼', 'textures/items/june_head')
        .button('伊图', 'textures/items/itu_head')
        .button('萨奇（中士）', 'textures/items/sarge_head')
        .button('奇士摩', 'textures/items/gizmo_head')
        .button('伽林', 'textures/items/galen_head')
        .button('项楚', 'textures/items/xiangtzu2_head')
    form.show(player).then(t => {
        if (t.canceled) {
            book(player)
        }
        switch (t.selection) {
            case 0:
                marcus(player)
                break
            case 1:
                june(player)
                break
            case 2:
                itu(player)
                break
            case 3:
                sarge(player)
                break
            case 4:
                gizmo(player)
                break
            case 5:
                galen(player)
                break
            case 6:
                xiangtzu(player)
                break
        }
    })
}
function marcus(player) {
    let form = new ActionFormData()
    form.title('暗影大典')
        .body('“我听到我内心深处的暗影凝结，全都是懦弱的胡言乱语。 它很强大，但我不需要它的力量。”马库斯表达了他对暗影头脑的想法\n马库斯很久以前是军团要塞的将军，后来神秘失踪了。 异常村庄是马库斯的家乡，他的父亲在感染天灾后被清算者杀害。根据支线得知，马库斯已经结婚了\n（来自暗影格斗3Wiki）')
        .button('我已知晓')
    form.show(player).then(t => {
        if (t.canceled) {
            characters(player)
        }
    })
}
function june(player) {
    let form = new ActionFormData()
    form.title('暗影大典')
        .body('“我将球体视为我的人民的希望。但现在我发现暗影是一种威胁。我们必须摧毁它。”琼表达了她对暗影头脑的看法。\n琼是君主的女儿，她出生于王朝都城。琼从小就证明自己是一个热心肠的人。她考虑老百姓的利益，了解老百姓的需求。伽林看到了琼的潜力并决定教她。琼是第二个以日历中的月份命名的女性暗影格斗角色，第一个是《暗影格斗2》和《暗影格斗3》中的梅，第三个是《暗影格斗4》中的阿普利尔。事实证明，琼一开始在使用暗影技能方面缺乏经验，以至于她会不小心对自己造成暗影伤害。经过伊图的训练，她已经完善了对暗影形态的控制。\n（来自暗影格斗3Wiki）')
        .button('我已知晓')
    form.show(player).then(t => {
        if (t.canceled) {
            characters(player)
        }
    })
}
function itu(player) {
    let form = new ActionFormData()
    form.title('暗影大典')
        .body('“我想将我的一生奉献给球体研究，但代价太高了！即使我的先锋兄弟有不同的想法。”伊图表达了他对暗影头脑的看法。\n伊图被虚空之室称为圆顶救赎者。他陪伴玩家完成任务，利用他在暗影能量方面的知识在冒险过程中帮助他的盟友。伊图可以变得隐形，正如他在游戏中所演示的那样。他声称自己可以做到这一点，因为他是一名先锋兵，尽管尚不清楚其他先锋兵是否也能实现这一壮举。\n（来自暗影格斗3Wiki）')
        .button('我已知晓')
    form.show(player).then(t => {
        if (t.canceled) {
            characters(player)
        }
    })
}
function sarge(player) {
    let form = new ActionFormData()
    form.title('暗影大典')
        .body('“乳臭未干的小子！你本来可以光荣地死在我手里。但你仍然会被送上军事法庭。你一无所获！”萨奇（中士）对玩家的背叛表示愤怒。\n奥托·海姆是中士的真名，但人们习惯叫他中士。中士实际上是一个古老的北方氏族的继承人，但后来与他们发生了争吵并去军团服役。他是伽刚的孙子，伽刚是一位伟大的北方英雄，出现在许多军团民间故事中。他是斯文的兄弟，北方的贵族。这也解释了为什么他们有类似的特殊能力：守旧派。\n（来自暗影格斗3Wiki）')
        .button('我已知晓')
    form.show(player).then(t => {
        if (t.canceled) {
            characters(player)
        }
    })
}
function gizmo(player) {
    let form = new ActionFormData()
    form.title('暗影大典')
        .body('“你总是比我强，这真的让我很生气。”奇士摩表达了他对玩家的仇恨。\n格雷戈尔·奇士摩·韦斯瓦尔德 是一名喜欢徒手格斗的军团士兵。他最终对曾经是他搭档的玩家产生了嫉妒，因为他/她总是比他更好。奇士摩有一个继姐，名叫格蕾塔。她和奇士摩都属于韦斯瓦尔德氏族。\n（来自暗影格斗3Wiki）')
        .button('我已知晓')
    form.show(player).then(t => {
        if (t.canceled) {
            characters(player)
        }
    })
}
function galen(player) {
    let form = new ActionFormData()
    form.title('暗影大典')
        .body('“追求真理需要坚强的精神。现在你明白为什么军团拒绝暗影能量了。”伽林向伊图提出建议。\n伽林在王朝首都拥有一所武馆，是王朝君主的朋友。伽林是第二支箭，就像皇帝一样，他不惜一切代价寻求保护球体的安全。伽林在塑造王朝目前的暗影能量方法方面也发挥了巨大作用。伽林的学院名叫灰龙。他曾说过，当他年轻的时候，竹堡只是一片森林。它没有像现在这样的墙壁。伽林有一个儿子，名叫塔兰。他是一位从未建立过王朝的游牧民族的草原王子。\n（来自暗影格斗3Wiki）')
        .button('我已知晓')
    form.show(player).then(t => {
        if (t.canceled) {
            characters(player)
        }
    })
}
function xiangtzu(player) {
    let form = new ActionFormData()
    form.title('暗影大典')
        .body('“这还没有结束！我会研究世界上所有的风格，找到一个你无法战胜的！”百校争霸赛落败后的项楚表达了对玩家的挑衅\n项楚，也被称为赞德。他之所以被称为不朽的赞德，是因为军团士兵无法正确发音他的名字。\n（来自暗影格斗3Wiki）')
        .button('我已知晓')
    form.show(player).then(t => {
        if (t.canceled) {
            characters(player)
        }
    })
}
function currency(player) {
    let form = new ActionFormData()
    form.title('暗影大典')
        .body('冒险者，欢迎来到暗影世界！以下展示了所有货币')
        .button('铜币', 'textures/items/copper_coin')
        .button('宝石', 'textures/gems')
        .button('暗影能量', 'textures/items/shadow_energy')
    form.show(player).then(t => {
        if (t.canceled) {
            book(player)
        }
    })
}