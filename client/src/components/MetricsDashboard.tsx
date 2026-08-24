import React from 'react';
import { SocialMediaMetrics } from '../types';

interface MetricsDashboardProps {
  metrics: SocialMediaMetrics;
}

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ metrics }) => {
  return (
    <div className="space-y-6">
      {/* 1. Content Overview Minimal Row */}
      <div className="border border-zinc-200 rounded-lg bg-white overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-200 bg-zinc-50/70">
          <span className="text-xs font-semibold text-zinc-900">Content Overview</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 divide-x divide-y sm:divide-y-0 divide-zinc-200 text-left">
          <div className="p-4">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 block">Words</span>
            <span className="text-xl font-bold font-mono text-zinc-900 mt-0.5 block">{metrics.wordCount}</span>
            <span className="text-[10px] text-zinc-400 font-mono">{metrics.characterCount} chars</span>
          </div>

          <div className="p-4">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 block">Sentences</span>
            <span className="text-xl font-bold font-mono text-zinc-900 mt-0.5 block">{metrics.sentenceCount}</span>
            <span className="text-[10px] text-zinc-400 font-mono">{metrics.paragraphCount} para(s)</span>
          </div>

          <div className="p-4">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 block">Read Time</span>
            <span className="text-xl font-bold font-mono text-zinc-900 mt-0.5 block">{metrics.estimatedReadingTimeSeconds}s</span>
            <span className="text-[10px] text-zinc-400 font-mono">~225 wpm</span>
          </div>

          <div className="p-4">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 block">Hashtags</span>
            <span className="text-xl font-bold font-mono text-zinc-900 mt-0.5 block">{metrics.hashtags.length}</span>
            <span className="text-[10px] text-zinc-400 font-mono">detected</span>
          </div>

          <div className="p-4">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 block">Mentions</span>
            <span className="text-xl font-bold font-mono text-zinc-900 mt-0.5 block">{metrics.mentions.length}</span>
            <span className="text-[10px] text-zinc-400 font-mono">accounts</span>
          </div>

          <div className="p-4">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 block">Links</span>
            <span className="text-xl font-bold font-mono text-zinc-900 mt-0.5 block">{metrics.links.length}</span>
            <span className="text-[10px] text-zinc-400 font-mono">URLs</span>
          </div>

          <div className="p-4">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 block">Questions</span>
            <span className="text-xl font-bold font-mono text-zinc-900 mt-0.5 block">{metrics.questionCount}</span>
            <span className="text-[10px] text-zinc-400 font-mono">prompts</span>
          </div>
        </div>
      </div>

      {/* 2. Linguistic & Structural Breakdown */}
      <div className="border border-zinc-200 rounded-lg bg-white overflow-hidden divide-y divide-zinc-200">
        <div className="px-5 py-3 bg-zinc-50/70 flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-900">Engagement &amp; Linguistic Diagnostics</span>
          <span className="text-[11px] font-mono text-zinc-500">
            Overall Potential: <strong className="text-zinc-900">{metrics.overallEngagementScore}/100</strong> (Grade {metrics.engagementGrade})
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-200">
          {/* Hook Analysis */}
          <div className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-900">Opening Hook</span>
              <span className="text-[11px] font-mono text-zinc-600 px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200">
                Score: {metrics.hookAnalysis.hookScore}/100 · {metrics.hookAnalysis.hookType.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs font-mono text-zinc-600 bg-zinc-50 p-2.5 rounded border border-zinc-200">
              "{metrics.hookAnalysis.firstSentence || 'No clear first line'}"
            </p>
            <p className="text-xs text-zinc-600 leading-relaxed">
              {metrics.hookAnalysis.assessment}
            </p>
          </div>

          {/* Call to Action */}
          <div className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-900">Call to Action (CTA)</span>
              <span className="text-[11px] font-mono text-zinc-600 px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200">
                {metrics.callToAction.detected ? `Detected · ${metrics.callToAction.qualityScore}/100` : 'None detected'}
              </span>
            </div>
            {metrics.callToAction.phrases.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {metrics.callToAction.phrases.map((phrase, idx) => (
                  <span key={idx} className="text-xs font-mono px-2 py-0.5 bg-zinc-100 text-zinc-800 rounded border border-zinc-200">
                    {phrase}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic">
                No explicit action verb or direction found at the end of the post.
              </p>
            )}
            <p className="text-xs text-zinc-600 leading-relaxed">
              {metrics.callToAction.feedback}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-200">
          {/* Readability */}
          <div className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-900">Readability</span>
              <span className="text-[11px] font-mono text-zinc-600 px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200">
                Flesch: {metrics.readability.fleschReadingEase}/100
              </span>
            </div>
            <div className="text-xs text-zinc-700 space-y-1">
              <p>Level: <strong className="text-zinc-900">{metrics.readability.readingLevel}</strong></p>
              <p className="text-zinc-500">Grade {metrics.readability.fleschKincaidGrade} · Avg {metrics.readability.averageSentenceLength} words per sentence</p>
            </div>
          </div>

          {/* Tone & Brand Sentiment */}
          <div className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-900">Tone &amp; Orientation</span>
              <span className="text-[11px] font-mono text-zinc-600 px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200">
                {metrics.sentiment.label}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {metrics.sentiment.toneTags.map((tag, idx) => (
                <span key={idx} className="text-xs font-mono px-2 py-0.5 bg-zinc-100 text-zinc-700 rounded border border-zinc-200">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Detected Entities List */}
      {(metrics.hashtags.length > 0 || metrics.mentions.length > 0 || metrics.links.length > 0) && (
        <div className="border border-zinc-200 rounded-lg bg-white p-4 space-y-3">
          <span className="text-xs font-semibold text-zinc-900 block">Extracted Entities</span>
          
          <div className="flex flex-wrap items-center gap-2">
            {metrics.hashtags.map((tag, idx) => (
              <span key={`h-${idx}`} className="text-xs font-mono px-2 py-0.5 bg-zinc-50 text-zinc-700 rounded border border-zinc-200">
                {tag}
              </span>
            ))}
            {metrics.mentions.map((mention, idx) => (
              <span key={`m-${idx}`} className="text-xs font-mono px-2 py-0.5 bg-zinc-50 text-zinc-700 rounded border border-zinc-200">
                {mention}
              </span>
            ))}
            {metrics.links.map((link, idx) => (
              <span key={`l-${idx}`} className="text-xs font-mono px-2 py-0.5 bg-zinc-50 text-zinc-700 rounded border border-zinc-200 truncate max-w-xs">
                {link}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
