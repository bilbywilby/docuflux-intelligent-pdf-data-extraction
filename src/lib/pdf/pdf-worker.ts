import * as pdfjs from 'pdfjs-dist';
// Use the bundled worker from the package. 
// In a Vite environment, we use the ?url suffix to get the correct path.
import workerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
export { pdfjs };