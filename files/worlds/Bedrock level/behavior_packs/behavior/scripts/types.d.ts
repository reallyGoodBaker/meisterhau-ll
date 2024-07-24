interface CallExpr {
    id: string
    name: string
    args: unknown[]
}

interface ReturnExpr {
    id: string
    success: boolean
    val: unknown
}
