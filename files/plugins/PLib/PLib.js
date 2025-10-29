// LiteLoader-AIDS automatic generated
/// <reference path="e:\llse/dts/llaids/src/index.d.ts"/> 

const versions = "v1.1.2";
const regvers = [1, 1, 2];
const fixvers = "";
const author = "Planet工作室-星辰开发组-苏苏";
const info = "§l§e[PLib] §r";
const url = "http://update.mcmap.top/?name=PLib";

const config_data = new JsonConfigFile(`./plugins/Planet/PLibrary/config.json`, JSON.stringify({}));
const bind_data = new JsonConfigFile("./plugins/Planet/PLibrary/data/bind.json", JSON.stringify([]))
const lizi_data = new JsonConfigFile("./plugins/Planet/PLibrary/data/lizi.json", JSON.stringify([]))
const item_data = new JsonConfigFile("./plugins/Planet/PLibrary/data/item.json", JSON.stringify([]))

const new_player_db = new KVDatabase(`./plugins/Planet/PLibrary/NewPlayer`);

const buff_obj = [
    {
        "names": "伤害吸收",
        "name": "absorption",
        "number_id": 22,
        "path": "textures/ui/absorption_effect"
    },
    {
        "names": "不祥之兆",
        "name": "bad_omen",
        "number_id": 28,
        "path": "textures/ui/bad_omen_effect"
    },
    {
        "names": "失明",
        "name": "blindness",
        "number_id": 15,
        "path": "textures/ui/blindness_effect"
    },
    {
        "names": "潮涌能量",
        "name": "conduit_power",
        "number_id": 26,
        "path": "textures/ui/conduit_power_effect"
    },
    {
        "names": "剧毒",
        "name": "fatal_poison",
        "number_id": 25,
        "path": "textures/ui/fatal_poison_effect"
    },
    {
        "names": "防火",
        "name": "fire_resistance",
        "number_id": 12,
        "path": "textures/ui/fire_resistance_effect"
    },
    {
        "names": "急迫",
        "name": "haste",
        "number_id": 3,
        "path": "textures/ui/haste_effect"
    },
    {
        "names": "生命提升",
        "name": "health_boost",
        "number_id": 21,
        "path": "textures/ui/health_boost_effect"
    },
    {
        "names": "饥饿",
        "name": "hunger",
        "number_id": 17,
        "path": ""
    },
    {
        "names": "瞬间伤害",
        "name": "instant_damage",
        "number_id": 7,
        "path": ""
    },
    {
        "names": "瞬间治疗",
        "name": "instant_health",
        "number_id": 6,
        "path": ""
    },
    {
        "names": "隐身",
        "name": "invisibility",
        "number_id": 14,
        "path": ""
    },
    {
        "names": "跳跃提升",
        "name": "jump_boost",
        "number_id": 8,
        "path": ""
    },
    {
        "names": "漂浮",
        "name": "levitation",
        "number_id": 24,
        "path": ""
    },
    {
        "names": "挖掘疲劳",
        "name": "mining_fatigue",
        "number_id": 4,
        "path": ""
    },
    {
        "names": "反胃",
        "name": "nausea",
        "number_id": 9,
        "path": ""
    },
    {
        "names": "夜视",
        "name": "night_vision",
        "number_id": 16,
        "path": ""
    },
    {
        "names": "中毒",
        "name": "poison",
        "number_id": 19,
        "path": ""
    },
    {
        "names": "生命恢复",
        "name": "regeneration",
        "number_id": 10,
        "path": ""
    },
    {
        "names": "抗性提升",
        "name": "resistance",
        "number_id": 11,
        "path": ""
    },
    {
        "names": "饱和",
        "name": "saturation",
        "number_id": 23,
        "path": ""
    },
    {
        "names": "缓降",
        "name": "slow_falling",
        "number_id": 27,
        "path": ""
    },
    {
        "names": "缓慢",
        "name": "slowness",
        "number_id": 2,
        "path": ""
    },
    {
        "names": "速度",
        "name": "speed",
        "number_id": 1,
        "path": ""
    },
    {
        "names": "力量",
        "name": "strength",
        "number_id": 5,
        "path": ""
    },
    {
        "names": "村庄英雄",
        "name": "village_hero",
        "number_id": 29,
        "path": ""
    },
    {
        "names": "水下呼吸",
        "name": "water_breathing",
        "number_id": 13,
        "path": ""
    },
    {
        "names": "虚弱",
        "name": "weakness",
        "number_id": 18,
        "path": ""
    },
    {
        "names": "凋零",
        "name": "wither",
        "number_id": 20,
        "path": ""
    }
];
const lizi_obj = [
    {
        "names": "黑烟",
        "name": "basic_smoke_particle",
        "type": "minecraft:basic_smoke_particle"
    },
    {
        "names": "模糊的白烟",
        "name": "camera_shoot_explosion",
        "type": "minecraft:camera_shoot_explosion"
    },
    {
        "names": "爆炸式白烟",
        "name": "knockback_roar_particle",
        "type": "minecraft:knockback_roar_particle"
    },
    {
        "names": "爱心",
        "name": "heart_particle",
        "type": "minecraft:heart_particle"
    },
    {
        "names": "红色弓箭拖尾",
        "name": "rising_border_dust_particle",
        "type": "minecraft:rising_border_dust_particle"
    }
];
const item_obj = [
    {
        "names": "金合欢木船",
        "name": "acacia_boat",
        "type": "minecraft:acacia_boat",
        "path": "textures/items/boat_oak.png"
    },
    {
        "names": "金合欢木按钮",
        "name": "acacia_button",
        "type": "minecraft:acacia_button",
        "path": ""
    },
    {
        "names": "金合欢木门",
        "name": "acacia_door",
        "type": "minecraft:acacia_door",
        "path": "textures/items/door_wood.png"
    },
    {
        "names": "金合欢木栅栏门",
        "name": "acacia_fence_gate",
        "type": "minecraft:acacia_fence_gate",
        "path": ""
    },
    {
        "names": "金合欢木压力板",
        "name": "acacia_pressure_plate",
        "type": "minecraft:acacia_pressure_plate",
        "path": ""
    },
    {
        "names": "金合欢木告示牌",
        "name": "acacia_sign",
        "type": "minecraft:acacia_sign",
        "path": "textures/items/sign.png"
    },
    {
        "names": "金合欢木楼梯",
        "name": "acacia_stairs",
        "type": "minecraft:acacia_stairs",
        "path": ""
    },
    {
        "names": "金合欢木活板门",
        "name": "acacia_trapdoor",
        "type": "minecraft:acacia_trapdoor",
        "path": ""
    },
    {
        "names": "激活铁轨",
        "name": "activator_rail",
        "type": "minecraft:activator_rail",
        "path": ""
    },
    {
        "names": "空气",
        "name": "air",
        "type": "minecraft:air",
        "path": ""
    },
    {
        "names": "允许方块",
        "name": "allow",
        "type": "minecraft:allow",
        "path": ""
    },
    {
        "names": "紫水晶块",
        "name": "amethyst_block",
        "type": "minecraft:amethyst_block",
        "path": ""
    },
    {
        "names": "紫水晶簇",
        "name": "amethyst_cluster",
        "type": "minecraft:amethyst_cluster",
        "path": ""
    },
    {
        "names": "紫水晶碎片",
        "name": "amethyst_shard",
        "type": "minecraft:amethyst_shard",
        "path": "textures/items/amethyst_shard.png"
    },
    {
        "names": "远古残骸",
        "name": "ancient_debris",
        "type": "minecraft:ancient_debris",
        "path": ""
    },
    {
        "names": "安山岩楼梯",
        "name": "andesite_stairs",
        "type": "minecraft:andesite_stairs",
        "path": ""
    },
    {
        "names": "铁砧",
        "name": "anvil",
        "type": "minecraft:anvil",
        "path": ""
    },
    {
        "names": "苹果",
        "name": "apple",
        "type": "minecraft:apple",
        "path": "textures/items/apple.png"
    },
    {
        "names": "盔甲架",
        "name": "armor_stand",
        "type": "minecraft:armor_stand",
        "path": "textures/items/armor_stand.png"
    },
    {
        "names": "箭",
        "name": "arrow",
        "type": "minecraft:arrow",
        "path": "textures/items/arrow.png"
    },
    {
        "names": "美西螈桶",
        "name": "axolotl_bucket",
        "type": "minecraft:axolotl_bucket",
        "path": "textures/items/bucket_axolotl.png"
    },
    {
        "names": "美西螈刷怪蛋",
        "name": "axolotl_spawn_egg",
        "type": "minecraft:axolotl_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "杜鹃花丛",
        "name": "azalea",
        "type": "minecraft:azalea",
        "path": ""
    },
    {
        "names": "杜鹃树叶",
        "name": "azalea_leaves",
        "type": "minecraft:azalea_leaves",
        "path": ""
    },
    {
        "names": "盛开的杜鹃树叶",
        "name": "azalea_leaves_flowered",
        "type": "minecraft:azalea_leaves_flowered",
        "path": ""
    },
    {
        "names": "烤马铃薯",
        "name": "baked_potato",
        "type": "minecraft:baked_potato",
        "path": "textures/items/potato_baked.png"
    },
    {
        "names": "竹子",
        "name": "bamboo",
        "type": "minecraft:bamboo",
        "path": "textures/items/bamboo.png"
    },
    {
        "names": "旗帜",
        "name": "banner",
        "type": "minecraft:banner",
        "path": ""
    },
    {
        "names": "木桶",
        "name": "barrel",
        "type": "minecraft:barrel",
        "path": ""
    },
    {
        "names": "屏障",
        "name": "barrier",
        "type": "minecraft:barrier",
        "path": ""
    },
    {
        "names": "玄武岩",
        "name": "basalt",
        "type": "minecraft:basalt",
        "path": ""
    },
    {
        "names": "蝙蝠刷怪蛋",
        "name": "bat_spawn_egg",
        "type": "minecraft:bat_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "信标",
        "name": "beacon",
        "type": "minecraft:beacon",
        "path": ""
    },
    {
        "names": "床",
        "name": "bed",
        "type": "minecraft:bed",
        "path": "textures/items/bed_red.png"
    },
    {
        "names": "基岩",
        "name": "bedrock",
        "type": "minecraft:bedrock",
        "path": ""
    },
    {
        "names": "蜂巢",
        "name": "bee_nest",
        "type": "minecraft:bee_nest",
        "path": ""
    },
    {
        "names": "蜜蜂刷怪蛋",
        "name": "bee_spawn_egg",
        "type": "minecraft:bee_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "生牛肉",
        "name": "beef",
        "type": "minecraft:beef",
        "path": "textures/items/beef_raw.png"
    },
    {
        "names": "蜂箱",
        "name": "beehive",
        "type": "minecraft:beehive",
        "path": ""
    },
    {
        "names": "甜菜根",
        "name": "beetroot",
        "type": "minecraft:beetroot",
        "path": "textures/items/beetroot.png"
    },
    {
        "names": "甜菜种子",
        "name": "beetroot_seeds",
        "type": "minecraft:beetroot_seeds",
        "path": "textures/items/seeds_beetroot.png"
    },
    {
        "names": "甜菜汤",
        "name": "beetroot_soup",
        "type": "minecraft:beetroot_soup",
        "path": "textures/items/beetroot_soup.png"
    },
    {
        "names": "钟",
        "name": "bell",
        "type": "minecraft:bell",
        "path": "textures/items/villagebell.png"
    },
    {
        "names": "大型垂滴叶",
        "name": "big_dripleaf",
        "type": "minecraft:big_dripleaf",
        "path": ""
    },
    {
        "names": "白桦木船",
        "name": "birch_boat",
        "type": "minecraft:birch_boat",
        "path": "textures/items/boat_oak.png"
    },
    {
        "names": "白桦木按钮",
        "name": "birch_button",
        "type": "minecraft:birch_button",
        "path": ""
    },
    {
        "names": "白桦木门",
        "name": "birch_door",
        "type": "minecraft:birch_door",
        "path": "textures/items/door_wood.png"
    },
    {
        "names": "白桦木栅栏门",
        "name": "birch_fence_gate",
        "type": "minecraft:birch_fence_gate",
        "path": ""
    },
    {
        "names": "白桦木压力板",
        "name": "birch_pressure_plate",
        "type": "minecraft:birch_pressure_plate",
        "path": ""
    },
    {
        "names": "白桦木告示牌",
        "name": "birch_sign",
        "type": "minecraft:birch_sign",
        "path": "textures/items/sign.png"
    },
    {
        "names": "白桦木楼梯",
        "name": "birch_stairs",
        "type": "minecraft:birch_stairs",
        "path": ""
    },
    {
        "names": "白桦木活板门",
        "name": "birch_trapdoor",
        "type": "minecraft:birch_trapdoor",
        "path": ""
    },
    {
        "names": "黑色蜡烛",
        "name": "black_candle",
        "type": "minecraft:black_candle",
        "path": ""
    },
    {
        "names": "黑色染料",
        "name": "black_dye",
        "type": "minecraft:black_dye",
        "path": "textures/items/dye_powder_black_new.png"
    },
    {
        "names": "黑色带釉陶瓦",
        "name": "black_glazed_terracotta",
        "type": "minecraft:black_glazed_terracotta",
        "path": ""
    },
    {
        "names": "黑石",
        "name": "blackstone",
        "type": "minecraft:blackstone",
        "path": ""
    },
    {
        "names": "黑石台阶",
        "name": "blackstone_slab",
        "type": "minecraft:blackstone_slab",
        "path": ""
    },
    {
        "names": "黑石楼梯",
        "name": "blackstone_stairs",
        "type": "minecraft:blackstone_stairs",
        "path": ""
    },
    {
        "names": "黑石墙",
        "name": "blackstone_wall",
        "type": "minecraft:blackstone_wall",
        "path": ""
    },
    {
        "names": "高炉",
        "name": "blast_furnace",
        "type": "minecraft:blast_furnace",
        "path": ""
    },
    {
        "names": "烈焰粉",
        "name": "blaze_powder",
        "type": "minecraft:blaze_powder",
        "path": "textures/items/blaze_powder.png"
    },
    {
        "names": "烈焰棒",
        "name": "blaze_rod",
        "type": "minecraft:blaze_rod",
        "path": "textures/items/blaze_rod.png"
    },
    {
        "names": "烈焰人刷怪蛋",
        "name": "blaze_spawn_egg",
        "type": "minecraft:blaze_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "蓝色蜡烛",
        "name": "blue_candle",
        "type": "minecraft:blue_candle",
        "path": ""
    },
    {
        "names": "蓝色染料",
        "name": "blue_dye",
        "type": "minecraft:blue_dye",
        "path": "textures/items/dye_powder_blue_new.png"
    },
    {
        "names": "蓝色带釉陶瓦",
        "name": "blue_glazed_terracotta",
        "type": "minecraft:blue_glazed_terracotta",
        "path": ""
    },
    {
        "names": "蓝冰",
        "name": "blue_ice",
        "type": "minecraft:blue_ice",
        "path": ""
    },
    {
        "names": "骨头",
        "name": "bone",
        "type": "minecraft:bone",
        "path": "textures/items/bone.png"
    },
    {
        "names": "骨块",
        "name": "bone_block",
        "type": "minecraft:bone_block",
        "path": ""
    },
    {
        "names": "骨粉",
        "name": "bone_meal",
        "type": "minecraft:bone_meal",
        "path": "textures/items/dye_powder_white.png"
    },
    {
        "names": "书",
        "name": "book",
        "type": "minecraft:book",
        "path": "textures/items/book_normal.png"
    },
    {
        "names": "书架",
        "name": "bookshelf",
        "type": "minecraft:bookshelf",
        "path": ""
    },
    {
        "names": "边界",
        "name": "border_block",
        "type": "minecraft:border_block",
        "path": ""
    },
    {
        "names": "波纹边旗帜图案",
        "name": "bordure_indented_banner_pattern",
        "type": "minecraft:bordure_indented_banner_pattern",
        "path": "textures/items/banner_pattern.png"
    },
    {
        "names": "弓",
        "name": "bow",
        "type": "minecraft:bow",
        "path": "textures/items/bow_standby.png"
    },
    {
        "names": "碗",
        "name": "bowl",
        "type": "minecraft:bowl",
        "path": "textures/items/bowl.png"
    },
    {
        "names": "面包",
        "name": "bread",
        "type": "minecraft:bread",
        "path": "textures/items/bread.png"
    },
    {
        "names": "酿造台",
        "name": "brewing_stand",
        "type": "minecraft:brewing_stand",
        "path": "textures/items/brewing_stand.png"
    },
    {
        "names": "红砖",
        "name": "brick",
        "type": "minecraft:brick",
        "path": "textures/items/brick.png"
    },
    {
        "names": "砖块",
        "name": "brick_block",
        "type": "minecraft:brick_block",
        "path": ""
    },
    {
        "names": "砖楼梯",
        "name": "brick_stairs",
        "type": "minecraft:brick_stairs",
        "path": ""
    },
    {
        "names": "棕色蜡烛",
        "name": "brown_candle",
        "type": "minecraft:brown_candle",
        "path": ""
    },
    {
        "names": "棕色染料",
        "name": "brown_dye",
        "type": "minecraft:brown_dye",
        "path": "textures/items/dye_powder_brown_new.png"
    },
    {
        "names": "棕色带釉陶瓦",
        "name": "brown_glazed_terracotta",
        "type": "minecraft:brown_glazed_terracotta",
        "path": ""
    },
    {
        "names": "棕色蘑菇",
        "name": "brown_mushroom",
        "type": "minecraft:brown_mushroom",
        "path": ""
    },
    {
        "names": "棕色蘑菇方块",
        "name": "brown_mushroom_block",
        "type": "minecraft:brown_mushroom_block",
        "path": ""
    },
    {
        "names": "桶",
        "name": "bucket",
        "type": "minecraft:bucket",
        "path": "textures/items/bucket_empty.png"
    },
    {
        "names": "紫水晶母岩",
        "name": "budding_amethyst",
        "type": "minecraft:budding_amethyst",
        "path": ""
    },
    {
        "names": "仙人掌",
        "name": "cactus",
        "type": "minecraft:cactus",
        "path": ""
    },
    {
        "names": "蛋糕",
        "name": "cake",
        "type": "minecraft:cake",
        "path": "textures/items/cake.png"
    },
    {
        "names": "方解石",
        "name": "calcite",
        "type": "minecraft:calcite",
        "path": ""
    },
    {
        "names": "营火",
        "name": "campfire",
        "type": "minecraft:campfire",
        "path": "textures/items/campfire.png"
    },
    {
        "names": "蜡烛",
        "name": "candle",
        "type": "minecraft:candle",
        "path": ""
    },
    {
        "names": "地毯",
        "name": "carpet",
        "type": "minecraft:carpet",
        "path": ""
    },
    {
        "names": "胡萝卜",
        "name": "carrot",
        "type": "minecraft:carrot",
        "path": "textures/items/carrot.png"
    },
    {
        "names": "胡萝卜钓竿",
        "name": "carrot_on_a_stick",
        "type": "minecraft:carrot_on_a_stick",
        "path": "textures/items/carrot_on_a_stick.png"
    },
    {
        "names": "制图台",
        "name": "cartography_table",
        "type": "minecraft:cartography_table",
        "path": ""
    },
    {
        "names": "雕刻过的南瓜",
        "name": "carved_pumpkin",
        "type": "minecraft:carved_pumpkin",
        "path": ""
    },
    {
        "names": "猫刷怪蛋",
        "name": "cat_spawn_egg",
        "type": "minecraft:cat_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "炼药锅",
        "name": "cauldron",
        "type": "minecraft:cauldron",
        "path": "textures/items/cauldron.png"
    },
    {
        "names": "洞穴蜘蛛刷怪蛋",
        "name": "cave_spider_spawn_egg",
        "type": "minecraft:cave_spider_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "锁链",
        "name": "chain",
        "type": "minecraft:chain",
        "path": "textures/items/chain.png"
    },
    {
        "names": "连锁型命令方块",
        "name": "chain_command_block",
        "type": "minecraft:chain_command_block",
        "path": ""
    },
    {
        "names": "锁链靴子",
        "name": "chainmail_boots",
        "type": "minecraft:chainmail_boots",
        "path": "textures/items/chainmail_boots.png"
    },
    {
        "names": "锁链胸甲",
        "name": "chainmail_chestplate",
        "type": "minecraft:chainmail_chestplate",
        "path": "textures/items/chainmail_chestplate.png"
    },
    {
        "names": "锁链头盔",
        "name": "chainmail_helmet",
        "type": "minecraft:chainmail_helmet",
        "path": "textures/items/chainmail_helmet.png"
    },
    {
        "names": "锁链护腿",
        "name": "chainmail_leggings",
        "type": "minecraft:chainmail_leggings",
        "path": "textures/items/chainmail_leggings.png"
    },
    {
        "names": "木炭",
        "name": "charcoal",
        "type": "minecraft:charcoal",
        "path": "textures/items/charcoal.png"
    },
    {
        "names": "箱子",
        "name": "chest",
        "type": "minecraft:chest",
        "path": ""
    },
    {
        "names": "运输矿车",
        "name": "chest_minecart",
        "type": "minecraft:chest_minecart",
        "path": "textures/items/minecart_chest.png"
    },
    {
        "names": "鸡",
        "name": "chicken",
        "type": "minecraft:chicken",
        "path": "textures/items/chicken_raw.png"
    },
    {
        "names": "鸡刷怪蛋",
        "name": "chicken_spawn_egg",
        "type": "minecraft:chicken_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "錾制深板岩",
        "name": "chiseled_deepslate",
        "type": "minecraft:chiseled_deepslate",
        "path": ""
    },
    {
        "names": "錾制下界砖块",
        "name": "chiseled_nether_bricks",
        "type": "minecraft:chiseled_nether_bricks",
        "path": ""
    },
    {
        "names": "錾制磨制黑石",
        "name": "chiseled_polished_blackstone",
        "type": "minecraft:chiseled_polished_blackstone",
        "path": ""
    },
    {
        "names": "紫颂花",
        "name": "chorus_flower",
        "type": "minecraft:chorus_flower",
        "path": ""
    },
    {
        "names": "紫颂果",
        "name": "chorus_fruit",
        "type": "minecraft:chorus_fruit",
        "path": "textures/items/chorus_fruit.png"
    },
    {
        "names": "紫颂植株",
        "name": "chorus_plant",
        "type": "minecraft:chorus_plant",
        "path": ""
    },
    {
        "names": "黏土块",
        "name": "clay",
        "type": "minecraft:clay",
        "path": ""
    },
    {
        "names": "黏土球",
        "name": "clay_ball",
        "type": "minecraft:clay_ball",
        "path": "textures/items/clay_ball.png"
    },
    {
        "names": "时钟",
        "name": "clock",
        "type": "minecraft:clock",
        "path": "textures/items/clock_item.png"
    },
    {
        "names": "煤炭",
        "name": "coal",
        "type": "minecraft:coal",
        "path": "textures/items/coal.png"
    },
    {
        "names": "煤炭块",
        "name": "coal_block",
        "type": "minecraft:coal_block",
        "path": ""
    },
    {
        "names": "煤矿石",
        "name": "coal_ore",
        "type": "minecraft:coal_ore",
        "path": ""
    },
    {
        "names": "深板岩圆石",
        "name": "cobbled_deepslate",
        "type": "minecraft:cobbled_deepslate",
        "path": ""
    },
    {
        "names": "深板岩圆石台阶",
        "name": "cobbled_deepslate_slab",
        "type": "minecraft:cobbled_deepslate_slab",
        "path": ""
    },
    {
        "names": "深板岩圆石楼梯",
        "name": "cobbled_deepslate_stairs",
        "type": "minecraft:cobbled_deepslate_stairs",
        "path": ""
    },
    {
        "names": "深板岩圆石墙",
        "name": "cobbled_deepslate_wall",
        "type": "minecraft:cobbled_deepslate_wall",
        "path": ""
    },
    {
        "names": "圆石",
        "name": "cobblestone",
        "type": "minecraft:cobblestone",
        "path": ""
    },
    {
        "names": "圆石墙/苔石墙/花岗岩墙/闪长岩墙/安山岩墙/砂岩墙/砖块墙/石砖墙/苔石砖墙/末地石砖墙/下界砖墙/海晶石墙/红砂岩墙/红色下界砖墙",
        "name": "cobblestone_wall",
        "type": "minecraft:cobblestone_wall",
        "path": ""
    },
    {
        "names": "可可豆",
        "name": "cocoa_beans",
        "type": "minecraft:cocoa_beans",
        "path": "textures/items/dye_powder_brown.png"
    },
    {
        "names": "鳕鱼",
        "name": "cod",
        "type": "minecraft:cod",
        "path": "textures/items/fish_raw.png"
    },
    {
        "names": "鳕鱼桶",
        "name": "cod_bucket",
        "type": "minecraft:cod_bucket",
        "path": "textures/items/bucket_cod.png"
    },
    {
        "names": "鳕鱼刷怪蛋",
        "name": "cod_spawn_egg",
        "type": "minecraft:cod_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "命令方块",
        "name": "command_block",
        "type": "minecraft:command_block",
        "path": ""
    },
    {
        "names": "命令方块矿车",
        "name": "command_block_minecart",
        "type": "minecraft:command_block_minecart",
        "path": "textures/items/minecart_command_block.png"
    },
    {
        "names": "红石比较器",
        "name": "comparator",
        "type": "minecraft:comparator",
        "path": "textures/items/comparator.png"
    },
    {
        "names": "指南针",
        "name": "compass",
        "type": "minecraft:compass",
        "path": "textures/items/compass_item.png"
    },
    {
        "names": "堆肥桶",
        "name": "composter",
        "type": "minecraft:composter",
        "path": ""
    },
    {
        "names": "混凝土",
        "name": "concrete",
        "type": "minecraft:concrete",
        "path": ""
    },
    {
        "names": "混凝土粉末",
        "name": "concrete_powder",
        "type": "minecraft:concrete_powder",
        "path": ""
    },
    {
        "names": "潮涌核心",
        "name": "conduit",
        "type": "minecraft:conduit",
        "path": ""
    },
    {
        "names": "牛排",
        "name": "cooked_beef",
        "type": "minecraft:cooked_beef",
        "path": "textures/items/beef_cooked.png"
    },
    {
        "names": "熟鸡肉",
        "name": "cooked_chicken",
        "type": "minecraft:cooked_chicken",
        "path": "textures/items/chicken_cooked.png"
    },
    {
        "names": "熟鳕鱼",
        "name": "cooked_cod",
        "type": "minecraft:cooked_cod",
        "path": "textures/items/fish_cooked.png"
    },
    {
        "names": "熟羊肉",
        "name": "cooked_mutton",
        "type": "minecraft:cooked_mutton",
        "path": "textures/items/mutton_cooked.png"
    },
    {
        "names": "熟猪排",
        "name": "cooked_porkchop",
        "type": "minecraft:cooked_porkchop",
        "path": "textures/items/porkchop_cooked.png"
    },
    {
        "names": "熟兔肉",
        "name": "cooked_rabbit",
        "type": "minecraft:cooked_rabbit",
        "path": "textures/items/rabbit_cooked.png"
    },
    {
        "names": "熟鲑鱼",
        "name": "cooked_salmon",
        "type": "minecraft:cooked_salmon",
        "path": "textures/items/fish_salmon_cooked.png"
    },
    {
        "names": "曲奇",
        "name": "cookie",
        "type": "minecraft:cookie",
        "path": "textures/items/cookie.png"
    },
    {
        "names": "铜块",
        "name": "copper_block",
        "type": "minecraft:copper_block",
        "path": ""
    },
    {
        "names": "铜锭",
        "name": "copper_ingot",
        "type": "minecraft:copper_ingot",
        "path": "textures/items/copper_ingot.png"
    },
    {
        "names": "铜矿石",
        "name": "copper_ore",
        "type": "minecraft:copper_ore",
        "path": ""
    },
    {
        "names": "珊瑚",
        "name": "coral",
        "type": "minecraft:coral",
        "path": ""
    },
    {
        "names": "珊瑚块",
        "name": "coral_block",
        "type": "minecraft:coral_block",
        "path": ""
    },
    {
        "names": "珊瑚扇",
        "name": "coral_fan",
        "type": "minecraft:coral_fan",
        "path": ""
    },
    {
        "names": "失活的珊瑚扇",
        "name": "coral_fan_dead",
        "type": "minecraft:coral_fan_dead",
        "path": ""
    },
    {
        "names": "牛刷怪蛋",
        "name": "cow_spawn_egg",
        "type": "minecraft:cow_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "裂纹深板岩砖",
        "name": "cracked_deepslate_bricks",
        "type": "minecraft:cracked_deepslate_bricks",
        "path": ""
    },
    {
        "names": "裂纹深板岩瓦",
        "name": "cracked_deepslate_tiles",
        "type": "minecraft:cracked_deepslate_tiles",
        "path": ""
    },
    {
        "names": "裂纹下界砖块",
        "name": "cracked_nether_bricks",
        "type": "minecraft:cracked_nether_bricks",
        "path": ""
    },
    {
        "names": "裂纹磨制黑石砖",
        "name": "cracked_polished_blackstone_bricks",
        "type": "minecraft:cracked_polished_blackstone_bricks",
        "path": ""
    },
    {
        "names": "工作台",
        "name": "crafting_table",
        "type": "minecraft:crafting_table",
        "path": ""
    },
    {
        "names": "苦力怕盾徽旗帜图案",
        "name": "creeper_banner_pattern",
        "type": "minecraft:creeper_banner_pattern",
        "path": "textures/items/banner_pattern.png"
    },
    {
        "names": "苦力怕刷怪蛋",
        "name": "creeper_spawn_egg",
        "type": "minecraft:creeper_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "绯红木按钮",
        "name": "crimson_button",
        "type": "minecraft:crimson_button",
        "path": ""
    },
    {
        "names": "绯红木门",
        "name": "crimson_door",
        "type": "minecraft:crimson_door",
        "path": "textures/items/door_wood.png"
    },
    {
        "names": "绯红木栅栏",
        "name": "crimson_fence",
        "type": "minecraft:crimson_fence",
        "path": ""
    },
    {
        "names": "绯红木栅栏门",
        "name": "crimson_fence_gate",
        "type": "minecraft:crimson_fence_gate",
        "path": ""
    },
    {
        "names": "绯红菌",
        "name": "crimson_fungus",
        "type": "minecraft:crimson_fungus",
        "path": ""
    },
    {
        "names": "绯红菌核",
        "name": "crimson_hyphae",
        "type": "minecraft:crimson_hyphae",
        "path": ""
    },
    {
        "names": "绯红菌岩",
        "name": "crimson_nylium",
        "type": "minecraft:crimson_nylium",
        "path": ""
    },
    {
        "names": "绯红木板",
        "name": "crimson_planks",
        "type": "minecraft:crimson_planks",
        "path": ""
    },
    {
        "names": "绯红木压力板",
        "name": "crimson_pressure_plate",
        "type": "minecraft:crimson_pressure_plate",
        "path": ""
    },
    {
        "names": "绯红菌索",
        "name": "crimson_roots",
        "type": "minecraft:crimson_roots",
        "path": ""
    },
    {
        "names": "绯红木告示牌",
        "name": "crimson_sign",
        "type": "minecraft:crimson_sign",
        "path": "textures/items/sign.png"
    },
    {
        "names": "绯红木台阶",
        "name": "crimson_slab",
        "type": "minecraft:crimson_slab",
        "path": ""
    },
    {
        "names": "绯红木楼梯",
        "name": "crimson_stairs",
        "type": "minecraft:crimson_stairs",
        "path": ""
    },
    {
        "names": "绯红菌柄",
        "name": "crimson_stem",
        "type": "minecraft:crimson_stem",
        "path": ""
    },
    {
        "names": "绯红木活板门",
        "name": "crimson_trapdoor",
        "type": "minecraft:crimson_trapdoor",
        "path": ""
    },
    {
        "names": "弩",
        "name": "crossbow",
        "type": "minecraft:crossbow",
        "path": "textures/items/crossbow_standby.png"
    },
    {
        "names": "哭泣的黑曜石",
        "name": "crying_obsidian",
        "type": "minecraft:crying_obsidian",
        "path": ""
    },
    {
        "names": "切制铜块",
        "name": "cut_copper",
        "type": "minecraft:cut_copper",
        "path": ""
    },
    {
        "names": "切制铜台阶",
        "name": "cut_copper_slab",
        "type": "minecraft:cut_copper_slab",
        "path": ""
    },
    {
        "names": "切制铜楼梯",
        "name": "cut_copper_stairs",
        "type": "minecraft:cut_copper_stairs",
        "path": ""
    },
    {
        "names": "青色蜡烛",
        "name": "cyan_candle",
        "type": "minecraft:cyan_candle",
        "path": ""
    },
    {
        "names": "青色染料",
        "name": "cyan_dye",
        "type": "minecraft:cyan_dye",
        "path": "textures/items/dye_powder_cyan.png"
    },
    {
        "names": "青色带釉陶瓦",
        "name": "cyan_glazed_terracotta",
        "type": "minecraft:cyan_glazed_terracotta",
        "path": ""
    },
    {
        "names": "深色橡木船",
        "name": "dark_oak_boat",
        "type": "minecraft:dark_oak_boat",
        "path": "textures/items/boat_oak.png"
    },
    {
        "names": "深色橡木按钮",
        "name": "dark_oak_button",
        "type": "minecraft:dark_oak_button",
        "path": ""
    },
    {
        "names": "深色橡木门",
        "name": "dark_oak_door",
        "type": "minecraft:dark_oak_door",
        "path": "textures/items/door_wood.png"
    },
    {
        "names": "深色橡木栅栏门",
        "name": "dark_oak_fence_gate",
        "type": "minecraft:dark_oak_fence_gate",
        "path": ""
    },
    {
        "names": "深色橡木压力板",
        "name": "dark_oak_pressure_plate",
        "type": "minecraft:dark_oak_pressure_plate",
        "path": ""
    },
    {
        "names": "深色橡木告示牌",
        "name": "dark_oak_sign",
        "type": "minecraft:dark_oak_sign",
        "path": "textures/items/sign.png"
    },
    {
        "names": "深色橡木楼梯",
        "name": "dark_oak_stairs",
        "type": "minecraft:dark_oak_stairs",
        "path": ""
    },
    {
        "names": "深色橡木活板门",
        "name": "dark_oak_trapdoor",
        "type": "minecraft:dark_oak_trapdoor",
        "path": ""
    },
    {
        "names": "暗海晶石楼梯",
        "name": "dark_prismarine_stairs",
        "type": "minecraft:dark_prismarine_stairs",
        "path": ""
    },
    {
        "names": "阳光探测器",
        "name": "daylight_detector",
        "type": "minecraft:daylight_detector",
        "path": ""
    },
    {
        "names": "枯萎的灌木",
        "name": "deadbush",
        "type": "minecraft:deadbush",
        "path": ""
    },
    {
        "names": "深板岩",
        "name": "deepslate",
        "type": "minecraft:deepslate",
        "path": ""
    },
    {
        "names": "深板岩砖台阶",
        "name": "deepslate_brick_slab",
        "type": "minecraft:deepslate_brick_slab",
        "path": ""
    },
    {
        "names": "深板岩砖楼梯",
        "name": "deepslate_brick_stairs",
        "type": "minecraft:deepslate_brick_stairs",
        "path": ""
    },
    {
        "names": "深板岩砖墙",
        "name": "deepslate_brick_wall",
        "type": "minecraft:deepslate_brick_wall",
        "path": ""
    },
    {
        "names": "深板岩砖",
        "name": "deepslate_bricks",
        "type": "minecraft:deepslate_bricks",
        "path": ""
    },
    {
        "names": "深层煤矿石",
        "name": "deepslate_coal_ore",
        "type": "minecraft:deepslate_coal_ore",
        "path": ""
    },
    {
        "names": "深层铜矿石",
        "name": "deepslate_copper_ore",
        "type": "minecraft:deepslate_copper_ore",
        "path": ""
    },
    {
        "names": "深层钻石矿石",
        "name": "deepslate_diamond_ore",
        "type": "minecraft:deepslate_diamond_ore",
        "path": ""
    },
    {
        "names": "深层绿宝石矿石",
        "name": "deepslate_emerald_ore",
        "type": "minecraft:deepslate_emerald_ore",
        "path": ""
    },
    {
        "names": "深层金矿石",
        "name": "deepslate_gold_ore",
        "type": "minecraft:deepslate_gold_ore",
        "path": ""
    },
    {
        "names": "深层铁矿石",
        "name": "deepslate_iron_ore",
        "type": "minecraft:deepslate_iron_ore",
        "path": ""
    },
    {
        "names": "深层青金石矿石",
        "name": "deepslate_lapis_ore",
        "type": "minecraft:deepslate_lapis_ore",
        "path": ""
    },
    {
        "names": "深层红石矿石",
        "name": "deepslate_redstone_ore",
        "type": "minecraft:deepslate_redstone_ore",
        "path": ""
    },
    {
        "names": "深板岩瓦台阶",
        "name": "deepslate_tile_slab",
        "type": "minecraft:deepslate_tile_slab",
        "path": ""
    },
    {
        "names": "深板岩瓦楼梯",
        "name": "deepslate_tile_stairs",
        "type": "minecraft:deepslate_tile_stairs",
        "path": ""
    },
    {
        "names": "深板岩瓦墙",
        "name": "deepslate_tile_wall",
        "type": "minecraft:deepslate_tile_wall",
        "path": ""
    },
    {
        "names": "深板岩瓦",
        "name": "deepslate_tiles",
        "type": "minecraft:deepslate_tiles",
        "path": ""
    },
    {
        "names": "拒绝方块",
        "name": "deny",
        "type": "minecraft:deny",
        "path": ""
    },
    {
        "names": "探测铁轨",
        "name": "detector_rail",
        "type": "minecraft:detector_rail",
        "path": ""
    },
    {
        "names": "钻石",
        "name": "diamond",
        "type": "minecraft:diamond",
        "path": "textures/items/diamond.png"
    },
    {
        "names": "钻石斧",
        "name": "diamond_axe",
        "type": "minecraft:diamond_axe",
        "path": "textures/items/diamond_axe.png"
    },
    {
        "names": "钻石块",
        "name": "diamond_block",
        "type": "minecraft:diamond_block",
        "path": ""
    },
    {
        "names": "钻石靴子",
        "name": "diamond_boots",
        "type": "minecraft:diamond_boots",
        "path": "textures/items/diamond_boots.png"
    },
    {
        "names": "钻石胸甲",
        "name": "diamond_chestplate",
        "type": "minecraft:diamond_chestplate",
        "path": "textures/items/diamond_chestplate.png"
    },
    {
        "names": "钻石头盔",
        "name": "diamond_helmet",
        "type": "minecraft:diamond_helmet",
        "path": "textures/items/diamond_helmet.png"
    },
    {
        "names": "钻石锄",
        "name": "diamond_hoe",
        "type": "minecraft:diamond_hoe",
        "path": "textures/items/diamond_hoe.png"
    },
    {
        "names": "钻石马铠",
        "name": "diamond_horse_armor",
        "type": "minecraft:diamond_horse_armor",
        "path": "textures/items/diamond_horse_armor.png"
    },
    {
        "names": "钻石护腿",
        "name": "diamond_leggings",
        "type": "minecraft:diamond_leggings",
        "path": "textures/items/diamond_leggings.png"
    },
    {
        "names": "钻石矿石",
        "name": "diamond_ore",
        "type": "minecraft:diamond_ore",
        "path": ""
    },
    {
        "names": "钻石镐",
        "name": "diamond_pickaxe",
        "type": "minecraft:diamond_pickaxe",
        "path": "textures/items/diamond_pickaxe.png"
    },
    {
        "names": "钻石锹",
        "name": "diamond_shovel",
        "type": "minecraft:diamond_shovel",
        "path": "textures/items/diamond_shovel.png"
    },
    {
        "names": "钻石剑",
        "name": "diamond_sword",
        "type": "minecraft:diamond_sword",
        "path": "textures/items/diamond_sword.png"
    },
    {
        "names": "闪长岩楼梯",
        "name": "diorite_stairs",
        "type": "minecraft:diorite_stairs",
        "path": ""
    },
    {
        "names": "泥土/砂土",
        "name": "dirt",
        "type": "minecraft:dirt",
        "path": ""
    },
    {
        "names": "缠根泥土",
        "name": "dirt_with_roots",
        "type": "minecraft:dirt_with_roots",
        "path": ""
    },
    {
        "names": "发射器",
        "name": "dispenser",
        "type": "minecraft:dispenser",
        "path": ""
    },
    {
        "names": "海豚刷怪蛋",
        "name": "dolphin_spawn_egg",
        "type": "minecraft:dolphin_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "驴刷怪蛋",
        "name": "donkey_spawn_egg",
        "type": "minecraft:donkey_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "向日葵/丁香/高草丛/大型蕨/玫瑰丛/牡丹",
        "name": "double_plant",
        "type": "minecraft:double_plant",
        "path": ""
    },
    {
        "names": "龙息",
        "name": "dragon_breath",
        "type": "minecraft:dragon_breath",
        "path": "textures/items/dragons_breath.png"
    },
    {
        "names": "龙蛋",
        "name": "dragon_egg",
        "type": "minecraft:dragon_egg",
        "path": ""
    },
    {
        "names": "干海带",
        "name": "dried_kelp",
        "type": "minecraft:dried_kelp",
        "path": "textures/items/dried_kelp.png"
    },
    {
        "names": "干海带块",
        "name": "dried_kelp_block",
        "type": "minecraft:dried_kelp_block",
        "path": ""
    },
    {
        "names": "滴水石块",
        "name": "dripstone_block",
        "type": "minecraft:dripstone_block",
        "path": ""
    },
    {
        "names": "投掷器",
        "name": "dropper",
        "type": "minecraft:dropper",
        "path": ""
    },
    {
        "names": "溺尸刷怪蛋",
        "name": "drowned_spawn_egg",
        "type": "minecraft:drowned_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "鸡蛋",
        "name": "egg",
        "type": "minecraft:egg",
        "path": "textures/items/egg.png"
    },
    {
        "names": "远古守卫者刷怪蛋",
        "name": "elder_guardian_spawn_egg",
        "type": "minecraft:elder_guardian_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "鞘翅",
        "name": "elytra",
        "type": "minecraft:elytra",
        "path": "textures/items/elytra.png"
    },
    {
        "names": "绿宝石",
        "name": "emerald",
        "type": "minecraft:emerald",
        "path": "textures/items/emerald.png"
    },
    {
        "names": "绿宝石块",
        "name": "emerald_block",
        "type": "minecraft:emerald_block",
        "path": ""
    },
    {
        "names": "绿宝石矿石",
        "name": "emerald_ore",
        "type": "minecraft:emerald_ore",
        "path": ""
    },
    {
        "names": "空地图",
        "name": "empty_map",
        "type": "minecraft:empty_map",
        "path": "textures/items/map_empty.png"
    },
    {
        "names": "附魔书",
        "name": "enchanted_book",
        "type": "minecraft:enchanted_book",
        "path": "textures/items/book_enchanted.png"
    },
    {
        "names": "附魔金苹果",
        "name": "enchanted_golden_apple",
        "type": "minecraft:enchanted_golden_apple",
        "path": "textures/items/apple_golden.png"
    },
    {
        "names": "附魔台",
        "name": "enchanting_table",
        "type": "minecraft:enchanting_table",
        "path": ""
    },
    {
        "names": "末地石砖楼梯",
        "name": "end_brick_stairs",
        "type": "minecraft:end_brick_stairs",
        "path": ""
    },
    {
        "names": "末地石砖",
        "name": "end_bricks",
        "type": "minecraft:end_bricks",
        "path": ""
    },
    {
        "names": "末影水晶",
        "name": "end_crystal",
        "type": "minecraft:end_crystal",
        "path": "textures/items/end_crystal.png"
    },
    {
        "names": "末地传送门框架",
        "name": "end_portal_frame",
        "type": "minecraft:end_portal_frame",
        "path": ""
    },
    {
        "names": "末地烛",
        "name": "end_rod",
        "type": "minecraft:end_rod",
        "path": ""
    },
    {
        "names": "末地石",
        "name": "end_stone",
        "type": "minecraft:end_stone",
        "path": ""
    },
    {
        "names": "末影箱",
        "name": "ender_chest",
        "type": "minecraft:ender_chest",
        "path": ""
    },
    {
        "names": "末影之眼",
        "name": "ender_eye",
        "type": "minecraft:ender_eye",
        "path": "textures/items/ender_eye.png"
    },
    {
        "names": "末影珍珠",
        "name": "ender_pearl",
        "type": "minecraft:ender_pearl",
        "path": "textures/items/ender_pearl.png"
    },
    {
        "names": "末影人刷怪蛋",
        "name": "enderman_spawn_egg",
        "type": "minecraft:enderman_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "末影螨刷怪蛋",
        "name": "endermite_spawn_egg",
        "type": "minecraft:endermite_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "唤魔者刷怪蛋",
        "name": "evoker_spawn_egg",
        "type": "minecraft:evoker_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "附魔之瓶",
        "name": "experience_bottle",
        "type": "minecraft:experience_bottle",
        "path": "textures/items/experience_bottle.png"
    },
    {
        "names": "斑驳的铜块",
        "name": "exposed_copper",
        "type": "minecraft:exposed_copper",
        "path": ""
    },
    {
        "names": "斑驳的切制铜块",
        "name": "exposed_cut_copper",
        "type": "minecraft:exposed_cut_copper",
        "path": ""
    },
    {
        "names": "斑驳的切制铜台阶",
        "name": "exposed_cut_copper_slab",
        "type": "minecraft:exposed_cut_copper_slab",
        "path": ""
    },
    {
        "names": "斑驳的切制铜楼梯",
        "name": "exposed_cut_copper_stairs",
        "type": "minecraft:exposed_cut_copper_stairs",
        "path": ""
    },
    {
        "names": "耕地",
        "name": "farmland",
        "type": "minecraft:farmland",
        "path": ""
    },
    {
        "names": "羽毛",
        "name": "feather",
        "type": "minecraft:feather",
        "path": "textures/items/feather.png"
    },
    {
        "names": "橡木栅栏/云杉木栅栏/白桦木栅栏/丛林木栅栏/金合欢木栅栏/深色橡木栅栏",
        "name": "fence",
        "type": "minecraft:fence",
        "path": ""
    },
    {
        "names": "橡木栅栏门",
        "name": "fence_gate",
        "type": "minecraft:fence_gate",
        "path": ""
    },
    {
        "names": "发酵蛛眼",
        "name": "fermented_spider_eye",
        "type": "minecraft:fermented_spider_eye",
        "path": "textures/items/spider_eye_fermented.png"
    },
    {
        "names": "砖纹旗帜图案",
        "name": "field_masoned_banner_pattern",
        "type": "minecraft:field_masoned_banner_pattern",
        "path": "textures/items/banner_pattern.png"
    },
    {
        "names": "地图",
        "name": "filled_map",
        "type": "minecraft:filled_map",
        "path": "textures/items/map_filled.png"
    },
    {
        "names": "火焰弹",
        "name": "fire_charge",
        "type": "minecraft:fire_charge",
        "path": "textures/items/fireball.png"
    },
    {
        "names": "烟花火箭",
        "name": "firework_rocket",
        "type": "minecraft:firework_rocket",
        "path": "textures/items/fireworks.png"
    },
    {
        "names": "烟火之星",
        "name": "firework_star",
        "type": "minecraft:firework_star",
        "path": ""
    },
    {
        "names": "钓鱼竿",
        "name": "fishing_rod",
        "type": "minecraft:fishing_rod",
        "path": "textures/items/fishing_rod_uncast.png"
    },
    {
        "names": "制箭台",
        "name": "fletching_table",
        "type": "minecraft:fletching_table",
        "path": ""
    },
    {
        "names": "燧石",
        "name": "flint",
        "type": "minecraft:flint",
        "path": "textures/items/flint.png"
    },
    {
        "names": "打火石",
        "name": "flint_and_steel",
        "type": "minecraft:flint_and_steel",
        "path": "textures/items/flint_and_steel.png"
    },
    {
        "names": "花朵盾徽旗帜图案",
        "name": "flower_banner_pattern",
        "type": "minecraft:flower_banner_pattern",
        "path": "textures/items/banner_pattern.png"
    },
    {
        "names": "花盆",
        "name": "flower_pot",
        "type": "minecraft:flower_pot",
        "path": "textures/items/flower_pot.png"
    },
    {
        "names": "盛开的杜鹃花丛",
        "name": "flowering_azalea",
        "type": "minecraft:flowering_azalea",
        "path": ""
    },
    {
        "names": "狐狸刷怪蛋",
        "name": "fox_spawn_egg",
        "type": "minecraft:fox_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "物品展示框",
        "name": "frame",
        "type": "minecraft:frame",
        "path": "textures/items/item_frame.png"
    },
    {
        "names": "霜冰",
        "name": "frosted_ice",
        "type": "minecraft:frosted_ice",
        "path": ""
    },
    {
        "names": "熔炉",
        "name": "furnace",
        "type": "minecraft:furnace",
        "path": ""
    },
    {
        "names": "恶魂刷怪蛋",
        "name": "ghast_spawn_egg",
        "type": "minecraft:ghast_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "恶魂之泪",
        "name": "ghast_tear",
        "type": "minecraft:ghast_tear",
        "path": "textures/items/ghast_tear.png"
    },
    {
        "names": "镶金黑石",
        "name": "gilded_blackstone",
        "type": "minecraft:gilded_blackstone",
        "path": ""
    },
    {
        "names": "玻璃",
        "name": "glass",
        "type": "minecraft:glass",
        "path": ""
    },
    {
        "names": "玻璃瓶",
        "name": "glass_bottle",
        "type": "minecraft:glass_bottle",
        "path": ""
    },
    {
        "names": "玻璃板",
        "name": "glass_pane",
        "type": "minecraft:glass_pane",
        "path": ""
    },
    {
        "names": "闪烁的西瓜片",
        "name": "glistering_melon_slice",
        "type": "minecraft:glistering_melon_slice",
        "path": "textures/items/melon_speckled.png"
    },
    {
        "names": "地球旗帜图案",
        "name": "globe_banner_pattern",
        "type": "minecraft:globe_banner_pattern",
        "path": "textures/items/banner_pattern.png"
    },
    {
        "names": "发光浆果",
        "name": "glow_berries",
        "type": "minecraft:glow_berries",
        "path": "textures/items/glow_berries.png"
    },
    {
        "names": "荧光物品展示框",
        "name": "glow_frame",
        "type": "minecraft:glow_frame",
        "path": "textures/items/glow_item_frame.png"
    },
    {
        "names": "荧光墨囊",
        "name": "glow_ink_sac",
        "type": "minecraft:glow_ink_sac",
        "path": "textures/items/dye_powder_glow.png"
    },
    {
        "names": "发光地衣",
        "name": "glow_lichen",
        "type": "minecraft:glow_lichen",
        "path": ""
    },
    {
        "names": "发光鱿鱼刷怪蛋",
        "name": "glow_squid_spawn_egg",
        "type": "minecraft:glow_squid_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "荧石",
        "name": "glowstone",
        "type": "minecraft:glowstone",
        "path": ""
    },
    {
        "names": "荧石粉",
        "name": "glowstone_dust",
        "type": "minecraft:glowstone_dust",
        "path": "textures/items/glowstone_dust.png"
    },
    {
        "names": "山羊刷怪蛋",
        "name": "goat_spawn_egg",
        "type": "minecraft:goat_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "金块",
        "name": "gold_block",
        "type": "minecraft:gold_block",
        "path": ""
    },
    {
        "names": "金锭",
        "name": "gold_ingot",
        "type": "minecraft:gold_ingot",
        "path": "textures/items/gold_ingot.png"
    },
    {
        "names": "金粒",
        "name": "gold_nugget",
        "type": "minecraft:gold_nugget",
        "path": "textures/items/gold_nugget.png"
    },
    {
        "names": "金矿石",
        "name": "gold_ore",
        "type": "minecraft:gold_ore",
        "path": ""
    },
    {
        "names": "金苹果",
        "name": "golden_apple",
        "type": "minecraft:golden_apple",
        "path": "textures/items/apple_golden.png"
    },
    {
        "names": "金斧",
        "name": "golden_axe",
        "type": "minecraft:golden_axe",
        "path": "textures/items/gold_axe.png"
    },
    {
        "names": "金靴子",
        "name": "golden_boots",
        "type": "minecraft:golden_boots",
        "path": "textures/items/gold_boots.png"
    },
    {
        "names": "金胡萝卜",
        "name": "golden_carrot",
        "type": "minecraft:golden_carrot",
        "path": "textures/items/carrot_golden.png"
    },
    {
        "names": "金胸甲",
        "name": "golden_chestplate",
        "type": "minecraft:golden_chestplate",
        "path": "textures/items/gold_chestplate.png"
    },
    {
        "names": "金头盔",
        "name": "golden_helmet",
        "type": "minecraft:golden_helmet",
        "path": "textures/items/gold_helmet.png"
    },
    {
        "names": "金锄",
        "name": "golden_hoe",
        "type": "minecraft:golden_hoe",
        "path": "textures/items/gold_hoe.png"
    },
    {
        "names": "金马铠",
        "name": "golden_horse_armor",
        "type": "minecraft:golden_horse_armor",
        "path": "textures/items/gold_horse_armor.png"
    },
    {
        "names": "金护腿",
        "name": "golden_leggings",
        "type": "minecraft:golden_leggings",
        "path": "textures/items/gold_leggings.png"
    },
    {
        "names": "金镐",
        "name": "golden_pickaxe",
        "type": "minecraft:golden_pickaxe",
        "path": "textures/items/gold_pickaxe.png"
    },
    {
        "names": "动力铁轨",
        "name": "golden_rail",
        "type": "minecraft:golden_rail",
        "path": ""
    },
    {
        "names": "金锹",
        "name": "golden_shovel",
        "type": "minecraft:golden_shovel",
        "path": "textures/items/gold_shovel.png"
    },
    {
        "names": "金剑",
        "name": "golden_sword",
        "type": "minecraft:golden_sword",
        "path": "textures/items/gold_sword.png"
    },
    {
        "names": "花岗岩楼梯",
        "name": "granite_stairs",
        "type": "minecraft:granite_stairs",
        "path": ""
    },
    {
        "names": "草",
        "name": "grass",
        "type": "minecraft:grass",
        "path": ""
    },
    {
        "names": "草径",
        "name": "grass_path",
        "type": "minecraft:grass_path",
        "path": ""
    },
    {
        "names": "沙砾",
        "name": "gravel",
        "type": "minecraft:gravel",
        "path": ""
    },
    {
        "names": "灰色蜡烛",
        "name": "gray_candle",
        "type": "minecraft:gray_candle",
        "path": ""
    },
    {
        "names": "灰色染料",
        "name": "gray_dye",
        "type": "minecraft:gray_dye",
        "path": "textures/items/dye_powder_gray.png"
    },
    {
        "names": "灰色带釉陶瓦",
        "name": "gray_glazed_terracotta",
        "type": "minecraft:gray_glazed_terracotta",
        "path": ""
    },
    {
        "names": "绿色蜡烛",
        "name": "green_candle",
        "type": "minecraft:green_candle",
        "path": ""
    },
    {
        "names": "绿色染料",
        "name": "green_dye",
        "type": "minecraft:green_dye",
        "path": "textures/items/dye_powder_green.png"
    },
    {
        "names": "绿色带釉陶瓦",
        "name": "green_glazed_terracotta",
        "type": "minecraft:green_glazed_terracotta",
        "path": ""
    },
    {
        "names": "砂轮",
        "name": "grindstone",
        "type": "minecraft:grindstone",
        "path": ""
    },
    {
        "names": "守卫者刷怪蛋",
        "name": "guardian_spawn_egg",
        "type": "minecraft:guardian_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "火药",
        "name": "gunpowder",
        "type": "minecraft:gunpowder",
        "path": "textures/items/gunpowder.png"
    },
    {
        "names": "垂根",
        "name": "hanging_roots",
        "type": "minecraft:hanging_roots",
        "path": "textures/items/hanging_roots.png"
    },
    {
        "names": "陶瓦",
        "name": "hardened_clay",
        "type": "minecraft:hardened_clay",
        "path": ""
    },
    {
        "names": "干草块",
        "name": "hay_block",
        "type": "minecraft:hay_block",
        "path": ""
    },
    {
        "names": "海洋之心",
        "name": "heart_of_the_sea",
        "type": "minecraft:heart_of_the_sea",
        "path": "textures/items/heartofthesea_closed.png"
    },
    {
        "names": "重质测重压力板",
        "name": "heavy_weighted_pressure_plate",
        "type": "minecraft:heavy_weighted_pressure_plate",
        "path": ""
    },
    {
        "names": "疣猪兽刷怪蛋",
        "name": "hoglin_spawn_egg",
        "type": "minecraft:hoglin_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "蜂蜜块",
        "name": "honey_block",
        "type": "minecraft:honey_block",
        "path": ""
    },
    {
        "names": "蜂蜜瓶",
        "name": "honey_bottle",
        "type": "minecraft:honey_bottle",
        "path": "textures/items/honey_bottle.png"
    },
    {
        "names": "蜜脾",
        "name": "honeycomb",
        "type": "minecraft:honeycomb",
        "path": "textures/items/honeycomb.png"
    },
    {
        "names": "蜜脾块",
        "name": "honeycomb_block",
        "type": "minecraft:honeycomb_block",
        "path": ""
    },
    {
        "names": "漏斗",
        "name": "hopper",
        "type": "minecraft:hopper",
        "path": "textures/items/hopper.png"
    },
    {
        "names": "漏斗矿车",
        "name": "hopper_minecart",
        "type": "minecraft:hopper_minecart",
        "path": "textures/items/minecart_hopper.png"
    },
    {
        "names": "马刷怪蛋",
        "name": "horse_spawn_egg",
        "type": "minecraft:horse_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "尸壳刷怪蛋",
        "name": "husk_spawn_egg",
        "type": "minecraft:husk_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "冰",
        "name": "ice",
        "type": "minecraft:ice",
        "path": ""
    },
    {
        "names": "被虫蚀的深板岩",
        "name": "infested_deepslate",
        "type": "minecraft:infested_deepslate",
        "path": ""
    },
    {
        "names": "墨囊",
        "name": "ink_sac",
        "type": "minecraft:ink_sac",
        "path": "textures/items/dye_powder_black.png"
    },
    {
        "names": "铁斧",
        "name": "iron_axe",
        "type": "minecraft:iron_axe",
        "path": "textures/items/iron_axe.png"
    },
    {
        "names": "铁栏杆",
        "name": "iron_bars",
        "type": "minecraft:iron_bars",
        "path": ""
    },
    {
        "names": "铁块",
        "name": "iron_block",
        "type": "minecraft:iron_block",
        "path": ""
    },
    {
        "names": "铁靴子",
        "name": "iron_boots",
        "type": "minecraft:iron_boots",
        "path": "textures/items/iron_boots.png"
    },
    {
        "names": "铁胸甲",
        "name": "iron_chestplate",
        "type": "minecraft:iron_chestplate",
        "path": "textures/items/iron_chestplate.png"
    },
    {
        "names": "铁门",
        "name": "iron_door",
        "type": "minecraft:iron_door",
        "path": ""
    },
    {
        "names": "铁头盔",
        "name": "iron_helmet",
        "type": "minecraft:iron_helmet",
        "path": "textures/items/iron_helmet.png"
    },
    {
        "names": "铁锄",
        "name": "iron_hoe",
        "type": "minecraft:iron_hoe",
        "path": "textures/items/iron_hoe.png"
    },
    {
        "names": "铁马铠",
        "name": "iron_horse_armor",
        "type": "minecraft:iron_horse_armor",
        "path": "textures/items/iron_horse_armor.png"
    },
    {
        "names": "铁锭",
        "name": "iron_ingot",
        "type": "minecraft:iron_ingot",
        "path": "textures/items/iron_ingot.png"
    },
    {
        "names": "铁护腿",
        "name": "iron_leggings",
        "type": "minecraft:iron_leggings",
        "path": "textures/items/iron_leggings.png"
    },
    {
        "names": "铁粒",
        "name": "iron_nugget",
        "type": "minecraft:iron_nugget",
        "path": "textures/items/iron_nugget.png"
    },
    {
        "names": "铁矿石",
        "name": "iron_ore",
        "type": "minecraft:iron_ore",
        "path": ""
    },
    {
        "names": "铁镐",
        "name": "iron_pickaxe",
        "type": "minecraft:iron_pickaxe",
        "path": "textures/items/iron_pickaxe.png"
    },
    {
        "names": "铁锹",
        "name": "iron_shovel",
        "type": "minecraft:iron_shovel",
        "path": "textures/items/iron_shovel.png"
    },
    {
        "names": "铁剑",
        "name": "iron_sword",
        "type": "minecraft:iron_sword",
        "path": "textures/items/iron_sword.png"
    },
    {
        "names": "铁活板门",
        "name": "iron_trapdoor",
        "type": "minecraft:iron_trapdoor",
        "path": ""
    },
    {
        "names": "拼图方块",
        "name": "jigsaw",
        "type": "minecraft:jigsaw",
        "path": ""
    },
    {
        "names": "唱片机",
        "name": "jukebox",
        "type": "minecraft:jukebox",
        "path": ""
    },
    {
        "names": "丛林木船",
        "name": "jungle_boat",
        "type": "minecraft:jungle_boat",
        "path": "textures/items/boat_oak.png"
    },
    {
        "names": "丛林木按钮",
        "name": "jungle_button",
        "type": "minecraft:jungle_button",
        "path": ""
    },
    {
        "names": "丛林木门",
        "name": "jungle_door",
        "type": "minecraft:jungle_door",
        "path": "textures/items/door_wood.png"
    },
    {
        "names": "丛林木栅栏门",
        "name": "jungle_fence_gate",
        "type": "minecraft:jungle_fence_gate",
        "path": ""
    },
    {
        "names": "丛林木压力板",
        "name": "jungle_pressure_plate",
        "type": "minecraft:jungle_pressure_plate",
        "path": ""
    },
    {
        "names": "丛林木告示牌",
        "name": "jungle_sign",
        "type": "minecraft:jungle_sign",
        "path": "textures/items/sign.png"
    },
    {
        "names": "丛林木楼梯",
        "name": "jungle_stairs",
        "type": "minecraft:jungle_stairs",
        "path": ""
    },
    {
        "names": "丛林木活板门",
        "name": "jungle_trapdoor",
        "type": "minecraft:jungle_trapdoor",
        "path": ""
    },
    {
        "names": "海带",
        "name": "kelp",
        "type": "minecraft:kelp",
        "path": "textures/items/kelp.png"
    },
    {
        "names": "梯子",
        "name": "ladder",
        "type": "minecraft:ladder",
        "path": ""
    },
    {
        "names": "灯笼",
        "name": "lantern",
        "type": "minecraft:lantern",
        "path": "textures/items/lantern.png"
    },
    {
        "names": "青金石块",
        "name": "lapis_block",
        "type": "minecraft:lapis_block",
        "path": ""
    },
    {
        "names": "青金石",
        "name": "lapis_lazuli",
        "type": "minecraft:lapis_lazuli",
        "path": "textures/items/dye_powder_blue.png"
    },
    {
        "names": "青金石矿石",
        "name": "lapis_ore",
        "type": "minecraft:lapis_ore",
        "path": ""
    },
    {
        "names": "大型紫晶芽",
        "name": "large_amethyst_bud",
        "type": "minecraft:large_amethyst_bud",
        "path": ""
    },
    {
        "names": "熔岩桶",
        "name": "lava_bucket",
        "type": "minecraft:lava_bucket",
        "path": "textures/items/bucket_lava.png"
    },
    {
        "names": "拴绳",
        "name": "lead",
        "type": "minecraft:lead",
        "path": "textures/items/lead.png"
    },
    {
        "names": "皮革",
        "name": "leather",
        "type": "minecraft:leather",
        "path": "textures/items/leather.png"
    },
    {
        "names": "皮革靴子",
        "name": "leather_boots",
        "type": "minecraft:leather_boots",
        "path": ""
    },
    {
        "names": "皮革外套",
        "name": "leather_chestplate",
        "type": "minecraft:leather_chestplate",
        "path": ""
    },
    {
        "names": "皮革帽子",
        "name": "leather_helmet",
        "type": "minecraft:leather_helmet",
        "path": ""
    },
    {
        "names": "皮革马铠",
        "name": "leather_horse_armor",
        "type": "minecraft:leather_horse_armor",
        "path": ""
    },
    {
        "names": "皮革裤子",
        "name": "leather_leggings",
        "type": "minecraft:leather_leggings",
        "path": ""
    },
    {
        "names": "橡树树叶/云杉树叶/白桦树叶/丛林树叶",
        "name": "leaves",
        "type": "minecraft:leaves",
        "path": ""
    },
    {
        "names": "金合欢树叶/深色橡树树叶",
        "name": "leaves2",
        "type": "minecraft:leaves2",
        "path": ""
    },
    {
        "names": "讲台",
        "name": "lectern",
        "type": "minecraft:lectern",
        "path": ""
    },
    {
        "names": "拉杆",
        "name": "lever",
        "type": "minecraft:lever",
        "path": "textures/items/lever.png"
    },
    {
        "names": "光源方块",
        "name": "light_block",
        "type": "minecraft:light_block",
        "path": "textures/items/light_block_15.png"
    },
    {
        "names": "淡蓝色蜡烛",
        "name": "light_blue_candle",
        "type": "minecraft:light_blue_candle",
        "path": ""
    },
    {
        "names": "淡蓝色染料",
        "name": "light_blue_dye",
        "type": "minecraft:light_blue_dye",
        "path": "textures/items/dye_powder_light_blue.png"
    },
    {
        "names": "淡蓝色带釉陶瓦",
        "name": "light_blue_glazed_terracotta",
        "type": "minecraft:light_blue_glazed_terracotta",
        "path": ""
    },
    {
        "names": "淡灰色蜡烛",
        "name": "light_gray_candle",
        "type": "minecraft:light_gray_candle",
        "path": ""
    },
    {
        "names": "淡灰色染料",
        "name": "light_gray_dye",
        "type": "minecraft:light_gray_dye",
        "path": "textures/items/dye_powder_silver.png"
    },
    {
        "names": "轻质测重压力板",
        "name": "light_weighted_pressure_plate",
        "type": "minecraft:light_weighted_pressure_plate",
        "path": ""
    },
    {
        "names": "避雷针",
        "name": "lightning_rod",
        "type": "minecraft:lightning_rod",
        "path": ""
    },
    {
        "names": "黄绿色蜡烛",
        "name": "lime_candle",
        "type": "minecraft:lime_candle",
        "path": ""
    },
    {
        "names": "黄绿色染料",
        "name": "lime_dye",
        "type": "minecraft:lime_dye",
        "path": "textures/items/dye_powder_lime.png"
    },
    {
        "names": "黄绿色带釉陶瓦",
        "name": "lime_glazed_terracotta",
        "type": "minecraft:lime_glazed_terracotta",
        "path": ""
    },
    {
        "names": "滞留药水",
        "name": "lingering_potion",
        "type": "minecraft:lingering_potion",
        "path": "textures/items/potion_bottle_lingering.png"
    },
    {
        "names": "南瓜灯",
        "name": "lit_pumpkin",
        "type": "minecraft:lit_pumpkin",
        "path": ""
    },
    {
        "names": "羊驼刷怪蛋",
        "name": "llama_spawn_egg",
        "type": "minecraft:llama_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "磁石",
        "name": "lodestone",
        "type": "minecraft:lodestone",
        "path": ""
    },
    {
        "names": "磁石指针",
        "name": "lodestone_compass",
        "type": "minecraft:lodestone_compass",
        "path": ""
    },
    {
        "names": "橡木原木/云杉原木/白桦原木/丛林原木",
        "name": "log",
        "type": "minecraft:log",
        "path": ""
    },
    {
        "names": "金合欢原木/深色橡木原木",
        "name": "log2",
        "type": "minecraft:log2",
        "path": ""
    },
    {
        "names": "织布机",
        "name": "loom",
        "type": "minecraft:loom",
        "path": ""
    },
    {
        "names": "品红色蜡烛",
        "name": "magenta_candle",
        "type": "minecraft:magenta_candle",
        "path": ""
    },
    {
        "names": "品红色染料",
        "name": "magenta_dye",
        "type": "minecraft:magenta_dye",
        "path": "textures/items/dye_powder_magenta.png"
    },
    {
        "names": "品红色带釉陶瓦",
        "name": "magenta_glazed_terracotta",
        "type": "minecraft:magenta_glazed_terracotta",
        "path": ""
    },
    {
        "names": "岩浆块",
        "name": "magma",
        "type": "minecraft:magma",
        "path": ""
    },
    {
        "names": "岩浆膏",
        "name": "magma_cream",
        "type": "minecraft:magma_cream",
        "path": "textures/items/magma_cream.png"
    },
    {
        "names": "岩浆怪刷怪蛋",
        "name": "magma_cube_spawn_egg",
        "type": "minecraft:magma_cube_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "中型紫晶芽",
        "name": "medium_amethyst_bud",
        "type": "minecraft:medium_amethyst_bud",
        "path": ""
    },
    {
        "names": "西瓜",
        "name": "melon_block",
        "type": "minecraft:melon_block",
        "path": ""
    },
    {
        "names": "西瓜种子",
        "name": "melon_seeds",
        "type": "minecraft:melon_seeds",
        "path": "textures/items/seeds_melon.png"
    },
    {
        "names": "西瓜片",
        "name": "melon_slice",
        "type": "minecraft:melon_slice",
        "path": "textures/items/melon.png"
    },
    {
        "names": "奶桶",
        "name": "milk_bucket",
        "type": "minecraft:milk_bucket",
        "path": "textures/items/bucket_milk.png"
    },
    {
        "names": "矿车",
        "name": "minecart",
        "type": "minecraft:minecart",
        "path": "textures/items/minecart_normal.png"
    },
    {
        "names": "刷怪笼",
        "name": "mob_spawner",
        "type": "minecraft:mob_spawner",
        "path": ""
    },
    {
        "names": "minecraft:mojang徽标旗帜图案",
        "name": "mojang_banner_pattern",
        "type": "minecraft:mojang_banner_pattern",
        "path": "textures/items/banner_pattern.png"
    },
    {
        "names": "被虫蚀的石头/被虫蚀的圆石/被虫蚀的石砖/被虫蚀的苔石砖/被虫蚀的裂纹石砖/被虫蚀的錾制石砖",
        "name": "monster_egg",
        "type": "minecraft:monster_egg",
        "path": ""
    },
    {
        "names": "哞菇刷怪蛋",
        "name": "mooshroom_spawn_egg",
        "type": "minecraft:mooshroom_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "苔藓块",
        "name": "moss_block",
        "type": "minecraft:moss_block",
        "path": ""
    },
    {
        "names": "苔藓地毯",
        "name": "moss_carpet",
        "type": "minecraft:moss_carpet",
        "path": ""
    },
    {
        "names": "苔石",
        "name": "mossy_cobblestone",
        "type": "minecraft:mossy_cobblestone",
        "path": ""
    },
    {
        "names": "苔石楼梯",
        "name": "mossy_cobblestone_stairs",
        "type": "minecraft:mossy_cobblestone_stairs",
        "path": ""
    },
    {
        "names": "苔石砖楼梯",
        "name": "mossy_stone_brick_stairs",
        "type": "minecraft:mossy_stone_brick_stairs",
        "path": ""
    },
    {
        "names": "骡刷怪蛋",
        "name": "mule_spawn_egg",
        "type": "minecraft:mule_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "蘑菇煲",
        "name": "mushroom_stew",
        "type": "minecraft:mushroom_stew",
        "path": "textures/items/mushroom_stew.png"
    },
    {
        "names": "音乐唱片 C418 - 11",
        "name": "music_disc_11",
        "type": "minecraft:music_disc_11",
        "path": "textures/items/record_cat.png"
    },
    {
        "names": "音乐唱片 C418 - 13",
        "name": "music_disc_13",
        "type": "minecraft:music_disc_13",
        "path": "textures/items/record_cat.png"
    },
    {
        "names": "音乐唱片 C418 - blocks",
        "name": "music_disc_blocks",
        "type": "minecraft:music_disc_blocks",
        "path": "textures/items/record_cat.png"
    },
    {
        "names": "音乐唱片 C418 - cat",
        "name": "music_disc_cat",
        "type": "minecraft:music_disc_cat",
        "path": "textures/items/record_cat.png"
    },
    {
        "names": "音乐唱片 C418 - chirp",
        "name": "music_disc_chirp",
        "type": "minecraft:music_disc_chirp",
        "path": "textures/items/record_cat.png"
    },
    {
        "names": "音乐唱片 C418 - far",
        "name": "music_disc_far",
        "type": "minecraft:music_disc_far",
        "path": "textures/items/record_cat.png"
    },
    {
        "names": "音乐唱片 C418 - mall",
        "name": "music_disc_mall",
        "type": "minecraft:music_disc_mall",
        "path": "textures/items/record_cat.png"
    },
    {
        "names": "音乐唱片 C418 - mellohi",
        "name": "music_disc_mellohi",
        "type": "minecraft:music_disc_mellohi",
        "path": "textures/items/record_cat.png"
    },
    {
        "names": "音乐唱片 Lena Raine - otherside",
        "name": "music_disc_otherside",
        "type": "minecraft:music_disc_otherside",
        "path": "textures/items/record_cat.png"
    },
    {
        "names": "音乐唱片 Lena Raine - Pigstep",
        "name": "music_disc_pigstep",
        "type": "minecraft:music_disc_pigstep",
        "path": "textures/items/record_cat.png"
    },
    {
        "names": "音乐唱片 C418 - stal",
        "name": "music_disc_stal",
        "type": "minecraft:music_disc_stal",
        "path": "textures/items/record_cat.png"
    },
    {
        "names": "音乐唱片 C418 - strad",
        "name": "music_disc_strad",
        "type": "minecraft:music_disc_strad",
        "path": "textures/items/record_cat.png"
    },
    {
        "names": "音乐唱片 C418 - wait",
        "name": "music_disc_wait",
        "type": "minecraft:music_disc_wait",
        "path": "textures/items/record_cat.png"
    },
    {
        "names": "音乐唱片 C418 - ward",
        "name": "music_disc_ward",
        "type": "minecraft:music_disc_ward",
        "path": "textures/items/record_cat.png"
    },
    {
        "names": "生羊肉",
        "name": "mutton",
        "type": "minecraft:mutton",
        "path": "textures/items/mutton_raw.png"
    },
    {
        "names": "菌丝",
        "name": "mycelium",
        "type": "minecraft:mycelium",
        "path": ""
    },
    {
        "names": "命名牌",
        "name": "name_tag",
        "type": "minecraft:name_tag",
        "path": "textures/items/name_tag.png"
    },
    {
        "names": "鹦鹉螺壳",
        "name": "nautilus_shell",
        "type": "minecraft:nautilus_shell",
        "path": "textures/items/nautilus.png"
    },
    {
        "names": "下界砖",
        "name": "nether_brick",
        "type": "minecraft:nether_brick",
        "path": ""
    },
    {
        "names": "下界砖栅栏",
        "name": "nether_brick_fence",
        "type": "minecraft:nether_brick_fence",
        "path": ""
    },
    {
        "names": "下界砖楼梯",
        "name": "nether_brick_stairs",
        "type": "minecraft:nether_brick_stairs",
        "path": ""
    },
    {
        "names": "下界金矿石",
        "name": "nether_gold_ore",
        "type": "minecraft:nether_gold_ore",
        "path": ""
    },
    {
        "names": "下界苗",
        "name": "nether_sprouts",
        "type": "minecraft:nether_sprouts",
        "path": "textures/items/nether_sprouts.png"
    },
    {
        "names": "下界之星",
        "name": "nether_star",
        "type": "minecraft:nether_star",
        "path": "textures/items/nether_star.png"
    },
    {
        "names": "下界疣",
        "name": "nether_wart",
        "type": "minecraft:nether_wart",
        "path": "textures/items/nether_wart.png"
    },
    {
        "names": "下界疣块",
        "name": "nether_wart_block",
        "type": "minecraft:nether_wart_block",
        "path": ""
    },
    {
        "names": "下界砖块",
        "name": "netherbrick",
        "type": "minecraft:netherbrick",
        "path": "textures/items/netherbrick.png"
    },
    {
        "names": "下界合金斧",
        "name": "netherite_axe",
        "type": "minecraft:netherite_axe",
        "path": "textures/items/netherite_axe.png"
    },
    {
        "names": "下界合金块",
        "name": "netherite_block",
        "type": "minecraft:netherite_block",
        "path": ""
    },
    {
        "names": "下界合金靴子",
        "name": "netherite_boots",
        "type": "minecraft:netherite_boots",
        "path": "textures/items/netherite_boots.png"
    },
    {
        "names": "下界合金胸甲",
        "name": "netherite_chestplate",
        "type": "minecraft:netherite_chestplate",
        "path": "textures/items/netherite_chestplate.png"
    },
    {
        "names": "下界合金头盔",
        "name": "netherite_helmet",
        "type": "minecraft:netherite_helmet",
        "path": "textures/items/netherite_helmet.png"
    },
    {
        "names": "下界合金锄",
        "name": "netherite_hoe",
        "type": "minecraft:netherite_hoe",
        "path": "textures/items/netherite_hoe.png"
    },
    {
        "names": "下界合金锭",
        "name": "netherite_ingot",
        "type": "minecraft:netherite_ingot",
        "path": "textures/items/netherite_ingot.png"
    },
    {
        "names": "下界合金护腿",
        "name": "netherite_leggings",
        "type": "minecraft:netherite_leggings",
        "path": "textures/items/netherite_leggings.png"
    },
    {
        "names": "下界合金镐",
        "name": "netherite_pickaxe",
        "type": "minecraft:netherite_pickaxe",
        "path": "textures/items/netherite_pickaxe.png"
    },
    {
        "names": "下界合金碎片",
        "name": "netherite_scrap",
        "type": "minecraft:netherite_scrap",
        "path": "textures/items/netherite_scrap.png"
    },
    {
        "names": "下界合金锹",
        "name": "netherite_shovel",
        "type": "minecraft:netherite_shovel",
        "path": "textures/items/netherite_shovel.png"
    },
    {
        "names": "下界合金剑",
        "name": "netherite_sword",
        "type": "minecraft:netherite_sword",
        "path": "textures/items/netherite_sword.png"
    },
    {
        "names": "下界岩",
        "name": "netherrack",
        "type": "minecraft:netherrack",
        "path": ""
    },
    {
        "names": "石头楼梯",
        "name": "normal_stone_stairs",
        "type": "minecraft:normal_stone_stairs",
        "path": ""
    },
    {
        "names": "音符盒",
        "name": "noteblock",
        "type": "minecraft:noteblock",
        "path": ""
    },
    {
        "names": "橡木船",
        "name": "oak_boat",
        "type": "minecraft:oak_boat",
        "path": "textures/items/boat_oak.png"
    },
    {
        "names": "橡木告示牌",
        "name": "oak_sign",
        "type": "minecraft:oak_sign",
        "path": "textures/items/sign.png"
    },
    {
        "names": "橡木楼梯",
        "name": "oak_stairs",
        "type": "minecraft:oak_stairs",
        "path": ""
    },
    {
        "names": "侦测器",
        "name": "observer",
        "type": "minecraft:observer",
        "path": ""
    },
    {
        "names": "黑曜石",
        "name": "obsidian",
        "type": "minecraft:obsidian",
        "path": ""
    },
    {
        "names": "豹猫刷怪蛋",
        "name": "ocelot_spawn_egg",
        "type": "minecraft:ocelot_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "橙色蜡烛",
        "name": "orange_candle",
        "type": "minecraft:orange_candle",
        "path": ""
    },
    {
        "names": "橙色染料",
        "name": "orange_dye",
        "type": "minecraft:orange_dye",
        "path": "textures/items/dye_powder_orange.png"
    },
    {
        "names": "橙色带釉陶瓦",
        "name": "orange_glazed_terracotta",
        "type": "minecraft:orange_glazed_terracotta",
        "path": ""
    },
    {
        "names": "氧化的铜块",
        "name": "oxidized_copper",
        "type": "minecraft:oxidized_copper",
        "path": ""
    },
    {
        "names": "氧化的切制铜块",
        "name": "oxidized_cut_copper",
        "type": "minecraft:oxidized_cut_copper",
        "path": ""
    },
    {
        "names": "氧化的切制铜台阶",
        "name": "oxidized_cut_copper_slab",
        "type": "minecraft:oxidized_cut_copper_slab",
        "path": ""
    },
    {
        "names": "氧化的切制铜楼梯",
        "name": "oxidized_cut_copper_stairs",
        "type": "minecraft:oxidized_cut_copper_stairs",
        "path": ""
    },
    {
        "names": "浮冰",
        "name": "packed_ice",
        "type": "minecraft:packed_ice",
        "path": ""
    },
    {
        "names": "画",
        "name": "painting",
        "type": "minecraft:painting",
        "path": "textures/items/painting.png"
    },
    {
        "names": "熊猫刷怪蛋",
        "name": "panda_spawn_egg",
        "type": "minecraft:panda_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "纸",
        "name": "paper",
        "type": "minecraft:paper",
        "path": "textures/items/paper.png"
    },
    {
        "names": "鹦鹉刷怪蛋",
        "name": "parrot_spawn_egg",
        "type": "minecraft:parrot_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "幻翼膜",
        "name": "phantom_membrane",
        "type": "minecraft:phantom_membrane",
        "path": "textures/items/phantom_membrane.png"
    },
    {
        "names": "幻翼刷怪蛋",
        "name": "phantom_spawn_egg",
        "type": "minecraft:phantom_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "猪刷怪蛋",
        "name": "pig_spawn_egg",
        "type": "minecraft:pig_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "猪鼻旗帜图案",
        "name": "piglin_banner_pattern",
        "type": "minecraft:piglin_banner_pattern",
        "path": "textures/items/banner_pattern.png"
    },
    {
        "names": "猪灵蛮兵刷怪蛋",
        "name": "piglin_brute_spawn_egg",
        "type": "minecraft:piglin_brute_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "猪灵刷怪蛋",
        "name": "piglin_spawn_egg",
        "type": "minecraft:piglin_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "掠夺者刷怪蛋",
        "name": "pillager_spawn_egg",
        "type": "minecraft:pillager_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "粉红色蜡烛",
        "name": "pink_candle",
        "type": "minecraft:pink_candle",
        "path": ""
    },
    {
        "names": "粉红色染料",
        "name": "pink_dye",
        "type": "minecraft:pink_dye",
        "path": "textures/items/dye_powder_pink.png"
    },
    {
        "names": "粉红色带釉陶瓦",
        "name": "pink_glazed_terracotta",
        "type": "minecraft:pink_glazed_terracotta",
        "path": ""
    },
    {
        "names": "活塞",
        "name": "piston",
        "type": "minecraft:piston",
        "path": ""
    },
    {
        "names": "橡木木板/云杉木板/白桦木板/丛林木板/金合欢木板/深色橡木木板",
        "name": "planks",
        "type": "minecraft:planks",
        "path": ""
    },
    {
        "names": "灰化土",
        "name": "podzol",
        "type": "minecraft:podzol",
        "path": ""
    },
    {
        "names": "滴水石锥",
        "name": "pointed_dripstone",
        "type": "minecraft:pointed_dripstone",
        "path": ""
    },
    {
        "names": "毒马铃薯",
        "name": "poisonous_potato",
        "type": "minecraft:poisonous_potato",
        "path": "textures/items/potato_poisonous.png"
    },
    {
        "names": "北极熊刷怪蛋",
        "name": "polar_bear_spawn_egg",
        "type": "minecraft:polar_bear_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "磨制安山岩楼梯",
        "name": "polished_andesite_stairs",
        "type": "minecraft:polished_andesite_stairs",
        "path": ""
    },
    {
        "names": "磨制玄武岩",
        "name": "polished_basalt",
        "type": "minecraft:polished_basalt",
        "path": ""
    },
    {
        "names": "磨制黑石",
        "name": "polished_blackstone",
        "type": "minecraft:polished_blackstone",
        "path": ""
    },
    {
        "names": "磨制黑石砖台阶",
        "name": "polished_blackstone_brick_slab",
        "type": "minecraft:polished_blackstone_brick_slab",
        "path": ""
    },
    {
        "names": "磨制黑石砖楼梯",
        "name": "polished_blackstone_brick_stairs",
        "type": "minecraft:polished_blackstone_brick_stairs",
        "path": ""
    },
    {
        "names": "磨制黑石砖墙",
        "name": "polished_blackstone_brick_wall",
        "type": "minecraft:polished_blackstone_brick_wall",
        "path": ""
    },
    {
        "names": "磨制黑石砖",
        "name": "polished_blackstone_bricks",
        "type": "minecraft:polished_blackstone_bricks",
        "path": ""
    },
    {
        "names": "磨制黑石按钮",
        "name": "polished_blackstone_button",
        "type": "minecraft:polished_blackstone_button",
        "path": ""
    },
    {
        "names": "磨制黑石压力板",
        "name": "polished_blackstone_pressure_plate",
        "type": "minecraft:polished_blackstone_pressure_plate",
        "path": ""
    },
    {
        "names": "磨制黑石台阶",
        "name": "polished_blackstone_slab",
        "type": "minecraft:polished_blackstone_slab",
        "path": ""
    },
    {
        "names": "磨制黑石楼梯",
        "name": "polished_blackstone_stairs",
        "type": "minecraft:polished_blackstone_stairs",
        "path": ""
    },
    {
        "names": "磨制黑石墙",
        "name": "polished_blackstone_wall",
        "type": "minecraft:polished_blackstone_wall",
        "path": ""
    },
    {
        "names": "磨制深板岩",
        "name": "polished_deepslate",
        "type": "minecraft:polished_deepslate",
        "path": ""
    },
    {
        "names": "磨制深板岩台阶",
        "name": "polished_deepslate_slab",
        "type": "minecraft:polished_deepslate_slab",
        "path": ""
    },
    {
        "names": "磨制深板岩楼梯",
        "name": "polished_deepslate_stairs",
        "type": "minecraft:polished_deepslate_stairs",
        "path": ""
    },
    {
        "names": "磨制深板岩墙",
        "name": "polished_deepslate_wall",
        "type": "minecraft:polished_deepslate_wall",
        "path": ""
    },
    {
        "names": "磨制闪长岩楼梯",
        "name": "polished_diorite_stairs",
        "type": "minecraft:polished_diorite_stairs",
        "path": ""
    },
    {
        "names": "磨制花岗岩楼梯",
        "name": "polished_granite_stairs",
        "type": "minecraft:polished_granite_stairs",
        "path": ""
    },
    {
        "names": "爆裂紫颂果",
        "name": "popped_chorus_fruit",
        "type": "minecraft:popped_chorus_fruit",
        "path": "textures/items/chorus_fruit_popped.png"
    },
    {
        "names": "生猪排",
        "name": "porkchop",
        "type": "minecraft:porkchop",
        "path": "textures/items/porkchop_raw.png"
    },
    {
        "names": "马铃薯",
        "name": "potato",
        "type": "minecraft:potato",
        "path": "textures/items/potato.png"
    },
    {
        "names": "药水",
        "name": "potion",
        "type": "minecraft:potion",
        "path": "textures/items/potion_bottle_absorption.png"
    },
    {
        "names": "细雪桶",
        "name": "powder_snow_bucket",
        "type": "minecraft:powder_snow_bucket",
        "path": "textures/items/bucket_powder_snow.png"
    },
    {
        "names": "海晶石/暗海晶石/海晶石砖",
        "name": "prismarine",
        "type": "minecraft:prismarine",
        "path": ""
    },
    {
        "names": "海晶石砖楼梯",
        "name": "prismarine_bricks_stairs",
        "type": "minecraft:prismarine_bricks_stairs",
        "path": ""
    },
    {
        "names": "海晶砂粒",
        "name": "prismarine_crystals",
        "type": "minecraft:prismarine_crystals",
        "path": "textures/items/prismarine_crystals.png"
    },
    {
        "names": "海晶碎片",
        "name": "prismarine_shard",
        "type": "minecraft:prismarine_shard",
        "path": "textures/items/prismarine_shard.png"
    },
    {
        "names": "海晶石楼梯",
        "name": "prismarine_stairs",
        "type": "minecraft:prismarine_stairs",
        "path": ""
    },
    {
        "names": "河豚",
        "name": "pufferfish",
        "type": "minecraft:pufferfish",
        "path": "textures/items/fish_pufferfish_raw.png"
    },
    {
        "names": "河豚桶",
        "name": "pufferfish_bucket",
        "type": "minecraft:pufferfish_bucket",
        "path": "textures/items/bucket_pufferfish.png"
    },
    {
        "names": "河豚刷怪蛋",
        "name": "pufferfish_spawn_egg",
        "type": "minecraft:pufferfish_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "南瓜",
        "name": "pumpkin",
        "type": "minecraft:pumpkin",
        "path": "textures/items/seeds_pumpkin.png"
    },
    {
        "names": "南瓜派",
        "name": "pumpkin_pie",
        "type": "minecraft:pumpkin_pie",
        "path": "textures/items/pumpkin_pie.png"
    },
    {
        "names": "南瓜种子",
        "name": "pumpkin_seeds",
        "type": "minecraft:pumpkin_seeds",
        "path": ""
    },
    {
        "names": "紫色蜡烛",
        "name": "purple_candle",
        "type": "minecraft:purple_candle",
        "path": ""
    },
    {
        "names": "紫色染料",
        "name": "purple_dye",
        "type": "minecraft:purple_dye",
        "path": "textures/items/dye_powder_purple.png"
    },
    {
        "names": "紫色带釉陶瓦",
        "name": "purple_glazed_terracotta",
        "type": "minecraft:purple_glazed_terracotta",
        "path": ""
    },
    {
        "names": "紫珀块/錾制紫珀块/紫珀柱/平滑紫珀块",
        "name": "purpur_block",
        "type": "minecraft:purpur_block",
        "path": ""
    },
    {
        "names": "紫珀楼梯",
        "name": "purpur_stairs",
        "type": "minecraft:purpur_stairs",
        "path": ""
    },
    {
        "names": "下界石英",
        "name": "quartz",
        "type": "minecraft:quartz",
        "path": "textures/items/quartz.png"
    },
    {
        "names": "石英块/錾制石英块/石英柱/平滑石英块",
        "name": "quartz_block",
        "type": "minecraft:quartz_block",
        "path": ""
    },
    {
        "names": "石英砖",
        "name": "quartz_bricks",
        "type": "minecraft:quartz_bricks",
        "path": ""
    },
    {
        "names": "下界石英矿石",
        "name": "quartz_ore",
        "type": "minecraft:quartz_ore",
        "path": ""
    },
    {
        "names": "石英楼梯",
        "name": "quartz_stairs",
        "type": "minecraft:quartz_stairs",
        "path": ""
    },
    {
        "names": "兔子",
        "name": "rabbit",
        "type": "minecraft:rabbit",
        "path": "textures/items/rabbit_raw.png"
    },
    {
        "names": "兔子脚",
        "name": "rabbit_foot",
        "type": "minecraft:rabbit_foot",
        "path": "textures/items/rabbit_foot.png"
    },
    {
        "names": "兔子皮",
        "name": "rabbit_hide",
        "type": "minecraft:rabbit_hide",
        "path": "textures/items/rabbit_hide.png"
    },
    {
        "names": "兔子刷怪蛋",
        "name": "rabbit_spawn_egg",
        "type": "minecraft:rabbit_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "兔肉煲",
        "name": "rabbit_stew",
        "type": "minecraft:rabbit_stew",
        "path": "textures/items/rabbit_stew.png"
    },
    {
        "names": "铁轨",
        "name": "rail",
        "type": "minecraft:rail",
        "path": ""
    },
    {
        "names": "劫掠兽刷怪蛋",
        "name": "ravager_spawn_egg",
        "type": "minecraft:ravager_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "粗铜",
        "name": "raw_copper",
        "type": "minecraft:raw_copper",
        "path": "textures/items/raw_copper.png"
    },
    {
        "names": "粗铜块",
        "name": "raw_copper_block",
        "type": "minecraft:raw_copper_block",
        "path": ""
    },
    {
        "names": "粗金",
        "name": "raw_gold",
        "type": "minecraft:raw_gold",
        "path": "textures/items/raw_gold.png"
    },
    {
        "names": "粗金块",
        "name": "raw_gold_block",
        "type": "minecraft:raw_gold_block",
        "path": ""
    },
    {
        "names": "粗铁",
        "name": "raw_iron",
        "type": "minecraft:raw_iron",
        "path": "textures/items/raw_iron.png"
    },
    {
        "names": "粗铁块",
        "name": "raw_iron_block",
        "type": "minecraft:raw_iron_block",
        "path": ""
    },
    {
        "names": "红色蜡烛",
        "name": "red_candle",
        "type": "minecraft:red_candle",
        "path": ""
    },
    {
        "names": "红色染料",
        "name": "red_dye",
        "type": "minecraft:red_dye",
        "path": "textures/items/dye_powder_red.png"
    },
    {
        "names": "虞美人/兰花/绒球葱/蓝花美耳草/红色郁金香/橙色郁金香/白色郁金香/粉红色郁金香/滨菊/矢车菊/铃兰",
        "name": "red_flower",
        "type": "minecraft:red_flower",
        "path": ""
    },
    {
        "names": "红色带釉陶瓦",
        "name": "red_glazed_terracotta",
        "type": "minecraft:red_glazed_terracotta",
        "path": ""
    },
    {
        "names": "红色蘑菇",
        "name": "red_mushroom",
        "type": "minecraft:red_mushroom",
        "path": ""
    },
    {
        "names": "红色蘑菇方块",
        "name": "red_mushroom_block",
        "type": "minecraft:red_mushroom_block",
        "path": ""
    },
    {
        "names": "红色下界砖块",
        "name": "red_nether_brick",
        "type": "minecraft:red_nether_brick",
        "path": ""
    },
    {
        "names": "红色下界砖楼梯",
        "name": "red_nether_brick_stairs",
        "type": "minecraft:red_nether_brick_stairs",
        "path": ""
    },
    {
        "names": "红砂岩/錾制红砂岩/切制红砂岩/平滑红砂岩",
        "name": "red_sandstone",
        "type": "minecraft:red_sandstone",
        "path": ""
    },
    {
        "names": "红砂岩楼梯",
        "name": "red_sandstone_stairs",
        "type": "minecraft:red_sandstone_stairs",
        "path": ""
    },
    {
        "names": "红石粉",
        "name": "redstone",
        "type": "minecraft:redstone",
        "path": "textures/items/redstone_dust.png"
    },
    {
        "names": "红石块",
        "name": "redstone_block",
        "type": "minecraft:redstone_block",
        "path": ""
    },
    {
        "names": "红石灯",
        "name": "redstone_lamp",
        "type": "minecraft:redstone_lamp",
        "path": ""
    },
    {
        "names": "红石矿石",
        "name": "redstone_ore",
        "type": "minecraft:redstone_ore",
        "path": ""
    },
    {
        "names": "红石火把",
        "name": "redstone_torch",
        "type": "minecraft:redstone_torch",
        "path": ""
    },
    {
        "names": "红石中继器",
        "name": "repeater",
        "type": "minecraft:repeater",
        "path": "textures/items/repeater.png"
    },
    {
        "names": "循环型命令方块",
        "name": "repeating_command_block",
        "type": "minecraft:repeating_command_block",
        "path": ""
    },
    {
        "names": "重生锚",
        "name": "respawn_anchor",
        "type": "minecraft:respawn_anchor",
        "path": ""
    },
    {
        "names": "腐肉",
        "name": "rotten_flesh",
        "type": "minecraft:rotten_flesh",
        "path": "textures/items/rotten_flesh.png"
    },
    {
        "names": "鞍",
        "name": "saddle",
        "type": "minecraft:saddle",
        "path": "textures/items/saddle.png"
    },
    {
        "names": "鲑鱼",
        "name": "salmon",
        "type": "minecraft:salmon",
        "path": "textures/items/fish_salmon_raw.png"
    },
    {
        "names": "鲑鱼桶",
        "name": "salmon_bucket",
        "type": "minecraft:salmon_bucket",
        "path": "textures/items/bucket_salmon.png"
    },
    {
        "names": "鲑鱼刷怪蛋",
        "name": "salmon_spawn_egg",
        "type": "minecraft:salmon_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "沙子/红沙",
        "name": "sand",
        "type": "minecraft:sand",
        "path": ""
    },
    {
        "names": "砂岩/錾制砂岩/切制砂岩/平滑砂岩",
        "name": "sandstone",
        "type": "minecraft:sandstone",
        "path": ""
    },
    {
        "names": "砂岩楼梯",
        "name": "sandstone_stairs",
        "type": "minecraft:sandstone_stairs",
        "path": ""
    },
    {
        "names": "橡树树苗/云杉树苗/白桦树苗/丛林树苗/金合欢树苗/深色橡树树苗",
        "name": "sapling",
        "type": "minecraft:sapling",
        "path": ""
    },
    {
        "names": "脚手架",
        "name": "scaffolding",
        "type": "minecraft:scaffolding",
        "path": ""
    },
    {
        "names": "鳞甲",
        "name": "scute",
        "type": "minecraft:scute",
        "path": "textures/items/turtle_shell_piece.png"
    },
    {
        "names": "海晶灯",
        "name": "sea_lantern",
        "type": "minecraft:sea_lantern",
        "path": ""
    },
    {
        "names": "海泡菜",
        "name": "sea_pickle",
        "type": "minecraft:sea_pickle",
        "path": "textures/items/sea_pickle.png"
    },
    {
        "names": "海草",
        "name": "seagrass",
        "type": "minecraft:seagrass",
        "path": ""
    },
    {
        "names": "剪刀",
        "name": "shears",
        "type": "minecraft:shears",
        "path": "textures/items/shears.png"
    },
    {
        "names": "绵羊刷怪蛋",
        "name": "sheep_spawn_egg",
        "type": "minecraft:sheep_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "盾牌",
        "name": "shield",
        "type": "minecraft:shield",
        "path": ""
    },
    {
        "names": "菌光体",
        "name": "shroomlight",
        "type": "minecraft:shroomlight",
        "path": ""
    },
    {
        "names": "潜影盒",
        "name": "shulker_box",
        "type": "minecraft:shulker_box",
        "path": ""
    },
    {
        "names": "潜影壳",
        "name": "shulker_shell",
        "type": "minecraft:shulker_shell",
        "path": "textures/items/shulker_shell.png"
    },
    {
        "names": "潜影贝刷怪蛋",
        "name": "shulker_spawn_egg",
        "type": "minecraft:shulker_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "淡灰色带釉陶瓦",
        "name": "silver_glazed_terracotta",
        "type": "minecraft:silver_glazed_terracotta",
        "path": ""
    },
    {
        "names": "蠹虫刷怪蛋",
        "name": "silverfish_spawn_egg",
        "type": "minecraft:silverfish_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "骷髅马刷怪蛋",
        "name": "skeleton_horse_spawn_egg",
        "type": "minecraft:skeleton_horse_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "骷髅刷怪蛋",
        "name": "skeleton_spawn_egg",
        "type": "minecraft:skeleton_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "生物头颅",
        "name": "skull",
        "type": "minecraft:skull",
        "path": ""
    },
    {
        "names": "头颅盾徽旗帜图案",
        "name": "skull_banner_pattern",
        "type": "minecraft:skull_banner_pattern",
        "path": "textures/items/banner_pattern.png"
    },
    {
        "names": "黏液块",
        "name": "slime",
        "type": "minecraft:slime",
        "path": ""
    },
    {
        "names": "黏液球",
        "name": "slime_ball",
        "type": "minecraft:slime_ball",
        "path": "textures/items/slimeball.png"
    },
    {
        "names": "史莱姆刷怪蛋",
        "name": "slime_spawn_egg",
        "type": "minecraft:slime_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "小型紫晶芽",
        "name": "small_amethyst_bud",
        "type": "minecraft:small_amethyst_bud",
        "path": ""
    },
    {
        "names": "小型垂滴叶",
        "name": "small_dripleaf_block",
        "type": "minecraft:small_dripleaf_block",
        "path": ""
    },
    {
        "names": "锻造台",
        "name": "smithing_table",
        "type": "minecraft:smithing_table",
        "path": ""
    },
    {
        "names": "烟熏炉",
        "name": "smoker",
        "type": "minecraft:smoker",
        "path": ""
    },
    {
        "names": "平滑玄武岩",
        "name": "smooth_basalt",
        "type": "minecraft:smooth_basalt",
        "path": ""
    },
    {
        "names": "平滑石英楼梯",
        "name": "smooth_quartz_stairs",
        "type": "minecraft:smooth_quartz_stairs",
        "path": ""
    },
    {
        "names": "平滑红砂岩楼梯",
        "name": "smooth_red_sandstone_stairs",
        "type": "minecraft:smooth_red_sandstone_stairs",
        "path": ""
    },
    {
        "names": "平滑砂岩楼梯",
        "name": "smooth_sandstone_stairs",
        "type": "minecraft:smooth_sandstone_stairs",
        "path": ""
    },
    {
        "names": "平滑石头",
        "name": "smooth_stone",
        "type": "minecraft:smooth_stone",
        "path": ""
    },
    {
        "names": "雪块",
        "name": "snow",
        "type": "minecraft:snow",
        "path": ""
    },
    {
        "names": "顶层雪",
        "name": "snow_layer",
        "type": "minecraft:snow_layer",
        "path": ""
    },
    {
        "names": "雪球",
        "name": "snowball",
        "type": "minecraft:snowball",
        "path": "textures/items/snowball.png"
    },
    {
        "names": "灵魂营火",
        "name": "soul_campfire",
        "type": "minecraft:soul_campfire",
        "path": "textures/items/soul_campfire.png"
    },
    {
        "names": "灵魂灯笼",
        "name": "soul_lantern",
        "type": "minecraft:soul_lantern",
        "path": "textures/items/soul_lantern.png"
    },
    {
        "names": "灵魂沙",
        "name": "soul_sand",
        "type": "minecraft:soul_sand",
        "path": ""
    },
    {
        "names": "灵魂土",
        "name": "soul_soil",
        "type": "minecraft:soul_soil",
        "path": ""
    },
    {
        "names": "灵魂火把",
        "name": "soul_torch",
        "type": "minecraft:soul_torch",
        "path": ""
    },
    {
        "names": "蜘蛛眼",
        "name": "spider_eye",
        "type": "minecraft:spider_eye",
        "path": "textures/items/spider_eye.png"
    },
    {
        "names": "蜘蛛刷怪蛋",
        "name": "spider_spawn_egg",
        "type": "minecraft:spider_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "喷溅药水",
        "name": "splash_potion",
        "type": "minecraft:splash_potion",
        "path": "textures/items/potion_bottle_splash.png"
    },
    {
        "names": "海绵/湿海绵",
        "name": "sponge",
        "type": "minecraft:sponge",
        "path": ""
    },
    {
        "names": "孢子花",
        "name": "spore_blossom",
        "type": "minecraft:spore_blossom",
        "path": ""
    },
    {
        "names": "云杉木船",
        "name": "spruce_boat",
        "type": "minecraft:spruce_boat",
        "path": "textures/items/boat_oak.png"
    },
    {
        "names": "云杉木按钮",
        "name": "spruce_button",
        "type": "minecraft:spruce_button",
        "path": ""
    },
    {
        "names": "云杉木门",
        "name": "spruce_door",
        "type": "minecraft:spruce_door",
        "path": "textures/items/door_wood.png"
    },
    {
        "names": "云杉木栅栏门",
        "name": "spruce_fence_gate",
        "type": "minecraft:spruce_fence_gate",
        "path": ""
    },
    {
        "names": "云杉木压力板",
        "name": "spruce_pressure_plate",
        "type": "minecraft:spruce_pressure_plate",
        "path": ""
    },
    {
        "names": "云杉木告示牌",
        "name": "spruce_sign",
        "type": "minecraft:spruce_sign",
        "path": "textures/items/sign.png"
    },
    {
        "names": "云杉木楼梯",
        "name": "spruce_stairs",
        "type": "minecraft:spruce_stairs",
        "path": ""
    },
    {
        "names": "云杉木活板门",
        "name": "spruce_trapdoor",
        "type": "minecraft:spruce_trapdoor",
        "path": ""
    },
    {
        "names": "望远镜",
        "name": "spyglass",
        "type": "minecraft:spyglass",
        "path": "textures/items/spyglass.png"
    },
    {
        "names": "鱿鱼刷怪蛋",
        "name": "squid_spawn_egg",
        "type": "minecraft:squid_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "染色玻璃",
        "name": "stained_glass",
        "type": "minecraft:stained_glass",
        "path": ""
    },
    {
        "names": "染色玻璃板",
        "name": "stained_glass_pane",
        "type": "minecraft:stained_glass_pane",
        "path": ""
    },
    {
        "names": "染色陶瓦",
        "name": "stained_hardened_clay",
        "type": "minecraft:stained_hardened_clay",
        "path": ""
    },
    {
        "names": "木棍",
        "name": "stick",
        "type": "minecraft:stick",
        "path": "textures/items/stick.png"
    },
    {
        "names": "黏性活塞",
        "name": "sticky_piston",
        "type": "minecraft:sticky_piston",
        "path": ""
    },
    {
        "names": "石头/花岗岩/磨制花岗岩/闪长岩/磨制闪长岩/安山岩/磨制安山岩",
        "name": "stone",
        "type": "minecraft:stone",
        "path": ""
    },
    {
        "names": "石斧",
        "name": "stone_axe",
        "type": "minecraft:stone_axe",
        "path": "textures/items/stone_axe.png"
    },
    {
        "names": "石砖楼梯",
        "name": "stone_brick_stairs",
        "type": "minecraft:stone_brick_stairs",
        "path": ""
    },
    {
        "names": "石头按钮",
        "name": "stone_button",
        "type": "minecraft:stone_button",
        "path": ""
    },
    {
        "names": "石锄",
        "name": "stone_hoe",
        "type": "minecraft:stone_hoe",
        "path": "textures/items/stone_hoe.png"
    },
    {
        "names": "石镐",
        "name": "stone_pickaxe",
        "type": "minecraft:stone_pickaxe",
        "path": "textures/items/stone_pickaxe.png"
    },
    {
        "names": "石头压力板",
        "name": "stone_pressure_plate",
        "type": "minecraft:stone_pressure_plate",
        "path": ""
    },
    {
        "names": "石锹",
        "name": "stone_shovel",
        "type": "minecraft:stone_shovel",
        "path": "textures/items/stone_shovel.png"
    },
    {
        "names": "平滑石头台阶/砂岩台阶/石化橡木台阶/圆石台阶/砖台阶/石砖台阶/石英台阶/下界砖台阶",
        "name": "stone_slab",
        "type": "minecraft:stone_slab",
        "path": ""
    },
    {
        "names": "红砂岩台阶/紫珀台阶/海晶石台阶/暗海晶石台阶/海晶石砖台阶/苔石台阶/平滑砂岩台阶/红色下界砖台阶",
        "name": "stone_slab2",
        "type": "minecraft:stone_slab2",
        "path": ""
    },
    {
        "names": "末地石砖台阶/平滑红砂岩台阶/磨制安山岩台阶/安山岩台阶/闪长岩台阶/磨制闪长岩台阶/花岗岩台阶/磨制花岗岩台阶",
        "name": "stone_slab3",
        "type": "minecraft:stone_slab3",
        "path": ""
    },
    {
        "names": "苔石砖台阶/平滑石英台阶/石头台阶/切制砂岩台阶/切制红砂岩台阶",
        "name": "stone_slab4",
        "type": "minecraft:stone_slab4",
        "path": ""
    },
    {
        "names": "石头楼梯",
        "name": "stone_stairs",
        "type": "minecraft:stone_stairs",
        "path": ""
    },
    {
        "names": "石剑",
        "name": "stone_sword",
        "type": "minecraft:stone_sword",
        "path": "textures/items/stone_sword.png"
    },
    {
        "names": "石砖/苔石砖/裂纹石砖/錾制石砖",
        "name": "stonebrick",
        "type": "minecraft:stonebrick",
        "path": ""
    },
    {
        "names": "切石机",
        "name": "stonecutter_block",
        "type": "minecraft:stonecutter_block",
        "path": ""
    },
    {
        "names": "流浪者刷怪蛋",
        "name": "stray_spawn_egg",
        "type": "minecraft:stray_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "炽足兽刷怪蛋",
        "name": "strider_spawn_egg",
        "type": "minecraft:strider_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "线",
        "name": "string",
        "type": "minecraft:string",
        "path": "textures/items/string.png"
    },
    {
        "names": "去皮金合欢原木",
        "name": "stripped_acacia_log",
        "type": "minecraft:stripped_acacia_log",
        "path": ""
    },
    {
        "names": "去皮白桦原木",
        "name": "stripped_birch_log",
        "type": "minecraft:stripped_birch_log",
        "path": ""
    },
    {
        "names": "去皮绯红菌核",
        "name": "stripped_crimson_hyphae",
        "type": "minecraft:stripped_crimson_hyphae",
        "path": ""
    },
    {
        "names": "去皮绯红菌柄",
        "name": "stripped_crimson_stem",
        "type": "minecraft:stripped_crimson_stem",
        "path": ""
    },
    {
        "names": "去皮深色橡木原木",
        "name": "stripped_dark_oak_log",
        "type": "minecraft:stripped_dark_oak_log",
        "path": ""
    },
    {
        "names": "去皮丛林原木",
        "name": "stripped_jungle_log",
        "type": "minecraft:stripped_jungle_log",
        "path": ""
    },
    {
        "names": "去皮橡木原木",
        "name": "stripped_oak_log",
        "type": "minecraft:stripped_oak_log",
        "path": ""
    },
    {
        "names": "去皮云杉原木",
        "name": "stripped_spruce_log",
        "type": "minecraft:stripped_spruce_log",
        "path": ""
    },
    {
        "names": "去皮诡异菌核",
        "name": "stripped_warped_hyphae",
        "type": "minecraft:stripped_warped_hyphae",
        "path": ""
    },
    {
        "names": "去皮诡异菌柄",
        "name": "stripped_warped_stem",
        "type": "minecraft:stripped_warped_stem",
        "path": ""
    },
    {
        "names": "结构方块",
        "name": "structure_block",
        "type": "minecraft:structure_block",
        "path": ""
    },
    {
        "names": "结构空位",
        "name": "structure_void",
        "type": "minecraft:structure_void",
        "path": ""
    },
    {
        "names": "糖",
        "name": "sugar",
        "type": "minecraft:sugar",
        "path": "textures/items/sugar.png"
    },
    {
        "names": "甘蔗",
        "name": "sugar_cane",
        "type": "minecraft:sugar_cane",
        "path": "textures/items/reeds.png"
    },
    {
        "names": "迷之炖菜",
        "name": "suspicious_stew",
        "type": "minecraft:suspicious_stew",
        "path": "textures/items/suspicious_stew.png"
    },
    {
        "names": "甜浆果",
        "name": "sweet_berries",
        "type": "minecraft:sweet_berries",
        "path": "textures/items/sweet_berries.png"
    },
    {
        "names": "蕨/草",
        "name": "fallgrass",
        "type": "minecraft:fallgrass",
        "path": ""
    },
    {
        "names": "标靶",
        "name": "farget",
        "type": "minecraft:farget",
        "path": ""
    },
    {
        "names": "遮光玻璃",
        "name": "tinted_glass",
        "type": "minecraft:tinted_glass",
        "path": ""
    },
    {
        "names": "TNT",
        "name": "tnt",
        "type": "minecraft:tnt",
        "path": ""
    },
    {
        "names": "TNT矿车",
        "name": "tnt_minecart",
        "type": "minecraft:tnt_minecart",
        "path": "textures/items/minecart_tnt.png"
    },
    {
        "names": "火把",
        "name": "torch",
        "type": "minecraft:torch",
        "path": ""
    },
    {
        "names": "不死图腾",
        "name": "totem_of_undying",
        "type": "minecraft:totem_of_undying",
        "path": "textures/items/totem.png"
    },
    {
        "names": "活板门",
        "name": "trapdoor",
        "type": "minecraft:trapdoor",
        "path": ""
    },
    {
        "names": "陷阱箱",
        "name": "trapped_chest",
        "type": "minecraft:trapped_chest",
        "path": ""
    },
    {
        "names": "三叉戟",
        "name": "trident",
        "type": "minecraft:trident",
        "path": "textures/items/trident.png"
    },
    {
        "names": "绊线钩",
        "name": "tripwire_hook",
        "type": "minecraft:tripwire_hook",
        "path": ""
    },
    {
        "names": "热带鱼",
        "name": "tropical_fish",
        "type": "minecraft:tropical_fish",
        "path": "textures/items/fish_clownfish_raw.png"
    },
    {
        "names": "热带鱼桶",
        "name": "tropical_fish_bucket",
        "type": "minecraft:tropical_fish_bucket",
        "path": "textures/items/bucket_tropical.png"
    },
    {
        "names": "热带鱼刷怪蛋",
        "name": "tropical_fish_spawn_egg",
        "type": "minecraft:tropical_fish_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "凝灰岩",
        "name": "tuff",
        "type": "minecraft:tuff",
        "path": ""
    },
    {
        "names": "海龟蛋",
        "name": "turtle_egg",
        "type": "minecraft:turtle_egg",
        "path": "textures/items/turtle_egg.png"
    },
    {
        "names": "海龟壳",
        "name": "turtle_helmet",
        "type": "minecraft:turtle_helmet",
        "path": "textures/items/turtle_helmet.png"
    },
    {
        "names": "海龟刷怪蛋",
        "name": "turtle_spawn_egg",
        "type": "minecraft:turtle_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "缠怨藤",
        "name": "twisting_vines",
        "type": "minecraft:twisting_vines",
        "path": ""
    },
    {
        "names": "潜影盒",
        "name": "undyed_shulker_box",
        "type": "minecraft:undyed_shulker_box",
        "path": ""
    },
    {
        "names": "恼鬼刷怪蛋",
        "name": "vex_spawn_egg",
        "type": "minecraft:vex_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "村民刷怪蛋",
        "name": "villager_spawn_egg",
        "type": "minecraft:villager_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "卫道士刷怪蛋",
        "name": "vindicator_spawn_egg",
        "type": "minecraft:vindicator_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "藤蔓",
        "name": "vine",
        "type": "minecraft:vine",
        "path": ""
    },
    {
        "names": "流浪商人刷怪蛋",
        "name": "wandering_trader_spawn_egg",
        "type": "minecraft:wandering_trader_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "诡异木按钮",
        "name": "warped_button",
        "type": "minecraft:warped_button",
        "path": ""
    },
    {
        "names": "诡异木门",
        "name": "warped_door",
        "type": "minecraft:warped_door",
        "path": "textures/items/door_wood.png"
    },
    {
        "names": "诡异木栅栏",
        "name": "warped_fence",
        "type": "minecraft:warped_fence",
        "path": ""
    },
    {
        "names": "诡异木栅栏门",
        "name": "warped_fence_gate",
        "type": "minecraft:warped_fence_gate",
        "path": ""
    },
    {
        "names": "诡异菌",
        "name": "warped_fungus",
        "type": "minecraft:warped_fungus",
        "path": ""
    },
    {
        "names": "诡异菌钓竿",
        "name": "warped_fungus_on_a_stick",
        "type": "minecraft:warped_fungus_on_a_stick",
        "path": "textures/items/warped_fungus_on_a_stick.png"
    },
    {
        "names": "诡异菌核",
        "name": "warped_hyphae",
        "type": "minecraft:warped_hyphae",
        "path": ""
    },
    {
        "names": "诡异菌岩",
        "name": "warped_nylium",
        "type": "minecraft:warped_nylium",
        "path": ""
    },
    {
        "names": "诡异木板",
        "name": "warped_planks",
        "type": "minecraft:warped_planks",
        "path": ""
    },
    {
        "names": "诡异木压力板",
        "name": "warped_pressure_plate",
        "type": "minecraft:warped_pressure_plate",
        "path": ""
    },
    {
        "names": "诡异菌索",
        "name": "warped_roots",
        "type": "minecraft:warped_roots",
        "path": ""
    },
    {
        "names": "诡异木告示牌",
        "name": "warped_sign",
        "type": "minecraft:warped_sign",
        "path": "textures/items/sign.png"
    },
    {
        "names": "诡异木台阶",
        "name": "warped_slab",
        "type": "minecraft:warped_slab",
        "path": ""
    },
    {
        "names": "诡异木楼梯",
        "name": "warped_stairs",
        "type": "minecraft:warped_stairs",
        "path": ""
    },
    {
        "names": "诡异菌柄",
        "name": "warped_stem",
        "type": "minecraft:warped_stem",
        "path": ""
    },
    {
        "names": "诡异木活板门",
        "name": "warped_trapdoor",
        "type": "minecraft:warped_trapdoor",
        "path": ""
    },
    {
        "names": "诡异疣块",
        "name": "warped_wart_block",
        "type": "minecraft:warped_wart_block",
        "path": ""
    },
    {
        "names": "水桶",
        "name": "water_bucket",
        "type": "minecraft:water_bucket",
        "path": "textures/items/bucket_water.png"
    },
    {
        "names": "睡莲",
        "name": "waterlily",
        "type": "minecraft:waterlily",
        "path": ""
    },
    {
        "names": "涂蜡铜块",
        "name": "waxed_copper",
        "type": "minecraft:waxed_copper",
        "path": ""
    },
    {
        "names": "涂蜡切制铜块",
        "name": "waxed_cut_copper",
        "type": "minecraft:waxed_cut_copper",
        "path": ""
    },
    {
        "names": "涂蜡切制铜台阶",
        "name": "waxed_cut_copper_slab",
        "type": "minecraft:waxed_cut_copper_slab",
        "path": ""
    },
    {
        "names": "涂蜡切制铜楼梯",
        "name": "waxed_cut_copper_stairs",
        "type": "minecraft:waxed_cut_copper_stairs",
        "path": ""
    },
    {
        "names": "斑驳的涂蜡铜块",
        "name": "waxed_exposed_copper",
        "type": "minecraft:waxed_exposed_copper",
        "path": ""
    },
    {
        "names": "斑驳的涂蜡切制铜块",
        "name": "waxed_exposed_cut_copper",
        "type": "minecraft:waxed_exposed_cut_copper",
        "path": ""
    },
    {
        "names": "斑驳的涂蜡切制铜台阶",
        "name": "waxed_exposed_cut_copper_slab",
        "type": "minecraft:waxed_exposed_cut_copper_slab",
        "path": ""
    },
    {
        "names": "斑驳的涂蜡切制铜楼梯",
        "name": "waxed_exposed_cut_copper_stairs",
        "type": "minecraft:waxed_exposed_cut_copper_stairs",
        "path": ""
    },
    {
        "names": "氧化的涂蜡铜块",
        "name": "waxed_oxidized_copper",
        "type": "minecraft:waxed_oxidized_copper",
        "path": ""
    },
    {
        "names": "氧化的涂蜡切制铜块",
        "name": "waxed_oxidized_cut_copper",
        "type": "minecraft:waxed_oxidized_cut_copper",
        "path": ""
    },
    {
        "names": "氧化的涂蜡切制铜台阶",
        "name": "waxed_oxidized_cut_copper_slab",
        "type": "minecraft:waxed_oxidized_cut_copper_slab",
        "path": ""
    },
    {
        "names": "氧化的涂蜡切制铜楼梯",
        "name": "waxed_oxidized_cut_copper_stairs",
        "type": "minecraft:waxed_oxidized_cut_copper_stairs",
        "path": ""
    },
    {
        "names": "锈蚀的涂蜡铜块",
        "name": "waxed_weathered_copper",
        "type": "minecraft:waxed_weathered_copper",
        "path": ""
    },
    {
        "names": "锈蚀的涂蜡切制铜块",
        "name": "waxed_weathered_cut_copper",
        "type": "minecraft:waxed_weathered_cut_copper",
        "path": ""
    },
    {
        "names": "锈蚀的涂蜡切制铜台阶",
        "name": "waxed_weathered_cut_copper_slab",
        "type": "minecraft:waxed_weathered_cut_copper_slab",
        "path": ""
    },
    {
        "names": "锈蚀的涂蜡切制铜楼梯",
        "name": "waxed_weathered_cut_copper_stairs",
        "type": "minecraft:waxed_weathered_cut_copper_stairs",
        "path": ""
    },
    {
        "names": "锈蚀的铜块",
        "name": "weathered_copper",
        "type": "minecraft:weathered_copper",
        "path": ""
    },
    {
        "names": "锈蚀的切制铜块",
        "name": "weathered_cut_copper",
        "type": "minecraft:weathered_cut_copper",
        "path": ""
    },
    {
        "names": "锈蚀的切制铜台阶",
        "name": "weathered_cut_copper_slab",
        "type": "minecraft:weathered_cut_copper_slab",
        "path": ""
    },
    {
        "names": "锈蚀的切制铜楼梯",
        "name": "weathered_cut_copper_stairs",
        "type": "minecraft:weathered_cut_copper_stairs",
        "path": ""
    },
    {
        "names": "蜘蛛网",
        "name": "web",
        "type": "minecraft:web",
        "path": ""
    },
    {
        "names": "垂泪藤",
        "name": "weeping_vines",
        "type": "minecraft:weeping_vines",
        "path": ""
    },
    {
        "names": "小麦",
        "name": "wheat",
        "type": "minecraft:wheat",
        "path": "textures/items/wheat.png"
    },
    {
        "names": "小麦种子",
        "name": "wheat_seeds",
        "type": "minecraft:wheat_seeds",
        "path": "textures/items/seeds_wheat.png"
    },
    {
        "names": "白色蜡烛",
        "name": "white_candle",
        "type": "minecraft:white_candle",
        "path": ""
    },
    {
        "names": "白色染料",
        "name": "white_dye",
        "type": "minecraft:white_dye",
        "path": "textures/items/dye_powder_white_new.png"
    },
    {
        "names": "白色带釉陶瓦",
        "name": "white_glazed_terracotta",
        "type": "minecraft:white_glazed_terracotta",
        "path": ""
    },
    {
        "names": "女巫刷怪蛋",
        "name": "witch_spawn_egg",
        "type": "minecraft:witch_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "凋零玫瑰",
        "name": "wither_rose",
        "type": "minecraft:wither_rose",
        "path": ""
    },
    {
        "names": "凋灵骷髅刷怪蛋",
        "name": "wither_skeleton_spawn_egg",
        "type": "minecraft:wither_skeleton_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "狼刷怪蛋",
        "name": "wolf_spawn_egg",
        "type": "minecraft:wolf_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "橡木/云杉木/白桦木/丛林木/金合欢木/深色橡木/去皮橡木/去皮云杉木/去皮白桦木/去皮丛林木/去皮金合欢木/去皮深色橡木",
        "name": "wood",
        "type": "minecraft:wood",
        "path": ""
    },
    {
        "names": "木斧",
        "name": "wooden_axe",
        "type": "minecraft:wooden_axe",
        "path": "textures/items/wood_axe.png"
    },
    {
        "names": "橡木按钮",
        "name": "wooden_button",
        "type": "minecraft:wooden_button",
        "path": ""
    },
    {
        "names": "橡木门",
        "name": "wooden_door",
        "type": "minecraft:wooden_door",
        "path": "textures/items/door_wood.png"
    },
    {
        "names": "木锄",
        "name": "wooden_hoe",
        "type": "minecraft:wooden_hoe",
        "path": "textures/items/wood_hoe.png"
    },
    {
        "names": "木镐",
        "name": "wooden_pickaxe",
        "type": "minecraft:wooden_pickaxe",
        "path": "textures/items/wood_pickaxe.png"
    },
    {
        "names": "橡木压力板",
        "name": "wooden_pressure_plate",
        "type": "minecraft:wooden_pressure_plate",
        "path": ""
    },
    {
        "names": "木锹",
        "name": "wooden_shovel",
        "type": "minecraft:wooden_shovel",
        "path": "textures/items/wood_shovel.png"
    },
    {
        "names": "橡木台阶/云杉木台阶/白桦木台阶/丛林木台阶/金合欢木台阶/深色橡木台阶",
        "name": "wooden_slab",
        "type": "minecraft:wooden_slab",
        "path": ""
    },
    {
        "names": "木剑",
        "name": "wooden_sword",
        "type": "minecraft:wooden_sword",
        "path": "textures/items/wood_sword.png"
    },
    {
        "names": "羊毛",
        "name": "wool",
        "type": "minecraft:wool",
        "path": ""
    },
    {
        "names": "书与笔",
        "name": "writable_book",
        "type": "minecraft:writable_book",
        "path": "textures/items/book_writable.png"
    },
    {
        "names": "黄色蜡烛",
        "name": "yellow_candle",
        "type": "minecraft:yellow_candle",
        "path": ""
    },
    {
        "names": "黄色染料",
        "name": "yellow_dye",
        "type": "minecraft:yellow_dye",
        "path": "textures/items/dye_powder_yellow.png"
    },
    {
        "names": "蒲公英",
        "name": "yellow_flower",
        "type": "minecraft:yellow_flower",
        "path": ""
    },
    {
        "names": "黄色带釉陶瓦",
        "name": "yellow_glazed_terracotta",
        "type": "minecraft:yellow_glazed_terracotta",
        "path": ""
    },
    {
        "names": "僵尸疣猪兽刷怪蛋",
        "name": "zoglin_spawn_egg",
        "type": "minecraft:zoglin_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "僵尸马刷怪蛋",
        "name": "zombie_horse_spawn_egg",
        "type": "minecraft:zombie_horse_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "僵尸猪人刷怪蛋",
        "name": "zombie_pigman_spawn_egg",
        "type": "minecraft:zombie_pigman_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "僵尸刷怪蛋",
        "name": "zombie_spawn_egg",
        "type": "minecraft:zombie_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "僵尸村民刷怪蛋",
        "name": "zombie_villager_spawn_egg",
        "type": "minecraft:zombie_villager_spawn_egg",
        "path": "textures/items/egg_cat.png"
    },
    {
        "names": "金合欢木运输船",
        "name": "acacia_chest_boat",
        "type": "minecraft:acacia_chest_boat",
        "path": ""
    },
    {
        "names": "悦灵刷怪蛋",
        "name": "allay_spawn_egg",
        "type": "minecraft:allay_spawn_egg",
        "path": ""
    },
    {
        "names": "白桦木运输船",
        "name": "birch_chest_boat",
        "type": "minecraft:birch_chest_boat",
        "path": ""
    },
    {
        "names": "深色橡木运输船",
        "name": "dark_oak_chest_boat",
        "type": "minecraft:dark_oak_chest_boat",
        "path": ""
    },
    {
        "names": "青蛙卵",
        "name": "frog_spawn",
        "type": "minecraft:frog_spawn",
        "path": ""
    },
    {
        "names": "青蛙刷怪蛋",
        "name": "frog_spawn_egg",
        "type": "minecraft:frog_spawn_egg",
        "path": ""
    },
    {
        "names": "丛林木运输船",
        "name": "jungle_chest_boat",
        "type": "minecraft:jungle_chest_boat",
        "path": ""
    },
    {
        "names": "红树木船",
        "name": "mangrove_boat",
        "type": "minecraft:mangrove_boat",
        "path": ""
    },
    {
        "names": "红树木按钮",
        "name": "mangrove_button",
        "type": "minecraft:mangrove_button",
        "path": ""
    },
    {
        "names": "",
        "name": "mangrove_chest_boat",
        "type": "minecraft:mangrove_chest_boat",
        "path": ""
    },
    {
        "names": "红树木门",
        "name": "mangrove_door",
        "type": "minecraft:mangrove_door",
        "path": ""
    },
    {
        "names": "红树木栅栏",
        "name": "mangrove_fence",
        "type": "minecraft:mangrove_fence",
        "path": ""
    },
    {
        "names": "红树木栅栏门",
        "name": "mangrove_fence_gate",
        "type": "minecraft:mangrove_fence_gate",
        "path": ""
    },
    {
        "names": "红树树叶",
        "name": "mangrove_leaves",
        "type": "minecraft:mangrove_leaves",
        "path": ""
    },
    {
        "names": "红树原木",
        "name": "mangrove_log",
        "type": "minecraft:mangrove_log",
        "path": ""
    },
    {
        "names": "红树木板",
        "name": "mangrove_planks",
        "type": "minecraft:mangrove_planks",
        "path": ""
    },
    {
        "names": "红树木压力板",
        "name": "mangrove_pressure_plate",
        "type": "minecraft:mangrove_pressure_plate",
        "path": ""
    },
    {
        "names": "红树胎生苗",
        "name": "mangrove_propagule",
        "type": "minecraft:mangrove_propagule",
        "path": ""
    },
    {
        "names": "红树根",
        "name": "mangrove_roots",
        "type": "minecraft:mangrove_roots",
        "path": ""
    },
    {
        "names": "红树木告示牌",
        "name": "mangrove_sign",
        "type": "minecraft:mangrove_sign",
        "path": ""
    },
    {
        "names": "红树木台阶",
        "name": "mangrove_slab",
        "type": "minecraft:mangrove_slab",
        "path": ""
    },
    {
        "names": "红树木楼梯",
        "name": "mangrove_stairs",
        "type": "minecraft:mangrove_stairs",
        "path": ""
    },
    {
        "names": "红树木活板门",
        "name": "mangrove_trapdoor",
        "type": "minecraft:mangrove_trapdoor",
        "path": ""
    },
    {
        "names": "红树木",
        "name": "mangrove_wood",
        "type": "minecraft:mangrove_wood",
        "path": ""
    },
    {
        "names": "泥巴",
        "name": "mud",
        "type": "minecraft:mud",
        "path": ""
    },
    {
        "names": "泥砖台阶",
        "name": "mud_brick_slab",
        "type": "minecraft:mud_brick_slab",
        "path": ""
    },
    {
        "names": "泥砖楼梯",
        "name": "mud_brick_stairs",
        "type": "minecraft:mud_brick_stairs",
        "path": ""
    },
    {
        "names": "泥砖墙",
        "name": "mud_brick_wall",
        "type": "minecraft:mud_brick_wall",
        "path": ""
    },
    {
        "names": "泥砖",
        "name": "mud_bricks",
        "type": "minecraft:mud_bricks",
        "path": ""
    },
    {
        "names": "沾泥的红树根",
        "name": "muddy_mangrove_roots",
        "type": "minecraft:muddy_mangrove_roots",
        "path": ""
    },
    {
        "names": "橡木运输船",
        "name": "oak_chest_boat",
        "type": "minecraft:oak_chest_boat",
        "path": ""
    },
    {
        "names": "赭黄蛙明灯",
        "name": "ochre_froglight",
        "type": "minecraft:ochre_froglight",
        "path": ""
    },
    {
        "names": "泥坯",
        "name": "packed_mud",
        "type": "minecraft:packed_mud",
        "path": ""
    },
    {
        "names": "珠光蛙明灯",
        "name": "pearlescent_froglight",
        "type": "minecraft:pearlescent_froglight",
        "path": ""
    },
    {
        "names": "强化深板岩",
        "name": "reinforced_deepslate",
        "type": "minecraft:reinforced_deepslate",
        "path": ""
    },
    {
        "names": "幽匿块",
        "name": "sculk",
        "type": "minecraft:sculk",
        "path": ""
    },
    {
        "names": "幽匿催发体",
        "name": "sculk_catalyst",
        "type": "minecraft:sculk_catalyst",
        "path": ""
    },
    {
        "names": "幽匿感测体",
        "name": "sculk_sensor",
        "type": "minecraft:sculk_sensor",
        "path": ""
    },
    {
        "names": "幽匿尖啸体",
        "name": "sculk_shrieker",
        "type": "minecraft:sculk_shrieker",
        "path": ""
    },
    {
        "names": "幽匿脉络",
        "name": "sculk_vein",
        "type": "minecraft:sculk_vein",
        "path": ""
    },
    {
        "names": "云杉木运输船",
        "name": "spruce_chest_boat",
        "type": "minecraft:spruce_chest_boat",
        "path": ""
    },
    {
        "names": "去皮红树原木",
        "name": "stripped_mangrove_log",
        "type": "minecraft:stripped_mangrove_log",
        "path": ""
    },
    {
        "names": "去皮红树木",
        "name": "stripped_mangrove_wood",
        "type": "minecraft:stripped_mangrove_wood",
        "path": ""
    },
    {
        "names": "蝌蚪桶",
        "name": "fadpole_bucket",
        "type": "minecraft:fadpole_bucket",
        "path": ""
    },
    {
        "names": "蝌蚪刷怪蛋",
        "name": "fadpole_spawn_egg",
        "type": "minecraft:fadpole_spawn_egg",
        "path": ""
    },
    {
        "names": "青翠蛙明灯",
        "name": "verdant_froglight",
        "type": "minecraft:verdant_froglight",
        "path": ""
    },
    {
        "names": "监守者刷怪蛋",
        "name": "warden_spawn_egg",
        "type": "minecraft:warden_spawn_egg",
        "path": ""
    }
];

