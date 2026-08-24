import { validateUploadedFile } from './utils/fileValidation.js';
import { extractTextFromPdf } from './services/pdfExtractor.js';
import { analyzeSocialMediaContent } from './services/analyzer.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sampleDir = path.resolve(__dirname, '../../sample-files');

async function runTests() {
  console.log('🧪 Starting Comprehensive Social Media Content Analyzer Test Suite...\n');
  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, testName: string) => {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  };

  // 1. Test File Validation & Security
  console.log('📁 1. Testing File Validation & Security Handling...');
  const validPdfFile: any = {
    originalname: 'test-post.pdf',
    mimetype: 'application/pdf',
    size: 1024 * 50,
    buffer: Buffer.from('test buffer'),
  };
  assert(validateUploadedFile(validPdfFile).valid === true, 'Accepts valid PDF');
  assert(validateUploadedFile(validPdfFile).fileType === 'pdf', 'Detects PDF file type');

  const validImageFile: any = {
    originalname: 'scanned-flyer.png',
    mimetype: 'image/png',
    size: 1024 * 100,
    buffer: Buffer.from('image buffer'),
  };
  assert(validateUploadedFile(validImageFile).valid === true, 'Accepts valid PNG image');
  assert(validateUploadedFile(validImageFile).fileType === 'image', 'Detects Image file type');

  const emptyFile: any = {
    originalname: 'empty.pdf',
    mimetype: 'application/pdf',
    size: 0,
    buffer: Buffer.from(''),
  };
  assert(validateUploadedFile(emptyFile).valid === false, 'Rejects empty file');

  const oversizedFile: any = {
    originalname: 'huge.pdf',
    mimetype: 'application/pdf',
    size: 20 * 1024 * 1024,
    buffer: Buffer.alloc(100),
  };
  assert(validateUploadedFile(oversizedFile).valid === false, 'Rejects oversized file (>15MB)');

  const unsupportedFile: any = {
    originalname: 'malicious.exe',
    mimetype: 'application/x-msdownload',
    size: 1024,
    buffer: Buffer.from('binary'),
  };
  assert(validateUploadedFile(unsupportedFile).valid === false, 'Rejects unsupported executable file');

  // 2. Test Social Media Metrics Analyzer Engine
  console.log('\n📊 2. Testing Social Media Content Analyzer Metrics Engine...');
  const sampleSocialPost = `Stop doing 10 things at once.\n\nThe single biggest productivity killer is context switching. When you shift tasks every 10 minutes, you lose 40% of cognitive bandwidth.\n\nHere are 3 ways to protect deep work:\n1. Timebox your morning for 1 core deliverable\n2. Close Slack and email tabs\n3. Batch all communication into two 30-min windows\n\nWhat is your go-to rule for staying focused?\n\nDrop a comment below with your thoughts! 👇\n\n#DeepWork #Productivity #TimeManagement #Leadership @alexchen https://example.com/guide`;

  const { metrics, recommendations, improvedDrafts } = analyzeSocialMediaContent(sampleSocialPost);

  assert(metrics.wordCount > 50, `Calculates word count (${metrics.wordCount} words)`);
  assert(metrics.hashtags.length === 4, `Extracts hashtags correctly (${metrics.hashtags.join(', ')})`);
  assert(metrics.mentions.length === 1 && metrics.mentions[0] === '@alexchen', 'Extracts mentions (@alexchen)');
  assert(metrics.links.length === 1, 'Extracts links');
  assert(metrics.questionCount >= 1, 'Detects questions');
  assert(metrics.callToAction.detected === true, 'Detects Call to Action ("Drop a comment below")');
  assert(metrics.hookAnalysis.hookType === 'bold_claim', 'Identifies bold claim hook');
  assert(metrics.overallEngagementScore >= 70, `Calculates overall engagement score (${metrics.overallEngagementScore}/100 Grade ${metrics.engagementGrade})`);
  assert(metrics.readability.fleschReadingEase > 50, `Calculates Flesch readability (${metrics.readability.fleschReadingEase})`);
  assert(metrics.platformSuitability.twitter.charLimit === 280, 'Calculates Twitter platform suitability');
  assert(metrics.platformSuitability.linkedIn.charLimit === 3000, 'Calculates LinkedIn platform suitability');
  assert(recommendations.length >= 3, `Generates actionable recommendations (count: ${recommendations.length})`);
  assert(Boolean(improvedDrafts.shortAndPunchy && improvedDrafts.linkedinProfessional), 'Generates 1-click alternative drafts');

  // 3. Test PDF Extraction with generated sample PDFs
  console.log('\n📄 3. Testing PDF Text Extraction Engine with Real Documents...');
  const pdfPath1 = path.join(sampleDir, 'social-growth-strategy.pdf');
  const pdfBuffer1 = fs.readFileSync(pdfPath1);
  const pdfResult1 = await extractTextFromPdf(pdfBuffer1, 'social-growth-strategy.pdf');

  assert(pdfResult1.text.includes('Social Media Growth Blueprint'), 'Extracts header title from PDF');
  assert(pdfResult1.text.includes('Stop the scroll'), 'Preserves bullet points and formatting');
  assert(pdfResult1.method === 'pdf_parser', 'Tagged correctly as pdf_parser');
  assert(pdfResult1.metadata.pageCount === 1, 'Detects page count: 1');

  // Multi-page PDF test
  const pdfPath2 = path.join(sampleDir, 'enterprise-ai-multi-page.pdf');
  const pdfBuffer2 = fs.readFileSync(pdfPath2);
  const pdfResult2 = await extractTextFromPdf(pdfBuffer2, 'enterprise-ai-multi-page.pdf');
  assert(pdfResult2.metadata.pageCount === 2, `Extracts multi-page PDF (detected pages: ${pdfResult2.metadata.pageCount})`);
  assert(pdfResult2.text.includes('Part 1') && pdfResult2.text.includes('Part 2'), 'Extracts text across multiple pages seamlessly');

  // 4. Test Error Handling on Corrupt Buffer
  console.log('\n🛡️ 4. Testing Error Handling on Corrupt Document...');
  try {
    await extractTextFromPdf(Buffer.from('corrupt non-pdf raw string'), 'corrupt.pdf');
    failed++;
  } catch (err: any) {
    assert(err.message.includes('PDF parsing failed') || err.message.includes('No readable text'), 'Corrupt PDF rejected with user-friendly error');
  }

  console.log(`\n========================================`);
  console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
