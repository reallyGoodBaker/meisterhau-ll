import { Setter } from "solid-js"
import { ICommand } from "../../workbench/command/command"
import { getCurrentWorkbenchStatus } from "../../workbench/status/status"

export class TransformCommand implements ICommand {
    constructor(
        private transform: number[],
        private origin: number[],
        private oldTransform: number[],
        private oldOrigin: number[],
        private setTransform: Setter<number[]>,
        private setOrigin: Setter<number[]>,
    ) {}

    exec(): void {
        this.setTransform(this.transform)
        this.setOrigin(this.origin)
        const [ status, setStatus ] = getCurrentWorkbenchStatus<[ boolean, boolean ]>()
        setStatus([ true, status()[1] ])
    }

    undo(): void {
        this.setTransform(this.oldTransform)
        this.setOrigin(this.oldOrigin)
        const [ status, setStatus ] = getCurrentWorkbenchStatus<[ boolean, boolean ]>()
        setStatus([ true, status()[1] ])
    }
    
    static Builder = class {
        constructor(
            private oldTransform: number[],
            private oldOrigin: number[],
            private setTransform: Setter<number[]>,
            private setOrigin: Setter<number[]>,
        ) {}

        private _transform: number[] = []
        private _origin: number[] = []
        
        transform(transform: number[]): this {
            this._transform = transform
            return this
        }

        origin(origin: number[]): this {
            this._origin = origin
            return this
        }

        build(): TransformCommand {
            return new TransformCommand(
                this._transform,
                this._origin,
                this.oldTransform,
                this.oldOrigin,
                this.setTransform,
                this.setOrigin,
            )
        }
    }
}