const cp = require('child_process')
const fs = require('fs')
const path = require('path')

async function runCommand(command) {
    const { promise, resolve, reject } = Promise.withResolvers()

    cp.exec(command, (err, out) => {
        if (err) {
            reject(err)
        } else {
            resolve(out)
        }
    })

    return promise
}

async function setupServer() {
    if (!fs.existsSync(path.join(__dirname, '../dev'))) {
        fs.mkdirSync(path.join(__dirname, '../dev'), { recursive: true })
    }

    await runCommand('cd ../dev && lip -y install github.com/LiteLDev/LeviLamina@1.0.0-rc.1')
    await runCommand('cd ../dev && lip -y install gitea.litebds.com/LiteLDev/legacy-script-engine-nodejs')
}

module.exports = {
    setupServer
}