function test(affair, a, b, c) {
    affair.writeResult(114514)
    log(`你是 ${a} 个 ${b} 个 ${c} 个`)
}

module.exports = {
    1: test
}