const http = require('http')

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

function setupNodeHttpServer(list, em) {
    return http.createServer((req, res) => {
        if (req.url.startsWith('/sync')) {
            
        }

        if (req.url !== '/rpc') {
            res.writeHead(404)
            res.end()
            return
        }

        let buf = Buffer.alloc(0)
        req.on('data', chunk => buf = Buffer.concat([buf, chunk]))
        req.on('end', () => {
            const rpcMessages = JSON.parse(buf.toString())

            rpcMessages.forEach(msg => {
                if (msg.type === 'call') {
                    handleCall(msg, em)
                } else if (msg.type ==='return') {
                    handleReturn(msg, em)
                }
            })

            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify(list.splice(0, list.length)))
        })
    })
    .listen(19999)
}

module.exports = {
    createServer: setup, setupNodeHttpServer
}