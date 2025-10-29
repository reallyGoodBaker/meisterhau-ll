mc.listen("onServerStarted",function(){
    const enchantex = mc.newCommand("enchantex","强制附魔手持或物品栏中的物品，或移除其附魔")
   enchantex.setEnum("enchslotSingle",["slot.weapon.mainhand","slot.weapon.offhand","offhand","mainhand","slot.armor.chest","chest","slot.armor.head","head","slot.armor.legs","legs","slot.armor.feet","feet"])
   enchantex.setEnum("enchslotMult",["slot.hotbar","hotbar","slot.inventory","inventory","slot.enderchest","enderchest"])
   enchantex.setEnum("EnchAction",["ench"])
   enchantex.setEnum("EnchActiondelete",["delete"])
   enchantex.setEnum("enchSlot",["slot"])
   enchantex.setEnum("enchName",["aqua_affinity","sharpness","bane_of_arthropods","blast_protection","channeling","binding","vanishing","depth_strider","efficiency","feather_falling","fire_aspect","fire_protection","flame","fortune","frost_walker","impaling","infinity","knockback","looting","loyalty","luck_of_the_sea","lure","mending","multishot","piercing","power","projectile_protection","protection","punch","quick_charge","respiration","riptide","sharpness","silk_touch","smite","soul_speed","swift_sneak","thorns","unbreaking"])
   enchantex.mandatory("enchaction", ParamType.Enum, "EnchAction" ,1)
   enchantex.mandatory("enchaction", ParamType.Enum, "EnchActiondelete" ,1)
   enchantex.mandatory("enchname", ParamType.Enum, "enchName" ,1)
   enchantex.mandatory("enchslotset", ParamType.Enum, "enchSlot" ,1)
   enchantex.mandatory("enchslots", ParamType.Enum, "enchslotSingle" ,1)
   enchantex.mandatory("enchslotm", ParamType.Enum, "enchslotMult" ,1)
   enchantex.mandatory("enchtarget", ParamType.Actor, "enchTarget" ,1)
   enchantex.mandatory("enchlevel", ParamType.Int, "enchLevel" ,1)
   enchantex.mandatory("enchslotpos", ParamType.Int, "enchSlotpos" ,1)
   enchantex.overload(["EnchAction","enchTarget","enchname","enchlevel"])
   enchantex.overload(["EnchAction","enchTarget","enchslotset","enchslotSingle","enchname","enchlevel"])
   enchantex.overload(["EnchAction","enchTarget","enchslotset","enchslotMult","enchSlotpos","enchname","enchlevel"])
   enchantex.overload(["EnchActiondelete","enchTarget","enchname"])
   enchantex.overload(["EnchActiondelete","enchTarget","enchslotset","enchslotSingle","enchname"])
   enchantex.overload(["EnchActiondelete","enchTarget","enchslotset","enchslotMult","enchSlotpos","enchname"])
   enchantex.setCallback(function(cmd,ori,out,res){
   if(res.enchaction == "ench"){
    var pl
    var itemget
    var ennbt
    var contlistnbt
    var enchtargetnbt
    var itemnbt
    if(res.enchpasszero == false){enchpasszero = false}
    const targetlist = res.enchtarget
    for(var i = 0; i < targetlist.length; i++){
        log("looping")
        pl = targetlist[i]
        ennbt = pl.getNbt()
    if(res.enchslotset == "slot"){
            if(res.enchslots == "slot.weapon.mainhand" || res.enchslots == "mainhand"){
                if(pl.isPlayer()){
                    pl = pl.toPlayer()
                    itemget = pl.getHand()
                    itemnbt = itemget.getNbt()
                    itemnbt = enchwithnbt(itemnbt,res.enchname,res.enchlevel)
                    itemget.setNbt(itemnbt)
                    pl.refreshItems()
                    }else{
                        contlistnbt = ennbt.getTag("Mainhand")
                        enchtargetnbt = contlistnbt.getTag(0)
                        enchtargetnbt = enchwithnbt(enchtargetnbt,res.enchname,res.enchlevel)
                        contlistnbt.setTag(0,enchtargetnbt)
                        ennbt.setTag("Mainhand",contlistnbt)
                        pl.setNbt(ennbt)
                        pl.refreshItems()
            }
            }
            if(res.enchslots == "slot.weapon.offhand" || res.enchslots == "offhand"){
                contlistnbt = ennbt.getTag("Offhand")
                enchtargetnbt = contlistnbt.getTag(0)
                enchtargetnbt = enchwithnbt(enchtargetnbt,res.enchname,res.enchlevel)
                contlistnbt.setTag(0,enchtargetnbt)
                ennbt.setTag("Offhand",contlistnbt)
                pl.setNbt(ennbt)
                pl.refreshItems()
            }
            if(res.enchslots == "slot.armor.head" || res.enchslots == "head"){
                contlistnbt = ennbt.getTag("Armor")
                enchtargetnbt = contlistnbt.getTag(0)
                enchtargetnbt = enchwithnbt(enchtargetnbt,res.enchname,res.enchlevel)
                contlistnbt.setTag(0,enchtargetnbt)
                ennbt.setTag("Armor",contlistnbt)
                pl.setNbt(ennbt)
                pl.refreshItems()
            }
            if(res.enchslots == "slot.armor.chest" || res.enchslots == "chest"){
                contlistnbt = ennbt.getTag("Armor")
                enchtargetnbt = contlistnbt.getTag(1)
                enchtargetnbt = enchwithnbt(enchtargetnbt,res.enchname,res.enchlevel)
                contlistnbt.setTag(1,enchtargetnbt)
                ennbt.setTag("Armor",contlistnbt)
                pl.setNbt(ennbt)
                pl.refreshItems()
            }
            if(res.enchslots == "slot.armor.legs" || res.enchslots == "legs"){
                contlistnbt = ennbt.getTag("Armor")
                enchtargetnbt = contlistnbt.getTag(2)
                enchtargetnbt = enchwithnbt(enchtargetnbt,res.enchname,res.enchlevel)
                contlistnbt.setTag(2,enchtargetnbt)
                ennbt.setTag("Armor",contlistnbt)
                pl.setNbt(ennbt)
                pl.refreshItems()
            }
            if(res.enchslots == "slot.armor.feet" || res.enchslots == "feet"){
                contlistnbt = ennbt.getTag("Armor")
                enchtargetnbt = contlistnbt.getTag(3)
                enchtargetnbt = enchwithnbt(enchtargetnbt,res.enchname,res.enchlevel)
                contlistnbt.setTag(3,enchtargetnbt)
                ennbt.setTag("Armor",contlistnbt)
                pl.setNbt(ennbt)
                pl.refreshItems()
            }
            if(res.enchslotm == "slot.hotbar" || res.enchslotm == "hotbar" || res.enchslotm == "slot.inventory" || res.enchslotm == "inventory"){
                contlistnbt = ennbt.getTag("Container")
                enchtargetnbt = contlistnbt.getTag(res.enchslotpos)
                enchtargetnbt = enchwithnbt(enchtargetnbt,res.enchname,res.enchlevel)
                contlistnbt.setTag(res.enchslotpos,enchtargetnbt)
                ennbt.setTag("Container",contlistnbt)
                pl.setNbt(ennbt)
                pl.refreshItems()
            }
    }else{
        if(pl.isPlayer()){
            pl = pl.toPlayer()
            itemget = pl.getHand()
            itemnbt = itemget.getNbt()
            itemnbt = enchwithnbt(itemnbt,res.enchname,res.enchlevel)
            itemget.setNbt(itemnbt)
            }else{
                contlistnbt = ennbt.getTag("Mainhand")
                enchtargetnbt = contlistnbt.getTag(0)
                enchtargetnbt = enchwithnbt(enchtargetnbt,res.enchname,res.enchlevel)
                contlistnbt.setTag(0,enchtargetnbt)
                ennbt.setTag("Mainhand",contlistnbt)
    }
}
    out.success(pl.name + " 附魔成功")
   }
}
   if(res.enchaction == "delete"){
    var pl
    var itemget
    const targetlist = res.enchtarget
    for(var i = 0; i < targetlist.length; i++){
        pl = targetlist[i]
        ennbt = pl.getNbt()
        if(res.enchslotset == "slot"){
                if(res.enchslots == "slot.weapon.mainhand" || res.enchslots == "mainhand"){
                    if(pl.isPlayer()){
                        pl = pl.toPlayer()
                        itemget = pl.getHand()
                        itemnbt = itemget.getNbt()
                        itemnbt = removeench(itemnbt,res.enchname)
                        itemget.setNbt(itemnbt)
                        pl.refreshItems()
                    }else{
                    contlistnbt = ennbt.getTag("Mainhand")
                    enchtargetnbt = contlistnbt.getTag(0)
                    enchtargetnbt = removeench(enchtargetnbt,res.enchname)
                    contlistnbt.setTag(0,enchtargetnbt)
                    ennbt.setTag("Mainhand",contlistnbt)
                    pl.setNbt(ennbt)
                }
                }
                if(res.enchslots == "slot.weapon.offhand" || res.enchslots == "offhand"){
                    contlistnbt = ennbt.getTag("Offhand")
                    enchtargetnbt = contlistnbt.getTag(0)
                    enchtargetnbt = removeench(enchtargetnbt,res.enchname)
                    contlistnbt.setTag(0,enchtargetnbt)
                    ennbt.setTag("Offhand",contlistnbt)
                    pl.setNbt(ennbt)
                }
                if(res.enchslots == "slot.armor.head" || res.enchslots == "head"){
                    contlistnbt = ennbt.getTag("Armor")
                    enchtargetnbt = contlistnbt.getTag(0)
                    enchtargetnbt = removeench(enchtargetnbt,res.enchname)
                    contlistnbt.setTag(0,enchtargetnbt)
                    ennbt.setTag("Armor",contlistnbt)
                    pl.setNbt(ennbt)
                }
                if(res.enchslots == "slot.armor.chest" || res.enchslots == "chest"){
                    contlistnbt = ennbt.getTag("Armor")
                    enchtargetnbt = contlistnbt.getTag(1)
                    enchtargetnbt = removeench(enchtargetnbt,res.enchname)
                    contlistnbt.setTag(1,enchtargetnbt)
                    ennbt.setTag("Armor",contlistnbt)
                    pl.setNbt(ennbt)
                }
                if(res.enchslots == "slot.armor.legs" || res.enchslots == "legs"){
                    contlistnbt = ennbt.getTag("Armor")
                    enchtargetnbt = contlistnbt.getTag(2)
                    enchtargetnbt = removeench(enchtargetnbt,res.enchname)
                    contlistnbt.setTag(2,enchtargetnbt)
                    ennbt.setTag("Armor",contlistnbt)
                    pl.setNbt(ennbt)
                }
                if(res.enchslots == "slot.armor.feet" || res.enchslots == "feet"){
                    contlistnbt = ennbt.getTag("Armor")
                    enchtargetnbt = contlistnbt.getTag(3)
                    enchtargetnbt = removeench(enchtargetnbt,res.enchname)
                    contlistnbt.setTag(3,enchtargetnbt)
                    ennbt.setTag("Armor",contlistnbt)
                    pl.setNbt(ennbt)
                }
                if(res.enchslotm == "slot.hotbar" || res.enchslotm == "hotbar" || res.enchslotm == "slot.inventory" || res.enchslotm == "inventory"){
                    contlistnbt = ennbt.getTag("Container")
                    enchtargetnbt = contlistnbt.getTag(res.enchslotpos)
                    enchtargetnbt = removeench(enchtargetnbt,res.enchname)
                    contlistnbt.setTag(res.enchslotpos,enchtargetnbt)
                    ennbt.setTag("Container",contlistnbt)
                    pl.setNbt(ennbt)
                }
        }else{
            if(pl.isPlayer()){
                pl = pl.toPlayer()
                itemget = pl.getHand()
                itemnbt = itemget.getNbt()
                itemnbt = removeench(itemnbt,res.enchname)
                itemget.setNbt(itemnbt)
                pl.refreshItems()
            }else{
            contlistnbt = ennbt.getTag("Mainhand")
            if(pl.isPlayer()){contlistnbt = pl.getHand(); contlistnbt = contlistnbt.getNbt()}
            enchtargetnbt = contlistnbt.getTag(0)
            enchtargetnbt = removeench(enchtargetnbt,res.enchname)
            contlistnbt.setTag(0,enchtargetnbt)
            ennbt.setTag("Mainhand",contlistnbt)
            pl.setNbt(ennbt)
        }
        }
        pl.refreshItems()
        out.success(pl.name + " 驱魔成功")
       }
   }

})
enchantex.setup()
})

