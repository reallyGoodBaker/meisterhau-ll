'use strict';

var events$1 = require('events');
var fs = require('fs');
var http = require('http');
var qs = require('querystring');

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

var yuumo = {};

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

var loadModule = {
    load: load$1
};

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
                .filter(v => args[v])
                .filter(v => !v.startsWith('enum'));
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
const serverStarted = (function () {
    let serverRunning = false;
    return (() => {
        if (serverRunning) {
            return Promise.resolve(null);
        }
        const { promise, resolve } = Promise.withResolvers();
        mc.listen('onServerStarted', () => {
            resolve(null);
            serverRunning = true;
        });
        return promise;
    });
})();
function cmd$6(head, desc, perm = CommandPermission.OP) {
    const command = mc.newCommand(head, desc, perm);
    const registry = new Registry(command);
    const register = (...args) => { registry.register.apply(registry, args); };
    const configRegister = (cmd, handler) => {
        registry.register.call(registry, cmd, (_, ori, out, args) => {
            try {
                const result = handler(args, (ori.entity?.type === 'player' ? ori.player : ori.entity));
                if (Array.isArray(result)) {
                    result.forEach(r => out.addMessage(String(r)));
                    return;
                }
                out.success(String(result));
            }
            catch (error) {
                out.error(String(error));
            }
        });
    };
    return {
        setup: async (executor) => {
            await executor.call(undefined, register, registry);
            if (!registry.isSubmitted()) {
                await serverStarted();
                registry.submit();
            }
        },
        getRegistry: () => registry,
        configure: async (executor) => {
            await executor.call(undefined, configRegister, registry);
            if (!registry.isSubmitted()) {
                await serverStarted();
                registry.submit();
            }
        },
    };
}

var command = /*#__PURE__*/Object.freeze({
	__proto__: null,
	get CommandPermission () { return CommandPermission; },
	Registry: Registry,
	cmd: cmd$6,
	serverStarted: serverStarted
});

var require$$0 = /*@__PURE__*/getAugmentedNamespace(command);

function buildContextOpener(builder, contextSender, onCancelHandlerArgIndex) {
    return (...args) => {
        const onCancelHandler = args[onCancelHandlerArgIndex] || (() => { });
        args[onCancelHandlerArgIndex] = (...args) => {
            const val = onCancelHandler.apply(null, args);
            contextSender(args[0]);
            return val
        };

        return builder.apply(null, args)
    }
}

function openAlert(sender) {
    return buildContextOpener(alert$6, sender, 5)
}

function openAction(sender) {
    return buildContextOpener(action$6, sender, 3)
}

function openWidget(sender) {
    return buildContextOpener(widget$6, sender, 2)
}

function uiReturnValBuilder(sender) {
    return {
        send: sender,
        open: buildContextOpener,
        openAlert: openAlert(sender),
        openAction: openAction(sender),
        openWidget: openWidget(sender),
    }
}

function alert$6(title, content, button1, buton2, onEnsure = Function.prototype, onReject = Function.prototype, onCancel = Function.prototype) {
    let ret = null;
    const sender = pl => {
        let isUserAction = false;
        setTimeout(() => {
            isUserAction = true;
        }, 300);
        pl.sendModalForm(title, content, button1, buton2, (_, confirmed) => {
            if (!isUserAction) {
                return onCancel.call(ret, pl)
            }
            
            if (confirmed) {
                return onEnsure.call(ret, pl), undefined
            }
    
            return onReject.call(ret, pl), undefined
        });
    };
    return ret = uiReturnValBuilder(sender)
}

/**
 * @param {string} title 
 * @param {string} content 
 * @param {Array<{text: string; icon?: string; onClick: (err: any, pl: any)=>void}>} buttonGroup 
 * @param {Function} onerror 
 * @returns 
 */
function action$6(title, content, buttonGroup = [], onerror = Function.prototype) {
    const buttons = [],
        images = [],
        handlers = [];

    buttonGroup.forEach(conf => {
        const { text, icon, onClick } = conf;
        buttons.push(text);
        images.push(icon || '');
        handlers.push(onClick);
    });

    let ret = null;
    const sender = pl => {
        pl.sendSimpleForm(
            title, content,
            buttons, images,
            (pl, i) => {
                if (i === null) {
                    return onerror.call(ret, -1, pl)
                }

                try {
                    handlers[i].call(ret, 0, pl);
                } catch (err) {
                    try {
                        onerror.call(ret, err, pl);
                    } catch (er) {
                        throw er
                    }
                }
            }
        );
    };

    return ret = uiReturnValBuilder(sender)
}

function widget$6(title, elements = [], onerror = Function.prototype) {
    const fm = mc.newCustomForm();
    const handlers = [];

    elements.forEach(el => {
        const { type, args, handler } = el;

        handlers.push(handler);
        fm[`add${type}`](...args);
    });

    fm.setTitle(title);

    let ret = null;
    const sender = pl => {
        pl.sendForm(fm, (_, data) => {
            if (data === null) {
                return onerror.call(ret, pl, -1)
            }

            if (!data) {
                try {
                    return onerror.call(ret, pl)
                } catch (err) {
                    throw err
                }
            }
    
            data.forEach((val, i) => {
                try {
                    handlers[i].call(ret, pl, val);
                } catch (err) {
                    try {
                        onerror.call(ret, pl, err);
                    } catch (err) {
                        throw err
                    }
                }
            });
        });
    };

    return ret = uiReturnValBuilder(sender)
}

/**
 * @param {string} type 
 * @param {Function} [handler] 
 * @returns 
 */
function basicBuilder(type, resolver = (pl, val, args) => [pl, val], useHandler = true) {
    return (...args) => {
        let handler = useHandler
            ? null
            : Function.prototype;

        if (typeof args[args.length-1] === 'function') {
            const _handler = args.pop();
            handler = (pl, val) => {
                const _args = resolver.call(null, pl, val, args);
                _handler.apply(null, _args);
            };
        }

        return {
            type, args, handler
        }
    }
}

var ui = {
    alert: alert$6, action: action$6, widget: widget$6,

    /**@type {(text: string) => any} */
    Label: basicBuilder('Label', undefined, false),

    /**@type {(title: string, placeholder?: string, defaultVal?: string, handler?: (pl: any, value: string) => void) => any} */
    Input: basicBuilder('Input'),

    /**@type {(title: string, defaultVal?: boolean, handler?: (pl: any, value: boolean) => void) => any} */
    Switch: basicBuilder('Switch'),

    /**@type {(title: string, items: string[], defaultVal?: number, handler?: (pl: any, value: number) => void) => any} */
    Dropdown: basicBuilder('Dropdown'),

    /**@type {(title: string, min: number, max: number, step?: number, defaultVal?: number, handler?: (pl: any, value: number) => void) => any} */
    Slider: basicBuilder('Slider'),

    /**@type {(title: string, items: string[], defaultVal?: number, handler?: (pl: any, value: string) => void) => any} */
    StepSlider: basicBuilder('StepSlider'),
};

const { cmd: cmd$5 } = require$$0;
const { alert: alert$5 } = ui;

function distStr(entity, dest, showDiff=true) {
    const pos = entity.blockPos;
    const distance = ~~entity.distanceTo(dest);

    const diff = `    |${dest.x - pos.x}, ${dest.y - pos.y}, ${dest.z - pos.z}|`;

    return distance + (showDiff ? diff : '')
}

function setup$b() {
    cmd$5('whoami', '我是谁？', 0)
    .setup(register => {
        register('name', (cmd, ori, out) => {
            out.success(ori.entity.name);
        });
        register('type', (_, ori, out) => {
            out.success(ori.entity.type);
        });
        register('id <mob:entity>', (_, ori, out, args) => {
            const source = ori.player ?? ori.entity;
            const targets = args.mob;

            targets.forEach(t => {
                source.tell(t.uniqueId);
            });
        });
        register('dist <position:pos>', (_, ori, out, args) => {
            const dest = args.position;
            out.success(distStr(ori.entity, dest));
        });
        register('dist <mob:entity>', (_, ori, out, args) => {
            const source = ori.player ?? ori.entity;
            const targets = args.mob;
            
            for (const target of targets) {
                const dest = target.blockPos;
                if (!target.isPlayer()) {
                    out.success(distStr(source, dest));
                    continue
                }

                alert$5('', `${source.name} 想要知道你的位置，是否提供？`, '提供', '拒绝', () => {
                    source.tell(distStr(source, dest));
                }, () => {
                    source.tell(distStr(source, dest, false));
                }).send(target.toPlayer());
            }
        });
    });
}

var whoami = {
    setup: setup$b
};

var events = {};

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
let EventEmitter$2 = class EventEmitter {
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
};
events.EventEmitter = EventEmitter$2;
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

const {EventEmitter: EventEmitter$1} = events;
const eachTick = new EventEmitter$1();

mc.listen('onTick', () => {
    eachTick.emitNone('tick');
});

function tick(func) {
    eachTick.on('tick', func);
    return {
        cancel: () => {
            eachTick.removeListener('tick', func);
        }
    }
}

const playerCollideBox = {
    dx: 1,
    dy: 2,
    dz: 1
};

function nextPos(point, vec3) {
    return {
        x: point.x + vec3.dx,
        y: point.y + vec3.dy,
        z: point.z + vec3.dz
    }
}

/**
 * @param {any} mob
 * @param {{dx: number, dy: number, dz: number}} collideBox 
 * @param {{dx: number, dy: number, dz: number}} vec3 
 */
function setVelocity$1(mob, vec3, collideBox=playerCollideBox, resistance=0.05) {
    if (!mob) {
        return
    }

    let { cancel } = tick(() => {
        if (!mob) {
            cancel();

            return
        }

        const pos = mob.pos;
        const origin = nextPos({
            x: pos.x - 0.5,
            y: pos.y - 0.5,
            z: pos.z - 0.5,
        }, vec3);
        const restrict = {
            x: origin.x + collideBox.dx,
            y: origin.y + collideBox.dy,
            z: origin.z + collideBox.dz,
        };

        const originBlock = mc.getBlock(
            Math.round(origin.x),
            Math.round(origin.y),
            Math.round(origin.z),
            pos.dimid
        );
        const restrictBlock = mc.getBlock(
            Math.round(restrict.x),
            Math.round(restrict.y),
            Math.round(restrict.z),
            pos.dimid
        );

        if (!(originBlock?.isAir && restrictBlock?.isAir)) {
            cancel();

            return
        }

        console.log(1, mob.pos);
        mob.teleport(
            pos.x,
            pos.y - 1.6,
            pos.z,
            pos.dimid
        );
        console.log(2, mob.pos);

        vec3 = {
            dx: vec3.dx > resistance ? vec3.dx - resistance: 0,
            dy: vec3.dy > resistance ? vec3.dy - resistance: 0,
            dz: vec3.dz > resistance ? vec3.dz - resistance: 0,
        };
    });
}

var speed = {
    tick, setVelocity: setVelocity$1
};



//@ts-ignore
/*;
const 
    if (!(cond)) {
        return;
    }
    => {
    //#inline 
    if (!(cond)) {
        return;
    }
        if (!(cond)) {
        return;
    }
    //!inline
};
//@ts-ignore
*/;

const _listeners = new WeakMap();
function spawn(pos, name) {
    return mc.spawnSimulatedPlayer(name, pos);
}
function despawn(pl) {
    
    if (!(pl.isSimulatedPlayer)) {
        return;
    }
    
    pl.simulateDisconnect();
}
function listener(pl, listeners) {
    _listeners.set(pl, listeners);
}
function buildCallListener(type) {
    return (mob, ...args) => {
        if (!mob.isPlayer()) {
            return;
        }
        const pl = mob.toPlayer();
        if (!pl?.isSimulatedPlayer()) {
            return;
        }
        const listeners = _listeners.get(pl);
        if (!listeners) {
            return;
        }
        listeners[type]?.apply(pl, args);
    };
}
function listenMobEvent(type) {
    mc.listen(type, buildCallListener(type));
}
function setup$a() {
    cmd$6('simplayer', '假人', 1)
        .setup(register => {
        register('<pos:pos> <name:string>', (_, ori, out, { pos, name }) => {
            spawn(pos, name);
        });
        register('despawn <pl:player>', (_, ori, out, res) => {
            res.pl.forEach(sim => {
                despawn(sim);
            });
        });
    });
    listenMobEvent('onMobHurt');
    listenMobEvent('onMobDie');
}

var simulatePlayer = /*#__PURE__*/Object.freeze({
	__proto__: null,
	despawn: despawn,
	listener: listener,
	setup: setup$a,
	spawn: spawn
});

var require$$3 = /*@__PURE__*/getAugmentedNamespace(simulatePlayer);

const { cmd: cmd$4 } = require$$0;

