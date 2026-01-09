import type { BuildOutput } from "bun"
import { Logging } from "@/lib/logging"

const logging = new Logging("BuildClientCli", "info")

const result: BuildOutput = await Bun.build({
    entrypoints: ["./client/cli/cli.ts"],
    outdir: "dist",
    target: "bun",
    format:"esm",
    splitting: false,
    sourcemap: "none",
    env: "disable",
    minify: true,
    root: process.cwd(),
})

if (result.success) {
    logging.info("Build successful")
} else {
    logging.error("Build failed")
}