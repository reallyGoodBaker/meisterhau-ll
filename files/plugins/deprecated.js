const loaderConfig = require('./ServerConfig/loaderConfig')
const console = require('./Components/console/main')
const { cmd } = require('./Components/command')
const { EventEmitter } = require('./Components/events')

const componentsRoot = './plugins/Components'
const store = new Map()
const events = new EventEmitter()

function loadComponents() {
    const fileList = File.getFilesList(componentsRoot)

    listFor: for (const filename of fileList) {
        logger.setTitle('YumoCraft')
        for (const el of loaderConfig.ignore) {
            if (
                (typeof el === 'string' && filename.includes(el)) ||
                (el instanceof RegExp && el.test(filename))
            ) {
                continue listFor
            }
        }

        const filePath = `${componentsRoot}/${filename}`

        if (!File.exists(filePath)) {
            continue
        }

        if (File.checkIsDir(filePath)) {
            loadComponentFromFolder(filePath)
        } else {
            loadComponent(filePath, true)
        }
    }
}

function loadComponentFromFolder(folder) {
    const filenames = File.getFilesList(folder)

    for (const name of loaderConfig.entries) {
        if (filenames.includes(name)) {
            const filePath = folder + '/' + name

            return loadComponent(filePath)
        }
    }
}

function _ctx(load, name, unload=Function.prototype) {
    let ctx = {
        name, store, events, reload
    }

    const reloadHandler = target => {
        if (target !== name) {
            return
        }

        events.off('reload', reloadHandler)
        reload()
    }

    events.on('reload', reloadHandler)

    async function reload() {
        await unload.call(null)
        await load.call(ctx)
    }

    return ctx
}

function setupComponent(func, name, unload) {
    try {
        func.call(undefined, _ctx(func, name, unload))
        console.log(`\x1b[36m${name}\x1b[0m 加载成功`)
        events.emitNone('loaded', name)
    } catch (_) {
        console.log(`\x1b[31m${name} 加载失败\n${_}\x1b[0m`)
    }
}

/**
 * @param {string} filePath 
 */
function loadComponent(filePath, fromRoot=false) {
    filePath = filePath.replace(componentsRoot, './Components')
    const imported = require(filePath)
    const moduleName = filePath.slice(filePath.lastIndexOf('/') + 1)

    if (typeof imported === 'function') {
        setupComponent(imported, moduleName)
        return
    }

    for (const name of loaderConfig.loadEntries) {
        const setupScript = imported[name]
        const unloadScript = imported.unload
        if (typeof setupScript === 'function') {
            const folderPath = filePath.replace('/' + moduleName, '')
            const folderName = folderPath.slice(folderPath.lastIndexOf('/') + 1)
            setupComponent(setupScript, fromRoot ? moduleName : folderName, unloadScript)
        }
    }
}

function setupCmd() {
    cmd('yumo', '云梦', 1)
    .setup(registry => {
        registry.register('reload <name:text>', (_, ori, out, data) => {
            events.emitNone('reload', data.name)
        })
        .register('event <name:string> <args:text>', (_, ori, out, data) => {
            events.emitNone(data.name, data.args.split(/ /g))
            out.success('事件发送成功')
        })
        .submit()
    })
}

function init() {
    loadComponents()
    setupCmd()
}

init()