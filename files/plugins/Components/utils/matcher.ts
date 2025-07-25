export type Matcher<T> = T | ((item: T) => boolean)

export function testMatch<T>(item: T, matcher: Matcher<T>): boolean {
    return typeof matcher === 'function' ? (matcher as any)(item) : matcher === item
}