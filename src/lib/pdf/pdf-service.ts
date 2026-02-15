import { pdfjs } from './pdf-worker';
import { groupByLines, TextItem } from './layout-analyzer';
import { parseStructuredData, redactPHI, extractCostAnalysis } from './structured-parser';
export async function extractPdfData(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  try {
    const pdf = await loadingTask.promise;
    if (pdf.numPages > 100) {
      throw new Error("Split large PDFs (Max 100 pages)");
    }
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
      fullText += pageText + '\n';
    }
    const redactedText = redactPHI(fullText);
    const structured = parseStructuredData(fullText);
    const costAnalysis = extractCostAnalysis(fullText);
    return {
      rawText: fullText,
      redactedText,
      structuredData: structured,
      costAnalysis
    };
  } catch (error) {
    console.error('PDF Extraction Error:', error);
    throw error;
  } finally {
    loadingTask.destroy();
  }
}