const config = {
    get(key) {
        config_data.reload();
        if (key == null)
            return JSON.parse(config_data.read());
        else
            return config_data.get(key);
    },
    getVersion() { return config.get().version },
    getHistoryData() { return this.get().history_data },
    getDailyAddData() { return this.get().daily_add_data },
    set(object) {
        let key_list = Object.keys(object);
        key_list.forEach((key) => {
            config_data.set(key, object[key]);
        });
    },
    initial() {
        if (fixvers != "") var fix_varsion = `${versions} ${fixvers}`; else var fix_varsion = versions;
        this.set({
            "version": fix_varsion,
            "history_data": 0,
            "daily_add_data": 0
        })
    },
    update() {
        if (fixvers != "") var fix_varsion = `${versions} ${fixvers}`; else var fix_varsion = versions;
        if (File.exists(`./plugins/Planet/PLibrary/iteminfodata.json`))
            File.delete(`./plugins/Planet/PLibrary/iteminfodata.json`);
        if (config.getVersion() < fix_varsion) {
            if (File.exists("./plugins/Planet/PLibrary/itemdata.json")) {
                let item_datas = new JsonConfigFile("./plugins/Planet/PLibrary/itemdata.json");
                item_datas = JSON.parse(item_datas.read());
                item_datas.forEach((data, index) => {
                    item_datas.splice(index, 1, { names: data.chinese, name: data.type.split(":")[1], type: data.type, path: data.path });
                });
                item_data.write(JSON.stringify(item_datas, null, 4));
                File.delete("./plugins/Planet/PLibrary/itemdata.json");
            };
            if (File.exists("./plugins/Planet/PLibrary/lizidata.json")) {
                let lizi_datas = new JsonConfigFile("./plugins/Planet/PLibrary/lizidata.json");
                lizi_datas = JSON.parse(lizi_datas.read());
                lizi_datas.forEach((data, index) => {
                    lizi_datas.splice(index, 1, { names: data.liziname, name: data.lizimcid.split(":")[1], type: data.lizimcid });
                });
                lizi_data.write(JSON.stringify(lizi_datas, null, 4));
                File.delete("./plugins/Planet/PLibrary/lizidata.json");
            };
            if (File.exists("./plugins/Planet/Player/Playerdata.json")) {
                let player_data = new JsonConfigFile("./plugins/Planet/Player/Playerdata.json");
                player_data = JSON.parse(player_data.read());
                player_data.forEach((data, index) => {
                    if (data.qqid == 0) data.qqid = null
                    player_data.splice(index, 1, { qq: data.qqid, channel: data.pdid || null, name: data.gameid, xuid: data.xuid, bind_time: data.bindtime, first_join: data.firstjoin })
                });
                bind_data.write(JSON.stringify(player_data, null, 4));
                File.delete("./plugins/Planet/Player");
            }
            config.set({ version: fix_varsion, });
            colorLog("red", "当前配置文件版本低于插件版本,已更新");
        } else if (config.getVersion() > fix_varsion) { colorLog("red", "当前配置文件版本高于插件版本插件可能存在问题,请删除config.json重启服务器") };
        if (this.getHistoryData() == null) {
            this.set({ history_data: config_data.get("historydata"), daily_add_data: config_data.get("dailyadddata") })
        };
    }
};
const cmd = {
    register(list) {
        list.forEach((list) => {
            let command = mc.newCommand(list.cmd, list.des, list.per);
            command.setAlias(list.des);
            command.overload([]);
            command.setCallback((_cmd, ori, out, res) => {
                if (list.cmd == "plist")
                    lib.online_list()
                else if (ori.type == 0) {
                    if (list.cmd == "plib")
                        player.main(ori.player);
                } else if (ori.type == 1) {
                    out.error(`${info}§c请不要在命令方块中使用命令`);
                } else { out.error(`${info}§c请不要在控制台使用命令`) };
            });
            command.setup();
        });
    }
};
const docking = {
    PAPI: ll.listPlugins().includes("BEPlaceholderAPI"),
    GMLIB: File.exists("./plugins/GMLIB-LegacyRemoteCallApi/GMLIB-LegacyRemoteCallApi.dll"),
    PAPIjs() {
        if (this.PAPI)
            return require('./lib/BEPlaceholderAPI-JS.js').PAPI
        else
            return require("./GMLIB-LegacyRemoteCallApi/lib/BEPlaceholderAPI-JS").PAPI;
    },
    PBind() {
        let PBind_file = ll.listPlugins().includes("PBind")
        if (!PBind_file)
            return File.exists("./plugins/PBind.llse/PBind.llse.js");
        else
            return ll.listPlugins().includes("PBind")
    }
};
const db = {
    get: (key) => { return new_player_db.get(key) },
    set: (key, array) => { new_player_db.set(key, array) },
    getKeyAll: () => { return new_player_db.listKey() },
    getDailyadd: () => { return new_player_db.get(lib.date()) },
    setDailyadd: (array) => { new_player_db.set(lib.date(), array) }
};
const lib = {
    getBuff(buff) {
        const buff_obje = {};
        buff_obj.forEach((data) => {
            buff_obje[data.name] = data;
            buff_obje[data.number_id] = data;
        })
        if (buff == null)
            return buff_obj;
        else
            return buff_obje[buff];
    },
    getLizi(lizi) {
        lizi_data.reload();
        const lizi_obje = {};
        let lizi_json = JSON.parse(lizi_data.read());
        lizi_obj.forEach((list) => {
            lizi_json.push(list);
        });
        lizi_json.forEach((data) => {
            lizi_obje[data.name] = data;
            lizi_obje[data.type] = data;
        })
        if (lizi == null)
            return lizi_obj;
        else
            return lizi_obje[lizi];
    },
    getItem(item) {
        item_data.reload();
        const item_obje = {};
        let item_json = JSON.parse(item_data.read());
        item_obj.forEach((item) => {
            item_json.push(item);
        });
        item_json.forEach((data) => {
            item_obje[data.name] = data;
            item_obje[data.type] = data;
        });
        if (item == null)
            return item_obj;
        else
            return item_obje[item];
    },
    getBind(bind, type) {
        bind_data.reload();
        const bind_obje = {};
        let bind_json = JSON.parse(bind_data.read());
        bind_json.forEach((data) => {
            if (type == "qq")
                bind_obje[data.qq] = data;
            if (type == "channel")
                bind_obje[data.channel] = data;
            if (type == "xuid")
                bind_obje[data.xuid] = data;
            bind_obje[data.name] = data;
        })
        if (bind == null)
            return bind_json;
        else if (type == "qq")
            return bind_obje[bind];
        else
            return bind_obje[bind];
    },
    setBind(data) {
        bind_data.reload();
        bind_data.write(JSON.stringify(data, null, 4))
    },
    online_list() {
        let server_properties = File.readFrom("./server.properties")
        server_properties = String(server_properties)
        let varList = server_properties.match(/[0-9a-zA-Z-]{1,100}=[0-9a-zA-Z-]{1,100}/g) || []
        let varObj = {};
        varList.forEach((varList) => {
            let arr = varList.split("=")
            varObj[arr[0]] = arr[1]
        })
        let online_player = mc.getOnlinePlayers();
        let online = "";
        if (!online_player.length) {
            online = "无,";
        } else {
            online_player.forEach((player) => {
                online += `${player.realName},`
            });
        };
        log(`[LS] RS: ${online_player.length}/${varObj["max-players"]} PL: ${online.slice(0, -1)}`);
    },
    date() {
        let objtime = system.getTimeObj();
        return `${objtime.Y}-${objtime.M.toString().padStart(2, '0')}-${objtime.D.toString().padStart(2, '0')}`;
    },
    automatic_cycle() {
        let day = system.getTimeObj().D;
        setInterval(() => {
            if (day != system.getTimeObj().D) {
                config.set({ daily_add_data: 0 })
            };
            if (db.get(this.date()) == null) { db.setDailyadd([]); config.set({ daily_add_data: 0 }) };
        }, 1000);
    },
    initial() {
        lizi_data.write(JSON.stringify([{ "names": "黑药水气泡", "name": "arrow_spell_emitter", "type": "minecraft:arrow_spell_emitter" }], null, 4))
        item_data.write(JSON.stringify([{ "names": "示范", "name": "test", "type": "minecraft:test", "path": "textures/items/apple.png" }], null, 4))
    }
};
const new_player = {
    add(_player) {
        let history = db.get("history") || [];
        if (!history.includes(_player.realName)) {
            history.push(_player.realName);
            db.set("history", history)
            let history_data = Number(config.getHistoryData()) + 1;
            let daily_add_data = Number(config.getDailyAddData()) + 1;
            config.set({ history_data: history_data, daily_add_data: daily_add_data });
            let daily_add = db.getDailyadd() || [];
            daily_add.splice(0, 0, `${_player.realName} 时间: ${system.getTimeStr()}`);
            db.setDailyadd(daily_add);
        };
    }
};
const papi = {
    regHistory() {
        return String(config.getHistoryData());
    },
    retDailyAdd() {
        return String(config.getDailyAddData());
    }
};

