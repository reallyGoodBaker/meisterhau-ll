/**
 * @typedef {{[p: string]: keyof typeof stringParamTypeMap | `!${keyof typeof stringParamTypeMap}`}} ParamType
 */

const stringParamTypeMap = {
    bool: 0,
    int: 1,
    float: 2,
    string: 3,
    entity: 4,
    player: 5,
    xyz: 6,
    pos: 7,
    vec: 7,
    text: 8,
    message: 9,
    json: 10,
    item: 11,
    block: 12,
    effect: 13,
    enum: 14,
    // softEnum: 15,
    entities: 16,
    command: 17
}

const matchers = {
    required: /^<([\w:]+)>$/,
    optional: /^\[([\w:]+)\]$/,
}

/**
 * @param {number} index 
 * @param {keyof typeof stringParamTypeMap} type 
 * @param {string} id 
 * @param {boolean} isOptional 
 */
function newToken(index, type='enum', id, isOptional=true) {
    return {
        index, type, id, isOptional
    }
}

/**
 * @param {string} str 
 */
function parseCmdStr(str) {
    const frags = str.split(/ +/)
    const tokens = []

    frags.forEach((frag, i) => {
        let res, isOptional = -1
        if (res = matchers.required.exec(frag)) {
            isOptional = 0
        } else if (res = matchers.optional.exec(frag)) {
            isOptional = 1
        }

        if (isOptional !== -1) {
            const data = res[1]
            const typeDef = data.split(':')
            tokens.push(newToken(
                i, typeDef[1], typeDef[0], !!isOptional
            ))
            return
        }

        tokens.push(newToken(
            i, 'enum', frag, false
        ))
    })

    return tokens
}

/**
 * @param {ParamType[]} arr 
 */
function parseCmdArr(arr) {
    const tokens = []

    arr.forEach((el, i) => {
        const [id, typeDesc] = Object.entries(el)[0]
        let isOptional = true
            ,type = typeDesc
        
        if (typeDesc.startsWith('!')) {
            isOptional = false
            type = typeDesc.slice(1)
        }

        tokens.push(newToken(
            i, type, id, isOptional
        ))
    })

    return tokens
}

class Registry {
    /**@private*/ _cmd = null
    /**@private*/ _tokenListCollection = new Set()
    /**@private*/ _handlerCollection = []

    constructor(cmd) {
        this._cmd = cmd
    }

    /**@private*/ getCollection(len) {
        return this._handlerCollection[len] ?? (this._handlerCollection[len] = [])
    }

    /**
     * @param {string | ParamType[]} cmd 
     * @param {(cmd: any, origin: any, output: any, result: any) => void} handler 
     */
    register(cmd, handler) {
        if (!cmd || !handler) {
            return this
        }

        const tokens = typeof cmd === 'string' 
            ? parseCmdStr(cmd)
            : parseCmdArr(cmd)

        this._tokenListCollection.add(tokens)

        const len = tokens.length
        const finalList = tokens.reduce((pre, cur, i) => {
            if (cur.isOptional) {
                this.getCollection(pre.length)
                    .push([pre.map(t => t.id), handler])
            }

            return pre.concat(cur)
        }, [])

        this.getCollection(len)
            .push([finalList.map(l => l.id), handler])

        return this
    }

    submit() {
        this._tokenListCollection.forEach(tokens => {
            let ids = []

            for (const {id, type, isOptional} of tokens) {
                this.createArg(id, type, isOptional)
                ids.push(id)
            }

            this._cmd.overload(ids)
        })

        this.setCallback()
        this._cmd.setup()
    }

    /**@private*/ sameArr(arr1, arr2) {
        if (arr1.length !== arr2.length) {
            return false
        }

        return new Set(arr1.concat(arr2)).size === arr1.length 
    }

    /**@private*/ setCallback() {
        this._cmd.setCallback((cmd, origin, out, args) => {
            const argv = Object
                .keys(args)
                .filter(v => args[v])

            const pairs = this._handlerCollection[argv.length]
            const [_, handler] = pairs.find(([ids]) => this.sameArr(argv, ids)) || [, Function.prototype]
            
            handler.call(undefined, cmd, origin, out, args)
        })
    }

    /**@private*/ createArg(name, type, isOptional) {
        const createCmdVariable = enumId => {
            let extArgs = enumId ? [enumId, name, 1] : []

            return isOptional
                ? this._cmd.optional(name, stringParamTypeMap[type], ...extArgs)
                : this._cmd.mandatory(name, stringParamTypeMap[type], ...extArgs)
        }
        
        let enumId = null

        if (type === 'enum') {
            enumId = `enum_${name}`
            this._cmd.setEnum(enumId, [name])
        }

        return createCmdVariable(enumId)
    }
}

/**
 * @param {string} head 
 * @param {string} desc 
 * @param {0|1|2} [perm] 0 普通，1 管理员，2 控制台
 * @param {number} [flag] 
 * @param {string} [alias] 
 */
function cmd(head, desc, perm=1) {
    const command = mc.newCommand(head, desc, perm)
    const registry = new Registry(command)

    return {
        /**
         * @param {(registry: Registry) => void | Promise<void>} executor 
         */
        setup: executor => {
            executor.call(
                undefined, registry
            )
        }
    }
}

module.exports = {
    cmd, Registry
}