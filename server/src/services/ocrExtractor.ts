import { createWorker } from 'tesseract.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { ExtractionResult } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tessDataCachePath = path.resolve(__dirname, '../../tessdata');

export async function extractTextFromImage(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<ExtractionResult> {
  const startTime = Date.now();
  let worker: any = null;

  try {
    // Initialize Tesseract worker with dedicated local cache path
    worker = await createWorker('eng', 1, {
      cachePath: tessDataCachePath,
    });

    const result = await worker.recognize(buffer);
    const { text, confidence } = result.data;

    let cleanedText = (text || '')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n');

    // Clean up excessive whitespace while preserving paragraph structure
    const cleanedLines = cleanedText
      .split('\n')
      .map((line: string) => line.replace(/[ \t]+/g, ' ').trim());

    cleanedText = cleanedLines.join('\n').replace(/\n{3,}/g, '\n\n').trim();

    if (!cleanedText) {
      throw new Error(
        'OCR did not detect any readable text in the image. Please ensure the image is clear and contains visible text.'
      );
    }

    const duration = Date.now() - startTime;

    return {
      text: cleanedText,
      method: 'ocr',
      metadata: {
        filename,
        fileSize: buffer.length,
        mimeType: mimeType || 'image/png',
        processingTimeMs: duration,
        ocrConfidence: Math.round(confidence || 0),
      },
    };
  } catch (error: any) {
    if (error.message && error.message.includes('OCR did not detect')) {
      throw error;
    }
    throw new Error(
      `OCR extraction failed: ${error.message || 'Unable to process image.'}`
    );
  } finally {
    if (worker) {
      try {
        await worker.terminate();
      } catch (err) {
        console.error('Error terminating OCR worker:', err);
      }
    }
  }
}
