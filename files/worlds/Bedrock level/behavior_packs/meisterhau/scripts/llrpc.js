import { system, world } from '@minecraft/server'
import { EventEmitter } from './events'
import { http, HttpRequest } from '@minecraft/server-net'
import { syncInputButtons } from './remote/input'

const uri = 'http://localhost:19999/rpc'

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

/**
 * @typedef {'string'|'number'|'boolean'|'object'|'undefined'} RemoteArgumentTypes
 */

const em = new EventEmitter()
const remoteFuncs = new Map()
const rpcChannel = []

export const remote = {
    call: remoteCall,
    expose: remoteFunction
}

function remoteFunction(name, func) {
    remoteFuncs.set(name, func)
}

function remoteCall(name, ...args) {
    const id = Math.random().toString(36).slice(2)
    rpcChannel.push(rpcCall(id, name, args))

    return new Promise((res, rej) => {
        em.on(id, (suc, val) => {
            const done = suc ? res : rej
            done(val)
        })
    })
}

function handleOnce() {
    const body = JSON.stringify(rpcChannel.splice(0, rpcChannel.length))
    const req = new HttpRequest(uri)
        .setMethod('Post')
        .setBody(body)

    http.request(req).then(res => {
        /**@type {any[]}*/
        const rpcMsgs = JSON.parse(res.body)
        rpcMsgs.forEach(msg => {
            if (msg.type === 'call') {
                return handleCall(msg)
            }

            if (msg.type === 'return') {
                return handleReturn(msg)
            }
        })
    }).catch(() => {})
}

async function handleCall(msg) {
    const { id, name, args } = msg

    let func = remoteFuncs.get(name)
    if (!func) {
        return rpcChannel.push(rpcReturn(
            id, false, 'null'
        ))
    }

    let val, suc = true
    try {
        val = await func.apply(null, args)
    } catch (e) {
        val = e
    }

    return rpcChannel.push(rpcReturn(
        id, suc, val
    ))
}

function handleReturn(msg) {
    const { id, success, val } = msg

    em.emitNone(id, success, val)
}

system.beforeEvents.startup.subscribe(ev => {
    system.runInterval(handleOnce)
    system.runInterval(syncInputButtons)
})
