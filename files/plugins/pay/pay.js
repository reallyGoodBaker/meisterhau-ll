function ui_payoff(pl) {
    let fm = mc.newCustomForm()
    fm.setTitle("转账")
    fm.addInput("搜索玩家")
    pl.sendForm(fm, (pl, dt) => {
        if(dt == null) return null
        let players={}
        let players_=data.getAllPlayerInfo()
        for (let i of players_){
            if(i.name.toUpperCase().includes(dt[0].toUpperCase()) && (i.name!=pl.name)){
                players[i.name]=i.xuid
            }
        }
        ui_pay(pl,players)
    })
}

function ui_pay(pl,players) {
    if (players==null) return
    let pllist=Object.keys(players)

    let fm = mc.newCustomForm()
    fm.setTitle("转账")
    fm.addLabel("你的余额: "+pl.getMoney())
    fm.addDropdown("向指定玩家转账:", pllist)
    fm.addInput("金额")
    pl.sendForm(fm, (pl, dt) => {
        if(dt == null) return
        let topl = players[pllist[dt[1]]]
        let Coin=parseInt(dt[2])
        
        if(topl == null){pl.sendModalForm("错误", "无法获取目标玩家对象，转账失败。", "返回", "关闭", (pl, st) => {if(st)ui_pay(pl,players)});return}

        if(!(Coin>0)){pl.sendModalForm("错误", "转账金额必须是大于0的数字!", "返回", "关闭", (pl, st) => {if(st)ui_pay(pl,players)});return}

        if(pl.getMoney()<Coin){pl.sendModalForm("错误", "余额不足!", "返回", "关闭", (pl, st) => {if(st)ui_pay(pl,players)});return}

        if(!money.trans(pl.xuid,topl,Coin)){pl.sendModalForm("错误", "发生未知问题，转账失败!", "返回", "关闭", (pl, st) => {if(st)ui_pay(pl,players)});return}

        pl.sendModalForm("成功", "成功向"+pllist[dt[1]]+"转账"+Coin+"元", "继续转账", "关闭", (pl, st) => {if(st)ui_pay(pl,players)})
        
        topl=mc.getPlayer(topl)
        if(topl!=null) topl.tell("玩家"+pl.name+"向你转账"+Coin+"元")
    })

}


mc.regPlayerCmd("payoff", "向(离线)玩家转账", (pl)=>{
    ui_payoff(pl)
})

mc.regPlayerCmd("pay", "向在线玩家转账", (pl)=>{
    let players = {}
    for(let i of mc.getOnlinePlayers()) {
        if (i.name!=pl.name){
            players[i.name]=i.xuid
        }
    }
    ui_pay(pl,players)
})