const http = require('http')
const cp = require('child_process')
const path = require('path')

const gitCwd = 'C:/Users/Administrator/Documents/GitHub/server'

const importModule = p => {
    delete require.cache[require.resolve(p)]
    return require(p)
}

http.createServer((req, res) => {
    let buf = Buffer.alloc(0)
    req.on('data', data => {
        buf = Buffer.concat([buf, data])
    })

    req.on('end', () => {
        // console.log(JSON.parse(buf.toString()))

        cp.execSync(`cd "${gitCwd}" && git pull`)

        const { copyFolder, parseSyncConfig } = importModule(path.join(gitCwd, 'server/sync'))
        const { sync } = importModule(path.join(gitCwd, 'server/config'))
        console.log(sync)

        setTimeout(() => {
            copyFolder(
                path.join(gitCwd, 'files'),
                'D:/TopSky_2.7.1',
                sync.map(v => parseSyncConfig(v))
            )
    
            console.log('Files copied.')
        }, 1000);
    })
}).listen(18520)

