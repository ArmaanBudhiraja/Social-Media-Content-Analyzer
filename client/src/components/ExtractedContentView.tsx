import React, { useState } from 'react';
import { Copy, Check, Edit2, RefreshCw } from 'lucide-react';
import { ExtractionResult } from '../types';

interface ExtractedContentViewProps {
  extraction: ExtractionResult;
  onTextReAnalyze: (updatedText: string) => void;
  onReset: () => void;
  isReanalyzing?: boolean;
}

export const ExtractedContentView: React.FC<ExtractedContentViewProps> = ({
  extraction,
  onTextReAnalyze,
  isReanalyzing = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(extraction.text);
  const [hasCopied, setHasCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(isEditing ? editedText : extraction.text);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleSaveAndReanalyze = () => {
    setIsEditing(false);
    onTextReAnalyze(editedText);
  };

  const isPdf = extraction.method === 'pdf_parser';

  return (
    <div className="border border-zinc-200 rounded-lg bg-white overflow-hidden space-y-0">
      {/* Header bar */}
      <div className="px-5 py-3.5 border-b border-zinc-200 bg-zinc-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-xs font-semibold text-zinc-900">Extracted Content</span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-200/70 text-zinc-700 border border-zinc-300">
            {isPdf ? 'PDF Parser' : `OCR (${extraction.metadata.ocrConfidence || 95}% conf)`}
          </span>
          <span className="text-[11px] font-mono text-zinc-500">
            {extraction.metadata.filename} · {extraction.metadata.processingTimeMs}ms
            {extraction.metadata.pageCount ? ` · ${extraction.metadata.pageCount} page(s)` : ''}
          </span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:text-zinc-950 bg-white hover:bg-zinc-100 rounded border border-zinc-200 transition-colors"
          >
            {hasCopied ? <Check className="w-3 h-3 text-zinc-900" /> : <Copy className="w-3 h-3" />}
            <span>{hasCopied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded border transition-colors ${
              isEditing
                ? 'bg-zinc-900 text-white border-zinc-900'
                : 'bg-white hover:bg-zinc-100 text-zinc-700 hover:text-zinc-950 border-zinc-200'
            }`}
          >
            <Edit2 className="w-3 h-3" />
            <span>{isEditing ? 'Cancel edit' : 'Edit text'}</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 sm:p-6">
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              rows={9}
              className="w-full border border-zinc-300 rounded p-3 text-sm text-zinc-900 font-mono leading-relaxed focus:outline-none focus:border-zinc-900 resize-y"
            />
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-zinc-400">
                {editedText.length} characters · {editedText.trim().split(/\s+/).filter(Boolean).length} words
              </span>
              <button
                onClick={handleSaveAndReanalyze}
                disabled={isReanalyzing || !editedText.trim()}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isReanalyzing ? 'animate-spin' : ''}`} />
                <span>{isReanalyzing ? 'Re-analyzing...' : 'Save & Re-analyze'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-zinc-800 whitespace-pre-wrap leading-relaxed font-sans select-text">
            {extraction.text}
          </div>
        )}
      </div>
    </div>
  );
};
