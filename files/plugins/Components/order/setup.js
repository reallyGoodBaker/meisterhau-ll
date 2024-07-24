const setupOrderOp = require('./admin')
const setupOrderUser = require('./user')
const { setup: setupVirt } = require('./virt')

function setup() {
    setupVirt()
    setupOrderOp()
    setupOrderUser()
}

module.exports = {
    setup
}