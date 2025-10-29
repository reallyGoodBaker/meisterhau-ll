scoreboard objectives add engry dummy 暗影能量
scoreboard objectives add level dummy 等级
scoreboard objectives add dnscore dummy 铜币
scoreboard objectives add gem dummy 宝石
execute as @a run titleraw @s actionbar {"rawtext":[{"text":"§a§l◆等级 §f"},{"score":{"name":"@s","objective":"level"}},{"text":" §e§l◎铜币 §f"},{"score":{"name":"@s","objective":"dnscore"}},{"text":" §c§l♦宝石 §f"},{"score":{"name":"@s","objective":"gem"}},{"text":" §l§b●暗影能量 §f"},{"score":{"name":"@s","objective":"engry"}}]}