function enchwithnbt(itemnbt,enchname,lvl){
    let enchid = getinchid(enchname)
    var tagnbt = itemnbt.getTag("tag")
    if(tagnbt != null){
        var enchnbt = tagnbt.getTag("ench")
        if(enchnbt != null){
            var enchnbttag
            var i
            var enchnbtlength = enchnbt.getSize()
            var enchnbttagid
            for(i = 0; i < enchnbtlength; i++){
                enchnbttag = enchnbt.getTag(i)
                enchnbttagid = enchnbttag.getTag("id")
                enchnbttagid = enchnbttagid.toString()
                if(enchnbttagid == enchid){
                    let enchnbtnewtag = new NbtCompound({
                        "lvl": new NbtShort(lvl),
                        "id":new NbtShort(enchid)
                    }
                    ) 
                    enchnbt.setTag(i,enchnbtnewtag)
                    break
                }
                if(i + 1 == enchnbtlength){
                    let enchnbtnewtag = new NbtCompound({
                        "lvl": new NbtShort(lvl),
                        "id":new NbtShort(enchid)
                    })
                    enchnbt.addTag(enchnbtnewtag)
                }
            }
            tagnbt.setTag("ench",enchnbt)
        }
        else{
            let enchlist = new NbtList([
                        {
                            "lvl": new NbtShort(lvl),
                            "id": new NbtShort(enchid)
                        }]
            )
            tagnbt.setTag("ench",enchlist)
        }
    }else{
        var enchnbtnull = new NbtList(
        [{
            "lvl":new NbtShort(lvl),
            "id":new NbtShort(enchid)
        }]
    )
    tagnbt = new NbtCompound({"ench":enchnbtnull})
    }
    itemnbt.setTag("tag",tagnbt)
    return itemnbt
}
function removeench(itemnbt,enchname){
    let enchid = getinchid(enchname)
    let tagnbt = itemnbt.getTag("tag")
    if(tagnbt != null){
        var enchnbt = tagnbt.getTag("ench")
        if(enchnbt != null){
            var enchnbttag
            var i
            var enchnbtlength = enchnbt.getSize()
            var enchnbttagid
            for(i = 0; i < enchnbtlength; i++){
                enchnbttag = enchnbt.getTag(i)
                enchnbttagid = enchnbttag.getTag("id")
                if(enchnbttagid == enchid){
                    enchnbt.removeTag(i)
                    break
                }
            }
            if(enchnbt.toString() == "[]"){tagnbt.removeTag("ench")}else{tagnbt.setTag("ench",enchnbt)}
        }
    }
    itemnbt.setTag("tag",tagnbt)
    return itemnbt
}
   
