export default function interpolate(obj: any): any {
    if (typeof obj === "string") {
        const interpolated = obj.replace(/\${(\w+)(:-)?(.+)?}/, (_match, p1, _p2, p3) => {
            const interpolatedValue = Bun.env[p1] || p3
            if (interpolatedValue === undefined) {
                console.error(`Environment variable ${p1} not found and no default provided`)
                process.exit(1)
            }
            return interpolatedValue
        })

        if (interpolated.trim() !== "" && !isNaN(Number(interpolated))) {
            return Number(interpolated)
        }

        if (interpolated.toLowerCase() === "true") return true
        if (interpolated.toLowerCase() === "false") return false

        return interpolated
    }

    if (Array.isArray(obj)) {
        return obj.map(interpolate)
    }

    if (obj !== null && typeof obj === "object") {
        return Object.fromEntries(
            Object.entries(obj)
                .map(([k, v]) => [k, interpolate(v)])
        )
    }

    return obj
}