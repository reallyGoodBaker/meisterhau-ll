const http = require('https')
const fs = require('fs')
const path = require('path')

function drawProgressBar(progress, length=20, style='[= ]') {
    process.stdout.moveCursor(0, -1)

    const current = Math.round(length * progress)
    const rest = length - current

    console.log(style[0]
        + new Array(current)
            .fill(style[1])
            .join('')
        + new Array(rest)
            .fill(style[2])
            .join('')
        + style[3])
}

function download(url, folderPath, filename) {
    const concretePath = path.join(folderPath, filename)
    if (fs.existsSync(concretePath)) {
        if (!fs.statSync(concretePath).isFile()) {
            console.error(`${concretePath} 不是可用的路径`);
            return
        }
    }

    console.log(`从 ${url} 下载 '${filename}' 到 '${folderPath}'\n`)

    return new Promise((resolve, reject) => {
        http.get(url, res => {
            res.on('error', e => {
                console.error(e)
                console.log('\x1b[91m下载失败\x1b[0m\n')
                reject()
            })
    
            const contentLength = parseInt(res.headers['content-length'])
            let current = 0
            
            if (contentLength) {
                res.on('data', chunk => {
                    drawProgressBar(current += chunk.length / contentLength)
                })
            }
    
            res.pipe(fs.createWriteStream(concretePath))
            res.on('end', () => {
                console.log('\x1b[92m下载完毕\x1b[0m\n')
                resolve()
            })
        })
    })

}

module.exports = {
    download
}