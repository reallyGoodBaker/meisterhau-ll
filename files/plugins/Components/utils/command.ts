const stringParamTypeMap = {
    bool: ParamType.Bool,
    int: ParamType.Int,
    float: ParamType.Float,
    string: ParamType.String,
    entity: ParamType.Actor,
    actor: ParamType.Actor,
    player: ParamType.Player,
    xyz: ParamType.BlockPos,
    pos: ParamType.Vec3,
    vec: ParamType.Vec3,
    text: ParamType.RawText,
    message: ParamType.Message,
    json: ParamType.JsonValue,
    item: ParamType.Item,
    block: ParamType.Block,
    effect: ParamType.Effect,
    enum: ParamType.Enum,
    softEnum: ParamType.SoftEnum,
    entities: ParamType.ActorType,
    actor_type: ParamType.ActorType,
    command: ParamType.Command,
    selector: ParamType.WildcardSelector,
}

type TypeStr = keyof typeof stringParamTypeMap
type CommandTypeStr = `?${TypeStr}` | TypeStr
type CommandArr = { [key: string]: CommandTypeStr }[]

const matchers = {
    required: /^<([\w:]+)>$/,
    optional: /^\[([\w:]+)\]$/,
}

interface IToken {
    index: number
    type: TypeStr
    id: string
    isOptional: boolean
}

function tk(index: number, type: string, id: string, isOptional=true) {
    return {
        index, type, id, isOptional
    }
}

function parseCmdStr(str: string) {
    const frags = str.trim().split(/ +/)
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
            tokens.push(tk(
                i, typeDef[1] as any, typeDef[0], !!isOptional
            ) as IToken)
            return
        }

        tokens.push(tk(
            i, 'enum', frag, false
        ) as IToken)
    })

    return tokens
}

function parseCmdArr(arr: CommandArr) {
    const tokens: IToken[] = []

    arr.forEach((el, i) => {
        const [id, typeDesc] = Object.entries(el)[0]
        let isOptional = false
            ,type = typeDesc

        if (typeDesc.startsWith('?')) {
            isOptional = true
            type = typeDesc.slice(1) as any
        }

        tokens.push(tk(
            i, type, id, isOptional
        ) as IToken)
    })

    return tokens
}

type Handler<T=any> = (cmd: Command, origin: CommandOrigin, output: CommandOutput, result: T) => void

export class Registry {
    private _cmd: Command
    private _tokenListCollection = new Set<IToken[]>()
    private _handlerCollection: any[][] = []

    constructor(cmd: Command) {
        this._cmd = cmd
    }

    private getCollection(len: number) {
        return this._handlerCollection[len] ?? (this._handlerCollection[len] = [])
    }

    register(cmd: string, handler: Handler) {
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

    private sameArr(arr1: any[], arr2: any[]) {
        if (arr1.length !== arr2.length) {
            return false
        }

        return new Set(arr1.concat(arr2)).size === arr1.length 
    }

    private setCallback() {
        this._cmd.setCallback((cmd, origin, out, args) => {
            const argv = Object
                .keys(args)
                .filter(v => args[v])
                .filter(v => !v.startsWith('enum'))

            const pairs = this._handlerCollection[argv.length]
            const [_, handler] = pairs.find(([ids]) => this.sameArr(argv, ids)) || [, Function.prototype]
            
            handler.call(undefined, cmd, origin, out, args)
        })
    }

    private registeredArgs = new Set()

    static enumIndex = 0

    private createArg(name: string, type: TypeStr, isOptional: boolean) {
        let argId = name

        if (this.registeredArgs.has(name)) {
            return
        }
        
        let enumId = null

        if (type === 'enum') {
            enumId = `enum_${Registry.enumIndex++}`
            this._cmd.setEnum(enumId, [ name ])
            argId = enumId
        }

        let extArgs = enumId ? [enumId, enumId, 1] : []

        isOptional
            ? this._cmd.optional(name, stringParamTypeMap[type], ...extArgs as any[])
            : this._cmd.mandatory(name, stringParamTypeMap[type], ...extArgs as any[])

        this.registeredArgs.add(name)
        return argId
    }

    private _submitted = false

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
        this._submitted = true
    }

    isSubmitted() {
        return this._submitted
    }
}

export enum CommandPermission {
    Everyone,
    OP,
    Console,
}

export const serverStarted = (function() {
    let serverRunning = false
    return (() => {
        if (serverRunning) {
            return Promise.resolve(null)
        }
        const { promise, resolve } = Promise.withResolvers()
        mc.listen('onServerStarted', () => {
            resolve(null)
            serverRunning = true
        })
        return promise
    }) as (() => Promise<void>)
})()

export type ConfigHandler<T> = (args: T, origin: Player | Entity) => string | string[]

export function cmd(head: string, desc: string, perm: 0|1|2 = CommandPermission.OP) {
    const command = mc.newCommand(head, desc, perm)
    const registry = new Registry(command)
    const register = (...args: any) => { registry.register.apply(registry, args) }
    const configRegister = (cmd: string, handler: ConfigHandler<unknown>) => {
        registry.register.call(registry, cmd, (_, ori, out, args) => {
            try {
                const result = handler(
                    args,
                    (ori.entity?.type === 'player' ? ori.player : ori.entity) as any,
                )

                if (Array.isArray(result)) {
                    result.forEach(r => out.addMessage(String(r)))
                    return
                }

                out.success(String(result))
            } catch (error) {
                out.error(String(error))
            }
        })
    }

    return {
        setup: async (executor: (register: <T = any>(cmd: string | CommandArr, handler: Handler<T>) => void, registry: Registry) => void | Promise<void>) => {
            await executor.call(
                undefined, register, registry
            )

            if (!registry.isSubmitted()) {
                await serverStarted()
                registry.submit()
            }
        },

        getRegistry: () => registry,

        configure: async (executor: (register: <T = any>(cmd: string | CommandArr, handler: ConfigHandler<T>) => void, registry: Registry) => void | Promise<void>) => {
            await executor.call(
                undefined, configRegister as any, registry
            )

            if (!registry.isSubmitted()) {
                await serverStarted()
                registry.submit()
            }
        },
    }
}