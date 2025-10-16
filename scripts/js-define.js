const fs = require('fs')
const path = require('path')

const inlinePattern = /\/\/#inline +(\w+) *\((.*)\)([\s\S]+?)\/\/\!inline/g
const definePattern = /\/\/#define +(\w+) +(.+)/g

/**
 * @param {string} code 
 * @param {string} body
 * @returns 
 */
function replaceInlines(code, name, argstr, body) {
    const argNames = argstr.split(',').map(arg => arg.trim())
    const frags = []

    let i = 0, last = 0
    while ((i = code.indexOf(name, last)) !== -1) {
        let arg = '',
            exprCounter = i,
            exprStack = 0,
            exprFinish = false,
            args = [],
            _body = body

        for (;!exprFinish; exprCounter++) {
            const char = code[exprCounter]

            if (char === '(') {
                exprStack++
                continue
            } else if (char === ')') {
                exprStack--
                if (exprStack === 0) {
                    args.push(arg)
                    arg = ''
                    exprFinish = true
                }
                continue
            }

            if (exprStack) {
                if (exprStack === 1 && char === ',') {
                    args.push(arg)
                    arg = ''
                    continue
                }

                arg += char
            }
        }

        frags.push(code.slice(last, i))
        argNames.forEach((name, i) => {
            _body = _body.replace(name, args[i])
        })
        frags.push(_body)
        last = exprCounter + 1
    }

    frags.push(code.slice(last))
    return frags.join('')
}

function transformBuilds() {
    const buildDir = path.join(__dirname, '../build')
    if (!fs.existsSync(buildDir)) {
        fs.mkdirSync(buildDir)
    }

    const builds = fs.readdirSync(buildDir, { recursive: true })
    builds.forEach(name => {
        const filePath = path.join(buildDir, name)
        if (filePath.endsWith('.js')) {
            transform(filePath)
        }
    })
}

function transform(filePath) {
    let code = fs.readFileSync(filePath, 'utf8')
    let result

    const definesReplace = []

    while (result = definePattern.exec(code))
        definesReplace.push(result)

    for (const [ full, pre, target ] of definesReplace) {
        code = code
            .replaceAll(full, '')
            .replaceAll(pre, target)
    }

    while (result = inlinePattern.exec(code)) {
        const [ , name, argstr, body ] = result
        code = replaceInlines(code, name, argstr, body)
    }

    fs.writeFileSync(filePath, code)
}

transformBuilds()