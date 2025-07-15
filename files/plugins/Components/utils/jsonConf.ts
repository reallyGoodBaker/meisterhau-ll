import fs from 'fs'

export class JsonConf<T extends Record<string, any>> {
    constructor(
        public readonly filePath: string,
        defaultVal: T
    ) {
        try {
            this._cache = this.read()
        } catch {
            this._cache = defaultVal
            this.write(defaultVal)
        }
    }

    private _cache: Record<string, any>

    public read(): any {
        const data = fs.readFileSync(this.filePath, 'utf8')
        return JSON.parse(data)
    }

    public write(data: any): void {
        fs.writeFile(this.filePath, JSON.stringify(data, null, 4), () => {})
    }

    public update(): void {
        this.write(this._cache)
    }

    public reload(): void {
        this._cache = this.read()
    }

    public delete(key: string): void {
        delete this._cache[key]
        this.update()
    }

    public get(key: keyof T): any {
        return this._cache[key as string]
    }

    public set(key: keyof T, value: any): void {
        this._cache[key as string] = value
        this.update()
    }

    public has(key: string): boolean {
        return this._cache.hasOwnProperty(key)
    }

    public clear(): void {
        this.write({})
        this._cache = {}
    }

    public remove(): void {
        fs.unlinkSync(this.filePath)
    }

    public exists(): boolean {
        return fs.existsSync(this.filePath)
    }

    public init<T>(name: string, defaultVal: T): T {
        if (!this.exists()) {
            this.set(name, defaultVal)
        }
        return this.get(name) as T
    }
}