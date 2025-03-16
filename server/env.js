const { Lip } = require('./lip')
const { lipDependencies } = require('./config')
const path = require('path')

function ensureEnv() {
    const lip = new Lip(path.join(__dirname, '../dev'))
    for (const dep of lipDependencies) {
        lip.installOrUpdate(dep)
    }
}

ensureEnv()