function getinchid(enchname){
   let enchid 
   if(enchname == "aqua_affinity" ){enchid = 8}
   if(enchname == "bane_of_arthropods" ){enchid = 11}
   if(enchname == "blast_protection" ){enchid = 3}
   if(enchname == "channeling" ){enchid = 32}
   if(enchname == "binding" ){enchid = 27}
   if(enchname == "vanishing" ){enchid = 28}
   if(enchname == "depth_strider" ){enchid = 7}
   if(enchname == "efficiency" ){enchid = 15}
   if(enchname == "feather_falling" ){enchid = 2}
   if(enchname == "fire_aspect" ){enchid = 13}
   if(enchname == "fire_protection" ){enchid = 1}
   if(enchname == "flame" ){enchid = 21}
   if(enchname == "fortune" ){enchid = 18}
   if(enchname == "frost_walker" ){enchid = 25}
   if(enchname == "impaling" ){enchid = 29}
   if(enchname == "infinity" ){enchid = 22}
   if(enchname == "knockback" ){enchid = 12}
   if(enchname == "looting" ){enchid = 14}
   if(enchname == "loyalty" ){enchid = 31}
   if(enchname == "luck_of_the_sea" ){enchid = 23}
   if(enchname == "lure" ){enchid = 24}
   if(enchname == "mending" ){enchid = 26}
   if(enchname == "multishot" ){enchid = 33}
   if(enchname == "piercing" ){enchid = 34}
   if(enchname == "power" ){enchid = 19}
   if(enchname == "projectile_protection" ){enchid = 4}
   if(enchname == "protection" ){enchid = 0}
   if(enchname == "punch" ){enchid = 20}
   if(enchname == "quick_charge" ){enchid = 35}
   if(enchname == "respiration" ){enchid = 6}
   if(enchname == "riptide" ){enchid = 30}
   if(enchname == "sharpness" ){enchid = 9}
   if(enchname == "silk_touch" ){enchid = 16}
   if(enchname == "smite" ){enchid = 10}
   if(enchname == "soul_speed" ){enchid = 36}
   if(enchname == "swift_sneak" ){enchid = 37}
   if(enchname == "thorns" ){enchid = 5}
   if(enchname == "unbreaking" ){enchid = 17}
   return enchid
}