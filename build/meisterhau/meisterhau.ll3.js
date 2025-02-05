'use strict';

var require$$0$1 = require('http');

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function getAugmentedNamespace(n) {
  if (n.__esModule) return n;
  var f = n.default;
	if (typeof f == "function") {
		var a = function a () {
			if (this instanceof a) {
        return Reflect.construct(f, arguments, this.constructor);
			}
			return f.apply(this, arguments);
		};
		a.prototype = f.prototype;
  } else a = {};
  Object.defineProperty(a, '__esModule', {value: true});
	Object.keys(n).forEach(function (k) {
		var d = Object.getOwnPropertyDescriptor(n, k);
		Object.defineProperty(a, k, d.get ? d : {
			enumerable: true,
			get: function () {
				return n[k];
			}
		});
	});
	return a;
}

var meisterhau = {};

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

function load$1(m) {
    if (typeof m === 'function') {
        return m()
    }

    for (const k of loadEntries) {
        if (typeof m[k] === 'function') {
            return m[k]()
        }
    }
}

var loadModule$1 = {
    load: load$1
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
};
const matchers = {
    required: /^<([\w:]+)>$/,
    optional: /^\[([\w:]+)\]$/,
};
function tk(index, type, id, isOptional = true) {
    return {
        index, type, id, isOptional
    };
}
function parseCmdStr(str) {
    const frags = str.trim().split(/ +/);
    const tokens = [];
    frags.forEach((frag, i) => {
        let res, isOptional = -1;
        if (res = matchers.required.exec(frag)) {
            isOptional = 0;
        }
        else if (res = matchers.optional.exec(frag)) {
            isOptional = 1;
        }
        if (isOptional !== -1) {
            const data = res[1];
            const typeDef = data.split(':');
            tokens.push(tk(i, typeDef[1], typeDef[0], !!isOptional));
            return;
        }
        tokens.push(tk(i, 'enum', frag, false));
    });
    return tokens;
}
function parseCmdArr(arr) {
    const tokens = [];
    arr.forEach((el, i) => {
        const [id, typeDesc] = Object.entries(el)[0];
        let isOptional = false, type = typeDesc;
        if (typeDesc.startsWith('?')) {
            isOptional = true;
            type = typeDesc.slice(1);
        }
        tokens.push(tk(i, type, id, isOptional));
    });
    return tokens;
}
class Registry {
    _cmd;
    _tokenListCollection = new Set();
    _handlerCollection = [];
    constructor(cmd) {
        this._cmd = cmd;
    }
    getCollection(len) {
        return this._handlerCollection[len] ?? (this._handlerCollection[len] = []);
    }
    register(cmd, handler) {
        if (!cmd || !handler) {
            return this;
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
            return pre.concat(cur);
        }, []);
        this.getCollection(len)
            .push([finalList.map(l => l.id), handler]);
        return this;
    }
    sameArr(arr1, arr2) {
        if (arr1.length !== arr2.length) {
            return false;
        }
        return new Set(arr1.concat(arr2)).size === arr1.length;
    }
    setCallback() {
        this._cmd.setCallback((cmd, origin, out, args) => {
            const argv = Object
                .keys(args)
                .filter(v => args[v]);
            const pairs = this._handlerCollection[argv.length];
            const [_, handler] = pairs.find(([ids]) => this.sameArr(argv, ids)) || [, Function.prototype];
            handler.call(undefined, cmd, origin, out, args);
        });
    }
    registeredArgs = new Set();
    static enumIndex = 0;
    createArg(name, type, isOptional) {
        let argId = name;
        if (this.registeredArgs.has(name)) {
            return;
        }
        let enumId = null;
        if (type === 'enum') {
            enumId = `enum_${Registry.enumIndex++}`;
            this._cmd.setEnum(enumId, [name]);
            argId = enumId;
        }
        let extArgs = enumId ? [enumId, enumId, 1] : [];
        isOptional
            ? this._cmd.optional(name, stringParamTypeMap[type], ...extArgs)
            : this._cmd.mandatory(name, stringParamTypeMap[type], ...extArgs);
        this.registeredArgs.add(name);
        return argId;
    }
    _submitted = false;
    submit() {
        this._tokenListCollection.forEach(tokens => {
            let ids = [];
            for (const { id, type, isOptional } of tokens) {
                this.createArg(id, type, isOptional);
                ids.push(id);
            }
            this._cmd.overload(ids);
        });
        this.setCallback();
        this._cmd.setup();
        this._submitted = true;
    }
    isSubmitted() {
        return this._submitted;
    }
}
var CommandPermission;
(function (CommandPermission) {
    CommandPermission[CommandPermission["Everyone"] = 0] = "Everyone";
    CommandPermission[CommandPermission["OP"] = 1] = "OP";
    CommandPermission[CommandPermission["Console"] = 2] = "Console";
})(CommandPermission || (CommandPermission = {}));
function cmd(head, desc, perm = CommandPermission.OP) {
    const command = mc.newCommand(head, desc, perm);
    const registry = new Registry(command);
    const register = (...args) => { registry.register.apply(registry, args); };
    return {
        setup: (executor) => {
            executor.call(undefined, register, registry);
            if (!registry.isSubmitted()) {
                registry.submit();
            }
        },
        getRegistry: () => registry,
    };
}

var command = /*#__PURE__*/Object.freeze({
	__proto__: null,
	get CommandPermission () { return CommandPermission; },
	Registry: Registry,
	cmd: cmd
});

var require$$1$1 = /*@__PURE__*/getAugmentedNamespace(command);

var server;
var hasRequiredServer;

function requireServer () {
	if (hasRequiredServer) return server;
	hasRequiredServer = 1;
	const http = require$$0$1;
	/**@type {Map<string, {jump: boolean, sneak: boolean, x: number, y: number}>} */
	const inputStates = new Map();

	function syncInput(name, [ jump, sneak, x, y ]) {
	    inputStates.set(name, { jump, sneak, x, y });
	}

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

	function setupNodeHttpServer(list, em) {
	    return http.createServer((req, res) => {
	        if (req.url.startsWith('/sync')) {
	            const playerName = req.url.slice(6);
	            let buf = Buffer.alloc(0);
	            req.on('data', chunk => buf = Buffer.concat([buf, chunk]));
	            req.on('end', () => {
	                syncInput(playerName, JSON.parse(buf));
	                res.end();
	            });
	        }

	        if (req.url !== '/rpc') {
	            res.writeHead(404);
	            res.end();
	            return
	        }

	        let buf = Buffer.alloc(0);
	        req.on('data', chunk => buf = Buffer.concat([buf, chunk]));
	        req.on('end', () => {
	            const rpcMessages = JSON.parse(buf.toString());

	            rpcMessages.forEach(msg => {
	                if (msg.type === 'call') {
	                    handleCall(msg, em);
	                } else if (msg.type ==='return') {
	                    handleReturn(msg, em);
	                }
	            });

	            res.writeHead(200, { 'Content-Type': 'application/json' });
	            res.end(JSON.stringify(list.splice(0, list.length)));
	        });
	    })
	    .listen(19999)
	}

	server = {
	    createServer: setup, setupNodeHttpServer, inputStates
	};
	return server;
}

var setup_1;
var hasRequiredSetup;

