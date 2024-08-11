const { EventEmitter } = require('../events')
const { cmd } = require('../utils/command')
const { createServer } = require('./server')

const em = new EventEmitter()
const rpcChannel = []
const remoteFuncs = new Map()
const server = createServer(rpcChannel, em)

function rpcCall(id, name, args) {
    return {
        type: 'call',
        id, name, args
    }
}

function rpcReturn(id, success, val) {
    return {
        type: 'return',
        id, success, val
    }
}
function remoteCall(name, ...args) {
    const id = Math.random().toString(36).slice(2)
    const rpcMsg = rpcCall(id, name, args)

    rpcChannel.push(rpcMsg)

    return new Promise((res, rej) => {
        em.once(id, (success, val) => {
            const done = success ? res : rej
            done(val)
        })
    })
}

function remoteFunction(name, func) {
    remoteFuncs.set(name, func)
}

function setupCallHandler() {
    em.on('call', (id, name, args) => {
        let func = remoteFuncs.get(name)
        if (!func) {
            return rpcChannel.push(rpcReturn(id, false, 'null'))
        }

        let val, success = true
        try {
            val = func.apply(null, args)
        } catch (error) {
            val = error
            success = false
        }

        return rpcChannel.push(rpcReturn(id, success, val))
    })
}

function setupReturnHandler() {
    em.on('return', (id, success, val) => {
        em.emitNone(id, success, val)
    })
}


function setup() {
    setupCallHandler()
    setupReturnHandler()
    cmd('func', '函数', 1).setup(registry => {
        registry.register('<name:string> <args:string>', async (cmd, origin, output, res) => {
            const pl = origin.player
            remoteCall(res.name, ...res.args.split(' '))
                .then(v => pl.tell(v.toString()))
                .catch(e => pl.tell(e.toString()))
        }).submit()
    })
}

function unload() {
    server.stop()
}

const remote = {
    call: remoteCall,
    expose: remoteFunction
}

module.exports = {
    setup, unload, remote
}