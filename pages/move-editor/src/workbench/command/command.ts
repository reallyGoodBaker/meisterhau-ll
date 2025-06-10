import { useTab } from "../main/pager"

export interface ICommand {
    exec(): void;
    undo(): void;
}

const [ tab ] = useTab()

export class CommandStack {
    private commands: ICommand[] = []
    private maxSize: number = 16
    private current: number = -1

    private static readonly stacks = new Map<string, CommandStack>()

    constructor(private readonly path: string) {
        CommandStack.stacks.set(path, this)
    }

    static getOrCreate(path: string) {
        const candidate = CommandStack.stacks.get(path)
        if (candidate) {
            return candidate
        }

        return new CommandStack(path)
    }

    static getCurrent() {
        return this.getOrCreate(tab().path)
    }

    getPath() {
        return this.path
    }

    push(command: ICommand) {
        command.exec()
        if (this.commands.length >= this.maxSize) {
            this.commands.shift()
        }

        this.commands.push(command)
        this.current = this.commands.length - 1
    }

    undo() {
        if (this.current >= 0) {
            this.commands[this.current].undo()
            this.current--
        }
    }

    redo() {
        if (this.current < this.commands.length - 1) {
            this.current++
            this.commands[this.current].exec()
        }
    }

}