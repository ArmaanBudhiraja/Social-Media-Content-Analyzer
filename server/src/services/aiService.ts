import { ActionableRecommendation, ImprovedDrafts, SocialMediaMetrics } from '../types/index.js';

export async function enhanceWithAI(
  text: string,
  metrics: SocialMediaMetrics,
  defaultRecs: ActionableRecommendation[],
  defaultDrafts: ImprovedDrafts
): Promise<{ recommendations: ActionableRecommendation[]; drafts: ImprovedDrafts; aiGenerated: boolean }> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return {
      recommendations: defaultRecs,
      drafts: defaultDrafts,
      aiGenerated: false,
    };
  }

  try {
    const prompt = `You are an elite social media growth strategist and copywriter.
Analyze the following social media post text and return a strict JSON response.

Original Post Text:
"""
${text}
"""

Calculated Metrics:
- Word Count: ${metrics.wordCount}
- Hook Type: ${metrics.hookAnalysis.hookType} (Score: ${metrics.hookAnalysis.hookScore}/100)
- CTA Detected: ${metrics.callToAction.detected ? metrics.callToAction.phrases.join(', ') : 'None'}
- Readability Grade: ${metrics.readability.fleschKincaidGrade} (${metrics.readability.readingLevel})
- Sentiment: ${metrics.sentiment.label}

Please provide:
1. "recommendations": Array of 3-5 specific, highly actionable recommendations. Each with:
   - "category": one of ["hook", "cta", "length", "hashtags", "readability", "interaction", "formatting"]
   - "priority": one of ["high", "medium", "low"]
   - "title": string
   - "description": string
   - "suggestion": specific concrete advice
2. "improvedDrafts": Object containing:
   - "shortAndPunchy": Punchy X/Twitter rewrite with emojis and hook
   - "linkedinProfessional": High-engagement thought-leadership LinkedIn post with line breaks and CTA
   - "highEngagementQuestion": Community question format designed to maximize comments

Respond ONLY with valid JSON in this structure:
{
  "recommendations": [...],
  "improvedDrafts": {
    "shortAndPunchy": "...",
    "linkedinProfessional": "...",
    "highEngagementQuestion": "..."
  }
}`;

    // Call Gemini REST API using native fetch
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.7,
          },
        }),
      }
    );

    if (!response.ok) {
      console.warn(`Gemini API responded with status ${response.status}. Falling back to heuristic engine.`);
      return { recommendations: defaultRecs, drafts: defaultDrafts, aiGenerated: false };
    }

    const data: any = await response.json();
    const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawContent) {
      return { recommendations: defaultRecs, drafts: defaultDrafts, aiGenerated: false };
    }

    const parsed = JSON.parse(rawContent);

    return {
      recommendations: parsed.recommendations || defaultRecs,
      drafts: parsed.improvedDrafts || defaultDrafts,
      aiGenerated: true,
    };
  } catch (error) {
    console.warn('AI enhancement error (using built-in heuristics):', error);
    return {
      recommendations: defaultRecs,
      drafts: defaultDrafts,
      aiGenerated: false,
    };
  }
}
