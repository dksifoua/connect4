import type { Mock } from "bun:test"

export type MockProxy<T> = {
    [K in keyof T]: T[K] extends (...args: infer Args) => infer Return
        ? Mock<(...args: Args) => Return>
        : T[K]
}