function requireSetup () {
	if (hasRequiredSetup) return setup_1;
	hasRequiredSetup = 1;
	const { EventEmitter } = requireEvents();
	const { cmd } = require$$1$1;
	const { setupNodeHttpServer } = requireServer();

	const em = new EventEmitter();
	const rpcChannel = [];
	const remoteFuncs = new Map();
	const server = setupNodeHttpServer(rpcChannel, em);

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
	    cmd('func', '函数', 1).setup(register => {
	        register('<name:string> <args:string>', async (cmd, origin, output, res) => {
	            const pl = origin.player;
	            remoteCall(res.name, ...res.args.split(' '))
	                .then(v => pl.tell(v.toString()))
	                .catch(e => pl.tell(e.toString()));
	        });
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

var double_dagger = {};

function playAnim$6(pl, anim, nextAnim, time, stopExp, controller) {
    mc.runcmdEx(`/playanimation "${pl.name}" ` + [anim, nextAnim, time, stopExp, controller].filter(x => x).join(' '));
}
function playSound(pl, sound, pos, volume, pitch, minVolume) {
    mc.runcmdEx(`/playsound ${sound} ${pl.name} ` + [
        pos.x, pos.y, pos.z, volume, pitch, minVolume
    ].join(' '));
}
function playSoundAll$5(sound, pos, volume, pitch, minVolume) {
    mc.runcmdEx(`/playsound ${sound} @a ` + [
        pos.x, pos.y, pos.z, volume, pitch, minVolume
    ].join(' '));
}
function playParticle$1(particle, pos) {
    mc.runcmdEx(`/particle ${particle} ` + [
        pos.x, pos.y, pos.z
    ].join(' '));
}
function movable() {
}
const DEFAULT_SPEED$2 = 0.1;
const DEFAULT_POSTURE_SPEED$3 = 0.04;

var basic = /*#__PURE__*/Object.freeze({
	__proto__: null,
	DEFAULT_POSTURE_SPEED: DEFAULT_POSTURE_SPEED$3,
	DEFAULT_SPEED: DEFAULT_SPEED$2,
	movable: movable,
	playAnim: playAnim$6,
	playParticle: playParticle$1,
	playSound: playSound,
	playSoundAll: playSoundAll$5
});

var require$$2$2 = /*@__PURE__*/getAugmentedNamespace(basic);

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol */


function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

let Optional$1 = class Optional {
    value;
    static none() {
        return new Optional(null);
    }
    static some(value) {
        return new Optional(value);
    }
    constructor(value) {
        this.value = value;
    }
    unwrap() {
        if (!this.isEmpty()) {
            return this.value;
        }
        throw new Error('Optional is empty');
    }
    isEmpty() {
        return this.value === undefined || this.value === null;
    }
    orElse(other) {
        return this.value ?? other;
    }
    use(fn, self) {
        if (!this.isEmpty()) {
            fn.call(self, this.value);
            return true;
        }
        return false;
    }
};

var optional = /*#__PURE__*/Object.freeze({
	__proto__: null,
	Optional: Optional$1
});

const REFLECT_MANAGER = Symbol('reflect-manager');
const REFLECT_ENTITY = Symbol('reflect-entity');
class CustomComponent {
    [REFLECT_MANAGER];
    [REFLECT_ENTITY] = Optional$1.none();
    onTick(manager, en) { }
    detach(manager) {
        const ctor = Object.getPrototypeOf(this).constructor;
        return manager.detachComponent(ctor);
    }
    getManager() {
        return this[REFLECT_MANAGER];
    }
    getEntity() {
        return this[REFLECT_ENTITY];
    }
}
class BaseComponent extends CustomComponent {
    onAttach(manager) { }
    onDetach(manager) { }
}
class ComponentManager {
    static profilerEnable = false;
    static global = new ComponentManager();
    #components = new Map();
    #prependTicks = [];
    #nextTicks = [];
    getComponent(ctor) {
        return Optional$1.some(this.#components.get(ctor));
    }
    getComponents(...ctor) {
        return ctor.map(c => this.#components.get(c));
    }
    async #attachComponent(ctor, component, shouldRebuild = true) {
        let init = !this.#components.get(ctor);
        if (!init && shouldRebuild) {
            await this.detachComponent(ctor);
            init = true;
        }
        if (REQUIRED_COMPONENTS in component) {
            //@ts-ignore
            for (const [ctor, comp] of component[REQUIRED_COMPONENTS]) {
                this.#attachComponent(ctor, comp, false);
            }
        }
        if (init && 'onAttach' in component) {
            await component.onAttach(this);
        }
        this.#components.set(ctor, component);
        return Optional$1.some(component);
    }
    async attachComponent(...component) {
        const components = [];
        for (const obj of component) {
            components.push(await this.#attachComponent(Object.getPrototypeOf(obj).constructor, obj));
        }
        return components;
    }
    async getOrCreate(ctor, ...args) {
        let component = this.#components.get(ctor);
        if (component) {
            return Optional$1.some(component);
        }
        return this.#attachComponent(ctor, new ctor(...args));
    }
    async detachComponent(ctor) {
        const component = this.#components.get(ctor);
        if (component && 'onDetach' in component) {
            await component.onDetach(this);
        }
        return this.#components.delete(ctor);
    }
    clear() {
        this.#components.clear();
    }
    getComponentKeys() {
        return this.#components.keys();
    }
    has(ctor) {
        return this.#components.has(ctor);
    }
    afterTick(fn) {
        this.#nextTicks.push(fn);
    }
    beforeTick(fn) {
        this.#prependTicks.unshift(fn);
    }
    handleTicks(en) {
        for (const prependTick of this.#prependTicks) {
            this.profiler(() => prependTick.call(null, Optional$1.some(en)));
            // prependTick.call(null, Optional.some(en))
        }
        this.#prependTicks.length = 0;
        for (const component of this.#components.values()) {
            //@ts-ignore
            if (!component[REFLECT_ENTITY]) {
                //@ts-ignore
                component[REFLECT_ENTITY] = Optional$1.some(en);
            }
            //@ts-ignore
            if (!component[REFLECT_MANAGER]) {
                //@ts-ignore
                component[REFLECT_MANAGER] = this;
            }
            const { onTick } = component;
            if (onTick) {
                this.profiler(() => onTick.call(component, this, Optional$1.some(en)), component);
                // onTick.call(component, this, Optional.some(en))
            }
        }
        for (const afterTick of this.#nextTicks) {
            this.profiler(() => afterTick.call(null, Optional$1.some(en)));
            // afterTick.call(null, Optional.some(en))
        }
        this.#nextTicks.length = 0;
    }
    update(ctor, fn) {
        const component = this.#components.get(ctor);
        if (component) {
            fn(component);
            return true;
        }
        return false;
    }
    profiler(fn, component, name) {
        {
            return fn();
        }
    }
}
const REQUIRED_COMPONENTS = Symbol('REQUIRED_COMPONENTS');
function RequireComponents(...params) {
    return class CRequiredComponent extends BaseComponent {
        [REQUIRED_COMPONENTS] = new Map();
        constructor() {
            super();
            for (const param of params) {
                if (Array.isArray(param)) {
                    const [Ctor, ...args] = param;
                    this[REQUIRED_COMPONENTS].set(Ctor, Reflect.construct(Ctor, args));
                    continue;
                }
                this[REQUIRED_COMPONENTS].set(param, Reflect.construct(param, []));
            }
        }
        getComponent(ctor) {
            return this[REQUIRED_COMPONENTS].get(ctor);
        }
    };
}

const publicComponentRegistry = new Map();
const componentIdMapping = new WeakMap();
const getComponentCtor = (id) => {
    return publicComponentRegistry.get(id);
};
const getComponentId = (t) => {
    return componentIdMapping.get(t);
};
const PublicComponent = name => target => {
    publicComponentRegistry.set(name, target);
    componentIdMapping.set(target, name);
};
const fieldKeys = new Map();
const Fields = (muts, lets = []) => target => {
    //@ts-ignore
    fieldKeys.set(target, { muts, lets });
};
function getFieldEntries(t) {
    const keys = fieldKeys.get(Object.getPrototypeOf(t).constructor);
    if (!keys) {
        return null;
    }
    return {
        muts: keys.muts.map(k => [k, t[k]]),
        lets: keys.lets.map(k => [k, t[k]]),
    };
}

let CameraComponent$1 = class CameraComponent extends BaseComponent {
    /**
     * [ x, y, z ]
     */
    static defaultOffset = [2.5, 0, 0.8];
    /**
     * [ yaw, pitch ]
     */
    static defaultRot = [0, 0];
    /**
     * [ x, y, z, yaw, pitch ]
     */
    static defaultStatus = this.defaultOffset.concat(this.defaultRot);
    offset = CameraComponent.defaultOffset.slice();
    rot = [0, 0];
};

var camera$3 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	CameraComponent: CameraComponent$1
});

function constrictCalc$1(start, end, calcFn) {
    try {
        return minmax(start, end, calcFn.call(null));
    }
    catch {
        return start;
    }
}
function minmax(min, max, val) {
    if (isNaN(val)) {
        return min;
    }
    return Math.max(min, Math.min(max, val));
}
function randomRange$1(min = 0, max = 1, integer = false) {
    const num = Math.random() * (max - min) + min;
    return integer ? Math.round(num) : num;
}
const lerpn = (from, to, progress) => {
    if (from.length !== to.length) {
        return from;
    }
    const len = from.length;
    const res = new Array(len).fill(0);
    const p = Math.min(Math.max(0, progress), 1);
    for (let i = 0; i < len; i++) {
        res[i] = from[i] + (to[i] - from[i]) * p;
    }
    return res;
};
const alerpn = (from, to, progress) => {
    if (from.length !== to.length) {
        return from;
    }
    const len = from.length;
    const res = new Array(from.length).fill(0);
    const p = Math.min(Math.max(0, progress), 1);
    for (let i = 0; i < len; i++) {
        const d = (to[i] - from[i]) % 360;
        res[i] = from[i] + d * p;
    }
    return res;
};

var math = /*#__PURE__*/Object.freeze({
	__proto__: null,
	alerpn: alerpn,
	constrictCalc: constrictCalc$1,
	lerpn: lerpn,
	minmax: minmax,
	randomRange: randomRange$1
});

let Timer = class Timer extends BaseComponent {
    duration;
    rest;
    get done() {
        return this.rest <= 0;
    }
    constructor(duration = 0) {
        super();
        this.duration = duration;
        this.rest = this.duration;
    }
    onTick() {
        this.rest--;
    }
    reset() {
        this.rest = this.duration;
    }
};
Timer = __decorate([
    PublicComponent('timer'),
    Fields(['rest'], ['duration', 'done'])
], Timer);

let Stamina$1 = class Stamina extends CustomComponent {
    $stamina;
    maxStamina;
    restorePerTick;
    restoreCooldown;
    cooldown = Optional$1.none();
    prevStamina;
    get stamina() {
        return this.$stamina;
    }
    set stamina(v) {
        this.$stamina = minmax(0, this.maxStamina, v);
    }
    constructor($stamina = 100, maxStamina = 100, restorePerTick = 1.6, restoreCooldown = 20) {
        super();
        this.$stamina = $stamina;
        this.maxStamina = maxStamina;
        this.restorePerTick = restorePerTick;
        this.restoreCooldown = restoreCooldown;
        this.prevStamina = this.stamina;
    }
    async resetRestore(manager) {
        this.cooldown = await manager.getOrCreate(Timer, this.restoreCooldown);
        const cooldown = this.cooldown.unwrap();
        cooldown.rest = this.restoreCooldown;
        this.prevStamina = this.stamina;
    }
    setCooldown(cooldown) {
        if (this.cooldown.isEmpty()) {
            return;
        }
        this.cooldown.unwrap().rest = cooldown;
    }
    onTick(manager) {
        if (this.prevStamina > this.stamina) {
            this.resetRestore(manager);
            return;
        }
        if (this.cooldown.isEmpty() || this.cooldown.unwrap().done) {
            this.stamina = constrictCalc$1(0, this.maxStamina, () => this.stamina + this.restorePerTick);
        }
        this.prevStamina = this.stamina;
    }
};
Stamina$1 = __decorate([
    PublicComponent('stamina'),
    Fields(['stamina', 'maxStamina', 'restorePerTick', 'restoreCooldown'])
], Stamina$1);

var stamina = /*#__PURE__*/Object.freeze({
	__proto__: null,
	get Stamina () { return Stamina$1; }
});

const defaultAcceptableInputs$1 = [
    'onJump', 'onSneak', 'onAttack', 'onUseItem',
    'onChangeSprinting', 'onFeint'
];
let Status$3 = class Status {
    uniqueId;
    static status = new Map();
    static get(uniqueId) {
        return this.status.get(uniqueId) || new Status(uniqueId);
    }
    static global = this.get('global_status');
    /**
     * 手上物品的type
     */
    hand = 'minecraft:air';
    /**
     * moves中当前move的名称
     */
    status = 'unknown';
    /**
     * 动作已持续时间
     */
    duration = 0;
    /**
     * 玩家预输入
     */
    preInput = null;
    /**
     * 是否可被击退
     */
    repulsible = true;
    /**
     * 玩家的精力(不是饱和度也不是生命值)
     */
    stamina = 0;
    /**
     * 玩家的硬直
     */
    stiffness = 0;
    /**
     * 是否受到冲击
     * 受到冲击的对象在碰到墙体时会造成短暂眩晕
     */
    shocked = false;
    /**
     * 是否霸体状态
     */
    hegemony = false;
    #preInputTimer = null;
    /**
     * 处于防御状态
     */
    isBlocking = false;
    /**
     * 处于招架等待状态
     */
    isWaitingParry = false;
    /**
     * 处于偏斜等待状态
     */
    isWaitingDeflection = false;
    /**
     * 处于闪避状态
     */
    isDodging = false;
    /**
     * 玩家接受的事件输入
     */
    acceptableInputs = new Set(defaultAcceptableInputs$1);
    static defaultCameraOffsets = [2.2, 0, 0.7];
    cameraOffsets = Status.defaultCameraOffsets;
    /**
     * 组件管理器
     */
    componentManager = new ComponentManager();
    constructor(uniqueId) {
        this.uniqueId = uniqueId;
        Status.status.set(uniqueId, this);
        this.reset();
    }
    reset() {
        this.hand = 'minecraft:air';
        this.status = 'unknown';
        this.duration = 0;
        this.repulsible = true;
        this.isBlocking = false;
        this.isWaitingParry = false;
        this.stamina = 0;
        this.stiffness = 0;
        defaultAcceptableInputs$1.forEach(type => this.acceptableInputs.add(type));
        this.componentManager.attachComponent(new Stamina$1(0));
        if (mc.getPlayer(this.uniqueId)) {
            this.componentManager.attachComponent(new CameraComponent$1());
        }
    }
    acceptableInput(name, accept) {
        if (accept !== undefined) {
            accept
                ? this.acceptableInputs.add(name)
                : this.acceptableInputs.delete(name);
            return;
        }
        return this.acceptableInputs.has(name);
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
};

var status = /*#__PURE__*/Object.freeze({
	__proto__: null,
	Status: Status$3,
	defaultAcceptableInputs: defaultAcceptableInputs$1
});

let Tick$1 = class Tick extends CustomComponent {
    static tick = 0;
};

var tick = /*#__PURE__*/Object.freeze({
	__proto__: null,
	Tick: Tick$1
});



//@ts-ignore
/*;
const 
    if (cond) {
        return;
    }
    => {
    //#inline 
    if (cond) {
        return;
    }
        if (cond) {
        return;
    }
    //!inline
};
//@ts-ignore
*/;

var CameraFading_1;
let CameraFading$1 = CameraFading_1 = class CameraFading extends BaseComponent {
    config;
    tickOffset = 0;
    finished = false;
    last;
    constructor(config = []) {
        super();
        this.config = config;
        const lastTo = config[config.length - 1].to;
        this.config = config;
        this.last = ['linear', lastTo, lastTo, 1];
    }
    static create({ config }) {
        return new CameraFading_1(config);
    }
    dt() {
        return Tick$1.tick - this.tickOffset;
    }
    onAttach() {
        this.tickOffset = Tick$1.tick;
    }
    copy(from, to) {
        const len = Math.min(from.length, to.length);
        for (let i = 0; i < len; i++) {
            to[i] = from[i];
        }
    }
    getTransInfo() {
        const len = this.config.length;
        let remain = this.dt();
        for (let i = 0; i < len; i++) {
            const { duration, curve, from, to } = this.config[i];
            if (remain >= duration) {
                remain -= duration;
                continue;
            }
            if (remain < duration) {
                return [
                    curve ?? 'linear',
                    from ?? this.config[i - 1].to,
                    to,
                    remain / duration,
                ];
            }
        }
        return this.last;
    }
    onTick(manager) {
        const { offset, rot } = manager.getComponent(CameraComponent$1).unwrap();
        const info = this.getTransInfo();
        const [curve, from, to, progress] = info;
        
    if (this.finished) {
        return;
    }
    
        switch (curve) {
            case 'linear':
                this.offsetLinear(from, to, progress, offset, rot);
        }
        if (this.last === info) {
            this.finished = true;
        }
    }
    offsetLinear(from, to, progress, target, rotation) {
        const offset = lerpn(from.slice(0, 3), to.slice(0, 3), progress);
        const rot = alerpn(from.slice(3, 5), to.slice(3, 5), progress);
        this.copy(offset, target);
        this.copy(rot, rotation);
    }
    static fadeFromAttackDirection(abuser, damageOpt) {
        const { direction } = damageOpt;
        let to = null;
        switch (direction) {
            case 'right':
                to = [...CameraComponent$1.defaultOffset, -15, 0];
                break;
            case 'left':
                to = [...CameraComponent$1.defaultOffset, 15, 0];
                break;
            case 'vertical':
                to = [...CameraComponent$1.defaultOffset, 0, -15];
                break;
            default:
                to = [1.5, 0, 0.5, 0, 0];
                break;
        }
        const manager = Status$3.get(abuser.uniqueId).componentManager;
        manager.beforeTick(() => {
            manager.attachComponent(new CameraFading_1([
                {
                    from: CameraComponent$1.defaultStatus,
                    to,
                    duration: 1
                },
                {
                    to: CameraComponent$1.defaultStatus,
                    duration: 1
                }
            ]));
        });
    }
};
CameraFading$1 = CameraFading_1 = __decorate([
    PublicComponent('camera-fading'),
    Fields(['config'])
], CameraFading$1);

var cameraFading = /*#__PURE__*/Object.freeze({
	__proto__: null,
	get CameraFading () { return CameraFading$1; }
});

function getApproximatelyDir(direction) {
    return direction === 'right' ? 'right'
        : direction === 'middle' ? 'right'
            : 'left';
}
function getAnim(animCategory, direction) {
    const anim = animCategory[direction];
    if (!anim) {
        switch (direction) {
            case 'middle':
                return animCategory.right ?? animCategory.left;
            default:
                return animCategory.left;
        }
    }
    return anim;
}
class ParryDirection extends CustomComponent {
    direction;
    constructor(direction = 'left') {
        super();
        this.direction = direction;
    }
}
let DefaultMoves$4 = class DefaultMoves {
    animations = {
        parried: {
            /**
             * left and vertical
             */
            left: 'animation.general.parried.left',
            vertical: 'animation.general.parried.left',
            /**
             * right and stab
             */
            right: 'animation.general.parried.right',
            middle: 'animation.general.parried.right',
        },
        hit: {
            left: 'animation.general.hit.left',
            right: 'animation.general.hit.right',
            vertical: 'animation.general.hit.vertical',
            middle: 'animation.general.hit.middle',
        },
        parry: {
            /**
             * left and vertical
             */
            left: '',
            vertical: '',
            /**
             * right and stab
             */
            right: '',
            middle: '',
        },
        knockdown: 'animation.general.fell',
        blocked: {
            /**
             * left and vertical
             */
            left: 'animation.general.blocked.left',
            vertical: 'animation.general.blocked.left',
            /**
             * right and stab
             */
            right: 'animation.general.blocked.right',
            middle: 'animation.general.blocked.right',
        },
        block: {
            /**
             * left and vertical
             */
            left: '',
            vertical: '',
            /**
             * right and stab
             */
            right: '',
            middle: '',
        },
        execution: {
            cutHead: 'animation.general.execution.cut_head',
        },
        executionNoGore: {
            cutHead: 'animation.general.execution.cut_head_no_gore',
        }
    };
    sounds = {
        parry: 'weapon.parry',
        blocked: 'weapon.sword.hit3',
        block: 'weapon.sword.hit2',
    };
    blocked = {
        cast: 10,
        onEnter: (pl, ctx) => {
            const { direction } = ctx.rawArgs[2];
            ctx.status.componentManager.getComponent(Stamina$1).unwrap().stamina -= 10;
            playAnim$6(pl, getAnim(this.animations.blocked, direction));
            playSoundAll$5(this.sounds.blocked, pl.pos, 1);
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
    };
    block = {
        cast: 5,
        onEnter: (pl, ctx) => {
            const { direction } = ctx.rawArgs[2];
            const stamina = ctx.status.componentManager.getComponent(Stamina$1).unwrap();
            stamina.setCooldown(5);
            stamina.stamina += 15;
            ctx.status.isBlocking = true;
            playAnim$6(pl, getAnim(this.animations.block, direction));
            playSoundAll$5(this.sounds.block, pl.pos, 1);
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
    };
    hurt = {
        cast: Infinity,
        onEnter: (pl, ctx) => {
            const manager = ctx.status.componentManager;
            manager.getComponent(Stamina$1).unwrap().setCooldown(5);
            ctx.movementInput(pl, false);
            ctx.freeze(pl);
            ctx.status.disableInputs([
                'onAttack',
                'onUseItem',
            ]);
            const { stiffness, customHurtAnimation, direction, execution } = ctx.rawArgs[2];
            const hurtAnim = customHurtAnimation ?? this.animations.hit[direction || 'left'];
            if (execution) {
                ctx.trap(pl, { tag: 'execution', execution });
                return;
            }
            playAnim$6(pl, hurtAnim);
            ctx.task.queue(() => {
                ctx.trap(pl, { tag: 'recover' });
            }, stiffness).run();
        },
        onLeave(pl, ctx) {
            ctx.task.cancel();
            ctx.status.shocked = false;
            ctx.status.enableInputs([
                'onAttack',
                'onUseItem',
            ]);
            ctx.unfreeze(pl);
        },
        onTick(pl, ctx) {
            if (ctx.status.shocked) ;
        },
        transitions: {}
    };
    execution = {
        cast: 60,
        onEnter(pl, ctx) {
            ctx.freeze(pl);
            ctx.status.disableInputs([
                'onAttack',
                'onUseItem',
            ]);
        },
        transitions: {}
    };
    hitWall = {
        cast: 25,
        onEnter: (pl, ctx) => {
            ctx.movementInput(pl, false);
            ctx.freeze(pl);
            ctx.status.disableInputs([
                'onAttack',
                'onUseItem',
            ]);
            playAnim$6(pl, 'animation.general.hit_wall');
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl);
            ctx.status.enableInputs([
                'onAttack',
                'onUseItem',
            ]);
        },
        transitions: {}
    };
    parried = {
        onEnter: (pl, ctx) => {
            ctx.status.componentManager.getComponent(Stamina$1).unwrap().stamina -= 15;
            ctx.movementInput(pl, false);
            ctx.freeze(pl);
            ctx.status.disableInputs([
                'onAttack',
                'onUseItem',
            ]);
            const { direction } = ctx.rawArgs[2];
            playAnim$6(pl, getAnim(this.animations.parried, direction));
            ctx.trap(pl, { tag: getApproximatelyDir(direction) });
        },
        transitions: {
            parriedLeft: {
                onTrap: {
                    tag: 'left'
                }
            },
            parriedRight: {
                onTrap: {
                    tag: 'right'
                }
            },
            hurt: {
                onHurt: null
            }
        }
    };
    parriedLeft = {
        cast: 34,
        onLeave(pl, ctx) {
            ctx.unfreeze(pl);
            ctx.status.enableInputs([
                'onAttack',
                'onUseItem'
            ]);
        },
        timeline: {
            3: (pl, ctx) => ctx.setVelocity(pl, -40, 1.5, -2),
            11: (pl, ctx) => ctx.lookAtTarget(pl),
        },
        transitions: {}
    };
    parriedRight = {
        cast: 34,
        onLeave(pl, ctx) {
            ctx.unfreeze(pl);
            ctx.status.enableInputs([
                'onAttack',
                'onUseItem'
            ]);
        },
        timeline: {
            3: (pl, ctx) => ctx.setVelocity(pl, -140, 1.5, -2),
            11: (pl, ctx) => ctx.lookAtTarget(pl),
        },
        transitions: {}
    };
    parry = {
        cast: 10,
        backswing: 11,
        onEnter: (pl, ctx) => {
            const { direction } = ctx.rawArgs[2];
            ctx.components.attachComponent(new ParryDirection(getApproximatelyDir(direction)));
            ctx.status.componentManager.getComponent(Stamina$1).unwrap().stamina += 10;
            ctx.movementInput(pl, false);
            playSoundAll$5(this.sounds.parry, pl.pos, 1);
            ctx.status.isWaitingParry = true;
            playAnim$6(pl, getAnim(this.animations.parry, direction));
            ctx.lookAtTarget(pl);
            ctx.status.componentManager.attachComponent(new CameraFading$1([
                {
                    from: CameraComponent$1.defaultOffset,
                    to: [0.6, 0, 0.8, 0, 0],
                    duration: 2
                },
                {
                    to: CameraComponent$1.defaultOffset,
                    duration: 3
                }
            ]));
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl);
            ctx.status.isWaitingParry = false;
            ctx.status.componentManager.detachComponent(CameraFading$1);
        },
        timeline: {
            13: (pl, ctx) => ctx.trap(pl, { tag: 'parryCounter' })
        },
        transitions: {}
    };
    knockdown = {
        cast: 30,
        onEnter: (pl, ctx) => {
            ctx.freeze(pl);
            ctx.status.disableInputs([
                'onAttack',
                'onUseItem'
            ]);
            playAnim$6(pl, this.animations.knockdown);
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl);
            playAnim$6(pl, 'animation.general.stand');
            ctx.status.enableInputs([
                'onAttack',
                'onUseItem'
            ]);
        },
        transitions: {}
    };
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
        this.parriedLeft.transitions = {
            [init]: {
                onEndOfLife: null
            },
            hurt: {
                onHurt: null
            },
        };
        this.parriedRight.transitions = {
            [init]: {
                onEndOfLife: null
            },
            hurt: {
                onHurt: null
            },
        };
        this.hurt.transitions = {
            [init]: {
                onTrap: {
                    tag: 'recover'
                }
            },
            hurt: {
                onHurt: null
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
                onHurt: null
            },
        };
        this.block.transitions = {
            [init]: {
                onEndOfLife: null
            },
            hurt: {
                onHurt: null
            },
            block: {
                onBlock: null
            }
        };
        this.execution.transitions = {
            [init]: {
                onEndOfLife: null
            }
        };
    }
    mixin(state, obj) {
        //@ts-ignore
        this[state] = Object.assign(this[state], obj);
    }
    setTransition(state, transitionName, transition) {
        //@ts-ignore
        const _state = this[state];
        if (!_state) {
            return;
        }
        _state.transitions[transitionName] = transition;
    }
};
/**
 * @implements {TrickModule}
 */
let DefaultTrickModule$4 = class DefaultTrickModule {
    sid;
    entry;
    bind;
    moves;
    constructor(sid, entry, bind, moves) {
        this.sid = sid;
        this.entry = entry;
        this.bind = bind;
        this.moves = moves;
    }
};

var _default = /*#__PURE__*/Object.freeze({
	__proto__: null,
	DefaultMoves: DefaultMoves$4,
	DefaultTrickModule: DefaultTrickModule$4,
	ParryDirection: ParryDirection,
	getApproximatelyDir: getApproximatelyDir
});

var require$$1 = /*@__PURE__*/getAugmentedNamespace(_default);

const { playAnim: playAnim$5, playSoundAll: playSoundAll$4 } = require$$2$2;
const { DefaultMoves: DefaultMoves$3, DefaultTrickModule: DefaultTrickModule$3 } = require$$1;

class DoubleDaggerMoves extends DefaultMoves$3 {
    constructor() {
        super();

        this.animations.parry.left = 'animation.double_dagger.parry';
        this.animations.block.left = 'animation.double_dagger.block';
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
            playAnim$5(pl, 'animation.posture.clear');
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
            playAnim$5(pl, 'animation.double_dagger.hold', 'animation.double_dagger.hold');
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
        cast: 10,
        backswing: 10,
        onEnter(pl, ctx) {
            ctx.status.isBlocking = true;
            ctx.freeze(pl);
            playAnim$5(pl, 'animation.double_dagger.horizontal_swing');
            ctx.lookAtTarget(pl);
        },
        onAct(pl, ctx) {
            playSoundAll$4('weapon.woosh.1', pl.pos, 1);
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
            ctx.status.isBlocking = false;
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
        cast: 11,
        backswing: 10,
        onEnter(pl, ctx) {
            ctx.freeze(pl);
            playAnim$5(pl, 'animation.double_dagger.horizontal_swing.to.vertical_chop');
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
            9: pl => playSoundAll$4('weapon.woosh.3', pl.pos, 1),
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
        cast: 11,
        backswing: 11,
        onEnter(pl, ctx) {
            ctx.status.isWaitingParry = true;
            ctx.freeze(pl);
            ctx.lookAtTarget(pl);
            playAnim$5(pl, 'animation.double_dagger.stab');
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
                    direction: 'middle',
                });
            });
        },
        onLeave(pl, ctx) {
            ctx.status.isWaitingParry = false;
            ctx.status.isBlocking = false;
            ctx.unfreeze(pl);
        },
        timeline: {
            3: (_, ctx) => ctx.status.isWaitingParry = false,
            6: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 2, 90, 0.8),
            8: (_, ctx) => ctx.status.isBlocking = true,
            9: pl => playSoundAll$4('weapon.woosh.2', pl.pos, 1),
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
            playAnim$5(pl, 'animation.double_dagger.dodge.front');
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
            playSoundAll$4('weapon.deflection', pl.pos, 1);
            playAnim$5(pl, 'animation.double_dagger.deflection');
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
        cast: 8,
        backswing: 8,
        onEnter(pl, ctx) {
            ctx.freeze(pl);
            playAnim$5(pl, 'animation.double_dagger.deflection.stab');
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
                    direction: 'middle',
                });
            });
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl);
        },
        timeline: {
            5: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 2, 60, 0),
            6: pl => playSoundAll$4('weapon.woosh.2', pl.pos, 1)
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
        cast: 4,
        backswing: 8,
        onEnter(pl, ctx) {
            ctx.freeze(pl);
            ctx.adsorbOrSetVelocity(pl, 1.5, 90, 0.8);
            playAnim$5(pl, 'animation.double_dagger.deflection.punch');
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
                    direction: 'middle',
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
        cast: 6,
        backswing: 14,
        onEnter(pl, ctx) {
            ctx.freeze(pl);
            playAnim$5(pl, 'animation.double_dagger.dodge.catch');
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
        cast: 5,
        backswing: 11,
        onEnter(pl, ctx) {
            ctx.freeze(pl);
            playAnim$5(pl, 'animation.double_dagger.catch.stab');
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
        cast: 6,
        backswing: 10,
        onEnter(pl, ctx) {
            ctx.freeze(pl);
            playAnim$5(pl, 'animation.double_dagger.catch.kick');
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

class DoubleDaggerTricks extends DefaultTrickModule$3 {
    constructor() {
        super(
            'rgb:double_dagger',
            'init',
            [ 'weapon:double_dagger' ],
            new DoubleDaggerMoves()
        );
    }
}

double_dagger.tricks = new DoubleDaggerTricks();

var emptyHand = {};

const { playAnim: playAnim$4, playSoundAll: playSoundAll$3 } = require$$2$2;
const { DefaultMoves: DefaultMoves$2, DefaultTrickModule: DefaultTrickModule$2 } = require$$1;

class EmptyHandMoves extends DefaultMoves$2 {
    /**
     * @type {Move}
     */
    blocking = {
        cast: Infinity,
        onEnter(pl) {
            playAnim$4(pl, 'animation.general.empty_hand');
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

class EmptyHandTricks extends DefaultTrickModule$2 {
    constructor() {
        super(
            'rgb39.weapon.empty_hand',
            'blocking',
            [ '*' ],
            new EmptyHandMoves()
        );
    }
}

emptyHand.tricks = new EmptyHandTricks();

var lightSaber = {};

var require$$2$1 = /*@__PURE__*/getAugmentedNamespace(math);

function hud$1(progress, size, style = ['', '§6▮', '§4▯', '']) {
    const duration = Math.ceil(size * progress);
    const [left, bar, empty, right] = style;
    return left +
        bar.repeat(duration) +
        empty.repeat(size - duration) + right;
}

var hud$2 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	hud: hud$1
});

var require$$3 = /*@__PURE__*/getAugmentedNamespace(hud$2);

const { playAnim: playAnim$3, playSoundAll: playSoundAll$2 } = require$$2$2;
const { DefaultMoves: DefaultMoves$1, DefaultTrickModule: DefaultTrickModule$1 } = require$$1;
const { constrictCalc, randomRange } = require$$2$1;
const { hud } = require$$3;

class LightSaberMoves extends DefaultMoves$1 {
    /**
     * @type {Move}
     */
    hold = {
        cast: Infinity,
        onEnter(pl, ctx) {
            playAnim$3(pl, 'animation.weapon.light_saber.hold', 'animation.weapon.light_saber.hold');
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
            playAnim$3(pl, 'animation.weapon.light_saber.dodge');
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
            playAnim$3(pl, 'animation.weapon.light_saber.jump_attack');
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
            playAnim$3(pl, 'animation.weapon.light_saber.blocking', 'animation.weapon.light_saber.blocking');
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
            playSoundAll$2(`weapon.sword.hit${randomRange(1, 4, true)}`, pl.pos, 1);
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
            playAnim$3(pl, 'animation.weapon.light_saber.run', 'animation.weapon.light_saber.run');
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
            playAnim$3(pl, 'animation.weapon.light_saber.dash');
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
            playAnim$3(pl, 'animation.weapon.light_saber.strike');
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
            playAnim$3(pl, 'animation.weapon.light_saber.attack1');
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
            playAnim$3(pl, 'animation.weapon.light_saber.attack2');
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

class LightSaberTrick extends DefaultTrickModule$1 {
    constructor() {
        super(
            'rgb39.weapon.light_saber',
            'hold',
            [ 'weapon:light_saber' ],
            new LightSaberMoves()
        );
    }
}

lightSaber.tricks = new LightSaberTrick();

var moon_glaive = {};

const { playAnim: playAnim$2, playSoundAll: playSoundAll$1, DEFAULT_POSTURE_SPEED: DEFAULT_POSTURE_SPEED$2 } = require$$2$2;
const { DefaultMoves, DefaultTrickModule } = require$$1;

class MoonGlaiveTricks extends DefaultTrickModule {
    constructor() {
        super(
            'rgb39.weapon.moon_glaive',
            'hold',
            [ 'weapon:moon_glaive' ],
            new MoonGlaiveMoves()
        );
    }
}

class MoonGlaiveMoves extends DefaultMoves {

    constructor() {
        super();

        this.setup('backToDefault');
        this.animations.parry.left = 'animation.weapon.moon_glaive.parry';

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
            ctx.releaseTarget(pl.uniqueId);
            playAnim$2(pl, 'animation.weapon.moon_glaive.hold', 'animation.weapon.moon_glaive.hold');
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
            ctx.releaseTarget(pl.uniqueId);
            playAnim$2(pl, 'animation.weapon.moon_glaive.running', 'animation.weapon.moon_glaive.running');
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
            playAnim$2(pl, 'animation.weapon.moon_glaive.retention.negative_spinning');
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
                direction: 'right'
            }));
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl);
            ctx.setSpeed(pl, DEFAULT_POSTURE_SPEED$2);
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
            playAnim$2(pl, 'animation.weapon.moon_glaive.retention', 'animation.weapon.moon_glaive.retention');
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
            playAnim$2(pl, 'animation.weapon.moon_glaive.to_retention');
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
            playAnim$2(pl, 'animation.weapon.moon_glaive.from_retention');
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
            playAnim$2(pl, 'animation.weapon.moon_glaive.hold_locked', 'animation.weapon.moon_glaive.hold_locked');
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
            playAnim$2(pl, 'animation.weapon.moon_glaive.dodge');
            ctx.setVelocity(pl, -90, 2.5, 0);
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl);
            ctx.setSpeed(pl, DEFAULT_POSTURE_SPEED$2);
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
            playAnim$2(pl, 'animation.weapon.moon_glaive.push');
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
                    damage: 16,
                    direction: 'middle'
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
            playAnim$2(pl, 'animation.weapon.moon_glaive.chop');
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
                    direction: 'vertical'
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
            playAnim$2(pl, 'animation.weapon.moon_glaive.vertical_chop');
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
                    direction: 'vertical',
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
            playAnim$2(pl, 'animation.weapon.moon_glaive.heavy_sweap');
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
                    direction: 'left',
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
            playAnim$2(pl, 'animation.weapon.moon_glaive.chop.combo');
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
                    direction: 'right',
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
            playAnim$2(pl, 'animation.weapon.moon_glaive.positive_spinning');
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
                    direction: 'left',
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
            playAnim$2(pl, 'animation.weapon.moon_glaive.parry.knock');
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
                    direction: 'middle',
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
            playAnim$2(pl, 'animation.weapon.moon_glaive.parry.chop');
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
                    direction: 'right',
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

moon_glaive.tricks = new MoonGlaiveTricks();

class OotachiMoves extends DefaultMoves$4 {
    constructor() {
        super();
        this.setup('resumeKamae');
        this.parry.timeline = {
            14: (pl, ctx) => ctx.trap(pl)
        };
        this.setTransition('parry', 'combo2Cut', {
            onTrap: {
                preInput: 'onAttack',
            }
        });
        this.setTransition('parry', 'combo2Sweap', {
            onTrap: {
                preInput: 'onUseItem',
            }
        });
        this.animations.parry.left = 'animation.weapon.ootachi.parry.left';
        this.animations.parry.right = 'animation.weapon.ootachi.parry.right';
        this.animations.block.left = 'animation.weapon.ootachi.block.left';
        this.animations.block.right = 'animation.weapon.ootachi.block.right';
    }
    idle = {
        cast: Infinity,
        onEnter(pl, ctx) {
            ctx.unfreeze(pl);
            ctx.releaseTarget(pl.uniqueId);
            if (ctx.previousStatus === 'running') {
                ctx.task
                    .queue(() => playAnim$6(pl, 'animation.weapon.ootachi.trans.running.idle'), 0)
                    .queue(() => playAnim$6(pl, 'animation.weapon.ootachi.idle', 'animation.weapon.ootachi.idle'), 210)
                    .run();
            }
            else
                playAnim$6(pl, 'animation.weapon.ootachi.idle', 'animation.weapon.ootachi.idle');
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
                onHurt: null
            },
            combo1Attack: {
                onAttack: {
                    stamina: 16,
                }
            },
        }
    };
    innoKamae = {
        cast: Infinity,
        onEnter(pl, ctx) {
            ctx.freeze(pl);
            playAnim$6(pl, 'animation.weapon.ootachi.kamae.inno', 'animation.weapon.ootachi.kamae.inno');
        },
        onTick(pl, ctx) {
            ctx.lookAtTarget(pl);
        },
        transitions: {
            idle: {
                onReleaseLock: null,
                onJump: null,
            },
            running: {
                onChangeSprinting: {
                    sprinting: true,
                }
            },
            combo1Attack: {
                onAttack: {
                    stamina: 16,
                }
            },
            combo1Chop: {
                onUseItem: {
                    stamina: 22,
                }
            },
            dodgePrepare: {
                onDodge: null
            },
            hurt: {
                onHurt: null
            },
        }
    };
    resumeKamae = {
        transitions: {
            idle: {
                onEndOfLife: {
                    hasTarget: false
                }
            },
            dodgePrepare: {
                onEndOfLife: {
                    hasTarget: true,
                    preInput: 'onDodge'
                }
            },
            combo1Attack: {
                onEndOfLife: {
                    hasTarget: true,
                    preInput: 'onAttack'
                }
            },
            combo1Chop: {
                onEndOfLife: {
                    hasTarget: true,
                    preInput: 'onUseItem'
                }
            },
            innoKamae: {
                onEndOfLife: {
                    hasTarget: true
                }
            },
            hurt: {
                onHurt: null
            }
        }
    };
    running = {
        cast: Infinity,
        onEnter(pl, ctx) {
            ctx.releaseTarget(pl.uniqueId);
            ctx.task
                .queue(() => playAnim$6(pl, 'animation.weapon.ootachi.trans.idle.running'), 0)
                .queue(() => playAnim$6(pl, 'animation.weapon.ootachi.running', 'animation.weapon.ootachi.running'), 210)
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
                onHurt: null
            },
        }
    };
    combo1Attack = {
        cast: 8,
        backswing: 12,
        timeline: {
            5: (_, ctx) => ctx.status.isBlocking = false,
            7: pl => playSoundAll$5(`weapon.woosh.${randomRange$1(2, 4, true)}`, pl.pos, 1),
            14: (pl, ctx) => ctx.trap(pl, { tag: 'combo' })
        },
        onEnter(pl, ctx) {
            ctx.status.componentManager.getComponent(Stamina$1).unwrap().stamina -= 16;
            ctx.status.isBlocking = true;
            ctx.freeze(pl);
            ctx.task.queueList([
                { handler: () => ctx.adsorbOrSetVelocity(pl, 0.5, 90), timeout: 0 },
                { handler: () => ctx.adsorbOrSetVelocity(pl, 1, 90), timeout: 100 },
                { handler: () => ctx.adsorbOrSetVelocity(pl, 0.8, 90), timeout: 300 },
            ]).run();
            playAnim$6(pl, 'animation.weapon.ootachi.combo1.attack');
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
                    direction: 'left',
                });
                ctx.lookAtTarget(pl);
            });
        },
        onLeave(_, ctx) {
            ctx.status.isBlocking = false;
            ctx.task.cancel();
        },
        transitions: {
            resumeKamae: {
                onEndOfLife: null,
                onBlock: null,
            },
            hurt: {
                onHurt: null
            },
            parried: {
                onParried: null
            },
            combo2Cut: {
                onTrap: {
                    tag: 'combo',
                    hasTarget: true,
                    preInput: 'onAttack',
                    stamina: 16,
                }
            },
            combo2Sweap: {
                onTrap: {
                    tag: 'combo',
                    hasTarget: true,
                    preInput: 'onUseItem',
                    stamina: 28,
                }
            },
            blocked: {
                onBlocked: null
            },
            block: {
                onBlock: null
            }
        }
    };
    combo1Chop = {
        cast: 11,
        backswing: 13,
        onEnter(pl, ctx) {
            ctx.freeze(pl);
            ctx.status.componentManager.getComponent(Stamina$1).unwrap().stamina -= 22;
            ctx.status.isWaitingParry = true;
            ctx.task.queueList([
                { handler: () => ctx.adsorbOrSetVelocity(pl, 1, 90), timeout: 0 },
                { handler: () => ctx.status.isWaitingParry = false, timeout: 150 },
                { handler: () => {
                        ctx.adsorbOrSetVelocity(pl, 1.2, 90);
                    }, timeout: 50 },
                { handler: () => ctx.adsorbOrSetVelocity(pl, 0.5, 90), timeout: 400 },
            ]).run();
            playAnim$6(pl, 'animation.weapon.ootachi.combo1.chop');
            ctx.lookAtTarget(pl);
        },
        onAct(pl, ctx) {
            playSoundAll$5(`weapon.woosh.${randomRange$1(2, 4, true)}`, pl.pos, 1);
            ctx.selectFromRange(pl, {
                radius: 3,
                angle: 120,
                rotation: -60,
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 26,
                    knockback: 1.5,
                    direction: 'left',
                });
                ctx.lookAtTarget(pl);
            });
        },
        onLeave(pl, ctx) {
            ctx.task.cancel();
            ctx.status.isWaitingParry = false;
        },
        timeline: {
            8: (pl, ctx) => {
                ctx.trap(pl, { tag: 'feint' });
            },
            9: (pl, ctx) => ctx.trap(pl, { tag: 'hlit' }),
            17: (pl, ctx) => ctx.trap(pl, { tag: 'combo' })
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
                onHurt: null
            },
            parry: {
                onParry: null
            },
            parried: {
                onParried: null
            },
            combo2Cut: {
                onTrap: {
                    tag: 'combo',
                    hasTarget: true,
                    preInput: 'onAttack',
                    stamina: 16,
                }
            },
            combo2Sweap: {
                onTrap: {
                    tag: 'combo',
                    hasTarget: true,
                    preInput: 'onUseItem',
                    stamina: 28,
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
    };
    combo2Cut = {
        cast: 9,
        backswing: 17,
        onEnter(pl, ctx) {
            ctx.status.componentManager.getComponent(Stamina$1).unwrap().stamina -= 18;
            ctx.lookAtTarget(pl);
            ctx.freeze(pl);
            playAnim$6(pl, `animation.weapon.ootachi.combo2.cut.${ctx.previousStatus === 'combo1Attack' ? 'l' : 'r'}`);
            ctx.adsorbOrSetVelocity(pl, 1, 90, 1.5);
        },
        onAct(pl, ctx) {
            playSoundAll$5(`weapon.woosh.${randomRange$1(2, 4, true)}`, pl.pos, 1);
            ctx.selectFromRange(pl, {
                radius: 3.5,
                angle: 50,
                rotation: -25
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 18,
                    knockback: 1.2,
                    trace: true,
                    direction: 'middle',
                });
                ctx.lookAtTarget(pl);
            });
        },
        onLeave(_, ctx) {
            ctx.unfreeze(_);
            ctx.task.cancel();
        },
        timeline: {
            7: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 2, 90),
            16: (pl, ctx) => ctx.trap(pl, { tag: 'combo' })
        },
        transitions: {
            resumeKamae: {
                onEndOfLife: null,
            },
            hurt: {
                onHurt: null
            },
            parried: {
                onParried: null
            },
            combo3Stab: {
                onTrap: {
                    tag: 'combo',
                    preInput: 'onAttack',
                    hasTarget: true,
                    stamina: 12,
                }
            },
            combo3Sweap: {
                onTrap: {
                    tag: 'combo',
                    preInput: 'onUseItem',
                    hasTarget: true,
                    stamina: 33,
                }
            },
            blocked: {
                onBlocked: null
            },
        }
    };
    combo2Sweap = {
        cast: 14,
        backswing: 12,
        onEnter(pl, ctx) {
            ctx.status.componentManager.getComponent(Stamina$1).unwrap().stamina -= 28;
            ctx.lookAtTarget(pl);
            ctx.freeze(pl);
            ctx.status.hegemony = true;
            ctx.status.repulsible = false;
            if (ctx.previousStatus === 'parry') {
                const parryDir = ctx.components.getComponent(ParryDirection).unwrap();
                if (parryDir.direction === 'left') {
                    playAnim$6(pl, 'animation.weapon.ootachi.combo2.sweap.r2');
                    ctx.adsorbOrSetVelocity(pl, 1, 180);
                }
                else {
                    playAnim$6(pl, 'animation.weapon.ootachi.combo2.sweap.r');
                    ctx.adsorbOrSetVelocity(pl, 0.2, 90);
                }
            }
            else {
                playAnim$6(pl, `animation.weapon.ootachi.combo2.sweap.${ctx.previousStatus === 'combo1Attack' ? 'l' : 'r'}`);
                ctx.adsorbOrSetVelocity(pl, 0.2, 90);
            }
            ctx.task
                .queue(() => ctx.adsorbOrSetVelocity(pl, 1.2, 90), 200)
                .run();
        },
        onAct(pl, ctx) {
            playSoundAll$5(`weapon.woosh.${randomRange$1(2, 4, true)}`, pl.pos, 1);
            ctx.selectFromRange(pl, {
                radius: 3,
                angle: 80,
                rotation: -40
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 28,
                    knockback: 1.2,
                    direction: 'right',
                });
            });
            ctx.lookAtTarget(pl);
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
                onParried: null
            },
            hurt: {
                onInterrupted: null
            },
            combo3Stab: {
                onTrap: {
                    tag: 'combo',
                    preInput: 'onAttack',
                    hasTarget: true,
                    stamina: 12,
                }
            },
            combo3Sweap: {
                onTrap: {
                    tag: 'combo',
                    preInput: 'onUseItem',
                    hasTarget: true,
                    stamina: 33,
                }
            },
        }
    };
    combo3Stab = {
        cast: 9,
        backswing: 16,
        onEnter(pl, ctx) {
            ctx.status.componentManager.getComponent(Stamina$1).unwrap().stamina -= 17;
            ctx.freeze(pl);
            playAnim$6(pl, `animation.weapon.ootachi.combo3.stab.${ctx.previousStatus === 'combo2Cut' ? 'l' : 'r'}`);
            ctx.task
                .queue(() => ctx.adsorbOrSetVelocity(pl, 0.5, 90), 0)
                .queue(() => ctx.adsorbOrSetVelocity(pl, 1, 90), 200)
                .run();
        },
        onAct(pl, ctx) {
            ctx.lookAtTarget(pl);
            playSoundAll$5(`weapon.woosh.${randomRange$1(2, 4, true)}`, pl.pos, 1);
            ctx.selectFromRange(pl, {
                radius: 3.5,
                angle: 30,
                rotation: -15
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 16,
                    knockback: 0.8,
                    direction: 'left',
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
                onHurt: null
            },
            parried: {
                onParried: null
            },
            blocked: {
                onBlocked: null
            },
        }
    };
    combo3Sweap = {
        cast: 17,
        backswing: 18,
        onEnter(pl, ctx) {
            ctx.status.componentManager.getComponent(Stamina$1).unwrap().stamina -= 33;
            ctx.lookAtTarget(pl);
            ctx.freeze(pl);
            ctx.adsorbOrSetVelocity(pl, 1, 90);
            playAnim$6(pl, `animation.weapon.ootachi.combo3.sweap.${ctx.previousStatus === 'combo2Cut' ? 'l' : 'r'}`);
            ctx.task
                .queue(() => ctx.adsorbOrSetVelocity(pl, 1, 90), 200)
                .queue(() => ctx.adsorbOrSetVelocity(pl, 1, 90), 280)
                .run();
        },
        onAct(pl, ctx) {
            playSoundAll$5(`weapon.woosh.${randomRange$1(2, 4, true)}`, pl.pos, 1);
            ctx.selectFromRange(pl, {
                radius: 3.5,
                angle: 90,
                rotation: -45
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 35,
                    permeable: true,
                    knockback: 1.2,
                    direction: 'vertical',
                });
            });
            ctx.lookAtTarget(pl);
        },
        onLeave(_, ctx) {
            ctx.task.cancel();
            ctx.unfreeze(_);
            ctx.status.hegemony = false;
        },
        timeline: {
            9: (_, ctx) => ctx.status.hegemony = true,
            8: (pl, ctx) => ctx.trap(pl),
            25: (_, ctx) => ctx.status.hegemony = false,
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
                onInterrupted: null
            },
            parried: {
                onParried: null
            },
        }
    };
    dodgePrepare = {
        cast: 0,
        backswing: 1,
        onEnter(pl, ctx) {
            ctx.movement(pl);
            const direct = ctx.getMoveDir(pl) || 1;
            if (direct !== 1) {
                ctx.setVelocity(pl, direct * 90, 2.5);
            }
            else {
                ctx.adsorbToTarget(pl, 2);
            }
            if (direct !== 3) {
                playAnim$6(pl, 'animation.weapon.ootachi.dodge.front');
            }
            else {
                playAnim$6(pl, 'animation.weapon.ootachi.dodge.back');
            }
            ctx.trap(pl, { tag: direct === 1 ? 'front' : 'side' });
        },
        onLeave(pl, ctx) {
            ctx.movement(pl, false);
        },
        transitions: {
            dodge: {
                onTrap: {
                    tag: 'side'
                }
            },
            dodgeFront: {
                onTrap: {
                    tag: 'front'
                }
            },
            hurt: {
                onHurt: null
            }
        }
    };
    dodge = {
        cast: 3,
        backswing: 5,
        onEnter(_, ctx) {
            const manager = ctx.status.componentManager;
            manager.getComponent(Stamina$1).unwrap().setCooldown(10);
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
                onBlock: null
            },
            hurt: {
                onHurt: null
            }
        }
    };
    dodgeFront = {
        cast: 4,
        backswing: 4,
        onEnter(_, ctx) {
            const manager = ctx.status.componentManager;
            manager.getComponent(Stamina$1).unwrap().setCooldown(10);
            ctx.status.isBlocking = true;
        },
        onAct(_, ctx) {
            ctx.status.isBlocking = false;
        },
        onLeave(_, ctx) {
            ctx.status.isBlocking = false;
        },
        transitions: {
            resumeKamae: {
                onEndOfLife: null
            },
            dodgeBlocking: {
                onBlock: null
            },
            hurt: {
                onHurt: null
            }
        }
    };
    dodgeBlocking = {
        onEnter(pl, ctx) {
            mc.runcmdEx(`execute as ${pl.name} at @s run particle minecraft:lava_particle ^^1^0.5`);
            mc.runcmdEx(`execute as ${pl.name} at @s run particle minecraft:lava_particle ^-0.1^1^0.5`);
            mc.runcmdEx(`execute as ${pl.name} at @s run particle minecraft:lava_particle ^0.1^1^0.5`);
            playSoundAll$5('weapon.heavy', pl.pos, 1);
        },
        transitions: {
            hlitStrike: {
                onEndOfLife: null
            },
            hurt: {
                onHurt: null
            }
        }
    };
    /**
     * @type {Move}
     */
    hlitStrike = {
        cast: 7,
        backswing: 3,
        onEnter(pl, ctx) {
            ctx.status.componentManager.getComponent(Stamina$1).unwrap().stamina -= 12;
            playAnim$6(pl, 'animation.weapon.ootachi.hlit');
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
                    stiffness: 700,
                    shock: true,
                    powerful: true,
                    direction: 'middle',
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
                onHurt: null
            },
            combo3Stab: {
                onTrap: {
                    preInput: 'onAttack',
                    hasTarget: true,
                    stamina: 12,
                }
            },
            combo3Sweap: {
                onTrap: {
                    preInput: 'onUseItem',
                    hasTarget: true,
                    stamina: 33,
                }
            },
        }
    };
}
class OotachiTricks extends DefaultTrickModule$4 {
    constructor() {
        super('rgb39.weapon.ootachi', 'idle', ['weapon:ootachi', 'weapon:ootachi_akaoni', 'weapon:ootachi_dragon'], new OotachiMoves());
    }
}
const tricks$4 = new OotachiTricks();

