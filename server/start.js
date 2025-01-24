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
            env: process.env,
            cwd: path.join(__dirname, '../dev'),
            shell: true,
        }
    )

    child.stderr.on('data', data => process.stderr.write(data))
    child.stdout.on('data', data => process.stdout.write(data))
    process.stdin.on('data', data => child.stdin.write(data))
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