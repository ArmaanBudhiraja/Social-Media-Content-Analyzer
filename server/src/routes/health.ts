import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      pdfParser: 'available',
      tesseractOcr: 'available',
      heuristicEngine: 'available',
      aiAssistant: process.env.GEMINI_API_KEY ? 'configured' : 'heuristic_mode',
    },
  });
});

export default router;
