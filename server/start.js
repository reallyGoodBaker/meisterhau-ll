const cp = require('child_process')
const path = require('path')
const fs = require('fs')

const { setupServer } = require('./setup')
const { copyFolder } = require('./sync')

const cpFiles = () => new Promise(resolve => {
    fs.cp(
        path.resolve(__dirname, '../files'),
        path.resolve(__dirname, '../dev'),
        { recursive: true },
        err => {
            if (err) {
                console.log(err)
                return resolve(false)
            }

            resolve(true)
        }
    )
})

function startDevServer() {
    cp.execSync('chcp 65001')
    const child = cp.spawn(
        'bedrock_server_mod', [],
        {
            cwd: path.resolve(__dirname, '../dev'),
            shell: true,
        }
    )

    child.stdout.pipe(process.stdout)
    child.stderr.pipe(process.stderr)
    process.stdin.pipe(child.stdin)
}

async function start() {
    // await setupServer()
    // await cpFiles()
    copyFolder(
        path.resolve(__dirname, '../files'),
        path.resolve(__dirname, '../dev')
    )
    startDevServer()
}

module.exports = {
    startDevServer, start,
}