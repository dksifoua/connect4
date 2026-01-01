import { afterEach, beforeEach, describe, expect, type Mock, spyOn, test } from "bun:test"
import { Logging, type LoggingLevel } from "@/lib/logging"

describe("Logging", () => {
    let consoleDebugSpy: Mock<any>
    let consoleInfoSpy: Mock<any>
    let consoleWarnSpy: Mock<any>
    let consoleErrorSpy: Mock<any>
    let consoleFatalSpy: Mock<any>
    let processExitSpy: Mock<any>

    beforeEach(() => {
        consoleDebugSpy = spyOn(console, "debug").mockImplementation(() => {})
        consoleInfoSpy = spyOn(console, "info").mockImplementation(() => {})
        consoleWarnSpy = spyOn(console, "warn").mockImplementation(() => {})
        consoleErrorSpy = spyOn(console, "error").mockImplementation(() => {})
        consoleFatalSpy = spyOn(console, "error").mockImplementation(() => {})
        processExitSpy = spyOn(process, "exit").mockImplementation((() => {}) as any)
    })

    afterEach(() => {
        consoleDebugSpy.mockRestore()
        consoleInfoSpy.mockRestore()
        consoleWarnSpy.mockRestore()
        consoleErrorSpy.mockRestore()
        consoleFatalSpy.mockRestore()
        processExitSpy.mockRestore()
    })

    test("should log info message when level is info", () => {
        const levels: [LoggingLevel, Mock<any>][] = [
            ["debug", consoleDebugSpy],
            ["info", consoleInfoSpy],
            ["warn", consoleWarnSpy],
            ["error", consoleErrorSpy],
            ["fatal", consoleFatalSpy]
        ]
        levels.forEach(([level, spy]: [LoggingLevel, Mock<any>]): void => {
            const logger = new Logging("TestLogger", level)

            logger[level as keyof Logging]("Hello world")
            const logMessage = (spy.mock.calls[0] as [string])[0]

            expect(logMessage).toContain("[TestLogger]")
            expect(logMessage).toContain(level.toUpperCase())
            expect(logMessage).toContain("Hello world")

            if (level === "fatal") expect(processExitSpy).toHaveBeenCalledWith(1)

            spy.mockClear()
        })
    })

    test("should NOT log debug message when level is info", () => {
        const logger = new Logging("TestLogger", "info")
        logger.debug("Should be hidden")

        expect(consoleDebugSpy).not.toHaveBeenCalled()
    })

    test("should handle multiple arguments in log", () => {
        const levels: [LoggingLevel, Mock<any>][] = [
            ["debug", consoleDebugSpy],
            ["info", consoleInfoSpy],
            ["warn", consoleWarnSpy],
            ["error", consoleErrorSpy],
            ["fatal", consoleFatalSpy]
        ]
        const randomIndex = Math.floor(Math.random() * levels.length)
        const [level, spy] = levels[randomIndex]!

        const logger = new Logging("TestLogger", level)
        const meta = { userId: 123 }
        logger[level as keyof Logging]("User logged in", meta)

        expect(spy).toHaveBeenCalled()

        const calls = spy.mock.calls[0] as [string, typeof meta]
        expect(calls[0]).toContain(level.toUpperCase())
        expect(calls[0]).toContain("User logged in")
        expect(calls[1]).toEqual(meta)
        if (level === "fatal") expect(processExitSpy).toHaveBeenCalledWith(1)
    })

    test("should log nothing when minLevel is 'none'", () => {
        const logger = new Logging("TestLogger", "none")
        logger.error("Hidden error")
        logger.info("Hidden info")

        expect(consoleErrorSpy).not.toHaveBeenCalled()
        expect(consoleInfoSpy).not.toHaveBeenCalled()
    })
})