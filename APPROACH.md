# Technical Approach: Social Media Content Analyzer

The **Social Media Content Analyzer** is architected as a lightweight, full-stack application engineered for fast document ingestion, accurate text extraction, and actionable social media engagement intelligence.

### Architecture & Pipeline
1. **Document Ingestion & Validation**: A secure Express/Multer layer enforces strict MIME validation, 15MB file size limits, and in-memory buffer processing to eliminate orphaned disk artifacts.
2. **Text Extraction Strategy**:
   - **PDFs**: Utilizes `unpdf`/PDF.js for robust multi-page stream parsing, preserving structural whitespace, bullet formatting, and paragraph hierarchy.
   - **Scanned Images**: Employs `tesseract.js` (Optical Character Recognition) to extract text from images (PNG, JPG, WEBP) with confidence scoring.
3. **Engagement & Linguistic Engine**: A rule-based NLP pipeline evaluates Flesch reading ease, syllable complexity, hook magnetic score (curiosity/data/question loops), CTA clarity, hashtag/mention density, and character limits across X, LinkedIn, Instagram, and Threads.
4. **AI Enhancement & Graceful Degradation**: Integrates Google Gemini API for strategic rewrites when configured, while remaining 100% functional offline via deterministic heuristics.
5. **Frontend Experience**: React 19 + TypeScript + Tailwind CSS provides instant drag-and-drop feedback, live pipeline progress steppers, editable text re-analysis, and multi-platform preview simulation.
