const { load } = require('./loadModule')

mc.listen('onServerStarted',() => [
    require('./Components/scripts-rpc/setup'),
    require('./Components/combat/init'),
].forEach(m => load(m)))
