const { load } = require('./loadModule')

mc.listen('onServerStarted',() => [
    require('./Components/scripts-rpc/setup.js'),
    require('./Components/combat/init.js'),
].forEach(m => load(m)))
