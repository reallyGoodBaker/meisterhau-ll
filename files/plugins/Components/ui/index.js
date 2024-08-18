function buildContextOpener(builder, contextSender, onCancelHandlerArgIndex) {
    return (...args) => {
        const onCancelHandler = args[onCancelHandlerArgIndex] || (() => { })
        args[onCancelHandlerArgIndex] = (...args) => {
            const val = onCancelHandler.apply(null, args)
            contextSender(args[0])
            return val
        }

        return builder.apply(null, args)
    }
}

function openAlert(sender) {
    return buildContextOpener(alert, sender, 5)
}

function openAction(sender) {
    return buildContextOpener(action, sender, 3)
}

function openWidget(sender) {
    return buildContextOpener(widget, sender, 2)
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

function alert(title, content, button1, buton2, onEnsure = Function.prototype, onReject = Function.prototype, onCancel = Function.prototype) {
    let ret = null
    const sender = pl => {
        let isUserAction = false
        setTimeout(() => {
            isUserAction = true
        }, 300);
        pl.sendModalForm(title, content, button1, buton2, (_, confirmed) => {
            if (!isUserAction) {
                return onCancel.call(ret, pl)
            }
            
            if (confirmed) {
                return onEnsure.call(ret, pl), undefined
            }
    
            return onReject.call(ret, pl), undefined
        })
    }
    return ret = uiReturnValBuilder(sender)
}

/**
 * @param {string} title 
 * @param {string} content 
 * @param {Array<{text: string; icon: string; onClick: (err: any, pl: any)=>void}>} buttonGroup 
 * @param {Function} onerror 
 * @returns 
 */
function action(title, content, buttonGroup = [], onerror = Function.prototype) {
    const buttons = [],
        images = [],
        handlers = []

    buttonGroup.forEach(conf => {
        const { text, icon, onClick } = conf
        buttons.push(text)
        images.push(icon || '')
        handlers.push(onClick)
    })

    let ret = null
    const sender = pl => {
        pl.sendSimpleForm(
            title, content,
            buttons, images,
            (pl, i) => {
                if (i === null) {
                    return onerror.call(ret, -1, pl)
                }

                try {
                    handlers[i].call(ret, 0, pl)
                } catch (err) {
                    try {
                        onerror.call(ret, err, pl)
                    } catch (er) {
                        throw er
                    }
                }
            }
        )
    }

    return ret = uiReturnValBuilder(sender)
}

function widget(title, elements = [], onerror = Function.prototype) {
    const fm = mc.newCustomForm()
    const handlers = []

    elements.forEach(el => {
        const { type, args, handler } = el

        handlers.push(handler)
        fm[`add${type}`](...args)
    })

    fm.setTitle(title)

    let ret = null
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
                    handlers[i].call(ret, pl, val)
                } catch (err) {
                    try {
                        onerror.call(ret, pl, err)
                    } catch (err) {
                        throw err
                    }
                }
            })
        })
    }

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
            : Function.prototype

        if (typeof args[args.length-1] === 'function') {
            const _handler = args.pop()
            handler = (pl, val) => {
                const _args = resolver.call(null, pl, val, args)
                _handler.apply(null, _args)
            }
        }

        return {
            type, args, handler
        }
    }
}

module.exports = {
    alert, action, widget,

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
}