tag @a[tag=!joined] add first_join
tag @a[tag=first_join] add joined
give @a[tag=first_join] sf:shadow_book 1
give @a[tag=first_join] iron_ingot 64
give @a[tag=first_join] sf:shadow_faction_legion 1
give @a[tag=first_join] sf:shadow_ability_legion 1
scoreboard objectives add shadow_ability dummy 暗影技能
scoreboard players set @a[tag=first_join] shadow_ability 100001
scoreboard objectives add shadow_faction dummy 派系
scoreboard players set @a[tag=first_join] shadow_faction 1234
tag @a[tag=joined] remove first_join