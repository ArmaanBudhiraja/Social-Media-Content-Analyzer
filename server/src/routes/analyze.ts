import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { validateUploadedFile, sanitizeFilename, MAX_FILE_SIZE_BYTES } from '../utils/fileValidation.js';
import { extractTextFromPdf } from '../services/pdfExtractor.js';
import { extractTextFromImage } from '../services/ocrExtractor.js';
import { analyzeSocialMediaContent } from '../services/analyzer.js';
import { enhanceWithAI } from '../services/aiService.js';
import { AnalysisResponse, ExtractionResult } from '../types/index.js';

const router = Router();

// Memory storage keeps operations fast and avoids orphaned temp files on disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: 1,
  },
});

// Upload and analyze file (PDF or Image)
router.post(
  '/upload',
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const file = req.file;

      const validation = validateUploadedFile(file);
      if (!validation.valid || !file) {
        res.status(400).json({
          success: false,
          error: validation.error || 'Invalid file uploaded.',
        });
        return;
      }

      const safeFilename = sanitizeFilename(file.originalname);
      let extractionResult: ExtractionResult;

      if (validation.fileType === 'pdf') {
        extractionResult = await extractTextFromPdf(file.buffer, safeFilename);
      } else {
        extractionResult = await extractTextFromImage(file.buffer, safeFilename, file.mimetype);
      }

      // Analyze extracted content with social media metrics engine
      const { metrics, recommendations: defaultRecs, improvedDrafts: defaultDrafts } =
        analyzeSocialMediaContent(extractionResult.text);

      // AI Enhancement (if Gemini key available, else graceful fallback)
      const { recommendations, drafts, aiGenerated } = await enhanceWithAI(
        extractionResult.text,
        metrics,
        defaultRecs,
        defaultDrafts
      );

      const responsePayload: AnalysisResponse = {
        success: true,
        extractedContent: extractionResult,
        metrics,
        recommendations,
        improvedDrafts: drafts,
        aiGenerated,
        timestamp: new Date().toISOString(),
      };

      res.json(responsePayload);
    } catch (err: any) {
      console.error('Extraction/Analysis error:', err);
      res.status(500).json({
        success: false,
        error: err.message || 'An unexpected error occurred while processing the document.',
      });
    }
  }
);

// Re-analyze direct text or user-edited text
router.post('/text', async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, filename = 'custom-text.txt' } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      res.status(400).json({
        success: false,
        error: 'Text content is required for analysis.',
      });
      return;
    }

    const cleanText = text.trim();

    const extractionResult: ExtractionResult = {
      text: cleanText,
      method: 'pdf_parser', // manual/text
      metadata: {
        filename: sanitizeFilename(filename),
        fileSize: Buffer.byteLength(cleanText, 'utf8'),
        mimeType: 'text/plain',
        processingTimeMs: 10,
      },
    };

    const { metrics, recommendations: defaultRecs, improvedDrafts: defaultDrafts } =
      analyzeSocialMediaContent(cleanText);

    const { recommendations, drafts, aiGenerated } = await enhanceWithAI(
      cleanText,
      metrics,
      defaultRecs,
      defaultDrafts
    );

    const responsePayload: AnalysisResponse = {
      success: true,
      extractedContent: extractionResult,
      metrics,
      recommendations,
      improvedDrafts: drafts,
      aiGenerated,
      timestamp: new Date().toISOString(),
    };

    res.json(responsePayload);
  } catch (err: any) {
    console.error('Text analysis error:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to analyze text content.',
    });
  }
});

export default router;
