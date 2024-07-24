const cp = require('child_process')
const fs = require('fs')
const http = require('http')
const os = require('os')
const path = require('path')
const UWP_PKGS = path.join(os.homedir(), 'AppData/Local/Packages')

function createServiceServer(port=10039) {
    http.createServer(async (req, res) => {
        if (req.url === '/') {
            res.end(`<script>
            const h = visualViewport.height * 0.92
            const left = (visualViewport.width - 780) / 2
            window.open('http://localhost:${port}/ui', '_blank', 'width=780,height=' + h + ',top=64,left=' + left)
            window.close()
            </script>`)
        }

        if (req.url === '/ui') {
            await sendUi(res)
            return
        }

        if (req.url === '/api') {
            let msg = ''
            req.on('data', c => msg += c.toString())
            req.on('end', async () => {
                const result = decodeURI(msg).split('&')
                    .map(v => v.replace(/name=(.*)/, '$1'))
                const diffs = diff(await getLoopbackExemptList(), result)
                diffs.forEach(({act, val}) => {
                    handlers[act].call(undefined, val)
                })

                redirect(res, port)
            })
            return
        }

        res.end()

    }).listen(port)

    cp.execSync(`start http://localhost:${port}`)
}

/**
 * @returns {Promise<any[]>}
 */
function getLoopbackExemptList() {
    const child = cp.exec('CheckNetIsolation LoopbackExempt -s')
    let str = ''
    child.stdout.on('data', v => {
        str += v.toString()
    })
    return new Promise(resolve => {
        child.stdout.on('end', () => {
            const arr = str.split('\n')
                .filter(v => v.includes(': ') && !v.includes('SID'))
                .map(v => v.split(': ')[1].trim())
            
            resolve(arr)
        })

        child.stdout.on('error', () => resolve([]))
    })
}

async function sendUi(res) {
    const exempted = await getLoopbackExemptList()
    const list = fs.readdirSync(UWP_PKGS)
        .map(n => `<label for="${n}"><input name="name" type="checkbox" value="${n}" id="${n}" ${exempted.includes(n.toLowerCase())? 'checked': ''}>${n}</label>`)
        .join('\n')
    
    res.setHeader('Content-Type', 'text/html')
    res.write(`<meta charset="UTF-8" />
<style>
    label {
        display: block;
        padding: 8px;
        border: solid 1px transparent;
    }
    label:hover {
        border-color: #999;
    }
    .submit {
        font-size: large;
        box-sizing: border-box;
        appearance: none;
        outline: none;
        border: solid 2px transparent;
        position: fixed;
        bottom: 16px;
        right: 16px;
        width: 52px;
        height: 52px;
        border-radius: 50%;
        background-color: teal;
        color: white;
        cursor: pointer;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
        transition: box-shadow 0.1s;
    }
    .submit:hover {
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
    }
    .submit:active {
        filter: brightness(0.8);
    }
</style>`)
    res.write(`<form action="/api" method="post">${list}<input class="submit" type="submit" value="✓"></form>`)
    res.end()
}

function diff(src, des) {
    let result = []

    new Set(src.concat(des)).forEach(v => {
        const inSrc = src.includes(v)
        const inDes = des.includes(v)

        if (!inSrc && inDes) {
            result.push({act: 'add', val: v})
            return
        }

        if (!inDes && inSrc) {
            result.push({act: 'rm', val: v})
            return
        }
    })

    return result
}

const handlers = {
    add(n) {
        cp.execSync(`CheckNetIsolation LoopbackExempt -a -n="${n}"`)
    },

    rm(n) {
        cp.execSync(`CheckNetIsolation LoopbackExempt -d -n="${n}"`)
    },
}

function redirect(res, port) {
    res.statusCode = 302
    res.setHeader('Location', `http://localhost:${port}/ui`)
    res.end()
}

if (process.platform === 'win32') {
    createServiceServer()
} else {
    console.log(`暂不支持 ${process.platform}`)
}