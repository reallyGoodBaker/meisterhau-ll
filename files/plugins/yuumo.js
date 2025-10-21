const { load } = require('./loadModule')

const modules = [
    require('./Components/whoami'),
    require('./Components/speed'),
    require('./Components/simulate-player'),
    require('./Components/over-shoulder'),
    require('./Components/notification'),
    require('./Components/motd'),
    require('./Components/tpc/setup'),
    require('./Components/shell/index'),
    require('./Components/order/setup'),
    require('./Components/kinematics/index'),
    require('./Components/credit/setup'),
    require('./Components/affair/index'),
    require('./Components/testui'),
    require('./Components/marriage/setup'),
    require('./Components/account'),
]

mc.listen('onServerStarted',() => modules.forEach(m => load(m)))