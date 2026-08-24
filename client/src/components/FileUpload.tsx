import React, { useState, useRef } from 'react';
import { Upload, ArrowUpRight, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileSelected: (file: File) => void;
  onSampleSelected: (sampleText: string, filename: string) => void;
  disabled?: boolean;
}

const SAMPLE_POSTS = [
  {
    title: 'Enterprise AI Strategy',
    format: 'PDF Sample',
    filename: 'ai-leadership-post.pdf',
    desc: 'B2B thought-leadership article evaluating why 90% of generative AI rollouts stall without workflow alignment.',
    text: `Why do 90% of AI transformations fail before year two?\n\nIt's rarely a technology limitation. In over 12 enterprise rollouts, the real bottleneck is always human alignment and workflow adoption.\n\nHere are 3 critical lessons we learned the hard way:\n\n1. Strategy before tooling: Software without clear KPIs is just expensive shelfware.\n2. Upskill existing champions: Your domain experts know where the real friction lies.\n3. Celebrate small weekly wins: Momentum is built through micro-victories, not multi-year roadmaps.\n\nIf you're deploying generative workflows this quarter, what's your biggest hurdle?\n\nDrop your thoughts in the comments below or DM me to exchange notes! 👇\n\n#ArtificialIntelligence #EnterpriseTech #Leadership #DigitalTransformation #Innovation`,
  },
  {
    title: 'Product Launch & Direct CTA',
    format: 'Scanned Image Sample',
    filename: 'launch-announcement-scan.png',
    desc: 'Launch flyer for a reconciliation engine featuring performance stats, scarcity offers, and a link CTA.',
    text: `Stop wasting 4 hours every day on manual spreadsheet reconciliation.\n\nToday, we're publicly launching PulseFlow 2.0 🚀\n\nWe engineered the fastest automated reconciliation engine for high-growth finance teams. In our 30-day closed beta with 45 fintech companies, teams reported:\n• 82% reduction in month-end close time\n• Zero reconciliation discrepancies\n• 15+ engineering hours saved weekly\n\nSpecial launch week offer: The first 100 teams get lifetime priority onboarding and 3 months free.\n\nClaim your spot at the link in bio before seats fill up! 🔗\n\n#Fintech #ProductLaunch #SaaS #Productivity #Automation #Finance`,
  },
  {
    title: 'Organic Reach Debate',
    format: 'PDF Sample',
    filename: 'growth-secrets.pdf',
    desc: 'Contrarian opinion piece on posting volume vs depth, save rate, and comment thread retention.',
    text: `Unpopular opinion: Posting 5 times a day is actually killing your organic reach.\n\nAlgorithms in 2026 penalize low-dwell shallow posts. One deeply researched, high-signal post will outperform 20 hurried updates every single time.\n\nFocus on these two metrics:\n- Save rate (indicates lasting reference value)\n- Discussion depth (meaningful comment threads)\n\nQuality compounds. Volume creates noise.\n\nAgree or disagree? Let's debate in the comments.\n\n#ContentStrategy #MarketingTips #OrganicGrowth #CreatorEconomy`,
  },
];

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelected,
  onSampleSelected,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndProcessFile = (file: File) => {
    setErrorMessage(null);

    // Max 15MB
    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage(`File size is ${(file.size / (1024 * 1024)).toFixed(1)}MB. Maximum allowed size is 15MB.`);
      return;
    }

    const validExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.webp', '.bmp', '.tiff'];
    const hasValidExt = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));
    const hasValidMime = file.type === 'application/pdf' || file.type.startsWith('image/');

    if (!hasValidExt && !hasValidMime) {
      setErrorMessage(`Unsupported file format (${file.type || 'unknown'}). Please upload a PDF or an image (PNG, JPG, WEBP).`);
      return;
    }

    onFileSelected(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-10 py-6">
      {/* Editorial Title Block */}
      <div className="space-y-2 text-left">
        <p className="text-[11px] font-mono uppercase tracking-widest text-zinc-500">
          Document Intelligence &amp; Content Optimization
        </p>
        <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900 tracking-tight">
          Social Media Content Analyzer
        </h1>
        <p className="text-sm text-zinc-600 max-w-xl leading-relaxed">
          Extract text from PDF documents or scanned image drafts to evaluate readability, hook strength, call-to-action clarity, and platform fit.
        </p>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3.5 rounded border border-zinc-300 bg-zinc-50 flex items-start justify-between text-xs text-zinc-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-zinc-900 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-zinc-500 hover:text-zinc-900 font-mono text-[11px]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Minimal Upload Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`border border-dashed rounded-lg p-10 sm:p-14 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-zinc-900 bg-zinc-100'
            : 'border-zinc-300 bg-white hover:border-zinc-400 hover:bg-zinc-50/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp,.bmp,.tiff"
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />

        <div className="max-w-sm mx-auto space-y-4">
          <div className="w-9 h-9 mx-auto rounded border border-zinc-200 bg-zinc-50 flex items-center justify-center text-zinc-700">
            <Upload className="w-4 h-4" />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-zinc-900">
              {isDragging ? 'Drop file to begin analysis' : 'Drop your document here, or click to browse'}
            </p>
            <p className="text-xs text-zinc-500 font-mono">
              PDF, PNG, JPG or WEBP — max 15MB
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center px-4 py-2 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded transition-colors"
          >
            Browse files
          </button>
        </div>
      </div>

      {/* Sample Documents Minimalist Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
          <span className="text-xs font-medium text-zinc-900">Sample Documents</span>
          <span className="text-[11px] font-mono text-zinc-400">Click to test instantly</span>
        </div>

        <div className="divide-y divide-zinc-200 border border-zinc-200 rounded-lg bg-white overflow-hidden">
          {SAMPLE_POSTS.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              disabled={disabled}
              onClick={() => onSampleSelected(sample.text, sample.filename)}
              className="w-full text-left p-4 hover:bg-zinc-50 transition-colors flex items-center justify-between gap-4 group"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-zinc-900">{sample.title}</span>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                    {sample.format}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 line-clamp-1">
                  {sample.desc}
                </p>
              </div>

              <div className="flex items-center gap-1 text-xs text-zinc-400 group-hover:text-zinc-900 font-mono shrink-0 transition-colors">
                <span>Analyze</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