var ootachi = /*#__PURE__*/Object.freeze({
	__proto__: null,
	tricks: tricks$4
});

var require$$4 = /*@__PURE__*/getAugmentedNamespace(ootachi);

var sheathed_katana = {};

const { playAnim: playAnim$1, playSoundAll } = require$$2$2;

/**
 * @type {TrickModule}
 */
sheathed_katana.tricks = {
    sid: 'rgb39.weapon.katana',
    bind: 'weapon:katana',
    entry: 'default',
    moves: {
        default: {
            cast: Infinity,
            onEnter(pl, ctx) {
                ctx.status.isBlocking = true;
                playAnim$1(pl, 'animation.general.stand');
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
                playAnim$1(pl, 'animation.twohanded.block.' + side, 'animation.twohanded.block.' + side);
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
                playAnim$1(pl, 'animation.general.fell');
            },
            onLeave(pl, ctx) {
                ctx.unfreeze(pl);
                playAnim$1(pl, 'animation.general.stand');
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

class ShieldSwordTricks extends DefaultTrickModule$4 {
    constructor() {
        super('rgb39.weapon.shield_sword', 'idle', ['weapon:shield_with_sword'], new ShieldSwordMoves());
    }
}
class ShieldSwordMoves extends DefaultMoves$4 {
    constructor() {
        super();
        this.setup('resume');
        this.block = {
            cast: 7,
            onEnter(pl, ctx) {
                playSoundAll$5(`weapon.sheild.hit${randomRange$1(1, 3, true)}`, pl.pos, 1);
                ctx.status.isBlocking = true;
                ctx.freeze(pl);
                ctx.lookAtTarget(pl);
                playAnim$6(pl, 'animation.weapon.shield_with_sword.block');
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
                        hasTarget: true,
                    }
                },
            },
        };
    }
    idle = {
        cast: Infinity,
        onEnter(pl, ctx) {
            ctx.unfreeze(pl);
            playAnim$6(pl, 'animation.weapon.shield_with_sword.idle', 'animation.weapon.shield_with_sword.idle');
        },
        transitions: {
            hurt: {
                onHurt: null,
            },
            running: {
                onChangeSprinting: {
                    sprinting: true
                }
            },
            hold: {
                onLock: null
            }
        }
    };
    hold = {
        cast: Infinity,
        onEnter(pl, ctx) {
            playAnim$6(pl, 'animation.weapon.shield_with_sword.hold', 'animation.weapon.shield_with_sword.hold');
        },
        transitions: {
            idle: {
                onReleaseLock: null
            },
            beforeBlocking: {
                onSneak: {
                    isSneaking: true,
                },
            },
            draw: {
                onUseItem: {
                    hasTarget: true,
                }
            },
            punch: {
                onAttack: {
                    hasTarget: true
                }
            },
            hurt: {
                onHurt: null,
            },
        }
    };
    resume = {
        transitions: {
            idle: {
                onEndOfLife: {
                    hasTarget: false
                }
            },
            hold: {
                onEndOfLife: {
                    hasTarget: true
                }
            },
            hurt: {
                onHurt: null,
            },
            beforeBlocking: {
                onEndOfLife: {
                    isSneaking: true,
                },
            },
            draw: {
                onEndOfLife: {
                    preInput: 'onUseItem',
                    hasTarget: true
                }
            },
            punch: {
                onEndOfLife: {
                    preInput: 'onAttack',
                    hasTarget: true
                }
            },
        }
    };
    draw = {
        cast: 7,
        backswing: 13,
        onEnter(pl, ctx) {
            ctx.freeze(pl);
            playAnim$6(pl, 'animation.weapon.shield_with_sword.draw');
            ctx.adsorbOrSetVelocity(pl, 1, 90);
            ctx.status.isBlocking = true;
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl);
            ctx.status.isBlocking = false;
        },
        onAct(pl, ctx) {
            playSoundAll$5(`weapon.woosh.${randomRange$1(1, 3, true)}`, pl.pos, 1);
            ctx.selectFromRange(pl, {
                radius: 2.8,
                angle: 60,
                rotation: -30
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 16,
                    direction: 'left'
                });
            });
        },
        timeline: {
            3: (_, ctx) => ctx.status.isBlocking = false,
            6: (pl, ctx) => ctx.lookAtTarget(pl),
            14: (pl, ctx) => ctx.trap(pl, { tag: 'heavy' }),
            16: (pl, ctx) => ctx.trap(pl, { tag: 'punch' })
        },
        transitions: {
            hurt: {
                onHurt: null
            },
            resume: {
                onEndOfLife: null
            },
            parried: {
                onParried: null
            },
            heavyChopAct: {
                onTrap: {
                    tag: 'heavy',
                    preInput: 'onUseItem',
                }
            },
            punch: {
                onTrap: {
                    tag: 'punch',
                    preInput: 'onAttack',
                }
            },
            blocked: {
                onBlocked: null
            },
        }
    };
    heavyChopAct = {
        cast: 8,
        backswing: 15,
        onEnter(pl, ctx) {
            ctx.freeze(pl);
            ctx.adsorbOrSetVelocity(pl, 2, 90);
            playAnim$6(pl, 'animation.weapon.shield_with_sword.heavy_chop_act');
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl);
        },
        onAct(pl, ctx) {
            playSoundAll$5(`weapon.woosh.${randomRange$1(3, 5, true)}`, pl.pos, 1);
            ctx.selectFromRange(pl, {
                angle: 40,
                rotation: -20,
                radius: 3.2
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 20,
                    knockback: 1.5,
                    trace: true,
                    direction: 'vertical'
                });
            });
        },
        timeline: {
            3: (pl, ctx) => ctx.lookAtTarget(pl),
            6: (pl, ctx) => ctx.trap(pl),
            8: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 2.5, 90)
        },
        transitions: {
            resume: {
                onEndOfLife: null,
                onTrap: {
                    preInput: 'onFeint',
                }
            },
            hurt: {
                onHurt: null
            },
            parried: {
                onParried: null
            },
        }
    };
    punch = {
        cast: 7,
        backswing: 13,
        onEnter(pl, ctx) {
            ctx.freeze(pl);
            playAnim$6(pl, 'animation.weapon.shield_with_sword.punch');
            ctx.adsorbOrSetVelocity(pl, 2, 90, 0.5);
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl);
        },
        onAct(pl, ctx) {
            ctx.selectFromRange(pl, {
                radius: 1,
                angle: 120,
                rotation: -60
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 4,
                    permeable: true,
                    parryable: false,
                    knockback: 0.1,
                    direction: 'middle',
                });
            });
        },
        transitions: {
            hurt: {
                onHurt: null
            },
            punchSomeone: {
                onHit: null
            },
            resume: {
                onEndOfLife: null
            },
        }
    };
    punchSomeone = {
        cast: 2,
        backswing: 8,
        onEnter(pl) {
            playSoundAll$5(`weapon.sheild.hit${randomRange$1(1, 3, true)}`, pl.pos, 0.5);
        },
        onAct(pl, ctx) {
            ctx.trap(pl);
        },
        transitions: {
            chopCombo: {
                onTrap: {
                    preInput: 'onUseItem',
                }
            },
            resume: {
                onEndOfLife: null
            },
            hurt: {
                onHurt: null,
            },
        }
    };
    chopCombo = {
        cast: 7,
        backswing: 13,
        onEnter(pl, ctx) {
            ctx.freeze(pl);
            ctx.adsorbOrSetVelocity(pl, 2, 90);
            playAnim$6(pl, 'animation.weapon.shield_with_sword.chop_combo');
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl);
        },
        onAct(pl, ctx) {
            playSoundAll$5(`weapon.woosh.${randomRange$1(1, 2, true)}`, pl.pos, 1);
            ctx.selectFromRange(pl, {
                radius: 3,
                angle: 46,
                rotation: -23
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 12,
                    knockback: 0.5,
                    direction: 'left'
                });
            });
        },
        timeline: {
            2: (pl, ctx) => ctx.adsorbToTarget(pl, 2),
            0: (pl, ctx) => ctx.lookAtTarget(pl),
        },
        transitions: {
            hurt: {
                onHurt: null
            },
            resume: {
                onEndOfLife: null
            },
            parried: {
                onParried: null
            },
        }
    };
    running = {
        cast: Infinity,
        onEnter(pl, ctx) {
            playAnim$6(pl, 'animation.weapon.shield_with_sword.running', 'animation.weapon.shield_with_sword.running');
            ctx.releaseTarget(pl.uniqueId);
        },
        transitions: {
            hurt: {
                onHurt: null,
            },
            resume: {
                onChangeSprinting: { sprinting: false }
            },
        }
    };
    beforeBlocking = {
        cast: 2,
        onEnter(pl) {
            playAnim$6(pl, 'animation.weapon.shield_with_sword.idle_to_blocking');
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
        }
    };
    blocking = {
        cast: Infinity,
        onEnter(pl, ctx) {
            ctx.status.isBlocking = true;
            playAnim$6(pl, 'animation.weapon.shield_with_sword.blocking', 'animation.weapon.shield_with_sword.blocking');
        },
        onLeave(_, ctx) {
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
                onReleaseSneak: null,
            },
            block: {
                onBlock: null
            },
            rockSolid: {
                onUseItem: {
                    hasTarget: true
                }
            },
        }
    };
    rockSolid = {
        cast: 3,
        backswing: 8,
        onEnter(pl, ctx) {
            ctx.freeze(pl);
            ctx.status.repulsible = false;
            playAnim$6(pl, 'animation.weapon.shield_with_sword.rock_solid');
        },
        onAct(_, ctx) {
            ctx.status.repulsible = true;
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl);
        },
        transitions: {
            resume: {
                onEndOfLife: {
                    isSneaking: false
                }
            },
            sweapCounter: {
                onHurt: {
                    prevent: true,
                    allowedState: 'cast',
                },
            },
            blocking: {
                onEndOfLife: {
                    isSneaking: true
                }
            },
            hurt: {
                onHurt: null,
            }
        }
    };
    sweapCounter = {
        cast: 12,
        backswing: 9,
        onEnter(pl, ctx) {
            ctx.freeze(pl);
            ctx.adsorbToTarget(pl, 4, 0.5);
            playAnim$6(pl, 'animation.weapon.shield_with_sword.sweap_counter');
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
                        direction: 'left'
                    });
                });
            },
        },
        transitions: {
            hurt: {
                onHurt: null
            },
            resume: {
                onEndOfLife: null
            },
        }
    };
    afterBlocking = {
        cast: 3,
        onEnter(pl) {
            playAnim$6(pl, 'animation.weapon.shield_with_sword.blocking_to_idle');
        },
        transitions: {
            hurt: {
                onHurt: null,
            },
            resume: {
                onEndOfLife: null
            },
        }
    };
    swordCounter = {
        cast: 7,
        backswing: 6,
        onEnter(pl, ctx) {
            ctx.freeze(pl);
            ctx.lookAtTarget(pl);
            playAnim$6(pl, 'animation.weapon.shield_with_sword.sword_counter');
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl);
        },
        onAct(pl, ctx) {
            playSoundAll$5(`weapon.woosh.${randomRange$1(1, 3, true)}`, pl.pos, 1);
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
                    direction: 'middle',
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
            resume: {
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
    };
}
const tricks$3 = new ShieldSwordTricks();

