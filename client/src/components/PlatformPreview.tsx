import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { PlatformFit, SocialMediaMetrics } from '../types';

interface PlatformPreviewProps {
  text: string;
  suitability: SocialMediaMetrics['platformSuitability'];
}

type PlatformTab = 'twitter' | 'linkedIn' | 'instagram' | 'facebook' | 'threads';

export const PlatformPreview: React.FC<PlatformPreviewProps> = ({ text, suitability }) => {
  const [activeTab, setActiveTab] = useState<PlatformTab>('twitter');
  const [hasCopied, setHasCopied] = useState(false);

  const platforms = [
    { id: 'twitter' as const, name: 'X / Twitter', limit: 280, fit: suitability.twitter },
    { id: 'linkedIn' as const, name: 'LinkedIn', limit: 3000, fit: suitability.linkedIn },
    { id: 'instagram' as const, name: 'Instagram', limit: 2200, fit: suitability.instagram },
    { id: 'facebook' as const, name: 'Facebook', limit: 63206, fit: suitability.facebook },
    { id: 'threads' as const, name: 'Threads', limit: 500, fit: suitability.threads },
  ];

  const currentPlatform = platforms.find((p) => p.id === activeTab)!;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy platform text:', err);
    }
  };

  const getStatusLabel = (fit: PlatformFit) => {
    switch (fit.fit) {
      case 'optimal':
        return 'Optimal Length';
      case 'warning':
        return 'Slightly Long';
      case 'too_short':
        return 'Short Post';
      case 'too_long':
        return 'Exceeds Limit';
    }
  };

  return (
    <div className="border border-zinc-200 rounded-lg bg-white overflow-hidden space-y-0">
      {/* Header */}
      <div className="px-5 py-3 border-b border-zinc-200 bg-zinc-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-semibold text-zinc-900">Platform Compatibility</span>
          <p className="text-[11px] text-zinc-500">Character constraints and feed preview.</p>
        </div>

        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:text-zinc-950 bg-white hover:bg-zinc-100 rounded border border-zinc-200 transition-colors self-start sm:self-auto"
        >
          {hasCopied ? <Check className="w-3 h-3 text-zinc-900" /> : <Copy className="w-3 h-3" />}
          <span>{hasCopied ? 'Copied' : 'Copy for post'}</span>
        </button>
      </div>

      {/* Segmented Controls */}
      <div className="px-5 pt-4 flex items-center gap-1.5 overflow-x-auto pb-1">
        {platforms.map((plat) => {
          const isActive = activeTab === plat.id;
          const isOver = plat.fit.fit === 'too_long';

          return (
            <button
              key={plat.id}
              onClick={() => setActiveTab(plat.id)}
              className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                isActive
                  ? 'bg-zinc-900 text-white'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
              }`}
            >
              <span>{plat.name}</span>
              {isOver && <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />}
            </button>
          );
        })}
      </div>

      {/* Platform Status & Character Bar */}
      <div className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono text-zinc-900 font-semibold px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200">
              {getStatusLabel(currentPlatform.fit)}
            </span>
            <span className="text-zinc-500">{currentPlatform.fit.notes}</span>
          </div>

          <span className="font-mono text-zinc-500">
            {text.length} / {currentPlatform.limit.toLocaleString()} chars ({currentPlatform.fit.percentageUsed}%)
          </span>
        </div>

        <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              currentPlatform.fit.fit === 'too_long' ? 'bg-zinc-900' : 'bg-zinc-700'
            }`}
            style={{ width: `${Math.min(100, currentPlatform.fit.percentageUsed)}%` }}
          />
        </div>

        {/* Minimal Post Preview */}
        <div className="border border-zinc-200 rounded p-4 bg-zinc-50/50 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-zinc-900 text-white font-mono text-[10px] flex items-center justify-center font-bold">
              U
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-900 leading-none">Author Name</p>
              <p className="text-[10px] text-zinc-400 font-mono">Preview Feed</p>
            </div>
          </div>

          <p className="text-xs text-zinc-800 whitespace-pre-wrap font-sans leading-relaxed">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
};
