const path = require('path')
const { initDev } = require('./start')
const fs = require('fs')

const DEV_FOLDER = path.join(__dirname, '../dev')

if (fs.existsSync(DEV_FOLDER)) {
    fs.rmSync(DEV_FOLDER, { recursive: true, force: true })
}
fs.mkdirSync(DEV_FOLDER)
initDev()