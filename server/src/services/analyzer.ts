import {
  ActionableRecommendation,
  CallToActionAnalysis,
  HookAnalysis,
  ImprovedDrafts,
  PlatformFit,
  ReadabilityMetrics,
  SentimentAnalysis,
  SocialMediaMetrics,
} from '../types/index.js';

// Count syllables in an English word (heuristic)
function countSyllables(word: string): number {
  word = word.toLowerCase().trim().replace(/[^a-z]/g, '');
  if (!word) return 0;
  if (word.length <= 3) return 1;

  word = word.replace(/(?:[^laeiouy]|ed|es|e)$/, '');
  word = word.replace(/^y/, '');
  const syllableMatches = word.match(/[aeiouy]{1,2}/g);
  return syllableMatches ? Math.max(1, syllableMatches.length) : 1;
}

export function calculateReadability(text: string, words: string[], sentences: string[]): ReadabilityMetrics {
  const wordCount = Math.max(1, words.length);
  const sentenceCount = Math.max(1, sentences.length);

  let totalSyllables = 0;
  let totalCharacters = 0;

  for (const word of words) {
    totalSyllables += countSyllables(word);
    totalCharacters += word.length;
  }

  const avgSentenceLength = wordCount / sentenceCount;
  const avgSyllablesPerWord = totalSyllables / wordCount;
  const avgWordLength = Number((totalCharacters / wordCount).toFixed(1));

  // Flesch Reading Ease: 206.835 - (1.015 * ASL) - (84.6 * ASW)
  let flesch = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
  flesch = Math.min(100, Math.max(0, Math.round(flesch)));

  // Flesch-Kincaid Grade Level: 0.39 * ASL + 11.8 * ASW - 15.59
  let grade = (0.39 * avgSentenceLength) + (11.8 * avgSyllablesPerWord) - 15.59;
  grade = Math.max(1, Math.round(grade * 10) / 10);

  let readingLevel = 'Standard';
  if (flesch >= 90) readingLevel = 'Very Easy (5th Grade)';
  else if (flesch >= 80) readingLevel = 'Easy (6th Grade)';
  else if (flesch >= 70) readingLevel = 'Fairly Easy (7th Grade)';
  else if (flesch >= 60) readingLevel = 'Standard (8th-9th Grade - Ideal for Social)';
  else if (flesch >= 50) readingLevel = 'Fairly Difficult (10th-12th Grade)';
  else if (flesch >= 30) readingLevel = 'Difficult (College Level)';
  else readingLevel = 'Very Complex (Academic)';

  return {
    fleschReadingEase: flesch,
    readingLevel,
    fleschKincaidGrade: grade,
    averageSentenceLength: Math.round(avgSentenceLength * 10) / 10,
    averageWordLength: avgWordLength,
  };
}

