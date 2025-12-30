import { afterEach, beforeEach, describe, expect, type Mock, spyOn, test } from "bun:test"
import { Container } from "@/lib/ioc/container"
import { Inject, Injectable } from "@/lib/ioc/dependency"

describe("IoC Container", () => {
    let container: Container
    let mockExit: Mock<any>

    beforeEach(() => {
        container = new Container()
        mockExit = spyOn(process, "exit")
            .mockImplementation((number) => {
                throw new Error(`process.exit: ${number}`)
            })
    })

    afterEach(() => {
        container.dispose()
        mockExit.mockRestore()
    })

    test("should resolve a dependency", () => {
        class TestClass {
        }

        container.register(TestClass, TestClass)
        const instance = container.resolve(TestClass)

        expect(instance).toBeInstanceOf(TestClass)
    })

    test("should resolve the same instance of the same dependency", () => {
        class TestClass {
        }

        container.register(TestClass, TestClass)
        const instance1 = container.resolve(TestClass)
        const instance2 = container.resolve(TestClass)

        expect(instance1).toBe(instance2)
    })

    test("should resolve nested dependencies", () => {
        @Injectable()
        class Database {
        }

        @Injectable()
        class Repository {
            constructor(public database: Database) {
            }
        }

        @Injectable()
        class Service {
            constructor(public repository: Repository) {
            }
        }

        container.register(Database, Database)
        container.register(Repository, Repository)
        container.register(Service, Service)

        const service = container.resolve(Service)

        expect(service).toBeInstanceOf(Service)
        expect(service.repository).toBeInstanceOf(Repository)
        expect(service.repository.database).toBeInstanceOf(Database)
    })

    test("should resolve via factory", () => {
        const token = "config"
        const configValue = { port: 3000 }

        container.register(token, (): typeof configValue => configValue)

        const resolved = container.resolve(token) as typeof configValue
        expect(resolved).toEqual(configValue)
    })

    test("should resolve with @Inject", () => {
        container.register("apiKey", () => "secret-123")

        @Injectable()
        class ApiClient {
            constructor(@Inject("apiKey") public key: string) {
            }
        }

        container.register(ApiClient, ApiClient)
        const client = container.resolve(ApiClient)
        expect(client.key).toBe("secret-123")
    })

    test("should throw error for a non registered dependency", () => {
        class Unregistered {
        }

        expect(() => {
            container.resolve(Unregistered)
        }).toThrow(/process.exit: 1/)
    })
})