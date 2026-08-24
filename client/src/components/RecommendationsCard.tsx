import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { ActionableRecommendation, ImprovedDrafts } from '../types';

interface RecommendationsCardProps {
  recommendations: ActionableRecommendation[];
  improvedDrafts: ImprovedDrafts;
  aiGenerated: boolean;
}

export const RecommendationsCard: React.FC<RecommendationsCardProps> = ({
  recommendations,
  improvedDrafts,
  aiGenerated,
}) => {
  const [activeTab, setActiveTab] = useState<'short' | 'linkedin' | 'question'>('short');
  const [copiedDraft, setCopiedDraft] = useState<string | null>(null);

  const handleCopyDraft = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedDraft(key);
      setTimeout(() => setCopiedDraft(null), 2000);
    } catch (err) {
      console.error('Failed to copy draft:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Numbered Recommendations */}
      <div className="border border-zinc-200 rounded-lg bg-white overflow-hidden divide-y divide-zinc-200">
        <div className="px-5 py-3 bg-zinc-50/70 flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-900">Engagement Recommendations</span>
          <span className="text-[11px] font-mono text-zinc-500">
            {aiGenerated ? 'Enhanced with Gemini AI' : 'Heuristic Engine'}
          </span>
        </div>

        <div className="divide-y divide-zinc-200">
          {recommendations.map((rec, idx) => (
            <div key={idx} className="p-5 flex items-start gap-4">
              <span className="text-sm font-mono font-bold text-zinc-400 shrink-0 mt-0.5">
                {String(idx + 1).padStart(2, '0')}
              </span>

              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-semibold text-zinc-900">{rec.title}</h4>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                    {rec.priority}
                  </span>
                </div>

                <p className="text-xs text-zinc-600 leading-relaxed">
                  {rec.description}
                </p>

                <p className="text-xs text-zinc-900 font-mono pt-1">
                  → {rec.suggestion}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Alternative Variations */}
      <div className="border border-zinc-200 rounded-lg bg-white overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-200 bg-zinc-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-zinc-900">Alternative Formats</span>
            <p className="text-[11px] text-zinc-500">Rewritten variations incorporating hook and spacing optimizations.</p>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded border border-zinc-200 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('short')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                activeTab === 'short'
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Short &amp; Punchy
            </button>
            <button
              onClick={() => setActiveTab('linkedin')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                activeTab === 'linkedin'
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              LinkedIn
            </button>
            <button
              onClick={() => setActiveTab('question')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                activeTab === 'question'
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Community Q&amp;A
            </button>
          </div>
        </div>

        <div className="p-5 space-y-3">
          <div className="bg-zinc-50 border border-zinc-200 rounded p-4 text-xs font-mono text-zinc-800 whitespace-pre-wrap leading-relaxed">
            {activeTab === 'short' && improvedDrafts.shortAndPunchy}
            {activeTab === 'linkedin' && improvedDrafts.linkedinProfessional}
            {activeTab === 'question' && improvedDrafts.highEngagementQuestion}
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => {
                const currentText =
                  activeTab === 'short'
                    ? improvedDrafts.shortAndPunchy
                    : activeTab === 'linkedin'
                    ? improvedDrafts.linkedinProfessional
                    : improvedDrafts.highEngagementQuestion;
                handleCopyDraft(currentText, activeTab);
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded transition-colors"
            >
              {copiedDraft === activeTab ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedDraft === activeTab ? 'Copied' : 'Copy variation'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