export function detectCallToAction(text: string): CallToActionAnalysis {
  const lower = text.toLowerCase();

  const ctaPatterns = [
    { pattern: /\b(link in bio|link in comments?|check the link|click (the )?link|link below)\b/i, type: 'link_click' as const, phrase: 'Link in Bio/Comments' },
    { pattern: /\b(sign up|register now|join us|subscribe|get started|try for free|claim your|book a call)\b/i, type: 'direct' as const, phrase: 'Direct Action (Sign Up/Subscribe)' },
    { pattern: /\b(comment below|drop a comment|share your thoughts|let me know in the comments|what do you think|agree or disagree)\b/i, type: 'question' as const, phrase: 'Comment & Discussion' },
    { pattern: /\b(save this post|bookmark this|save for later|repost this|retweet|share with a friend|tag a friend)\b/i, type: 'community' as const, phrase: 'Share/Save Post' },
    { pattern: /\b(dm me|send a message|reach out|contact us)\b/i, type: 'direct' as const, phrase: 'Direct Message' },
    { pattern: /\b(limited time|ends soon|last chance|only \d+ left|today only|don't miss out)\b/i, type: 'urgency' as const, phrase: 'Urgency & Scarcity' },
    { pattern: /\b(follow (for|us|me)|subscribe for more)\b/i, type: 'community' as const, phrase: 'Follow for More' },
  ];

  const detectedPhrases: string[] = [];
  let matchedType: CallToActionAnalysis['type'] = 'none';

  for (const cta of ctaPatterns) {
    if (cta.pattern.test(lower)) {
      detectedPhrases.push(cta.phrase);
      if (matchedType === 'none') {
        matchedType = cta.type;
      }
    }
  }

  // Look for closing question if no other CTA detected
  if (detectedPhrases.length === 0 && /\?\s*$/.test(text.trim())) {
    detectedPhrases.push('Closing Question Engagement');
    matchedType = 'question';
  }

  const detected = detectedPhrases.length > 0;
  let qualityScore = 0;
  let feedback = 'No clear call-to-action detected. Social posts with a clear CTA achieve up to 3x higher conversion and comment rates.';

  if (detected) {
    if (detectedPhrases.length === 1) {
      qualityScore = 85;
      feedback = `Strong single CTA detected (${detectedPhrases[0]}). Focused instructions increase user conversion.`;
    } else if (detectedPhrases.length === 2) {
      qualityScore = 95;
      feedback = `Great CTA pairing detected (${detectedPhrases.join(' & ')}).`;
    } else {
      qualityScore = 70;
      feedback = 'Multiple competing CTAs detected. Consider focusing on 1 primary action so readers are not overwhelmed.';
    }
  }

  return {
    detected,
    phrases: detectedPhrases,
    type: matchedType,
    qualityScore,
    feedback,
  };
}

export function analyzeHook(firstSentence: string, text: string): HookAnalysis {
  const sentence = firstSentence.trim();
  const lower = sentence.toLowerCase();

  if (!sentence) {
    return {
      firstSentence: '',
      hookType: 'generic',
      hookScore: 20,
      assessment: 'Opening hook is empty or missing.',
    };
  }

  // Question hook
  if (sentence.endsWith('?') || /^(why|how|what|are you|did you|have you|is it|can you|should you)\b/i.test(lower)) {
    return {
      firstSentence: sentence,
      hookType: 'question',
      hookScore: 88,
      assessment: 'Engaging question hook. Questions create an immediate cognitive open loop that compels readers to stop scrolling.',
    };
  }

  // Statistic / Numbers hook
  if (/\b(\d+%|\$\d+|\d+ years|\d+ steps|\d+ tools|\d+ lessons|\d+ tips|\d+ mistakes|\d+x)\b/i.test(sentence)) {
    return {
      firstSentence: sentence,
      hookType: 'statistic',
      hookScore: 92,
      assessment: 'High-performing data/numbers hook. Specific numbers build instant credibility and set clear value expectations.',
    };
  }

  // Bold claim / Contrarian hook
  if (/\b(stop doing|never|biggest mistake|unpopular opinion|most people (fail|don't|think)|the secret to|nobody talks about|truth about)\b/i.test(lower)) {
    return {
      firstSentence: sentence,
      hookType: 'bold_claim',
      hookScore: 95,
      assessment: 'Magnetic bold claim hook. Contrarian statements provoke curiosity and trigger high bookmark/comment rates.',
    };
  }

  // How-to hook
  if (/^how to\b/i.test(lower) || /\bstep-by-step guide\b/i.test(lower)) {
    return {
      firstSentence: sentence,
      hookType: 'how_to',
      hookScore: 82,
      assessment: 'Direct value hook. Clear promise of educational content.',
    };
  }

  // Story hook
  if (/^(in \d{4}|last year|when i started|\d+ months ago|i used to|yesterday i|3 years ago)\b/i.test(lower)) {
    return {
      firstSentence: sentence,
      hookType: 'story',
      hookScore: 85,
      assessment: 'Narrative story hook. Personal stories generate strong emotional connection and high read-through rates.',
    };
  }

  // Generic sentence
  if (sentence.length > 140) {
    return {
      firstSentence: sentence,
      hookType: 'generic',
      hookScore: 45,
      assessment: 'Opening sentence is quite long (>140 characters). Consider breaking it into a punchy 1-line hook to stop readers from skimming past.',
    };
  }

  return {
    firstSentence: sentence,
    hookType: 'generic',
    hookScore: 60,
    assessment: 'Moderate opening line. Adding curiosity, a quantifiable result, or an open question would significantly boost scroll-stopping power.',
  };
}

export function analyzeSentiment(text: string): SentimentAnalysis {
  const lower = text.toLowerCase();

  const positiveWords = ['great', 'amazing', 'excellent', 'excited', 'love', 'success', 'winning', 'growth', 'valuable', 'boost', 'innovative', 'breakthrough', 'powerful', 'best', 'effective', 'transform', 'unlock', 'delighted', 'thriving'];
  const negativeWords = ['worst', 'terrible', 'fail', 'bad', 'drop', 'crisis', 'annoying', 'loss', 'warning', 'broken', 'regret', 'poor', 'disaster', 'scam', 'risk'];
  const enthusiasticWords = ['!', 'huge', 'mind-blowing', 'revolutionary', 'game-changer', 'game changer', 'unbelievable', 'insane', 'boom', 'epic', 'masterclass'];
  const urgencyWords = ['now', 'today', 'immediately', 'hurry', 'limited', 'urgent', 'deadline', 'last chance', 'quick'];

  let posCount = 0;
  let negCount = 0;
  let entCount = 0;
  let urgCount = 0;

  for (const w of positiveWords) {
    if (lower.includes(w)) posCount++;
  }
  for (const w of negativeWords) {
    if (lower.includes(w)) negCount++;
  }
  for (const w of enthusiasticWords) {
    if (lower.includes(w)) entCount++;
  }
  for (const w of urgencyWords) {
    if (lower.includes(w)) urgCount++;
  }

  const toneTags: string[] = [];
  if (posCount >= 2) toneTags.push('Optimistic / Inspiring');
  if (entCount >= 2) toneTags.push('High Energy / Enthusiastic');
  if (urgCount >= 2) toneTags.push('Action-Oriented / Urgent');
  if (negCount >= 2) toneTags.push('Cautionary / Problem-Focused');
  if (toneTags.length === 0) toneTags.push('Informative / Professional');

  const total = Math.max(1, posCount + negCount);
  const score = Number(((posCount - negCount) / total).toFixed(2));

  let label: SentimentAnalysis['label'] = 'Neutral';
  if (entCount >= 3) label = 'Enthusiastic';
  else if (urgCount >= 3) label = 'Urgent';
  else if (score > 0.25) label = 'Positive';
  else if (score < -0.25) label = 'Negative';
  else label = 'Professional';

  return {
    score,
    label,
    toneTags,
  };
}

export function checkPlatformFit(charCount: number, wordCount: number): SocialMediaMetrics['platformSuitability'] {
  const check = (limit: number, sweetMin: number, sweetMax: number, name: string): PlatformFit => {
    const percentage = Math.min(100, Math.round((charCount / limit) * 100));
    if (charCount > limit) {
      return {
        fit: 'too_long',
        charLimit: limit,
        currentChars: charCount,
        percentageUsed: percentage,
        notes: `Exceeds ${name} limit by ${charCount - limit} characters. Consider shortening or creating a thread.`,
      };
    }
    if (charCount < sweetMin) {
      return {
        fit: 'too_short',
        charLimit: limit,
        currentChars: charCount,
        percentageUsed: percentage,
        notes: `Brief for ${name}. Great for punchy updates, or expand slightly for deeper context.`,
      };
    }
    if (charCount > sweetMax) {
      return {
        fit: 'warning',
        charLimit: limit,
        currentChars: charCount,
        percentageUsed: percentage,
        notes: `Fits within character limit, but is longer than the recommended sweet spot (${sweetMin}-${sweetMax} chars).`,
      };
    }
    return {
      fit: 'optimal',
      charLimit: limit,
      currentChars: charCount,
      percentageUsed: percentage,
      notes: `Optimal length for ${name} algorithms and reader engagement.`,
    };
  };

  return {
    twitter: check(280, 70, 240, 'X/Twitter'),
    linkedIn: check(3000, 400, 1800, 'LinkedIn'),
    instagram: check(2200, 100, 600, 'Instagram'),
    facebook: check(63206, 80, 500, 'Facebook'),
    threads: check(500, 80, 450, 'Threads'),
  };
}

export function generateRecommendations(
  metrics: Omit<SocialMediaMetrics, 'overallEngagementScore' | 'engagementGrade'>,
  text: string
): ActionableRecommendation[] {
  const recs: ActionableRecommendation[] = [];

  // 1. Hook
  if (metrics.hookAnalysis.hookScore < 70) {
    recs.push({
      category: 'hook',
      priority: 'high',
      title: 'Strengthen the Opening Hook',
      description: 'The first line determines whether a user stops or continues scrolling past your post.',
      suggestion: `Transform your opening line "${metrics.hookAnalysis.firstSentence.slice(0, 60)}..." into a compelling question, a surprising statistic, or a contrarian statement to hook the reader immediately.`,
    });
  } else {
    recs.push({
      category: 'hook',
      priority: 'low',
      title: 'A/B Test Hook Variations',
      description: `Your opening hook score is strong (${metrics.hookAnalysis.hookScore}/100, ${metrics.hookAnalysis.hookType}).`,
      suggestion: 'Consider testing a data-backed vs question-based opening variation to see which drives higher click-throughs on this topic.',
    });
  }

  // 2. Call to Action
  if (!metrics.callToAction.detected) {
    recs.push({
      category: 'cta',
      priority: 'high',
      title: 'Add a Clear Call-to-Action (CTA)',
      description: 'Your post does not contain an explicit action for the reader to take next.',
      suggestion: 'End with an explicit instruction: "Drop a comment below with your thoughts 👇", "Save this post for later 📌", or "Link in bio to read more 🔗".',
    });
  } else if (metrics.callToAction.phrases.length > 2) {
    recs.push({
      category: 'cta',
      priority: 'medium',
      title: 'Streamline Multiple Calls to Action',
      description: 'Asking readers to take 3 or more different actions simultaneously causes decision fatigue.',
      suggestion: 'Choose 1 primary goal (e.g. comments vs clicks) and place it clearly at the very end.',
    });
  } else {
    recs.push({
      category: 'cta',
      priority: 'low',
      title: 'Maximize CTA Conversion with Emojis',
      description: `Active CTA detected: ${metrics.callToAction.phrases.join(', ')}.`,
      suggestion: 'Pair your CTA with a directional emoji (👇, 🔗, 👉) to create a visual eye path directly to the link or comment box.',
    });
  }

  // 3. Question & Interaction
  if (metrics.questionCount === 0) {
    recs.push({
      category: 'interaction',
      priority: 'medium',
      title: 'Encourage Conversation with an Open Question',
      description: 'Social algorithms heavily prioritize comments and active discussion threads.',
      suggestion: 'Include a question at the bottom like "Have you experienced this too?" or "What would you add to this list?" to invite replies.',
    });
  }

  // 4. Hashtags
  if (metrics.hashtags.length === 0) {
    recs.push({
      category: 'hashtags',
      priority: 'medium',
      title: 'Include Strategic Hashtags',
      description: 'No hashtags were found in the extracted text.',
      suggestion: 'Add 3 to 5 targeted niche hashtags (e.g. #SocialMediaStrategy #MarketingTips) to increase searchability and topic categorization.',
    });
  } else if (metrics.hashtags.length > 8) {
    recs.push({
      category: 'hashtags',
      priority: 'low',
      title: 'Reduce Hashtag Density',
      description: `You have ${metrics.hashtags.length} hashtags. Excessive hashtags can look spammy on platforms like LinkedIn and X.`,
      suggestion: 'Keep hashtags between 3 to 5 highly relevant tags to preserve clean readability.',
    });
  }

  // 5. Readability & Formatting
  if (metrics.readability.fleschReadingEase < 55) {
    recs.push({
      category: 'readability',
      priority: 'high',
      title: 'Simplify Vocabulary and Sentence Structure',
      description: `Current reading difficulty is ${metrics.readability.readingLevel} (Grade ${metrics.readability.fleschKincaidGrade}).`,
      suggestion: 'Use shorter sentences (under 15 words) and replace complex jargon with clear, direct conversational words.',
    });
  }

  if (metrics.paragraphCount <= 1 && metrics.wordCount > 60) {
    recs.push({
      category: 'formatting',
      priority: 'high',
      title: 'Add Paragraph Breaks for Skimmability',
      description: 'Dense blocks of continuous text reduce mobile read-through rates significantly.',
      suggestion: 'Format into bite-sized 1-2 sentence paragraphs with whitespace and bullet points.',
    });
  }

  // 6. Distribution & Algorithmic Timing
  recs.push({
    category: 'interaction',
    priority: 'low',
    title: 'Optimize First-Hour Reply Velocity',
    description: 'The first 60 minutes after posting represent 70% of total algorithmic ranking weight.',
    suggestion: 'Plan to respond to the first 5-10 comments within 15 minutes to trigger the algorithm’s high-engagement distribution bucket.',
  });

  return recs;
}

export function generateImprovedDrafts(text: string, metrics: Omit<SocialMediaMetrics, 'overallEngagementScore' | 'engagementGrade'>): ImprovedDrafts {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const firstLine = lines[0] || text.slice(0, 80);

  // Short & punchy draft (X / Twitter style)
  const shortPunchy = `🔥 ${firstLine.replace(/\.$/, '')} — here is what you need to know:\n\n` +
    `• Point 1: Key insight extracted from your post\n` +
    `• Point 2: Actionable takeaway\n` +
    `• Point 3: Immediate next step\n\n` +
    `👉 What's your take on this? Drop a reply below!\n\n` +
    `#Growth #Strategy #Insights`;

  // LinkedIn professional draft
  const linkedin = `Most people overlook this simple principle:\n\n` +
    `"${firstLine}"\n\n` +
    `Here are 3 key lessons I've learned:\n\n` +
    `1. Clarity beats complexity every time.\n` +
    `2. Consistency compound faster than intensity.\n` +
    `3. Execution separates ideas from results.\n\n` +
    `---\n` +
    `💡 How does your team handle this? Let's discuss in the comments.\n\n` +
    `#Leadership #Innovation #Productivity #Business`;

  // High-engagement question draft
  const highEngagement = `Question for creators & leaders:\n\n` +
    `${firstLine.endsWith('?') ? firstLine : firstLine + '?'}\n\n` +
    `I've noticed a huge shift recently:\n` +
    `A) Focus on speed\n` +
    `B) Focus on depth & quality\n\n` +
    `Drop an 'A' or 'B' below — curious where everyone stands! 👇`;

  return {
    shortAndPunchy: shortPunchy,
    linkedinProfessional: linkedin,
    highEngagementQuestion: highEngagement,
  };
}

export function analyzeSocialMediaContent(
  text: string
): { metrics: SocialMediaMetrics; recommendations: ActionableRecommendation[]; improvedDrafts: ImprovedDrafts } {
  const cleanText = text.trim();

  // Words extraction
  const words = cleanText.match(/[\w'-]+/g) || [];
  const wordCount = words.length;
  const characterCount = cleanText.length;

  // Sentences extraction
  const sentences = cleanText
    .split(/(?<=[.?!])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const sentenceCount = Math.max(1, sentences.length);

  // Paragraphs
  const paragraphs = cleanText
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  const paragraphCount = Math.max(1, paragraphs.length);

  // Estimated reading time
  const readingTimeSeconds = Math.max(2, Math.ceil((wordCount / 225) * 60));

  // Regex extractions
  const hashtagMatches = cleanText.match(/#[a-zA-Z0-9_\u00c0-\u00ff]+/g) || [];
  const hashtags = Array.from(new Set(hashtagMatches));

  const mentionMatches = cleanText.match(/@[a-zA-Z0-9_.-]+/g) || [];
  const mentions = Array.from(new Set(mentionMatches));

  const linkMatches = cleanText.match(/https?:\/\/[^\s]+|www\.[^\s]+/gi) || [];
  const links = Array.from(new Set(linkMatches));

  // Emojis regex
  const emojiMatches = cleanText.match(/[\u{1F300}-\u{1FAFF}|\u{2600}-\u{27BF}]/gu) || [];
  const emojis = Array.from(new Set(emojiMatches));

  // Questions
  const questionMatches = sentences.filter((s) => s.includes('?'));
  const questionCount = questionMatches.length;

  // Exclamations
  const exclamationMatches = cleanText.match(/!/g) || [];
  const exclamationCount = exclamationMatches.length;

  // Readability
  const readability = calculateReadability(cleanText, words, sentences);

  // CTA & Hook
  const callToAction = detectCallToAction(cleanText);
  const hookAnalysis = analyzeHook(sentences[0] || '', cleanText);

  // Sentiment
  const sentiment = analyzeSentiment(cleanText);

  // Platform suitability
  const platformSuitability = checkPlatformFit(characterCount, wordCount);

  // Partial metrics object
  const partialMetrics = {
    characterCount,
    wordCount,
    sentenceCount,
    paragraphCount,
    estimatedReadingTimeSeconds: readingTimeSeconds,
    hashtags,
    mentions,
    links,
    emojis,
    questionCount,
    questions: questionMatches,
    exclamationCount,
    callToAction,
    hookAnalysis,
    readability,
    sentiment,
    platformSuitability,
  };

  // Calculate overall engagement score (0-100)
  let score = 0;
  score += hookAnalysis.hookScore * 0.25; // 25% hook
  score += callToAction.qualityScore * 0.25; // 25% CTA
  score += (readability.fleschReadingEase >= 60 ? 90 : readability.fleschReadingEase >= 45 ? 75 : 50) * 0.20; // 20% readability
  
  // Social signals (20%)
  let socialScore = 40;
  if (hashtags.length >= 1 && hashtags.length <= 6) socialScore += 20;
  if (emojis.length >= 1 && emojis.length <= 8) socialScore += 15;
  if (questionCount >= 1) socialScore += 20;
  if (paragraphCount >= 2 && wordCount > 50) socialScore += 15;
  score += Math.min(100, socialScore) * 0.20;

  // Platform balance (10%)
  score += (characterCount >= 100 && characterCount <= 1800 ? 90 : 70) * 0.10;

  const overallScore = Math.min(99, Math.max(25, Math.round(score)));

  let grade: SocialMediaMetrics['engagementGrade'] = 'B';
  if (overallScore >= 90) grade = 'A+';
  else if (overallScore >= 80) grade = 'A';
  else if (overallScore >= 70) grade = 'B';
  else if (overallScore >= 55) grade = 'C';
  else if (overallScore >= 40) grade = 'D';
  else grade = 'F';

  const metrics: SocialMediaMetrics = {
    ...partialMetrics,
    overallEngagementScore: overallScore,
    engagementGrade: grade,
  };

  const recommendations = generateRecommendations(partialMetrics, cleanText);
  const improvedDrafts = generateImprovedDrafts(cleanText, partialMetrics);

  return {
    metrics,
    recommendations,
    improvedDrafts,
  };
}
