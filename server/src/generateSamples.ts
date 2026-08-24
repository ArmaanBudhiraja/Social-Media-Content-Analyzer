import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sampleDir = path.resolve(__dirname, '../../sample-files');

if (!fs.existsSync(sampleDir)) {
  fs.mkdirSync(sampleDir, { recursive: true });
}

async function createSamplePdfs() {
  // 1. Create Social Media Marketing PDF
  const pdf1 = await PDFDocument.create();
  const font1 = await pdf1.embedFont(StandardFonts.Helvetica);
  const boldFont1 = await pdf1.embedFont(StandardFonts.HelveticaBold);
  
  const page1 = pdf1.addPage([595.28, 841.89]); // A4
  const { height } = page1.getSize();

  page1.drawText('Social Media Growth Blueprint 2026', {
    x: 50,
    y: height - 60,
    size: 20,
    font: boldFont1,
    color: rgb(0.1, 0.5, 0.3),
  });

  const lines = [
    '',
    'Why do 90% of creators plateau before reaching 10,000 followers?',
    '',
    'It is rarely an algorithm conspiracy. In most cases, the real issue is inconsistent hook positioning and weak viewer retention.',
    '',
    'Here are 3 core frameworks to scale your organic presence:',
    '1. Stop the scroll: Craft your first 8 words with curiosity, contrarian insight, or specific data.',
    '2. Format for mobile skim-reading: Use 1-2 sentence paragraphs and bullet points.',
    '3. Clear Call-To-Action: Guide your readers on exactly what to do next.',
    '',
    'What has been your biggest bottleneck in growing your audience this year?',
    '',
    'Drop a comment below with your thoughts and insights!',
    '',
    '#SocialMediaMarketing #ContentStrategy #OrganicReach #CreatorEconomy #GrowthHacking @growthteam https://growthstrategy.io'
  ];

  let yOffset = height - 100;
  for (const line of lines) {
    if (line.trim()) {
      page1.drawText(line, {
        x: 50,
        y: yOffset,
        size: 11,
        font: font1,
        color: rgb(0.15, 0.15, 0.15),
      });
    }
    yOffset -= 18;
  }

  const pdf1Bytes = await pdf1.save({ useObjectStreams: false });
  fs.writeFileSync(path.join(sampleDir, 'social-growth-strategy.pdf'), pdf1Bytes);
  console.log('✅ Generated sample-files/social-growth-strategy.pdf');

  // 2. Create Multi-Page PDF
  const pdf2 = await PDFDocument.create();
  const font2 = await pdf2.embedFont(StandardFonts.Helvetica);
  const boldFont2 = await pdf2.embedFont(StandardFonts.HelveticaBold);

  const pageA = pdf2.addPage([595.28, 841.89]);
  pageA.drawText('Enterprise AI Transformation: Part 1 - Fundamentals', {
    x: 50,
    y: 780,
    size: 18,
    font: boldFont2,
    color: rgb(0.1, 0.2, 0.6),
  });
  pageA.drawText('Unpopular opinion: Buying enterprise AI licenses without workflow redesign is a massive waste of capital.', {
    x: 50,
    y: 740,
    size: 11,
    font: font2,
  });

  const pageB = pdf2.addPage([595.28, 841.89]);
  pageB.drawText('Enterprise AI Transformation: Part 2 - Action Plan', {
    x: 50,
    y: 780,
    size: 18,
    font: boldFont2,
    color: rgb(0.1, 0.2, 0.6),
  });
  pageB.drawText('Focus on empowering domain experts with modular copilots. Save this post for your quarterly review! #EnterpriseAI #Innovation', {
    x: 50,
    y: 740,
    size: 11,
    font: font2,
  });

  const pdf2Bytes = await pdf2.save({ useObjectStreams: false });
  fs.writeFileSync(path.join(sampleDir, 'enterprise-ai-multi-page.pdf'), pdf2Bytes);
  console.log('✅ Generated sample-files/enterprise-ai-multi-page.pdf');
}

createSamplePdfs().catch(console.error);
