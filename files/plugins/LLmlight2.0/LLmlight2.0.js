ll.registerPlugin("简单的移动光源", "光啊!");
mc.listen("onJoin",(player)=>{
	try{
		if(player.hasTag("mlight")==false) {
			player.addTag("mlight");
		}
	}catch(error){
		//检测,忽略!!!
	}
});
mc.listen("onStartDestroyBlock",(player)=>{
	try{
		var itemget=player.getHand();
		if(itemget.type=="minecraft:torch"){
			mc.runcmdEx(`clear ${player.realName} torch 0 1`);
			mc.runcmdEx(`replaceitem entity ${player.realName} slot.weapon.offhand 0 torch 1`);
		}
	}catch(error){
		//忽略!!
	}
});
function relight() {
	try{
		mc.runcmdEx("execute as @a[tag=mlight] at @s run fill ~5 ~5 ~5 ~-5 ~-5 ~-5 air replace light_block [\"block_light_level\"=14]");
		mc.runcmdEx("execute as @a[tag=mlight,hasitem={item=torch,location=slot.weapon.mainhand}] at @s run fill ~ ~1 ~ ~ ~1 ~ light_block [\"block_light_level\"=14] replace air");
		mc.runcmdEx("execute as @a[tag=mlight,hasitem={item=glowstone,location=slot.weapon.mainhand}] at @s run fill ~ ~1 ~ ~ ~1 ~ light_block [\"block_light_level\"=14] replace air");
		mc.runcmdEx("execute as @a[tag=mlight,hasitem={item=lantern,location=slot.weapon.mainhand}] at @s run fill ~ ~1 ~ ~ ~1 ~ light_block [\"block_light_level\"=14] replace air");
		mc.runcmdEx("execute as @a[tag=mlight,hasitem={item=soul_lantern,location=slot.weapon.mainhand}] at @s run fill ~ ~1 ~ ~ ~1 ~ light_block [\"block_light_level\"=14] replace air");
		mc.runcmdEx("execute as @a[tag=mlight,hasitem={item=lit_pumpkin,location=slot.weapon.mainhand}] at @s run fill ~ ~1 ~ ~ ~1 ~ light_block [\"block_light_level\"=14] replace air");
		mc.runcmdEx("execute as @a[tag=mlight,hasitem={item=torch,location=slot.weapon.offhand}] at @s run fill ~ ~1 ~ ~ ~1 ~ light_block [\"block_light_level\"=14] replace air");
	}catch(error){
		//忽略!!
	}
}
var relighttimer=setInterval(relight,100);