const camera = (pl, easeTime, easeType, dPos, rot) => {
    mc.runcmdEx(`execute as "${pl.name}" at @s run camera @s set minecraft:free ease ${easeTime} ${easeType} pos ^${dPos.x} ^${dPos.y} ^${dPos.z} rot ${rot.pitch} ${rot.yaw}`);
    // mc.runcmdEx(`execute as "${pl.name}" at @s run camera @s set minecraft:free ease ${easeTime} ${easeType} rot ${rot.pitch} ${rot.yaw}`)
    // mc.runcmdEx(`execute as "${pl.name}" at @s run camera @s set minecraft:free ease ${easeTime} ${easeType} pos ^${dPos.x} ^${dPos.y} ^${dPos.z}`)
};

const trackingPlayers = new Map();

function clearCamera(pl) {
    trackingPlayers.delete(pl.uniqueId);
    mc.runcmdEx(`camera "${pl.name}" clear`);
}

function setOnShoulderCamera(uniqueId, left=false) {
    trackingPlayers.set(uniqueId, left);
}

function setup$9() {
    mc.listen('onTick', () => {
        trackingPlayers.forEach((left, uniqueId) => {
            const pl = mc.getPlayer(uniqueId);

            if (!pl) {
                return
            }

            const { yaw, pitch } = pl.direction;

            camera(pl, 0.1, 'linear', {
                x: left ? 1 : -1,
                y: 1.5,
                z: -2.5
            }, { yaw, pitch });
        });
    });

    cmd$4('overshoulder', '过肩视角', 0).setup(register => {
        register('clear', (_, ori) => {
            clearCamera(ori.player);
        });
        register('right', (_, ori) => {
            setOnShoulderCamera(ori.player.uniqueId);
        });
        register('left', (_, ori) => {
            setOnShoulderCamera(ori.player.uniqueId, true);
        });
    });
}

var overShoulder = {
    setup: setup$9,
    camera, clearCamera, setOnShoulderCamera
};

const {action: action$5, alert: alert$4, widget: widget$5, Switch: Switch$4, StepSlider: StepSlider$1, Input: Input$6, Dropdown: Dropdown$4} = ui;

function queryPlayer$1(realName) {
    for (const pl of mc.getOnlinePlayers()) {
        if (pl.realName === realName) {
            return pl
        }
    }

    return null
}

/**@type {Map<string, Notification[]>}*/
const playerNotifs = new Map();

const NotificationImportances$1 = {
    NORMAL: 0,
    IMPORTANT: 1
};

const NotificationTypes = {
    MESSAGE: 0,
    ACTION: 1,
    MODAL: 2
};

let Notification$1 = class Notification {
    importance = NotificationImportances$1.NORMAL
    type = NotificationTypes.MESSAGE
    title = ''
    preview = ''
    sound = 'random.orb'
    /**@type {string}*/
    content = null
    /**@private*/viewed = false
    /**@private*/notified = false
    /**@private*/timeStamp = ''
    /**@private*/expired = false
    onerror = () => {}

    /**@private*/_buildMsgNotification() {
        return `§l§e${this.title}\n§7${this.preview.replace(/§[\w]/gm, '')}`
    }

    /**@private*/_buildActionNotification() {
        let header = this._buildMsgNotification();

        if (!Array.isArray(this.content)) {
            return
        }

        const labelLen = this.content.length.toString().length;

        this.content.forEach(({text}, i) => {
            i += '';
            header += `\n§3${i.padStart(labelLen, ' ')} §b${text}$r`;
        });

        return header
    }

    /**@private*/_buildModalNotification() {
        let notif = `§l§e${this.title}$r`;

        this.content.map(({type, args}) => {
            if (type === 'Label') {
                notif += `\n${args[0]}`;
            }
        });

        return notif
    }

    _buildMessage() {
        return this.type === NotificationTypes.MODAL? this._buildModalNotification()
            : this.type === NotificationTypes.ACTION? this._buildActionNotification()
                : this._buildMsgNotification()
    }

    /**@private*/_notifyNormalMsg(pl) {
        pl.tell(this._buildMessage());
    }

    /**@private*/_notifyImportantMsg(pl) {
        this.viewed = true;

        if (this.type === NotificationTypes.MESSAGE) {
            const {btn1, btn2, onEnsure, onReject} = this.content;
            return alert$4(this.title, this.preview, btn1, btn2, onEnsure, onReject, () => {
                this.viewed = false;
                this._notifyNormalMsg(pl);
            }).send(pl)
        }

        if (this.type === NotificationTypes.ACTION) {
            return action$5(this.title, this.preview, this.content, (err, pl) => {
                if (err === -1) {
                    this.viewed = false;
                    return this._notifyNormalMsg(pl)
                }
                this.onerror(err, pl);
            }).send(pl)
        }

        if (this.type === NotificationTypes.MODAL) {
            return widget$5(this.title, this.content, (err, pl) => {
                if (err === -1) {
                    this.viewed = false;
                    return this._notifyNormalMsg(pl)
                }
                this.onerror(err, pl);
            }).send(pl)
        }
    }

    getListTilePreview() {
        const color = this.expired ? '§7§m'
            : this.viewed ? '§0' : '§b';
        return `${color + this.title}\n§8${this.timeStamp}`
    }

    displayFullContent(pl) {
        if (this.expired) {
            return pl.tell('该消息已过期')
        }
        this._notifyImportantMsg(pl);
    }

    expire() {
        this.expired = true;
    }

    notify(pl) {
        if (this.notified) {
            return
        }

        this.timeStamp = new Date().toLocaleString();

        this.importance === NotificationImportances$1.NORMAL ? this._notifyNormalMsg(pl)
            : this._notifyImportantMsg(pl);
    
        if (!pl.agent) {
            mc.runcmd(`playsound ${this.sound} ${pl.name}`);
            pl.tell('§a/inbox 查看详细内容');
        }

        if (!playerNotifs.has(pl.xuid)) {
            playerNotifs.set(pl.xuid, []);
        }

        playerNotifs.get(pl.xuid).unshift(this);

        this.notified = true;
    }
};

function regNotifComponent() {
    const inbox = mc.newCommand('inbox', '查看收件箱', 0);
    inbox.overload([]);
    inbox.setCallback((_, origin) => {
        const pl = origin.player;
        const notifs = playerNotifs.get(pl.xuid);

        if (!Array.isArray(notifs)) {
            return pl.tell('没有收到任何信息')
        }

        action$5('收件箱', `${notifs.length} 条消息`, notifs.map(notif => {
            return {
                text: notif.getListTilePreview(),
                onClick() {
                    notif.displayFullContent(pl);
                }
            }
        }), () => {}).send(pl);
    });
    inbox.setup();

    mc.regPlayerCmd('messenger', '发送消息', pl => {
        let shouldExpire = false
            ,importance = 0
            ,title = ''
            ,content = ''
            ,players = mc.getOnlinePlayers().map(pl => pl.realName).concat(['@a'])
            ,player = '';

        
        widget$5('编辑消息', [
            Dropdown$4('发送给:', players, 0, (_, i) => {
                player = players[i];
            }),

            Input$6('标题', '', title, (_, val) => {
                title = val;
            }),

            Input$6('内容', '', content, (_, val) => {
                content = val;
            }),

            Switch$4('阅后即焚', shouldExpire, (_, val) => {
                shouldExpire = val;
            }),

            StepSlider$1('重要程度', ['一般', '重要'], importance, (_, i) => {
                importance = i;

                function sendNotif(pl) {
                    const notif = new Notification$1();
                    notif.type = NotificationTypes.MESSAGE;
                    notif.title = title;
                    notif.preview = content;
                    notif.importance = importance;

                    const handler = () => {
                        if (shouldExpire) {
                            notif.expire();
                        }
                    };

                    notif.content = {
                        btn1: '确定', btn2: '取消',
                        onEnsure: handler,
                        onReject: handler
                    };

                    notif.notify(pl);
                }

                

                if (player === '@a') {
                    if (!pl.permLevel) {
                        alert$4('错误', '权限不足', '是', '取消').send(pl);
                        return
                    }
    
                    mc.getOnlinePlayers().forEach(pl => sendNotif(pl));
                    return
                }

                sendNotif(queryPlayer$1(player));
                
            }),
        ]).send(pl);
    });
}

var notification = {
    Notification: Notification$1, NotificationImportances: NotificationImportances$1, NotificationTypes, setup: regNotifComponent
};

var baseConfig = {
    motds: [
        '§l§c𓂺§b云梦之城欢迎您§c𓂺',
        '§l§g☭§5淫梦之城欢迎您§g☭',
        '§l§b★§4火§1速§6进§3服§b★',
    ],

    affairs: {
        
    },

    defaultHome: {
        x: 0,
        y: 0,
        z: 0,
        dimid: 0
    }
};

const config$1 = baseConfig;

var motd = function() {
    const { motds } = config$1;
    let index = 0;

    setInterval(() => {
        if (index == motds.length - 1) {
            index = 0;
        } else {
            index++;
        }
        const motd = motds[index];
        mc.setMotd(motd);
    }, 5000);
};

var db_lib = path => {
    const _db = new KVDatabase(path);

    const db = {
        get(k) {
            return _db.get(String(k))
        },

        set(k, v) {
            return _db.set(String(k), v)
        },

        delete(k) {
            return _db.delete(String(k))
        },

        listKey() {
            return _db.listKey()
        },

        init(k, defaultVal) {
            let candidate = _db.get(k);
            if (!candidate) {
                _db.set(k, defaultVal);
                return defaultVal
            } else {
                return candidate
            }
        }
    };

    return db
};

var db$3 = /*@__PURE__*/getDefaultExportFromCjs(db_lib);

const married = db$3('marriage');
const names = new JsonConfigFile('./ServerConfig/names.json');
function getNameByXuid(xuid) {
    return names.get(xuid, '未知');
}
function useMarries(xuid, critical) {
    const candidate = married.get(xuid);
    if (!candidate) {
        const newSet = [];
        critical(newSet);
        married.set(xuid, newSet);
        return;
    }
    critical(candidate);
    married.set(xuid, candidate);
}
function propose(xuid, xuid2) {
    const pl = mc.getPlayer(xuid);
    const pl2 = mc.getPlayer(xuid2);
    if (pl === null || pl2 === null || pl === pl2) {
        return ui.alert('求婚失败', '发生了一些错误').send(pl);
    }
    ui.alert('求婚', `${pl.name} 向你求婚了, 是否接受?`, '接受', '拒绝', () => {
        useMarries(xuid, marries => marries.push(xuid2));
        useMarries(xuid2, marries => marries.push(xuid));
        names.set(xuid, pl.name);
        names.set(xuid2, pl2.name);
        ui.alert('求婚成功', `你和 ${pl2.name} 结婚啦！`).send(pl);
        ui.alert('求婚成功', `你和 ${pl.name} 结婚啦！`).send(pl2);
        function notify(pl) {
            const notif = new notification.Notification();
            notif.title = '结婚';
            notif.content = `${pl.name} 和 ${pl2.name} 结婚啦！`;
            notif.importance = notification.NotificationImportances.NORMAL;
            notif.notify(pl);
        }
        mc.getOnlinePlayers().forEach(notify);
    }, () => {
        ui.alert('求婚失败', `${pl2.name} 拒绝了你的求婚！`).send(pl);
    }).send(pl2);
}
function divorce(xuid, xuid2) {
    const pl = mc.getPlayer(xuid);
    const pl2 = mc.getPlayer(xuid2);
    if (pl === null || pl2 === null || pl === pl2) {
        return ui.alert('离婚失败', '发生了一些错误').send(pl);
    }
    useMarries(xuid, marries => marries.splice(marries.indexOf(xuid2), 1));
    useMarries(xuid2, marries => marries.splice(marries.indexOf(xuid), 1));
    ui.alert('离婚成功', `你和 ${pl2.name} 离婚啦！`).send(pl);
    ui.alert('离婚成功', `你和 ${pl.name} 离婚啦！`).send(pl2);
    //平分财产
    const totalMoney = money.get(pl.xuid) + money.get(pl2.xuid);
    money.set(pl.xuid, totalMoney / 2);
    money.set(pl2.xuid, totalMoney / 2);
}
function queryFamilies(xuid, { filter, sort, name } = {}) {
    let marriedPlayers = [];
    useMarries(xuid, marries => {
        marriedPlayers = marries.map(xuid => ({
            xuid,
            name: mc.getPlayer(xuid)?.name ?? getNameByXuid(xuid),
            agent: true,
        }));
        if (filter) {
            marriedPlayers = marriedPlayers.filter(filter);
        }
        if (sort) {
            marriedPlayers.sort(sort);
        }
        if (name) {
            marriedPlayers = marriedPlayers.filter(pl => pl.name.includes(name));
        }
    });
    return marriedPlayers;
}
function pay3rdAmount$1(amount, xuid, xuid2) {
    const moneyA = money.get(xuid);
    const moneyB = money.get(xuid2);
    const total = moneyA + moneyB;
    if (total < amount) {
        return null;
    }
    const partialA = Math.floor(amount * moneyA / total);
    return [
        partialA,
        amount - partialA
    ];
}
function getFamiliesNullable$1(xuid) {
    return married.get(xuid);
}
function selectFamiliyMember$1(pl) {
    const families = getFamiliesNullable$1(pl.xuid);
    if (!families) {
        ui.alert('失败', '你还没有加入任何家庭').send(pl);
        return Promise.reject(null);
    }
    // const plNames = mc.getOnlinePlayers()
    //     .filter(p => families.includes(p.xuid))
    //     .map(p => p.name)
    const plNames = families.map(xuid => mc.getPlayer(xuid)?.name ?? getNameByXuid(xuid));
    plNames.unshift('选择成员');
    const opt = {};
    const sortByTypes = ['名称', '存款'];
    const { promise, resolve, reject } = Promise.withResolvers();
    ui.widget('家庭支付', [
        ui.Dropdown('选择成员', plNames, 0, (_, v) => {
            if (v) {
                opt.name = plNames[v];
            }
        }),
        ui.Slider('存款大于', 0, 1000000, 1, 0, (_, v) => {
            if (v > 0) {
                opt.filter = pl => money.get(pl.xuid) > v;
            }
        }),
        ui.Dropdown('排序方式', sortByTypes, 0, (_, v) => {
            opt.sort = v == 0
                ? (a, b) => a.name.localeCompare(b.name)
                : (a, b) => money.get(b.xuid) - money.get(a.xuid);
            const families = queryFamilies(pl.xuid, opt);
            const familiesButtons = families.map(family => ({
                text: `${family.name}`,
                onClick() {
                    resolve(family);
                }
            }));
            ui.action('匹配的成员', `已找到${families.length}个成员`, familiesButtons, reject).send(pl);
        })
    ]).send(pl);
    return promise;
}