var shield_with_sword = /*#__PURE__*/Object.freeze({
	__proto__: null,
	tricks: tricks$3
});

var require$$6$1 = /*@__PURE__*/getAugmentedNamespace(shield_with_sword);

class UchigatanaMoves extends DefaultMoves$4 {
    constructor() {
        super();
        this.setup('resume');
        this.animations.block.left = 'animation.weapon.uchigatana.block.left';
        this.animations.block.right = 'animation.weapon.uchigatana.block.right';
    }
    hold = {
        cast: Infinity,
        onEnter(pl, ctx) {
            playAnim$6(pl, 'animation.weapon.uchigatana.hold', 'animation.weapon.uchigatana.hold');
        },
        transitions: {
            kamae: {
                onLock: null,
            },
            hurt: {
                onHurt: null
            },
            running: {
                onChangeSprinting: {
                    sprinting: true
                }
            },
        }
    };
    kamae = {
        cast: Infinity,
        onEnter(pl) {
            playAnim$6(pl, 'animation.weapon.uchigatana.kamae', 'animation.weapon.uchigatana.kamae');
        },
        transitions: {
            hold: {
                onReleaseLock: null,
                onChangeSprinting: null,
                onJump: null,
            },
            hurt: {
                onHurt: null
            },
            attack1: {
                onAttack: {
                    hasTarget: true
                },
            },
            attack1Heavy: {
                onUseItem: {
                    hasTarget: true
                }
            }
        }
    };
    jodanKamae = {
        cast: 10,
        backswing: 10,
        onEnter(pl, ctx) {
            ctx.freeze(pl);
            playAnim$6(pl, 'animation.weapon.uchigatana.kamae.jodan');
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl);
        },
        transitions: {
            resume: {
                onEndOfLife: null,
            },
            hurt: {
                onHurt: null
            },
        }
    };
    running = {
        cast: Infinity,
        onEnter(pl) {
            playAnim$6(pl, 'animation.weapon.uchigatana.running', 'animation.weapon.uchigatana.running');
        },
        transitions: {
            resume: {
                onChangeSprinting: {
                    sprinting: false
                }
            },
            hurt: {
                onHurt: null
            },
        }
    };
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
                onHurt: null
            },
        }
    };
    attack1 = {
        cast: 9,
        backswing: 12,
        onEnter(pl, ctx) {
            ctx.status.isBlocking = true;
            ctx.freeze(pl);
            ctx.lookAtTarget(pl);
            playAnim$6(pl, 'animation.weapon.uchigatana.attack1');
        },
        onAct(pl, ctx) {
            ctx.selectFromRange(pl).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 12,
                    direction: 'right',
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
            7: pl => playSoundAll$5(`weapon.woosh.2`, pl.pos, 1),
            20: (pl, ctx) => ctx.trap(pl)
        },
        transitions: {
            block: {
                onBlock: null
            },
            jodanKamae: {
                onEndOfLife: {
                    hasTarget: true
                }
            },
            resume: {
                onEndOfLife: {
                    hasTarget: false
                }
            },
            hurt: {
                onHurt: null
            },
            parried: {
                onParried: null
            },
            blocked: {
                onBlocked: null
            },
            attack2: {
                onTrap: {
                    preInput: 'onAttack',
                }
            },
        }
    };
    attack1Heavy = {
        cast: 11,
        backswing: 15,
        onEnter(pl, ctx) {
            ctx.freeze(pl);
            ctx.lookAtTarget(pl);
            playAnim$6(pl, 'animation.weapon.uchigatana.attack1.heavy');
        },
        onAct(pl, ctx) {
            playSoundAll$5(`weapon.woosh.2`, pl.pos, 1);
            ctx.selectFromRange(pl, {
                radius: 3,
                angle: 180,
                rotation: -90,
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 24,
                    direction: 'right',
                });
            });
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl);
        },
        timeline: {
            3: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 1, 90),
            6: (pl, ctx) => ctx.trap(pl, { tag: 'feint' }),
            7: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 1, 90),
            25: (pl, ctx) => ctx.trap(pl, { tag: 'counter' }),
        },
        transitions: {
            block: {
                onBlock: null
            },
            jodanKamae: {
                onEndOfLife: {
                    hasTarget: true
                }
            },
            resume: {
                onTrap: {
                    tag: 'feint',
                    preInput: 'onFeint'
                },
                onEndOfLife: {
                    hasTarget: false
                },
            },
            attack2Heavy: {
                onTrap: {
                    tag: 'counter',
                    preInput: 'onUseItem'
                }
            },
            hurt: {
                onHurt: null
            },
            parried: {
                onParried: null
            },
        }
    };
    attack2 = {
        cast: 3,
        backswing: 12,
        onEnter(pl, ctx) {
            ctx.freeze(pl);
            playAnim$6(pl, 'animation.weapon.uchigatana.attack2');
            ctx.adsorbOrSetVelocity(pl, 1.5, 90, 1);
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl);
        },
        onAct(pl, ctx) {
            playSoundAll$5('weapon.woosh.2', pl.pos);
            ctx.selectFromRange(pl, {
                radius: 2.6,
                angle: 40,
                rotation: 20,
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 18,
                    direction: 'vertical',
                });
            });
        },
        transitions: {
            resume: {
                onEndOfLife: null
            },
            hurt: {
                onHurt: null
            },
            blocked: {
                onBlocked: null
            },
            parried: {
                onParried: null
            }
        }
    };
    attack2Heavy = {
        cast: 3,
        backswing: 12,
        onEnter(pl, ctx) {
            ctx.freeze(pl);
            playAnim$6(pl, 'animation.weapon.uchigatana.attack2.heavy');
            ctx.adsorbOrSetVelocity(pl, 1.5, 90, 1);
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl);
        },
        onAct(pl, ctx) {
            playSoundAll$5('weapon.woosh.2', pl.pos);
            ctx.selectFromRange(pl, {
                radius: 2.6,
                angle: 40,
                rotation: 20,
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 25,
                    permeable: true,
                    direction: 'vertical',
                });
            });
        },
        transitions: {
            resume: {
                onEndOfLife: null
            },
            hurt: {
                onHurt: null
            },
            parried: {
                onParried: null
            }
        }
    };
}
class UchigatanaModule extends DefaultTrickModule$4 {
    constructor() {
        super('rgb39.weapon.empty_hand', 'hold', ['weapon:uchigatana', 'weapon:morphidae'], new UchigatanaMoves());
    }
}
const tricks$2 = new UchigatanaModule();

