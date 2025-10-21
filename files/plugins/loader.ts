import { loadEntries } from './ServerConfig/loaderConfig'
import fs from 'fs/promises'
import path from 'path'
import targz from 'targz'
import os from 'os'

export function load(m: CallableFunction | Record<keyof typeof loadEntries, CallableFunction>) {
    if (typeof m === 'function') {
        return m()
    }

    for (const k of loadEntries) {
        if (typeof m[k as keyof typeof m] === 'function') {
            return m[k as keyof typeof m]()
        }
    }
}

const tmpNamespace = 'meisterhauPacks'

class PackManager {
    async scan() {
        return fs.readdir('./packs')
    }

    async tryDecompress(packName: string) {
        const targetDir = path.join(os.tmpdir(), tmpNamespace, packName)
    }
}