var core$2 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	divorce: divorce,
	getFamiliesNullable: getFamiliesNullable$1,
	getNameByXuid: getNameByXuid,
	pay3rdAmount: pay3rdAmount$1,
	propose: propose,
	queryFamilies: queryFamilies,
	selectFamiliyMember: selectFamiliyMember$1
});

var require$$2 = /*@__PURE__*/getAugmentedNamespace(core$2);

const { Notification, NotificationImportances } = notification;
const { action: action$4, alert: alert$3, widget: widget$4, Dropdown: Dropdown$3, Input: Input$5 } = ui;
const { pay3rdAmount, getFamiliesNullable, selectFamiliyMember } = require$$2;

function queryPlayer(realName) {
    for (const pl of mc.getOnlinePlayers()) {
        if (pl.realName === realName) {
            return pl
        }
    }

    return null
}

const creditNormal = {
    transfer: transferCredit,
    balance: showBalance,
};

const creditOp = {
    add: addCreditOp,
    reduce: reduceCreditOp,
    set: setCreditOp,
};

function checkIfCreditEnough(pl, need) {
    return money.get(pl.xuid) >= need
}

function showBalance(pl) {
    pl.tell(`你的余额: §6${money.get(pl.xuid)}`);
}

function recevConfirm(pl2, amount, onEnsure=Function.prototype, onReject=Function.prototype) {
    const notif = new Notification();
    notif.title = '收账确认';
    notif.preview = `来自 §b${pl2.realName}§r 的转账 §6${amount}§r, 确认收账？`;
    notif.importance = NotificationImportances.IMPORTANT;
    notif.content = {
        btn1: '确认', btn2: '取消',
        onEnsure(pl) {
            notif.expire();
            onEnsure(pl);
        },

        onReject(pl) {
            notif.expire();
            onReject(pl);
            // const fail = alert('结果', '操作失败', '确认', '取消')
        }
    };

    return notif
}

function transferConfirm(name, amount) {
    return alert$3('转账确认', `向 §b${name}§r 转账 §6${amount}§r, 确认操作？`, '确认', '取消', pl => {
        const pl2 = queryPlayer(name);
        if (!checkIfCreditEnough(pl, amount)) {
            return alert$3('失败', `余额不足: ${money.get(pl.xuid)}, 需要: ${amount}`, '确认', '取消').send(pl)
        }
        recevConfirm(pl, amount, () => {
            money.trans(pl.xuid, pl2.xuid, amount);
            const suc = alert$3('结果', '操作成功', '确认', '取消');
            suc.send(pl);
            suc.send(pl2);
        }, () => {
            const fail = alert$3('结果', '操作失败', '确认', '取消');
            fail.send(pl);
            fail.send(pl2);
        }).notify(pl2);
    })
}

function transferCredit(pl, name, amount) {
    amount = +amount;
    transferConfirm(name, amount).send(pl);
}

function setCreditOp(pl, name, amount) {
    if (money.set(queryPlayer(name).xuid, +amount)) {
        pl.tell('操作成功');
    } else {
        pl.tell('操作失败');
    }
}

function addCreditOp(pl, name, amount) {
    if (money.add(queryPlayer(name).xuid, +amount)) {
        pl.tell('操作成功');
    } else {
        pl.tell('操作失败');
    }
}

function reduceCreditOp(pl, name, amount) {
    if (money.reduce(queryPlayer(name).xuid, +amount)) {
        pl.tell('操作成功');
    } else {
        pl.tell('操作失败');
    }
}

function requestFromUi(pl) {
    const pls = mc.getOnlinePlayers();

    let data = {
        who: -1,
        amount: 0
    };

    widget$4('收款', [
        Dropdown$3('向他人收款', pls.map(p => p.realName), 0, (_, i) => {
            data.who = pls[i];
        }),
        
        Input$5('金额', '', '', (_, val) => {
            data.amount = isNaN(+val)? 0 : +val;

            if (data.amount <= 0 || !data.who) {
                return
            }

            const target = data.who;
            requestCredit$2(target, `付款给 ${pl.realName}`, data.amount, () => {
                target.tell('付款成功');
                pl.tell('收款成功');
            }, defaultRequestCreditFailed, () => {
                target.tell('付款失败');
                pl.tell('收款失败');
            });
        }),
    ]).send(pl);
}

function familyTransfer(pl) {
    const pls = mc.getOnlinePlayers();
    const names = pls.map(p => p.name);

    let pl2 = null;

    widget$4('家庭转账', [
        Dropdown$3('选择转账目标', names, (_, i) => {
            pl2 = pls[i];
        }),
        Input$5('金额', '', '0', async (_, v) => {
            v = +v;

            const member = await selectFamiliyMember(pl);

            if (!member) {
                return alert$3('失败', '转账失败', '确认', '取消').send(pl)
            }

            const strategy = pay3rdAmount(v, pl.xuid, member.xuid);
            if (!strategy) {
                return alert$3('失败', '转账失败', '确认', '取消').send(pl)
            }

            const [ ,b ] = strategy;
            recevConfirm(pl2, v, () => {
                money.trans(member.xuid, pl.xuid, b);
                money.trans(pl.xuid, pl2.xuid, v);

                alert$3('成功', '转账成功', '确认', '取消').send(pl);
                const notification = new Notification();
                notification.title = '家庭转账';
                notification.preview = notification.content = `${pl.name} 使用了你 ${b} 的余额, 转账 ${v} 给 ${pl2.name}`;
                const memberPlayer = mc.getPlayer(member.xuid);
                notification.notify(memberPlayer ?? member);
            }, () => {
                alert$3('失败', '转账失败', '确认', '取消').send(pl);
            }).notify(pl2);

        }),

    ]).send(pl);
}

function creditUi(pl) {
    const ui = action$4('账户', `我的余额: ${money.get(pl.xuid)}`, [
        {
            text: '转账', onClick() {
                transferUi(pl);
            }
        },

        {
            text: '收款', onClick() {
                requestUi(pl);
            }
        }
    ], (err, pl) => {
        pl.tell('取消操作');
    });

    ui.send(pl);
}

function transferCreditUi(parent) {
    const pls = mc.getOnlinePlayers().map(v => v.realName);
    let name = '';

    return widget$4('向目标转账', [
        Dropdown$3('选择转账目标', pls, (_, i) => {
            name = pls[i];
        }),
        Input$5('数量', (pl, amount) => {
            transferCredit.call(null, pl, name, amount);
        }),
    ], (err, pl) => {
        pl.tell('设置失败');
    })
}

function creditOpUi(pl) {
    const pls = mc.getOnlinePlayers().map(v => v.realName);
    const op = ['set', 'add', 'reduce'];

    const fm = mc.newCustomForm()
        .addDropdown('目标玩家', pls)
        .addDropdown('操作', op)
        .addInput('数量');

    pl.sendForm(fm, (_, data) => {
        if (!data) {
            return pl.tell('设置失败')
        }
        const [name, func, amount] = data;
        creditOp[op[func]].call(null, pl, pls[name], amount);
        pl.tell('设置成功');
    });
}

function doRegisterCredit$1() {
    mc.regPlayerCmd('credit', `<transfer|balance> [name] [amount]`, (pl, [func, name, amount]) => {
        if (!func) {
            return creditUi(pl)
        }

        if (!name && func === 'transfer') {
            return transferCreditUi().send(pl)
        }

        if (creditNormal[func]) {
            creditNormal[func].call(null, pl, name, amount);
        }
    });

    mc.regPlayerCmd('creditop', `<set|add|reduce> <name> <amount>`, (pl, [func, name, amount]) => {
        if (!func) {
            creditOpUi(pl);
        }

        if (creditOp[func]) {
            creditOp[func].call(null, pl, name, amount);
        }
    }, 1);
}

const defaultRequestCreditFailed = (pl, amount) => {
    pl.tell(`余额不足\n§4${money.get(pl.xuid)} < ${amount}`);
};

function requestCredit$2(
    fromPlayer,
    serviceName,
    amount,
    success,
    failure = defaultRequestCreditFailed,
    cancel = Function.prototype
) {
    alert$3('账户', `为 §b${serviceName}§r 支付 §6${amount}§r ?`, '确认', '取消', async () => {
        if (checkIfCreditEnough(fromPlayer, amount)) {
            try {
                await success.call(null, fromPlayer);
                money.reduce(fromPlayer.xuid, amount);
                return
            } catch (_) { }
        }

        await failure.call(null, fromPlayer, amount);
    }, cancel).send(fromPlayer);
}

function familyRequest(
    fromFamily,
    serviceName,
    amount,
    onsuccess = Function.prototype,
    onfail = Function.prototype,
) {
    if (!getFamiliesNullable(fromFamily.xuid)) {
        return onfail(fromFamily)
    }

    const family = selectFamiliyMember(fromFamily.xuid);
    if (!family) {
        return onfail(fromFamily)
    }

    const strategy = pay3rdAmount(amount, fromFamily.xuid, family.xuid);
    if (!strategy) {
        return onfail(fromFamily)
    }

    const [ a, b ] = strategy;

    alert$3('账户', `为 §b${serviceName}§r 支付 §6${a}§r ?\n(家庭代付 ${b})`, '确认', '取消', () => {
        try {
            onsuccess(fromFamily);
            money.reduce(fromFamily.xuid, a);
            money.reduce(family.xuid, b);
        } catch {
            onfail(fromFamily);
        }
    }, onfail).send(fromFamily);
}

function transferUi(pl) {
    if (!getFamiliesNullable(pl.xuid)) {
        return transferCreditUi().send(pl)
    }

    return action$4('账户', '选择支付方式', [
        {
            text: '个人账户',
            onClick() {
                transferCreditUi().send(pl);
            }
        },
        {
            text: '家庭账户',
            onClick() {
                familyTransfer(pl);
            }
        }
    ]).send(pl)
}

function requestFamilyUi(pl) {
    const pls = mc.getOnlinePlayers();

    let data = {
        who: -1,
        amount: 0
    };

    widget$4('收款', [
        Dropdown$3('向他人收款', pls.map(p => p.name), 0, (_, i) => {
            data.who = pls[i];
        }),
        
        Input$5('金额', '', '', (_, val) => {
            data.amount = isNaN(+val)? 0 : +val;

            if (data.amount <= 0 || !data.who) {
                return
            }

            const target = data.who;
            familyRequest(target, `付款给 ${pl.realName}`, data.amount, () => {
                target.tell('付款成功');
                pl.tell('收款成功');
            }, defaultRequestCreditFailed);
        }),
    ]).send(pl);
}

