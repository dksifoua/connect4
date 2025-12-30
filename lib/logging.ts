export type LoggingLevel = "debug" | "info" | "warn" | "error" | "fatal" | "none"

const priority: Record<LoggingLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    fatal: 4,
    none: 5
}

const colors: Record<LoggingLevel, string> = {
    debug: Bun.color("cyan", "ansi")!,
    info: Bun.color("green", "ansi")!,
    warn: Bun.color("yellow", "ansi")!,
    error: Bun.color("rgb(255, 130, 114)", "ansi")!,
    fatal: Bun.color("magenta", "ansi")!,
    none: Bun.color("gray", "ansi")!
}

export class Logging {

    private readonly name: string
    private readonly minLevel: LoggingLevel

    public constructor(name: string, minLevel?: LoggingLevel) {
        this.name = name
        this.minLevel = minLevel || "none"
    }

    public debug(message: string, ...args: any[]): void {
        this.log("debug", message, ...args)
    }

    public info(message: string, ...args: any[]): void {
        this.log("info", message, ...args)
    }

    public warn(message: string, ...args: any[]): void {
        this.log("warn", message, ...args)
    }

    public error(message: string, ...args: any[]): void {
        this.log("error", message, ...args)
    }

    public fatal(message: string, ...args: any[]): void {
        this.log("fatal", message, ...args)
        process.exit(1)
    }

    private log(level: LoggingLevel, message: string, ...args: any[]): void {
        if (priority[level] < priority[this.minLevel]) return

        const timestamp = new Date().toISOString()
        const upperLevel = level.toUpperCase().padEnd(5)
        const reset = ["error", "fatal"].includes(level) ? colors["error"] : "\x1b[0m"
        const color = colors[level]
        const formattedMessage = `[${timestamp}] [${this.name}] [${color}${upperLevel}${reset}] ${message}`

        switch (level) {
            case "debug":
                console.debug(formattedMessage, ...args)
                break
            case "info":
                console.info(formattedMessage, ...args)
                break
            case "warn":
                console.warn(formattedMessage, ...args)
                break
            case "error":
                console.error(formattedMessage, ...args)
                break
            case "fatal":
                console.error(formattedMessage, ...args)
        }
    }
}