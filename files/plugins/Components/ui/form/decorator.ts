const exports = new Map()

export function Export(id: string) {
    return (target: Function) => {
        exports.set(id, target)
    }
}