function requestUi(pl) {
    if (!getFamiliesNullable(pl.xuid)) {
        return requestFromUi(pl)
    }

    return action$4('账户', '选择收款方式', [
        {
            text: '个人账户',
            onClick() {
                requestFromUi(pl);
            }
        },
        {
            text: '家庭账户',
            onClick() {
                requestFamilyUi(pl);
            }
        }
    ])
}

var core$1 = {
    doRegisterCredit: doRegisterCredit$1, transferCredit, requestCredit: requestCredit$2, defaultRequestCreditFailed,
    familyTransfer, familyRequest, transferUi, requestUi,
};

var price = {
    back: {
        name: '回到死亡地点',
        price: 12
    },

    home: {
        name: '回到复活/出生地点',
        price: 12
    },

    random: {
        name: '随机传送',
        price: 24
    },
    
    saveTeleport: {
        name: '保存坐标',
        price: 50
    }
};

const {widget: widget$3, action: action$3, Input: Input$4, Switch: Switch$3, alert: alert$2} = ui;
const {requestCredit: requestCredit$1} = core$1;
const priceConf = price;
const {defaultHome} = baseConfig;

const RECORDS_PATH = './plugins/Components/tpc/ports.data';
const portRecords = File.readFrom(RECORDS_PATH)
    ? JSON.parse(File.readFrom(RECORDS_PATH))
    : {};

function getDeadPos(pl) {
    const nbt = pl.getNbt();

    const x = nbt.getData('DeathPositionX'),
        y = nbt.getData('DeathPositionY'),
        z = nbt.getData('DeathPositionZ'),
        dim = nbt.getData('DeathDimension');

    if (x === null) {
        return null
    }

    return {
        x, y, z, dim
    }
}

function getRespawnPos(pl) {
    const nbt = pl.getNbt();

    let x = nbt.getData('SpawnX'),
        y = nbt.getData('SpawnY'),
        z = nbt.getData('SpawnZ'),
        dim = nbt.getData('SpawnDimension');

    if (x === null) {
       x = defaultHome.x;
       y = defaultHome.y;
       z = defaultHome.z;
       dim = defaultHome.dimid; 
    }

    return {
        x, y, z, dim
    }
}

function savePort(name, player, pos) {
    const record = portRecords[player.xuid] || {};

    record[name] = {
        x: pos.x,
        y: pos.y,
        z: pos.z,
        dimid: pos.dimid
    };

    portRecords[player.xuid] = record;

    File.writeTo(RECORDS_PATH, JSON.stringify(portRecords));
}

function getPort(name, player) {
    const record = portRecords[player.xuid];

    if (!record) {
        return null
    }

    return record[name] || null
}

function removePort(name, player) {
    const record = portRecords[player.xuid];
    if (!record || !record[name]) {
        return
    }
    delete record[name];
    
    File.writeTo(RECORDS_PATH, JSON.stringify(portRecords));
}

function listPorts(player) {
    const record = portRecords[player.xuid];

    if (!record) {
        return []
    }

    return Object.keys(record)
}

function netherToMainWorld(pos) {
    return {
        x: pos.x * 8,
        y: pos.y,
        z: pos.z * 8,
        dimid: 0
    }
}

function teleportPlayerToCustomPos(pl, name) {
    const currentPos = pl.blockPos;
    const targetPos = getPort(name, pl);

    if (!targetPos) {
        return alert$2('错误', `${pl.realName} 没有保存名为 ${name} 的传送点`, '确定', '取消').send(pl)
    }

    let amount = calcAmountByPos(currentPos, targetPos);

    requestCredit$1(pl, `传送到: ${name}`, amount, () => {
        pl.teleport(targetPos.x, targetPos.y, targetPos.z, targetPos.dimid);
        pl.tell('传送成功');
    });
}

function requestAddPort(pl, name, pos) {
    const {saveTeleport} = priceConf;
    requestCredit$1(pl, saveTeleport.name, saveTeleport.price, () => {
        savePort(name, pl, pos);
    });
}

function showAddPortUi(pl) {
    let name = '',
        useCurrent = false,
        pos = null;

    const cp = pl.blockPos;

    widget$3('添加传送点', [
        Input$4('传送点名称', (_, value) => {
            name = value;
        }),

        Switch$3(`使用当前坐标 (${cp.x}, ${cp.y}, ${cp.z})`, false, (_, val) => {
            useCurrent = val;
        }),

        Input$4('传送点坐标（若启用了"使用当前坐标"，则此选项不起效果）', '使用空格分隔，如: 100 100 0', (pl, value) => {
            if (useCurrent) {
                pos = pl.blockPos;
            } else {
                const valArr = value.split(' ').filter(v => v.trim()).map(v => +v);

                pos = {
                    x: valArr[0],
                    y: valArr[1],
                    z: valArr[2],
                    dimid: pl.blockPos.dimid
                };
            }

            requestAddPort(pl, name, pos);
        }),
    ], (err, pl) => {
        if (err) {
            return
        }

        pl.tell('取消操作');
    }).send(pl);
}

function showTeleportCustomUi(pl) {
    const teleportBtnList = listPorts(pl).map(v => {
        return {
            text: v,
            onClick() {
                teleportPlayerToCustomPos(pl, v);
            }
        }
    });
    action$3('传送到...', '选择你想要传送的地点', teleportBtnList, (err, pl) => {
        pl.tell(`${err.toString()}\n\n联系管理员获得更多支持`);
    }).send(pl);
}

function showRemovePosUi(pl) {
    const portList = listPorts(pl).map(v => {
        return {
            text: v,
            onClick() {
                alert$2('确定移除', `移除 "${v}" 传送点，确认？`, '确定', '取消', () => {
                    removePort(v, pl);
                    pl.tell(`已移除 "${v}" 传送点`);
                }).send(pl);
            }
        }
    });
    action$3('移除传送点', '选择你想要移除的传送点', portList, (err, pl) => {
        pl.tell(`${err.toString()}\n\n联系管理员获得更多支持`);
    }).send(pl);
}

function calcDist(current, target) {
    const dx = current.x - target.x,
        dz = current.z - target.z;
    return Math.sqrt(dx * dx + dz * dz)
}

function calcAmountByPos(currentPos, targetPos) {
    if (currentPos.dimid === targetPos.dimid) {
        return Math.ceil(
            calcDist(currentPos, targetPos) / 80
        )
    }
    
    if(currentPos.dimid === 1 && targetPos.dimid === 0) {   
        return Math.ceil(
            calcDist(netherToMainWorld(currentPos), targetPos) / 60
        )
    }
    
    if(targetPos.dimid === 1 && currentPos.dimid === 0) {
        return Math.ceil(
            calcDist(currentPos, netherToMainWorld(targetPos)) / 60
        )
    }

    return 100
}

function requestTeleportToPlayer(from, to) {
    return new Promise((res, rej) => {
        alert$2('传送请求', `${from.realName} 想要传送到你的位置，同意？`, '同意', '拒绝',
            () => {
                from.teleport(to.pos);
                res();
            },
            () => {
                alert$2('拒绝', `${to.realName} 拒绝了你的传送请求`, '确认', '取消').send(from);
                rej();
            }
        ).send(to);
    })
}

const actions = {
    h: pl => {
        const {x, y, z, dim} = getRespawnPos(pl);
        const {name, price} = priceConf.home;
        requestCredit$1(pl, name, price, () => {
            pl.teleport(x, y, z, dim);
        }, () => {
            pl.tell('余额不足');
        });
    },

    b: pl => {
        const deadPos = getDeadPos(pl);

        if (deadPos === null) {
            return pl.tell('没有死亡过')
        }

        const {x, y, z, dim} = deadPos;
        const {name, price} = priceConf.back;
        requestCredit$1(pl, name, price, () => {
            pl.teleport(x, y, z, dim);
        }, () => {
            pl.tell('余额不足');
        });
    },

    c: (pl, act, target) => {
        if (!act) {
            action$3('', '要做些什么？\n', [
                {text: '使用传送点', onClick(err, pl) {
                    if (err) {
                        return
                    }

                    showTeleportCustomUi(pl);
                }},

                {text: '添加传送点', onClick(err, pl) {
                    if (err) {
                        return
                    }

                    showAddPortUi(pl);
                }},
                
                {text: '移除传送点', onClick(err, pl) {
                    if (err) {
                        return
                    }

                    showRemovePosUi(pl);
                }}
            ]).send(pl);

            return
        }

        if (target) {
            if (act === 'add') {
                return requestAddPort(pl, target, pl.blockPos)
            }
    
            if (act === 'rm') {
                return removePort(target, pl)
            }
    
            if (act === 'tp') {
                return teleportPlayerToCustomPos(pl, target)
            }
        }

        if (act === 'add') {
            return showAddPortUi(pl)
        }

        if (act === 'rm') {
            return showRemovePosUi(pl)
        }

        if (act === 'tp') {
            return showTeleportCustomUi(pl)
        }
    },

    a: pl => {
        const btnGroups = mc.getOnlinePlayers()
            .map(pl2 => ({
                text: pl2.realName,
                onClick() {
                    requestCredit$1(pl, `传送到玩家: ${pl2.realName}`, calcAmountByPos(pl.blockPos, pl2.blockPos), async () => {
                        await requestTeleportToPlayer(pl, pl2);
                    });
                }
            }));
        action$3('传送到玩家', '选择一名玩家', btnGroups).send(pl);
    },

    w: pl => {
        if (pl.permLevel) {
            return worldTeleportUiOp(pl)
        }
    
        worldTeleportUiPlayer(pl);
    }

};

const globalPreserved = {xuid: 'global-preserved'};
function worldTeleportUiOp(pl) {
    action$3('', '世界传送', [
        {
            text: '添加传送点',
            onClick(_, pl) {
                worldTeleportAddUi(pl);
            }
        },

        {
            text: '移除传送点',
            onClick(_) {
                worldTeleportRmUi(pl);
            }
        },

        {
            text: '使用传送点',
            onClick(_, pl) {
                worldTeleportUiPlayer(pl);
            }
        },
    ]).send(pl);
}


function worldTeleportUiPlayer(pl) {
    let current;
    for (const name of listPorts(globalPreserved)) {
        const {x, z, dimid} = getPort(name, globalPreserved);
        const plPos = pl.pos;

        if (
            dimid === plPos.dimid &&
            Math.abs(plPos.x - x) < 6 &&
            Math.abs(plPos.z - z) < 6
        ) {
            current = name;
            break
        }
    }

    if (!current) {
        alert$2('错误', '不在可用传送区域', '确定', '取消').send(pl);
        return
    }

    action$3('世界传送', '选择你要传送的地点',
        listPorts(globalPreserved)
            .filter(v => v != current)
            .map(name => ({
                text: name,
                onClick() {
                    const targetPos = getPort(name, globalPreserved);
                    requestCredit$1(
                        pl, `传送到 ${name}`,
                        Math.ceil(calcAmountByPos(pl.pos, targetPos) * 0.1),
                        () => {
                            const {x, y, z, dimid} = targetPos;
                            pl.teleport(x, y, z, dimid);
                        }
                    );
                }
            }))
    ).send(pl);
}

function worldTeleportAddUi(pl) {
    let name,
        pos;

    const plPos = pl.blockPos;

    widget$3('添加传送点', [
        Input$4('传送点名称', (_, val) => {
            name = val;
        }),
        Switch$3(`使用当前坐标 §b(${plPos.x},${plPos.y},${plPos.z})`, (_, val) => {
            pos = plPos;
        }),
        Input$4(
            '传送点坐标 (若选择了“使用当前坐标”, 则此项无效)',
            '使用空格分开的数字, 如: "100 100 100"', '',
            (_, val) => {
                if (!pos) {
                    if (val.match(/\d+ \d+ \d+/)) {
                        const [x, y, z] = val.split(' ');
                        pos = {
                            x, y, z, dimid: pl.dimid
                        };
                    } else {
                        pos = plPos;
                    }
                }

                savePort(name, globalPreserved, pos);
            }
        )
    ]).send(pl);
}

function worldTeleportRmUi(pl) {
    action$3(
        '删除传送点', '', listPorts(globalPreserved)
            .map(name => ({
                text: name,
                onClick() {
                    alert$2(
                        '删除传送点', `确定删除传送点 §b${name}§r ?`,
                        '确定', '取消',
                        () => {
                            removePort(name, globalPreserved);
                        }
                    ).send(pl);
                }
            }))
    ).send(pl);
}

