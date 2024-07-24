const fs = require('fs')
const path = require('path')
const { download } = require('./download')
const unzipper = require('unzipper')
const cp = require('child_process')
const config = require('./config')
const os = require('os')

const bdsDownloadUrl = version => `https://minecraft.azureedge.net/bin-win/bedrock-server-${version}.zip`
const llDownloadUrl = version => `https://github.com/LiteLDev/LiteLoaderBDS/releases/download/${version}/LiteLoaderBDS.zip`

async function setupServer() {
    const devFolder = path.resolve(__dirname, '../dev')
    const downloadFolder = path.resolve(__dirname, '../download')
    const alias = config.alias

    const bdsName = 'bds.zip'
    const llName = 'liteloader.zip'

    if (!fs.existsSync(devFolder)) {
        fs.mkdirSync(devFolder)
    }

    if (!fs.existsSync(downloadFolder)) {
        fs.mkdirSync(downloadFolder)
    }

    await setupBds(alias, downloadFolder, bdsName, devFolder)
    await setupLiteLoader(alias, downloadFolder, llName, devFolder)
}


async function setupBds(alias, downloadFolder, bdsName, devFolder) {
    if (fs.existsSync(
        path.resolve(__dirname, '../dev/bedrock_server.exe')
    )) {
        return
    }

    if (!fs.existsSync(path.join(downloadFolder, bdsName))) {
        await download(bdsDownloadUrl(alias.bds), downloadFolder, bdsName)
    }

    await decompress(path.join(downloadFolder, bdsName), devFolder)
}


async function setupLiteLoader(alias, downloadFolder, llName, devFolder) {
    if (fs.existsSync(
        path.resolve(__dirname, '../dev/bedrock_server_mod.exe')
    )) {
        return
    }

    if (!fs.existsSync(path.join(downloadFolder, llName))) {
        await download(llDownloadUrl(alias.ll), downloadFolder, llName)
    }

    const tempDir = os.tmpdir()
    await decompress(path.join(downloadFolder, llName), tempDir)

    fs.cpSync(path.join(tempDir, 'LiteLoaderBDS'), devFolder, {
        force: true,
        recursive: true
    })

    await doModify()
}


async function doModify() {
    cp.execSync('cls')
    return await new Promise(res => {
        const child = cp.spawn('PeEditor', [], { cwd: path.resolve(__dirname, '../dev'), stdio: 'inherit' })
        child.on('message', m => {
            console.log(m)
        })
        child.on('close', () => {
            fs.cpSync(
                path.resolve(__dirname, '../files'),
                path.resolve(__dirname, '../dev'),
                { recursive: true }
            )
            res()
        })
    })
}

function decompress(fromFile, toFolder) {
    return new Promise(res => {
        console.log('开始解压')
        fs.createReadStream(fromFile)
            .pipe(unzipper.Extract({ path: toFolder }))
            .on('close', () => {
                console.log('\x1b[92m解压完成\x1b[0m\n')
                res()
            })
            .on('error', () => {
                console.log('\x1b[91m解压失败\x1b[0m\n')
                res()
            })
    })
}

module.exports = {
    setupServer
}