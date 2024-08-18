const syncConfig = require('./config').sync || []
const buildsConfig = require('./config').builds || []
const fs = require('fs')
const path = require('path')
const watcher = require('node-watch')
const fsPromises = require('fs/promises')

/**
 * 
 * @param {string|{path: string; exclude?: RegExp}} each 
 */
function parseSyncConfig(each) {
    let /**@type {string}*/ _path,
        /**@type {RegExp}*/ exclude

    if (typeof each === 'string') {
        _path = each
    } else {
        _path = each.path
    }

    exclude = each.exclude
    
    validPath(_path)

    return {
        path: _path, exclude
    }
}

/**
 * @param {string} path 
 */
function validPath(path) {
    path = path[path.length - 1] === '/'
        ? path.slice(0, -1)
        : path

    const anyFolderIndex = path.indexOf('**')
    let anyFileIndex = path.indexOf('*')

    if (~anyFolderIndex) {
        const pre = path.slice(0, anyFolderIndex)
        const after = path.slice(anyFolderIndex + 2)

        if (pre && pre.includes('*')) {
            throw new IllegalSyncConfigError(' * 匹配符不能在 ** 匹配符之前')
        }

        if (!after) {
            throw new IllegalSyncConfigError(' ** 匹配符不能用作结尾')
        }

        if (after.includes('**')) {
            throw new IllegalSyncConfigError('最多只能有一个 ** 匹配符')
        }

        anyFileIndex = after.indexOf('*') + anyFolderIndex + 2
    }

    if (!~anyFileIndex) {
        return
    }

    if (anyFileIndex !== path.lastIndexOf('*')) {
        throw new IllegalSyncConfigError('最多只能有一个 * 匹配符')
    }

    if (anyFileIndex !== path.length - 1) {
        throw new IllegalSyncConfigError(' * 匹配符只能用于最后')
    }

    return

}

class IllegalSyncConfigError extends Error {
    constructor(msg) {
        super(`无效的 'sync' 配置${msg ? (': ' + msg) : ''}`)
        this.name = IllegalSyncConfigError.name
    }
}

function wrapSyncConfigs() {
    return syncConfig.map(v => parseSyncConfig(v))
}

function matchFile(syncConf, from, name) {
    const { path: _path, exclude } = syncConf
    const filePath = path.join(from, name)

    if (exclude && exclude.test(name)) {
        return false
    }

    let guess = path.resolve(__dirname, '../files', _path)
    if (_path.endsWith('*')) {
        guess = guess.slice(0, -1) + name
    }

    if (_path.includes('**')) {
        const anyFolderIndex = guess.indexOf('**')
        const pre = guess.slice(0, anyFolderIndex)
        const after = guess.slice(anyFolderIndex + 2)

        if (filePath.startsWith(pre) && filePath.endsWith(after)) {
            return true
        }

        return false
    }

    return guess === path.join(from, name)
}

function copyFolder(from, to, conf = wrapSyncConfigs()) {
    for (const name of fs.readdirSync(from)) {
        const filePath = path.join(from, name)
        const targetPath = path.join(to, name)
        if (fs.statSync(filePath).isFile()) {
            for (const c of conf) {
                if (matchFile(c, from, name)) {
                    console.log(c,name)
                    if (!fs.existsSync(to)) {
                        fs.mkdirSync(to, { recursive: true })
                    }

                    fs.copyFileSync(filePath, targetPath)
                    break
                }
            }
        }

        if (fs.statSync(filePath).isDirectory()) {
            copyFolder(filePath, targetPath)
        }
    }
}

function doTry(func) {
    return (...args) => {
        try {
            func.apply(null, args)
        } catch (e) {
            console.error(e)
        }
    }
}

function overrideDir(from, to, onlyRemove = false) {
    if (!fs.existsSync(from)) {
        return
    }

    if (fs.existsSync(to)) {
        fs.rmSync(to, { recursive: true, force: true })
    }

    if (onlyRemove) {
        return
    }

    fs.cpSync(
        from,
        to,
        {
            recursive: true,
            force: true,
            errorOnExist: true,
        }
    )
}

const build = path.resolve(__dirname, '../build')
const plugins = path.resolve(__dirname, '../dev/plugins')

function overrideBuild(name) {
    const onlyRemove = name.startsWith('-')
    const folderName = onlyRemove ? name.slice(1) : name

    overrideDir(
        path.join(build, folderName),
        path.join(plugins, folderName),
        onlyRemove
    )
}

function overrideBuilds() {
    buildsConfig.forEach(overrideBuild)
}

function sync() {
    const conf = wrapSyncConfigs()
    const files = path.resolve(__dirname, '../files')
    const dev = path.resolve(__dirname, '../dev')

    overrideBuilds()
    watcher(
        path.resolve(__dirname, '../files'),
        { recursive: true },
        doTry((type, filename) => {
            const { dir, base } = path.parse(filename)
            const targetPath = path.join(dev, path.relative(files, filename))

            if (type === 'remove') {
                fs.rmSync(targetPath, {recursive: true})
                console.log('removed: ', base)
                return
            }

            for (const c of conf) {
                const stat = fs.statSync(filename)
                if (matchFile(c, dir, base) && type === 'update' && stat.isFile()) {
                    fsPromises.copyFile(
                        filename,
                        targetPath
                    ).then(() => {
                        console.log('updated: ', base)
                    })
                }
            }

        })
    )
}

module.exports = {
    copyFolder, sync, parseSyncConfig
}