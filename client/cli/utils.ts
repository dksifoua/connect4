import type { BoardGrid } from "@/websocket"

export function render(grid: BoardGrid): string {
    const n_cols = grid[0]?.length || 0

    const header = "   " + Array.from({ length: n_cols }, (_, i) => ` ${i} `).join(' ')

    const body = grid.map(
        (row, rowIndex) => {
            const rowStr = row.map(cell => {
                if (cell === "red") return " R "
                if (cell === "yellow") return " Y "
                return " . "
            }).join("|")

            return `${rowIndex} |${rowStr}|`
        }).join("\n")

    return `${header}\n${body}`
}