function regTelCmds() {
    const cmd = mc.newCommand('tpc', '自定义传送', 0);
    cmd.setEnum('action', ['h', 'b', 'a', 'w']);
    cmd.setEnum('customEvent', ['add', 'rm', 'tp']);
    cmd.setEnum('custom', ['c']);
    cmd.mandatory('Action', ParamType.Enum, 'action', 'Action', 1);
    cmd.mandatory('Custom', ParamType.Enum, 'custom', 'Custom', 1);
    cmd.optional('CustomEvent', ParamType.Enum, 'customEvent', 'CustomEvent', 1);
    cmd.optional('teleportName', ParamType.String);

    cmd.overload(['Action']);
    cmd.overload(['Custom', 'CustomEvent', 'teleportName']);

    cmd.setCallback((_, origin, output, args) => {
        const cmd = args.Action ?? args.Custom;
        const argArr = [args.CustomEvent, args.teleportName];
        const handler = actions[cmd];

        if (!handler) {
            output.error('错误的指令格式');
        }

        handler.call(null, origin.player ?? origin.entity, ...argArr);
    });

    cmd.setup();
}

var setup$8 = {
    setup: regTelCmds, getDeadPos, getRespawnPos
};

const dbLib = db_lib;
const { widget: widget$2, Input: Input$3 } = ui;
const db$2 = dbLib('./data/trap');

function pos2str(pos) {
    return `${pos.x},${pos.y},${pos.z},${pos.dimid}`
}

function debounce(fn, wait = 1) {
    var timer = null;
    return (...args) => {
        if (!timer) {
            fn.apply(null, args);

            timer = setTimeout(() => {
                timer = null;
            }, wait);
        }
    }
}

const cooldowns = new Set();

function listenItemUse$1() {
    mc.listen('onUseItemOn', debounce((player, item, block) => {
        const pos = block.pos;
        const id = pos2str(block.pos);
        let commands = db$2.get(id) || [];

        if (cooldowns.has(id)) {
            return
        }

        if (item.type === 'ym:trap') {
            /**@type {string}*/
            let strs = [];
            widget$2('设置陷阱', [
                Input$3('添加指令', '', commands[0] || '', (pl, v) => strs[0] = v),
                Input$3('添加指令', '', commands[1] || '', (pl, v) => strs[1] = v),
                Input$3('添加指令', '', commands[2] || '', (pl, v) => strs[2] = v),
                Input$3('添加指令', '', commands[3] || '', (pl, v) => {
                    strs[3] = v;
                    db$2.set(id, strs);
                })
            ]).send(player);

            return
        }

        commands = commands.join('').split(/\\\\/g);
        for (const cmd of commands) {
            const [cond, res] = cmd.split('|>');
            const [then, or] = (res ?? '').split(':>');

            const condVal = runSequnces(cond, pos, player);
            if (then && condVal) {
                runSequnces(then, pos, player);
                continue
            }

            if (or && !condVal) {
                runSequnces(or, pos, player);
                continue
            }
        }

        cooldowns.add(id);
        setTimeout(() => cooldowns.delete(id), 500);
    }), 500);
}

function runSequnces(seq, pos, pl) {
    const seqs = seq.split('&&');
    let seqReturnVal = true;

    for (const item of seqs) {
        seqReturnVal = mc.runcmdEx(`execute positioned ${pos.x} ${pos.y} ${pos.z} as "${pl.name}" run ${item}`).success;

        if (!seqReturnVal) {
            return seqReturnVal
        }
    }

    return seqReturnVal
}

var trap = {
    listenItemUse: listenItemUse$1
};

const { listenItemUse } = trap;

var shell = {
    setup: listenItemUse
};

const newDB$1 = db_lib;
const db$1 = newDB$1('./data/orders');

let nextId = db$1.get('__next_id__') ?? 0;

function newOrder(vendorXuid, customerXuid, amount, paied=false, delivered=false, attachments=[]) {
    db$1.set('__next_id__', nextId++);
    return {
        oid: nextId, vid: vendorXuid, cid: customerXuid, amount, paied, delivered, attachments
    }
}

function add$5(vendorXuid, customerXuid, amount, paied=false, delivered=false, attachments=[]) {
    const o = newOrder(vendorXuid, customerXuid, amount, paied, delivered, attachments);
    const id = o.oid;
    const cid = 'c' + customerXuid;
    const vid = 'v' + vendorXuid;

    db$1.set(id + '', o);
    db$1.set(cid, (db$1.get(cid) ?? []).concat([id]));
    db$1.set(vid, (db$1.get(vid) ?? []).concat([id]));
}

function edit$3(id, data) {
    const o = db$1.get(id);

    if (!o) {
        return false
    }

    db$1.set(id, Object.assign(o, data));

    return true
}

function paied(id) {
    return edit$3(id, { paied: true })
}

function delivered(id) {
    return edit$3(id, { delivered: true })
}

function filter(data, prop, _cond) {
    const cond = !Array.isArray(_cond)
        ? v => v === _cond
        : v => v >= _cond[0] && v < _cond[1];

    return data.filter(v => cond(v[prop]))
}

function nonenull(v) {
    return v !== null && v !== undefined
}

/**
 * @param {{[K in 'oid'|'cid'|'vid'|'amount'|'paied'|'delivered']?: any}} opt
 */
function query$3(opt) {
    let data = null;

    if (opt.oid) {
        return [db$1.get(opt.oid)]
    }

    if (opt.cid) {
        data = (db$1.get('c' + opt.cid) ?? []).map(id => db$1.get(id));
    }

    if (opt.vid) {
        if (!data) {
            data = (db$1.get('v' + opt.vid) ?? []).map(id => db$1.get(id));
        } else {
            data = filter(data, 'vid', 'v' + opt.vid);
        }
    }

    if (!data) return null

    if (opt.amount) {
        data = filter(data, 'amount', opt.amount);
    }

    if (nonenull(opt.paied)) {
        data = filter(data, 'paied', opt.paied);
    }

    if (nonenull(opt.delivered)) {
        data = filter(data, 'delivered', opt.delivered);
    }

    return data
}

function removeElement(arr, el) {
    const set = new Set(arr);
    set.delete(el);
    return Array.from(set)
}

function remove$1(id) {
    const o = db$1.get(id);
    if (!o) {
        return false
    }

    const { cid, vid } = o;
    db$1.delete(id);

    const kcid = 'c' + cid;
    const kvid = 'v' + vid;
    const cids = db$1.get(kcid);
    const vids = db$1.get(kvid);

    if (!cids || !vids) {
        return false
    }

    db$1.set(kcid, removeElement(cids, id));
    db$1.set(kvid, removeElement(vids, id));

    return true
}

function keys$3() {
    return db$1.listKey().filter(k => !isNaN(+k))
}

var core = {
    add: add$5, edit: edit$3, paied, delivered, query: query$3, remove: remove$1, keys: keys$3
};

const { cmd: cmd$3 } = require$$0;
const newDB = db_lib;
const db = newDB('./data/orders/virts');

function getVirtEntityLeader$2(name) {
    return db.get('v:' + name)
}

function getControlledEntites$1(xuid) {
    return db.get('c:' + xuid) || []
}

function addVirtEntites(xuid, ...entites) {
    let enArr = new Set(getControlledEntites$1(xuid));

    entites.forEach(e => {
        if (!getVirtEntityLeader$2(e)) {
            db.set(`v:${e}`, xuid);
            enArr.add(e);
        }
    });

    db.set('c:' + xuid, Array.from(enArr));
}

function deleteEntity(entity) {
    let xuid = getVirtEntityLeader$2(entity);
    let enArr = new Set(getControlledEntites$1(xuid));

    enArr.delete(entity);
    
    db.set('c:' + xuid, Array.from(enArr));
    db.delete('v:' + entity);
}

function setup$7() {
    const done = (pl, handler) => {
        try {
            handler.call(null);
            pl.tell('操作成功');
        } catch (_) {
            pl.tell(`操作失败\n${_.toString()}`);
        }
    };

    cmd$3('virtentity', '操作虚拟实体', 1).setup(register => {
        register('add <pl:player> <entites:string>', (_, ori, out, res) => {
            const pl = res.pl[0];
            done(pl, () => addVirtEntites(pl.xuid, ...res.entites.split(',').map(en => en.trim())));
        });
        register('delete <entity:string>', (_, ori, out, res) => {
            const pl = ori.player;
            done(pl, () => deleteEntity(res.entity));
        });
        register('owner <entity:string>', (_, ori, out, res) => {
            ori.player.tell(mc.getPlayer(getVirtEntityLeader$2(res.entity)).name);
        });
        register('list <pl:player>', (_, ori, out, res) => {
            const pl = res.pl[0];
            ori.player.tell(getControlledEntites$1(pl.xuid).join('\n'));
            
        });
    });
}

function n$3(uid) {
    if (uid.startsWith('virt:')) {
        return uid.slice(5)
    }

    return mc.getPlayer(uid).name
}

function ref$2(uid) {
    let refUid = uid;

    if (uid.startsWith('virt:')) {
        refUid = getVirtEntityLeader$2(uid.slice(5));
    }

    return mc.getPlayer(refUid)
}

var virt = {
    getVirtEntityLeader: getVirtEntityLeader$2,
    getControlledEntites: getControlledEntites$1,
    addVirtEntites,
    deleteEntity,
    setup: setup$7,
    n: n$3, ref: ref$2
};

const { cmd: cmd$2 } = require$$0;
const { action: action$2, widget: widget$1, Label: Label$1, Input: Input$2, Switch: Switch$2, Dropdown: Dropdown$2, StepSlider } = ui;
const { keys: keys$2, query: query$2, edit: edit$2, add: add$4, remove } = core;
const { n: n$2 } = virt;

const EditOrder = order => [
    `修改订单`, [
        Label$1(`订单编号: ${order.oid}`),
        Label$1(`顾客：${n$2(order.cid)}`),
        Label$1(`商家：${n$2(order.vid)}`),
        Input$2('价格', '', `${order.amount}`, (_, v) => order.amount = parseFloat(v)),
        Switch$2('已支付', order.paied, (_, v) => order.paied = v),
        Switch$2('已交付', order.delivered, (_, v) => {
            order.delivered = v;

            edit$2(order.oid, order);
        }),
    ]
];

const ConfirmDelete = order => [
    '确认', `删除订单 ${order.oid} ?`, '是', '否', pl => {
        remove(order.oid);
        pl.tell('删除成功');
    }, pl => pl.tell('删除失败')
];

const ManageOrder = order => {
    return [
        '管理订单', '', [
            {
                text: '编辑', onClick(_, pl) {
                    this.openWidget(...EditOrder(order)).send(pl);
                }
            },
            {
                text: '删除', onClick(_, pl) {
                    this.openAlert(...ConfirmDelete(order)).send(pl);
                }
            }
        ]
    ]
};

function listOrders(pl) {
    if (!pl) {
        return
    }

    const list = keys$2();

    if (!list.length) {
        return pl.tell('无订单')
    }

    action$2('列表', '', list.map(k => ({
        text: k,
        onClick(_, pl) {
            const order = query$2({ oid: k })[0];
            action$2(...ManageOrder(order)).send(pl);
        }
    }))).send(pl);
}

function addOrder(pl) {
    const pls = mc.getOnlinePlayers();
    const plsStr = pls.map(p => p.name);

    let cid, vid, amount, paied, delivered;

    widget$1(`修改订单`, [
        Dropdown$2('顾客', plsStr, 0, (_, i) => cid = pls[i].xuid),
        Dropdown$2('商家', plsStr, 0, (_, i) => vid = pls[i].xuid),
        Input$2('价格', '', '0', (_, v) => amount = parseFloat(v)),
        Switch$2('已支付', false, (_, v) => paied = v),
        Switch$2('已交付', false, (_, v) => {
            delivered = v;

            add$4(vid, cid, amount, paied, delivered);
        }),
    ]).send(pl);
}

function queryOrder(pl) {
    const q = {};
    const pls = mc.getOnlinePlayers();
    const plsNames = ['无', ...pls.map(p => p.realName)];
    const checkLabels = ['未知', '是', '否'];

    widget$1('查询订单', [
        Input$2('订单id', '', '', (_, v) => {
            if (v) {
                q.oid = v.trim();
            }
        }),

        Dropdown$2('客户id', plsNames, 0, (_, i) => {
            if (i) {
                q.cid = pls[i-1].xuid; 
            }
        }),

        Dropdown$2('商家id', plsNames, 0, (_, i) => {
            if (i) {
                q.vid = pls[i-1].xuid;
            }
        }),

        Input$2('价格', '数字如：100 或 范围如 10..100', '', (_, v) => {
            if (v) {
                if (v.includes('..')) {
                    let [ min, max ] = v.split('..');
                    min = isNaN(+min)? -Infinity: +min;
                    max = isNaN(+max)? Infinity: +max;
                    q.amount = [min, max];
                } else {
                    q.amount = parseFloat(v) || 0;
                }
            }
        }),

        StepSlider('已支付', checkLabels, (_, v) => {
            if (v) {
                q.paied = v < 2;
            }
        }),

        StepSlider('已交付', checkLabels, function(pl, v) {
            if (v) {
                q.delivered = v < 2;
            }

            const result = query$2(q);
            if (!result || !result.length) {
                return pl.tell('无结果')
            }

            action$2('查询结果', '', result.map(o => {
                return {
                    text: `${o.oid} ${
                        n$2(o.cid)
                    } -§5${o.amount}§r-> ${
                        n$2(o.vid)
                    }`,
                    onClick(_, pl) {
                        action$2(...ManageOrder(o)).send(pl);
                    }
                }
            })).send(pl);
        }),
    ], (_, e) => console.log(e)).send(pl);
}

