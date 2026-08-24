import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface NavbarProps {
  onReset: () => void;
  hasActiveDocument: boolean;
  isBackendHealthy: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onReset,
  hasActiveDocument,
  isBackendHealthy,
}) => {
  return (
    <header className="border-b border-zinc-200 bg-white sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div 
          onClick={onReset}
          className="flex items-center gap-2.5 cursor-pointer select-none"
        >
          <div className="w-5 h-5 bg-zinc-900 rounded-[3px] flex items-center justify-center">
            <span className="text-[11px] font-mono font-bold text-white leading-none">/</span>
          </div>
          <span className="font-semibold text-sm tracking-tight text-zinc-900">
            Content Analyzer
          </span>
          <span className="text-[11px] font-mono text-zinc-400 pl-1 border-l border-zinc-200">
            v1.0
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono">
            <span className={`w-1.5 h-1.5 rounded-full ${isBackendHealthy ? 'bg-zinc-900' : 'bg-zinc-400'}`} />
            <span className="hidden sm:inline">{isBackendHealthy ? 'Engine ready' : 'Connecting...'}</span>
          </div>

          {hasActiveDocument && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded border border-zinc-200 transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>New document</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
