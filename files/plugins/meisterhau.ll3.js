'use strict';

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

var meisterhau = {};

var loadModule = {};

var loaderConfig = {
    ignore: [
        '.ignore',
        '.lib',
        /^events\.js$/
    ],
    entries: [
        'setup.js', 'init.js', 'index.js', 'main.js', 'export.js'
    ],
    loadEntries: [
        'setup', 'init'
    ]
};

const { loadEntries } = loaderConfig;

loadModule.load = m => {
    if (typeof m === 'function') {
        return m()
    }

    for (const k of loadEntries) {
        if (typeof m[k] === 'function') {
            return m[k]()
        }
    }
};

var events = {};

var hasRequiredEvents;

function requireEvents () {
	if (hasRequiredEvents) return events;
	hasRequiredEvents = 1;
	Object.defineProperty(events, "__esModule", { value: true });
	events.AsyncShortCircuitHook = events.AsyncWaterfallHook = events.AsyncBasicHook = events.ShortCircuitHook = events.WaterfallHook = events.BasicHook = events.EventEmitter = void 0;
	class WillNull {
	    val;
	    static NullErr = Error('Null values that may cause errors.');
	    constructor(val) {
	        this.val = val;
	    }
	    setValue(val) {
	        this.val = val;
	    }
	    isNull() {
	        return this.val === null;
	    }
	    expect(message) {
	        if (this.val !== null) {
	            return this.val;
	        }
	        throw Error(`${message}`);
	    }
	    unwrap() {
	        if (this.val !== null) {
	            return this.val;
	        }
	        throw WillNull.NullErr;
	    }
	}
	function Maybe(val) {
	    return new WillNull(val);
	}
	function Null() {
	    return new WillNull(null);
	}
	class Linked {
	    prev = Null();
	    next = Null();
	    raw = Null();
	    handler = Null();
	    connect(linked) {
	        linked.next.setValue(this.next.expect('Do not operate Linked alone'));
	        this.next.expect('Do not operate Linked alone')
	            .prev.setValue(linked);
	        this.next.setValue(linked);
	        linked.prev.setValue(this);
	        return linked;
	    }
	    disconnect() {
	        const prevErr = 'get prev fail at disconnect';
	        const nextErr = 'get next fail at disconnect';
	        this.prev.expect(prevErr)
	            .next
	            .setValue(this.next.expect(nextErr));
	        this.next.expect(nextErr)
	            .prev.setValue(this.prev.expect(prevErr));
	        this.prev.setValue(null);
	        this.next.setValue(null);
	        return this;
	    }
	    record(listener, raw) {
	        this.handler.setValue(listener);
	        if (raw) {
	            this.raw.setValue(raw);
	        }
	    }
	}
	class IndexedLinked {
	    thisArg;
	    rawRecord = new Map();
	    record = new Map();
	    Entry = new Linked();
	    End = new Linked();
	    _pointer = this.Entry;
	    constructor(thisArg = () => ({})) {
	        this.thisArg = thisArg;
	        this.Entry.next.setValue(this.End);
	        this.End.prev.setValue(this.Entry);
	    }
	    size() {
	        return this.record.size;
	    }
	    _recordNode(k, v) {
	        if (this.record.has(k)) {
	            return false;
	        }
	        this.record.set(k, v);
	        return true;
	    }
	    _recordRawNode(k, v) {
	        if (this.rawRecord.has(k)) {
	            return false;
	        }
	        this.rawRecord.set(k, v);
	        this._recordNode(v.handler.unwrap(), v);
	        return true;
	    }
	    _creator(listener) {
	        let node = new Linked();
	        node.record(listener);
	        return node;
	    }
	    _onceCreator(listener) {
	        let node = new Linked();
	        let self = this;
	        const wrapper = (...args) => {
	            try {
	                node.raw.expect('The function used to wrap is empty')
	                    .apply(self.thisArg(), args);
	            }
	            finally {
	                self.deleteNode(node);
	            }
	        };
	        node.record(wrapper, listener);
	        return node;
	    }
	    put(listener) {
	        const node = this._creator(listener);
	        if (this._recordNode(listener, node)) {
	            this._pointer.connect(node);
	            this._pointer = node;
	        }
	    }
	    prepend(listener) {
	        const node = this._creator(listener);
	        if (this._recordNode(listener, node)) {
	            this.Entry.connect(node);
	        }
	    }
	    once(listener) {
	        const node = this._onceCreator(listener);
	        try {
	            if (this._recordRawNode(node.raw.unwrap(), node)) {
	                this._pointer.connect(node);
	                this._pointer = node;
	            }
	        }
	        finally { }
	    }
	    prependOnce(listener) {
	        const node = this._onceCreator(listener);
	        try {
	            if (this._recordRawNode(node.raw.unwrap(), node)) {
	                this.Entry.connect(node);
	            }
	        }
	        finally { }
	    }
	    deleteNode(node) {
	        try {
	            if (this._pointer === node) {
	                this._pointer = node.prev.unwrap();
	            }
	            if (!node.raw.isNull()) {
	                this.rawRecord.delete(node.raw.unwrap());
	            }
	            this.record.delete(node.handler.unwrap());
	            node.disconnect();
	            return true;
	        }
	        catch (_) {
	            return false;
	        }
	    }
	    delete(listener) {
	        if (this.rawRecord.has(listener)) {
	            const linked = Maybe(this.rawRecord.get(listener) || null).expect("Don't modify Linekd outside of IndexedLinked");
	            this.deleteNode(linked);
	            return true;
	        }
	        if (this.record.has(listener)) {
	            const linked = Maybe(this.record.get(listener) || null)
	                .expect("Don't modify Linekd outside of IndexedLinked");
	            this.deleteNode(linked);
	            return true;
	        }
	        return false;
	    }
	    free() {
	        let toDel = this.Entry.next.expect('Free error');
	        while (toDel !== this.End) {
	            const toDelNext = toDel.next.expect('Free error');
	            this.deleteNode(toDel);
	            toDel = toDelNext;
	        }
	        this._pointer = this.Entry;
	    }
	    forEach(callback) {
	        let n = this.Entry;
	        while ((n = n.next.unwrap()) !== this.End) {
	            callback.call(undefined, n);
	        }
	    }
	    [Symbol.iterator] = () => {
	        let p = this.Entry;
	        const self = this;
	        return {
	            next() {
	                p = p.next.unwrap();
	                return {
	                    value: p,
	                    done: p.next.unwrap() === self.End
	                };
	            }
	        };
	    };
	}
	class EventEmitter {
	    /**@private*/ maxListeners = -1;
	    /**@private*/ _events = {};
	    /**@private*/ captureRejections = false;
	    thisArg = {};
	    setMaxListeners(size) {
	        this.maxListeners = size;
	        return this;
	    }
	    getMaxListeners() {
	        return this.maxListeners;
	    }
	    /**@private*/
	    _thisGetter = () => this.thisArg;
	    /**@private*/
	    _getEventLinked(type) {
	        let linked;
	        if (!(linked = this._events[type])) {
	            linked = this._events[type] = new IndexedLinked(this._thisGetter);
	        }
	        return linked;
	    }
	    /**@private*/
	    _canAddNew(size) {
	        return this.maxListeners !== -1 && size === this.maxListeners;
	    }
	    /**@private*/
	    _addListener(type, handler, prepend = false, once = false) {
	        this._callWatcherMethod('add', { type, handler, prepend, once });
	        const linked = this._getEventLinked(type);
	        if (this._canAddNew(linked.size())) {
	            this._emitError(RangeError('Listeners is full and cannot join a new listener, please use setMaxListeners to resize'));
	            return;
	        }
	        if (prepend) {
	            if (once) {
	                linked.prependOnce(handler);
	            }
	            else {
	                linked.prepend(handler);
	            }
	            return;
	        }
	        if (once) {
	            linked.once(handler);
	        }
	        else {
	            linked.put(handler);
	        }
	    }
	    addListener(type, handler) {
	        this._addListener(type, handler);
	        return this;
	    }
	    on(type, handler) {
	        this._addListener(type, handler);
	        return this;
	    }
	    prependListener(type, handler) {
	        this._addListener(type, handler, true);
	        return this;
	    }
	    /**@private*/
	    _removeListener(type, handler) {
	        this._callWatcherMethod('remove', { type, handler });
	        const eventLinked = this._getEventLinked(type);
	        eventLinked.delete(handler);
	        return this;
	    }
	    removeListener(type, handler) {
	        return this._removeListener(type, handler);
	    }
	    off(type, handler) {
	        return this._removeListener(type, handler);
	    }
	    removeAllListeners(type) {
	        this._callWatcherMethod('removeAll', { type });
	        this._getEventLinked(type).free();
	    }
	    /**@private*/
	    _emit(type, nullContext = false, ...args) {
	        this._callWatcherMethod('emit', { type, args });
	        const l = this._getEventLinked(type);
	        const ctx = this.thisArg;
	        this.thisArg = nullContext
	            ? undefined
	            : ctx;
	        let cur = l.Entry.next.expect('EventEmitter$_emit');
	        while (cur !== l.End) {
	            const nextNode = cur.next.expect('EventEmitter$_emit');
	            try {
	                const returned = cur.handler.unwrap().apply(this.thisArg, args);
	                if (this.captureRejections && returned instanceof Promise) {
	                    returned.catch(reason => this._emitError(reason));
	                }
	            }
	            catch (err) {
	                if (type === 'error') {
	                    throw err;
	                }
	                else {
	                    this._emitError(err);
	                }
	            }
	            cur = nextNode;
	        }
	        this.thisArg = ctx;
	    }
	    /**@private*/
	    _emitError(err) {
	        const size = this.listenerCount('error');
	        if (size > 0) {
	            try {
	                this._emit('error', true, err);
	            }
	            catch (err) {
	                throw err;
	            }
	            return;
	        }
	        throw err;
	    }
	    emit(type, ...args) {
	        this._emit(type, false, ...args);
	    }
	    emitNone(type, ...args) {
	        this._emit(type, true, ...args);
	    }
	    once(type, handler) {
	        this._addListener(type, handler, false, true);
	        return this;
	    }
	    prependOnceListener(type, handler) {
	        this._addListener(type, handler, true, true);
	        return this;
	    }
	    listenerCount(type) {
	        return this._getEventLinked(type).size();
	    }
	    listeners(type) {
	        const ev = this._getEventLinked(type);
	        const listeners = [];
	        let cur = ev.Entry.next.unwrap();
	        while (cur !== ev.End) {
	            listeners.push(cur.handler.unwrap());
	        }
	        return listeners;
	    }
	    rawListeners(type) {
	        const ev = this._getEventLinked(type);
	        const listeners = [];
	        let cur = ev.Entry.next.unwrap();
	        while (cur !== ev.End) {
	            try {
	                listeners.push(cur.raw.unwrap());
	            }
	            catch (_) {
	                listeners.push(cur.handler.unwrap());
	            }
	        }
	        return listeners;
	    }
	    eventNames() {
	        return Reflect.ownKeys(this._events);
	    }
	    constructor(opt) {
	        if (opt) {
	            this.captureRejections = opt.captureRejections || false;
	            this.thisArg = opt.thisArg || {};
	            this._enableWatcher = opt.enableWatcher || false;
	        }
	    }
	    /**@private*/
	    _watcher;
	    /**@private*/
	    _enableWatcher;
	    connectWatcher(watcher) {
	        if (!this._enableWatcher) {
	            return;
	        }
	        this._watcher = watcher;
	    }
	    disconnectWatcher() {
	        if (this._watcher) {
	            this._watcher = null;
	        }
	    }
	    /**@private*/
	    _callWatcherMethod(name, arg) {
	        if (!this._watcher) {
	            return;
	        }
	        try {
	            this._watcher[name]?.call(this, arg);
	        }
	        catch (er) {
	            this._emitError(er);
	        }
	    }
	}
	events.EventEmitter = EventEmitter;
	class AbstractHook {
	    /**@protected*/
	    list = new IndexedLinked(() => this);
	    add(handler) {
	        this.list.put(handler);
	        return this;
	    }
	    remove(handler) {
	        return this.list.delete(handler);
	    }
	}
	class BasicHook extends AbstractHook {
	    call(...args) {
	        const foreackCallback = (n) => this._call(n, args);
	        this.list.forEach(foreackCallback);
	    }
	    /**@private*/
	    _call(node, args) {
	        node.handler.unwrap()
	            .apply(undefined, args);
	    }
	}
	events.BasicHook = BasicHook;
	class WaterfallHook extends AbstractHook {
	    call(arg) {
	        let prev = null;
	        for (const n of this.list) {
	            const val = n.handler.unwrap()
	                .call(undefined, prev ?? arg);
	            prev = val ?? prev;
	        }
	    }
	}
	events.WaterfallHook = WaterfallHook;
	class ShortCircuitHook extends AbstractHook {
	    call(...args) {
	        for (const n of this.list) {
	            const val = n.handler.unwrap()
	                .apply(undefined, args);
	            if (val === false) {
	                return;
	            }
	        }
	    }
	}
	events.ShortCircuitHook = ShortCircuitHook;
	class AsyncBasicHook extends AbstractHook {
	    async call(...args) {
	        for (const n of this.list) {
	            await n.handler.unwrap()
	                .apply(undefined, args);
	        }
	    }
	}
	events.AsyncBasicHook = AsyncBasicHook;
	class AsyncWaterfallHook extends AbstractHook {
	    async call(arg) {
	        let prev = null;
	        for (const n of this.list) {
	            const val = await n.handler.unwrap()
	                .call(undefined, prev ?? arg);
	            prev = val ?? prev;
	        }
	    }
	}
	events.AsyncWaterfallHook = AsyncWaterfallHook;
	class AsyncShortCircuitHook extends AbstractHook {
	    async call(...args) {
	        for (const n of this.list) {
	            const val = await n.handler.unwrap()
	                .apply(undefined, args);
	            if (val === false) {
	                return;
	            }
	        }
	    }
	}
	events.AsyncShortCircuitHook = AsyncShortCircuitHook;
	return events;
}

/**
 * @typedef {{[p: string]: keyof typeof stringParamTypeMap | `!${keyof typeof stringParamTypeMap}`}} ParamType
 */

var command;
var hasRequiredCommand;

function requireCommand () {
	if (hasRequiredCommand) return command;
	hasRequiredCommand = 1;
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
	};

	const matchers = {
	    required: /^<([\w:]+)>$/,
	    optional: /^\[([\w:]+)\]$/,
	};

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
	    const frags = str.split(/ +/);
	    const tokens = [];

	    frags.forEach((frag, i) => {
	        let res, isOptional = -1;
	        if (res = matchers.required.exec(frag)) {
	            isOptional = 0;
	        } else if (res = matchers.optional.exec(frag)) {
	            isOptional = 1;
	        }

	        if (isOptional !== -1) {
	            const data = res[1];
	            const typeDef = data.split(':');
	            tokens.push(newToken(
	                i, typeDef[1], typeDef[0], !!isOptional
	            ));
	            return
	        }

	        tokens.push(newToken(
	            i, 'enum', frag, false
	        ));
	    });

	    return tokens
	}

	/**
	 * @param {ParamType[]} arr 
	 */
	function parseCmdArr(arr) {
	    const tokens = [];

	    arr.forEach((el, i) => {
	        const [id, typeDesc] = Object.entries(el)[0];
	        let isOptional = true
	            ,type = typeDesc;
	        
	        if (typeDesc.startsWith('!')) {
	            isOptional = false;
	            type = typeDesc.slice(1);
	        }

	        tokens.push(newToken(
	            i, type, id, isOptional
	        ));
	    });

	    return tokens
	}

	class Registry {
	    /**@private*/ _cmd = null
	    /**@private*/ _tokenListCollection = new Set()
	    /**@private*/ _handlerCollection = []

	    constructor(cmd) {
	        this._cmd = cmd;
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
	            : parseCmdArr(cmd);

	        this._tokenListCollection.add(tokens);

	        const len = tokens.length;
	        const finalList = tokens.reduce((pre, cur, i) => {
	            if (cur.isOptional) {
	                this.getCollection(pre.length)
	                    .push([pre.map(t => t.id), handler]);
	            }

	            return pre.concat(cur)
	        }, []);

	        this.getCollection(len)
	            .push([finalList.map(l => l.id), handler]);

	        return this
	    }

	    submit() {
	        this._tokenListCollection.forEach(tokens => {
	            let ids = [];

	            for (const {id, type, isOptional} of tokens) {
	                this.createArg(id, type, isOptional);
	                ids.push(id);
	            }

	            this._cmd.overload(ids);
	        });

	        this.setCallback();
	        this._cmd.setup();
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
	                .filter(v => args[v]);

	            const pairs = this._handlerCollection[argv.length];
	            const [_, handler] = pairs.find(([ids]) => this.sameArr(argv, ids)) || [, Function.prototype];
	            
	            handler.call(undefined, cmd, origin, out, args);
	        });
	    }

	    /**@private*/ createArg(name, type, isOptional) {
	        const createCmdVariable = enumId => {
	            let extArgs = enumId ? [enumId, name, 1] : [];

	            return isOptional
	                ? this._cmd.optional(name, stringParamTypeMap[type], ...extArgs)
	                : this._cmd.mandatory(name, stringParamTypeMap[type], ...extArgs)
	        };
	        
	        let enumId = null;

	        if (type === 'enum') {
	            enumId = `enum_${name}`;
	            this._cmd.setEnum(enumId, [name]);
	        }

	        return createCmdVariable(enumId)
	    }
	}

	/**
	 * @param {string} head 
	 * @param {string} desc 
	 * @param {0|1|2} [perm] 0 普通，1 管理员，2控制台
	 * @param {number} [flag] 
	 * @param {string} [alias] 
	 */
	function cmd(head, desc, perm=1) {
	    const command = mc.newCommand(head, desc, perm);
	    const registry = new Registry(command);

	    return {
	        /**
	         * @param {(registry: Registry) => void | Promise<void>} executor 
	         */
	        setup: executor => {
	            executor.call(
	                undefined, registry
	            );
	        }
	    }
	}

	command = {
	    cmd, Registry
	};
	return command;
}

var main = {exports: {}};

var console_1;
var hasRequiredConsole;

