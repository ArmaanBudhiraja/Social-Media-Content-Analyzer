import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import healthRouter from './routes/health.js';
import analyzeRouter from './routes/analyze.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testApiEndpoints() {
  console.log('🌐 Starting API Endpoints Integration Test...\n');
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/health', healthRouter);
  app.use('/api/analyze', analyzeRouter);

  const server = app.listen(0);
  const address: any = server.address();
  const port = address.port;
  const baseUrl = `http://localhost:${port}`;

  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, name: string) => {
    if (condition) {
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${name}`);
      failed++;
    }
  };

  try {
    // 1. Health endpoint test
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthData: any = await healthRes.json();
    assert(healthRes.status === 200 && healthData.status === 'healthy', 'GET /api/health returns 200 OK & healthy');

    // 2. Direct text analysis endpoint test
    const textRes = await fetch(`${baseUrl}/api/analyze/text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Stop doing manual work. PulseFlow 2.0 is here! Comment below to get beta access. #SaaS #Fintech',
        filename: 'manual-input.txt',
      }),
    });
    const textData: any = await textRes.json();
    assert(textRes.status === 200 && textData.success === true, 'POST /api/analyze/text returns 200 OK & success');
    assert(textData.metrics.hashtags.length === 2, 'Metrics extract hashtags in API');
    assert(textData.metrics.callToAction.detected === true, 'Metrics detect CTA in API');
    assert(textData.improvedDrafts.shortAndPunchy.length > 0, 'API returns alternative draft variations');

    // 3. File upload endpoint test with sample PDF
    const samplePdfPath = path.resolve(__dirname, '../../sample-files/social-growth-strategy.pdf');
    const pdfBlob = new Blob([fs.readFileSync(samplePdfPath)], { type: 'application/pdf' });
    const formData = new FormData();
    formData.append('file', pdfBlob, 'social-growth-strategy.pdf');

    const uploadRes = await fetch(`${baseUrl}/api/analyze/upload`, {
      method: 'POST',
      body: formData,
    });
    const uploadData: any = await uploadRes.json();
    assert(uploadRes.status === 200 && uploadData.success === true, 'POST /api/analyze/upload parses PDF and analyzes content');
    assert(uploadData.extractedContent.method === 'pdf_parser', 'Uploaded file extracted via pdf_parser');
    assert(uploadData.extractedContent.text.includes('Social Media Growth Blueprint'), 'Extracted text contains original PDF content');

    // 4. Invalid file upload test
    const invalidFormData = new FormData();
    invalidFormData.append('file', new Blob([Buffer.from('corrupt exe')], { type: 'application/x-dosexec' }), 'virus.exe');

    const badUploadRes = await fetch(`${baseUrl}/api/analyze/upload`, {
      method: 'POST',
      body: invalidFormData,
    });
    const badData: any = await badUploadRes.json();
    assert(badUploadRes.status === 400 && badData.success === false, 'POST /api/analyze/upload gracefully rejects invalid file types with 400 Bad Request');

    console.log(`\n========================================`);
    console.log(`🏁 API TESTS: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);
  } catch (err) {
    console.error('API test failed with error:', err);
    failed++;
  } finally {
    server.close();
    if (failed > 0) process.exit(1);
  }
}

testApiEndpoints();
