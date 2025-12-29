import type { BuildOutput } from "bun"

const result: BuildOutput = await Bun.build({
    entrypoints: ["./src/server.ts"],
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
    console.log("Build successful")
} else {
    console.error("Build failed")
}