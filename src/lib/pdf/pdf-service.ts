import { pdfjs } from './pdf-worker';
import { groupByLines, TextItem } from './layout-analyzer';
import { parseStructuredData } from './structured-parser';
export async function extractPdfData(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  try {
    const pdf = await loadingTask.promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const items: TextItem[] = content.items.map((item: any) => ({
        str: item.str,
        x: item.transform[4],
        y: item.transform[5],
        width: item.width,
        height: item.height,
      }));
      const pageText = groupByLines(items);
      fullText += pageText + '\n\n--- Page Break ---\n\n';
    }
    const structured = parseStructuredData(fullText);
    return {
      rawText: fullText,
      structuredData: structured,
    };
  } catch (error) {
    console.error('PDF Extraction Error:', error);
    throw error;
  } finally {
    loadingTask.destroy();
  }
}