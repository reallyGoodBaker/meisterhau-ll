const { cmd } = require('../utils/command')
const { action } = require('../ui')
const { Menu } = require('./customer')
const Vendor = require('./vendor')

module.exports = () => {
    cmd('order', '订单操作', 0).setup(register => {
        register('customer', (_, o) => {
            action(...Menu()).send(o.player)
        })
        register('vendor', (_, o) => {
            action(...Vendor()).send(o.player)
        })
    })
}