const player = {
    main(_player) {
        let fm = mc.newSimpleForm();
        fm.setTitle("数据库");
        fm.setContent("选择:");
        fm.addButton("查询今日新玩家数据");
        fm.addButton("查询历史新玩家数据");
        _player.sendForm(fm, (_player, id) => {
            switch (id) {
                case 0:
                    this.query_today(_player, "today");
                    break;
                case 1:
                    this.query_history(_player);
                    break;
            };
        });
    },
    query_today(_player, type, date) {
        if (type == "today") {
            date = lib.date();
            var title = "今日新玩家";
        } else {
            var title = `历史新玩家 时间${date}`;
        }
        let db_data = db.get(date);
        let daily_add = `当日新玩家: ${db_data.length}个 总玩家: ${config.getHistoryData()}个\n`;
        db_data.forEach((data) => {
            daily_add += `${data}\n`
        })
        let fm = mc.newSimpleForm();
        fm.setTitle(title);
        fm.setContent(daily_add);
        _player.sendForm(fm, (_player, id) => {
            if (type == "today")
                this.main(_player);
            else
                this.query_history(_player);
        });
    },
    query_history(_player) {
        let data_key = db.getKeyAll();
        data_key.splice(data_key.indexOf("history"))
        let key_list = [];
        data_key.forEach((key) => {
            if (db.get(key).length)
                key_list.push(key);
        });
        key_list.forEach((key, index) => {
            let interval = (new Date(lib.date()).getTime() - new Date(key).getTime()) / (1000 * 60 * 60 * 24);
            key_list.splice(index, 1, { key: key, day: Math.ceil(interval) });
        })
        key_list.sort((a, b) => { return a.day - b.day })
        let fm = mc.newSimpleForm();
        fm.setTitle("历史新玩家");
        fm.setContent("选择时间:");
        key_list.forEach((list) => {
            fm.addButton(`时间: ${list.key}\n数量: ${db.get(list.key).length}个`)
        });
        _player.sendForm(fm, (_player, id) => {
            if (id == null) {
                this.main(_player)
            } else { this.query_today(_player, "history", key_list[id].key) }
        });
    }
};

