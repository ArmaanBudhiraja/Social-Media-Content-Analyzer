import { extractText } from 'unpdf';
import { ExtractionResult } from '../types/index.js';

export async function extractTextFromPdf(
  buffer: Buffer,
  filename: string
): Promise<ExtractionResult> {
  const startTime = Date.now();

  try {
    // extractText from unpdf handles all PDF versions, multi-page flows, and layout cleanly
    const result: any = await extractText(new Uint8Array(buffer), {
      mergePages: true,
    });

    const pagesText = result.text;
    const totalPages = result.totalPages;

    let rawText = '';
    if (typeof pagesText === 'string') {
      rawText = pagesText;
    } else if (Array.isArray(pagesText)) {
      rawText = pagesText.join('\n\n');
    }

    // Clean up carriage returns, preserve logical paragraph breaks
    rawText = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // Remove repeated multi-spaces on the same line while keeping indentation/line breaks
    const cleanedLines = rawText
      .split('\n')
      .map((line: string) => line.replace(/[ \t]+/g, ' ').trimEnd());

    // Group lines into clean paragraphs
    let cleanedText = cleanedLines.join('\n');

    // Replace 3+ consecutive newlines with 2 newlines (standard markdown/text paragraph)
    cleanedText = cleanedText.replace(/\n{3,}/g, '\n\n').trim();

    if (!cleanedText) {
      throw new Error(
        'No readable text could be extracted from this PDF. It might be a scanned document or contain only vector images. Try uploading it as an image to use OCR.'
      );
    }

    const duration = Date.now() - startTime;

    return {
      text: cleanedText,
      method: 'pdf_parser',
      metadata: {
        filename,
        fileSize: buffer.length,
        mimeType: 'application/pdf',
        processingTimeMs: duration,
        pageCount: totalPages || 1,
      },
    };
  } catch (error: any) {
    if (error.message && error.message.includes('No readable text')) {
      throw error;
    }
    throw new Error(
      `PDF parsing failed: ${error.message || 'Corrupt or unreadable PDF document.'}`
    );
  }
}