function setupOrder() {
    cmd$2('orderop', '管理订单', 1)
    .setup(register => {
        register('list', (_, { player }) => {
            listOrders(player);
        });
        register('add', (_, { player }) => addOrder(player));
        register('query', (_, { player }) => queryOrder(player));
    });
}

var admin = setupOrder;

const { alert: alert$1, Input: Input$1, Switch: Switch$1, Dropdown: Dropdown$1 } = ui;
const { keys: keys$1, query: query$1, edit: edit$1, add: add$3 } = core;
const { requestCredit } = core$1;
const { n: n$1, ref: ref$1, getVirtEntityLeader: getVirtEntityLeader$1 } = virt;

function Menu$2() {
    return ['客户', '', [
        {
            text: '添加订单',
            onClick(err, pl) {
                if (err) {
                    return pl.tell('出错了')
                }

                this.openWidget(...Add()).send(pl);
            }
        },
        {
            text: '支付订单',
            onClick(err, pl) {
                if (err) {
                    return pl.tell('出错了')
                }

                this.openAction(...Payments(pl.xuid)).send(pl);
            }
        },
        {
            text: '确认交付',
            onClick(err, pl) {
                if (err) {
                    return pl.tell('出错了')
                }

                this.openAction(...Confirm(pl.xuid)).send(pl);
            }
        }
    ]]
}

function Add() {
    let useId = false,
        vendor,
        players = mc.getOnlinePlayers(),
        amount,
        request;

    return ['添加', [
        Input$1('订单要求', '写出你对订单的要求，尽可能详细', '', (_, val) => request = val),
        Switch$1('使用虚拟商家标识符', false, (pl, val) => useId = val),
        Input$1('虚拟商家标识符', '如: "bank"', '', (pl, val) => vendor = 'virt:' + val),
        Dropdown$1('选择个人', players.map(p => p.name), 0, (pl, i) => {
            if (!useId) {
                vendor = players[i].xuid;
            }
        }),
        Input$1('金额', '0', '', (pl, val) => {
            amount = isNaN(+val) ? 0 : +val;

            add$3(vendor, pl.xuid, amount, false, false, [request]);
            pl.tell('添加成功');
        })
    ]]
}

function Payments(xuid) {
    const data = query$1({
        cid: xuid,
        paied: false
    });

    const btnGroup = data.map(o => {
        return {
            text: `${n$1(o.cid)} -${o.amount}-> ${n$1(o.vid)}`,
            onClick() {
                requestCredit(
                    ref$1(o.vid),
                    '订购',
                    o.amount,
                    () => {
                        money.add(o.cid.startsWith('virt:') ? getVirtEntityLeader$1(n$1(o.cid)) : o.cid, o.amount);
                        o.paied = true;
                        edit$1(o.oid, o);
                        ref$1(o.vid).tell('已完成支付');
                    }
                );
            }
        }
    });

    return [
        '待支付', '', btnGroup
    ]
}

function Confirm(xuid) {
    const data = query$1({
        cid: xuid,
        delivered: false
    });

    const btnGroup = data.map(o => {
        return {
            text: `${n$1(o.cid)} -${o.amount}-> ${n$1(o.vid)}`,
            onClick(_, pl) {
                alert$1('确认', '此订单已交付？', '是', '否', pl => {
                    o.delivered = true;
                    edit$1(o.oid, o);
                    pl.tell('已确认交付');
                }).send(pl);
            }
        }
    });

    return [
        '确认交付', '', btnGroup
    ]
}

var customer = {
    Menu: Menu$2
};

const { alert, Label, Input, Switch, Dropdown, action: action$1, widget } = ui;
const { keys, query, edit, add: add$2 } = core;
const { n, ref, getControlledEntites, getVirtEntityLeader } = virt;
// const db = newDB('./data/orders/vendors')

function Menu$1() {
    return [
        '商家操作', '', [
            {
                text: '交付订单',
                onClick(_, pl) {
                    action$1(...DeliveryList(pl.xuid)).send(pl);
                }
            }
        ]
    ]
}

function DeliveryList(xuid) {
    const host = [xuid, ...getControlledEntites(xuid).map(e => 'virt:' + e)];
    const orders = host.map(vid => query({ vid, delivered: false })).flat();
    const btnGroup = orders.map(o => ({
        text: `${n(o.cid)} -${o.amount}-> ${n(o.vid)}`,
        onClick(_, pl) {
            widget(...Delivery(o)).send(pl);
        }
    }));

    return [
        '待交付', '', btnGroup
    ]
}

function getTargetUid(uid) {
    if (uid.startsWith('virt:')) {
        return getVirtEntityLeader(uid.slice(5))
    }

    return uid
}

function Delivery(o) {
    const delivered = o.attachments.slice(1).join('\n');

    return [
        '交付', [
            Label(`交付要求: ${o.attachments[0]}`),
            Label(`已交付: ${delivered || '无'}`),
            Input('交付内容:\n例如物品: [minecraft:glass*64], 金额: (1000), 指令: {time set day}, 使用","分开', '[minecraft:glass*1],(100)', '', (pl, val) => {
                const xuid = pl.xuid;
                const handlers = [];
                val.split(',').forEach(control => {
                    control = control.trim();
                    let result;

                    if (result = /\((\d*?)\)/.exec(control)) {
                        const [_, amount] = result;

                        handlers.push(() => {
                            if (money.get(xuid) >= +amount) {
                                money.trans(xuid, getTargetUid(o.cid), amount);
                                o.attachments.push(control);
                                edit(o.oid, o);
                            }
                        });
                        return
                    }

                    if (result = /\[(.*)\]/.exec(result)) {
                        return handlers.push(() => {
                            mc.runcmdEx(result[1]);
                            o.attachments.push(control);
                            edit(o.oid, o);
                        })
                    }

                    const itemType = control.split(/[\*\^]/)[0].trim();
                    const count = +(/\*(\d+)/.exec(control) || [, '0'])[1].trim();
                    const tile = +(/\^(\d+)/.exec(control) || [, '0'])[1].trim();
                    const srcPl = mc.getPlayer(xuid);
                    const targetPl = mc.getPlayer(getTargetUid(o.cid));
                    const inv = srcPl.getInventory();
                    const target = targetPl.getInventory();

                    inv.getAllItems().forEach((item, i) => {
                        const targetItem = item.clone();

                        if (
                            item.type === itemType &&
                            item.aux === tile &&
                            item.count >= count
                        ) {
                            if (target.hasRoomFor(targetItem)) {
                                inv.removeItem(i, count);
                                target.addItem(targetItem, count);
                                o.attachments.push(control);
                                edit(o.oid, o);

                                srcPl.refreshItems();
                                targetPl.refreshItems();
                            }
                        }
                    });
                });
            })
        ]
    ]
}

var vendor = Menu$1;

const { cmd: cmd$1 } = require$$0;
const { action } = ui;
const { Menu } = customer;
const Vendor = vendor;

var user = () => {
    cmd$1('order', '订单操作', 0).setup(register => {
        register('customer', (_, o) => {
            action(...Menu()).send(o.player);
        });
        register('vendor', (_, o) => {
            action(...Vendor()).send(o.player);
        });
    });
};

const setupOrderOp = admin;
const setupOrderUser = user;
const { setup: setupVirt } = virt;

function setup$6() {
    setupVirt();
    setupOrderOp();
    setupOrderUser();
}

var setup_1$1 = {
    setup: setup$6
};

const mobs = new Map();
const mobUidList = [null];
const emptyIndexList = new Set();

function getScoreboard$1(name) {
    return mc.getScoreObjective(name) ?? mc.newScoreObjective(name, name)
}

function addWhereEmpty(el) {
    if (emptyIndexList.size) {
        let index;
        for (const i of emptyIndexList) {
            index = i;
            break
        }

        emptyIndexList.delete(index);
        mobUidList[index] = el;

        return index
    }

    mobUidList.push(el);
    return mobUidList.length - 1
}

const tag = 'CanBeKinematicObj';
function canBeKinematicObj() {
    mc.runcmdEx(`scoreboard players set @e[tag=!${tag}] suid 0`);
}

function add$1(mob) {
    const uid = mob.uniqueId;
    const ob = getScoreboard$1('suid');

    if (mobUidList.includes(uid)) {
        return [getScoreUid$1(uid), false]
    }

    mobs.set(uid, mob);
    const scoreUid = addWhereEmpty(uid);
    const scoreTarget = mob.isPlayer()
        ? mob.toPlayer()
        : uid;

    if (!ob.getScore(scoreTarget)) {
        ob.setScore(scoreTarget, scoreUid);
        mob.addTag(tag);
        return [scoreUid, true]
    }

    return [0, false]
}

function rm$1(mob) {
    const uid = mob.uniqueId;
    const suid = getScoreUid$1(uid);

    mob.removeTag(tag);
    if (mobs.delete(uid)) {
        mobUidList[suid] = null;
        emptyIndexList.add(suid);
        
        return suid
    }
    
    return 0
}

function get(suid) {
    return mobs.get(mobUidList[suid])
}

function getScoreUid$1(uid) {
    const suid = mobUidList.indexOf(uid);

    return !~suid ? 0 : suid
}

function setup$5() {
    mc.runcmdEx('scoreboard players set @e suid 0');
    mc.listen('onMobDie', mob => {
        if (!mob.isPlayer()) {
            rm$1(mob);
        }
    });
    mc.listen('onTick', canBeKinematicObj);
    mc.listen('onLeft', mob => rm$1(mob));
}

var mobs_1 = {
    get, getScoreUid: getScoreUid$1, setup: setup$5, add: add$1, rm: rm$1
};

const { cmd } = require$$0;
const {
    setup: setupMobs, getScoreUid, add, rm
} = mobs_1;

const kinematicsMap = new Map();


function tp(suid, dx = 0, dy = 0, dz = 0, facing, isVec) {
    if (dx + dy + dz === 0) {
        return
    }

    const facingInfo = ' true';

    return mc.runcmdEx(`execute as @e[scores={suid=${suid}}] at @s run tp @s ~${dx} ~${dy} ~${dz}${facingInfo}`)
}

function initKinematicsStatus(suid) {
    const status = {
        vx: 0, vy: 0, vz: 0,
        ax: 0, ay: 0, az: 0
    };
    kinematicsMap.set(suid, status);
    return status
}

function setVelocity(suid, x = 0, y = 0, z = 0) {
    let status = kinematicsMap.get(suid) || initKinematicsStatus(suid);

    status.vx = x;
    status.vy = y;
    status.vz = z;
}

function setAccelerate(suid, x = 0, y = 0, z = 0) {
    let status = kinematicsMap.get(suid) || initKinematicsStatus(suid);

    status.ax = x;
    status.ay = y;
    status.az = z;
}

const deltaTick = 0.05;
const gravityAccelerate = 9.8;

function freshStatus() {
    kinematicsMap.forEach((v, suid) => {
        const {
            ax, ay, az
        } = v;

        if (ax + ay + az !== 0) {
            v.vx += ax * deltaTick;
            v.vy += ay * deltaTick;
            v.vz += az * deltaTick;
        }

        v.vy -= gravityAccelerate * deltaTick;

        const {
            vx, vy, vz
        } = v;

        let dx =  vx * deltaTick
            ,dy = vy * deltaTick
            ,dz = vz * deltaTick;

        if (!tp(suid, dx, dy, dz)) {
            kinematicsMap.delete(suid);
            // const entity = get(suid)
            // entity?.hurt(Math.sqrt(vx**2 + vy**2 + vz**2) * 0.9, ActorDamageCause.FlyIntoWall)
            // positionFix(entity, suid, v)
        }
    });
}

function addWatchable(entity) {
    const [suid, success] = add(entity);

    if (!suid || !success) {
        return false
    }

    return true
}

function rmWatchable(entity) {
    const suid = rm(entity);

    if (!suid) {
        return false
    }

    kinematicsMap.delete(suid);
    return true
}

