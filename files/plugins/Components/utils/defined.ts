//#define __comment__end */
//#define __comment__start /*

//@ts-ignore
__comment__start

export const returnIf = (cond: boolean, value: any) => {
//#inline returnIf (cond, value)
    if (cond) {
        return value
    }
//!inline
}

export const interruptIf = (cond: boolean) => {
//#inline interruptIf (cond)
    if (cond) {
        return
    }
//!inline
}

export const returnExcept = (cond: boolean, value: any) => {
//#inline returnExcept (cond, value)
    if (!(cond)) {
        return value
    }
//!inline
}
    
export const interruptExcept = (cond: boolean) => {
//#inline interruptExcept (cond)
    if (!(cond)) {
        return
    }
//!inline
}

//@ts-ignore
__comment__end