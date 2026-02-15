import { pdfjs } from './pdf-worker';
import { groupByLines, TextItem } from './layout-analyzer';
import { parseStructuredData, redactPHI, extractCostAnalysis, detectTables } from './structured-parser';
import Tesseract from 'tesseract.js';
async function capturePageSnapshot(page: any, scale = 1.5): Promise<string> {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.height = viewport.height;
  canvas.width = viewport.width;
  if (!context) return '';
  await page.render({ canvasContext: context, viewport }).promise;
  return canvas.toDataURL('image/jpeg', 0.8);
}
export async function extractPdfData(file: File, onProgress?: (step: string) => void) {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  try {
    const pdf = await loadingTask.promise;
    if (pdf.numPages > 50) {
      throw new Error("Maximum 50 pages allowed for browser processing.");
    }
    onProgress?.('Generating page snapshots...');
    const pageImages: string[] = [];
    const maxSnapshots = 10;
    onProgress?.('Reading document layers...');
    let fullText = '';
    let totalNativeTextLength = 0;
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      // Capture snapshots for verification workspace (limit to first 10 for memory)
      if (i <= maxSnapshots) {
        const snapshot = await capturePageSnapshot(page);
        pageImages.push(snapshot);
      }
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
      totalNativeTextLength += pageText.trim().length;
    }
    let method: 'native' | 'ocr' = 'native';
    let confidenceScore = 0.95;
    const flaggedReasons: string[] = [];
    // Trigger OCR Fallback if native text is suspiciously sparse
    if (totalNativeTextLength < 50 && pdf.numPages > 0) {
      onProgress?.('Running OCR fallback...');
      method = 'ocr';
      fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        if (context) {
          await page.render({ canvasContext: context, viewport }).promise;
          const { data: { text, confidence } } = await Tesseract.recognize(canvas, 'eng');
          fullText += text + '\n';
          confidenceScore = Math.min(confidenceScore, confidence / 100);
        }
      }
      if (confidenceScore < 0.7) flaggedReasons.push('Low OCR confidence');
    }
    onProgress?.('Analyzing structure...');
    const redactedText = redactPHI(fullText);
    const structured = parseStructuredData(fullText);
    const costAnalysis = extractCostAnalysis(fullText);
    const tables = detectTables(fullText);
    return {
      rawText: fullText,
      redactedText,
      structuredData: structured,
      costAnalysis,
      tables,
      pageCount: pdf.numPages,
      pageImages,
      confidence: {
        score: confidenceScore,
        flaggedReasons,
        method
      }
    };
  } catch (error) {
    console.error('PDF Extraction Error:', error);
    throw error;
  } finally {
    loadingTask.destroy();
  }
}