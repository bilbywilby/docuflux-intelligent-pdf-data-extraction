import * as pdfjs from 'pdfjs-dist';
// @ts-ignore
import workerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
export { pdfjs };