var uchigatana = /*#__PURE__*/Object.freeze({
	__proto__: null,
	tricks: tricks$2
});

var require$$7$1 = /*@__PURE__*/getAugmentedNamespace(uchigatana);

class DoubleBladeMoves extends DefaultMoves$4 {
    constructor() {
        super();
        this.animations.parry.left = 'animation.double_blade.parry.left';
        this.animations.block.left = 'animation.double_blade.block.left';
        this.animations.parry.right = 'animation.double_blade.parry.right';
        this.animations.block.right = 'animation.double_blade.block.right';
        this.setup('resume');
    }
    resume = {
        transitions: {
            hold: {
                onEndOfLife: {
                    hasTarget: true
                }
            },
            idle: {
                onEndOfLife: {
                    hasTarget: false
                }
            }
        }
    };
    idle = {
        cast: Infinity,
        onEnter(pl) {
            playAnim$6(pl, 'animation.double_blade.idle', 'animation.double_blade.idle');
        },
        transitions: {
            i2r: {
                onChangeSprinting: {
                    sprinting: true
                }
            },
            hurt: {
                onHurt: null
            },
            hold: {
                onLock: null
            },
        }
    };
    running = {
        cast: Infinity,
        onEnter(pl) {
            playAnim$6(pl, 'animation.double_blade.running', 'animation.double_blade.running');
        },
        transitions: {
            r2i: {
                onChangeSprinting: {
                    sprinting: false
                }
            },
            hurt: {
                onHurt: null
            },
        }
    };
    i2r = {
        cast: 5,
        onEnter(pl) {
            playAnim$6(pl, 'animation.double_blade.i2r');
        },
        transitions: {
            running: {
                onEndOfLife: null
            },
            r2i: {
                onChangeSprinting: {
                    sprinting: false
                }
            }
        }
    };
    r2i = {
        cast: 5,
        onEnter(pl) {
            playAnim$6(pl, 'animation.double_blade.r2i');
        },
        transitions: {
            idle: {
                onEndOfLife: null
            },
            i2r: {
                onChangeSprinting: {
                    sprinting: true
                }
            }
        }
    };
    hold = {
        cast: Infinity,
        onEnter(pl) {
            playAnim$6(pl, 'animation.double_blade.hold', 'animation.double_blade.hold');
        },
        transitions: {
            hurt: {
                onHurt: null
            },
            idle: {
                onReleaseLock: null
            },
            startLeft: {
                onAttack: {
                    stamina: 22,
                }
            },
            startRight: {
                onUseItem: {
                    stamina: 22,
                }
            },
            dodge: {
                onDodge: null
            },
            shield: {
                onSneak: null
            },
        }
    };
    startLeft = {
        cast: 13,
        backswing: 8,
        onEnter(pl, ctx) {
            ctx.status.isBlocking = true;
            ctx.components.getComponent(Stamina$1).unwrap().stamina -= 22;
            ctx.freeze(pl);
            ctx.lookAtTarget(pl);
            playAnim$6(pl, 'animation.double_blade.start_left');
            ctx.adsorbOrSetVelocity(pl, 0.5, 90, 1);
        },
        onLeave(pl, ctx) {
            ctx.status.isBlocking = false;
            ctx.unfreeze(pl);
        },
        onAct(pl, ctx) {
            ctx.trap(pl);
        },
        timeline: {
            4: (_, ctx) => {
                ctx.adsorbOrSetVelocity(_, 1.4, 90, 1);
                ctx.status.isBlocking = false;
            },
            5: pl => playSoundAll$5('weapon.woosh.2', pl.pos),
            8: (pl, ctx) => {
                ctx.selectFromRange(pl, {
                    angle: 40,
                    radius: 2.2,
                    rotation: -20
                }).forEach(en => {
                    ctx.attack(pl, en, {
                        damage: 18,
                        knockback: 0.8,
                        direction: 'left'
                    });
                });
            }
        },
        transitions: {
            resume: {
                onEndOfLife: null
            },
            hurt: {
                onHurt: null
            },
            parried: {
                onParried: null
            },
            blocked: {
                onBlocked: null
            },
            alternationLR: {
                onTrap: {
                    preInput: 'onUseItem',
                    stamina: 22,
                }
            },
            finishingL: {
                onTrap: {
                    preInput: 'onAttack',
                    stamina: 30,
                }
            },
            shield: {
                onTrap: {
                    preInput: 'onDodge',
                    stamina: 10,
                },
            },
            shieldFromBackswing: {
                onSneak: {
                    allowedState: 'backswing'
                },
            },
            block: {
                onBlock: null
            },
        }
    };
    startRight = {
        cast: 13,
        backswing: 8,
        onEnter(pl, ctx) {
            ctx.status.isWaitingParry = true;
            ctx.components.getComponent(Stamina$1).unwrap().stamina -= 22;
            ctx.freeze(pl);
            ctx.lookAtTarget(pl);
            playAnim$6(pl, 'animation.double_blade.start_right');
            ctx.adsorbOrSetVelocity(pl, 0.5, 90, 1);
        },
        onLeave(pl, ctx) {
            ctx.status.isWaitingParry = false;
            ctx.unfreeze(pl);
        },
        onAct(pl, ctx) {
            ctx.trap(pl);
        },
        timeline: {
            3: (_, ctx) => ctx.status.isWaitingParry = false,
            4: (_, ctx) => ctx.adsorbOrSetVelocity(_, 1.4, 90, 1),
            5: pl => playSoundAll$5('weapon.woosh.2', pl.pos),
            8: (pl, ctx) => ctx.selectFromRange(pl, {
                angle: 40,
                radius: 2.2,
                rotation: -20
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 18,
                    knockback: 0.8,
                    direction: 'right'
                });
            }),
        },
        transitions: {
            resume: {
                onEndOfLife: null
            },
            hurt: {
                onHurt: null
            },
            parried: {
                onParried: null
            },
            alternationRL: {
                onTrap: {
                    preInput: 'onAttack',
                    stamina: 22,
                }
            },
            kick: {
                onTrap: {
                    preInput: 'onUseItem',
                    stamina: 15,
                }
            },
            shield: {
                onTrap: {
                    preInput: 'onDodge',
                    stamina: 10,
                },
            },
            shieldFromBackswing: {
                onSneak: {
                    allowedState: 'backswing'
                },
            },
            parry: {
                onParry: null
            }
        }
    };
    alternationLR = {
        cast: 13,
        backswing: 8,
        onEnter(pl, ctx) {
            ctx.components.getComponent(Stamina$1).unwrap().stamina -= 22;
            ctx.freeze(pl);
            ctx.lookAtTarget(pl);
            playAnim$6(pl, 'animation.double_blade.lr');
            ctx.adsorbOrSetVelocity(pl, 1, 90, 1);
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl);
        },
        onAct(pl, ctx) {
            ctx.trap(pl);
        },
        timeline: {
            4: (_, ctx) => ctx.adsorbOrSetVelocity(_, 1.4, 90, 1),
            5: pl => playSoundAll$5('weapon.woosh.2', pl.pos),
            8: (pl, ctx) => ctx.selectFromRange(pl, {
                angle: 40,
                radius: 2.2,
                rotation: -20
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 23,
                    knockback: 0.8,
                    direction: 'right'
                });
            }),
        },
        transitions: {
            resume: {
                onEndOfLife: null
            },
            hurt: {
                onHurt: null
            },
            parried: {
                onParried: null
            },
            alternationRL: {
                onTrap: {
                    preInput: 'onAttack',
                    stamina: 22,
                }
            },
            kick: {
                onTrap: {
                    preInput: 'onUseItem',
                    stamina: 15,
                }
            },
            shield: {
                onTrap: {
                    preInput: 'onDodge',
                    stamina: 10,
                },
            },
            shieldFromBackswing: {
                onSneak: {
                    allowedState: 'backswing'
                },
            },
        }
    };
    alternationRL = {
        cast: 13,
        backswing: 8,
        onEnter(pl, ctx) {
            ctx.components.getComponent(Stamina$1).unwrap().stamina -= 22;
            ctx.freeze(pl);
            ctx.lookAtTarget(pl);
            playAnim$6(pl, 'animation.double_blade.rl');
            ctx.adsorbOrSetVelocity(pl, 1, 90, 1);
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl);
        },
        onAct(pl, ctx) {
            ctx.trap(pl);
        },
        timeline: {
            4: (_, ctx) => ctx.adsorbOrSetVelocity(_, 1.4, 90, 1),
            5: pl => playSoundAll$5('weapon.woosh.2', pl.pos),
            8: (pl, ctx) => ctx.selectFromRange(pl, {
                angle: 40,
                radius: 2.2,
                rotation: -20
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 23,
                    knockback: 0.8,
                    direction: 'left'
                });
            }),
        },
        transitions: {
            resume: {
                onEndOfLife: null
            },
            hurt: {
                onHurt: null
            },
            blocked: {
                onBlocked: null
            },
            parried: {
                onParried: null
            },
            alternationLR: {
                onTrap: {
                    preInput: 'onUseItem',
                    stamina: 22,
                },
            },
            finishingL: {
                onTrap: {
                    preInput: 'onAttack',
                    stamina: 30,
                },
            },
            shield: {
                onTrap: {
                    preInput: 'onDodge',
                    stamina: 10,
                },
            },
            shieldFromBackswing: {
                onSneak: {
                    allowedState: 'backswing'
                },
            },
        }
    };
    dodge = {
        cast: 3,
        backswing: 9,
        onEnter(pl, ctx) {
            ctx.components.getComponent(Stamina$1).unwrap().setCooldown(10);
            ctx.freeze(pl);
            playAnim$6(pl, 'animation.double_blade.dodge');
            ctx.setVelocity(pl, 180, 1);
        },
        onAct(_, ctx) {
            ctx.status.isDodging = true;
        },
        onLeave(_, ctx) {
            ctx.unfreeze(_);
            ctx.status.isDodging = false;
        },
        transitions: {
            resume: {
                onEndOfLife: null
            },
            hurt: {
                onHurt: null
            },
        }
    };
    finishingL = {
        cast: 14,
        backswing: 15,
        onEnter(pl, ctx) {
            ctx.components.getComponent(Stamina$1).unwrap().stamina -= 10;
            ctx.freeze(pl);
            playAnim$6(pl, 'animation.double_blade.ll');
            ctx.lookAtTarget(pl);
        },
        onLeave(pl, ctx) {
            ctx.status.hegemony = false;
            ctx.status.repulsible = true;
            ctx.unfreeze(pl);
        },
        onAct(pl, ctx) {
            ctx.components.getComponent(Stamina$1).unwrap().stamina -= 20;
            ctx.selectFromRange(pl, {
                angle: 120,
                radius: 2.8,
                rotation: -60
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 34,
                    damageType: 'entityAttack',
                    knockback: 1.5,
                    direction: 'left'
                });
            });
        },
        timeline: {
            3: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 1, 90, 1),
            11: (pl, ctx) => {
                ctx.adsorbOrSetVelocity(pl, 2, 90, 1);
                playSoundAll$5('weapon.woosh.3', pl.pos);
            },
            10: (pl, ctx) => ctx.trap(pl, { tag: 'fient' }),
            6: (_, ctx) => {
                ctx.status.hegemony = true;
                ctx.status.repulsible = false;
            },
            15: (_, ctx) => {
                ctx.status.hegemony = false;
                ctx.status.repulsible = true;
            }
        },
        transitions: {
            resume: {
                onEndOfLife: null,
                onTrap: {
                    tag: 'fient',
                    preInput: 'onFeint',
                }
            },
            hurt: {
                onHurt: null
            },
            parried: {
                onParried: null
            },
            blocked: {
                onBlocked: null
            },
        }
    };
    kick = {
        cast: 8,
        backswing: 12,
        onEnter(pl, ctx) {
            ctx.components.getComponent(Stamina$1).unwrap().stamina -= 10;
            ctx.freeze(pl);
            ctx.lookAtTarget(pl);
            playAnim$6(pl, 'animation.double_blade.rr');
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl);
        },
        onAct(pl, ctx) {
            ctx.selectFromRange(pl, {
                angle: 60,
                radius: 2,
                rotation: -30
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 1,
                    knockback: 1,
                    direction: 'middle',
                    stiffness: 700,
                    parryable: false,
                    permeable: true,
                });
            });
        },
        timeline: {
            4: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 2, 90, 0.8),
            14: (pl, ctx) => ctx.trap(pl),
        },
        transitions: {
            resume: {
                onEndOfLife: null
            },
            hurt: {
                onHurt: null
            },
            kickCombo: {
                onTrap: {
                    preInput: 'onAttack'
                }
            },
        }
    };
    kickCombo = {
        cast: 8,
        backswing: 15,
        onEnter(pl, ctx) {
            ctx.components.getComponent(Stamina$1).unwrap().stamina -= 25;
            ctx.freeze(pl);
            playAnim$6(pl, 'animation.double_blade.rrl');
            ctx.adsorbOrSetVelocity(pl, 1, 90, 1);
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl);
        },
        onAct(pl, ctx) {
            ctx.selectFromRange(pl, {
                angle: 120,
                radius: 2.8,
                rotation: -60
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 22,
                    direction: 'left',
                });
            });
        },
        timeline: {
            5: (pl, ctx) => {
                ctx.adsorbOrSetVelocity(pl, 1.4, 90, 1);
                playSoundAll$5('weapon.woosh.2', pl.pos);
            },
        },
        transitions: {
            resume: {
                onEndOfLife: null
            },
            hurt: {
                onHurt: null
            },
            parried: {
                onParried: null
            },
        }
    };
    shield = {
        cast: 15,
        onEnter(pl, ctx) {
            ctx.status.isBlocking = true;
            ctx.components.getComponent(Stamina$1).unwrap().stamina -= 10;
            ctx.freeze(pl);
            const prevStatus = ctx.previousStatus;
            if (prevStatus === 'shieldCounter') {
                playAnim$6(pl, 'animation.double_blade.counter_shield');
                ctx.adsorbOrSetVelocity(pl, 1, 90, 1);
            }
            else if (prevStatus.includes('RL') || prevStatus === 'startLeft') {
                playAnim$6(pl, 'animation.double_blade.shield_left');
            }
            else if (prevStatus.includes('LR') || prevStatus === 'startRight') {
                playAnim$6(pl, 'animation.double_blade.shield_right');
                ctx.adsorbOrSetVelocity(pl, 0.5, 90, 1);
            }
            else {
                playAnim$6(pl, 'animation.double_blade.shield');
            }
        },
        onLeave(pl, ctx) {
            ctx.status.isBlocking = false;
            ctx.unfreeze(pl);
        },
        timeline: {
            10: (_, ctx) => ctx.status.isBlocking = false,
        },
        transitions: {
            resume: {
                onEndOfLife: null
            },
            hurt: {
                onHurt: null
            },
            shieldSuccess: {
                onBlock: null
            },
        }
    };
    shieldSuccess = {
        cast: 5,
        backswing: 9,
        onEnter(pl, ctx) {
            ctx.status.isBlocking = true,
                ctx.components.getComponent(Stamina$1).unwrap().stamina += 30;
            ctx.freeze(pl);
            playSoundAll$5('weapon.sword.hit2', pl.pos);
            playAnim$6(pl, 'animation.double_blade.shield_success');
            ctx.lookAtTarget(pl);
        },
        onLeave(pl, ctx) {
            ctx.status.isBlocking = false;
            ctx.unfreeze(pl);
        },
        onAct(_, ctx) {
            ctx.status.isBlocking = false;
        },
        timeline: {
            7: (_, ctx) => ctx.trap(_),
        },
        transitions: {
            resume: {
                onEndOfLife: null
            },
            hurt: {
                onHurt: null
            },
            shieldSuccess: {
                onBlock: null
            },
            shieldCounter: {
                onTrap: {
                    preInput: 'onUseItem'
                }
            },
            shieldFromBackswing: {
                onSneak: {
                    allowedState: 'backswing'
                }
            }
        }
    };
    shieldCounter = {
        cast: 8,
        backswing: 12,
        onEnter(pl, ctx) {
            ctx.components.getComponent(Stamina$1).unwrap().stamina -= 25;
            ctx.freeze(pl);
            playAnim$6(pl, 'animation.double_blade.shield_counter');
        },
        onLeave(pl, ctx) {
            ctx.unfreeze(pl);
        },
        onAct(pl, ctx) {
            ctx.selectFromRange(pl, {
                angle: 60,
                radius: 2.8,
                rotation: -30
            }).forEach(en => {
                ctx.attack(pl, en, {
                    damage: 25,
                    direction: 'vertical',
                });
            });
        },
        timeline: {
            3: (pl, ctx) => ctx.adsorbOrSetVelocity(pl, 1, 90, 1),
            5: pl => playSoundAll$5('weapon.woosh.3', pl.pos),
            14: (pl, ctx) => ctx.trap(pl),
        },
        transitions: {
            resume: {
                onEndOfLife: null,
            },
            hurt: {
                onHurt: null
            },
            parried: {
                onParried: null,
            },
            shield: {
                onTrap: {
                    preInput: 'onDodge',
                    stamina: 10,
                }
            },
        }
    };
    shieldFromBackswing = {
        cast: 15,
        onEnter(pl, ctx) {
            ctx.components.getComponent(Stamina$1).unwrap().stamina -= 10;
            ctx.freeze(pl);
            playAnim$6(pl, 'animation.double_blade.shield');
        },
        onLeave(pl, ctx) {
            ctx.status.isBlocking = false;
            ctx.unfreeze(pl);
        },
        timeline: {
            3: (_, ctx) => ctx.status.isBlocking = true,
            10: (_, ctx) => ctx.status.isBlocking = false,
        },
        transitions: {
            resume: {
                onEndOfLife: null
            },
            hurt: {
                onHurt: null
            },
            shieldSuccess: {
                onBlock: null
            },
        }
    };
}
class DoubleBlade extends DefaultTrickModule$4 {
    constructor() {
        super('rgb:double_blade', 'idle', [
            'weapon:double_blade',
            'weapon:db_morphidae',
        ], new DoubleBladeMoves());
    }
}
const tricks$1 = new DoubleBlade();

