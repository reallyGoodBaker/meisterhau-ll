const loader = require('./basic/loader')

module.exports = {
    setup() {
        try {
            loader()
        } catch (error) {
            log(error + '')
        }
    }
}