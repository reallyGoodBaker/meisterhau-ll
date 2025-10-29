import * as mc from "@minecraft/server"

function getDevice(device, player) {
    // 直接使用官方 PlatformType 枚举值
    // 映射官方枚举值到显示名称
    switch (device) {
        case 'Desktop':  // 官方桌面枚举值
            return 'PC'
        case 'Console':  // 官方控制台枚举值
            return 'Console'
        case 'Mobile':   // 官方移动设备枚举值
            return 'Mobile'
    }
}

mc.world.beforeEvents.chatSend.subscribe((event) => {
    const message = event.message
    const player = event.sender
    const device = player.clientSystemInfo.platformType
    const user_device = getDevice(device, player)
    event.cancel = true
    mc.world.sendMessage(`§e§l[${user_device}]§a<${player.nameTag}> §r${message}`)
})