var double_blade = /*#__PURE__*/Object.freeze({
	__proto__: null,
	tricks: tricks$1
});

var require$$8$1 = /*@__PURE__*/getAugmentedNamespace(double_blade);

class StaffMoves extends DefaultMoves$4 {
    constructor() {
        super();
        this.setup('resume');
    }
    resume = {
        transitions: {
            idle: {
                onEndOfLife: {
                    hasTarget: false
                }
            },
            hold: {
                onEndOfLife: {
                    hasTarget: true
                }
            },
        }
    };
    idle = {
        cast: Infinity,
        onEnter(pl) {
            playAnim$6(pl, 'animation.weapon.staff.idle', 'animation.weapon.staff.idle');
        },
        transitions: {
            transI2R: {
                onChangeSprinting: {
                    sprinting: true
                },
            },
            hold: {
                onLock: null
            },
            hurt: {
                onHurt: null
            },
        }
    };
    transI2R = {
        cast: 4,
        onEnter(pl) {
            playAnim$6(pl, 'animation.weapon.staff.trans.i2r');
        },
        transitions: {
            running: {
                onEndOfLife: null
            },
            transR2I: {
                onChangeSprinting: {
                    sprinting: false
                }
            },
            hurt: {
                onHurt: null
            },
        }
    };
    transR2I = {
        cast: 4,
        onEnter(pl) {
            playAnim$6(pl, 'animation.weapon.staff.trans.r2i');
        },
        transitions: {
            idle: {
                onEndOfLife: null
            },
            transI2R: {
                onChangeSprinting: {
                    sprinting: true
                }
            },
            hurt: {
                onHurt: null
            },
        }
    };
    running = {
        cast: Infinity,
        onEnter(pl) {
            playAnim$6(pl, 'animation.weapon.staff.running', 'animation.weapon.staff.running');
        },
        transitions: {
            transR2I: {
                onChangeSprinting: {
                    sprinting: false
                }
            },
            hurt: {
                onHurt: null
            },
        }
    };
    hold = {
        cast: Infinity,
        onEnter(pl) {
            playAnim$6(pl, 'animation.weapon.staff.hold', 'animation.weapon.staff.hold');
        },
        transitions: {
            idle: {
                onReleaseLock: null,
            },
            hurt: {
                onHurt: null,
            },
        }
    };
}
class StaffModule extends DefaultTrickModule$4 {
    constructor() {
        super('rgb:staff', 'idle', ['weapon:staff'], new StaffMoves());
    }
}
const tricks = new StaffModule();

var staff = /*#__PURE__*/Object.freeze({
	__proto__: null,
	tricks: tricks
});

var require$$9 = /*@__PURE__*/getAugmentedNamespace(staff);

var collection = [
    double_dagger,
    emptyHand,
    lightSaber,
    moon_glaive,
    require$$4,
    sheathed_katana,
    require$$6$1,
    require$$7$1,
    require$$8$1,
    require$$9,
];

var collection$1 = /*@__PURE__*/getDefaultExportFromCjs(collection);

function checkCompleteness(mod) {
    if (!mod.sid || !mod.bind || !mod.entry || !mod.moves) {
        return '缺少必要的属性: sid | bind | entry | moves';
    }
    if (!Object.keys(mod.moves).includes(mod.entry)) {
        return `无效的 entry: '${mod.entry}'`;
    }
    return false;
}

const { remote: remote$1 } = requireSetup();

async function knockback$3(en, x, z, h, v) {
    return await remote$1.call('knockback', en.uniqueId, x, z, h, v)
}

async function impulse$1(en, x, y, z) {
    return await remote$1.call('impulse', en.uniqueId, x, y, z)
}

async function clearVelocity$1(en) {
    return await remote$1.call('clearVelocity', en.uniqueId)
}

async function applyKnockbackAtVelocityDirection$1(en, h, v) {
    return await remote$1.call('applyKnockbackAtVelocityDirection', en.uniqueId, h, v)
}

async function rotate(en, pitch, yaw) {
    return await remote$1.call('rotate', en.uniqueId, pitch, yaw)
}

async function faceTo(src, t) {
    return await remote$1.call('faceTo', src.uniqueId, t.uniqueId)
}

var kinematics$1 = {
    knockback: knockback$3, impulse: impulse$1, clearVelocity: clearVelocity$1, applyKnockbackAtVelocityDirection: applyKnockbackAtVelocityDirection$1, rotate, faceTo
};

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

function _damageLL$1(victim, damage) {
    victim.hurt(damage, ActorDamageCause.EntityAttack);
}

var combat$1 = {
    damage, _damageLL: _damageLL$1,
};

const kinematics = kinematics$1;
const combat = combat$1;

var func = {
    kinematics, combat,
};

function vec2$2(x1, y1, x2, y2) {
    const dx = x2 - x1,
        dy = y2 - y1;
    return {
        dx, dy,
        m: Math.sqrt(dx * dx + dy * dy)
    }
}

function getAngleFromVector2$1(v1, v2) {
    const dotProduct = v1.dx * v2.dx + v1.dy * v2.dy;
    const angle = dotProduct / (v1.m * v2.m);

    return Math.acos(angle)
}

function rotate2$1(v, rad) {
    const { dx, dy, m } = v;
    const x = dx * Math.cos(rad) - dy * Math.sin(rad);
    const y = dx * Math.sin(rad) + dy * Math.cos(rad);
    return {
        dx: x, dy: y, m
    }
}

function multiply2$1(v, factor) {
    const { dx, dy } = v;
    return vec2$2(0, 0, dx*factor, dy*factor)
}

function minus(a, b) {
    return vec2$2(
        0, 0,
        a.dx - b.dx,
        a.dy - b.dy
    )
}

function vec2ToAngle(v) {
    let angle = getAngleFromVector2$1(v, vec2$2(0, 0, 0, -1));

    if (v.dx < 0) {
        angle = -angle;
    }
    
    return angle
}

var vec = {
    vec2: vec2$2, getAngleFromVector2: getAngleFromVector2$1, rotate2: rotate2$1, multiply2: multiply2$1, minus,
    vec2ToAngle, 
};

const { vec2: vec2$1, getAngleFromVector2 } = vec;

const defaultRange = {
    angle: 60,
    rotation: -30,
    radius: 2.5
};

function selectFromRange$2(pl, range) {
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

    const v1 = vec2$1(sx, sz, tx, tz)
        ,v2 = vec2$1(sx, sz, Tx, Tz)
        ,rangeAngle = getAngleFromVector2(v1, v2);

    const result = [];

    mc.getOnlinePlayers().concat(mc.getAllEntities()).forEach(e => {
        const dist = pl.distanceTo(e.pos);

        if (dist > radius) {
            return
        }

        if (dist <= 1) {
            result.push(e);
            return
        }

        const v = vec2$1(sx, sz, e.pos.x, e.pos.z);
        const angle = getAngleFromVector2(v1, v);

        if (!isNaN(angle) && angle <= rangeAngle) {
            result.push(e);
        }
    });

    return result.filter(e => e.uniqueId !== pl.uniqueId)
}

var range = {
    selectFromRange: selectFromRange$2, defaultRange,
};

var require$$0 = /*@__PURE__*/getAugmentedNamespace(camera$3);

var require$$5 = /*@__PURE__*/getAugmentedNamespace(status);

const { CameraComponent } = require$$0;
const { Status: Status$2 } = require$$5;
const { rotate2, vec2, multiply2 } = vec;

const cameraInput$1 = (pl, enabled=true) => {
    mc.runcmdEx(`inputpermission set "${pl.name}" camera ${enabled ? 'enabled' : 'disabled'}`);
};

const camera$2 = (pl, easeTime, easeType, pos, lookAt) => {
    mc.runcmdEx(`camera "${pl.name}" set minecraft:free ease ${easeTime} ${easeType} pos ${pos.x} ${pos.y} ${pos.z} facing ${lookAt.x} ${lookAt.y} ${lookAt.z}`);
};

const cameraRot = (pl, easeTime, easeType, pos, rotX, rotY) => {
    mc.runcmdEx(`camera "${pl.name}" set minecraft:free ease ${easeTime} ${easeType} pos ${pos.x} ${pos.y} ${pos.z} rot ${0} ${rotY}`); 
};

function clearCamera$2(pl) {
    mc.runcmdEx(`camera "${pl.name}" set meisterhau:battle`);
}

const ROT = Math.PI * 1;
const ANGLE = 180 / Math.PI;

const battleCameraMiddlePoint = (pl, en) => {
    const plPos = pl.pos;
    const enPos = en.pos;
    const initVec = vec2(plPos.x, plPos.z, enPos.x, enPos.z);
    const dist = initVec.m;
    const offsetZ = 1.5;
    const offsetX = 5;
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

    camera$2(pl, 0.1, 'linear', cameraPos, { ...middlePoint, y: cameraPos.y });
};

const battleCamera$1 = (pl, en) => {
    if (!pl) {
        return
    }

    const plPos = pl.pos;
    const enPos = en.pos;
    const initVec = vec2(plPos.x, plPos.z, enPos.x, enPos.z);
    const dist = initVec.m;
    const manager = Status$2.get(pl.uniqueId).componentManager;
    const cameraComponentOpt = manager.getComponent(CameraComponent);
    if (cameraComponentOpt.isEmpty()) {
        return
    }

    const cameraComponent = cameraComponentOpt.unwrap();
    const [ offsetX, offsetY, offsetZ ] = cameraComponent.offset;
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
        y: plPos.y - .2 + offsetY,
    };

    // camera(pl, 0.1, 'linear', cameraPos, {
    //     x: enPos.x,
    //     z: enPos.z,
    //     y: cameraPos.y
    // })
    const cameraEntityVec = {
        x: enPos.x - cameraPos.x,
        z: enPos.z - cameraPos.z,
        y: cameraPos.y
    };

    const yaw = Math.atan2(cameraEntityVec.z, cameraEntityVec.x) * ANGLE - 90;
    const pitch = (Math.atan2(Math.sqrt(cameraEntityVec.x * cameraEntityVec.x + cameraEntityVec.z * cameraEntityVec.z), cameraEntityVec.y)) * ANGLE;
    const [ dYaw, dPitch ] = cameraComponent.rot;
    cameraRot(pl, 0.1, 'linear', cameraPos, pitch + dPitch, yaw + dYaw);
};

var camera_1 = {
    battleCamera: battleCamera$1, battleCameraMiddlePoint, cameraInput: cameraInput$1, clearCamera: clearCamera$2
};

const { knockback: knockback$2 } = kinematics$1;


const setVelocity$2 = (pl, rotation, h, v) => {
    const { yaw } = pl.direction;
    const rad = (yaw + rotation) * Math.PI / 180.0;
    knockback$2(pl, Math.cos(rad), Math.sin(rad), h, v);
};

