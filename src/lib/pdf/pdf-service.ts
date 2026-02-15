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
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export async function extractPdfData(file: File, onProgress?: (step: string) => void) {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  try {
    const pdf = await loadingTask.promise;
    if (pdf.numPages > 50) {
      throw new Error("Maximum 50 pages allowed for browser processing.");
    }
    onProgress?.('Initializing layers...');
    const pageImages: string[] = [];
    const maxSnapshots = 10;
    let fullText = '';
    let totalNativeTextLength = 0;
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      if (i <= maxSnapshots) {
        onProgress?.(`Capturing page ${i}...`);
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
      // Yield main thread
      if (i % 5 === 0) await sleep(10);
    }
    let method: 'native' | 'ocr' = 'native';
    let confidenceScore = 0.95;
    const flaggedReasons: string[] = [];
    if (totalNativeTextLength < 50 && pdf.numPages > 0) {
      onProgress?.('Running OCR fallback engine...');
      method = 'ocr';
      fullText = '';
      const worker = await Tesseract.createWorker('eng');
      try {
        for (let i = 1; i <= pdf.numPages; i++) {
          onProgress?.(`OCR processing page ${i}/${pdf.numPages}...`);
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2.0 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          if (context) {
            await page.render({ canvasContext: context, viewport }).promise;
            const { data: { text, confidence } } = await worker.recognize(canvas);
            fullText += text + '\n';
            confidenceScore = Math.min(confidenceScore, confidence / 100);
          }
          await sleep(10);
        }
      } finally {
        await worker.terminate();
      }
      if (confidenceScore < 0.7) flaggedReasons.push('Low OCR confidence');
    }
    onProgress?.('Finalizing audit structure...');
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
    console.error('[PDF Service] Extraction Failed:', error);
    throw error;
  } finally {
    if (loadingTask) {
      loadingTask.destroy();
    }
  }
}