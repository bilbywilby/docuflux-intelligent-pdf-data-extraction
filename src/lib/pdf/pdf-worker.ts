import * as pdfjs from 'pdfjs-dist';
// @ts-expect-error - Vite ?url suffix is specific to the build tool
import workerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
export { pdfjs };