function requireConsole () {
	if (hasRequiredConsole) return console_1;
	hasRequiredConsole = 1;
	let formatting = 'minecraft';

	/**
	 * @param {'minecraft'|'ansiEscapeSeq'} type 
	 */
	function setFormatting(type) {
	    formatting = type;
	}

	const Formatting = {
	    black: "§0",
	    dark_blue: "§1",
	    dark_green: "§2",
	    dark_aqua: "§3",
	    dark_red: "§4",
	    dark_purple: "§5",
	    gold: "§6",
	    gray: "§7",
	    dark_gray: "§8",
	    blue: "§9",
	    green: "§a",
	    aqua: "§b",
	    red: "§c",
	    light_purple: "§d",
	    yellow: "§e",
	    white: "§f",
	    minecoin_gold: "§g",
	    obfuscated: "§k",
	    bold: "§l",
	    italic: "§o",
	    reset: "§r",
	    normal: ''
	};

	const FormattingANSLEscapeSequences = {
	    black: "\x1b[30m",
	    dark_blue: "\x1b[34m",
	    dark_green: "\x1b[32m",
	    dark_aqua: "\x1b[36m",
	    dark_red: "\x1b[31m",
	    dark_purple: "\x1b[35m",
	    dark_gray: "\x1b[90m",
	    gold: "\x1b[93m",
	    gray: "\x1b[37m",
	    blue: "\x1b[94m",
	    green: "\x1b[92m",
	    aqua: "\x1b[96m",
	    red: "\x1b[91m",
	    light_purple: "\x1b[95m",
	    yellow: "\x1b[33m",
	    white: "\x1b[97m",
	    minecoin_gold: "\x1b[93m",
	    obfuscated: "\x1b[7m",
	    bold: "\x1b[1m",
	    italic: "\x1b[3m",
	    reset: "\x1b[0m",
	    normal: ''
	};

	function style(key) {
	    if (formatting === 'minecraft') {
	        console.trace();
	    }
	    return formatting === 'minecraft'? Formatting[key]
	        : FormattingANSLEscapeSequences[key]
	}

	function proxify(obj) {
	    return new Proxy(obj, {
	        get(t, p) {
	            return style(t[p])
	        },
	        set() {
	            return false
	        }
	    })
	}

	const basic = proxify({
	    undefined: 'dark_blue',
	    boolean: 'dark_blue',
	    function: 'yellow',
	    number: 'aqua',
	    string: 'light_purple',
	    symbol: 'minecoin_gold'
	});

	const objectProp = proxify({
	    setterGetter: 'dark_green',
	    innenumerable: 'green',
	    preview: 'gray',
	    normal: 'blue',
	    prototype: 'dark_gray',
	    symbol: 'minecoin_gold'
	});

	const {EventEmitter} = requireEvents();

	let commandRegistry = {};

	/**
	 * @param {string} command 
	 * @param {(em: EventEmitter)=>void} handler 
	 * @param {any} [opt]
	 */
	function register(command, handler, opt = {}) {
	    let em = new EventEmitter({ captureRejections: true });
	    commandRegistry[command] = [em, opt];
	    handler(em);
	}

	function unregister(command) {
	    commandRegistry[command][0].emit('unregister');
	    delete commandRegistry[command];
	}

	function exec(commandStr, onerror = () => null) {
	    return new Promise(resolve => {
	        let [commandResolver, ...args] = splitRegular(commandStr);
	        const [em, opt] = commandRegistry[commandResolver];
	        let shouldStopFlowing = false;

	        em.on('error', onerror);
	        em.once('error', () => {
	            shouldStopFlowing = true;
	            resolve(false);
	        });

	        em.emit('exec', ...args);
	        if (shouldStopFlowing) return;

	        let argCur;
	        let unspecializedArgs = [];

	        for (let i = 0; i < args.length;) {
	            argCur = args[i];
	            if (argCur.startsWith('-')) {
	                let resCount = opt[argCur];
	                if (resCount) {
	                    let _args = args.slice(i + 1, i += resCount + 1);
	                    em.emit(argCur, ..._args);
	                } else {
	                    em.emit(argCur);
	                    i++;
	                }
	                if (shouldStopFlowing) return;
	                continue;
	            }

	            i++;
	            unspecializedArgs.push(argCur);
	        }
	        em.emit('default', ...unspecializedArgs);
	        if (shouldStopFlowing) return;

	        resolve(true);
	        em.off('error', onerror);
	    })
	}

	const states = {
	    blank: 0,
	    string: 1
	};

	/**
	 * @param {string} str 
	 */
	function splitRegular(str) {
	    str = str.trim();
	    const len = str.length;
	    let data = '';
	    let res = [];
	    let state = states.blank;

	    for (let i = 0; i < len; i++) {
	        const char = str[i];

	        if (state === states.string && char === '"') {
	            data += char;
	            res.push(data);
	            data = '';
	            state = states.blank;
	            continue;
	        }

	        if (state !== states.string && char === '"') {
	            if (data) {
	                res.push(data);
	                data = '';
	            }
	            state = states.string;
	            data += char;
	            continue;
	        }

	        if (state === states.blank && char === ' ') {
	            if (data) {
	                res.push(data);
	                data = '';
	            }
	        } else {
	            if (char !== '"') {
	                data += char;
	            }
	        }

	        if (i === len - 1) {
	            res.push(data);
	            data = '';
	        }
	    }

	    return res;
	}

	class TConsole {
	    static tConsole = null;
	    static __emitter__ = new EventEmitter();
	    static console = null;

	    static showDetail = true;
	    static tabSize = 2;

	    constructor(opt) {
	        this.console = opt.console;
	        this.update = opt.update;
	        this.unregister = unregister;
	        this.register = register;
	        this.exec = exec;
	        (function () {
	            TConsole.tConsole = this;
	        })();
	    }

	    getConsole() {
	        return this.console;
	    }

	    injectConsole() {
	        let Global = typeof window !== 'undefined' ? window :
	            typeof commonjsGlobal !== 'undefined' ? commonjsGlobal :
	                typeof globalThis !== 'undefined' ? globalThis :
	                    typeof self !== 'undefined' ? self : {};

	        Global.console = this.console;
	    }

	    showDetail(bool = true) {
	        TConsole.showDetail = bool;
	    }

	    tabSize(count = 2) {
	        TConsole.tabSize = count;
	    }

	    /**
	     * @param {'minecraft'|'ansiEscapeSeq'} type 
	     */
	    setFormatting(type) {
	        setFormatting(type);
	    }

	    update() { }

	    on(type, handler) {
	        TConsole.__emitter__.on(type, handler);
	        return this;
	    }

	    off(type, handler) {
	        TConsole.__emitter__.on(type, handler);
	    }


	}

	const tab = () => new Array(TConsole.tabSize).fill(' ').join('');
	const getTab = (count = 1) => new Array(count).fill(tab()).join('');

	class MsgBlock extends Array {
	    static get defaultColor() {
	        return style('white')
	    }
	    static get defaultStyle() {
	        return style('normal')
	    }

	    toTellrawString(tabCount = 0) {
	        let [_style, color, ...msgs] = this;

	        _style = _style || MsgBlock.defaultStyle;
	        color = color || MsgBlock.defaultColor;

	        let msg = msgs.reduce((pre, cur) => {
	            if (typeof cur === 'string') {
	                return pre + cur;
	            }

	            if (typeof cur === 'object' && cur instanceof MsgBlock) {
	                return pre + cur.toTellrawString();
	            }
	        }, '');

	        let returnVal = getTab(tabCount) + (color + _style + msg + style('reset')).trim();

	        return returnVal
	    }

	    toString(tabCount = 0) {
	        return this.toTellrawString(tabCount);
	    }

	}

	function mbf(...iterable) {
	    return MsgBlock.from(iterable);
	}

	function safeString(string) {
	    return string.replace(/"/g, '\\"');
	}

	function basicTypeMsg(data) {
	    const basicType = typeof data;
	    if (basicType in basic) return basicTypeParser(data, basicType);
	}

	function functionMsg(data, color) {
	    let str = safeString(data.toString());
	    let firstBlank = str.indexOf(' ');
	    if (str === '(') return str;
	    return mbf(style('italic'), color, str.slice(0, firstBlank), mbf('', style('normal'), str.slice(firstBlank)));
	}

	function getFunctionSignature(func, color) {
	    let str = safeString(func.toString());
	    let signEnd = /\)[\s]*\{/.exec(func).index + 1;
	    let firstBlank = str.indexOf(' ');

	    if (str[0] === '(') return `<Anonymous>${str.slice(0, signEnd)}`;
	    return mbf(style('italic'), color, str.slice(0, firstBlank), mbf('', style('normal'), str.slice(firstBlank, signEnd)));
	}

	function basicTypeParser(data, type) {
	    let color = basic[type];
	    if (type === 'function') {
	        return functionMsg(data, color);
	    }

	    if (type === 'undefined') {
	        return mbf('', color, 'undefined');
	    }

	    if (type === 'string') {
	        return mbf('', color, safeString(`'${data.toString()}'`));
	    }

	    return mbf('', color, data.toString());
	}

	function fakeNativeToString(name, ...args) {
	    function toString() { return `function ${name}(${args.join(', ')}) { [native code] }` }
	    return toString;
	}

	class RawTeller {
	    static sender = null;
	    /**
	     * @type {[string, string][]}
	     */
	    msgQueue = [];
	    pending = false;

	    static header = '';
	    /**
	     * @type {RawTeller}
	     */
	    static rawTeller;

	    constructor(header) {
	        this.header = header || RawTeller.header;
	        RawTeller.rawTeller = this;
	    }

	    send(msg) {
	        this.msgQueue.push(msg);
	    }

	    pend() {
	        this.pending = true;
	    }

	    active() {
	        if (this.pending) return;

	        this.msgQueue.forEach(msg => {
	            RawTeller.sender(`${this.header}${msg}`);
	        });

	        this.msgQueue = [];
	    }

	    setSender(func) {
	        RawTeller.sender = func;
	    }

	}

	/**
	 * @param {any} commander 
	 * @returns {Function}
	 */
	function getRawTeller(commander) {

	    let sender = new RawTeller();
	    sender.setSender(commander);

	    function send(msg) {
	        sender.send(msg);
	    }

	    send.toString = fakeNativeToString('send', 'msg');

	    send.update = () => {
	        sender.active();
	    };

	    let senderProxy = new Proxy(send, {
	        get(t, p) {
	            return t[p];
	        },

	        set() { return false }
	    });

	    return senderProxy;
	}

	const UNTRUSTED_HEADER = 'Untrusted >';
	const UNTRUSTED_HEADER_PREFIX = () => mbf(style('italic'), style('red'), UNTRUSTED_HEADER);

	function sendUntrusted(msg) {
	    RawTeller.rawTeller.send(UNTRUSTED_HEADER_PREFIX() + getTab() + msg);
	}

	function send(msg) {
	    RawTeller.rawTeller.send(msg);
	}

	const ConsoleSpecified = {
	    '-o': 1,
	    '-b': 0,
	    '--open': 1,
	    '--back': 0,
	    '-p': 1
	};

	async function _openLogic(terminal, index, msgBuilder) {
	    let data = terminal.get(index);
	    let msg = await msgBuilder('normal', data);
	    terminal.pushContext();

	    send(msg);
	}

	async function _backLogic(terminal, msgBuilder) {
	    if (!terminal.index) return;

	    let data = terminal.clearContext();
	    let msg = await msgBuilder('normal', data);

	    send(msg);
	}

	class Context {
	    data = null;
	    previews = [];
	    constructor(data, previews) {
	        this.data = data;
	        this.previews = previews;
	    }
	}

	class ConsoleTerminal {
	    static contexts = [];
	    static counter = -1;
	    context = null;
	    index = 0;

	    constructor(msgBuilder) {

	        const openLogic = index => {
	            _openLogic(this, index, msgBuilder);
	        };

	        const backLogic = () => {
	            _backLogic(this, msgBuilder);
	        };

	        register('con', em => {
	            em.on('-o', openLogic);
	            em.on('--open', openLogic);
	            em.on('-b', backLogic);
	            em.on('--back', backLogic);
	            em.on('-p', async data => sendUntrusted(await msgBuilder('normal', data)));

	            em.on('unregister', () => {
	                em.removeAllListeners('-o');
	                em.removeAllListeners('--open');
	                em.removeAllListeners('-b');
	                em.removeAllListeners('--back');
	                em.removeAllListeners('-p');
	            });
	        }, ConsoleSpecified);

	        let arr = [];
	        TConsole.__emitter__.on('--object', data => {
	            ConsoleTerminal.counter = -1;
	            this.context = new Context(data, [...arr]);
	            if (!ConsoleTerminal.contexts.length) this.pushContext();
	        });

	        TConsole.__emitter__.on('--preview', data => {
	            ConsoleTerminal.counter++;
	            arr.push(data);
	        });

	    }

	    clearContext() {
	        ConsoleTerminal.contexts.length = this.index;
	        this.index--;
	        this.updateContext();
	        return this.context.data;
	    }

	    pushContext() {
	        this.index = ConsoleTerminal.contexts.length;
	        ConsoleTerminal.contexts.push(this.context);
	        this.updateContext();
	    }

	    updateContext() {
	        this.context = ConsoleTerminal.contexts[this.index];
	    }

	    get(index = 0) {
	        return this.context.previews[index];
	    }

	}

	async function toString(obj, showDetails = false) {
	    let returnVal;
	    if (!showDetails) {
	        returnVal = await getPreviewMsg(obj);
	    }
	    returnVal = await getDetailsMsg(obj);

	    TConsole.__emitter__.emit('--object', obj);

	    return returnVal;
	}

	function getProto(obj) {
	    return Object.getPrototypeOf(obj);
	}

	function getClassPrefix(obj) {
	    let __proto__ = getProto(obj);
	    let constructor;

	    if (!__proto__) return '';

	    constructor = __proto__.constructor;
	    return constructor.name;
	}

	function getObjPropNames(obj) {
	    let arr = [];
	    for (const k in obj) {
	        arr.push(k);
	    }
	    return arr;
	}

	function getObjSymbols(obj) {
	    return Object.getOwnPropertySymbols(obj);
	}

	function getObjDescriptors(obj) {
	    return Object.getOwnPropertyDescriptors(obj);
	}

	async function keyValTile(obj, k, propColor) {
	    let ks;
	    let vs;

	    if (k === '[[Prototype]]') {
	        let prefix = getClassPrefix(obj);
	        if (!prefix) return '';
	        return mbf('', objectProp.prototype, k, ':  ', prefix);
	    }

	    ks = typeof k === 'symbol' ?
	        mbf(style('italic'), objectProp.symbol, safeString(k.toString())) :
	        mbf(style('italic'), propColor, safeString(k));

	    vs = typeof obj[k] === 'object' ?
	        (await parseObjValue(obj[k])) : basicTypeMsg(obj[k]);

	    if (typeof obj[k] === 'object' && obj[k]) {
	        TConsole.__emitter__.emit('--preview', obj[k]);
	        vs.push(getTab() + `$${ConsoleTerminal.counter}`);
	    }

	    return mbf('', style('normal'), ks, ':  ', vs);

	}

	async function parseExtend(obj, showInnenumerable = true) {
	    const objDesc = getObjDescriptors(obj);
	    let res = mbf();

	    for (const k in objDesc) {
	        const desc = objDesc[k];
	        const { set, get, enumerable } = desc;
	        const propName = safeString(typeof k === 'symbol' ? k.toString() : k);
	        let msg = mbf();

	        if (typeof get === 'function') {
	            msg.push('\n');
	            msg.push('', objectProp.setterGetter, `get ${propName}: `, await parseValPreview(get));
	        }

	        if (typeof set === 'function') {
	            msg.push('\n');
	            msg.push('', objectProp.setterGetter, `set ${propName}: `, await parseValPreview(set));
	        }

	        if (!enumerable && showInnenumerable) {
	            msg.push('\n');
	            msg.push('', objectProp.innenumerable, k, ': ', await parseValPreview(obj[k]));
	        }

	        if (msg.length) res.push(...msg);
	    }

	    if (res.length) return res;
	    return '';
	}

	async function paresePrototype(obj) {

	    let res = mbf();
	    let __proto__ = obj;

	    while ((__proto__ = getProto(__proto__)) !== Object.prototype && __proto__) {
	        res.push(await parseExtend(__proto__, false));
	    }

	    return res;
	}

	async function getDetailsMsg(obj) {
	    let propColor = objectProp.normal;
	    let classPrefix = getClassPrefix(obj);
	    let props = [];

	    let msg = mbf('\n', style('normal'), `${await parseValPreview(obj, classPrefix)}:`);
	    props = props.concat(getObjPropNames(obj)).concat(getObjSymbols(obj));

	    for (const cur of props) {
	        msg.push('\n', await keyValTile(obj, cur, propColor));
	    }

	    let extend = await parseExtend(obj);
	    if (extend.length > 2) {
	        msg.push(extend);
	    }

	    msg.push(await paresePrototype(obj));

	    const prototypeClassPrefix = await keyValTile(obj, '[[Prototype]]', propColor);
	    if (prototypeClassPrefix) msg.push('\n', prototypeClassPrefix);

	    return msg;
	}

	async function getPreviewMsg(obj) {
	    let propColor = objectProp.preview;
	    let classPrefix = getClassPrefix(obj);

	    let msg = mbf(style('italic'), style('normal'), `${classPrefix} {`);
	    let props = getObjPropNames(obj);
	    for (const cur of props) {
	        msg.push('\n', await keyValTile(obj, cur, propColor));
	    }
	    msg.push('}');

	    return msg;
	}

	async function parseObjValue(obj) {
	    let classPrefix = getClassPrefix(obj);
	    if (obj === null) {
	        return mbf('', basic.undefined, 'null');
	    }

	    if (obj instanceof Array) {
	        return await parseArray(obj, classPrefix);
	    }

	    return await parseValPreview(obj, classPrefix);
	}

	async function parseArray(obj, classPrefix) {
	    if (classPrefix === 'Array') classPrefix = '';
	    let res = mbf(style('italic'), '', `${classPrefix}(${obj.length}) [`);
	    let i = 0;
	    for (const cur of obj) {
	        if (typeof cur === 'object') {
	            if (cur === null) res.push(mbf('', basic.undefined, 'null'));
	            else res.push(await parseValPreview(cur, classPrefix));
	        } else {
	            res.push(basicTypeMsg(cur));
	        }
	        if (i < obj.length - 1) {
	            res.push(', ');
	        }
	        i++;
	    }
	    res.push(']');
	    return res;
	}

	async function parseValPreview(obj, classPrefix) {

	    const keys = specClassParsers.keys();
	    for (const k of keys) {
	        if (obj instanceof k) {
	            return await getSpecParser(k).call(undefined, obj, classPrefix);
	        }
	    }

	    if (typeof obj !== 'object') {
	        return basicTypeMsg(obj);
	    }

	    classPrefix = classPrefix ? classPrefix + ' ' : '';
	    return mbf('', objectProp.preview, `${classPrefix}{ ... }`,);
	}

	/**
	 * @type {Map<Function, Function>}
	 */
	let specClassParsers = new Map();

	function getSpecParser(instanceClass) {
	    if (specClassParsers.has(instanceClass)) {
	        return specClassParsers.get(instanceClass);
	    }

	    return null;
	}

	function registerSpecParser(instanceClass, handler) {
	    specClassParsers.set(instanceClass, handler);
	}

	const getPromiseState = (() => {
	    let obj = {};
	    let promiseState = Symbol('promiseState');
	    let promiseValue = Symbol('promiseValue');

	    return p => {
	        let _p = Promise.race([p, obj]);
	        _p[promiseState] = 'pending';

	        _p.then(v => {
	            if (v === obj) _p[promiseState] = 'pending';
	            else _p[promiseState] = 'fulfilled', _p[promiseValue] = v;
	        }, reason => (_p[promiseState] = 'rejected', _p[promiseValue] = reason));

	        return { promiseState, promiseValue, p: _p };
	    };

	})();

	function doRegisterSpecParsers() {
	    registerSpecParser(Array, (obj, classPrefix) => {
	        return mbf(style('italic'), objectProp.preview, `${classPrefix}`, '(', basicTypeMsg(obj.length), style('italic'), objectProp.preview, ')');
	    });

	    registerSpecParser(Promise, async (obj, classPrefix) => {
	        let { promiseState, promiseValue, p } = getPromiseState(obj);
	        let state = p[promiseState];
	        let value = p[promiseValue];
	        let message;

	        let msg = async () => {
	            state = p[promiseState];
	            value = p[promiseValue];
	            return mbf(style('italic'), objectProp.preview, `${classPrefix}`, ` { <${state}>${state === 'pending' ? '' : ': ' + (typeof value === 'object' ? await parseValPreview(value, classPrefix) : basicTypeMsg(value))} }`);
	        };

	        try {
	            await p;
	        } catch (error) { }

	        message = await msg();

	        return message;
	    });


	    registerSpecParser(Error, obj => {
	        return mbf('', style('normal'), obj.stack);
	    });

	    registerSpecParser(Function, obj => {
	        const msg = getFunctionSignature(obj, basic.function);
	        return mbf('', basic.function, msg);
	    });


	}

	class Format {
	    /**
	     * @type {Format[]}
	     */
	    static formats = [];

	    constructor(opt) {
	        this.checker = opt.checker;
	        this.parse = opt.parse;

	        Format.formats.push(this);
	    }

	}

	function check(str) {
	    let i = 0;
	    for (const format of Format.formats) {
	        if (format.checker.test(str)) {
	            return i;
	        }
	        i++;
	    }
	    return false;
	}

	/**
	 * @param {{checker: RegExp, parse: (value: any) => any}} opt 
	 */
	function addFormat(opt) {
	    return new Format(opt);
	}

	async function parseFormat(str, value, format) {
	    const res = format.checker.exec(str);
	    const args = [...res];
	    const returnVal = await format.parse(value, ...args);

	    return str.replace(format.checker, returnVal);
	}

	async function getfstr(formatStr, ...args) {
	    let _args = [...args];
	    let index;
	    let returnVal;

	    while (typeof (index = check(await returnVal || formatStr)) === 'number') {
	        let value = _args.shift();
	        let format = Format.formats[index];

	        returnVal = await parseFormat(returnVal || formatStr, value, format);
	    }

	    return returnVal;
	}

	function initfstring() {

	    addFormat({
	        checker: /%d/,
	        parse(value) {
	            return mbf('', basic.number, new Number(value).toFixed(0));
	        }
	    });

	    addFormat({
	        checker: /%[o|O]/,
	        async parse(v) {
	            return mbf(style('italic'), style('normal'), await toString(v, TConsole.showDetail));
	        }
	    });

	    addFormat({
	        checker: /%(.*?)f/,
	        parse(v, $, $1) {
	            if ($1.startsWith('.')) {
	                $1 = $1.slice(1);
	                return mbf('', basic.number, new Number(v).toFixed(+$1));
	            }
	            return mbf('', basic.number, new Number(v));
	        }
	    });

	}

	/**
	 * @param {(msg: string) => void} receiver 
	 * @returns {TConsole}
	 */
	function initConsole(receiver) {

	    doRegisterSpecParsers();
	    initfstring();


	    const rawSend = getRawTeller(receiver);
	    const send = async msg => rawSend(await msg);

	    async function buildMsg(s = 'white', ...args) {
	        let res = mbf('', style(s));
	        let i = -1;

	        if (typeof args[0] === 'string') {
	            let fstr = await getfstr(...args);
	            if (fstr) return fstr;
	        }

	        for (const cur of args) {
	            i++;
	            let msg = typeof cur === 'object' ? await toString(cur, TConsole.showDetail) :
	                typeof cur === 'string' ? mbf('', style(s), safeString(cur)) : basicTypeMsg(cur);

	            if (i) res.push(getTab());
	            res.push(msg);
	        }

	        return res;
	    }

	    new ConsoleTerminal(buildMsg);

	    function log(...args) {
	        let res;
	        try {
	            res = buildMsg('white', ...args);
	        } catch (e) {
	            error(e);
	        }

	        send(res);
	    }

	    function error(...args) {
	        let err;
	        try {
	            err = buildMsg('red', ...args);
	        } catch (e) {
	            send(mbf('', style('red'), 'Fatal Error: You should have crashed your game!'));
	        }

	        send(err);
	    }

	    function warn(...args) {
	        let res;
	        try {
	            res = buildMsg('yellow', ...args);
	        } catch (e) {
	            error(e);
	        }

	        send(res);
	    }

	    function getTraceStack(sliceStart = 0) {
	        return Error('').stack.split('\n').slice(sliceStart + 2).join('\n');
	    }

	    function trace() {
	        let stack = getTraceStack(1);
	        stack = 'trace():\n' + stack;

	        send(buildMsg('white', stack));
	    }

	    function assert(condition, ...data) {
	        if (!condition) {
	            error('Assertion failed: ', ...data, getTraceStack(1));
	        }
	    }

	    let _counts = {};
	    function count(label = 'default') {
	        _counts[label] ? _counts[label]++ : _counts[label] = 1;
	        log(`${label}: ${_counts[label]}`);
	    }

	    function countReset(label = 'default') {
	        if (_counts[label]) {
	            delete _counts[label];
	        }
	    }


	    let _tickNow = 1;
	    let _timers = {};
	    function updateTimer() {
	        _tickNow++;
	    }

	    function time(label = 'default') {
	        _timers[label] = _tickNow;
	    }

	    function timeLog(label = 'default') {
	        let tkNow = _tickNow;
	        let tkBefore = _timers[label];

	        if (!tkBefore) {
	            warn(`Timer '${label}' does not exist`, getTraceStack(1));
	            return;
	        }

	        let res = tkNow - tkBefore;
	        log(`${label}: ${res} ticks (${res * 50} ms)`);
	    }

	    function timeEnd(label = 'default') {
	        timeLog(label);
	        if (_timers[label]) {
	            delete _timers[label];
	        }
	    }


	    function updateRawTeller() {
	        rawSend.update();
	    }

	    function update() {
	        updateTimer();
	        updateRawTeller();
	    }

	    const _console = {
	        log, error, warn, trace, assert, count, countReset,
	        time, timeLog, timeEnd
	    };

	    return new TConsole({ update, console: _console });

	}

	console_1 = { initConsole };
	return console_1;
}

var hasRequiredMain;

function requireMain () {
	if (hasRequiredMain) return main.exports;
	hasRequiredMain = 1;
	(function (module, exports) {
		const {initConsole} = requireConsole();

		const tConsole = initConsole(msg => log(`${msg}`));
		tConsole.setFormatting('ansiEscapeSeq');

		setInterval(() => tConsole.update(), 20);

		module.exports = tConsole.getConsole();
		exports.tConsole = tConsole; 
	} (main, main.exports));
	return main.exports;
}

var server;
var hasRequiredServer;

function requireServer () {
	if (hasRequiredServer) return server;
	hasRequiredServer = 1;
	const console = requireMain();

	function handleCall(msg, em) {
	    const { id, name, args } = msg;
	    em.emitNone('call', id, name, args);
	}

	function handleReturn(msg, em) {
	    const { id, success, val } = msg;
	    em.emitNone('return', id, success, val);
	}

	function setup(list, em) {
	    const server = new HttpServer();

	    server.onPost('/rpc', (req, res) => {
	        try {
	            const rpcMessages = JSON.parse(req.body);
	            console.log(rpcMessages);

	            rpcMessages.forEach(msg => {
	                if (msg.type === 'call') {
	                    return handleCall(msg, em)
	                }

	                if (msg.type === 'return') {
	                    return handleReturn(msg, em)
	                }
	            });
	        } finally {
	            res.status = 200;
	            res.reason = "OK";
	            res.write(JSON.stringify(list.splice(0, list.length)));
	        }
	    })
	    .listen('localhost', 19999);

	    return server
	}

	server = {
	    createServer: setup
	};
	return server;
}

var setup_1;
var hasRequiredSetup;

function requireSetup () {
	if (hasRequiredSetup) return setup_1;
	hasRequiredSetup = 1;
	const { EventEmitter } = requireEvents();
	const { cmd } = requireCommand();
	const { createServer } = requireServer();
	requireMain();

	const em = new EventEmitter();
	const rpcChannel = [];
	const remoteFuncs = new Map();
	const server = createServer(rpcChannel, em);

	function rpcCall(id, name, args) {
	    return {
	        type: 'call',
	        id, name, args
	    }
	}

	function rpcReturn(id, success, val) {
	    return {
	        type: 'return',
	        id, success, val
	    }
	}
	function remoteCall(name, ...args) {
	    const id = Math.random().toString(36).slice(2);
	    const rpcMsg = rpcCall(id, name, args);

	    rpcChannel.push(rpcMsg);

	    return new Promise((res, rej) => {
	        em.once(id, (success, val) => {
	            const done = success ? res : rej;
	            done(val);
	        });
	    })
	}

	function remoteFunction(name, func) {
	    remoteFuncs.set(name, func);
	}

	function setupCallHandler() {
	    em.on('call', (id, name, args) => {
	        let func = remoteFuncs.get(name);
	        if (!func) {
	            return rpcChannel.push(rpcReturn(id, false, 'null'))
	        }

	        let val, success = true;
	        try {
	            val = func.apply(null, args);
	        } catch (error) {
	            val = error;
	            success = false;
	        }

	        return rpcChannel.push(rpcReturn(id, success, val))
	    });
	}

	function setupReturnHandler() {
	    em.on('return', (id, success, val) => {
	        em.emitNone(id, success, val);
	    });
	}


	function setup() {
	    setupCallHandler();
	    setupReturnHandler();
	    cmd('func', '函数', 1).setup(registry => {
	        registry.register('<name:string> <args:string>', async (cmd, origin, output, res) => {
	            const pl = origin.player;
	            remoteCall(res.name, ...res.args.split(' '))
	                .then(v => pl.tell(v.toString()))
	                .catch(e => pl.tell(e.toString()));
	        }).submit();
	    });
	}

	function unload() {
	    server.stop();
	}

	const remote = {
	    call: remoteCall,
	    expose: remoteFunction
	};

	setup_1 = {
	    setup, unload, remote
	};
	return setup_1;
}

var basic;
var hasRequiredBasic;

function requireBasic () {
	if (hasRequiredBasic) return basic;
	hasRequiredBasic = 1;
	requireMain();

	function playAnim(pl, anim, nextAnim, time, stopExp, controller) {
	    mc.runcmdEx(`/playanimation "${pl.name}" ` + [anim, nextAnim, time, stopExp, controller].filter(x => x).join(' '));
	}

	function playSound(pl, sound, pos, volume, pitch, minVolume) {
	    mc.runcmdEx(`/playsound ${sound} ${pl.name} ` + [
	        pos.x, pos.y, pos.z, volume, pitch, minVolume
	    ].join(' '));
	}

	function playSoundAll(sound, pos, volume, pitch, minVolume) {
	    mc.runcmdEx(`/playsound ${sound} @a ` + [
	        pos.x, pos.y, pos.z, volume, pitch, minVolume
	    ].join(' '));
	}

	function playParticle(particle, pos) {
	    mc.runcmdEx(`/particle ${particle} ` + [
	        pos.x, pos.y, pos.z
	    ].join(' '));
	}

	basic = {
	    playAnim, playSound, playSoundAll, playParticle,
	};
	return basic;
}

var kinematics;
var hasRequiredKinematics;

function requireKinematics () {
	if (hasRequiredKinematics) return kinematics;
	hasRequiredKinematics = 1;
	const { remote } = requireSetup();

	async function knockback(en, x, z, h, v) {
	    return await remote.call('knockback', en.uniqueId, x, z, h, v)
	}

	async function impulse(en, x, y, z) {
	    return await remote.call('impulse', en.uniqueId, x, y, z)
	}

	async function clearVelocity(en) {
	    return await remote.call('clearVelocity', en.uniqueId)
	}

	async function applyKnockbackAtVelocityDirection(en, h, v) {
	    return await remote.call('applyKnockbackAtVelocityDirection', en.uniqueId, h, v)
	}

	async function rotate(en, pitch, yaw) {
	    return await remote.call('rotate', en.uniqueId, pitch, yaw)
	}

	async function faceTo(src, t) {
	    return await remote.call('faceTo', src.uniqueId, t.uniqueId)
	}

	kinematics = {
	    knockback, impulse, clearVelocity, applyKnockbackAtVelocityDirection, rotate, faceTo
	};
	return kinematics;
}

var kinematic;
var hasRequiredKinematic;

function requireKinematic () {
	if (hasRequiredKinematic) return kinematic;
	hasRequiredKinematic = 1;
	const { knockback } = requireKinematics();
	requireMain();


	const setVelocity = (pl, rotation, h, v) => {
	    const { yaw } = pl.direction;
	    const rad = (yaw + rotation) * Math.PI / 180.0;
	    knockback(pl, Math.cos(rad), Math.sin(rad), h, v);
	};

	function isCollide(pl) {
	    const { x: _x, z: _z } = pl.pos;
	    const x = Math.abs(_x);
	    const z = Math.abs(_z);

	    let mayCollide = x - Math.floor(x) < 0.301 ? 1
	        : x - Math.floor(x) > 0.699 ? 2
	            : z - Math.floor(z) < 0.301 ? 3
	                : z - Math.floor(z) > 0.699 ? 4 : 0;

	    const bPos = pl.blockPos;

	    switch (mayCollide) {
	        default:
	            return false
	    
	        case 1:
	            const nx = mc.getBlock(bPos.x - 1, bPos.y, bPos.z, bPos.dimid);
	            return !nx.isAir && !nx.thickness

	        case 2:
	            const px = mc.getBlock(bPos.x + 1, bPos.y, bPos.z, bPos.dimid);
	            return !px.isAir && !px.thickness
	        
	        case 3:
	            const nz = mc.getBlock(bPos.x, bPos.y, bPos.z - 1, bPos.dimid);
	            return !nz.isAir && !nz.thickness
	        
	        case 4:
	            const pz = mc.getBlock(bPos.x, bPos.y, bPos.z + 1, bPos.dimid);
	            return !pz.isAir && !pz.thickness 
	    }
	}

	kinematic = {
	    setVelocity, isCollide
	};
	return kinematic;
}

var _default;
var hasRequired_default;

function require_default () {
	if (hasRequired_default) return _default;
	hasRequired_default = 1;
	/// <reference path="../basic/types.d.ts"/>

	const { playAnim, playSoundAll, playParticle } = requireBasic();
	requireMain();
	requireKinematic();

	class DefaultMoves {
	    animations = {
	        parried: 'animation.general.parried.right',
	        hit: 'animation.general.hit',
	        parry: '',
	        knockdown: 'animation.general.fell',
	        blocked: 'animation.general.blocked.right',
	        block: '',
	    }

	    sounds = {
	        parry: 'weapon.parry',
	        blocked: 'weapon.sword.hit3',
	        block: 'weapon.sword.hit2',
	    }

	    /**
	     * @type {Move}
	     */
	    blocked = {
	        cast: 9,
	        onEnter: (pl, ctx) => {
	            playAnim(pl, this.animations.blocked);
	            playSoundAll(this.sounds.blocked, pl.pos, 1);
	            ctx.movementInput(pl, false);
	            ctx.freeze(pl);
	            ctx.setVelocity(pl, -100, 0.8, -2);
	        },
	        onLeave(pl, ctx) {
	            ctx.movementInput(pl, true);
	            ctx.unfreeze(pl);
	        },
	        timeline: {
	            8: (pl, ctx) => ctx.trap(pl, { tag: 'blockedCounter' })
	        },
	        transitions: {}
	    }

	    /**
	     * @type {Move}
	     */
	    block = {
	        cast: 5,
	        onEnter: (pl, ctx) => {
	            ctx.status.isBlocking = true;
	            playAnim(pl, this.animations.block);
	            playSoundAll(this.sounds.block, pl.pos, 1);
	            ctx.movementInput(pl, false);
	            ctx.freeze(pl);
	        },
	        onLeave(pl, ctx) {
	            ctx.movementInput(pl, true);
	            ctx.unfreeze(pl);
	            ctx.status.isBlocking = false;
	        },
	        timeline: {
	            4: (pl, ctx) => ctx.trap(pl, { tag: 'blockCounter' })
	        },
	        transitions: {}
	    }

	    /**
	     * @type {Move}
	     */
	    hurt = {
	        cast: Infinity,
	        onEnter: (pl, ctx) => {
	            ctx.movementInput(pl, false);
	            ctx.freeze(pl);
	            ctx.status.disableInputs([
	                'onAttack',
	                'onUseItem',
	            ]);
	            const [ ,, { stiffness, customHurtAnimation } ] = ctx.rawArgs;
	            const hurtAnim = customHurtAnimation ?? this.animations.hit;

	            playAnim(pl, hurtAnim);
	            ctx.task.queue(() => {
	                ctx.trap(pl, { tag: 'recover' });
	            }, stiffness).run();
	        },
	        onLeave(pl, ctx) {
	            ctx.status.shocked = false;
	            ctx.status.enableInputs([
	                'onAttack',
	                'onUseItem',
	            ]);
	            ctx.unfreeze(pl);
	        },
	        onTick(pl, ctx) {
	            if (ctx.status.shocked) {
	                ctx.trap(pl, { tag: 'hitWall' });
	            }
	        },
	        transitions: { }
	    }

	    /**
	     * @type {Move}
	     */
	    hitWall = {
	        cast: 25,
	        onEnter: (pl, ctx) => {
	            ctx.movementInput(pl, false);
	            ctx.freeze(pl);
	            ctx.status.disableInputs([
	                'onAttack',
	                'onUseItem',
	            ]);
	            playAnim(pl, 'animation.general.hit_wall');
	        },
	        onLeave(pl, ctx) {
	            ctx.unfreeze(pl);
	            ctx.status.enableInputs([
	                'onAttack',
	                'onUseItem',
	            ]);
	        },
	        transitions: { }
	    }

	    /**
	     * @type {Move}
	     */
	    parried = {
	        cast: 35,
	        onEnter: (pl, ctx) => {
	            ctx.movementInput(pl, false);
	            ctx.freeze(pl);
	            ctx.status.disableInputs([
	                'onAttack',
	                'onUseItem',
	            ]);
	            playAnim(pl, this.animations.parried);
	        },
	        onLeave(pl, ctx) {
	            ctx.unfreeze(pl);
	            ctx.status.enableInputs([
	                'onAttack',
	                'onUseItem'
	            ]);
	        },
	        timeline: {
	            4: (pl, ctx) => ctx.setVelocity(pl, -140, 1.5, -2),
	            12: (pl, ctx) => ctx.lookAtTarget(pl),
	        },
	        transitions: { }
	    }

	    /**
	     * @type {Move}
	     */
	    parry = {
	        cast: 10,
	        backswing: 11,
	        onEnter: (pl, ctx) => {
	            ctx.movementInput(pl, false);
	            playSoundAll(this.sounds.parry, pl.pos, 1);
	            ctx.status.isWaitingParry = true;
	            playAnim(pl, this.animations.parry);
	            ctx.lookAtTarget(pl);
	        },
	        onLeave(pl, ctx) {
	            ctx.unfreeze(pl);
	            ctx.status.isWaitingParry = false;
	            ctx.status.cameraOffsets = [ 1.5, 0, 0.8 ];
	        },
	        timeline: {
	            5: (pl, ctx) => {
	                const offsets = ctx.status.cameraOffsets;

	                offsets[0] = 0.6;
	                offsets[2] = 0.6;
	            },
	            8: (pl, ctx) => {
	                const offsets = ctx.status.cameraOffsets;

	                offsets[0] = 1.5;
	                offsets[2] = 0.8;
	            },
	            13: (pl, ctx) => ctx.trap(pl, { tag: 'parryCounter' })
	        },
	        transitions: { }
	    }

	    /**
	     * @type {Move}
	     */
	    knockdown = {
	        cast: 30,
	        onEnter: (pl, ctx) => {
	            ctx.freeze(pl);
	            ctx.status.disableInputs([
	                'onAttack',
	                'onUseItem'
	            ]);
	            playAnim(pl, this.animations.knockdown);
	        },
	        onLeave(pl, ctx) {
	            ctx.unfreeze(pl);
	            playAnim(pl, 'animation.general.stand');
	            ctx.status.enableInputs([
	                'onAttack',
	                'onUseItem'
	            ]);
	        },
	        transitions: { }
	    }

	    setup(init) {
	        this.hitWall.transitions = {
	            hurt: {
	                onHurt: null
	            },
	            [init]: {
	                onEndOfLife: null
	            },
	        };

	        this.parry.transitions = {
	            parry: {
	                onParry: null
	            },
	            [init]: {
	                onEndOfLife: null
	            },
	            hurt: {
	                onHurt: null
	            },
	        };

	        this.parried.transitions = {
	            [init]: {
	                onEndOfLife: null
	            },
	            hurt: {
	                onHurt: { allowedState: 'both' }
	            },
	        };

	        this.hurt.transitions = {
	            [init]: {
	                onTrap: {
	                    tag: 'recover'
	                }
	            },
	            hurt: {
	                onHurt: { allowedState: 'both' }
	            },
	            hitWall: {
	                onTrap: {
	                    tag: 'hitWall',
	                    allowedState: 'both',
	                    isCollide: true,
	                }
	            },
	        };

	        this.blocked.transitions = {
	            [init]: {
	                onEndOfLife: null
	            },
	            hurt: {
	                onHurt: { allowedState: 'both' }
	            },
	        };

	        this.block.transitions = {
	            [init]: {
	                onEndOfLife: null
	            },
	            hurt: {
	                onHurt: { allowedState: 'both' }
	            },
	            block: {
	                onBlock: null
	            }
	        };
	    }

	    /**
	     * @param {keyof this} state 
	     * @param {Move} obj 
	     */
	    mixin(state, obj) {
	        this[state] = Object.assign(this[state], obj);
	    }

	    /**
	     * @param {keyof this} state 
	     * @param {string} state 
	     * @param {TransitionTypeOption} obj 
	     */
	    setTransition(state, transitionName, obj) {
	        const _state = this[state];
	        if (!_state) {
	            return
	        }

	        _state.transitions[transitionName] = obj;
	    }
	}

	/**
	 * @implements {TrickModule}
	 */
	class DefaultTrickModule {
	    /**
	     * @param {string} sid 
	     * @param {string} entry 
	     * @param {string|string[]} bind 
	     * @param {Moves} moves
	     */
	    constructor(sid, entry, bind, moves) {
	        this.sid = sid;
	        this.entry = entry;
	        this.bind = bind;
	        this.moves = moves;
	    }

	}

	_default = {
	    DefaultTrickModule, DefaultMoves
	};
	return _default;
}

var double_dagger;
var hasRequiredDouble_dagger;

function requireDouble_dagger () {
	if (hasRequiredDouble_dagger) return double_dagger;
	hasRequiredDouble_dagger = 1;
	/// <reference path="../basic/types.d.ts"/>

	const { playAnim, playSoundAll } = requireBasic();
	const { DefaultMoves, DefaultTrickModule } = require_default();

	class DoubleDaggerMoves extends DefaultMoves {
	    constructor() {
	        super();

	        this.animations.parry = 'animation.double_dagger.parry';
	        this.animations.block = 'animation.double_dagger.block';
	        this.setup('resumeHold');
	    }

	    /**
	     * @type {Move}
	     */
	    resumeHold = {
	        transitions: {
	            hold: {
	                onEndOfLife: {
	                    hasTarget: true
	                }
	            },
	            init: {
	                onEndOfLife: {
	                    hasTarget: false
	                }
	            },
	            dodge: {
	                onEndOfLife: {
	                    hasTarget: true,
	                    isSneaking: true
	                },
	            },
	            hurt: {
	                onHurt: null
	            },
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    init = {
	        cast: Infinity,
	        onEnter(pl) {
	            playAnim(pl, 'animation.posture.clear');
	        },
	        transitions: {
	            hold: {
	                onLock: null
	            },
	            hurt: {
	                onHurt: null
	            },
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    hold = {
	        cast: Infinity,
	        onEnter(pl, ctx) {
	            playAnim(pl, 'animation.double_dagger.hold', 'animation.double_dagger.hold');
	        },
	        transitions: {
	            init: {
	                onReleaseLock: null
	            },
	            hurt: {
	                onHurt: null
	            },
	            horizontalSwing: {
	                onAttack: null,
	            },
	            stab: {
	                onUseItem: null
	            },
	            dodge: {
	                onSneak: {
	                    isSneaking: true
	                },
	            },
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    horizontalSwing = {
	        cast: 9,
	        backswing: 11,
	        onEnter(pl, ctx) {
	            ctx.status.isBlocking = true;
	            ctx.freeze(pl);
	            playAnim(pl, 'animation.double_dagger.horizontal_swing');
	            ctx.lookAtTarget(pl);
	        },
	        onAct(pl, ctx) {
	            playSoundAll('weapon.woosh.1', pl.pos, 1);
	            ctx.selectFromRange(pl, {
	                angle: 90,
	                radius: 2,
	                rotation: 30
	            }).forEach(e => {
	                ctx.attack(pl, e, {
	                    damage: 16,
	                    knockback: 0.8,
	                });
	            });
	        },
	        onLeave(pl, ctx) {
	            ctx.unfreeze(pl);
	        },
	        timeline: {
	            0: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 1, 120, 1),
	            4: (_, ctx) =>  ctx.status.isBlocking = false,
	            6: (pl, ctx) => ctx.trap(pl, { tag: 'chop' }),
	            7: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 3, 80, 0.8),
	            11: (pl, ctx) => ctx.trap(pl, { tag: 'dodge' }),
	        },
	        transitions: {
	            resumeHold: {
	                onEndOfLife: null,
	            },
	            hurt: {
	                onHurt: {
	                    allowedState: 'both'
	                }
	            },
	            horizontalSwingToVeticalChop: {
	                onTrap: {
	                    tag: 'chop',
	                    preInput: 'onUseItem',
	                }
	            },
	            parried: {
	                onParried: {
	                    allowedState: 'backswing'
	                }
	            },
	            dodge: {
	                onSneak: {
	                    allowedState: 'backswing',
	                    isSneaking: true
	                },
	                onTrap: {
	                    tag: 'dodge',
	                    preInput: 'onSneak',
	                    isSneaking: true
	                }
	            },
	            blocked: {
	                onBlocked: {
	                    allowedState: 'backswing',
	                }
	            },
	            block: {
	                onBlock: null
	            }
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    horizontalSwingToVeticalChop = {
	        cast: 10,
	        backswing: 11,
	        onEnter(pl, ctx) {
	            ctx.freeze(pl);
	            playAnim(pl, 'animation.double_dagger.horizontal_swing.to.vertical_chop');
	            ctx.lookAtTarget(pl);
	        },
	        onAct(pl, ctx) {
	            ctx.selectFromRange(pl, {
	                angle: 60,
	                radius: 2.5,
	                rotation: 30
	            }).forEach(e => {
	                ctx.attack(pl, e, {
	                    damage: 22,
	                    knockback: 1.8,
	                    permeable: true,
	                });
	            });
	        },
	        onLeave(pl, ctx) {
	            ctx.unfreeze(pl);
	        },
	        timeline: {
	            0: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 1, 90, 1),
	            4: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 2, 90, 0.8),
	            9: pl => playSoundAll('weapon.woosh.3', pl.pos, 1),
	            10: (pl, ctx) => ctx.trap(pl)
	        },
	        transitions: {
	            resumeHold: {
	                onEndOfLife: null
	            },
	            hurt: {
	                onHurt: {
	                    allowedState: 'both'
	                }
	            },
	            parried: {
	                onParried: {
	                    allowedState: 'backswing'
	                }
	            },
	            dodge: {
	                onSneak: {
	                    allowedState: 'backswing',
	                    isSneaking: true
	                },
	                onTrap: {
	                    tag: 'dodge',
	                    preInput: 'onSneak',
	                    isSneaking: true
	                }
	            }
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    stab = {
	        cast: 10,
	        backswing: 12,
	        onEnter(pl, ctx) {
	            ctx.status.isWaitingParry = true;
	            ctx.freeze(pl);
	            ctx.lookAtTarget(pl);
	            playAnim(pl, 'animation.double_dagger.stab');
	        },
	        onAct(pl, ctx) {
	            ctx.selectFromRange(pl, {
	                angle: 60,
	                radius: 3,
	                rotation: 30
	            }).forEach(e => {
	                ctx.attack(pl, e, {
	                    damage: 18,
	                    knockback: 1.8,
	                });
	            });
	        },
	        onLeave(pl, ctx) {
	            ctx.status.isBlocking = false;
	            ctx.unfreeze(pl);
	        },
	        timeline: {
	            3: (_, ctx) => ctx.status.isWaitingParry = false,
	            6: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 2, 90, 0.8),
	            8: (_, ctx) => ctx.status.isBlocking = true,
	            9: pl => playSoundAll('weapon.woosh.2', pl.pos, 1),
	            12: (_, ctx) => ctx.status.isBlocking = false,
	            14: (pl, ctx) => ctx.trap(pl)
	        },
	        transitions: {
	            resumeHold: {
	                onEndOfLife: null
	            },
	            hurt: {
	                onHurt: null
	            },
	            parried: {
	                onParried: {
	                    allowedState: 'backswing'
	                }
	            },
	            parry: {
	                onParry: {
	                    allowedState: 'both'
	                }
	            },
	            dodge: {
	                onSneak: {
	                    allowedState: 'backswing',
	                    isSneaking: true
	                },
	                onTrap: {
	                    tag: 'dodge',
	                    preInput: 'onSneak',
	                    isSneaking: true
	                }
	            }
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    dodge = {
	        cast: 4,
	        backswing: 14,
	        onEnter(pl, ctx) {
	            ctx.status.isWaitingDeflection = true;
	            ctx.freeze(pl);
	            playAnim(pl, 'animation.double_dagger.dodge.front');
	            ctx.lookAtTarget(pl);
	        },
	        onAct(_, ctx) {
	            ctx.status.isWaitingDeflection = false;
	            ctx.status.isDodging = true;
	        },
	        onLeave(pl, ctx) {
	            ctx.status.isWaitingDeflection = false;
	            ctx.status.isDodging = false;
	            ctx.unfreeze(pl);
	        },
	        timeline: {
	            1: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 3, 90, 2),
	            8: (_, ctx) => ctx.status.isDodging = false,
	            10: (pl, ctx) => ctx.trap(pl)
	        },
	        transitions: {
	            resumeHold: {
	                onEndOfLife: null
	            },
	            deflection: {
	                onDeflection: {
	                    allowedState: 'both'
	                }
	            },
	            hurt: {
	                onHurt: {
	                    allowedState: 'both'
	                }
	            },
	            deflectionPunch: {
	                onTrap: {
	                    preInput: 'onUseItem'
	                }
	            }
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    deflection = {
	        cast: 8,
	        backswing: 8,
	        onEnter(pl, ctx) {
	            ctx.status.isDodging = true;
	            ctx.freeze(pl);
	            ctx.lookAtTarget(pl);
	            playSoundAll('weapon.deflection', pl.pos, 1);
	            playAnim(pl, 'animation.double_dagger.deflection');
	        },
	        onAct(_, ctx) {
	            ctx.status.isDodging = false;
	        },
	        onLeave(pl, ctx) {
	            ctx.status.isDodging = false;
	            ctx.unfreeze(pl);
	        },
	        timeline: {
	            1: (pl, ctx) => ctx.setVelocity(pl, 180, 0.6, 0),
	            7: (pl, ctx) => ctx.trap(pl, { tag: 'counter' }),
	        },
	        transitions: {
	            deflection: {
	                onDodge: {
	                    allowedState: 'both'
	                }
	            },
	            hurt: {
	                onHurt: {
	                    allowedState: 'both'
	                }
	            },
	            resumeHold: {
	                onEndOfLife: null
	            },
	            catchTargrt: {
	                onTrap: {
	                    tag: 'counter',
	                    preInput: 'onUseItem'
	                }
	            },
	            quickStab: {
	                onTrap: {
	                    tag: 'counter',
	                    preInput: 'onAttack'
	                }
	            },
	            dodge: {
	                onSneak: {
	                    isSneaking: true,
	                    allowedState: 'backswing',
	                }
	            }
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    deflectionStab = {
	        cast: 7,
	        backswing: 9,
	        onEnter(pl, ctx) {
	            ctx.freeze(pl);
	            playAnim(pl, 'animation.double_dagger.deflection.stab');
	        },
	        onAct(pl, ctx) {
	            ctx.lookAtTarget(pl);
	            ctx.selectFromRange(pl, {
	                radius: 2.5,
	                angle: 60,
	                rotation: -30,
	            }).forEach(en => {
	                ctx.attack(pl, en, {
	                    damage: 22,
	                    knockback: 1,
	                });
	            });
	        },
	        onLeave(pl, ctx) {
	            ctx.unfreeze(pl);
	        },
	        timeline: {
	            5: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 2, 60, 0),
	            6: pl => playSoundAll('weapon.woosh.2', pl.pos, 1)
	        },
	        transitions: {
	            hurt: {
	                onHurt: {
	                    allowedState: 'backswing'
	                }
	            },
	            parried: {
	                onParried: {
	                    allowedState: 'backswing'
	                }
	            },
	            resumeHold: {
	                onEndOfLife: null
	            }
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    deflectionPunch = {
	        cast: 3,
	        backswing: 9,
	        onEnter(pl, ctx) {
	            ctx.freeze(pl);
	            ctx.adsorbOrSetVelocity(pl, 1.5, 90, 0.8);
	            playAnim(pl, 'animation.double_dagger.deflection.punch');
	        },
	        onAct(pl, ctx) {
	            ctx.lookAtTarget(pl);
	            ctx.selectFromRange(pl, {
	                radius: 2,
	                angle: 60,
	                rotation: -30,
	            }).forEach(en => {
	                ctx.attack(pl, en, {
	                    damage: 4,
	                    parryable: false,
	                    permeable: true,
	                    knockback: 2,
	                });
	            });
	        },
	        onLeave(pl, ctx) {
	            ctx.unfreeze(pl);
	        },
	        transitions: {
	            hurt: {
	                onHurt: {
	                    allowedState: 'backswing'
	                }
	            },
	            resumeHold: {
	                onEndOfLife: null
	            }
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    catchTargrt = {
	        cast: 5,
	        backswing: 15,
	        onEnter(pl, ctx) {
	            ctx.freeze(pl);
	            playAnim(pl, 'animation.double_dagger.dodge.catch');
	            ctx.adsorbOrSetVelocity(pl, 3, 90, 0.8);
	        },
	        onAct(pl, ctx) {
	            ctx.selectFromRange(pl, {
	                angle: 120,
	                rotation: -60,
	            }).forEach(en => {
	                ctx.attack(pl, en, {
	                    damage: 2,
	                    knockback: 0.1,
	                    permeable: true,
	                    parryable: false,
	                    stiffness: 1500,
	                    powerful: true,
	                });
	            });
	        },
	        onLeave(pl, ctx) {
	            ctx.unfreeze(pl);
	        },
	        timeline: {
	            15: (pl, ctx) => ctx.trap(pl)
	        },
	        transitions: {
	            resumeHold: {
	                onEndOfLife: null
	            },
	            catched: {
	                onHit: null
	            },
	            hurt: {
	                onHurt: {
	                    allowedState: 'both'
	                }
	            }
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    catched = {
	        cast: 10,
	        backswing: 5,
	        onEnter(pl, ctx) {
	            ctx.freeze(pl);
	        },
	        onAct(pl, ctx) {
	            ctx.trap(pl);
	        },
	        onLeave(pl, ctx) {
	            ctx.unfreeze(pl);
	        },
	        transitions: {
	            resumeHold: {
	                onEndOfLife: null
	            },
	            deflectionStab: {
	                onTrap: {
	                    preInput: 'onUseItem',
	                    allowedState: 'both'
	                }
	            },
	            kick: {
	                onTrap: {
	                    preInput: 'onAttack',
	                    allowedState: 'both'
	                }
	            },
	            hurt: {
	                onHurt: {
	                    allowedState: 'both'
	                }
	            }
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    quickStab = {
	        cast: 4,
	        backswing: 12,
	        onEnter(pl, ctx) {
	            ctx.freeze(pl);
	            playAnim(pl, 'animation.double_dagger.catch.stab');
	            ctx.adsorbOrSetVelocity(pl, 3, 90, 0.8);
	        },
	        onAct(pl, ctx) {
	            ctx.selectFromRange(pl).forEach(en => {
	                ctx.attack(pl, en, {
	                    damage: 18,
	                    knockback: 2,
	                    parryable: false,
	                });
	            });
	        },
	        onLeave(pl, ctx) {
	            ctx.unfreeze(pl);
	        },
	        transitions: {
	            resumeHold: {
	                onEndOfLife: null
	            },
	            hurt: {
	                onHurt: {
	                    allowedState: 'both'
	                }
	            },
	            dodge: {
	                onSneak: {
	                    isSneaking: true,
	                    allowedState: 'backswing'
	                }
	            }
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    kick = {
	        cast: 5,
	        backswing: 11,
	        onEnter(pl, ctx) {
	            ctx.freeze(pl);
	            playAnim(pl, 'animation.double_dagger.catch.kick');
	            ctx.adsorbOrSetVelocity(pl, 2, 90, 0.8);
	        },
	        onAct(pl, ctx) {
	            ctx.selectFromRange(pl).forEach(en => {
	                ctx.attack(pl, en, {
	                    damage: 8,
	                    knockback: 5,
	                    parryable: false,
	                    permeable: true,
	                    shock: true,
	                    powerful: true,
	                });
	            });
	        },
	        onLeave(pl, ctx) {
	            ctx.unfreeze(pl);
	        },
	        transitions: {
	            resumeHold: {
	                onEndOfLife: null
	            },
	            hurt: {
	                onHurt: {
	                    allowedState: 'both'
	                }
	            }
	        }
	    }
	}

	class DoubleDaggerTricks extends DefaultTrickModule {
	    constructor() {
	        super(
	            'rgb:double_dagger',
	            'init',
	            [ 'weapon:double_dagger' ]
	        );
	    }

	    moves = new DoubleDaggerMoves()
	}

	double_dagger = new DoubleDaggerTricks();
	return double_dagger;
}

var emptyHand;
var hasRequiredEmptyHand;

function requireEmptyHand () {
	if (hasRequiredEmptyHand) return emptyHand;
	hasRequiredEmptyHand = 1;
	/// <reference path="../basic/types.d.ts"/>

	const { playAnim } = requireBasic();
	const { DefaultMoves, DefaultTrickModule } = require_default();
	requireMain();

	class EmptyHandMoves extends DefaultMoves {
	    /**
	     * @type {Move}
	     */
	    blocking = {
	        cast: Infinity,
	        onEnter(pl) {
	            playAnim(pl, 'animation.general.empty_hand');
	        },
	        transitions: {
	            cast: {
	                onEndOfLife: null
	            }
	        }
	    }

	    constructor() {
	        super();

	        this.setup('blocking');
	    }
	}

	class EmptyHandTricks extends DefaultTrickModule {
	    constructor() {
	        super(
	            'rgb39.weapon.empty_hand',
	            'blocking',
	            [ '*' ]
	        );
	    }

	    moves = new EmptyHandMoves()
	}

	/**
	 * @type {TrickModule}
	 */
	emptyHand = new EmptyHandTricks();
	return emptyHand;
}

var math = {};

/**
 * @param {number} start 
 * @param {number} end 
 * @param {() => number} calcFn 
 * @returns 
 */

var hasRequiredMath;

function requireMath () {
	if (hasRequiredMath) return math;
	hasRequiredMath = 1;
	function constrictCalc(start, end, calcFn) {
	    let result = 0;

	    try {
	        result = calcFn.call(null);
	        if (isNaN(result)) throw ''
	    } catch {
	        return start
	    }

	    return result > end ? end
	            : result < start ? start
	                : result
	}

	math.constrictCalc = constrictCalc;

	function randomRange(min=0, max=1, integer=false) {
	    const num = Math.random() * (max - min) + min;

	    return integer ? Math.round(num) : num
	}

	math.randomRange = randomRange;
	return math;
}

var hud_1;
var hasRequiredHud;

function requireHud () {
	if (hasRequiredHud) return hud_1;
	hasRequiredHud = 1;
	function hud(progress, size, style=['', '§6▮', '§4▯', '']) {
	    const duration = Math.ceil(size * progress);
	    const [ left, bar, empty, right ] = style;

	    return left +
	        bar.repeat(duration) +
	        empty.repeat(size - duration) + right
	}


	hud_1 = {
	    hud
	};
	return hud_1;
}

var lightSaber;
var hasRequiredLightSaber;

function requireLightSaber () {
	if (hasRequiredLightSaber) return lightSaber;
	hasRequiredLightSaber = 1;
	const { playAnim, playSoundAll } = requireBasic();
	const { DefaultMoves, DefaultTrickModule } = require_default();
	requireMain();
	const { constrictCalc, randomRange } = requireMath();
	const { hud } = requireHud();

	class LightSaberMoves extends DefaultMoves {
	    /**
	     * @type {Move}
	     */
	    hold = {
	        cast: Infinity,
	        onEnter(pl, ctx) {
	            playAnim(pl, 'animation.weapon.light_saber.hold', 'animation.weapon.light_saber.hold');
	        },
	        onTick(pl, ctx) {
	            const { status } = ctx;
	            status.stamina = constrictCalc(0, 100, () => status.stamina + 1);
	            pl.tell(
	                hud(status.stamina/100, 20),
	                5
	            );
	        },
	        transitions: {
	            hurt: {
	                onHurt: null
	            },
	            running: {
	                onChangeSprinting: {
	                    sprinting: true
	                }
	            },
	            attack1: {
	                onAttack: {
	                    stamina: v => v >= 10
	                }
	            },
	            beforeBlocking: {
	                onSneak: {
	                    isSneaking: true,
	                    stamina: v => v > 20
	                },
	            },
	            jump: {
	                onJump: null
	            },
	            dodge: {
	                onUseItem: null
	            },
	            knockdown: {
	                onKnockdown: null
	            }
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    dodge = {
	        cast: 15,
	        onEnter(pl, ctx) {
	            playAnim(pl, 'animation.weapon.light_saber.dodge');
	            ctx.movement(pl, false);
	            ctx.setVelocity(pl, -90, 2, 0);
	            ctx.status.stamina = constrictCalc(0, 100, () => ctx.status.stamina - 10);
	        },
	        onLeave(pl, ctx) {
	            ctx.unfreeze(pl);
	        },
	        onTick(pl, ctx) {
	            pl.tell(hud(ctx.status.stamina/100, 20), 5);
	        },
	        timeline: {
	            8: (pl, ctx) => ctx.setVelocity(pl, -90, 1, 0)
	        },
	        transitions: {
	            hold: {
	                onEndOfLife: null
	            },
	            hurt: {
	                onHurt: null
	            }
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    jump = {
	        cast: 6,
	        transitions: {
	            hold: {
	                onEndOfLife: null,
	            },
	            jumpAttack: {
	                onAttack: {
	                    stamina: v => v > 20
	                }
	            },
	            hurt: {
	                onHurt: null
	            },
	            knockdown: {
	                onKnockdown: null
	            },
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    jumpAttack = {
	        cast: 10,
	        backswing: 10,
	        onEnter(pl, ctx) {
	            pl.setSprinting(false);
	            playAnim(pl, 'animation.weapon.light_saber.jump_attack');
	            ctx.status.stamina = constrictCalc(0, 100, () => ctx.status.stamina - 15);
	            ctx.freeze(pl);
	        },
	        onAct(pl, ctx) {
	            ctx.selectFromRange(pl, {
	                angle: 25,
	                rotation: -12,
	                radius: 3.2
	            }).forEach(en => {
	                ctx.attack(pl, en, {
	                    damage: 26,
	                    knockback: 1.5,
	                    permeable: true,
	                });
	            });

	            ctx.status.repulsible = true;
	        },
	        onLeave(pl, ctx) {
	            ctx.unfreeze(pl);
	        },
	        onTick(pl, ctx) {
	            const { status } = ctx;
	            status.stamina = constrictCalc(0, 100, () => status.stamina);
	            pl.tell(hud(status.stamina/100, 20), 5);
	        },
	        timeline: {
	            2: (_, ctx) => ctx.status.repulsible = false,
	            8: (pl, ctx) => {
	                ctx.adsorbOrSetVelocity(pl, 2, 90);
	            }
	        },
	        transitions: {
	            hold: {
	                onEndOfLife: null
	            },
	            hurt: {
	                onHurt: null
	            },
	            parried: {
	                onParried: {
	                    allowedState: 'both'
	                }
	            },
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    beforeBlocking = {
	        cast: 4,
	        onEnter(pl, ctx) {
	            playAnim(pl, 'animation.weapon.light_saber.blocking', 'animation.weapon.light_saber.blocking');
	            ctx.status.isWaitingParry = true;
	        },
	        onLeave(pl, ctx) {
	            ctx.status.isWaitingParry = false;
	        },
	        transitions: {
	            blocking: {
	                onEndOfLife: {
	                    isSneaking: true
	                }
	            },
	            parry: {
	                onParry: null
	            },
	            afterBlocking: {
	                onEndOfLife: {
	                    isSneaking: false
	                }
	            },
	            knockdown: {
	                onKnockdown: null
	            },
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    blocking = {
	        cast: Infinity,
	        onEnter(pl, ctx) {
	            ctx.status.isBlocking = true;
	        },
	        onLeave(_, ctx) {
	            ctx.status.isBlocking = false;
	        },
	        onTick(pl, ctx) {
	            pl.tell(hud(ctx.status.stamina/100, 20), 5);
	        },
	        transitions: {
	            afterBlocking: {
	                onSneak: { isSneaking:false }
	            },
	            hurt: {
	                onHurt: null
	            },
	            block: {
	                onBlock: null
	            },
	            knockdown: {
	                onKnockdown: null
	            },
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    afterBlocking = {
	        cast: 3,
	        transitions: {
	            hold: {
	                onEndOfLife: null
	            },
	            hurt: {
	                onHurt: null
	            },
	            knockdown: {
	                onKnockdown: null
	            },
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    block = {
	        onEnter(pl, ctx) {
	            const damageOpt = ctx.rawArgs[2];
	            const result = ctx.status.stamina - (damageOpt.damage || 0);
	            ctx.status.stamina = result < 0 ? 0 : result;
	            playSoundAll(`weapon.sword.hit${randomRange(1, 4, true)}`, pl.pos, 1);
	        },
	        transitions: {
	            blocking: {
	                onEndOfLife: {
	                    stamina: v => v > 0
	                }
	            },
	            hold: {
	                onEndOfLife: {
	                    stamina: 0
	                }
	            },
	            knockdown: {
	                onKnockdown: null
	            },
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    running = {
	        cast: Infinity,
	        onEnter(pl) {
	            playAnim(pl, 'animation.weapon.light_saber.run', 'animation.weapon.light_saber.run');
	        },
	        onTick(pl, ctx) {
	            pl.tell(hud(ctx.status.stamina/100, 20), 5);
	        },
	        transitions: {
	            hurt: {
	                onHit: null
	            },
	            hold: {
	                onChangeSprinting: {
	                    sprinting: false
	                },
	            },
	            runningJump: {
	                onJump: null
	            },
	            strike: {
	                onAttack: {
	                    stamina: v => v > 30
	                }
	            },
	            dash: {
	                onUseItem: {
	                    stamina: v => v > 10
	                }
	            },
	            blocking: {
	                onSneak: {
	                    isSneaking: true
	                }
	            },
	            knockdown: {
	                onKnockdown: null
	            },
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    dash = {
	        cast: 15,
	        onEnter(pl, ctx) {
	            ctx.status.stamina = constrictCalc(0, 100, () => ctx.status.stamina - 10);
	            ctx.movement(pl, false);
	            ctx.setVelocity(pl, 90, 3, 0);
	            pl.setSprinting(false);
	            playAnim(pl, 'animation.weapon.light_saber.dash');
	        },
	        onTick(pl, ctx) {
	            pl.tell(hud(ctx.status.stamina/100, 20), 5);
	        },
	        onLeave(pl, ctx) {
	            ctx.unfreeze(pl);
	        },
	        timeline: {
	            8: (pl, ctx) => {
	                ctx.trap(pl);
	                ctx.setVelocity(pl, 90, 1, 0);
	            },
	        },
	        transitions: {
	            strike: {
	                onTrap: {
	                    preInput: 'onAttack',
	                    stamina: v => v >= 20
	                }
	            },
	            hold: {
	                onEndOfLife: null
	            },
	            hurt: {
	                onHurt: null
	            },
	            knockdown: {
	                onKnockdown: null
	            },
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    runningJump = {
	        cast: 6,
	        timeline: {
	            6: (pl, ctx) => {
	                ctx.trap(pl);
	            }
	        },
	        transitions: {
	            running: {
	                onEndOfLife: null
	            },
	            hold: {
	                onTrap: {
	                    preInput: 'onChangeSprinting',
	                },
	                onAttack: {
	                    stamina: v => v < 30
	                }
	            },
	            strike: {
	                onAttack: {
	                    stamina: v => v > 30
	                }
	            },
	            hurt: {
	                onHurt: null
	            },
	            knockdown: {
	                onKnockdown: null
	            },
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    strike = {
	        cast: 10,
	        backswing: 10,
	        onEnter(pl, ctx) {
	            playAnim(pl, 'animation.weapon.light_saber.strike');
	            ctx.status.stamina = constrictCalc(0, 100, () => ctx.status.stamina - 20);
	            ctx.freeze(pl);
	            ctx.adsorbOrSetVelocity(pl, 1, 90);
	        },
	        onTick(pl, ctx) {
	            const { status } = ctx;
	            status.stamina = constrictCalc(0, 100, () => status.stamina);
	            pl.tell(hud(status.stamina/100, 20), 5);
	        },
	        onLeave(pl, ctx) {
	            ctx.unfreeze(pl);
	        },
	        onAct(pl, ctx) {
	            ctx.selectFromRange(pl, {
	                radius: 3.2,
	                angle: 20,
	                rotation: -10
	            }).forEach(en => {
	                ctx.attack(pl, en, {
	                    damage: 25,
	                    knockback: 2,
	                });
	            });
	        },
	        timeline: {
	            6: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 2.5, 90)
	        },
	        transitions: {
	            hurt: {
	                onHurt: {
	                    allowedState: 'both'
	                },
	            },
	            hold: {
	                onEndOfLife: null
	            },
	            parried: {
	                onParried: {
	                    allowedState: 'both'
	                }
	            },
	        },
	    }

	    /**
	     * @type {Move}
	     */
	    attack1 = {
	        cast: 9,
	        backswing: 11,
	        onEnter(pl, ctx) {
	            ctx.movement(pl, false);
	            playAnim(pl, 'animation.weapon.light_saber.attack1');
	            ctx.status.stamina = constrictCalc(0, 100, () => ctx.status.stamina - 10);
	        },
	        onTick(pl, ctx) {
	            pl.tell(hud(ctx.status.stamina/100, 20), 5);
	        },
	        onAct(pl, ctx) {
	            ctx.selectFromRange(pl, {
	                angle: 45,
	                rotation: -22.5,
	                radius: 2.5
	            }).forEach(en => {
	                ctx.attack(pl, en, {
	                    damage: 18,
	                    knockback: 1,
	                });
	            });
	        },
	        onLeave(pl, ctx) {
	            ctx.unfreeze(pl);
	        },
	        timeline: {
	            2: (_, ctx) => ctx.status.isBlocking = true,
	            5: (pl, ctx) => ctx.setVelocity(pl, 90, 1, 0),
	            6: (_, ctx) => ctx.status.isBlocking = false,
	            14: (pl, ctx) => ctx.trap(pl)
	        },
	        transitions: {
	            hurt: {
	                onHurt: {
	                    allowedState: 'both'
	                }
	            },
	            hold: {
	                onEndOfLife: null
	            },
	            attack2: {
	                onTrap: {
	                    preInput: 'onAttack',
	                    allowedState: 'backswing',
	                    stamina: v => v >= 12,
	                }
	            },
	            parried: {
	                onParried: {
	                    allowedState: 'both'
	                }
	            },
	            knockdown: {
	                onKnockdown: null
	            },
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    attack2 = {
	        cast: 11,
	        backswing: 12,
	        onEnter(pl, ctx) {
	            ctx.movement(pl, false);
	            playAnim(pl, 'animation.weapon.light_saber.attack2');
	            ctx.status.stamina = constrictCalc(0, 100, () => ctx.status.stamina - 12);
	        },
	        onAct(pl, ctx) {
	            ctx.selectFromRange(pl, {
	                angle: 45,
	                rotation: -22.5,
	                radius: 2.5
	            }).forEach(en => {
	                ctx.attack(pl, en, {
	                    damage: 22,
	                    knockback: 1,
	                });
	            });
	        },
	        onTick(pl, ctx) {
	            pl.tell(hud(ctx.status.stamina/100, 20), 5);
	        },
	        onLeave(pl, ctx) {
	            ctx.unfreeze(pl);
	        },
	        timeline: {
	            2: (_, ctx) => ctx.status.isBlocking = true,
	            6: (pl, ctx) => {
	                ctx.setVelocity(pl, 90, 1, 0);
	                ctx.status.isBlocking = false;
	            },
	        },
	        transitions: {
	            hurt: {
	                onHurt: {
	                    allowedState: 'both'
	                }
	            },
	            hold: {
	                onEndOfLife: null
	            },
	            parried: {
	                onParried: {
	                    allowedState: 'both'
	                }
	            },
	            knockdown: {
	                onKnockdown: null
	            },
	        }
	    }

	    constructor() {
	        super();

	        this.animations.parry = 'animation.weapon.light_saber.parry';

	        this.knockdown.transitions = {
	            hold: {
	                onEndOfLife: null
	            }
	        };

	        this.setup('hold');
	    }
	}

	class LightSaberTrick extends DefaultTrickModule {
	    constructor() {
	        super(
	            'rgb39.weapon.light_saber',
	            'hold',
	            [ 'weapon:light_saber' ]
	        );
	    }

	    moves = new LightSaberMoves()
	}

	lightSaber = new LightSaberTrick();
	return lightSaber;
}

var moon_glaive;
var hasRequiredMoon_glaive;

function requireMoon_glaive () {
	if (hasRequiredMoon_glaive) return moon_glaive;
	hasRequiredMoon_glaive = 1;
	const { playAnim } = requireBasic();
	const { DefaultMoves, DefaultTrickModule } = require_default();
	requireMain();
	requireMath();
	requireHud();

	class MoonGlaiveTricks extends DefaultTrickModule {
	    constructor() {
	        super(
	            'rgb39.weapon.moon_glaive',
	            'hold',
	            [ 'weapon:moon_glaive' ]
	        );
	    }

	    moves = new MoonGlaiveMoves()
	}

	class MoonGlaiveMoves extends DefaultMoves {

	    constructor() {
	        super();

	        this.setup('backToDefault');
	        this.animations.parry = 'animation.weapon.moon_glaive.parry';

	        this.setTransition('parry', 'parryKnock', {
	            onTrap: {
	                tag: 'parryCounter',
	                preInput: 'onAttack',
	                allowedState: 'both'
	            }
	        });

	        this.setTransition('parry', 'parryChop', {
	            onTrap: {
	                tag: 'parryCounter',
	                preInput: 'onUseItem',
	                allowedState: 'both'
	            }
	        });
	    }

	    /**
	     * @type {Move}
	     */
	    hold = {
	        cast: Infinity,
	        onEnter(pl, ctx) {
	            ctx.releaseTarget(pl.xuid);
	            playAnim(pl, 'animation.weapon.moon_glaive.hold', 'animation.weapon.moon_glaive.hold');
	        },
	        transitions: {
	            hurt: {
	                onHurt: null
	            },
	            running: {
	                onChangeSprinting: {
	                    sprinting: true
	                }
	            },
	            holdLocked: {
	                onLock: {
	                    isOnGround: true
	                }
	            },
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    running = {
	        cast: Infinity,
	        onEnter(pl, ctx) {
	            ctx.releaseTarget(pl.xuid);
	            playAnim(pl, 'animation.weapon.moon_glaive.running', 'animation.weapon.moon_glaive.running');
	        },
	        transitions: {
	            hurt: {
	                onHurt: null
	            },
	            hold: {
	                onChangeSprinting: {
	                    sprinting: false
	                }
	            },
	            holdLocked: {
	                onLock: {
	                    isOnGround: true,
	                }
	            },
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    retentionSpinning = {
	        cast: 13,
	        backswing: 14,
	        onEnter(pl, ctx) {
	            ctx.setSpeed(pl, 0);
	            ctx.camera(pl, false);
	            playAnim(pl, 'animation.weapon.moon_glaive.retention.negative_spinning');
	            ctx.adsorbOrSetVelocity(pl, 1, 90, 1);
	        },
	        onAct(pl, ctx) {
	            ctx.selectFromRange(pl, {
	                radius: 2.5,
	                angle: 120,
	                rotation: -60
	            }).forEach(en => ctx.attack(pl, en, {
	                damage: 24,
	                knockback: 2.5,
	                permeable: true,
	            }));
	        },
	        onLeave(pl, ctx) {
	            ctx.unfreeze(pl);
	            ctx.setSpeed(pl, 0.04);
	        },
	        timeline: {
	            4: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 1, 90, 1),
	            8: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 1.5, 120, 1),
	            26: (pl, ctx) => ctx.trap(pl),
	        },
	        transitions: {
	            hurt: {
	                onHurt: { allowedState: 'both' }
	            },
	            parried: {
	                onParried: { allowedState: 'both' }
	            },
	            dodge: {
	                onTrap: {
	                    preInput: 'onUseItem',
	                }
	            },
	            retention: {
	                onEndOfLife: {
	                    hasTarget: true
	                }
	            },
	            hold: {
	                onEndOfLife: {
	                    hasTarget: false
	                }
	            },
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    retention = {
	        cast: Infinity,
	        onEnter(pl, ctx) {
	            ctx.freeze(pl);
	            playAnim(pl, 'animation.weapon.moon_glaive.retention', 'animation.weapon.moon_glaive.retention');
	        },
	        onTick(pl, ctx) {
	            ctx.lookAtTarget(pl);
	        },
	        onLeave(pl, ctx) {
	            ctx.unfreeze(pl);
	        },
	        timeline: {
	            1: (pl, ctx) => ctx.trap(pl)
	        },
	        transitions: {
	            hurt: {
	                onHurt: null
	            },
	            hold: {
	                onReleaseLock: null
	            },
	            retentionSpinning: {
	                onAttack: null
	            },
	            dodge: {
	                onUseItem: null
	            },
	            fromRetention: {
	                onSneak: { isSneaking: false },
	                onTrap: { isSneaking: false },
	            }
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    toRetention = {
	        cast: 5,
	        onEnter(pl, ctx) {
	            ctx.camera(pl, false);
	            playAnim(pl, 'animation.weapon.moon_glaive.to_retention');
	        },
	        onLeave(pl, ctx) {
	            ctx.unfreeze(pl);
	        },
	        timeline: {
	            4: (pl, ctx) => ctx.trap(pl)
	        },
	        transitions: {
	            hurt: {
	                onHurt: null
	            },
	            retention: {
	                onEndOfLife: {
	                    isSneaking: true
	                },
	            },
	            fromRetention: {
	                onEndOfLife: {
	                    isSneaking: false
	                }
	            },
	            dodge: {
	                onTrap: {
	                    preInput: 'onUseItem'
	                }
	            },
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    fromRetention = {
	        cast: 5,
	        onEnter(pl, ctx) {
	            ctx.camera(pl, false);
	            playAnim(pl, 'animation.weapon.moon_glaive.from_retention');
	        },
	        onLeave(pl, ctx) {
	            ctx.unfreeze(pl);
	        },
	        transitions: {
	            hurt: {
	                onHurt: null
	            },
	            backToDefault: {
	                onEndOfLife: null
	            }
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    holdLocked = {
	        cast: Infinity,
	        onEnter(pl, ctx) {
	            pl.setSprinting(false);
	            playAnim(pl, 'animation.weapon.moon_glaive.hold_locked', 'animation.weapon.moon_glaive.hold_locked');
	            ctx.trap(pl);
	        },
	        transitions: {
	            toRetention: {
	                onSneak: {
	                    isSneaking: true,
	                },
	                onTrap: {
	                    isSneaking: true
	                }
	            },
	            hold: {
	                onReleaseLock: null,
	                onJump: null
	            },
	            running: {
	                onChangeSprinting: {
	                    sprinting: true
	                }
	            },
	            push: {
	                onAttack: null
	            },
	            sweap: {
	                onUseItem: null,
	            },
	            hurt: {
	                onHurt: { allowedState: 'both' }
	            }
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    backToDefault = {
	        transitions: {
	            holdLocked: {
	                onEndOfLife: {
	                    hasTarget: true
	                }
	            },
	            hold: {
	                onEndOfLife: {
	                    hasTarget: false
	                }
	            },
	            hurt: {
	                onHurt: null
	            },
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    dodge = {
	        cast: 11,
	        onEnter(pl, ctx) {
	            ctx.status.isDodging = true;
	            ctx.setSpeed(pl, 0);
	            ctx.camera(pl);
	            playAnim(pl, 'animation.weapon.moon_glaive.dodge');
	            ctx.setVelocity(pl, -90, 2.5, 0);
	        },
	        onLeave(pl, ctx) {
	            ctx.unfreeze(pl);
	            ctx.setSpeed(pl, 0.04);
	        },
	        timeline: {
	            4: (pl, ctx) => ctx.status.isDodging = false,
	            10: (pl, ctx) => ctx.trap(pl)
	        },
	        transitions: {
	            retention: {
	                onEndOfLife: {
	                    hasTarget: true
	                }
	            },
	            backToDefault: {
	                onEndOfLife: {
	                    hasTarget: false
	                }
	            },
	            retentionSpinning: {
	                onTrap: {
	                    preInput: 'onAttack'
	                }
	            },
	            hurt: {
	                onHurt: {
	                    allowedState: 'both'
	                }
	            }
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    push = {
	        cast: 9,
	        backswing: 10,
	        onEnter(pl, ctx) {
	            ctx.freeze(pl);
	            ctx.lookAtTarget(pl);
	            playAnim(pl, 'animation.weapon.moon_glaive.push');
	        },
	        onLeave(pl, ctx) {
	            ctx.unfreeze(pl);
	        },
	        onAct(pl, ctx) {
	            ctx.selectFromRange(pl, {
	                angle: 50,
	                rotation: -25,
	                radius: 2.6,
	            }).forEach(en => {
	                ctx.attack(pl, en, {
	                    damage: 16
	                });
	            });
	        },
	        timeline: {
	            0: (_, c) => c.status.isBlocking = true,
	            4: (_, c) => c.status.isBlocking = false,
	            7: (pl, ctx) => ctx.adsorbToTarget(pl, 2),
	            15: (pl, ctx) => ctx.trap(pl)
	        },
	        transitions: {
	            backToDefault: {
	                onEndOfLife: null
	            },
	            chop: {
	                onTrap: {
	                    preInput: 'onAttack',
	                    hasTarget: true,
	                    allowedState: 'both',
	                }
	            },
	            verticalChop : {
	                onTrap: {
	                    preInput: 'onUseItem',
	                    hasTarget: true,
	                    allowedState: 'both',
	                }
	            },
	            parried: {
	                onParried: {
	                    allowedState: 'both',
	                }
	            },
	            hurt: {
	                onHurt: { allowedState: 'both' }
	            },
	            blocked: {
	                onBlocked: {
	                    allowedState: 'backswing',
	                }
	            },
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    chop = {
	        cast: 10,
	        backswing: 8,
	        onEnter(pl, ctx) {
	            ctx.freeze(pl);
	            ctx.lookAtTarget(pl);
	            playAnim(pl, 'animation.weapon.moon_glaive.chop');
	        },
	        onLeave(pl, ctx) {
	            ctx.unfreeze(pl);
	        },
	        timeline: {
	            4: (pl, ctx) => ctx.adsorbToTarget(pl, 1.2),
	            8: (pl, ctx) => ctx.adsorbToTarget(pl, 1.2),
	            11: (pl, ctx) => ctx.adsorbToTarget(pl, 0.5),
	        },
	        onAct(pl, ctx) {
	            ctx.selectFromRange(pl, {
	                angle: 70,
	                rotation: -35,
	                radius: 2.6,
	            }).forEach(en => {
	                ctx.attack(pl, en, {
	                    damage: 18
	                });
	            });
	        },
	        transitions: {
	            backToDefault: {
	                onEndOfLife: null
	            },
	            hurt: {
	                onHurt: null,
	            },
	            parried: {
	                onParried: {
	                    allowedState: 'both',
	                }
	            },
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    verticalChop = {
	        cast: 15,
	        backswing: 10,
	        onEnter(pl, ctx) {
	            ctx.status.hegemony = true;
	            ctx.freeze(pl);
	            ctx.lookAtTarget(pl);
	            ctx.status.repulsible = false;
	            playAnim(pl, 'animation.weapon.moon_glaive.vertical_chop');
	        },
	        onLeave(pl, ctx) {
	            ctx.status.hegemony = true;
	            ctx.status.repulsible = true;
	            ctx.unfreeze(pl);
	        },
	        timeline: {
	            3: (pl, ctx) => ctx.adsorbToTarget(pl, 2),
	            6: (pl, ctx) => ctx.adsorbToTarget(pl, 4),
	            13: (pl, ctx) => ctx.trap(pl),
	            18: (pl, ctx) => ctx.adsorbToTarget(pl, 0.5),
	        },
	        onAct(pl, ctx) {
	            ctx.selectFromRange(pl, {
	                angle: 46,
	                rotation: -23,
	                radius: 2.8,
	            }).forEach(en => {
	                ctx.attack(pl, en, {
	                    damage: 32,
	                    permeable: true,
	                    knockback: 1,
	                });
	            });
	        },
	        transitions: {
	            backToDefault: {
	                onEndOfLife: null,
	                onTrap: {
	                    preInput: 'onFeint',

	                },
	            },
	            parried: {
	                onParried: {
	                    allowedState: 'both',
	                }
	            },
	            hurt: {
	                onInterrupted: {
	                    allowedState: 'both'
	                }
	            },
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    sweap = {
	        cast: 16,
	        backswing: 14,
	        onEnter(pl, ctx) {
	            ctx.freeze(pl);
	            ctx.lookAtTarget(pl);
	            playAnim(pl, 'animation.weapon.moon_glaive.heavy_sweap');
	            ctx.status.isWaitingParry = true;
	        },
	        onLeave(pl, ctx) {
	            ctx.status.repulsible = true;
	            ctx.unfreeze(pl);
	        },
	        onAct(pl, ctx) {
	            ctx.selectFromRange(pl, {
	                angle: 90,
	                rotation: -50,
	                radius: 2.8,
	            }).forEach(en => {
	                ctx.attack(pl, en, {
	                    damage: 22,
	                    knockback: 0.4,
	                });
	            });
	        },
	        timeline: {
	            2: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 1, 90),
	            3: (_, ctx) => ctx.status.isWaitingParry = false,
	            6: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 0.5, 90),
	            8: (pl, ctx) => ctx.trap(pl, { tag: 'feint' }),
	            12: (_, ctx) => ctx.status.repulsible = false,
	            14: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 2, 90),
	            21: (pl, ctx) => {
	                ctx.status.repulsible = true;
	                ctx.trap(pl, { tag: 'combo' });
	            },
	        },
	        transitions: {
	            backToDefault: {
	                onEndOfLife: null,
	                onTrap: {
	                    tag: 'feint',
	                    preInput: 'onFeint',
	                },
	            },
	            sweapCombo: {
	                onTrap: {
	                    tag: 'combo',
	                    preInput: 'onAttack',
	                    allowedState: 'backswing',
	                }
	            },
	            sweapComboSpinning: {
	                onTrap: {
	                    tag: 'combo',
	                    preInput: 'onUseItem',
	                    allowedState: 'backswing',
	                }
	            },
	            hurt: {
	                onHurt: {
	                    repulsible: true,
	                }
	            },
	            parried: {
	                onParried: {
	                    allowedState: 'both',
	                }
	            },
	            parry: {
	                onParry: {
	                    allowedState: 'both',
	                }
	            },
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    sweapCombo = {
	        cast: 10,
	        backswing: 8,
	        onEnter(pl, ctx) {
	            ctx.freeze(pl);
	            ctx.lookAtTarget(pl);
	            playAnim(pl, 'animation.weapon.moon_glaive.chop.combo');
	        },
	        onLeave(pl, ctx) {
	            ctx.unfreeze(pl);
	        },
	        timeline: {
	            4: (pl, ctx) => ctx.adsorbToTarget(pl, 1.2),
	            8: (pl, ctx) => ctx.adsorbToTarget(pl, 1.2),
	            11: (pl, ctx) => ctx.adsorbToTarget(pl, 0.5),
	        },
	        onAct(pl, ctx) {
	            ctx.selectFromRange(pl, {
	                angle: 70,
	                rotation: -35,
	                radius: 2.6,
	            }).forEach(en => {
	                ctx.attack(pl, en, {
	                    damage: 18,
	                });
	            });
	        },
	        transitions: {
	            backToDefault: {
	                onEndOfLife: null
	            },
	            hurt: {
	                onHurt: null,
	            },
	            parried: {
	                onParried: {
	                    allowedState: 'both',
	                }
	            },
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    sweapComboSpinning = {
	        cast: 15,
	        backswing: 14,
	        onEnter(pl, ctx) {
	            ctx.status.hegemony = true;
	            ctx.freeze(pl);
	            ctx.lookAtTarget(pl);
	            playAnim(pl, 'animation.weapon.moon_glaive.positive_spinning');
	        },
	        onLeave(pl, ctx) {
	            ctx.status.hegemony = false;
	            ctx.unfreeze(pl);
	        },
	        onAct(pl, ctx) {
	            ctx.selectFromRange(pl, {
	                angle: 120,
	                rotation: -60,
	                radius: 2.8,
	            }).forEach(en => {
	                ctx.attack(pl, en, {
	                    damage: 30,
	                    knockback: 1.5,
	                    permeable: true,
	                });
	            });
	        },
	        timeline: {
	            0: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 1, 90),
	            8: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 4, 90),
	            13: (pl, ctx) => ctx.trap(pl),
	        },
	        transitions: {
	            parried: {
	                onParried: {
	                    allowedState: 'both'
	                },
	            },
	            backToDefault: {
	                onEndOfLife: null,
	                onTrap: {
	                    preInput: 'onFeint',
	                }
	            },
	            hurt: {
	                onInterrupted: {
	                    allowedState: 'both'
	                }
	            }
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    parryKnock = {
	        cast: 7,
	        backswing: 11,
	        onEnter(pl, ctx) {
	            ctx.freeze(pl);
	            ctx.lookAtTarget(pl);
	            playAnim(pl, 'animation.weapon.moon_glaive.parry.knock');
	        },
	        onLeave(pl, ctx) {
	            ctx.unfreeze(pl);
	        },
	        onAct(pl, ctx) {
	            ctx.selectFromRange(pl, {
	                angle: 60,
	                rotation: -30,
	                radius: 2.6,
	            }).forEach(en => {
	                ctx.attack(pl, en, {
	                    damage: 18,
	                    knockback: 4,
	                    shock: true,
	                    parryable: false,
	                });
	            });
	        },
	        timeline: {
	            0: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 1, 90),
	            6: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 1, 90),
	        },
	        transitions: {
	            backToDefault: {
	                onEndOfLife: null,
	            }
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    parryChop = {
	        cast: 13,
	        backswing: 13,
	        onEnter(pl, ctx) {
	            ctx.freeze(pl);
	            ctx.lookAtTarget(pl);
	            ctx.status.repulsible = false;
	            playAnim(pl, 'animation.weapon.moon_glaive.parry.chop');
	        },
	        onLeave(pl, ctx) {
	            ctx.status.repulsible = true;
	            ctx.unfreeze(pl);
	        },
	        timeline: {
	            5: (pl, ctx) => ctx.adsorbToTarget(pl, 2),
	            8: (pl, ctx) => ctx.adsorbToTarget(pl, 4, 1),
	            20: (pl, ctx) => ctx.adsorbToTarget(pl, 0.5),
	        },
	        onAct(pl, ctx) {
	            ctx.selectFromRange(pl, {
	                angle: 46,
	                rotation: -23,
	                radius: 2.8,
	            }).forEach(en => {
	                ctx.attack(pl, en, {
	                    damage: 22,
	                    permeable: true,
	                    knockback: 2,
	                });
	            });
	        },
	        transitions: {
	            backToDefault: {
	                onEndOfLife: null,
	            },
	            parried: {
	                onParried: {
	                    allowedState: 'both',
	                }
	            },
	        }
	    }
	}

	moon_glaive = new MoonGlaiveTricks();
	return moon_glaive;
}

var ootachi;
var hasRequiredOotachi;

function requireOotachi () {
	if (hasRequiredOotachi) return ootachi;
	hasRequiredOotachi = 1;
	/// <reference path="../basic/types.d.ts"/>

	const { playAnim, playSoundAll } = requireBasic();
	requireMain();
	const { randomRange } = requireMath();
	const { DefaultMoves, DefaultTrickModule } = require_default();

	class OotachiMoves extends DefaultMoves {
	    constructor() {
	        super();

	        this.setup('resumeKamae');

	        this.parry.timeline = {
	            14: (pl, ctx) => ctx.trap(pl)
	        };
	        this.parry.transitions = {
	            combo2Cut: {
	                onTrap: {
	                    preInput: 'onAttack',
	                    allowedState: 'both'
	                },
	            },
	            combo2Sweap: {
	                onTrap: {
	                    preInput: 'onUseItem',
	                    allowedState: 'both'
	                },
	            },
	            resumeKamae: {
	                onEndOfLife: null
	            },
	            parry: {
	                onParry: {
	                    allowedState: 'both'
	                }
	            },
	            knockdown: {
	                onKnockdown: { allowedState: 'both' }
	            },
	        };

	        this.parried.transitions = {
	            resumeKamae: {
	                onEndOfLife: null
	            },
	            hurt: {
	                onHurt: {
	                    allowedState: 'both'
	                }
	            },
	            knockdown: {
	                onKnockdown: { allowedState: 'both' }
	            },
	        };

	        this.animations.parry = 'animation.weapon.ootachi.parry';
	        this.animations.block = 'animation.weapon.ootachi.block.left';
	    }

	    idle = {
	        cast: Infinity,
	        onEnter(pl, ctx) {
	            ctx.unfreeze(pl);
	            ctx.releaseTarget(pl.xuid);
	            if (ctx.previousStatus === 'running') {
	                ctx.task
	                    .queue(() => playAnim(pl, 'animation.weapon.ootachi.trans.running.idle'), 0)
	                    .queue(() => playAnim(pl, 'animation.weapon.ootachi.idle', 'animation.weapon.ootachi.idle'), 80)
	                    .run();
	            } else playAnim(pl, 'animation.weapon.ootachi.idle', 'animation.weapon.ootachi.idle');
	        },
	        onLeave(_, ctx) {
	            ctx.task.cancel();
	        },
	        transitions: {
	            innoKamae: {
	                onLock: {
	                    isOnGround: true
	                }
	            },
	            running: {
	                onChangeSprinting: { sprinting: true }
	            },
	            hurt: {
	                onHurt: {
	                    allowedState: 'both'
	                }
	            },
	            combo1Attack: {
	                onAttack: null
	            },
	            knockdown: {
	                onKnockdown: { allowedState: 'both' }
	            },
	        }
	    }

	    innoKamae = {
	        cast: Infinity,
	        onEnter(pl, ctx) {
	            ctx.freeze(pl);
	            playAnim(pl, 'animation.weapon.ootachi.kamae.inno', 'animation.weapon.ootachi.kamae.inno');
	        },
	        onTick(pl, ctx) {
	            ctx.lookAtTarget(pl);
	        },
	        transitions: {
	            idle: {
	                onReleaseLock: { allowedState: 'both' },
	                onJump: { allowedState: 'both' },
	            },
	            running: {
	                onChangeSprinting: {
	                    sprinting: true,
	                    allowedState: 'both'
	                }
	            },
	            combo1Attack: {
	                onAttack: { allowedState: 'both' }
	            },
	            combo1Chop: {
	                onUseItem: { allowedState: 'both' }
	            },
	            dodgePrepare: {
	                onSneak: { allowedState: 'both' }
	            },
	            hurt: {
	                onHurt: {
	                    allowedState: 'both'
	                }
	            },
	            knockdown: {
	                onKnockdown: { allowedState: 'both' }
	            },
	        }
	    }

	    resumeKamae = {
	        transitions: {
	            idle: {
	                onEndOfLife: { hasTarget: false }
	            },
	            innoKamae: {
	                onEndOfLife: { hasTarget: true }
	            },
	        }
	    }

	    running = {
	        cast: Infinity,
	        onEnter(pl, ctx) {
	            ctx.releaseTarget(pl.xuid);
	            ctx.task
	                .queue(() => playAnim(pl, 'animation.weapon.ootachi.trans.idle.running'), 0)
	                .queue(() => playAnim(pl, 'animation.weapon.ootachi.running', 'animation.weapon.ootachi.running'), 80)
	                .run();
	            
	        },
	        onLeave(_, ctx) {
	            ctx.task.cancel();
	        },
	        transitions: {
	            idle: {
	                onChangeSprinting: { sprinting: false }
	            },
	            hurt: {
	                onHurt: {
	                    allowedState: 'both'
	                }
	            },
	            knockdown: {
	                onKnockdown: { allowedState: 'both' }
	            },
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    combo1Attack = {
	        cast: 7,
	        backswing: 13,
	        timeline: {
	            5: (_, ctx) => ctx.status.isBlocking = false,
	            7: pl => playSoundAll(`weapon.woosh.${randomRange(2, 4, true)}`, pl.pos, 1),
	            14: (pl, ctx) => ctx.trap(pl, { tag: 'combo' })
	        },
	        onEnter(pl, ctx) {
	            ctx.status.isBlocking = true;
	            ctx.freeze(pl);
	            ctx.task.queueList([
	                { handler: () => ctx.adsorbOrSetVelocity(pl, 0.5, 90), timeout: 0 },
	                { handler: () => ctx.adsorbOrSetVelocity(pl, 1, 90), timeout: 100 },
	                { handler: () => ctx.adsorbOrSetVelocity(pl, 0.8, 90), timeout: 300 },
	            ]).run();
	            playAnim(pl, 'animation.weapon.ootachi.combo1.attack');
	            ctx.lookAtTarget(pl);
	        },
	        onAct(pl, ctx) {
	            ctx.selectFromRange(pl, {
	                radius: 3,
	                angle: 45,
	                rotation: -20,
	            }).forEach(en => {
	                ctx.attack(pl, en, {
	                    damage: 18,
	                    knockback: 1,
	                });
	            });
	        },
	        onLeave(_, ctx) {
	            ctx.task.cancel();
	        },
	        transitions: {
	            resumeKamae: {
	                onEndOfLife: null,
	                onBlock: null,
	            },
	            hurt: {
	                onHurt: {
	                    allowedState: 'both'
	                }
	            },
	            parried: {
	                onParried: {
	                    allowedState: 'backswing'
	                }
	            },
	            knockdown: {
	                onKnockdown: { allowedState: 'both' }
	            },
	            combo2Cut: {
	                onTrap: {
	                    tag: 'combo',
	                    hasTarget: true,
	                    preInput: 'onAttack'
	                }
	            },
	            combo2Sweap: {
	                onTrap: {
	                    tag: 'combo',
	                    hasTarget: true,
	                    preInput: 'onUseItem'
	                }
	            },
	            blocked: {
	                onBlocked: {
	                    allowedState: 'backswing',
	                }
	            },
	            block: {
	                onBlock: null
	            }
	        }
	    }

	    combo1Chop = {
	        cast: 11,
	        backswing: 9,
	        onEnter(pl, ctx) {
	            ctx.freeze(pl);
	            ctx.task.queueList([
	                { handler: () => {
	                    ctx.adsorbOrSetVelocity(pl, 0.5, 90);
	                    ctx.status.isWaitingParry = true;
	                }, timeout: 0 },
	                { handler: () => ctx.status.isWaitingParry = false, timeout: 150 },
	                { handler: () => ctx.adsorbOrSetVelocity(pl, 1, 90), timeout: 200 },
	                { handler: () => ctx.adsorbOrSetVelocity(pl, 0.8, 90), timeout: 550 },
	            ]).run();
	            playAnim(pl, 'animation.weapon.ootachi.combo1.chop');
	            ctx.lookAtTarget(pl);
	        },
	        onAct(pl, ctx) {
	            playSoundAll(`weapon.woosh.${randomRange(2, 4, true)}`, pl.pos, 1);
	            ctx.selectFromRange(pl, {
	                radius: 3,
	                angle: 30,
	                rotation: -15,
	            }).forEach(en => {
	                ctx.attack(pl, en, {
	                    damage: 24,
	                    knockback: 1.5,
	                });
	            });
	        },
	        onLeave(pl, ctx) {
	            ctx.task.cancel();
	        },
	        timeline: {
	            8: (pl, ctx) => {
	                ctx.trap(pl, { tag: 'feint' });
	            },
	            10: (pl, ctx) => {
	                ctx.trap(pl, { tag: 'hlit' });
	            },
	            19: (pl, ctx) => ctx.trap(pl, { tag: 'combo' })
	        },
	        transitions: {
	            resumeKamae: {
	                onTrap: {
	                    tag: 'feint',
	                    isOnGround: true,
	                    preInput: 'onFeint'
	                },
	                onEndOfLife: null,
	            },
	            hurt: {
	                onHurt: {
	                    allowedState: 'both'
	                }
	            },
	            parry: {
	                onParry: {
	                    allowedState: 'both'
	                }
	            },
	            parried: {
	                onParried: {
	                    allowedState: 'backswing'
	                }
	            },
	            knockdown: {
	                onKnockdown: { allowedState: 'both' }
	            },
	            combo2Cut: {
	                onTrap: {
	                    tag: 'combo',
	                    hasTarget: true,
	                    preInput: 'onAttack'
	                }
	            },
	            combo2Sweap: {
	                onTrap: {
	                    tag: 'combo',
	                    hasTarget: true,
	                    preInput: 'onUseItem'
	                }
	            },
	            hlitStrike: {
	                onTrap: {
	                    tag: 'hlit',
	                    hasTarget: true,
	                    preInput: 'onAttack'
	                }
	            }
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    combo2Cut = {
	        cast: 11,
	        backswing: 17,
	        onEnter(pl, ctx) {
	            ctx.lookAtTarget(pl);
	            ctx.freeze(pl);
	            playAnim(pl, `animation.weapon.ootachi.combo2.cut.${
	                ctx.previousStatus === 'combo1Attack' ? 'l' : 'r'
	            }`);
	            ctx.adsorbOrSetVelocity(pl, 1, 90);
	        },
	        onAct(pl, ctx) {
	            playSoundAll(`weapon.woosh.${randomRange(2, 4, true)}`, pl.pos, 1);
	            ctx.selectFromRange(pl, {
	                radius: 2.6,
	                angle: 60,
	                rotation: -30
	            }).forEach(en => {
	                ctx.attack(pl, en, {
	                    damage: 20,
	                    knockback: 1.2,
	                    trace: true,
	                });
	            });
	        },
	        onLeave(_, ctx) {
	            ctx.unfreeze(_);
	            ctx.task.cancel();
	        },
	        timeline: {
	            7: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 2, 90),
	            20: (pl, ctx) => ctx.trap(pl, { tag: 'combo' })
	        },
	        transitions: {
	            resumeKamae: {
	                onEndOfLife: null,
	            },
	            hurt: {
	                onHurt: {
	                    allowedState: 'both'
	                }
	            },
	            parried: {
	                onParried: {
	                    allowedState: 'backswing'
	                }
	            },
	            knockdown: {
	                onKnockdown: { allowedState: 'both' }
	            },
	            combo3Stab: {
	                onTrap: {
	                    tag: 'combo',
	                    preInput: 'onAttack',
	                    hasTarget: true,
	                }
	            },
	            combo3Sweap: {
	                onTrap: {
	                    tag: 'combo',
	                    preInput: 'onUseItem',
	                    hasTarget: true,
	                }
	            },
	            blocked: {
	                onBlocked: {
	                    allowedState: 'backswing',
	                }
	            },
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    combo2Sweap = {
	        cast: 15,
	        backswing: 13,
	        onEnter(pl, ctx) {
	            ctx.lookAtTarget(pl);
	            ctx.freeze(pl);
	            ctx.status.hegemony = true;
	            ctx.status.repulsible = false;
	            playAnim(pl, `animation.weapon.ootachi.combo2.sweap.${
	                ctx.previousStatus === 'combo1Attack' ? 'l' : 'r'
	            }`);
	            ctx.adsorbOrSetVelocity(pl, 0.2, 90);
	            ctx.task
	                .queue(() => ctx.adsorbOrSetVelocity(pl, 1.2, 90), 200)
	                .run();
	        },
	        onAct(pl, ctx) {
	            playSoundAll(`weapon.woosh.${randomRange(2, 4, true)}`, pl.pos, 1);
	            ctx.selectFromRange(pl, {
	                radius: 3,
	                angle: 80,
	                rotation: -40
	            }).forEach(en => {
	                ctx.attack(pl, en, {
	                    damage: 28,
	                    knockback: 1.2,
	                });
	            });
	        },
	        onLeave(_, ctx) {
	            ctx.status.hegemony = false;
	            ctx.status.repulsible = true;
	            ctx.task.cancel();
	            ctx.unfreeze(_);
	        },
	        timeline: {
	            10: (pl, ctx) => ctx.trap(pl, { tag: 'feint' }),
	            20: (pl, ctx) => ctx.trap(pl, { tag: 'combo' }),
	        },
	        transitions: {
	            resumeKamae: {
	                onTrap: {
	                    tag: 'feint',
	                    isOnGround: true,
	                    preInput: 'onFeint'
	                },
	                onEndOfLife: null,
	            },
	            parried: {
	                onParried: {
	                    allowedState: 'backswing'
	                }
	            },
	            knockdown: {
	                onKnockdown: { allowedState: 'both' }
	            },
	            hurt: {
	                onInterrupted: { allowedState: 'both' }
	            },
	            combo3Stab: {
	                onTrap: {
	                    tag: 'combo',
	                    preInput: 'onAttack',
	                    hasTarget: true,
	                }
	            },
	            combo3Sweap: {
	                onTrap: {
	                    tag: 'combo',
	                    preInput: 'onUseItem',
	                    hasTarget: true,
	                }
	            },
	        }
	    }

	    combo3Stab = {
	        cast: 8,
	        backswing: 12,
	        onEnter(pl, ctx) {
	            ctx.freeze(pl);
	            playAnim(pl, `animation.weapon.ootachi.combo3.stab.${
	                ctx.previousStatus === 'combo2Cut' ? 'l' : 'r'
	            }`);
	            ctx.task
	                .queue(() => ctx.adsorbOrSetVelocity(pl, 0.5, 90), 0)
	                .queue(() => ctx.adsorbOrSetVelocity(pl, 1, 90), 200)
	                .run();
	        },
	        onAct(pl, ctx) {
	            ctx.lookAtTarget(pl);
	            playSoundAll(`weapon.woosh.${randomRange(2, 4, true)}`, pl.pos, 1);
	            ctx.selectFromRange(pl, {
	                radius: 3.5,
	                angle: 30,
	                rotation: -15
	            }).forEach(en => {
	                ctx.attack(pl, en, {
	                    damage: 16,
	                    knockback: 0.8,
	                });
	            });
	        },
	        onLeave(_, ctx) {
	            ctx.task.cancel();
	            ctx.unfreeze(_);
	        },
	        transitions: {
	            resumeKamae: {
	                onEndOfLife: null
	            },
	            hurt: {
	                onHurt: {
	                    allowedState: 'both'
	                }
	            },
	            parried: {
	                onParried: {
	                    allowedState: 'backswing'
	                }
	            },
	            knockdown: {
	                onKnockdown: { allowedState: 'both' }
	            },
	            blocked: {
	                onBlocked: {
	                    allowedState: 'backswing',
	                }
	            },
	        }
	    }

	    combo3Sweap = {
	        cast: 16,
	        backswing: 19,
	        onEnter(pl, ctx) {
	            ctx.lookAtTarget(pl);
	            ctx.freeze(pl);
	            ctx.adsorbOrSetVelocity(pl, 1, 90);
	            playAnim(pl, `animation.weapon.ootachi.combo3.sweap.${
	                ctx.previousStatus === 'combo2Cut' ? 'l' : 'r'
	            }`);
	            ctx.task
	                .queue(() => ctx.adsorbOrSetVelocity(pl, 1, 90), 200)
	                .queue(() => ctx.adsorbOrSetVelocity(pl, 1, 90), 280)
	                .run();
	        },
	        onAct(pl, ctx) {
	            playSoundAll(`weapon.woosh.${randomRange(2, 4, true)}`, pl.pos, 1);
	            ctx.selectFromRange(pl, {
	                radius: 3.5,
	                angle: 90,
	                rotation: -45
	            }).forEach(en => {
	                ctx.attack(pl, en, {
	                    damage: 35,
	                    permeable: true,
	                    knockback: 1.2,
	                });
	            });
	        },
	        onLeave(_, ctx) {
	            ctx.task.cancel();
	            ctx.unfreeze(_);
	        },
	        timeline: {
	            10: (pl, ctx) => ctx.trap(pl)
	        },
	        transitions: {
	            resumeKamae: {
	                onEndOfLife: null,
	                onTrap: {
	                    isOnGround: true,
	                    preInput: 'onFeint'
	                }
	            },
	            hurt: {
	                onHurt: {
	                    allowedState: 'both'
	                }
	            },
	            parried: {
	                onParried: {
	                    allowedState: 'backswing'
	                }
	            },
	            knockdown: {
	                onKnockdown: { allowedState: 'both' }
	            },
	        }
	    }

	    dodgePrepare = {
	        cast: 0,
	        backswing: 1,
	        onEnter(pl, ctx) {
	            ctx.movement(pl);
	            ctx.getMoveDir(pl).then(direct => {
	                direct = direct || 1;
	                if (direct !== 1) {
	                    ctx.setVelocity(pl, direct * 90, 2);
	                } else {
	                    ctx.adsorbToTarget(pl, 2);
	                }
	                direct !== 3 && ctx.adsorbToTarget(pl, 0.3);

	                if (direct !== 3) {
	                    playAnim(pl, 'animation.weapon.ootachi.dodge.front');
	                } else {
	                    playAnim(pl, 'animation.weapon.ootachi.dodge.back');
	                }
	            });
	        },
	        onLeave(pl, ctx) {
	            ctx.movement(pl, false);
	        },
	        transitions: {
	            dodge: {
	                onEndOfLife: null
	            },
	            hurt: {
	                onHurt: {
	                    allowedState: 'both'
	                }
	            }
	        }
	    }

	    dodge = {
	        cast: 3,
	        backswing: 5,
	        onEnter(_, ctx) {
	            ctx.status.isBlocking = true;
	        },
	        onAct(_, ctx) {
	            ctx.status.isBlocking = false;
	            ctx.status.isDodging = true;
	        },
	        onLeave(_, ctx) {
	            ctx.status.isBlocking = false;
	            ctx.status.isDodging = false;
	        },
	        timeline: {
	            7: (_, ctx) => ctx.status.isDodging = false
	        },
	        transitions: {
	            resumeKamae: {
	                onEndOfLife: null
	            },
	            dodgeBlocking: {
	                onBlock: {
	                    allowedState: 'both'
	                }
	            },
	            knockdown: {
	                onKnockdown: {
	                    allowedState: 'both'
	                }
	            },
	            hurt: {
	                onHurt: { allowedState: 'both' }
	            }
	        }
	    }

	    dodgeBlocking = {
	        cast: 0,
	        onEnter(pl, ctx) {
	            mc.runcmdEx(`execute as ${pl.name} at @s run particle minecraft:lava_particle ^^1^0.5`);
	            mc.runcmdEx(`execute as ${pl.name} at @s run particle minecraft:lava_particle ^-0.1^1^0.5`);
	            mc.runcmdEx(`execute as ${pl.name} at @s run particle minecraft:lava_particle ^0.1^1^0.5`);
	            playSoundAll('weapon.heavy', pl.pos, 1);
	        },
	        transitions: {
	            hlitStrike: {
	                onEndOfLife: null
	            }
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    hlitStrike = {
	        cast: 6,
	        backswing: 4,
	        onEnter(pl, ctx) {
	            playAnim(pl, 'animation.weapon.ootachi.hlit');
	            ctx.adsorbOrSetVelocity(pl, 3, 90, 0.5);
	        },
	        onAct(pl, ctx) {
	            ctx.selectFromRange(pl, {
	                radius: 1.5,
	                angle: 60,
	                rotation: -30
	            }).forEach(en => {
	                ctx.attack(pl, en, {
	                    damage: 8,
	                    knockback: 3,
	                    parryable: false,
	                    permeable: true,
	                    stiffness: 800,
	                    shock: true,
	                    powerful: true,
	                });
	            });
	        },
	        timeline: {
	            9: (pl, ctx) => ctx.trap(pl)
	        },
	        transitions: {
	            resumeKamae: {
	                onEndOfLife: null
	            },
	            hurt: {
	                onHurt: {
	                    allowedState: 'both'
	                }
	            },
	            knockdown: {
	                onKnockdown: { allowedState: 'both' }
	            },
	            combo3Stab: {
	                onTrap: {
	                    preInput: 'onAttack',
	                    hasTarget: true,
	                }
	            },
	            combo3Sweap: {
	                onTrap: {
	                    preInput: 'onUseItem',
	                    hasTarget: true,
	                }
	            },
	        }
	    }
	}

	class OotachiTricks extends DefaultTrickModule {
	    constructor() {
	        super(
	            'rgb39.weapon.ootachi',
	            'idle',
	            [ 'weapon:ootachi', 'weapon:ootachi_akaoni', 'weapon:ootachi_dragon' ]
	        );
	    }

	    moves = new OotachiMoves()
	}

	ootachi = new OotachiTricks();
	return ootachi;
}

var sheathed_katana;
var hasRequiredSheathed_katana;

function requireSheathed_katana () {
	if (hasRequiredSheathed_katana) return sheathed_katana;
	hasRequiredSheathed_katana = 1;
	/// <reference path="../basic/types.d.ts"/>

	const { playAnim } = requireBasic();

	/**
	 * @type {TrickModule}
	 */
	sheathed_katana = {
	    sid: 'rgb39.weapon.katana',
	    bind: 'weapon:katana',
	    entry: 'default',
	    moves: {
	        default: {
	            cast: Infinity,
	            onEnter(pl, ctx) {
	                ctx.status.isBlocking = true;
	                playAnim(pl, 'animation.general.stand');
	            },
	            transitions: {
	                blocking: {
	                    onBlock: null
	                },
	                knockdown: {
	                    onKnockdown: { allowedState: 'both' }
	                },
	            }
	        },

	        blocking: {
	            cast: 5,
	            onEnter(pl) {
	                const side = Math.random() > 0.5 ? 'left' : 'right';
	                playAnim(pl, 'animation.twohanded.block.' + side, 'animation.twohanded.block.' + side);
	            },
	            transitions: {
	                default: { onEndOfLife: null },
	                blocking: { onBlock: null },
	                knockdown: {
	                    onKnockdown: { allowedState: 'both' }
	                },
	            }
	        },

	        knockdown: {
	            cast: 30,
	            onEnter: (pl, ctx) => {
	                ctx.freeze(pl);
	                ctx.status.disableInputs([
	                    'onAttack',
	                    'onUseItem'
	                ]);
	                playAnim(pl, 'animation.general.fell');
	            },
	            onLeave(pl, ctx) {
	                ctx.unfreeze(pl);
	                playAnim(pl, 'animation.general.stand');
	                ctx.status.enableInputs([
	                    'onAttack',
	                    'onUseItem'
	                ]);
	            },
	            transitions: {
	                default: {
	                    onEndOfLife: null
	                }
	            }
	        },
	    }
	};
	return sheathed_katana;
}

var shield_with_sword;
var hasRequiredShield_with_sword;

function requireShield_with_sword () {
	if (hasRequiredShield_with_sword) return shield_with_sword;
	hasRequiredShield_with_sword = 1;
	const { playAnim, playSoundAll } = requireBasic();
	const { DefaultMoves, DefaultTrickModule } = require_default();
	requireMain();
	const { constrictCalc, randomRange } = requireMath();
	requireHud();

	class ShieldSwordTricks extends DefaultTrickModule {
	    constructor() {
	        super(
	            'rgb39.weapon.shield_sword',
	            'idle',
	            [ 'weapon:shield_with_sword' ]
	        );
	    }

	    moves = new ShieldSwordMoves()
	}

	class ShieldSwordMoves extends DefaultMoves {
	    constructor() {
	        super();

	        this.animations.parry = 'animation.weapon.shield_with_sword.parry';

	        this.setup('idle');

	        this.setTransition('parry', 'draw', {
	            draw: {
	                onTrap: {
	                    tag: 'parryCounter',
	                    preInput: 'onUseItem',
	                }
	            }
	        });

	        this.setTransition('parry', 'shieldStrike', {
	            onTrap: {
	                tag: 'parryCounter',
	                preInput: 'onAttack',
	            }
	        });

	        this.block =  {
	            cast: 7,
	            onEnter(pl, ctx) {
	                playSoundAll(`weapon.sheild.hit${randomRange(1, 3, true)}`, pl.pos, 1);
	                ctx.status.isBlocking = true;
	                ctx.freeze(pl);
	                ctx.lookAtTarget(pl);
	                playAnim(pl, 'animation.weapon.shield_with_sword.block');
	            },
	            onLeave(pl, ctx) {
	                ctx.status.isBlocking = false;
	                ctx.unfreeze(pl);
	            },
	            timeline: {
	                6: (pl, ctx) => ctx.trap(pl)
	            },
	            transitions: {
	                hurt: {
	                    onHurt: null,
	                },
	                block: {
	                    onBlock: null
	                },
	                blocking: {
	                    onEndOfLife: {
	                        isSneaking: true
	                    }
	                },
	                afterBlocking: {
	                    onEndOfLife: {
	                        isSneaking: false
	                    }
	                },
	                swordCounter: {
	                    onTrap: {
	                        preInput: 'onAttack',
	                        allowedState: 'both',
	                        hasTarget: true,
	                    }
	                },
	                knockdown: {
	                    onKnockdown: null
	                },
	            },
	        };
	    }

	    /**
	     * @type {Move}
	     */
	    draw = {
	        cast: 10,
	        backswing: 11,
	        onEnter(pl, ctx) {
	            ctx.freeze(pl);
	            playAnim(pl, 'animation.weapon.shield_with_sword.draw');
	            ctx.task.queueList([
	                { handler() { ctx.status.isWaitingParry = true; }, timeout: 0 },
	                { handler() { ctx.status.isWaitingParry = false; }, timeout: 150 },
	            ]).run();
	        },
	        onLeave(pl, ctx) {
	            ctx.unfreeze(pl);
	            ctx.task.cancel();
	        },
	        onAct(pl, ctx) {
	            playSoundAll(`weapon.woosh.${randomRange(1, 3, true)}`, pl.pos, 1);
	            ctx.selectFromRange(pl, {
	                radius: 2.8,
	                angle: 60,
	                rotation: -30
	            }).forEach(en => {
	                ctx.attack(pl, en, {
	                    damage: 14,
	                    knockback: 0.5
	                });
	            });
	        },
	        timeline: {
	            0: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 0.5, 90),
	            3: (pl, ctx) => ctx.lookAtTarget(pl),
	            4: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 1, 90),
	            16: (pl, ctx) => ctx.trap(pl)
	        },
	        transitions: {
	            hurt: {
	                onHurt: null
	            },
	            idle: {
	                onEndOfLife: null
	            },
	            parried: {
	                onParried: {
	                    allowedState: 'backswing'
	                }
	            },
	            punch: {
	                onTrap: {
	                    preInput: 'onAttack',
	                    allowedState: 'backswing',
	                }
	            },
	            heavyChopPre: {
	                onTrap: {
	                    preInput: 'onUseItem',
	                    allowedState: 'backswing',
	                }
	            },
	            knockdown: {
	                onKnockdown: null
	            },
	            parry: {
	                onParry: null
	            },
	            blocked: {
	                onBlocked: {
	                    allowedState: 'backswing',
	                }
	            },
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    heavyChopPre = {
	        cast: 5,
	        onEnter(pl, ctx) {
	            ctx.freeze(pl);
	            playAnim(pl, 'animation.weapon.shield_with_sword.heavy_chop_pre');
	            ctx.adsorbToTarget(pl, 5, 1);
	        },
	        timeline: {
	            4: (pl, ctx) => ctx.trap(pl)
	        },
	        transitions: {
	            idle: {
	                onTrap: {
	                    preInput: 'onFeint',
	                    allowedState: 'both',
	                }
	            },
	            heavyChopAct: {
	                onEndOfLife: null
	            },
	            hurt: {
	                onHurt: null
	            },
	            knockdown: {
	                onKnockdown: null
	            },
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    heavyChopAct = {
	        cast: 5,
	        backswing: 8,
	        onEnter(pl, ctx) {
	            ctx.freeze(pl);
	            ctx.adsorbOrSetVelocity(pl, 1, 90);
	            playAnim(pl, 'animation.weapon.shield_with_sword.heavy_chop_act');
	        },
	        onLeave(pl, ctx) {
	            ctx.unfreeze(pl);
	        },
	        onAct(pl, ctx) {
	            playSoundAll(`weapon.woosh.${randomRange(3, 5, true)}`, pl.pos, 1);
	            ctx.selectFromRange(pl, {
	                angle: 40,
	                rotation: -20,
	                radius: 3.2
	            }).forEach(en => {
	                ctx.attack(pl, en, {
	                    damage: 20,
	                    knockback: 1.5,
	                    trace: true,
	                });
	            });
	        },
	        timeline: {
	            3: (pl, ctx) => ctx.lookAtTarget(pl)
	        },
	        transitions: {
	            idle: {
	                onEndOfLife: null
	            },
	            hurt: {
	                onHurt: null
	            },
	            parried: {
	                onParried: {
	                    allowedState: 'backswing'
	                }
	            },
	            knockdown: {
	                onKnockdown: null
	            },
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    shieldStrike = {
	        cast: 10,
	        backswing: 15,
	        onEnter(pl, ctx) {
	            ctx.freeze(pl);
	            playAnim(pl, 'animation.weapon.shield_with_sword.shield_strike');
	        },
	        onLeave(pl, ctx) {
	            ctx.unfreeze(pl);
	        },
	        onAct(pl, ctx) {
	            ctx.selectFromRange(pl, {
	                radius: 2.2,
	                angle: 120,
	                rotation: -60
	            }).forEach(en => {
	                ctx.attack(pl, en, {
	                    damage: 4,
	                    permeable: true,
	                    parryable: false,
	                    knockback: 0,
	                });
	            });
	        },
	        timeline: {
	            2: (pl, ctx) => ctx.lookAtTarget(pl),
	            0: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 0.8, 90, 1),
	            6: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 2.6, 90, 1),
	        },
	        transitions: {
	            hurt: {
	                onHurt: null
	            },
	            punchSomeone: {
	                onHit: {
	                    allowedState: 'both'
	                }
	            },
	            idle: {
	                onEndOfLife: null
	            },
	            knockdown: {
	                onKnockdown: null
	            },
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    punch = {
	        cast: 10,
	        backswing: 15,
	        onEnter(pl, ctx) {
	            ctx.freeze(pl);
	            playAnim(pl, 'animation.weapon.shield_with_sword.punch');
	            
	        },
	        onLeave(pl, ctx) {
	            ctx.unfreeze(pl);
	        },
	        onAct(pl, ctx) {
	            ctx.selectFromRange(pl, {
	                radius: 2.2,
	                angle: 120,
	                rotation: -60
	            }).forEach(en => {
	                ctx.attack(pl, en, {
	                    damage: 4,
	                    permeable: true,
	                    parryable: false,
	                    knockback: 0.05,
	                });
	            });
	        },
	        timeline: {
	            0: (pl, ctx) => ctx.lookAtTarget(pl),
	            2: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 3, 90, 1),
	            12: (pl, ctx) => ctx.trap(pl),
	        },
	        transitions: {
	            hurt: {
	                onHurt: null,
	            },
	            idle: {
	                onEndOfLife: null
	            },
	            punchSomeone: {
	                onHit: {
	                    allowedState: 'backswing'
	                }
	            },
	            knockdown: {
	                onKnockdown: null
	            },
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    punchSomeone = {
	        cast: 15,
	        onEnter(pl, ctx) {
	            playSoundAll(`weapon.sheild.hit${randomRange(1, 3, true)}`, pl.pos, 0.5);
	            ctx.trap(pl);
	        },
	        transitions: {
	            chopCombo: {
	                onTrap: {
	                    preInput: 'onUseItem',
	                    allowedState: 'both'
	                }
	            },
	            idle: {
	                onEndOfLife: null
	            },
	            knockdown: {
	                onKnockdown: null
	            },
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    chopCombo = {
	        cast: 5,
	        backswing: 7,
	        onEnter(pl, ctx) {
	            ctx.freeze(pl);
	            playAnim(pl, 'animation.weapon.shield_with_sword.chop_combo');
	        },
	        onLeave(pl, ctx) {
	            ctx.unfreeze(pl);
	        },
	        onAct(pl, ctx) {
	            playSoundAll(`weapon.woosh.${randomRange(1, 2, true)}`, pl.pos, 1);
	            ctx.selectFromRange(pl, {
	                radius: 3,
	                angle: 46,
	                rotation: -23
	            }).forEach(en => {
	                ctx.attack(pl, en, {
	                    damage: 14,
	                    knockback: 0.5
	                });
	            });
	        },
	        timeline: {
	            2: (pl, ctx) => ctx.adsorbToTarget(pl),
	            0: (pl, ctx) => ctx.lookAtTarget(pl),
	        },
	        transitions: {
	            hurt: {
	                onHurt: null
	            },
	            idle: {
	                onEndOfLife: null
	            },
	            parried: {
	                onParried: null
	            },
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    idle = {
	        cast: Infinity,
	        onEnter(pl, ctx) {
	            ctx.trap(pl);
	            ctx.unfreeze(pl);
	            playAnim(pl, 'animation.weapon.shield_with_sword.idle', 'animation.weapon.shield_with_sword.idle');
	            pl.setSprinting(false);
	        },
	        transitions: {
	            hurt: {
	                onHurt: null,
	            },
	            running: {
	                onChangeSprinting: { sprinting: true }
	            },
	            beforeBlocking: {
	                onSneak: {
	                    isSneaking: true,
	                },
	                onTrap: {
	                    preInput: 'onSneak',
	                    isSneaking: true,
	                }
	            },
	            draw: {
	                onUseItem: {
	                    hasTarget: true,
	                }
	            },
	            shieldStrike: {
	                onAttack: null
	            },
	            jump: {
	                onJump: null
	            },
	            knockdown: {
	                onKnockdown: null
	            },
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    jump = {
	        onEnter(pl, ctx) {
	            ctx.releaseTarget(pl.xuid);
	        },
	        transitions: {
	            idle: {
	                onEndOfLife: null
	            },
	            knockdown: {
	                onKnockdown: null
	            },
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    running = {
	        cast: Infinity,
	        onEnter(pl, ctx) {
	            playAnim(pl, 'animation.weapon.shield_with_sword.running', 'animation.weapon.shield_with_sword.running');
	            ctx.releaseTarget(pl.xuid);
	        },
	        transitions: {
	            hurt: {
	                onHurt: null,
	            },
	            idle: {
	                onChangeSprinting: { sprinting: false }
	            },
	            knockdown: {
	                onKnockdown: null
	            },
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    beforeBlocking = {
	        cast: 2,
	        onEnter(pl) {
	            playAnim(pl, 'animation.weapon.shield_with_sword.idle_to_blocking');
	        },
	        transitions: {
	            hurt: {
	                onHurt: null,
	            },
	            blocking: {
	                onEndOfLife: {
	                    isSneaking: true
	                }
	            },
	            afterBlocking: {
	                onEndOfLife: {
	                    isSneaking: false
	                }
	            },
	            knockdown: {
	                onKnockdown: null
	            },
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    blocking = {
	        cast: Infinity,
	        onEnter(pl, ctx) {
	            ctx.status.isBlocking = true;
	            playAnim(pl, 'animation.weapon.shield_with_sword.blocking', 'animation.weapon.shield_with_sword.blocking');
	        },
	        onLeave(pl, ctx) {
	            ctx.status.isBlocking = false;
	        },
	        transitions: {
	            hurt: {
	                onHurt: null,
	            },
	            running: {
	                onChangeSprinting: { sprinting: true }
	            },
	            afterBlocking: {
	                onSneak: {
	                    isSneaking: false
	                },
	            },
	            block: {
	                onBlock: null
	            },
	            rockSolid: {
	                onUseItem: {
	                    hasTarget: true
	                }
	            },
	            jump: {
	                onJump: null
	            },
	            knockdown: {
	                onKnockdown: null
	            },
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    rockSolid = {
	        cast: 4,
	        backswing: 7,
	        onEnter(pl, ctx) {
	            ctx.freeze(pl);
	            ctx.status.repulsible = false;
	            playAnim(pl, 'animation.weapon.shield_with_sword.rock_solid');
	        },
	        onAct(pl, ctx) {
	            ctx.status.repulsible = true;
	        },
	        onLeave(pl, ctx) {
	            ctx.unfreeze(pl);
	        },
	        transitions: {
	            idle: {
	                onEndOfLife: {
	                    isSneaking: false
	                }
	            },
	            sweapCounter: {
	                onHurt: {
	                    allowedState: 'cast',
	                    prevent: true,
	                },
	                onKnockdown: {
	                    allowedState: 'cast'
	                },
	            },
	            hurt: {
	                onHurt: {
	                    allowedState: 'backswing'
	                }
	            },
	            knockdown: {
	                onKnockdown: {
	                    allowedState: 'backswing'
	                }
	            },
	            beforeBlocking: {
	                onEndOfLife: {
	                    isSneaking: true
	                }
	            }
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    sweapCounter = {
	        cast: 11,
	        backswing: 10,
	        onEnter(pl, ctx) {
	            ctx.freeze(pl);
	            ctx.adsorbToTarget(pl, 4, 0.5);
	            playAnim(pl, 'animation.weapon.shield_with_sword.sweap_counter');
	        },
	        onLeave(pl, ctx) {
	            ctx.unfreeze(pl);
	        },
	        onAct(pl, ctx) {
	            ctx.lookAtTarget(pl);
	            ctx.selectFromRange(pl, {
	                radius: 3,
	                angle: 120,
	                rotation: -90,
	            }).forEach(en => {
	                ctx.attack(pl, en, {
	                    damage: 24,
	                    parryable: false,
	                    permeable: true,
	                    knockback: 1.5,
	                });
	            });
	        },
	        timeline: {
	            4: (pl, ctx) => {
	                ctx.selectFromRange(pl, {
	                    radius: 2.5,
	                    angle: 120,
	                    rotation: -60,
	                }).forEach(en => {
	                    ctx.attack(pl, en, {
	                        damage: 4,
	                        parryable: false,
	                        permeable: true,
	                        knockback: 0.05,
	                    });
	                });
	            },

	        },
	        transitions: {
	            hurt: {
	                onHurt: null
	            },
	            idle: {
	                onEndOfLife: null
	            },
	            knockdown: {
	                onKnockdown: null
	            },
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    afterBlocking = {
	        cast: 3,
	        onEnter(pl) {
	            playAnim(pl, 'animation.weapon.shield_with_sword.blocking_to_idle');
	        },
	        transitions: {
	            hurt: {
	                onHurt: null,
	            },
	            idle: {
	                onEndOfLife: null
	            },
	            knockdown: {
	                onKnockdown: null
	            },
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    swordCounter = {
	        cast: 6,
	        backswing: 7,
	        onEnter(pl, ctx) {
	            ctx.freeze(pl);
	            ctx.lookAtTarget(pl);
	            playAnim(pl, 'animation.weapon.shield_with_sword.sword_counter');
	        },
	        onLeave(pl, ctx) {
	            ctx.unfreeze(pl);
	        },
	        onAct(pl, ctx) {
	            playSoundAll(`weapon.woosh.${randomRange(1,3, true)}`, pl.pos, 1);
	            ctx.selectFromRange(pl, {
	                angle: 30,
	                rotation: -15,
	                radius: 3.5,
	            }).forEach(en => {
	                ctx.attack(pl, en, {
	                    damage: 12,
	                    knockback: 1,
	                    parryable: false,
	                    permeable: true,
	                });
	            });
	        },
	        timeline: {
	            3: (pl, ctx) => {
	                ctx.adsorbToTarget(pl, 2, 0.8);
	            }
	        },
	        transitions: {
	            hurt: {
	                onHurt: null,
	            },
	            idle: {
	                onEndOfLife: {
	                    isSneaking: false
	                },
	            },
	            blocking: {
	                onEndOfLife: {
	                    isSneaking: true
	                },
	            }
	        }
	    }
	}

	shield_with_sword = new ShieldSwordTricks();
	return shield_with_sword;
}

var uchigatana;
var hasRequiredUchigatana;

function requireUchigatana () {
	if (hasRequiredUchigatana) return uchigatana;
	hasRequiredUchigatana = 1;
	/// <reference path="../basic/types.d.ts"/>

	const { playAnim } = requireBasic();
	const { DefaultMoves, DefaultTrickModule } = require_default();
	requireMain();

	class UchigatanaMoves extends DefaultMoves {
	    /**
	     * @type {Move}
	     */
	    hold = {
	        cast: Infinity,
	        onEnter(pl, ctx) {
	            ctx.releaseTarget(pl.xuid);
	            playAnim(pl, 'animation.weapon.uchigatana.hold', 'animation.weapon.uchigatana.hold');
	        },
	        transitions: {
	            kamae: {
	                onLock: null,
	            },
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    kamae = {
	        cast: Infinity,
	        onEnter(pl) {
	            playAnim(pl, 'animation.weapon.uchigatana.kamae', 'animation.weapon.uchigatana.kamae');
	        },
	        transitions: {
	            hold: {
	                onReleaseLock: null,
	                onChangeSprinting: null,
	                onJump: null,
	            },
	            hurt: {
	                onHurt: {
	                    allowedState: 'both'
	                }
	            },
	            attack1: {
	                onAttack: {
	                    hasTarget: true
	                },
	            },
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    resume = {
	        transitions: {
	            hold: {
	                onEndOfLife: {
	                    hasTarget: false
	                }
	            },
	            kamae: {
	                onEndOfLife: {
	                    hasTarget: true
	                }
	            },
	            hurt: {
	                onHurt: {
	                    allowedState: 'both'
	                }
	            },
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    attack1 = {
	        cast: 8,
	        backswing: 13,
	        onEnter(pl, ctx) {
	            ctx.status.isBlocking = true;
	            ctx.freeze(pl);
	            ctx.lookAtTarget(pl);
	            playAnim(pl, 'animation.weapon.uchigatana.attack1');
	        },
	        onAct(pl, ctx) {
	            ctx.selectFromRange(pl).forEach(en => {
	                ctx.attack(pl, en, {
	                    damage: 12,
	                });
	            });
	        },
	        onLeave(pl, ctx) {
	            ctx.unfreeze(pl);
	            ctx.status.isBlocking = false;
	        },
	        timeline: {
	            0: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 0.5, 90),
	            4: (_, ctx) => ctx.status.isBlocking = false,
	            5: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 1.5, 90),
	            12: (pl, ctx) => ctx.trap(pl)
	        },
	        transitions: {
	            block: {
	                onBlock: null
	            },
	            resume: {
	                onEndOfLife: null
	            },
	            hurt: {
	                onHurt: {
	                    allowedState: 'both'
	                }
	            },
	            attack2: {
	                onTrap: {
	                    preInput: 'onUseItem',
	                }
	            },
	            parried: {
	                onParried: {
	                    allowedState: 'both'
	                }
	            },
	            blocked: {
	                onBlocked: {
	                    allowedState: 'both'
	                }
	            },
	        }
	    }

	    /**
	     * @type {Move}
	     */
	    attack2 = {
	        cast: 12,
	        backswing: 14,
	        onEnter(pl, ctx) {
	            ctx.freeze(pl);
	            ctx.lookAtTarget(pl);
	            playAnim(pl, 'animation.weapon.uchigatana.attack2');
	        },
	        onAct(pl, ctx) {
	            ctx.selectFromRange(pl, {
	                radius: 3,
	                angle: 180,
	                rotation: -90,
	            }).forEach(en => {
	                ctx.attack(pl, en, {
	                    damage: 24,
	                });
	            });
	        },
	        onLeave(pl, ctx) {
	            ctx.unfreeze(pl);
	        },
	        timeline: {
	            3: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 1, 90),
	            8: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 2.2, 90),
	        },
	        transitions: {
	            block: {
	                onBlock: null
	            },
	            resume: {
	                onEndOfLife: null
	            },
	            hurt: {
	                onHurt: {
	                    allowedState: 'both'
	                }
	            },
	            parried: {
	                onParried: {
	                    allowedState: 'both'
	                }
	            },
	        }
	    }

	    constructor() {
	        super();

	        this.setup('resume');
	    }
	}

	class UchigatanaModule extends DefaultTrickModule {
	    constructor() {
	        super(
	            'rgb39.weapon.empty_hand',
	            'hold',
	            [ 'weapon:uchigatana' ]
	        );
	    }

	    moves = new UchigatanaMoves()
	}

	/**
	 * @type {TrickModule}
	 */
	uchigatana = new UchigatanaModule();
	return uchigatana;
}

var collection;
var hasRequiredCollection;

function requireCollection () {
	if (hasRequiredCollection) return collection;
	hasRequiredCollection = 1;
	const mods = [
	    requireDouble_dagger(),
	    requireEmptyHand(),
	    requireLightSaber(),
	    requireMoon_glaive(),
	    requireOotachi(),
	    requireSheathed_katana(),
	    requireShield_with_sword(),
	    requireUchigatana(),
	];

	collection = mods;
	return collection;
}

var completeness;
var hasRequiredCompleteness;

function requireCompleteness () {
	if (hasRequiredCompleteness) return completeness;
	hasRequiredCompleteness = 1;
	/// <reference path="./types.d.ts"/>

	/**
	 * @param {TrickModule} mod 
	 */
	function checkCompleteness(mod) {
	    if (!mod.sid || !mod.bind || !mod.entry || !mod.moves) {
	        return '缺少必要的属性: sid | bind | entry | moves'
	    }

	    if (!Object.keys(mod.moves).includes(mod.entry)) {
	        return `无效的 entry: '${mod.entry}'`
	    }

	    return false
	}

	completeness = {
	    checkCompleteness
	};
	return completeness;
}

var combat;
var hasRequiredCombat;

function requireCombat () {
	if (hasRequiredCombat) return combat;
	hasRequiredCombat = 1;
	const { remote } = requireSetup();

	async function damage(victim, damage, cause, abuser, projectile) {
	    return await remote.call(
	        'damage',
	        victim.uniqueId,
	        damage,
	        cause,
	        abuser.uniqueId,
	        projectile?.uniqueId
	    )
	    // _damageLL(victim, damage)
	}

	function _damageLL(victim, damage, cause, abuser, projectile) {
	    victim.hurt(damage, ActorDamageCause.EntityAttack);
	}

	combat = {
	    damage, _damageLL
	};
	return combat;
}

var func;
var hasRequiredFunc;

function requireFunc () {
	if (hasRequiredFunc) return func;
	hasRequiredFunc = 1;
	const kinematics = requireKinematics();
	const combat = requireCombat();

	func = {
	    kinematics, combat,
	};
	return func;
}

var vec;
var hasRequiredVec;

function requireVec () {
	if (hasRequiredVec) return vec;
	hasRequiredVec = 1;

	function vec2(x1, y1, x2, y2) {
	    const dx = x2 - x1,
	        dy = y2 - y1;
	    return {
	        dx, dy,
	        m: Math.sqrt(dx * dx + dy * dy)
	    }
	}

	function getAngleFromVector2(v1, v2) {
	    const dotProduct = v1.dx * v2.dx + v1.dy * v2.dy;
	    const angle = dotProduct / (v1.m * v2.m);

	    return Math.acos(angle)
	}

	function rotate2(v, rad) {
	    const { dx, dy, m } = v;
	    const x = dx * Math.cos(rad) - dy * Math.sin(rad);
	    const y = dx * Math.sin(rad) + dy * Math.cos(rad);
	    return {
	        dx: x, dy: y, m
	    }
	}

	function multiply2(v, factor) {
	    const { dx, dy } = v;
	    return vec2(0, 0, dx*factor, dy*factor)
	}

	function minus(a, b) {
	    return vec2(
	        0, 0,
	        a.dx - b.dx,
	        a.dy - b.dy
	    )
	}

	function vec2ToAngle(v) {
	    let angle = getAngleFromVector2(v, vec2(0, 0, 0, -1));

	    if (v.dx < 0) {
	        angle = -angle;
	    }
	    
	    return angle
	}

	vec = {
	    vec2, getAngleFromVector2, rotate2, multiply2, minus,
	    vec2ToAngle, 
	};
	return vec;
}

var range;
var hasRequiredRange;

function requireRange () {
	if (hasRequiredRange) return range;
	hasRequiredRange = 1;
	const { vec2, getAngleFromVector2 } = requireVec();

	const defaultRange = {
	    angle: 60,
	    rotation: -30,
	    radius: 2
	};

	function selectFromRange(pl, range) {
	    const {
	        angle, rotation, radius
	    } = Object.assign({}, defaultRange, range);
	    const pos = pl.pos;
	    const startAngle = pl.direction.yaw + rotation + 90;
	    const endAngle = startAngle + angle;
	    const RAD = Math.PI / 180;
	    const sx = pos.x
	        ,sz = pos.z
	        ,tx = sx + Math.cos(startAngle * RAD) * radius
	        ,tz = sz + Math.sin(startAngle * RAD) * radius
	        ,Tx = sx + Math.cos(endAngle * RAD) * radius
	        ,Tz = sz + Math.sin(endAngle * RAD) * radius;

	    const v1 = vec2(sx, sz, tx, tz)
	        ,v2 = vec2(sx, sz, Tx, Tz)
	        ,rangeAngle = getAngleFromVector2(v1, v2);

	    const result = [];

	    mc.getAllEntities().forEach(e => {
	        const dist = pl.distanceTo(e.pos);

	        if (dist > radius) {
	            return
	        }

	        if (dist <= 2) {
	            result.push(e);
	            return
	        }

	        const v = vec2(sx, sz, e.pos.x, e.pos.z);
	        const angle = getAngleFromVector2(v1, v);

	        if (!isNaN(angle) && angle <= rangeAngle) {
	            result.push(e);
	        }
	    });

	    return result.filter(e => e.uniqueId !== pl.uniqueId)
	}

	range = {
	    selectFromRange, defaultRange,
	};
	return range;
}

var status_1;
var hasRequiredStatus;

function requireStatus () {
	if (hasRequiredStatus) return status_1;
	hasRequiredStatus = 1;
	/// <reference path="../types.d.ts"/>
	requireMain();

	const defaultAcceptableInputs = [
	    'onJump', 'onSneak', 'onAttack', 'onUseItem',
	    'onChangeSprinting', 'onFeint'
	];

	/**@type {PlayerStatus}*/
	class Status {
	    /**
	     * @type {Map<string, PlayerStatus>}
	     */
	    static status = new Map()
	    /**
	     * @param {string} xuid 
	     * @returns {PlayerStatus}
	     */
	    static get(xuid) {
	        return this.status.get(xuid) ?? new Status(xuid)
	    }

	    hand = 'minecraft:air'
	    status = 'unknown'
	    duration = 0
	    repulsible = true
	    acceptableInputs = new Set(defaultAcceptableInputs)
	    stamina = 0
	    shocked = false
	    preInput = null
	    hegemony = false
	    #preInputTimer = null

	    isBlocking = false
	    isWaitingParry = false
	    isWaitingDeflection = false
	    isDodging = false

	    cameraOffsets = [ 1.5, 0, 0.8 ]

	    constructor(xuid) {
	        Status.status.set(xuid, this);
	        this.clear();
	    }

	    clear() {
	        this.hand = 'minecraft:air';
	        this.status = 'unknown';
	        this.duration = 0;
	        this.repulsible = true;
	        this.isBlocking = false;
	        this.isWaitingParry = false;
	        this.acceptableInputs = new Set(defaultAcceptableInputs);
	        this.stamina = 0;
	        this.stiffness = 0;
	    }

	    edit(obj) {
	        for (const k in obj) {
	            if (k in this) {
	                this[k] = obj[k];
	            }
	        }
	    }

	    acceptableInput(name, accept) {
	        if (accept !== undefined) {
	            accept
	                ? this.acceptableInputs.add(name)
	                : this.acceptableInputs.delete(name);
	            return
	        }

	        return this.acceptableInputs.has(name)
	    }

	    /**
	     * @param {AcceptbleInputTypes[]} inputs 
	     */
	    enableInputs(inputs) {
	        inputs.forEach(type => this.acceptableInputs.add(type));
	    }

	    /**
	     * @param {AcceptbleInputTypes[]} inputs 
	     */
	    disableInputs(inputs) {
	        inputs.forEach(type => this.acceptableInputs.delete(type));
	    }

	    /**
	     * @param {AcceptbleInputTypes} input 
	     */
	    setPreInput(input) {
	        if (this.#preInputTimer) {
	            clearInterval(this.#preInputTimer);
	        }

	        this.preInput = input;
	        this.#preInputTimer = setTimeout(() => {
	            this.#preInputTimer = null;
	            this.preInput = null;
	        }, 500);
	    }
	}

	status_1 = {
	    Status, defaultAcceptableInputs
	};
	return status_1;
}

var camera_1;
var hasRequiredCamera;

function requireCamera () {
	if (hasRequiredCamera) return camera_1;
	hasRequiredCamera = 1;
	requireMain();
	const { Status } = requireStatus();
	const { rotate2, vec2, multiply2 } = requireVec();

	const cameraInput = (pl, enabled=true) => {
	    mc.runcmdEx(`inputpermission set "${pl.name}" camera ${enabled ? 'enabled' : 'disabled'}`);
	};

	const camera = (pl, easeTime, easeType, pos, lookAt) => {
	    mc.runcmdEx(`execute as "${pl.name}" run camera @s set minecraft:free ease ${easeTime} ${easeType} pos ${pos.x} ${pos.y} ${pos.z} facing ${lookAt.x} ${lookAt.y} ${lookAt.z}`);
	};

	function clearCamera(pl) {
	    mc.runcmdEx(`camera "${pl.name}" set minecraft:third_person`);
	}

	const ROT = Math.PI * 1;

	const battleCameraMiddlePoint = (pl, en) => {
	    const plPos = pl.pos;
	    const enPos = en.pos;
	    const initVec = vec2(plPos.x, plPos.z, enPos.x, enPos.z);
	    const dist = initVec.m;
	    const offsetZ = 0.8;
	    const offsetX = 1.5;
	    const moduloScale = offsetZ / initVec.m;
	    
	    const middlePoint = {
	        x: (plPos.x + enPos.x) / 2,
	        y: (plPos.y + enPos.y) / 2,
	        z: (plPos.z + enPos.z) / 2,
	    };

	    const cameraVec = multiply2(
	        rotate2(
	            initVec,
	            Math.acos(
	                Math.max(0, Math.min(offsetZ / dist, 1))
	            ) - ROT
	        ),
	        moduloScale
	    );
	    
	    const crossPos = {
	        x: plPos.x - cameraVec.dx,
	        z: plPos.z - cameraVec.dy,
	    };

	    const cameraTargetVec = vec2(
	        crossPos.x,
	        crossPos.z,
	        enPos.x, enPos.z
	    );

	    const cameraPosVec = multiply2(
	        rotate2(cameraTargetVec, Math.PI),
	        offsetX / cameraTargetVec.m
	    );

	    const cameraPos = {
	        x: crossPos.x + cameraPosVec.dx,
	        z: crossPos.z + cameraPosVec.dy,
	        y: plPos.y - 0.4,
	    };

	    camera(pl, 0.1, 'linear', cameraPos, { ...middlePoint, y: cameraPos.y });
	};

	const battleCamera = (pl, en) => {
	    const plPos = pl.pos;
	    const enPos = en.pos;
	    const initVec = vec2(plPos.x, plPos.z, enPos.x, enPos.z);
	    const dist = initVec.m;
	    const [ offsetX, offsetY, offsetZ ] = Status.get(pl.xuid).cameraOffsets;
	    const moduloScale = offsetZ / initVec.m;

	    const cameraVec = multiply2(
	        rotate2(
	            initVec,
	            Math.acos(
	                Math.max(0, Math.min(offsetZ / dist, 1))
	            ) - ROT
	        ),
	        moduloScale
	    );

	    const crossPos = {
	        x: plPos.x - cameraVec.dx,
	        z: plPos.z - cameraVec.dy,
	    };

	    const cameraTargetVec = vec2(
	        crossPos.x,
	        crossPos.z,
	        enPos.x, enPos.z
	    );

	    const cameraPosVec = multiply2(
	        rotate2(cameraTargetVec, Math.PI),
	        offsetX / cameraTargetVec.m
	    );

	    const cameraPos = {
	        x: crossPos.x + cameraPosVec.dx,
	        z: crossPos.z + cameraPosVec.dy,
	        y: plPos.y - 0.4,
	    };

	    camera(pl, 0.1, 'linear', cameraPos, { x: enPos.x, z: enPos.z, y: cameraPos.y + offsetY });
	};

	camera_1 = {
	    battleCamera, battleCameraMiddlePoint, cameraInput, clearCamera
	};
	return camera_1;
}

var lock;
var hasRequiredLock;

function requireLock () {
	if (hasRequiredLock) return lock;
	hasRequiredLock = 1;
	requireSetup();
	requireMain();
	const { selectFromRange } = requireRange();
	const { battleCamera, cameraInput, clearCamera } = requireCamera();
	const { knockback, faceTo } = requireKinematics();
	const { setVelocity } = requireKinematic();
	requireBasic();

	const locks = new Map();

	function lockTarget(src, target) {
	    const pl = mc.getPlayer(src);
	    if (target) {
	        cameraInput(pl, false);
	        locks.set(src, target);
	        pl.setMovementSpeed(0.04);
	    } else {
	        clearCamera(pl);
	    }
	}

	function releaseTarget(src) {
	    const pl = mc.getPlayer(src);
	    cameraInput(pl);
	    clearCamera(pl);
	    locks.delete(src);
	    pl.setMovementSpeed(0.1);
	}

	function toggleLock(src) {
	    if (locks.has(src)) {
	        releaseTarget(src);
	        return null
	    }

	    const pl = mc.getPlayer(src);
	    const target = getClosedEntity(pl);

	    if (!target) {
	        return false
	    }

	    lockTarget(src, target);
	    return target
	}

	function getAngle(a, b) {
	    a = a.pos;
	    b = b.pos;
	    const dx = b.x - a.x;
	    const dy = b.y - a.y;
	    const dz = b.z - a.z;
	    const angleXZ = Math.atan2(dz, dx) * 180 / Math.PI;
	    const angleY = Math.atan2(dy, Math.sqrt(dx * dx + dz * dz)) * 180 / Math.PI;
	    return [angleXZ - 90, -angleY]
	}

	function lookAt(pl, en) {
	    if (!en) {
	        return releaseTarget(pl)
	    }

	    const [ yaw, pitch ] = getAngle(pl, en);

	    pl.teleport(pl.feetPos, new DirectionAngle(pitch, yaw));
	    // const bs = new BinaryStream()
	    // bs.writeVarInt64(+pl.uniqueId)
	    // bs.writeVec3(pl.pos)
	    // bs.writeVec3(new FloatPos(
	    //     pitch, yaw, yaw,
	    //     pl.pos.dimid
	    // ))
	    // bs.writeByte(3)
	    // bs.writeBool(true)
	    // bs.writeFloat(0)
	    // bs.writeVarInt64(0)
	    // const pack = bs.createPacket(0x13)

	    // mc.getOnlinePlayers().forEach(pl => {
	    //     pl.sendPacket(pack)
	    // })
	    // mc.runcmdEx(`execute as "${pl.name}" at @s run tp @s ~~~ ${yaw} 0 false`)
	    // faceTo(pl, en)
	}

	function lookAtTarget(pl) {
	    const en = locks.get(pl.xuid);
	    if (!en) {
	        return
	    }
	    lookAt(pl, en);
	}

	function hasLock(pl) {
	    return locks.has(pl.xuid)
	}

	function adsorbTo(pl, en, max, offset=2) {
	    const dist = en.distanceTo(pl.pos) - offset;

	    knockback(
	        pl,
	        en.pos.x - pl.pos.x,
	        en.pos.z - pl.pos.z,
	        Math.min(dist, max),
	        0
	    );
	}

	function adsorbToTarget(pl, max, offset) {
	    const en = locks.get(pl.xuid);
	    if (!en) {
	        return
	    }

	    adsorbTo(pl, en, max, offset);
	}

	function adsorbOrSetVelocity(pl, max, velocityRot=90, offset=1.5) {
	    const en = locks.get(pl.xuid);
	    if (en) {
	        // lookAtTarget(pl)
	        adsorbToTarget(pl, max, offset);
	        return
	    }

	    setVelocity(pl, velocityRot, max, -1);
	}

	function distanceToTarget(pl) {
	    const en = locks.get(pl.xuid);

	    if (!en) {
	        return Infinity
	    }

	    return en.distanceTo(pl.pos)
	}

	const onTick = em => () => {
	    locks.forEach(async (t, s) => {
	        const _s = mc.getPlayer(s);

	        if (t.health) {
	            battleCamera(_s, t);
	        } else {
	            em.emitNone('onReleaseLock', _s, _s.getHand().type);
	            releaseTarget(s);
	        }
	    });
	};

	function getClosedEntity(en) {
	    let closed = null
	        ,dist = Infinity;

	    selectFromRange(en, {
	        radius: 10,
	    }).forEach(e => {
	        if (['coptaine:physics', 'minecraft:item'].includes(e.type)) {
	            return
	        }

	        if (!closed) {
	            return closed = e
	        }

	        const _dist = e.distanceTo(en.pos);

	        if (_dist < dist) {
	            dist = _dist;
	            closed = e;
	        }
	    });

	    return closed
	}

	lock = {
	    onTick, getClosedEntity, lockTarget, releaseTarget, toggleLock,
	    lookAt, lookAtTarget, distanceToTarget, hasLock, adsorbToTarget,
	    adsorbTo, adsorbOrSetVelocity
	};
	return lock;
}

var generic;
var hasRequiredGeneric;

function requireGeneric () {
	if (hasRequiredGeneric) return generic;
	hasRequiredGeneric = 1;
	const { hasLock } = requireLock();

	function movement(pl, enabled=true) {
	    if (!enabled) {
	        return pl.setMovementSpeed(0), undefined
	    }

	    pl.setMovementSpeed(
	        hasLock(pl) ? 0.04 : 0.1
	    );
	}

	function movementInput(pl, enabled=true) {
	    mc.runcmdEx(`inputpermission set "${pl.name}" movement ${enabled ? 'enabled' : 'disabled'}`);
	}

	function camera(pl, enabled=true) {
	    mc.runcmdEx(`inputpermission set "${pl.name}" camera ${enabled ? 'enabled' : 'disabled'}`);
	}

	generic = {
	    movement, camera, movementInput
	};
	return generic;
}

var task;
var hasRequiredTask;

function requireTask () {
	if (hasRequiredTask) return task;
	hasRequiredTask = 1;
	const tasks = new Map();

	class Task {
	    constructor(xuid) {
	        if (!tasks.get(xuid)) {
	            tasks.set(xuid, this);
	        }
	    }

	    /**
	     * @param {string} xuid 
	     * @returns {Task}
	     */
	    static get(xuid) {
	        return tasks.get(xuid) || new Task(xuid)
	    }

	    _queue = []
	    _currentTimeStamp = null

	    /**
	     * @param {{handler: () => any, timeout: number}[]} taskList 
	     */
	    queueList(taskList) {
	        this._queue = this._queue.concat(taskList);
	        return this
	    }

	    queue(handler, timeout=5) {
	        this._queue.push({handler, timeout});
	        return this
	    }

	    skip() {
	        if (!this._currentTimeStamp) {
	            return
	        }

	        clearInterval(this._currentTimeStamp);
	        this._currentTimeStamp = null;
	    }

	    #next = () => {
	        const _task = this._queue.splice(0, 1)[0];

	        if (!_task) {
	            return
	        }

	        const { handler, timeout } = _task;

	        this._currentTimeStamp = setTimeout(() => {
	            handler.call(null);
	            this.#next();
	        }, timeout);
	    }

	    cancel() {
	        this.skip();
	        this._queue = [];
	    }

	    run() {
	        this.#next();
	    }
	}

	task = {
	    Task
	};
	return task;
}

var eventStream;
var hasRequiredEventStream;

function requireEventStream () {
	if (hasRequiredEventStream) return eventStream;
	hasRequiredEventStream = 1;
	/// <reference path="../types.d.ts"/>

	requireEvents();

	class EventInputStream {
	    static #ends = new Map()
	    /**@type {(em: EventEmitter) => EventInputStream}*/
	    static get(end) {
	        return this.#ends.get(end) || new EventInputStream(end)
	    }

	    #filters = new Set()
	    /**@type {EventEmitter}*/
	    #end = null

	    constructor(end) {
	        this.setEnd(end);
	    }

	    /**
	     * @param {(val: {type: string; args: any[]}) => boolean} filter 
	     */
	    addFilter(filter) {
	        this.#filters.add(filter);
	    }

	    /**
	     * @param {(val: {type: string; args: any[]}) => boolean} filter 
	     */
	    removeFilter(filter) {
	        this.#filters.delete(filter);
	    }

	    /**
	     * @param {{type: string; args: any[]}} input 
	     */
	    #filter(input) {
	        let nextVal = input;
	        for (const filter of this.#filters) {
	            try {
	                if ((nextVal = filter.call(null, nextVal)) === false) {
	                    return false
	                }
	            } catch (_) {
	                return false
	            }
	        }

	        return true
	    }

	    setEnd(end) {
	        this.#end = end;
	        EventInputStream.#ends.set(end, this);
	    }

	    put(type, args) {
	        if (!this.#filter({ type, args })) {
	            return
	        }

	        if (!this.#end) {
	            return
	        }

	        this.#end.emitNone(type, ...args);
	    }
	}

	eventStream = {
	    EventInputStream
	};
	return eventStream;
}

var core;
var hasRequiredCore;

function requireCore () {
	if (hasRequiredCore) return core;
	hasRequiredCore = 1;
	/// <reference path="./types.d.ts"/>

	const { EventEmitter } = requireEvents();
	requireMain();
	const { knockback, clearVelocity, impulse, applyKnockbackAtVelocityDirection } = requireKinematics();
	const { combat: { damage: _damage } } = requireFunc();
	const { playAnim } = requireBasic();
	const { movement, camera, movementInput } = requireGeneric();
	requireCommand();
	const { selectFromRange } = requireRange();
	const { Status, defaultAcceptableInputs } = requireStatus();
	const { Task } = requireTask();
	const { EventInputStream } = requireEventStream();
	const {
	    lookAt, lookAtTarget, distanceToTarget, adsorbToTarget, adsorbTo,
	    onTick, toggleLock, hasLock, releaseTarget, adsorbOrSetVelocity
	} = requireLock();
	const { setVelocity, isCollide } = requireKinematic();
	const { vec2, vec2ToAngle } = requireVec();
	const { clearCamera } = requireCamera();

	const em = new EventEmitter({ enableWatcher: true });
	const es = EventInputStream.get(em);

	const yawToVec2 = yaw => {
	    const rad = yaw * Math.PI / 180.0;
	    return {
	        x: Math.cos(rad),
	        y: Math.sin(rad)
	    }
	};

	function knockdown(abuser, victim, knockback=2) {
	    em.emitNone('knockdown', abuser, victim, knockback);
	}

	function trap(pl, data) {
	    em.emitNone('trap', pl, data);
	}

	em.connectWatcher({
	    // add(...args) {
	    //     console.log(args)
	    // },
	    // emit(arg) {
	    //     console.log(arg.type)
	    // }
	});

	/**
	 * @param {any} abuser 
	 * @param {any} victim 
	 * @param {DamageOption} damageOpt
	 */
	function attack(abuser, victim, damageOpt) {
	    em.emitNone('attack', abuser, victim, damageOpt);
	}

	const playerEvents = [
	    'onSneak', 'onUseItem', 'onChangeSprinting',
	    'onJump',
	];
	const mobEvents = [
	    // 'onMobHurt',
	    'onProjectileHitEntity',
	];
	// const customEvents = [
	//     'onParry', 'onParried', 'onEndOfLife', 'onHurt', 'onBlocked', 'onBlock', 'onHit'
	// ]

	/**@type {Map<string, PlayerStatus>}*/

	/**@type {(pl: any) => PlayerStatus}*/
	const _status = pl => Status.get(pl.xuid);

	function freeze(pl) {
	    movement(pl, false);
	    camera(pl, false);
	}

	function unfreeze(pl) {
	    movement(pl);
	    movementInput(pl, true);
	    camera(pl);
	}

	function getMoveDir(pl) {
	    const previusPos = {
	        x: pl.feetPos.x,
	        z: pl.feetPos.z
	    };
	    const xuid = pl.xuid;

	    return new Promise(res => {
	        em.once('onTick', () => {
	            const currentPos = mc.getPlayer(xuid).feetPos;
	            const movVec = vec2(currentPos.x, currentPos.z, previusPos.x, previusPos.z);
	            let rot = vec2ToAngle(movVec) * 180 / Math.PI - pl.direction.yaw;

	            rot = rot < -180 ? rot + 360
	                : rot > 190 ? rot - 360 : rot;

	            const direct = isNaN(rot) ? 0
	                : rot < -135 ? 3
	                    : rot < -45 ? 4
	                        : rot < 45 ? 1
	                            : rot < 135 ? 2 : 3;
	            
	            res(direct);
	        });
	    })
	}

	/**
	 * @param {MovementContext} mixins
	 * @returns {MovementContext}
	 */
	function _ctx(pl, mixins={}) {
	    return {
	        camera,
	        movement,
	        movementInput,
	        selectFromRange,
	        knockback,
	        attack,
	        freeze,
	        unfreeze,
	        status: _status(pl),
	        clearVelocity,
	        impulse,
	        setVelocity,
	        yawToVec2,
	        applyKnockbackAtVelocityDirection,
	        task: Task.get(pl.xuid),
	        lookAt,
	        lookAtTarget,
	        distanceToTarget,
	        adsorbToTarget,
	        adsorbTo,
	        knockdown,
	        releaseTarget,
	        adsorbOrSetVelocity,
	        getMoveDir,
	        trap,
	        setSpeed: (pl, speed) => pl.setMovementSpeed(speed),
	        ...mixins
	    }
	}

	function watchMainhandChange(pl) {
	    const status = Status.get(pl.xuid);
	    const hand = pl.getHand()?.type || 'minecraft:air';
	    
	    status.hand = hand;
	    return status
	}

	const pick = (obj, arr) =>
	    arr.reduce((iter, val) => (val in obj && (iter[val] = obj[val]), iter), {});

	const playerAttrPickList = [
	    'inAir', 'inWater', 'inLava', 'inRain', 'inSnow', 'inWall', 'inWaterOrRain', 'isInvisible', 'isHungry',
	    'isOnFire', 'isOnGround', 'isOnHotBlock', 'isGliding', 'isFlying', 'isMoving', 'isSneaking'
	];

	const defaultPacker = (pl, bind, status) => {
	    const allowedState = checkMoveState(bind, status);
	    const picked = pick(pl, playerAttrPickList);

	    // console.log(pl.name, ' packer:', isCollide(pl))

	    /**@type {TransitionOptMixins}*/
	    const mixins = {
	        stamina: status.stamina || 0,
	        hasTarget: hasLock(pl),
	        repulsible: status.repulsible,
	        isCollide: isCollide(pl),
	    };

	    return {
	        prevent: false,
	        allowedState,
	        ...picked,
	        ...mixins,
	    }
	};

	const dataPackers = {
	    onSneak(args) {
	        return {
	            isSneaking: args[1]
	        }
	    },
	    onChangeSprinting(args) {
	        return {
	            sprinting: args[1]
	        }
	    },
	    onEndOfLife(args) {
	        const status = Status.get(args[0].xuid);
	        return {
	            preInput: status.preInput
	        }
	    },
	    onTrap(args) {
	        const [ pl, data ] = args;
	        const status = Status.get(pl.xuid);
	        return {
	            preInput: status.preInput,
	            ...data
	        }
	    }
	};

	function checkCondition(cond, data) {
	    for (const [ k, v ] of Object.entries(cond)) {
	        if (k === 'prevent') {
	            continue
	        }

	        if (k === 'allowedState') {
	            const dataState = data[k];
	            if (dataState === 'finish' || v === 'both' || v === dataState) {
	                continue
	            }

	            return false
	        }

	        if (typeof v === 'function') {
	            if (!v(data[k])) {
	                return false
	            }

	            continue
	        }

	        if (cond[k] !== data[k]) {
	            return false
	        }
	    }

	    return true
	}

	const defaultTransitionCondition = {
	    prevent: false,
	    allowedState: 'both',
	};

	function initCombatComponent(pl, bind, status) {
	    if (!bind) {
	        return
	    }

	    const { moves, entry } = bind;
	    const move = moves[entry];

	    status.status = entry;
	    status.duration = 0;

	    if (move.onEnter) {
	        move.onEnter(pl, _ctx(pl));
	    }
	}

	// const timeTracks = new Map()

	/**
	 * @param {any} pl 
	 * @param {TrickModule} bind 
	 * @param {PlayerStatus} status 
	 * @param {string} eventName 
	 * @param {() => void} prevent 
	 * @param {any[]} args 
	 * @returns 
	 */
	function transition(pl, bind, status, eventName, prevent, args) {
	    if (!bind) {
	        return
	    }

	    if (status.status === 'unknown') {
	        initCombatComponent(pl, bind, status);
	    }

	    const currentMove = bind.moves[status.status];

	    if (!currentMove) {
	        return
	    }

	    const transitions = currentMove.transitions;

	    let next,
	        /**@type {DefaultTransitionOption}*/cond;

	    /**@type {[string, DefaultTransitionOption][]}*/
	    let candidates = [];

	    for (const [_next, _cond] of Object.entries(transitions)) {
	        if (Object.keys(_cond).includes(eventName)) {
	            const next = _next;
	            const cond = Object.assign({}, defaultTransitionCondition, (_cond || {})[eventName]);
	            candidates.push([next, cond]);
	        }
	    }

	    if (!candidates.length) {
	        return
	    }

	    let dataPacker, data = defaultPacker(pl, bind, status);
	    if (dataPacker = dataPackers[eventName]) {
	        data = Object.assign(dataPacker(args), data);
	    }

	    for (const [ $next, $cond ] of candidates) {
	        if (!checkCondition($cond, data)) {
	            continue
	        }

	        next = $next;
	        cond = $cond;
	    }

	    if (!next) {
	        return
	    }

	    let previousStatus = status.status;

	    if (cond.prevent) {
	        prevent();
	    }

	    status.status = next;
	    status.duration = 0;
	    const nextMove = bind.moves[next] || bind.moves[bind.entry];

	    if (nextMove.immediately) {
	        nextMove.onAct(pl, _ctx(pl, {
	            rawArgs: args,
	            prevent,
	            previousStatus,
	            previousMoveState: -1
	        }));
	        
	        return em.once('onTick', () => transition(pl, bind, status, 'onEndOfLife', prevent, args))
	    }

	    // const track = timeTracks.get(pl.xuid) ?? []
	    // track.forEach(t => clearInterval(t))
	    // track.length = 0

	    if (currentMove.onLeave) {
	        currentMove.onLeave(pl, _ctx(pl, {
	            rawArgs: args,
	            prevent,
	            nextStatus: next
	        }));
	    }

	    // let i = 0
	    // const _track = currentMove.timeTrack ?? {}
	    // for (const time in _track) {
	    //     const handler = _track[time]

	    //     track[i++] = setTimeout(() => handler.call(undefined, pl, _ctx(pl)), Math.round(+time))
	    // }
	    // timeTracks.set(pl.xuid, track)

	    if (nextMove.onEnter) {
	        nextMove.onEnter(pl, _ctx(pl, {
	            rawArgs: args,
	            prevent,
	            previousStatus,
	            previousMoveState: +(status.duration > (currentMove.cast || 0))
	        }));
	    }
	}

	/**
	 * @param {TrickModule} mod 
	 * @param {PlayerStatus} _status 
	 * @returns {'none'|'cast'|'backswing'|'finish'}
	 */
	function checkMoveState(mod, _status) {
	    const { status, duration } = _status;
	    const move = mod.moves[status];

	    if (move.immediately) {
	        return 'none'
	    }

	    return duration <= (move.cast || 0) ? 'cast' :
	        duration <= (move.cast || 0) + (move.backswing || 0) ? 'backswing' : 'finish'
	}

	function clearStatus(pl, s, hand, hasBind) {
	    s.clear();
	    s.hand = hand;
	    if (!hasBind) {
	        playAnim(pl, 'animation.general.stand');
	    }
	}

	function listenPlayerItemChange(mods) {
	    const playerMainhanded = new Map();
	    const playerOffhanded = new Map();

	    function getMod(hand) {
	        return mods.get(hand) ?? mods.get('*')
	    }

	    em.on('onTick', () => {
	        mc.getOnlinePlayers().forEach(pl => {
	            const mainhand = pl.getHand().type;
	            const offhand = pl.getOffHand().type;
	            const previousMainhand = playerMainhanded.get(pl.xuid);
	            const previousOffhand = playerOffhanded.get(pl.xuid);

	            if (mainhand !== previousMainhand) {
	                em.emitNone('onChangeMainhand', pl, mainhand, previousMainhand);
	                playerMainhanded.set(pl.xuid, mainhand);
	            }

	            if (offhand !== previousOffhand) {
	                em.emitNone('onChangeOffhand', pl, offhand, previousOffhand);
	                playerOffhanded.set(pl.xuid, offhand);
	            }
	        });
	    });

	    em.on('onChangeMainhand', (pl, hand, old) => {
	        const status = Status.get(pl.xuid);
	        const oldBind = getMod(old);

	        releaseTarget(pl.xuid);

	        if (oldBind) {
	            const move = oldBind.moves[status.status];
	            if (move?.onLeave) {
	                move.onLeave(pl, _ctx(pl));
	            }
	        }
	        
	        const bind = getMod(hand);
	        clearStatus(pl, status, hand, bind);
	        if (!bind) {
	            return
	        }

	        initCombatComponent(pl, bind, status);
	    });
	}

	function listenAllCustomEvents(mods) {
	    function getMod(hand) {
	        return mods.get(hand) ?? mods.get('*')
	    }

	    em.on('onTick', onTick(em));
	    em.on('onTick', () => {
	        for (const [xuid, status] of Status.status.entries()) {
	            if (typeof xuid !== 'string') {
	                return
	            }
	            const pl = mc.getPlayer(xuid);
	            const bind = getMod(status.hand);

	            if (!pl || !bind) {
	                return
	            }

	            const attackTime = pl.quickEvalMolangScript('v.attack_time');
	            // pl.quickEvalMolangScript(`v.mov_mag = math.sqrt( math.pow( query.movement_direction(0), 2 ) + math.pow( query.movement_direction(2), 2));
	            // v.nmov_x = query.movement_direction(0) / v.mov_mag;
	            // v.nmov_z = query.movement_direction(2) / v.mov_mag;
	            // v.dr = v.nmov_x > 0 ? -math.acos(v.nmov_z) : math.acos(v.nmov_z);
	            // v.head_y_rot = query.head_y_rotation(this);
	            // t.rot = v.dr - v.head_y_rot;
	            // v.rot_to_facing = t.rot < 0 ? t.rot + 360 : t.rot;
	            // v.dir_to_facing = 1 <= 0 ? 0
	            //     : v.rot_to_facing < 45 ? 1
	            //     : v.rot_to_facing < 135 ? 2
	            //     : v.rot_to_facing < 225 ? 3
	            //     : v.rot_to_facing < 315 ? 4
	            //     : 1;
	            // `)
	            // console.log(pl.quickEvalMolangScript('math.mod(q.modified_distance_moved, 12) * 0.125'))

	            // console.log(pl.name, attackTime)
	            if (attackTime > 0 && attackTime < 0.3) {
	                es.put('onAttack', [pl, Function.prototype, [ pl ]]);
	            }
	        }
	    });
	    em.on('onTick', () => {
	        for (const [xuid, status] of Status.status.entries()) {
	            if (typeof xuid !== 'string') {
	                return
	            }
	            const pl = mc.getPlayer(xuid);
	            const bind = getMod(status.hand);

	            if (!bind) {
	                return
	            }

	            const currentMove = bind.moves[status.status];
	            const duration = status.duration++;

	            if (!currentMove) {
	                status.status = 'unknown';
	                return transition(pl, bind, status, '', Function.prototype, [ pl ])
	            }

	            if (currentMove.onTick) {
	                currentMove.onTick(
	                    pl,
	                    _ctx(pl),
	                    duration/((currentMove.cast || 0) + (currentMove.backswing || 0))
	                );
	            }

	            if (currentMove.timeline) {
	                const handler = currentMove.timeline[duration];
	                if (handler?.call) {
	                    handler.call(null, pl, _ctx(pl));
	                }
	            }

	            if (duration >= (currentMove.cast || 0) + (currentMove.backswing || 0)) {
	                if (currentMove.onLeave) {
	                    currentMove.onLeave(pl, _ctx(pl));
	                }
	                return transition(pl, bind, status, 'onEndOfLife', Function.prototype, [ pl ])
	            }

	            if (duration == currentMove.cast) {
	                if (currentMove.onAct) {
	                    currentMove.onAct(pl, _ctx(pl));
	                }
	                return
	            }
	        }
	    });

	    /**@type {DamageOption}*/
	    const defaultDamageOpt = {
	        damage: 0,
	        damageType: 'entityAttack',
	        permeable: false,
	        parryable: true,
	        knockback: 0.2,
	        shock: false,
	        powerful: false,
	        direction: 'left',
	        stiffness: 600,
	        trace: false,
	    };

	    em.on('attack', (abuser, victim, /**@type {DamageOption}*/ damageOpt) => {
	        damageOpt = Object.assign({}, defaultDamageOpt, damageOpt);
	        const {
	            damage,
	            damageType,
	            damagingProjectile,
	            permeable,
	            parryable,
	            knockback: _k,
	            shock,
	            powerful,
	            trace,
	        } = damageOpt;

	        let isPlayer;

	        if (victim.xuid) {
	            isPlayer = true;
	        }

	        if (!isPlayer && !victim.isPlayer()) {
	            return _damage(
	                victim,
	                damage,
	                damageType,
	                abuser,
	                damagingProjectile
	            )
	        }

	        const victimizedPlayer = isPlayer ? victim : victim.toPlayer();
	        const victimStatus = Status.get(victimizedPlayer.xuid);

	        const _knockback = (h, repulsible) => {
	            if (powerful || repulsible) {
	                const abuserPos = abuser.pos;
	                const victimPos = victim.pos;
	                knockback(victim, victimPos.x - abuserPos.x, victimPos.z - abuserPos.z, h, -2);
	                return
	            }

	            knockback(victim, 0, 0, 0, -2);
	        };
	        const doDamage = () => {
	            _knockback(_k, victimStatus.repulsible);

	            victimStatus.shocked = shock;
	            em.emitNone('hurt', abuser, victimizedPlayer, {
	                ...damageOpt,
	                damage: damage * 0.2, 
	                damageType: 'override',
	            });
	        };

	        if (!victimStatus) {
	            return doDamage()
	        }

	        if (victimStatus.isWaitingDeflection && !permeable && !powerful) {
	            return em.emitNone('deflect', abuser, victimizedPlayer, damageOpt)
	        }

	        if (victimStatus.isDodging && !trace) {
	            return em.emitNone('dodge', abuser, victimizedPlayer, damageOpt)
	        }

	        if (victimStatus.isWaitingParry && parryable) {
	            return em.emitNone('parried', abuser, victimizedPlayer, damageOpt)
	        }

	        if (victimStatus.isBlocking && !permeable) {
	            _knockback(_k * 0.4, victimStatus.repulsible);
	            return em.emitNone('block', abuser, victimizedPlayer, damageOpt)
	        }

	        doDamage();
	    });

	    em.on('deflect', (abuser, victim, damageOpt) => {
	        const aStatus = Status.get(abuser.xuid);
	        transition(
	            abuser,
	            getMod(aStatus.hand),
	            aStatus,
	            'onMissAttack',
	            Function.prototype,
	            [abuser, victim, damageOpt]
	        );

	        const vStatus = Status.get(victim.xuid);
	        transition(
	            victim,
	            getMod(vStatus.hand),
	            vStatus,
	            'onDeflection',
	            Function.prototype,
	            [victim, abuser, damageOpt]
	        );
	    });

	    em.on('dodge', (abuser, victim, damageOpt) => {
	        const aStatus = Status.get(abuser.xuid);
	        transition(
	            abuser,
	            getMod(aStatus.hand),
	            aStatus,
	            'onMissAttack',
	            Function.prototype,
	            [abuser, victim, damageOpt]
	        );

	        const vStatus = Status.get(victim.xuid);
	        transition(
	            victim,
	            getMod(vStatus.hand),
	            vStatus,
	            'onDodge',
	            Function.prototype,
	            [victim, abuser, damageOpt]
	        );
	    });

	    em.on('parried', (abuser, victim, damageOpt) => {
	        const aStatus = Status.get(abuser.xuid);
	        transition(
	            abuser,
	            getMod(aStatus.hand),
	            aStatus,
	            'onParried',
	            Function.prototype,
	            [abuser, victim, damageOpt]
	        );

	        const vStatus = Status.get(victim.xuid);
	        transition(
	            victim,
	            getMod(vStatus.hand),
	            vStatus,
	            'onParry',
	            Function.prototype,
	            [victim, abuser, damageOpt]
	        );
	    });

	    em.on('block', (abuser, victim, damageOpt) => {
	        transition(
	            abuser,
	            getMod(getHandedItemType(abuser)),
	            Status.get(abuser.xuid),
	            'onBlocked',
	            Function.prototype,
	            [abuser, victim, damageOpt]
	        );

	        transition(
	            victim,
	            getMod(getHandedItemType(victim)),
	            Status.get(victim.xuid),
	            'onBlock',
	            Function.prototype,
	            [victim, abuser, damageOpt]
	        );
	    });

	    em.on('hurt', (abuser, victim, damageOpt) => {
	        const {
	            damage, damageType, damagingProjectile
	        } = damageOpt;

	        if (!abuser.health) {
	            return
	        }

	        transition(
	            abuser,
	            getMod(getHandedItemType(abuser)),
	            Status.get(abuser.xuid),
	            'onHit',
	            Function.prototype,
	            [abuser, victim, damageOpt]
	        );

	        let flag = true,
	            prevent = () => flag = false;

	        const victimStatus = Status.get(victim.xuid);

	        transition(
	            victim,
	            getMod(getHandedItemType(victim)),
	            victimStatus,
	            'onHurt',
	            prevent,
	            [victim, abuser, damageOpt]
	        );

	        if (victimStatus.hegemony && damageOpt.powerful) {
	            transition(
	                victim,
	                getMod(getHandedItemType(victim)),
	                victimStatus,
	                'onInterrupted',
	                prevent,
	                [victim, abuser, damageOpt]
	            );
	        }

	        if (flag) {
	            _damage(victim, damage, damageType, abuser, damagingProjectile);
	        }
	    });

	    em.on('onHurtByEntity', (victim, abuser, damageOpt, prevent) => {
	        transition(
	            victim,
	            getMod(getHandedItemType(victim)),
	            Status.get(victim.xuid),
	            'onHurtByMob',
	            prevent,
	            [ victim, abuser, damageOpt ]
	        );
	    });

	    em.on('knockdown', (abuser, victim, knockbackStrength, time=30) => {
	        const aStatus = Status.get(abuser.xuid);
	        const aMod = getMod(aStatus.hand);

	        const vStatus = Status.get(victim.xuid);
	        const vMod = getMod(vStatus.hand);

	        if (vStatus && !vStatus.repulsible) {
	            return
	        }

	        if (aStatus && aMod) {
	            transition(abuser, aMod, aStatus, 'onKnockdownOther', Function.prototype, [ abuser, victim, time ]);
	        }

	        if (vStatus && vMod) {
	            const aPos = abuser.pos;
	            const vPos = victim.pos;

	            transition(victim, vMod, vStatus, 'onKnockdown', Function.prototype, [ victim, abuser, time ]);            
	            knockback(victim, vPos.x - aPos.x, vPos.z - aPos.z, knockbackStrength, 0);
	        }
	    });

	    em.on('onReleaseLock', (pl, hand) => {
	        const bind = getMod(hand);
	        const status = Status.get(pl.xuid);

	        if (!bind || !status) {
	            return
	        }

	        pl.quickEvalMolangScript('v.posture = 0;');

	        transition(pl, bind, status, 'onReleaseLock', Function.prototype, [ pl ]);
	    });

	    em.on('onLock', (pl, hand, target) => {
	        const bind = getMod(hand);
	        const status = Status.get(pl.xuid);

	        if (!bind || !status) {
	            return
	        }

	        pl.quickEvalMolangScript('v.posture = 1;');

	        transition(pl, bind, status, 'onLock', Function.prototype, [ pl, target ]);
	    });

	    em.on('onFeint', (pl, hand, prevent) => {
	        const bind = getMod(hand);
	        const status = Status.get(pl.xuid);

	        if (!bind || !status) {
	            return
	        }

	        transition(pl, bind, status, 'onFeint', prevent, [ pl ]);
	    });

	    em.on('trap', (pl, data) => {
	        const status = Status.get(pl.xuid);
	        const bind = getMod(status.hand);

	        if (!bind || !status) {
	            return
	        }

	        transition(pl, bind, status, 'onTrap', Function.prototype, [ pl, data ]);
	    });
	}

	function listenAllMcEvents(collection) {
	    const mods = new Map();

	    function getMod(hand) {
	        return mods.get(hand) ?? mods.get('*')
	    }

	    collection.forEach(mod => {
	        const binding = mod.bind;
	        const bind = !Array.isArray(binding)
	            ? [ binding ]
	            : binding;

	        bind.forEach(itemType => {
	            mods.set(itemType, mod);
	        });
	    });

	    listenPlayerItemChange(mods);
	    
	    es.addFilter(({ type, args }) => {
	        if (!defaultAcceptableInputs.includes(type)) {
	            return true
	        }

	        const status = Status.get(args[0].xuid);
	        const inputable = status.acceptableInput(type);

	        if (inputable) {
	            status.setPreInput(type);
	        }

	        return inputable
	    });

	    const acceptableStreamHandler = n =>
	        (pl, prevent, args) => {
	            const status = watchMainhandChange(pl);
	        
	            if (!mods.has(status.hand)) {
	                return
	            }

	            transition(pl, getMod(status.hand), status, n, prevent, args);
	        };

	    playerEvents.forEach(n => {
	        mc.listen(n, (...args) => {
	            let cancelEvent = false,
	            prevent = () => cancelEvent = true;
	            
	            let pl = args[0];
	            es.put(n, [pl, prevent, args]);

	            return !cancelEvent
	        });

	        em.on(n, acceptableStreamHandler(n));
	    });

	    em.on('onAttack', acceptableStreamHandler('onAttack'));

	    mobEvents.forEach(n => {
	        mc.listen(n, (...args) => {
	            let cancelEvent = false,
	                prevent = () => cancelEvent = true;
	            
	            let pl = args[0];

	            if (mobEvents.includes(n)) {
	                if (!pl.isPlayer()) {
	                    return true
	                }

	                pl = pl.toPlayer();
	            }

	            const status = watchMainhandChange(pl);
	            
	            if (!mods.has(status.hand)) {
	                return
	            }

	            transition(pl, getMod(status.hand), status, n, prevent, args);

	            return !cancelEvent
	        });
	    });

	    mc.listen('onDropItem', (pl, item) => {
	        if (mods.has(item.type)) {
	            Status.get(pl.xuid)?.disableInputs([
	                'onAttack'
	            ]);

	            setTimeout(() => {
	                Status.get(pl.xuid)?.enableInputs([
	                    'onAttack'
	                ]);
	            }, 300);

	            if (pl.isSneaking) {
	                return true
	            }

	            const val = toggleLock(pl.xuid);

	            if (val !== false) {
	                em.emitNone(
	                    val === null ? 'onReleaseLock' : 'onLock',
	                    pl, item.type, val
	                );
	            }
	            
	            return false
	        }
	    });

	    mc.listen('onOpenContainer', pl => {
	        // console.log(pl)
	    });

	    mc.listen('onOpenContainerScreen', pl => {
	        if (hasLock(pl)) {
	            let cancel = true;
	            es.put('onFeint', [ pl, Function.prototype, [ pl ] ]);

	            return !cancel
	        }
	    });

	    /**@type {EntityDamageCause[]}*/
	    const causeList = [
	        'override', 'contact', 'entityAttack', 'projectile', 'suffocation', 'fall', 'fire',
	        'fireTick', 'lava', 'drowning', 'blockExplosion', 'entityExplosion', 'void', 'suicide',
	        'magic', 'wither', 'starve', 'anvil', 'thorns', 'fallingBlock', 'piston', 'flyIntoWall',
	        'magma', 'fireworks', 'lightning', 'charging', 'temperature', 'freezing', 'stalactite',
	        'stalagmite'
	    ];

	    causeList[-1] = 'none';

	    mc.listen('onMobHurt', (victim, abuser, damage, cause) => {
	        const damageType = causeList[cause];

	        if (damageType === 'override') {
	            return true
	        }

	        let flag = true,
	            prevent = () => {
	                flag = false;
	            };
	        
	        const damageOpt = {
	            damage,
	            damageType
	        };

	        if (!victim.isPlayer()) {
	            return true
	        }

	        victim = victim.toPlayer();

	        if (!abuser) {
	            return true
	        }

	        if (!abuser.isPlayer()) {
	            em.emitNone('onHurtByEntity', victim, abuser, damageOpt, prevent);
	            return flag
	        }

	        return false
	    });

	    mc.listen('onAttackEntity', pl => {
	        es.put('onAttack', [pl, Function.prototype, [ pl ]]);
	        return false
	    });

	    mc.listen('onTick', () => em.emitNone('onTick'));

	    mc.listen('onRespawn', pl => {
	        setTimeout(() => {
	            unfreeze(pl);
	            clearCamera(pl);
	            initCombatComponent(pl, getMod(getHandedItemType(pl)), Status.get(pl.xuid));
	        }, 300);
	    });

	    mc.listen('onLeft', pl => {
	        Status.status.delete(pl.xuid);
	    });

	    mc.listen('onPlayerDie', pl => {
	        releaseTarget(pl.xuid);
	    });

	    listenAllCustomEvents(mods);
	}

	function getHandedItemType(pl) {
	    return pl.getHand().type
	}

	core = {
	    emitter: em, listenAllMcEvents, 
	};
	return core;
}

var loader;
var hasRequiredLoader;

function requireLoader () {
	if (hasRequiredLoader) return loader;
	hasRequiredLoader = 1;
	/// <reference path="./types.d.ts"/>

	const collection = requireCollection();
	const console = requireMain();
	const { checkCompleteness } = requireCompleteness();
	const {
	    listenAllMcEvents
	} = requireCore();

	loader = function loadAll() {
	    const mods = Array.from(collection);

	    listenAllMcEvents(collection);
	    mods.forEach(mod => loadModule(mod));
	};

	/**
	 * @param {TrickModule} mod 
	 */
	function loadModule(mod) {
	    let errMessage;
	    if (errMessage = checkCompleteness(mod)) {
	        console.error(`${("'" + mod.sid + "'") || '一个'} 模块加载失败${errMessage ? ': ' + errMessage : ''}`);
	        return false
	    }

	    

	}
	return loader;
}

var init;
var hasRequiredInit;

function requireInit () {
	if (hasRequiredInit) return init;
	hasRequiredInit = 1;
	const loader = requireLoader();

	init = {
	    setup() {
	        try {
	            loader();
	        } catch (error) {
	            log(error + '');
	        }
	    }
	};
	return init;
}

const { load } = loadModule;

mc.listen('onServerStarted',() => [
    requireSetup(),
    requireInit(),
].forEach(m => load(m)));

module.exports = meisterhau;
