import type { Mock } from "bun:test"

export type MockedClass<Class> = {
    [Method in keyof Class]: Class[Method] extends (...args: infer Args) => infer Return
        ? Mock<(...args: Args) => Return>
        : never
}