function isCollide$1(pl) {
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

var kinematic = {
    setVelocity: setVelocity$2, isCollide: isCollide$1
};

let TargetLock$1 = class TargetLock extends BaseComponent {
    source;
    target;
    get sourcePlayer() {
        return Optional$1.some(mc.getPlayer(this.source));
    }
    get targetIsPlayer() {
        return !this.target.isEmpty() && ('xuid' in this.target.unwrap());
    }
    constructor(source, target = Optional$1.none()) {
        super();
        this.source = source;
        this.target = target;
    }
    onAttach(manager) {
        this.sourcePlayer.use(p => {
            mc.runcmdEx(`/inputpermission set ${p.name} jump disabled`);
            mc.runcmdEx(`/inputpermission set ${p.name} sneak disabled`);
        });
    }
    onDetach(manager) {
        this.sourcePlayer.use(p => {
            mc.runcmdEx(`/inputpermission set ${p.name} jump enabled`);
            mc.runcmdEx(`/inputpermission set ${p.name} sneak enabled`);
        });
    }
};

var targetLock = /*#__PURE__*/Object.freeze({
	__proto__: null,
	TargetLock: TargetLock$1
});

var require$$6 = /*@__PURE__*/getAugmentedNamespace(targetLock);

var require$$7 = /*@__PURE__*/getAugmentedNamespace(optional);

var HudComponent_1;
let HudComponent = class HudComponent extends BaseComponent {
    static { HudComponent_1 = this; }
    content;
    type;
    fadeIn;
    fadeOut;
    stay;
    static symbols = {
        sword: '⚔',
        bodyTech: '✴',
        trace: '↪',
    };
    static id = 0;
    static create({ content, type, fadeIn, fadeOut, stay } = {}) {
        return new HudComponent_1(content, type, fadeIn, fadeOut, stay);
    }
    id = HudComponent_1.id++;
    constructor(content = '', type = 4, fadeIn = 10, fadeOut = 10, stay = 50) {
        super();
        this.content = content;
        this.type = type;
        this.fadeIn = fadeIn;
        this.fadeOut = fadeOut;
        this.stay = stay;
    }
    onTick(manager, pl) {
        this.renderHud(pl);
    }
    renderHud(pl) {
        pl.unwrap()
            .setTitle(this.content, this.type, this.fadeIn, this.fadeOut, this.stay);
        // .tell(this.content, 5)
    }
};
HudComponent = HudComponent_1 = __decorate([
    PublicComponent('hud'),
    Fields(['content', 'type', 'fadeIn', 'fadeOut', 'stay'])
], HudComponent);

var DamageModifier_1;
let DamageModifier$1 = class DamageModifier extends BaseComponent {
    static { DamageModifier_1 = this; }
    static defaultModifier = 0.2;
    static defaultModifierOpt = new DamageModifier_1(DamageModifier_1.defaultModifier);
    static create({ modifier }) {
        return new DamageModifier_1(modifier);
    }
    #modifier = DamageModifier_1.defaultModifier;
    get modifier() {
        return this.#modifier;
    }
    constructor(modifier = DamageModifier_1.defaultModifier) {
        super();
        this.#modifier = modifier;
    }
};
DamageModifier$1 = DamageModifier_1 = __decorate([
    PublicComponent('damage-modifier'),
    Fields(['modifier'])
], DamageModifier$1);

var damageModifier = /*#__PURE__*/Object.freeze({
	__proto__: null,
	get DamageModifier () { return DamageModifier$1; }
});

var HardmodeComponent_1;
let HardmodeComponent = class HardmodeComponent extends BaseComponent {
    static { HardmodeComponent_1 = this; }
    static damageModifier = 0.6;
    static create() {
        return new HardmodeComponent_1();
    }
    shouldRemoveDamageModifier = false;
    onAttach(manager) {
        if (manager.getComponent(DamageModifier$1).isEmpty()) {
            this.shouldRemoveDamageModifier = true;
            manager.attachComponent(new DamageModifier$1(HardmodeComponent_1.damageModifier));
        }
    }
    onDetach(manager) {
        if (this.shouldRemoveDamageModifier) {
            manager.detachComponent(DamageModifier$1);
        }
    }
};
HardmodeComponent = HardmodeComponent_1 = __decorate([
    PublicComponent('hardmode')
], HardmodeComponent);

var StatusHud_1;
let StatusHud$1 = StatusHud_1 = class StatusHud extends HudComponent {
    constructor(content = '', type = 4, fadeIn = 0, fadeOut = 0, stay = 2) {
        super(content, type, fadeIn, fadeOut, stay);
    }
    static create({ content, type, fadeIn, fadeOut, stay } = {}) {
        return new StatusHud_1(content, type, fadeIn, fadeOut, stay);
    }
    targetLock = Optional$1.none();
    targetStamina = Optional$1.none();
    stamina = Optional$1.none();
    onAttach(manager) {
        if ((this.targetLock = manager.getComponent(TargetLock$1)).isEmpty()) {
            return true;
        }
        if ((this.stamina = manager.getComponent(Stamina$1)).isEmpty()) {
            return true;
        }
        manager.beforeTick(() => {
            const lock = this.targetLock.unwrap();
            if (!lock.targetIsPlayer) {
                return;
            }
            const target = lock.target.unwrap();
            this.targetStamina = Status$3.get(target.uniqueId).componentManager.getComponent(Stamina$1);
        });
    }
    renderStatus() {
        if (this.targetLock.isEmpty()) {
            return;
        }
        const lock = this.targetLock.unwrap();
        const target = lock.target.unwrap();
        const isPlayer = lock.targetIsPlayer;
        const { health, maxHealth, name } = target;
        const contents = [];
        const shortName = name.length > 13 ? name.substring(0, 13) + '…' : name;
        contents.push(shortName);
        contents.push(`§${health / maxHealth < 0.3 ? '4' : 'a'}❤ ${isPlayer
            ? this.intProgress(health * 5, maxHealth * 5)
            : this.intProgress(health, maxHealth)}§r`);
        if (!this.targetStamina.isEmpty()) {
            const { stamina, maxStamina } = this.targetStamina.unwrap();
            contents.push(`§${stamina / maxStamina < 0.3 ? '6' : 'f'}⚡⚡ ${this.intProgress(stamina, maxStamina)}§r`);
        }
        else {
            contents.push('');
        }
        if (!this.stamina.isEmpty()) {
            const { stamina, maxStamina } = this.stamina.unwrap();
            const repeatCount = Math.round(stamina / maxStamina * 20);
            const progressbar = '▮'.repeat(repeatCount) + '§0' + '▮'.repeat(20 - repeatCount);
            contents.push(`§${stamina / maxStamina < 0.3 ? '3' : '9'}${progressbar}§r`);
        }
        this.content = contents.join('\n');
    }
    intProgress(val, total) {
        return String(Math.round(val)).padStart(3, ' ') + '/'
            + String(Math.round(total)).padEnd(3, ' ');
    }
    onTick(manager, pl) {
        if (!manager.has(HardmodeComponent)) {
            this.renderStatus();
            this.renderHud(pl);
        }
    }
};
StatusHud$1 = StatusHud_1 = __decorate([
    PublicComponent('status-hud'),
    Fields(['content', 'type', 'fadeIn', 'fadeOut', 'stay'])
], StatusHud$1);

var statushud = /*#__PURE__*/Object.freeze({
	__proto__: null,
	get StatusHud () { return StatusHud$1; }
});

var require$$8 = /*@__PURE__*/getAugmentedNamespace(statushud);

const { selectFromRange: selectFromRange$1 } = range;
const { battleCamera, cameraInput, clearCamera: clearCamera$1 } = camera_1;
const { knockback: knockback$1 } = kinematics$1;
const { setVelocity: setVelocity$1 } = kinematic;
const { DEFAULT_POSTURE_SPEED: DEFAULT_POSTURE_SPEED$1, DEFAULT_SPEED: DEFAULT_SPEED$1 } = require$$2$2;
const { Status: Status$1 } = require$$5;
const { TargetLock } = require$$6;
const { Optional } = require$$7;
const { StatusHud } = require$$8;

const locks = new Map();
const cooldowns = new Set();

function lockTarget(src, target) {
    const pl = mc.getPlayer(src);

    if (cooldowns.has(pl.uniqueId)) {
        return
    }

    if (target) {
        // cameraInput(pl, false)
        locks.set(src, target);
        pl.setMovementSpeed(DEFAULT_POSTURE_SPEED$1);
        Status$1.get(src).componentManager.attachComponent(
            new TargetLock(src, Optional.some(target)),
            new StatusHud(),
        );
    } else {
        clearCamera$1(pl);
    }
}

function releaseTarget$1(src) {
    const pl = mc.getPlayer(src);
    const manager = Status$1.get(src).componentManager;
    manager.detachComponent(StatusHud);
    manager.detachComponent(TargetLock);
    cameraInput(pl);
    clearCamera$1(pl);
    locks.delete(src);
    pl.setMovementSpeed(DEFAULT_SPEED$1);
    cooldowns.add(pl.uniqueId);
    setTimeout(() => cooldowns.delete(pl.uniqueId), 500);
}

function toggleLock$1(src) {
    if (locks.has(src)) {
        releaseTarget$1(src);
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

function lookAt$1(pl, en) {
    if (!en) {
        return releaseTarget$1(pl)
    }

    const [ yaw, pitch ] = getAngle(pl, en);

    pl.teleport(pl.feetPos, new DirectionAngle(0, yaw));
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

function lookAtTarget$1(pl) {
    const en = locks.get(pl.uniqueId);
    if (!en) {
        return
    }
    lookAt$1(pl, en);
}

function hasLock$2(pl) {
    return locks.has(pl.uniqueId)
}

function adsorbTo$1(pl, en, max, offset=2) {
    const dist = en.distanceTo(pl.pos) - offset;

    knockback$1(
        pl,
        en.pos.x - pl.pos.x,
        en.pos.z - pl.pos.z,
        Math.min(dist, max),
        0
    );
}

function adsorbToTarget$1(pl, max, offset) {
    const en = locks.get(pl.uniqueId);
    if (!en) {
        return
    }

    adsorbTo$1(pl, en, max, offset);
}

function adsorbOrSetVelocity$1(pl, max, velocityRot=90, offset=1.5) {
    const en = locks.get(pl.uniqueId);
    if (en) {
        // lookAtTarget(pl)
        adsorbToTarget$1(pl, max, offset);
        return
    }

    setVelocity$1(pl, velocityRot, max, -1);
}

function distanceToTarget$1(pl) {
    const en = locks.get(pl.uniqueId);

    if (!en) {
        return Infinity
    }

    return en.distanceTo(pl.pos)
}

const onTick$1 = em => () => {
    locks.forEach(async (t, s) => {
        const _s = mc.getPlayer(s);

        if (t.health) {
            battleCamera(_s, t);
        } else if (_s) {
            em.emitNone('onReleaseLock', _s, _s.getHand().type);
            releaseTarget$1(s);
        }
    });
};

const ignoreEntities = [
    'minecraft:item',
    'minecraft:xp_orb',
];

function getClosedEntity(en) {
    let closed = null
        ,dist = Infinity;

    selectFromRange$1(en, {
        radius: 10,
        angle: 46,
        rotate: -23,
    }).forEach(e => {
        if (ignoreEntities.includes(e.type)) {
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

var lock = {
    onTick: onTick$1, getClosedEntity, lockTarget, releaseTarget: releaseTarget$1, toggleLock: toggleLock$1,
    lookAt: lookAt$1, lookAtTarget: lookAtTarget$1, distanceToTarget: distanceToTarget$1, hasLock: hasLock$2, adsorbToTarget: adsorbToTarget$1,
    adsorbTo: adsorbTo$1, adsorbOrSetVelocity: adsorbOrSetVelocity$1
};

const { DEFAULT_POSTURE_SPEED, DEFAULT_SPEED } = require$$2$2;
const { hasLock: hasLock$1 } = lock;

function movement$1(pl, enabled=true) {
    if (!enabled) {
        return pl.setMovementSpeed(0), undefined
    }

    pl.setMovementSpeed(
        hasLock$1(pl) ? DEFAULT_POSTURE_SPEED : DEFAULT_SPEED
    );
}

function movementInput$1(pl, enabled=true) {
    mc.runcmdEx(`inputpermission set "${pl.name}" movement ${enabled ? 'enabled' : 'disabled'}`);
}

function camera$1(pl, enabled=true) {
    mc.runcmdEx(`inputpermission set "${pl.name}" camera ${enabled ? 'enabled' : 'disabled'}`);
}

var generic = {
    movement: movement$1, camera: camera$1, movementInput: movementInput$1
};

const tasks = new Map();

let Task$1 = class Task {
    constructor(uniqueId) {
        if (!tasks.get(uniqueId)) {
            tasks.set(uniqueId, this);
        }
    }

    /**
     * @param {string} uniqueId 
     * @returns {Task}
     */
    static get(uniqueId) {
        return tasks.get(uniqueId) || new Task(uniqueId)
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
};

var task = {
    Task: Task$1
};

requireEvents();

let EventInputStream$1 = class EventInputStream {
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
};

var eventStream = {
    EventInputStream: EventInputStream$1
};

var require$$12 = /*@__PURE__*/getAugmentedNamespace(tick);

var require$$13 = /*@__PURE__*/getAugmentedNamespace(cameraFading);

var require$$14 = /*@__PURE__*/getAugmentedNamespace(damageModifier);

function registerCommand$1() {
    cmd('components', '管理组件', 1).setup(register => {
        register('add <pl:player> <name:string> [args:json]', (_, __, output, args) => {
            const targets = args.pl;
            const jsonArgs = args.args;
            const componentCtor = getComponentCtor(args.name);
            if (!componentCtor || !('create' in componentCtor)) {
                return output.error('无效的组件名');
            }
            try {
                const _args = jsonArgs ? JSON.parse(jsonArgs) : undefined;
                const component = componentCtor.create(_args);
                for (const target of targets) {
                    Status$3.get(target.uniqueId).componentManager.attachComponent(component);
                }
                output.success(`已为 ${targets.length} 个玩家添加组件 '${args.name}'`);
            }
            catch (_) {
                output.error('无效的组件参数');
            }
        });
        register('remove <pl:player> <name:string>', (_, __, output, args) => {
            const targets = args.pl;
            const componentCtor = getComponentCtor(args.name);
            if (!componentCtor || !componentCtor.create) {
                return output.error('无效的组件名');
            }
            for (const terget of targets) {
                Status$3.get(terget.uniqueId).componentManager.detachComponent(componentCtor);
            }
            output.success(`已为 ${targets.length} 个玩家移除组件 '${args.name}'`);
        });
        register('list <pl:player> [detail:bool]', async (_, ori, output, args) => {
            const pl = args.pl;
            const useDetail = args.detail ?? false;
            for (const p of pl) {
                const status = Status$3.get(p.uniqueId);
                if (!status) {
                    continue;
                }
                const componentManager = status.componentManager;
                const componentNames = Array.from(componentManager.getComponentKeys())
                    .map(ctor => {
                    const id = getComponentId(ctor);
                    if (useDetail) {
                        return id ? `${ctor.name} (${id})` : ctor.name;
                    }
                    return id;
                })
                    .filter(id => id);
                if (componentNames.length === 0) {
                    output.success('玩家没有组件');
                    continue;
                }
                output.success(`玩家 ${p.name} 拥有组件:\n${componentNames.join('\n')}`);
            }
        });
        register('check <pl:player> <name:string>', (_, __, output, args) => {
            const componentCtor = getComponentCtor(args.name);
            if (!componentCtor) {
                return output.error('无效的组件名');
            }
            for (const pl of args.pl) {
                const status = Status$3.get(pl.uniqueId);
                if (!status) {
                    continue;
                }
                const component = status.componentManager.getComponent(componentCtor);
                if (component.isEmpty()) {
                    output.success(`玩家 '${pl.name}' 没有此组件`);
                    continue;
                }
                const checkableEntries = getFieldEntries(component.unwrap());
                if (!checkableEntries) {
                    output.success('此组件没有检查项');
                    continue;
                }
                const entries = [];
                for (const [k, v] of checkableEntries.muts) {
                    entries.push(`  ${k} = ${JSON.stringify(v)}`);
                }
                for (const [k, v] of checkableEntries.lets) {
                    entries.push(`  §9${k}§r = ${JSON.stringify(v)}`);
                }
                if (entries.length === 0) {
                    output.success('此组件没有检查项');
                }
                else {
                    output.success(`${pl.name} 的组件 ${args.name}:\n${entries.join('\n')}`);
                }
            }
        });
        register('update <pl:player> <name:string> <args:json>', (_, __, output, args) => {
            const { pl, args: jsonArgs, name } = args;
            const componentCtor = getComponentCtor(name);
            if (!componentCtor) {
                return output.error('无效的组件名');
            }
            for (const target of pl) {
                const manager = Status$3.get(target.uniqueId).componentManager;
                manager.update(componentCtor, component => {
                    const _args = jsonArgs ? JSON.parse(jsonArgs) : undefined;
                    const { muts } = getFieldEntries(component) || {};
                    if (muts) {
                        muts.forEach(([k]) => {
                            const newVal = _args[k];
                            if (newVal) {
                                component[k] = newVal;
                            }
                        });
                    }
                });
            }
        });
    });
}

var commands = /*#__PURE__*/Object.freeze({
	__proto__: null,
	registerCommand: registerCommand$1
});

var require$$15 = /*@__PURE__*/getAugmentedNamespace(commands);

class Scheduler extends BaseComponent {
    period;
    offset = 0;
    update = false;
    constructor(period = 1) {
        super();
        this.period = period;
    }
    onAttach() {
        this.offset = Tick$1.tick;
    }
    onTick() {
        this.update = (Tick$1.tick - this.offset) % this.period === 0;
    }
}

var HealthModifier_1;
let HealthModifier = HealthModifier_1 = class HealthModifier extends RequireComponents([Scheduler, 20], Timer) {
    delta;
    duration;
    scheduler;
    timer;
    deltaTick;
    atom = 0;
    remain;
    constructor(delta, duration) {
        super();
        this.delta = delta;
        this.duration = duration;
        this.remain = delta;
        this.deltaTick = delta / duration * 20;
        this.scheduler = this.getComponent(Scheduler);
        this.timer = this.getComponent(Timer);
        this.timer.rest = duration;
    }
    onTick(manager, pl) {
        if (!this.scheduler.update) {
            return;
        }
        const player = pl.unwrap();
        if (this.timer.done) {
            player.setHealth(player.health + this.atom);
            manager.beforeTick(() => {
                this.scheduler.detach(manager);
                this.detach(manager);
            });
            return;
        }
        this.remain += this.deltaTick;
        if (this.deltaTick < 0) {
            if (this.atom <= -1) {
                this.atom += 1;
                player.setHealth(player.health - 1);
            }
            else {
                this.atom += this.deltaTick;
            }
        }
        else {
            if (this.atom >= 1) {
                this.atom -= 1;
                player.setHealth(player.health + 1);
            }
            else {
                this.atom += this.deltaTick;
            }
        }
    }
    static create({ delta, duration }) {
        return new HealthModifier_1(delta, duration);
    }
};
HealthModifier = HealthModifier_1 = __decorate([
    PublicComponent('health-modifier'),
    Fields(['remain'], ['delta', 'duration'])
], HealthModifier);

function antiTreeshaking$1() {
    return [
        HudComponent,
        HealthModifier,
        HardmodeComponent,
    ];
}

var antiTreeshaking$2 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	antiTreeshaking: antiTreeshaking$1
});

var require$$16 = /*@__PURE__*/getAugmentedNamespace(antiTreeshaking$2);

var require$$17 = /*@__PURE__*/getAugmentedNamespace(stamina);

var setupExports = requireSetup();

var eventsExports = requireEvents();

var serverExports = requireServer();

var ButtonState;
(function (ButtonState) {
    ButtonState["Pressed"] = "Pressed";
    ButtonState["Released"] = "Released";
})(ButtonState || (ButtonState = {}));
function eventCenter$1(opt) {
    const em = new eventsExports.EventEmitter(opt);
    setupExports.remote.expose('input.press.jump', (name) => {
        const player = mc.getPlayer(name);
        if (player) {
            em.emit('input.jump', mc.getPlayer(name), true);
        }
    });
    setupExports.remote.expose('input.release.jump', (name) => {
        const player = mc.getPlayer(name);
        if (player) {
            em.emit('input.jump', mc.getPlayer(name), false);
        }
    });
    setupExports.remote.expose('input.press.sneak', (name) => {
        const player = mc.getPlayer(name);
        if (player) {
            em.emit('input.sneak', mc.getPlayer(name), true);
        }
    });
    setupExports.remote.expose('input.release.sneak', (name) => {
        const player = mc.getPlayer(name);
        if (player) {
            em.emit('input.sneak', mc.getPlayer(name), false);
        }
    });
    return em;
}
var input$1;
(function (input) {
    function isPressing(pl, button) {
        return serverExports.inputStates.get(pl.name)?.[button] ?? false;
    }
    input.isPressing = isPressing;
    function movementVector(pl) {
        const inputInfo = serverExports.inputStates.get(pl.name);
        if (!inputInfo) {
            return { x: 0, y: 0 };
        }
        return { x: inputInfo.x, y: inputInfo.y };
    }
    input.movementVector = movementVector;
    function moveDir(pl) {
        const yaw = pl.direction.yaw;
        const vx = Math.cos(yaw);
        const vy = Math.sin(yaw);
        const vdir = { x: vx, y: vy };
        vec.vec2ToAngle(vdir) * 180 / Math.PI - pl.direction.yaw;
        console.log(vdir, movementVector(pl));
        return 1;
    }
    input.moveDir = moveDir;
})(input$1 || (input$1 = {}));

var input$2 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	get ButtonState () { return ButtonState; },
	eventCenter: eventCenter$1,
	get input () { return input$1; }
});

var require$$18 = /*@__PURE__*/getAugmentedNamespace(input$2);

var Team_1;
let Team$1 = class Team extends BaseComponent {
    static { Team_1 = this; }
    name;
    static players = new Map();
    constructor(name = 'default') {
        super();
        this.name = name;
    }
    static create({ name }) {
        return new Team_1(name);
    }
    onAttach() {
        this.getEntity().use(pl => {
            const players = Team_1.players.get(this) || new Set();
            players.add(pl);
            Team_1.players.set(this, players);
        });
    }
    onDetach() {
        this.getEntity().use(pl => {
            const players = Team_1.players.get(this);
            if (players) {
                players.delete(pl);
            }
        });
    }
};
Team$1 = Team_1 = __decorate([
    PublicComponent('team'),
    Fields(['name'])
], Team$1);

var team = /*#__PURE__*/Object.freeze({
	__proto__: null,
	get Team () { return Team$1; }
});

var require$$19 = /*@__PURE__*/getAugmentedNamespace(team);

const { knockback, clearVelocity, impulse, applyKnockbackAtVelocityDirection } = kinematics$1;
const { combat: { damage: _damage, _damageLL } } = func;
const { playAnim, playParticle } = require$$2$2;
const { movement, camera, movementInput } = generic;
const { selectFromRange } = range;
const { Status, defaultAcceptableInputs } = require$$5;
const { Task } = task;
const { EventInputStream } = eventStream;
const {
    lookAt, lookAtTarget, distanceToTarget, adsorbToTarget, adsorbTo,
    onTick, toggleLock, hasLock, releaseTarget, adsorbOrSetVelocity
} = lock;
const { setVelocity, isCollide } = kinematic;
const { clearCamera } = camera_1;
const { Tick } = require$$12;
const { CameraFading } = require$$13;
const { DamageModifier } = require$$14;
const { registerCommand } = require$$15;
const { antiTreeshaking } = require$$16;
const { Stamina } = require$$17;
const { eventCenter, input } = require$$18;
const { Team } = require$$19;

const em = eventCenter({ enableWatcher: true });
const es = EventInputStream.get(em);

const yawToVec2 = yaw => {
    const rad = yaw * Math.PI / 180.0;
    return {
        x: Math.cos(rad),
        y: Math.sin(rad)
    }
};

function damageWithCameraFading(victim, damage, cause, abuser, projectile, damageOpt) {
    CameraFading.fadeFromAttackDirection(abuser, damageOpt);
    // _damage(victim, damage, cause, abuser, projectile)
    _damageLL(victim, damage);

    const victimPos = victim.feetPos;
    const abuserPos = abuser.feetPos;
    const dpos = {
        x: 0.7 * victimPos.x + 0.3 * abuserPos.x,
        z: 0.7 * victimPos.z + 0.3 * abuserPos.z,
    };

    setTimeout(() => {
        playParticle(`weapon:hit_${damageOpt.direction || 'left'}`, {
            x: dpos.x,
            y: abuserPos.y + 1.2,
            z: dpos.z,
            dimid: victimPos.dimid
        });
    }, 100);
}

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

const playerOverrideEvents = [
    'onUseItem',
    'onAttack',
    'onChangeSprinting',
];
const mobEvents = [
    // 'onMobHurt',
    'onProjectileHitEntity',
];
// const customEvents = [
//     'onParry', 'onParried', 'onEndOfLife', 'onHurt', 'onBlocked', 'onBlock', 'onHit'
// ]

/**@type {Map<string, Status>}*/

/**@type {(pl: any) => Status}*/
const _status = pl => Status.get(pl.uniqueId);

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
    // const previusPos = {
    //     x: pl.feetPos.x,
    //     z: pl.feetPos.z
    // }
    // const uniqueId = pl.uniqueId

    // return new Promise(res => {
    //     setTimeout(() => {
    //         const currentPos = mc.getPlayer(uniqueId).feetPos
    //         const movVec = vec2(currentPos.x, currentPos.z, previusPos.x, previusPos.z)
    //         let rot = vec2ToAngle(movVec) * 180 / Math.PI - pl.direction.yaw

    //         rot = rot < -180 ? rot + 360
    //             : rot > 190 ? rot - 360 : rot

    //         const direct = isNaN(rot) ? 0
    //             : rot < -135 ? 3
    //                 : rot < -45 ? 4
    //                     : rot < 45 ? 1
    //                         : rot < 135 ? 2 : 3
            
    //         res(direct)
    //     }, 50);
    // })
    return input.moveDir(pl)
}

/**
 * @param {MovementContext} mixins
 * @returns {MovementContext}
 */
function _ctx(pl, mixins={}) {
    const status = _status(pl);
    return {
        camera,
        movement,
        movementInput,
        selectFromRange,
        knockback,
        attack,
        freeze,
        unfreeze,
        status,
        components: status.componentManager,
        clearVelocity,
        impulse,
        setVelocity,
        yawToVec2,
        applyKnockbackAtVelocityDirection,
        task: Task.get(pl.uniqueId),
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
    const status = Status.get(pl.uniqueId);
    const hand = pl.getHand()?.type ?? 'minecraft:air';
    
    status.hand = hand;
    return status
}

const pick = (obj, arr) =>
    arr.reduce((iter, val) => (val in obj && (iter[val] = obj[val]), iter), {});

const playerAttrPickList = [
    'inAir', 'inWater', 'inLava', 'inRain', 'inSnow', 'inWall', 'inWaterOrRain', 'isInvisible', 'isHungry',
    'isOnFire', 'isOnGround', 'isOnHotBlock', 'isGliding', 'isFlying', 'isMoving'
];

/**
 * @param {Player} pl
 * @param {Status} status 
 * @returns 
 */
const defaultPacker = (pl, bind, status) => {
    const allowedState = checkMoveState(bind, status);
    const picked = pick(pl, playerAttrPickList);
    const stamina = status.componentManager.getComponent(Stamina).unwrap();

    /**@type {TransitionOptMixins}*/
    const mixins = {
        stamina: stamina.stamina,
        hasTarget: hasLock(pl),
        repulsible: status.repulsible,
        isCollide: false,//isCollide(pl),
        preInput: status.preInput,
        isSneaking: input.isPressing(pl, 'sneak'),
        isDodging: input.isPressing(pl, 'jump'),
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
        const status = Status.get(args[0].uniqueId);
        return {
            preInput: status.preInput
        }
    },
    onTrap([pl, data]) {
        const status = Status.get(pl.uniqueId);
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

        if (k === 'stamina') {
            const val = data[k];
            if (val < v) {
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

/**
 * @param {any} pl 
 * @param {TrickModule} bind 
 * @param {Status} status 
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
        cond,
        candidates = [];

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
        data = Object.assign(data, dataPacker(args));
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
        
        // return em.once('onTick', () => transition(pl, bind, status, 'onEndOfLife', prevent, args))
        transition(pl, bind, status, 'onEndOfLife', prevent, args);
        return
    }

    if (currentMove.onLeave) {
        currentMove.onLeave(pl, _ctx(pl, {
            rawArgs: args,
            prevent,
            nextStatus: next
        }));
    }

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
 * @param {Status} _status 
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
    s.reset();
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
            const previousMainhand = playerMainhanded.get(pl.uniqueId);
            const previousOffhand = playerOffhanded.get(pl.uniqueId);

            if (mainhand !== previousMainhand) {
                em.emitNone('onChangeMainhand', pl, mainhand, previousMainhand);
                playerMainhanded.set(pl.uniqueId, mainhand);
            }

            if (offhand !== previousOffhand) {
                em.emitNone('onChangeOffhand', pl, offhand, previousOffhand);
                playerOffhanded.set(pl.uniqueId, offhand);
            }
        });
    });

    em.on('onChangeMainhand', (pl, hand, old) => {
        const status = Status.get(pl.uniqueId);
        const oldBind = getMod(old);

        if (!status) {
            return
        }

        releaseTarget(pl.uniqueId);

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
        for (const [uniqueId, status] of Status.status.entries()) {
            if (typeof uniqueId !== 'string') {
                return
            }

            if (uniqueId === 'global_status') {
                continue
            }

            const pl = mc.getPlayer(uniqueId);
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
        Tick.tick++;

        for (const [uniqueId, status] of Status.status.entries()) {
            if (typeof uniqueId !== 'string') {
                return
            }

            if (uniqueId === 'global_status') {
                continue
            }

            const pl = mc.getPlayer(uniqueId);
            const bind = getMod(status.hand);

            if (!pl ||!bind) {
                return
            }

            const currentMove = bind.moves[status.status];
            const duration = status.duration++;

            if (!currentMove) {
                status.status = 'unknown';
                return transition(pl, bind, status, '', Function.prototype, [ pl ])
            }

            const _context = _ctx(pl);

            if (currentMove.onTick) {
                currentMove.onTick(
                    pl,
                    _context,
                    duration/((currentMove.cast || 0) + (currentMove.backswing || 0))
                );
            }

            if (currentMove.timeline) {
                const handler = currentMove.timeline[duration];
                if (handler?.call) {
                    handler.call(null, pl, _context);
                }
            }

            status.componentManager.handleTicks(pl);

            if (duration >= (currentMove.cast || 0) + (currentMove.backswing || 0)) {
                if (currentMove.onLeave) {
                    currentMove.onLeave(pl, _context);
                }
                return transition(pl, bind, status, 'onEndOfLife', Function.prototype, [ pl ])
            }

            if (duration == currentMove.cast) {
                if (currentMove.onAct) {
                    currentMove.onAct(pl, _context);
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
        stiffness: 500,
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

        const victimIsEntity = !victim.xuid;
        const abuserStatus = Status.get(abuser.uniqueId);

        if (victimIsEntity) {
            transition(
                abuser,
                getMod(getHandedItemType(abuser)),
                abuserStatus,
                'onHit',
                Function.prototype,
                [ abuser, victim, damageOpt ]
            );

            return damageWithCameraFading(
                victim,
                damage,
                damageType,
                abuser,
                damagingProjectile,
                damageOpt,
            )
        }

        const victimPlayer = victimIsEntity ? victim.toPlayer() : victim;
        const victimStatus = Status.get(victimPlayer.uniqueId);

        const _knockback = (h, repulsible) => {
            if (powerful || repulsible) {
                const abuserPos = abuser.pos;
                const victimPos = victim.pos;
                knockback(victim, victimPos.x - abuserPos.x, victimPos.z - abuserPos.z, h, -2);
                return
            }

            if (victimPlayer.gameMode === 1) {
                return
            }

            knockback(victim, 0, 0, 0, -2);
        };
        const doDamage = () => {
            _knockback(_k, victimStatus.repulsible);
            victimStatus.shocked = shock;

            const modifier = victimStatus.componentManager
                .getComponent(DamageModifier)
                .orElse(DamageModifier.defaultModifierOpt).modifier;
            const actualDamage = damage * modifier;

            em.emitNone('hurt', abuser, victimPlayer, {
                ...damageOpt,
                damage: actualDamage, 
                damageType: 'override',
            });
        };

        if (!victimStatus) {
            return doDamage()
        }

        const victimTeam = victimStatus.componentManager.getComponent(Team);
        const abuserTeam = abuserStatus.componentManager.getComponent(Team);
        if (!victimTeam.isEmpty() && !abuserTeam.isEmpty() && victimTeam.unwrap().name === abuserTeam.unwrap().name) {
            return
        }

        if (victimStatus.isWaitingDeflection && !permeable && !powerful) {
            return em.emitNone('deflect', abuser, victimPlayer, damageOpt)
        }

        if (victimStatus.isDodging && !trace) {
            return em.emitNone('dodge', abuser, victimPlayer, damageOpt)
        }

        if (victimStatus.isWaitingParry && parryable) {
            return em.emitNone('parried', abuser, victimPlayer, damageOpt)
        }

        if (victimStatus.isBlocking && !permeable) {
            _knockback(_k * 0.4, victimStatus.repulsible);
            return em.emitNone('block', abuser, victimPlayer, damageOpt)
        }

        
        doDamage();
    });

    em.on('deflect', (abuser, victim, damageOpt) => {
        const aStatus = Status.get(abuser.uniqueId);
        transition(
            abuser,
            getMod(aStatus.hand),
            aStatus,
            'onMissAttack',
            Function.prototype,
            [abuser, victim, damageOpt]
        );

        const vStatus = Status.get(victim.uniqueId);
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
        const aStatus = Status.get(abuser.uniqueId);
        transition(
            abuser,
            getMod(aStatus.hand),
            aStatus,
            'onMissAttack',
            Function.prototype,
            [abuser, victim, damageOpt]
        );

        const vStatus = Status.get(victim.uniqueId);
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
        const aStatus = Status.get(abuser.uniqueId);
        transition(
            abuser,
            getMod(aStatus.hand),
            aStatus,
            'onParried',
            Function.prototype,
            [abuser, victim, damageOpt]
        );

        const vStatus = Status.get(victim.uniqueId);
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
            Status.get(abuser.uniqueId),
            'onBlocked',
            Function.prototype,
            [abuser, victim, damageOpt]
        );

        transition(
            victim,
            getMod(getHandedItemType(victim)),
            Status.get(victim.uniqueId),
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
            Status.get(abuser.uniqueId),
            'onHit',
            Function.prototype,
            [abuser, victim, damageOpt]
        );

        let flag = true,
            prevent = () => flag = false;

        const victimStatus = Status.get(victim.uniqueId);

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
            damageWithCameraFading(victim, damage, damageType, abuser, damagingProjectile, damageOpt);
        }
    });

    em.on('onHurtByEntity', (victim, abuser, damageOpt, prevent) => {
        transition(
            victim,
            getMod(getHandedItemType(victim)),
            Status.get(victim.uniqueId),
            'onHurtByMob',
            prevent,
            [ victim, abuser, damageOpt ]
        );
    });

    em.on('knockdown', (abuser, victim, knockbackStrength, time=30) => {
        const aStatus = Status.get(abuser.uniqueId);
        const aMod = getMod(aStatus.hand);

        const vStatus = Status.get(victim.uniqueId);
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
        const status = Status.get(pl.uniqueId);

        if (!bind || !status) {
            return
        }

        transition(pl, bind, status, 'onReleaseLock', Function.prototype, [ pl ]);
    });

    em.on('onLock', (pl, hand, target) => {
        const bind = getMod(hand);
        const status = Status.get(pl.uniqueId);

        if (!bind || !status) {
            return
        }

        transition(pl, bind, status, 'onLock', Function.prototype, [ pl, target ]);
    });

    em.on('onFeint', (pl, hand, prevent) => {
        const bind = getMod(hand);
        const status = Status.get(pl.uniqueId);

        if (!bind || !status) {
            return
        }

        transition(pl, bind, status, 'onFeint', prevent, [ pl ]);
    });

    em.on('trap', (pl, data) => {
        const status = Status.get(pl.uniqueId);
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

        const status = Status.get(args[0].uniqueId);
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

    // playerEvents.forEach(n => {
    //     mc.listen(n, (...args) => {
    //         let cancelEvent = false,
    //         prevent = () => cancelEvent = true
            
    //         let pl = args[0]
    //         es.put(n, [pl, prevent, args])

    //         return !cancelEvent
    //     })

    //     em.on(n, acceptableStreamHandler(n))
    // })
    em.on('input.sneak', (pl, isSneaking) => {
        es.put(isSneaking ? 'onSneak' : 'onReleaseSneak', [pl, Function.prototype, [ pl, isSneaking ]]);
    });
    em.on('onSneak', acceptableStreamHandler('onSneak'));
    em.on('onReleaseSneak', acceptableStreamHandler('onReleaseSneak'));

    mc.listen('onUseItem', (...args) => {
        const [ pl, item ] = args;

        if (!mods.has(item.type)) {
            return true
        }

        if (!hasLock(pl)) {
            const val = toggleLock(pl.uniqueId);
            pl.setSprinting(false);
            if (val) {
                em.emitNone('onLock', pl, item.type, val);
            }

            return false
        }

        let cancelEvent = false,
        prevent = () => cancelEvent = true;
        es.put('onUseItem', [pl, prevent, args]);

        return !cancelEvent
    });

    mc.listen('onChangeSprinting', (...args) => {
        const pl = args[0];
        if (hasLock(pl)) {
            if (toggleLock(pl.uniqueId) === null) {
                const mod = getMod(getHandedItemType(pl));
                const status = Status.get(pl.uniqueId);

                clearCamera(pl);
                initCombatComponent(pl, mod, status);
                transition(pl, mod, status, 'onChangeSprinting', Function.prototype, args);
            }

            return false
        }

        let cancelEvent = false,
        prevent = () => cancelEvent = true;
        es.put('onChangeSprinting', [pl, prevent, args]);

        return !cancelEvent
    });

    // mc.listen('onJump', pl => {
    //     if (hasLock(pl)) {
    //         if (toggleLock(pl.uniqueId) === null) {
    //             em.emitNone('onReleaseLock', pl, pl.getHand().type, null)
    //             pl.tell('不要在锁定后跳跃')
    //             clearCamera(pl)
    //             initCombatComponent(pl, getMod(getHandedItemType(pl)), Status.get(pl.uniqueId))
    //         }
    //     }
    // })
    
    em.on('input.jump', (pl, press) => {
        if (press) {
            em.emitNone(hasLock(pl) ? 'onDodge' : 'onJump', pl, pl.getHand().type, null);
        }
    });

    em.on('onDodge', acceptableStreamHandler('onDodge'));

    playerOverrideEvents.forEach(n => em.on(n, acceptableStreamHandler(n)));

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

    mc.listen('onOpenContainer', () => {
        // console.log(pl)
    });

    mc.listen('onOpenContainerScreen', pl => {
        if (hasLock(pl)) {
            let cancel = true;
            es.put('onFeint', [ pl, Function.prototype, [ pl ] ]);

            return !cancel
        }
    });

    mc.listen('onRide', rider => {
        if (!rider.isPlayer()) {
            return true
        }

        const pl = rider.toPlayer();

        if (mods.has(pl.getHand().type) && !input.isPressing(pl, 'sneak')) {
            return false
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
        const status = Status.get(pl.uniqueId);

        status.acceptableInput('onAttack', false);
        setTimeout(() => {
            status.acceptableInput('onAttack', true);
        }, 300);
        return false
    });

    mc.listen('onTick', () => em.emitNone('onTick'));

    mc.listen('onRespawn', pl => {
        setTimeout(() => {
            unfreeze(pl);
            clearCamera(pl);
            initCombatComponent(pl, getMod(getHandedItemType(pl)), Status.get(pl.uniqueId));
        }, 300);
    });

    mc.listen('onLeft', pl => {
        Status.status.delete(pl.uniqueId);
    });

    mc.listen('onPlayerDie', pl => {
        releaseTarget(pl.uniqueId);
    });

    listenAllCustomEvents(mods);
    registerCommand();
}

function getHandedItemType(pl) {
    return pl.getHand().type
}

antiTreeshaking();

var core = {
    emitter: em, listenAllMcEvents, 
};

async function loadAll() {
    //@ts-ignore
    const mods = Array.from(collection$1).map(({ tricks }) => tricks);
    const result = [0, 0];
    core.listenAllMcEvents(mods);
    mods.forEach(mod => loadModule(mod, result));
    console.log(`加载了 ${mods.length} 个模块，成功 ${result[1]} 个，失败 ${result[0]}`);
}
function loadModule(mod, flags) {
    let errMessage;
    if (errMessage = checkCompleteness(mod)) {
        console.error(`${("'" + mod.sid + "'") || '一个'} 模块加载失败${errMessage ? ': ' + errMessage : ''}`);
        flags[0]++;
        return false;
    }
    flags[1]++;
}

function setup() {
    try {
        loadAll();
    }
    catch (error) {
        log(error + '');
    }
}

var init = /*#__PURE__*/Object.freeze({
	__proto__: null,
	setup: setup
});

var require$$2 = /*@__PURE__*/getAugmentedNamespace(init);

const { load } = loadModule$1;

mc.listen('onServerStarted',() => [
    requireSetup(),
    require$$2,
].forEach(m => load(m)));

module.exports = meisterhau;
