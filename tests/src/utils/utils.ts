import { jest } from "bun:test"
import type { MockProxy } from "./types"

export const createMockProxy = function <T extends object>(): MockProxy<T> {
    const cache = new Map<string | symbol, any>()
    
    return new Proxy<MockProxy<T>>({} as MockProxy<T>, {
        get(_target: any, prop: string | symbol, _receiver: any): any {
            if (!cache.has(prop)) {
                const mockFn = jest.fn()
                cache.set(prop, mockFn)
            }
            return cache.get(prop)
        },
        set(_target: any, prop: string | symbol, newValue: any, _receiver: any): boolean {
            cache.set(prop, newValue)
            return true
        }
    })
}
