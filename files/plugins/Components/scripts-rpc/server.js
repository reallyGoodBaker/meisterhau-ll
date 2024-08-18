function handleCall(msg, em) {
    const { id, name, args } = msg
    em.emitNone('call', id, name, args)
}

function handleReturn(msg, em) {
    const { id, success, val } = msg
    em.emitNone('return', id, success, val)
}

function setup(list, em) {
    const server = new HttpServer()

    server.onPost('/rpc', (req, res) => {
        try {
            const rpcMessages = JSON.parse(req.body)

            rpcMessages.forEach(msg => {
                if (msg.type === 'call') {
                    return handleCall(msg, em)
                }

                if (msg.type === 'return') {
                    return handleReturn(msg, em)
                }
            })
        } finally {
            res.status = 200
            res.reason = "OK"
            res.write(JSON.stringify(list.splice(0, list.length)))
        }
    })
    .listen('localhost', 19999)

    return server
}

module.exports = {
    createServer: setup
}