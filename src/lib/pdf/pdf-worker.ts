import * as pdfjs from 'pdfjs-dist';
/**
 * Standard Vite URL constructor for the worker to avoid 'import ... ?url' lint issues
 * and provide a more robust path resolution in production.
 */
const workerUrl = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).href;
pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
export { pdfjs };