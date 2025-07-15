import { db } from './db'

async function selectRootDir() {
    const dirHandle = await showDirectoryPicker({
        mode: 'readwrite'
    })

    return dirHandle
}

export class FileSystem {
    private static readonly _fileSystems: Map<FileSystemDirectoryHandle, FileSystem> = new Map()

    static async readFile(file: FileSystemFileHandle) {
        if (await file.queryPermission({ mode: 'read' }) !== 'granted') {
            try {
                if (await file.requestPermission({ mode: 'read' }) === 'granted') {
                    return file.getFile()
                }
            } finally {
                throw new Error('Permission denied')
            }
        }

        return file.getFile()
    }

    static async createFileWritable(file: FileSystemFileHandle, keepExistingData = false) {
        if (await file.queryPermission({ mode: 'readwrite' }) !== 'granted') {
            try {
                if (await file.requestPermission({ mode: 'readwrite' }) === 'granted') {
                    return file.createWritable()
                }
            } finally {
                throw new Error('Permission denied')
            }
        }

        return file.createWritable({ keepExistingData })
    }

    static async writeFile(file: FileSystemFileHandle, data: FileSystemWriteChunkType) {
        const writable = await this.createFileWritable(file)
        await writable.write(data)
        await writable.close()
    }

    static async appendFile(file: FileSystemFileHandle, data: FileSystemWriteChunkType) {
        const writable = await this.createFileWritable(file, true)
        await writable.write(data)
        await writable.close()
    }

    static async open(root: FileSystemDirectoryHandle, path: string, create=false) {
        const parts = path.split('/')
        const fileName = parts.pop()

        let currentDir = root
        for (const part of parts) {
            const dir = await currentDir.getDirectoryHandle(part, { create })
            currentDir = dir
        }

        return await currentDir.getFileHandle(fileName!, { create })
    }

    static async selectRootDir(dir: FileSystemDirectoryHandle) {
        return new FileSystem(dir)
    }

    static getOrCreate(dir: FileSystemDirectoryHandle) {
        const cached = this._fileSystems.get(dir)
        if (cached) {
            return cached
        }

        const fs = new FileSystem(dir)
        return fs
    }

    static async fromDirPicker() {
        try {
            const rootDir = await selectRootDir()
            db.set('rootDir', rootDir)
            return this.getOrCreate(rootDir)
        } catch {
            return null
        }
    }

    static async fromHistory() {
        const rootDir = await db.get('rootDir')
        return rootDir
            ? this.getOrCreate(rootDir)
            : null
    }

    static async readDir(dir: FileSystemDirectoryHandle) {
        const files = []
        for await (const file of dir.values()) {
            files.push(file)
        }

        return files
    }

    static async rmUnsafe(file: FileSystemDirectoryHandle | FileSystemFileHandle, recursive=false) {
        //@ts-ignore
        await file.remove({ recursive })
    }

    static async rm(dir: FileSystemDirectoryHandle, path: string, recursive=false) {
        if (path.includes('/')) {
            const parts = path.split('/')
            const fileName = parts.pop()

            let currentDir = dir
            for (const part of parts) {
                const dir = await currentDir.getDirectoryHandle(part)
                currentDir = dir
            }

            await currentDir.removeEntry(fileName!)
        }

        await dir.removeEntry(path, { recursive })
    }

    static async copyFile(from: FileSystemFileHandle, to: FileSystemFileHandle) {
        const source = await from.getFile()
        const writer = await FileSystem.createFileWritable(to)

        await source.stream().pipeTo(writer)
        await writer.close()
    }

    static async copyDir(from: FileSystemDirectoryHandle, to: FileSystemDirectoryHandle) {
        for await (const file of from.values()) {
            if (file.kind === 'file') {
                const toFile = await to.getFileHandle(file.name)
                await this.copyFile(file, toFile)
            } else {
                const toDir = await to.getDirectoryHandle(file.name)
                await this.copyDir(file, toDir)
            }
        }
    }

    static async copy(
        from: FileSystemFileHandle | FileSystemDirectoryHandle,
        to: FileSystemFileHandle | FileSystemDirectoryHandle
    ) {
        if (from.kind !== to.kind) {
            throw new Error('Cannot copy different types of files')
        }

        if (from.kind === 'file') {
            await this.copyFile(from, to as FileSystemFileHandle)
        }

        if (from.kind === 'directory') {
            await this.copyDir(from, to as FileSystemDirectoryHandle)
        }
    }

    static async move(
        from: FileSystemFileHandle | FileSystemDirectoryHandle,
        to: FileSystemFileHandle | FileSystemDirectoryHandle
    ) {
        await this.copy(from, to)
        await this.rmUnsafe(from, true)
    }

    constructor(
        public readonly root: FileSystemDirectoryHandle
    ) {
        if (!root) {
            throw new Error('No root directory')
        }

        FileSystem._requireReadWrite(root)
        FileSystem._fileSystems.set(root, this)
    }

    static async _requireReadWrite(handle: FileSystemFileHandle | FileSystemDirectoryHandle) {
        if (await handle.queryPermission({ mode: 'readwrite' }) !== 'granted') {
            try {
                if (await handle.requestPermission({ mode: 'readwrite' }) === 'granted') {
                    return
                }
            } finally {
                alert('Permission denied')
            }
        }
    }

    private _cachedHandles = new Map<string, FileSystemFileHandle>()

    readDir() {
        return FileSystem.readDir(this.root)
    }

    async readDirNames() {
        return (await this.readDir()).map(file => file.name)
    }

    async open(path: string, create=false) {
        const cached = this._cachedHandles.get(path)
        if (cached) {
            return cached
        }

        const handle = await FileSystem.open(this.root, path, create)
        this._cachedHandles.set(path, handle)
        return handle
    }

    async getWritable(path: string, keepExistingData = false) {
        return await FileSystem.createFileWritable(await this.open(path), keepExistingData)
    }

    async readFile(path: string) {
        return await FileSystem.readFile(await this.open(path))
    }

    async writeFile(path: string, data: FileSystemWriteChunkType) {
        return await FileSystem.writeFile(await this.open(path), data)
    }

    async appendFile(path: string, data: FileSystemWriteChunkType) {
        return await FileSystem.appendFile(await this.open(path), data)
    }

    async remove(path: string, recursive=false) {
        return await FileSystem.rm(this.root, path, recursive)
    }

    async copyTo(path: string, to: string) {
        return await FileSystem.copy(await this.open(path), await this.open(to))
    }

    async moveTo(path: string, to: string) {
        return await FileSystem.move(await this.open(path), await this.open(to))
    }

}