// 全新的接口 
ll.export(config.getVersion, "PLib", "version");
ll.export(lib.getBind, "PLib", "bind");
ll.export(lib.getBuff, "PLib", "buff");
ll.export(lib.getLizi, "PLib", "lizi");
ll.export(lib.getItem, "PLib", "item");

//为向下兼容旧接口而保留
const out = {
    version() { return "1111" },
    getBuff() {
        let buff_data = lib.getBuff();
        buff_data.forEach((data) => {
            data["buffname"] = data.names;
            data["buffmcid"] = data.name;
            data["numberid"] = data.number_id;
        });
        return buff_data;
    },
    getBuffInfo(buff) {
        let buff_data = out.getBuff();
        let buff_obj = {}
        buff_data.forEach((data) => {
            buff_obj[data.name] = data;
        })
        return buff_obj[buff]
    },
    getLizi() {
        let lizi_data = lib.getLizi()
        lizi_data.forEach((data) => {
            data["lizname"] = data.names;
            data["lizimcid"] = data.type;
        })
        return lizi_data
    },
    getLiziInfo(lizi) {
        let lizi_data = out.getLizi();
        let lizi_obj = {}
        lizi_data.forEach((data) => {
            lizi_obj[data.name] = data;
            lizi_obj[data.type] = data;
        })
        return lizi_obj[lizi]
    },
    getItem() {
        let item_data = lib.getItem();
        item_data.forEach((data) => {
            data["chinese"] = data.names;
        })
        return item_data;
    },
    getItemInfo(item) {
        let item_data = out.getItem();
        let item_obj = {};
        item_data.forEach((data) => {
            item_obj[data.name] = data;
            item_obj[data.type] = data;
        })
        return item_obj[item]
    },
    getPlayer() {
        let bind_data = lib.getBind();
        bind_data.forEach((data) => {
            data["qqid"] = data.qq;
            data["gameid"] = data.name;
            data["bindtime"] = data.bind_time;
            data["firstjoin"] = data.first_join;
        });
        return bind_data;
    },
    bind: {
        QQgetData(qq) {
            let bind_data = out.getPlayer();
            let bind_obj = {};
            bind_data.forEach((data) => {
                bind_obj[data.qq] = data;
            });
            return bind_obj[qq];
        },
        NamegetData(gameid) {
            let bind_data = out.getPlayer();
            let bind_obj = {};
            bind_data.forEach((data) => {
                bind_obj[data.name] = data;
            });
            return bind_obj[gameid];
        },
        XuidgetData(xuid) {
            let bind_data = out.getPlayer();
            let bind_obj = {};
            bind_data.forEach((data) => {
                bind_obj[data.xuid] = data;
            });
            return bind_obj[xuid];
        }
    }
};
ll.export(out.getBuff, "PLib", "buffdata");
ll.export(out.getBuffInfo, "PLib", "buffinfo");
ll.export(out.getLizi, "PLib", "lizidata");
ll.export(out.getLiziInfo, "PLib", "liziinfo");
ll.export(out.getItem, "PLib", "alliteminfo");
ll.export(out.getItemInfo, "PLib", "iteminfo");
ll.export(out.getPlayer, "PLib", "getplayer");
//历史接口
ll.export(out.getBuff, "buffdata");
ll.export(out.getLizi, "lizidata");
ll.export(out.getItem, "itemallinfodata");
ll.export(out.getItemInfo, "iteminfodata");
ll.export(out.getPlayer, "PLibplayer");

