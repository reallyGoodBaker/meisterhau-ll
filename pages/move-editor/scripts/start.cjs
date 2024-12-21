const cp = require('child_process')
const path = require('path')

const pd = path.join(__dirname, '..')
const cmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'

function spawnServer() {
    return cp.spawn(cmd, [ 'run', 'server' ], { cwd: pd, shell: true })
}

function spawnEditor() {
    return cp.spawn(cmd, [ 'run', 'dev' ], { cwd: pd, shell: true })
}

function start() {
    const server = spawnServer()
    const editor = spawnEditor()

    server.stdout.on('data', data => process.stdout.write(data.toString()))
    editor.stdout.on('data', data => process.stdout.write(data.toString()))

    server.stderr.on('data', data => process.stderr.write(data.toString()))
    editor.stderr.on('data', data => process.stderr.write(data.toString()))
}

start()