function setup$4() {
    setupMobs();
    mc.listen('onTick', freshStatus);

    cmd('kinematics', '设置运动学属性')
    .setup(register => {
        register('watch <entity:entity>', (_1, _2, out, { entity }) => {
            const list = entity.map(e => addWatchable(e)).filter(v => v);
            out.success(`添加 ${list.length} 个运动学监视对象`);
        });
        register('unwatch <watched:entity>', (_1, _2, out, {watched}) => {
            const list = watched.map(e => rmWatchable(e)).filter(v => v);
            out.success(`移除 ${list.length} 个运动学监视对象`);
        });
        register('velocity <v:vec>', (_, { entity: ori }, out, args) => {
            const { v } = args;
            let suid = getScoreUid(ori.uniqueId);

            if (!suid) {
                return
            }

            setVelocity(suid, v.x - 0.5, v.y, v.z - 0.5);
        });
        register('accelerate <a:vec>', (_, { entity: ori }, out, args) => {
            const { a } = args;
            let suid = getScoreUid(ori.uniqueId);
            if (!suid) {
                return
            }

            setAccelerate(suid, a.x - 0.5, a.y, a.z - 0.5);
        });
    });
}

var kinematics = {
    setup: setup$4, setAccelerate, setVelocity
};

const { doRegisterCredit } = core$1;

function setup$3() {
    doRegisterCredit();
}

var setup_1 = {
    setup: setup$3
};

const { EventEmitter } = events;
const em = new EventEmitter();

const affairToken$1 = {
    form: 'affair_form',
    result: 'affair_result',
    xid: 'affair_xid',
};

function getScoreboard(name) {
    let sc = null;
    if (sc = mc.getScoreObjective(name)) {
        return sc
    }
    return mc.newScoreObjective(name, name)
}

function getAffairTarget(xid) {
    const pls = mc.getOnlinePlayers();

    for (const pl of pls) {
        if (pl.getScore(affairToken$1.xid) == xid) {
            return pl
        }
    }

    return null
}

let formUpload = null,
    result = null,
    xid = null;

mc.listen('onServerStarted', () => {
    formUpload = getScoreboard(affairToken$1.form),
    result = getScoreboard(affairToken$1.result),
    xid = getScoreboard(affairToken$1.xid);
});


let Affair$1 = class Affair {

    xid = 0
    form = []
    operation = 0
    target = null

    constructor(xid) {
        xid = xid + '';
        this.xid = +xid;
        this.operation = +(xid.slice(0, -3));
        this.target = getAffairTarget(xid);
    }

    onRecevAllArgs(args) {
        em.emit(this.operation, this, ...args);
    }

    writeResult(score) {
        result.setScore(this.target, score);
    }

    close() {
        formUpload.setScore(this.target, 0);
        result.setScore(this.target, 0);
        xid.setScore(this.target, 0);
    }

};


var affair$1 = {
    Affair: Affair$1, affairToken: affairToken$1,
    on(type, handler) {
        em.on(type, handler);
    },
    off(type, handler) {
        em.off(type, handler);
    }
};

function test(affair, a, b, c) {
    affair.writeResult(114514);
    log(`你是 ${a} 个 ${b} 个 ${c} 个`);
}

var _enum = {
    1: test
};

const {affairToken, Affair, on, off} = affair$1;
const enums = _enum;

const affairs = new Map();

const getXid = pl => {
    return pl.getScore(affairToken.xid)
};

function init() {

    for (const key in enums) {
        on(key, enums[key]);
    }

    mc.listen('onScoreChanged', (pl, newScore, scoreName) => {
        const xid = getXid(pl);

        if (scoreName === affairToken.xid) {
            if (newScore == 0) {
                affairs.delete(xid);
                return
            }

            const _xid = newScore;
            affairs.set(_xid, new Affair(_xid));
            return
        }

        if (scoreName === affairToken.form) {
            const recev = newScore;
            const affair = affairs.get(xid);
            if (!affair) {
                return
            }
            if (recev == -1) {
                affair.onRecevAllArgs.call(affair, affair.form);
                return
            }
            affair.form.push(recev);
        }

    });
}

var affair = {
    init
};

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

const formStackMapping = new Map();
function getMapping(xuid) {
    let formStack = formStackMapping.get(xuid);
    if (!formStack) {
        formStack = [];
        formStackMapping.set(xuid, formStack);
    }
    return formStack;
}

var Alert;
(function (Alert) {
    function Apply(text, onClick) {
        return context => {
            context.apply = {
                text,
                onClick
            };
        };
    }
    Alert.Apply = Apply;
    function Cancel(text, onClick) {
        return context => {
            context.cancel = {
                text,
                onClick
            };
        };
    }
    Alert.Cancel = Cancel;
    function View(title, content) {
        return context => {
            context.title = title;
            context.content = content;
        };
    }
    Alert.View = View;
    function sendAlert({ title, content, apply, cancel }, pl) {
        pl.sendModalForm(title, content, apply?.text, cancel?.text, (pl, confirmed) => {
            if (confirmed) {
                return apply?.onClick(pl);
            }
            return cancel?.onClick(pl);
        });
    }
    function createContext(widget) {
        const ctx = {};
        for (const view of widget.render()) {
            view.call(null, ctx);
        }
        if (!ctx.title || !ctx.content) {
            throw new Error('Title and content are required');
        }
        return ctx;
    }
    Alert.start = (ctor, pl) => {
        const widget = Reflect.construct(ctor, []);
        const ctx = createContext(widget);
        const stack = getMapping(pl.xuid);
        stack.push(['alert', widget]);
        sendAlert(ctx, pl);
    };
    function back(widget, pl) {
        sendAlert(createContext(widget), pl);
    }
    Alert.back = back;
})(Alert || (Alert = {}));

const exports$1 = new Map();
function Export(id) {
    return (target) => {
        exports$1.set(id, target);
    };
}

class Widget {
    back(pl) {
        return back(pl);
    }
}
function back(pl) {
    const formStack = getMapping(pl.xuid);
    if (!formStack.length) {
        return;
    }
    formStack.pop();
    if (!formStack.length) {
        return;
    }
    let [type, widget] = formStack.at(-1);
    switch (type) {
        case 'alert':
            return Alert.back(widget, pl);
    }
}

var MyWidget_1;
let MyWidget = class MyWidget extends Widget {
    static { MyWidget_1 = this; }
    static depth = 1;
    render() {
        return [
            Alert.View('test', `stack ${MyWidget_1.depth}`),
            Alert.Apply('new stack', pl => {
                MyWidget_1.depth++;
                pl.tell('yes');
                Alert.start(MyWidget_1, pl);
            }),
            Alert.Cancel('back', pl => {
                MyWidget_1.depth--;
                pl.tell('no');
                this.back(pl);
            }),
        ];
    }
};
MyWidget = MyWidget_1 = __decorate([
    Export('main')
], MyWidget);
// mc.listen('onJump', pl => {
//     Alert.start(MyWidget, pl)
// })
cmd$6('testui', '测试ui').setup(register => {
    register('test1', (cmd, ori, out, res) => {
        Alert.start(MyWidget, ori.player);
    });
});

var testui = /*#__PURE__*/Object.freeze({
	__proto__: null
});

var require$$13 = /*@__PURE__*/getAugmentedNamespace(testui);

function setup$1() {
    cmd$6('marriage', '结婚', CommandPermission.Everyone).setup(register => {
        register('marry <pl:player>', (cmd, ori, out, { pl }) => {
            const player = pl[0];
            if (!player) {
                return out.error('找不到玩家');
            }
            propose(ori.player?.xuid, player.xuid);
        });
        register('divorce <pl:player>', (cmd, ori, out, { pl }) => {
            const player = pl[0];
            if (!player) {
                return out.error('找不到玩家');
            }
            divorce(ori.player?.xuid, player.xuid);
        });
    });
}

var setup$2 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	setup: setup$1
});

var require$$14 = /*@__PURE__*/getAugmentedNamespace(setup$2);

class JsonConf {
    filePath;
    constructor(filePath, defaultVal) {
        this.filePath = filePath;
        try {
            this._cache = this.read();
        }
        catch {
            this._cache = defaultVal;
            this.write(defaultVal);
        }
    }
    _cache;
    read() {
        const data = fs.readFileSync(this.filePath, 'utf8');
        return JSON.parse(data);
    }
    write(data) {
        fs.writeFile(this.filePath, JSON.stringify(data, null, 4), () => { });
    }
    update() {
        this.write(this._cache);
    }
    reload() {
        this._cache = this.read();
    }
    delete(key) {
        delete this._cache[key];
        this.update();
    }
    get(key) {
        return this._cache[key];
    }
    set(key, value) {
        this._cache[key] = value;
        this.update();
    }
    has(key) {
        return this._cache.hasOwnProperty(key);
    }
    clear() {
        this.write({});
        this._cache = {};
    }
    remove() {
        fs.unlinkSync(this.filePath);
    }
    exists() {
        return fs.existsSync(this.filePath);
    }
    init(name, defaultVal) {
        if (!this.exists()) {
            this.set(name, defaultVal);
        }
        return this.get(name);
    }
}

function testMatch(item, matcher) {
    return typeof matcher === 'function' ? matcher(item) : matcher === item;
}