mc.listen("onServerStarted", () => {
    if (config.getVersion() == null) {
        config.initial();
        lib.initial();
    } else
        config.update();
    cmd.register([{ cmd: "plib", des: "数据库", per: PermType.Any }, { cmd: "plist", des: "数据库", per: PermType.Console }]);
    lib.automatic_cycle();
    if (docking.PBind()) {
        colorLog("yellow", "PLib已集成PBind插件的所有功能,PBind将自动卸载并删除")
        File.delete("./plugins/PBind.llse.js");
        File.delete("./plugins/PBind.llse");
        mc.runcmdEx("ll unload PBind");
        //继承PBind接口 为保证旧插件正常对接
        ll.export(out.bind.QQgetData, "PBind", "qqdata");
        ll.export(out.bind.NamegetData, "PBind", "gameiddata");
        ll.export(out.bind.XuidgetData, "PBind", "xuiddata");
    } else {
        //继承PBind接口 为保证旧插件正常对接
        ll.export(out.bind.QQgetData, "PBind", "qqdata");
        ll.export(out.bind.NamegetData, "PBind", "gameiddata");
        ll.export(out.bind.XuidgetData, "PBind", "xuiddata");
    };
    if (docking.PAPI || docking.GMLIB) {
        docking.PAPIjs().registerServerPlaceholder(papi.regHistory, "PLib", "server_history");
        docking.PAPIjs().registerServerPlaceholder(papi.retDailyAdd, "PLib", "server_daily_add");

    };
    network.httpGet(url, (status, result) => {
        if (status == 200) {
            let http_info = JSON.parse(result);
            if (http_info != null) {
                http_info.updatemes = http_info.updatemes[http_info.fixvers] ?? http_info.updatemes[http_info.version] ?? "更新内容参数错误";
                http_info.updatemes += `,Minebbs: ${http_info.links?.minebbs ?? "无"},下载直链: ${http_info.links?.download[http_info.fixvers] ?? http_info.links?.download[http_info.version] ?? "无"},文档说明: ${http_info.links?.docs ?? "五"}`;
                http_info.version = `v${http_info.version} ${http_info.fixvers}`.trim();
                let version = `${versions} ${fixvers}`.trim();
                if (http_info.version > version) {
                    colorLog("yellow", `网络连接成功 插件有新版本 当前插件版本${version},最新版${http_info.version}\n更新内容\n${http_info.updatemes.replace(/,/g, "\n")}`);
                } else {
                    colorLog("yellow", `网络连接成功 当前已是最新版本`);
                };
            } else {
                colorLog("red", "网络参数不正确,请联系开发者处理");
            };
        } else {
            colorLog("red", "网络故障或无法访问目标网站以获取插件更新内容");
        };
    });
});
mc.listen("onPreJoin", (_player) => {
    new_player.add(_player);
    let player_bind_data = lib.getBind(_player.xuid, "xuid") || lib.getBind(_player.realName);
    if (player_bind_data == null) {
        let bind_data = lib.getBind()
        bind_data.push({ qq: null, channel: null, name: _player.realName, xuid: Number(_player.xuid), bind_time: null, first_join: system.getTimeStr() })
        lib.setBind(bind_data);
    } else if (player_bind_data.xuid == null) {
        let bind_data = lib.getBind()
        bind_data.forEach((data) => {
            if (data.name == _player.realName)
                data.xuid = Number(_player.xuid)
        });
        lib.setBind(bind_data);
    } else if (player_bind_data.first_join == null) {
        let bind_data = lib.getBind()
        bind_data.forEach((data) => {
            if (data.name == _player.realName)
                data.first_join = system.getTimeStr();
        });
        lib.setBind(bind_data);
    };
});

if (fixvers == "") { var fix = " 正式版" } else { var fix = ` ${fixvers} 开发版`; logger.warn("当前版本为开发版,请勿用于生产环境！！！"); }
ll.registerPlugin("PLib", "Library", regvers, { Author: author, Docs: `https://docs.mcmap.top/plugins/LLSE/PLib.html`, Names: "数据库", "Fix Version": fix.replace(/ /, "") });
log(`数据库插件---加载成功,当前版本：${versions}${fix}`)