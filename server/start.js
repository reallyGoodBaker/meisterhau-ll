const cp = require('child_process')
const path = require('path')
const fs = require('fs')

const { setupServer } = require('./setup')
const { copyFolder } = require('./sync')
const { Lip } = require('./lip')
const { lipDependencies } = require('./config')

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
    // cp.execSync('chcp 65001')
    return cp.spawn(
        'bedrock_server_mod', [],
        {
            cwd: path.join(__dirname, '../dev'),
            shell: true,
            stdio: 'inherit',
        }
    )
}

function initDev() {
    const lip = new Lip(path.join(__dirname, '../dev'))
    lip.cleanCache()
    console.log(lipDependencies)
    lipDependencies.forEach(dep => lip.install(dep))
}

async function start() {
    if (!fs.existsSync(path.resolve(__dirname, '../dev'))) {
        initDev()
    }
    // await setupServer()
    // await cpFiles()
    copyFolder(
        path.resolve(__dirname, '../files'),
        path.resolve(__dirname, '../dev')
    )
    startDevServer()
}


module.exports = {
    startDevServer, start, initDev
}