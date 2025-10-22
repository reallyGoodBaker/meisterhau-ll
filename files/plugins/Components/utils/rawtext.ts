export namespace r {
    export function score(name: string, objective: string) {
        return {
            score: {
                name,
                objective,
            },
        }
    }

    export function translate(key: string) {
        return {
            translate: key,
        }
    }

    export const t = translate

    export function selector(expr: string) {
        return {
            selector: expr,
        }
    }
}

export function rawtext(seqs: TemplateStringsArray, ...args: any[]) {
    const rawtextArr: any[] = []
    for (let i = 0; i < seqs.length; i++) {
        rawtextArr.push({
            text: seqs[i],
        })
        const val = args[i]
        if (val) {
            if (typeof val === 'string') {
                rawtextArr.push({
                    text: val,
                })
                continue
            }

            rawtextArr.push(args[i])
        }
    }

    return JSON.stringify({
        rawtext: rawtextArr,
    })
}