const { load } = require('./loadModule')

mc.listen('onServerStarted',() => [
    require('./Components/scripts-rpc/setup'),
    require('./Components/combat/init'),
    require('./Components/account'),
].forEach(m => load(m)))
