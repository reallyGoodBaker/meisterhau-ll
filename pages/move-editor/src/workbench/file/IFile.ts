export enum FileType {
    Fsm = 'Fsm',
    AnimClip = 'AnimClip',
}

export interface IFile {
    type: FileType
}