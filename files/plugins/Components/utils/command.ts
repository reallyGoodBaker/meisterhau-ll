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

interface IToken {
    index: number
    type: keyof typeof stringParamTypeMap
    id: string
    isOptional: boolean
}

function newToken(index: number, type='enum', id: string, isOptional=true) {
    return {
        index, type, id, isOptional
    }
}

function parseCmdStr(str: string) {
    const frags = str.split(/ +/)
    const tokens: IToken[] = []

    frags.forEach((frag, i) => {
        let res: RegExpExecArray | null, isOptional = -1
        if (res = matchers.required.exec(frag)) {
            isOptional = 0
        } else if (res = matchers.optional.exec(frag)) {
            isOptional = 1
        }

        if (isOptional !== -1) {
            const data = res![1]
            const typeDef = data.split(':')
            tokens.push(newToken(
                i, typeDef[1], typeDef[0], !!isOptional
            ) as IToken)
            return
        }

        tokens.push(newToken(
            i, 'enum', frag, false
        ) as IToken)
    })

    return tokens
}

function parseCmdArr(arr: ParamType[]) {
    const tokens: IToken[] = []

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
        ) as IToken)
    })

    return tokens
}

type Handler = (cmd: Command, origin: CommandOrigin, output: CommandOutput, result: any) => void

export class Registry {
    /**@private*/ _cmd: Command
    /**@private*/ _tokenListCollection = new Set<IToken[]>()
    /**@private*/ _handlerCollection: any[][] = []

    constructor(cmd: Command) {
        this._cmd = cmd
    }

    private getCollection(len: number) {
        return this._handlerCollection[len] ?? (this._handlerCollection[len] = [])
    }

    register(cmd: string | ParamType[], handler: Handler) {
        if (!cmd || !handler) {
            return this
        }

        const tokens = typeof cmd === 'string' 
            ? parseCmdStr(cmd)
            : parseCmdArr(cmd)

        this._tokenListCollection.add(tokens)

        const len = tokens.length
        const finalList = tokens.reduce<IToken[]>((pre, cur, i) => {
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

    /**@private*/ sameArr(arr1: any[], arr2: any[]) {
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

    /**@private*/ registeredArgs = new Set()

    /**@private*/ createArg(name: string, type: keyof typeof stringParamTypeMap, isOptional: boolean) {
        if (this.registeredArgs.has(name)) {
            return
        }
        
        let enumId = null

        if (type === 'enum') {
            enumId = `enum_${name}`
            this._cmd.setEnum(enumId, [name])
        }

        let extArgs = enumId ? [enumId, name, 1] : []

        isOptional
            ? this._cmd.optional(name, stringParamTypeMap[type], ...extArgs as any[])
            : this._cmd.mandatory(name, stringParamTypeMap[type], ...extArgs as any[])

        this.registeredArgs.add(name)
    }
}

/**
 * @param {string} head 
 * @param {string} desc 
 * @param {0|1|2} [perm] 0 普通，1 管理员，2 控制台
 * @param {number} [flag] 
 * @param {string} [alias] 
 */
export function cmd(head: string, desc: string, perm=1) {
    const command = mc.newCommand(head, desc, perm)
    const registry = new Registry(command)

    return {
        setup: (executor: (registry: Registry) => void | Promise<void>) => {
            executor.call(
                undefined, registry
            )
        }
    }
}