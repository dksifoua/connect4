import type { BoardGrid } from "@/websocket"

export function render(grid: BoardGrid): string {
    const n_cols = grid.length
    const n_rows = grid[0]?.length || 0

    const header = "   " + Array.from({ length: n_cols }, (_, i) => ` ${i} `).join(' ')

    let body = ""
    for (let rowIndex = 0; rowIndex < n_rows; rowIndex++) {
        let rowStr = ""
        for (let colIndex = 0; colIndex < n_cols; colIndex++) {
            const cell = grid[colIndex]![rowIndex]
            let cellStr: string
            if (cell === "red") cellStr = " R "
            else if (cell === "yellow") cellStr = " Y "
            else cellStr = " . "

            rowStr += (colIndex === 0 ? "" : "|") + cellStr
        }
        body += `${rowIndex} |${rowStr}|\n`
    }

    return `${header}\n${body.trimEnd()}`
}