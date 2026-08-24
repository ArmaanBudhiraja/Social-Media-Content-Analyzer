export type ExtractionMethod = 'pdf_parser' | 'ocr';

export interface ExtractionMetadata {
  filename: string;
  fileSize: number;
  mimeType: string;
  processingTimeMs: number;
  pageCount?: number;
  ocrConfidence?: number;
}

export interface ExtractionResult {
  text: string;
  method: ExtractionMethod;
  metadata: ExtractionMetadata;
}

export interface CallToActionAnalysis {
  detected: boolean;
  phrases: string[];
  type: 'direct' | 'question' | 'link_click' | 'urgency' | 'community' | 'none';
  qualityScore: number;
  feedback: string;
}

export interface HookAnalysis {
  firstSentence: string;
  hookType: 'question' | 'bold_claim' | 'statistic' | 'story' | 'how_to' | 'generic';
  hookScore: number;
  assessment: string;
}

export interface ReadabilityMetrics {
  fleschReadingEase: number;
  readingLevel: string;
  fleschKincaidGrade: number;
  averageSentenceLength: number;
  averageWordLength: number;
}

export interface SentimentAnalysis {
  score: number;
  label: 'Positive' | 'Neutral' | 'Negative' | 'Enthusiastic' | 'Urgent' | 'Professional';
  toneTags: string[];
}

export interface PlatformFit {
  fit: 'optimal' | 'too_long' | 'too_short' | 'warning';
  charLimit: number;
  currentChars: number;
  percentageUsed: number;
  notes: string;
}

export interface SocialMediaMetrics {
  characterCount: number;
  wordCount: number;
  sentenceCount: number;
  paragraphCount: number;
  estimatedReadingTimeSeconds: number;
  hashtags: string[];
  mentions: string[];
  links: string[];
  emojis: string[];
  questionCount: number;
  questions: string[];
  exclamationCount: number;
  callToAction: CallToActionAnalysis;
  hookAnalysis: HookAnalysis;
  readability: ReadabilityMetrics;
  sentiment: SentimentAnalysis;
  platformSuitability: {
    twitter: PlatformFit;
    linkedIn: PlatformFit;
    instagram: PlatformFit;
    facebook: PlatformFit;
    threads: PlatformFit;
  };
  overallEngagementScore: number;
  engagementGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
}

export interface ActionableRecommendation {
  category: 'hook' | 'cta' | 'length' | 'hashtags' | 'readability' | 'interaction' | 'formatting' | 'media';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  suggestion: string;
}

export interface ImprovedDrafts {
  shortAndPunchy: string;
  linkedinProfessional: string;
  highEngagementQuestion: string;
}

export interface AnalysisResponse {
  success: boolean;
  extractedContent: ExtractionResult;
  metrics: SocialMediaMetrics;
  recommendations: ActionableRecommendation[];
  improvedDrafts: ImprovedDrafts;
  aiGenerated: boolean;
  timestamp: string;
  error?: string;
}
