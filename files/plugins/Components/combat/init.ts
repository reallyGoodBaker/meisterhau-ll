import loader from './basic/loader'

export function setup() {
    try {
        loader()
    } catch (error) {
        log(error + '')
    }
}