const { load } = require('./loadModule.js')

const modules = [
    require('./Components/whoami.js'),
    require('./Components/speed.js'),
    require('./Components/simulate-player.js'),
    require('./Components/over-shoulder.js'),
    require('./Components/notification.js'),
    require('./Components/motd.js'),
    require('./Components/tpc/setup.js'),
    require('./Components/shell/index.js'),
    require('./Components/order/setup.js'),
    require('./Components/kinematics/index.js'),
    require('./Components/credit/setup.js'),
    require('./Components/affair/index.js'),
    require('./Components/testui.js'),
]

mc.listen('onServerStarted',() => modules.forEach(m => load(m)))