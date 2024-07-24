const symbolMatcher = Symbol('matcher')

const strictEqualMatcher = (pattern, value) => {
    return pattern === value
}

const looseEqualMatcher = (pattern, value) => {
    return pattern == value
}

function execExpression(exp) {
    if (typeof exp === 'function') {
        return exp.call(undefined)
    }

    return exp
}

function match(value, matchers) {
    for (const pattern of Reflect.ownKeys(matchers)) {
        const expression = matchers[pattern]
        const matcher = ((Object.getPrototypeOf(value).constructor) ?? Object)[symbolMatcher]
        console.log(matcher, typeof pattern, value)

        if (!matcher(pattern, value)) {
            continue
        }

        return execExpression(expression)
    }

    if ('_' in matchers) {
        return execExpression(matchers._)
    } else throw new SyntaxError('匹配范围过小，请尝试使用 "_" 通配符或者穷举所有可能性')
}

Object[symbolMatcher] = strictEqualMatcher

const a = {}
const res = match(a, {
    [a]: true,
    _: false
})

console.log(res)