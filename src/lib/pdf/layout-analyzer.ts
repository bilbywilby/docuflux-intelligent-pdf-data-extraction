export interface TextItem {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
}
/**
 * Reconstructs logical lines from PDF text fragments using spatial coordinates.
 * PDFs often store text out of order or as individual characters.
 */
export function groupByLines(items: TextItem[]): string {
  if (items.length === 0) return '';
  // 1. Sort primarily by Y (top to bottom), then by X (left to right)
  // Note: PDF coordinates usually have (0,0) at the bottom-left.
  // We sort Y descending so we read from top of page down.
  const sorted = [...items].sort((a, b) => {
    if (Math.abs(a.y - b.y) > 5) { // 5 unit tolerance for "same line"
      return b.y - a.y;
    }
    return a.x - b.x;
  });
  let reconstructed = '';
  let lastY = sorted[0].y;
  for (const item of sorted) {
    // If the Y coordinate shifted significantly, it's a new line
    if (Math.abs(item.y - lastY) > 5) {
      reconstructed += '\n';
      lastY = item.y;
    } else if (reconstructed.length > 0 && !reconstructed.endsWith('\n')) {
      // Add space between items on the same line if they aren't touching
      reconstructed += ' ';
    }
    reconstructed += item.str;
  }
  return reconstructed;
}