const accessibility = db$3('data/accessibility');
const config = new JsonConf('ServerConfig/accountConf.json', {
    register: {
        title: '注册',
        hint: '注册你的云梦之城账号，请记住你的密码，这里没有机会修改密码',
        error: '你已经注册过了',
        success: '欢迎来到云梦之城',
        timeout: {
            time: 30,
            message: '你注册超时了'
        }
    },
    login: {
        title: '登录',
        hint: '登录你的云梦之城账号，请输入你的密码',
        error: '密码错误',
        success: '欢迎回来',
        timeout: {
            time: 30,
            message: '你登录超时了'
        },
        banned: '你已被封禁，剩余：',
        denied: '你并未受邀在服务器进行游戏',
    },
    ban: {
        title: '封禁',
        hint: '封禁一个玩家',
    },
    persistent: {
        title: '保持登录',
        hint: '设置保持登录时长，在此时长内不更改 IP 即可自动保持登录'
    },
    remove: {
        title: '移除',
        hint: '移除一个玩家'
    },
    server: {
        port: 13487
    }
});
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const online = new Set();
const listeners = new events$1.EventEmitter();
function kick(pl, reason) {
    pl.kick(reason);
    listeners.emit('kick', pl, reason);
}
function verifyPassword(passwd) {
    if (passwd.length < 6 ||
        passwd.length > 16 ||
        passwd.match(/^[a-z]{6,16}$/) ||
        passwd.match(/^[A-Z]{6,16}$/) ||
        passwd.match(/^[0-9]{6,16}$/)) {
        return false;
    }
    return true;
}
function createAccount(pl, passwd, allow = true) {
    const registerConf = config.get('register');
    const kickTimer = setTimeout(() => {
        kick(pl, registerConf.timeout.message);
        listeners.emit('timeout', pl);
    }, registerConf.timeout.time * 1000);
    if (accessibility.get(pl.xuid)) {
        pl.sendToast(registerConf.title + '错误', registerConf.error);
        return;
    }
    if (!verifyPassword(passwd)) {
        pl.sendToast(registerConf.title + '错误', '密码过于简单');
        return registerUi(pl);
    }
    clearTimeout(kickTimer);
    const info = {
        name: pl.name,
        allow,
        passwd,
    };
    accessibility.set(pl.xuid, info);
    listeners.emit('create', pl, info);
    pl.sendToast(registerConf.title + '成功', registerConf.success);
    online.add(pl.xuid);
}
function activateAccount(pl) {
    const info = accessibility.get(pl.xuid);
    if (info) {
        info.allow = true;
        accessibility.set(pl.xuid, info);
        listeners.emit('activate', pl, info);
    }
}
function deactivateAccount(pl) {
    const info = accessibility.get(pl.xuid);
    if (info) {
        info.allow = false;
        accessibility.set(pl.xuid, info);
        listeners.emit('deactivate', pl, info);
    }
}
function verifyBanned(pl) {
    const info = accessibility.get(pl.xuid);
    if (info && info.ban) {
        const { ban } = info;
        if (ban.time + ban.duration > Date.now()) {
            kick(pl, `由于${ban.reason}\n` + config.get('login').banned + `${Math.ceil((ban.time + ban.duration - Date.now()) / 1000 / 60 / 60)}小时`);
            return true;
        }
    }
    return false;
}
function verifyAccount(pl, passwd) {
    if (online.has(pl.xuid)) {
        return pl.sendText('你已经登录了');
    }
    const info = accessibility.get(pl.xuid);
    const loginConf = config.get('login');
    if (!info) {
        return registerUi(pl);
    }
    if (!info.allow) {
        pl.sendToast(loginConf.title + '错误', loginConf.denied);
    }
    if (info.passwd === passwd) {
        pl.sendToast(loginConf.title + '成功', loginConf.success);
        online.add(pl.xuid);
        listeners.emit('login', pl, info);
    }
    else {
        pl.sendToast(loginConf.title + '错误', loginConf.error);
        loginUi(pl);
    }
}
function updatePersistentLogin(pl, duration, ip) {
    if (!online.has(pl.xuid)) {
        return loginUi(pl);
    }
    const info = accessibility.get(pl.xuid);
    if (!info) {
        return;
    }
    info.persistent = {
        time: Date.now(),
        duration,
        ip,
    };
    accessibility.set(pl.xuid, info);
    listeners.emit('updatePersistentLogin', pl, info);
}
function dropPersistentLogin(pl) {
    const info = accessibility.get(pl.xuid);
    if (!info) {
        return;
    }
    delete info.persistent;
    accessibility.set(pl.xuid, info);
}
function verifyPersistentLogin(pl) {
    const info = accessibility.get(pl.xuid);
    if (!info) {
        return false;
    }
    const { persistent } = info;
    if (!persistent) {
        return false;
    }
    const { time, duration, ip } = persistent;
    if (time + duration < Date.now()) {
        return false;
    }
    if (ip !== pl.getDevice().ip) {
        return false;
    }
    listeners.emit('login', pl, info);
    return true;
}
function banAccount(pl, reason, duration = 4 * HOUR) {
    const info = accessibility.get(pl.xuid);
    const banConf = config.get('ban');
    if (!info) {
        return pl.sendText(banConf.title + '错误');
    }
    info.ban = {
        xuid: pl.xuid,
        time: Date.now(),
        duration,
        reason,
    };
    accessibility.set(pl.xuid, info);
    kick(pl, reason);
}
function banXuid(xuid) {
    const info = accessibility.get(xuid);
    const pl = mc.getPlayer(xuid);
    info.ban = {
        time: Date.now(),
        duration: Number.MAX_SAFE_INTEGER,
        reason: 'Ban from console',
    };
    accessibility.set(xuid, info);
    if (pl) {
        kick(pl, 'Ban from console');
    }
}
function unbanXuid(xuid) {
    const info = accessibility.get(xuid);
    if (info) {
        delete info.ban;
        accessibility.set(xuid, info);
    }
}
function removeAccount(xuid) {
    accessibility.delete(xuid);
    const pl = mc.getPlayer(xuid);
    if (pl) {
        kick(pl, '你的账号已被移除');
    }
}
function timeoutWarning(pl, action, duration) {
    pl.sendToast('警告', `你有${Math.ceil(duration / 1000)}秒的时间完成${action}，否则你将会被踢出服务器`);
}
function registerUi(pl) {
    const registerConf = config.get('register');
    const { time, message } = registerConf.timeout;
    const kickTimer = setTimeout(() => {
        kick(pl, message);
    }, time * 1000);
    ui.widget(registerConf.title, [
        ui.Label(registerConf.hint),
        ui.Input('请输入你的密码', '', '', (pl, val) => {
            clearTimeout(kickTimer);
            createAccount(pl, val);
        })
    ], () => timeoutWarning(pl, '注册', time * 1000)).send(pl);
}
function loginUi(pl) {
    const loginConf = config.get('login');
    const { time } = loginConf.timeout;
    const kickTimer = setTimeout(() => {
        kick(pl, loginConf.timeout.message);
        listeners.emit('timeout', pl);
    }, loginConf.timeout.time * 1000);
    ui.widget(loginConf.title, [
        ui.Label(loginConf.hint),
        ui.Input('请输入你的密码', '', '', (pl, val) => {
            clearTimeout(kickTimer);
            verifyAccount(pl, val);
        })
    ], () => timeoutWarning(pl, loginConf.title, time * 1000)).send(pl);
}
function banUi(player) {
    if (!accessibility.get(player.xuid)) {
        return player.sendText(`${player.name} 没有注册`);
    }
    const banConf = config.get('ban');
    const players = mc.getOnlinePlayers();
    let banArgs = {};
    ui.widget(banConf.title, [
        ui.Label(banConf.hint),
        ui.Dropdown('选择玩家', players.map(pl => pl.name), 0, (_, val) => {
            banArgs.player = players[val];
        }),
        ui.Switch('永久封禁', false, (_, val) => banArgs.permanent = val),
        ui.Slider('封禁时长 (小时)', 1, 168, 1, 1, (_, val) => {
            banArgs.duration = val * HOUR;
        }),
        ui.Input('理由', '', '', (pl, val) => {
            banArgs.reason = val;
            if (banArgs.permanent) {
                banArgs.duration = Infinity;
            }
            banAccount(banArgs.player, banArgs.reason, banArgs.duration);
        })
    ]).send(player);
}
function persistentUi(player) {
    const persistConf = config.get('persistent');
    const persistentPrev = accessibility.get(player.xuid)?.persistent;
    const persistent = {
        enable: Boolean(persistentPrev),
        time: persistentPrev?.time ?? Date.now(),
        duration: persistentPrev?.duration ?? 0,
        ip: persistentPrev?.ip ?? player.getDevice().ip,
    };
    ui.widget(persistConf.title, [
        ui.Label(persistConf.hint),
        ui.Switch('启用保持登录', persistent.enable, (_, val) => {
            persistent.enable = val;
        }),
        ui.Slider('保持时长(天) ', 1, 30, 1, persistent.duration / DAY, (_, val) => {
            persistent.duration = val * DAY;
            if (persistent.enable) {
                updatePersistentLogin(player, persistent.duration, persistent.ip);
                player.sendText(`保持登录已开启，有效时长为${persistent.duration / DAY}天`);
            }
            else {
                dropPersistentLogin(player);
                player.sendText('保持登录已关闭');
            }
        })
    ]).send(player);
}
function removeUi(pl) {
    const removeConf = config.get('remove');
    ui.action(removeConf.title, removeConf.hint, selectAccount({}).map(pl_ => ({
        text: pl_.name,
        onClick() {
            ui.alert(removeConf.title, `移除玩家: ${pl_.name}`, '确定', '取消', () => removeAccount(pl_.xuid)).send(pl);
        }
    }))).send(pl);
}
function AccountServerEmitter() {
    return `
    <script>
        window.open('/ui', 'AccountServiceUi', 'popup=true,width=400,height=500')
        window.close()
    </script>
    `;
}
function AccountServerUI() {
    return `
    <head>
        <title>Account Service</title>
    </head>
    <style>
        body {
            padding: 0;
            margin: 0;
        }

        #app {
            display: flex;
            flex-direction: column;
            height: 100vh;
            width: 100vw;
        }
        .item {
            padding: 10px;
        }
        .item:hover {
            background-color: #eee;
            padding: 10px;
        }
    </style>
    <script>
        function onClick(xuid, ev) {
            console.log(xuid, ev.target.checked)
            fetch('/ban?xuid=' + xuid + '&ban=' + ev.target.checked)
        }
    </script>
    <div id='app'>
        <div class="item" style="display: flex; justify-content: space-between; align-items: center; background-color: #ddd; font-weight: bold;">
            <label>PLAYER</label>
            <label>BANNED</label>
        </div>
        ${accessibility.listKey().map(xuid => {
        const { name, ban } = accessibility.get(xuid);
        const banned = !!ban;
        return `
            <div class="item" style="display: flex; justify-content: space-between; align-items: center;">
                ${name}
                <lable>
                    <input type="checkbox" ${banned ? 'checked' : ''}" onclick="onClick('${xuid}', event)" />
                </label>
            </div>
            `;
    }).join('')}
    </div>
    `;
}
function makeServer() {
    http.createServer((req, res) => {
        if (req.url === '/') {
            return res.end(AccountServerEmitter());
        }
        if (req.url === '/ui') {
            return res.end(AccountServerUI());
        }
        if (req.url?.startsWith('/ban')) {
            const { xuid, ban } = qs.parse(req.url.split('?')[1]);
            if (ban === 'true') {
                banXuid(xuid);
            }
            else {
                unbanXuid(xuid);
            }
            res.end();
        }
    })
        .listen(config.get('server').port, () => {
        console.log(`Account service is running on http://localhost:${config.get('server').port}`);
    });
}
function selectAccount(opt) {
    if (typeof opt === 'string') {
        const info = accessibility.get(opt);
        if (info) {
            return [info];
        }
        else {
            throw new Error(`No account found for xuid: ${opt}`);
        }
    }
    const xuids = accessibility.listKey();
    return xuids
        .map(xuid => ({ xuid, ...accessibility.get(xuid) }))
        .filter(info => {
        if (!info) {
            return false;
        }
        const { name, allow, ban, persistent } = info;
        if (opt.name && !testMatch(name, opt.name)) {
            return false;
        }
        if (opt.allow && !testMatch(allow, opt.allow)) {
            return false;
        }
        if (ban && opt.ban && !testMatch(ban, opt.ban)) {
            return false;
        }
        if (persistent && opt.persistent && !testMatch(persistent, opt.persistent)) {
            return false;
        }
        return true;
    });
}
function selectAccountUi(operator) {
}
function setup() {
    cmd$6('account', '账户操作', CommandPermission.Everyone).setup(register => {
        register('register', (cmd, { player }) => registerUi(player));
        register('login', (cmd, { player }) => loginUi(player));
        register('persistent', (cmd, { player }) => persistentUi(player));
        register('resetpwd <pwd:text> <verify_pwd:text>', (cmd, { player }, out, args) => setPlayerPasswd(player, player.xuid, args.pwd, args.verify_pwd));
    });
    cmd$6('account_op', '管理员账户操作', CommandPermission.OP).setup(register => {
        register('ban', (cmd, { player }) => banUi(player));
        register('remove', (cmd, { player }) => removeUi(player));
        register('listinfo', (cmd, { player }) => getAllPlayerInfo(player));
        register('info <player_name:text>', (cmd, { player }, out, args) => getPlayerInfo(player, args.name));
        register('resetpwd <xuid:text> <pwd:text> <verify_pwd:text>', (cmd, { player }, out, args) => setPlayerPasswd(player, args.xuid, args.pwd, args.verify_pwd));
    });
    mc.listen('onJoin', pl => {
        if (!accessibility.get(pl.xuid)) {
            return registerUi(pl);
        }
        if (verifyPersistentLogin(pl)) {
            pl.sendToast('提示', '你已保持登录');
            return online.add(pl.xuid);
        }
        loginUi(pl);
    });
    mc.listen('onPreJoin', pl => {
        verifyBanned(pl);
    });
    mc.listen('onLeft', pl => {
        online.delete(pl.xuid);
    });
    makeServer();
}
function setPlayerPasswd(pl, xuid, pwd, verify_pwd) {
    const info = accessibility.get(xuid);
    if (!info) {
        return pl.sendText(`${info.name} 没有注册`);
    }
    if (!verifyPassword(pwd)) {
        return pl.sendText('密码过于简单');
    }
    if (pwd !== verify_pwd) {
        return pl.sendText('密码前后不一致');
    }
    info.passwd = pwd;
    accessibility.set(xuid, info);
    pl.sendText(`玩家 ${xuid} 的密码已设置为 ${pwd}`);
}
function getAllPlayerInfo(pl) {
    const res = accessibility.listKey().map(xuid => {
        const { name, passwd } = accessibility.get(xuid);
        return `[${name},${xuid},${passwd}],`;
    }).join('');
    if (pl) {
        pl.sendText(res);
    }
    return res;
}
function getPlayerInfo(pl, player_name) {
    const res = accessibility.listKey().map(xuid => {
        const { name, passwd } = accessibility.get(xuid);
        if (player_name == name)
            return `[${name},${xuid},${passwd}],`;
    }).join('');
    if (pl) {
        pl.sendText(res);
    }
    return res;
}

var account = /*#__PURE__*/Object.freeze({
	__proto__: null,
	activateAccount: activateAccount,
	banAccount: banAccount,
	banXuid: banXuid,
	createAccount: createAccount,
	deactivateAccount: deactivateAccount,
	dropPersistentLogin: dropPersistentLogin,
	listeners: listeners,
	removeAccount: removeAccount,
	selectAccount: selectAccount,
	selectAccountUi: selectAccountUi,
	setup: setup,
	unbanXuid: unbanXuid,
	updatePersistentLogin: updatePersistentLogin,
	verifyAccount: verifyAccount,
	verifyBanned: verifyBanned,
	verifyPersistentLogin: verifyPersistentLogin
});

var require$$15 = /*@__PURE__*/getAugmentedNamespace(account);

const { load } = loadModule;

const modules = [
    whoami,
    speed,
    require$$3,
    overShoulder,
    notification,
    motd,
    setup$8,
    shell,
    setup_1$1,
    kinematics,
    setup_1,
    affair,
    require$$13,
    require$$14,
    require$$15,
];

mc.listen('onServerStarted',() => modules.forEach(m => load(m)));

module.exports = yuumo;
