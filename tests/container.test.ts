import { beforeEach, describe, expect, test } from "bun:test"
import { Container } from "@/lib/ioc/container"

describe("IoC Container", () => {
    let container: Container

    beforeEach(() => {
        container = new Container()
    })

    test("should resolve a class", () => {
        class TestClass {}

        container.register(TestClass, TestClass)
        const instance = container.resolve(TestClass)

        expect(instance).toBeInstanceOf(TestClass)
    })
})