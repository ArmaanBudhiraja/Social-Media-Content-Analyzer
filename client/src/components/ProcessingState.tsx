import React, { useEffect, useState } from 'react';
import { Loader2, Check } from 'lucide-react';

interface ProcessingStateProps {
  filename: string;
  fileSize?: number;
  isImage?: boolean;
}

export const ProcessingState: React.FC<ProcessingStateProps> = ({
  filename,
  fileSize,
  isImage = false,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = isImage
    ? [
        { label: 'File Validation', desc: 'Validating MIME type and integrity' },
        { label: 'Optical Character Recognition', desc: 'Tesseract OCR text extraction' },
        { label: 'Structure Formatting', desc: 'Preserving line breaks and layout' },
        { label: 'Engagement Analysis', desc: 'Computing readability, hook, and CTA metrics' },
      ]
    : [
        { label: 'Document Validation', desc: 'Checking PDF stream structure' },
        { label: 'PDF Text Extraction', desc: 'Extracting multi-page text and formatting' },
        { label: 'Linguistic Analysis', desc: 'Calculating Flesch score, hashtags, and mentions' },
        { label: 'Synthesis', desc: 'Generating recommendations and platform fit' },
      ];

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStep(1), 500);
    const timer2 = setTimeout(() => setCurrentStep(2), 1500);
    const timer3 = setTimeout(() => setCurrentStep(3), 2800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isImage]);

  return (
    <div className="w-full max-w-xl mx-auto py-12 px-4 space-y-6">
      {/* File Info Bar */}
      <div className="border border-zinc-200 rounded-lg p-4 bg-white flex items-center justify-between">
        <div className="space-y-0.5 min-w-0 flex-1">
          <p className="text-xs font-mono text-zinc-500 uppercase">Processing target</p>
          <p className="text-sm font-semibold text-zinc-900 truncate">{filename}</p>
        </div>
        <div className="text-right shrink-0">
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
            {isImage ? 'OCR' : 'PDF'}
            {fileSize ? ` · ${(fileSize / 1024).toFixed(0)} KB` : ''}
          </span>
        </div>
      </div>

      {/* Steps List */}
      <div className="border border-zinc-200 rounded-lg bg-white p-5 divide-y divide-zinc-100">
        {steps.map((step, idx) => {
          const isDone = currentStep > idx;
          const isCurrent = currentStep === idx;

          return (
            <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono transition-colors ${
                    isDone
                      ? 'bg-zinc-900 text-white'
                      : isCurrent
                      ? 'border border-zinc-900 text-zinc-900'
                      : 'border border-zinc-200 text-zinc-400'
                  }`}
                >
                  {isDone ? <Check className="w-3 h-3 stroke-[2.5]" /> : idx + 1}
                </div>
                <div>
                  <p className={`text-xs font-medium ${isCurrent || isDone ? 'text-zinc-900' : 'text-zinc-400'}`}>
                    {step.label}
                  </p>
                  <p className="text-[11px] text-zinc-500">{step.desc}</p>
                </div>
              </div>

              {isCurrent && <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-900 shrink-0" />}
            </div>
          );
        })}
      </div>
    </div>
  );
};
