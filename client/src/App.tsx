import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { FileUpload } from './components/FileUpload';
import { ProcessingState } from './components/ProcessingState';
import { ExtractedContentView } from './components/ExtractedContentView';
import { MetricsDashboard } from './components/MetricsDashboard';
import { PlatformPreview } from './components/PlatformPreview';
import { RecommendationsCard } from './components/RecommendationsCard';
import { ErrorAlert } from './components/ErrorAlert';
import { uploadAndAnalyze, analyzeText, checkBackendHealth } from './services/api';
import { AnalysisResponse } from './types';

export const App: React.FC = () => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [processingFile, setProcessingFile] = useState<{ name: string; size?: number; isImage: boolean } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBackendHealthy, setIsBackendHealthy] = useState(true);

  useEffect(() => {
    checkBackendHealth().then((res) => {
      setIsBackendHealthy(res.status === 'healthy');
    });
  }, []);

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setAnalysisResult(null);

    const isImg = file.type.startsWith('image/') || !file.name.toLowerCase().endsWith('.pdf');
    setProcessingFile({
      name: file.name,
      size: file.size,
      isImage: isImg,
    });

    try {
      const data = await uploadAndAnalyze(file);
      setAnalysisResult(data);
    } catch (err: any) {
      console.error('File upload error:', err);
      setErrorMessage(err.message || 'Failed to process document. Please try a different file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSampleSelected = async (sampleText: string, filename: string) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setAnalysisResult(null);

    setProcessingFile({
      name: filename,
      size: sampleText.length,
      isImage: filename.endsWith('.png') || filename.endsWith('.jpg'),
    });

    try {
      const data = await analyzeText(sampleText, filename);
      setAnalysisResult(data);
    } catch (err: any) {
      console.error('Sample analysis error:', err);
      setErrorMessage(err.message || 'Failed to analyze sample text.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextReAnalyze = async (updatedText: string) => {
    setIsReanalyzing(true);
    setErrorMessage(null);

    try {
      const filename = analysisResult?.extractedContent.metadata.filename || 'edited-document.txt';
      const data = await analyzeText(updatedText, filename);
      setAnalysisResult(data);
    } catch (err: any) {
      console.error('Re-analysis error:', err);
      setErrorMessage(err.message || 'Failed to re-analyze edited text.');
    } finally {
      setIsReanalyzing(false);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setIsProcessing(false);
    setProcessingFile(null);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#fafafa]">
      <Navbar
        onReset={handleReset}
        hasActiveDocument={Boolean(analysisResult || isProcessing)}
        isBackendHealthy={isBackendHealthy}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-8">
        {/* Error Notification */}
        {errorMessage && (
          <ErrorAlert
            message={errorMessage}
            onDismiss={() => setErrorMessage(null)}
            onRetry={processingFile ? () => handleReset() : undefined}
          />
        )}

        {/* View 1: Upload / Landing State */}
        {!isProcessing && !analysisResult && (
          <FileUpload
            onFileSelected={handleFileUpload}
            onSampleSelected={handleSampleSelected}
            disabled={isProcessing}
          />
        )}

        {/* View 2: Processing State */}
        {isProcessing && processingFile && (
          <ProcessingState
            filename={processingFile.name}
            fileSize={processingFile.size}
            isImage={processingFile.isImage}
          />
        )}

        {/* View 3: Extracted Content & Analytics Results */}
        {!isProcessing && analysisResult && (
          <div className="space-y-8">
            {/* Extracted Text Section */}
            <ExtractedContentView
              extraction={analysisResult.extractedContent}
              onTextReAnalyze={handleTextReAnalyze}
              onReset={handleReset}
              isReanalyzing={isReanalyzing}
            />

            {/* Metrics Overview & Breakdown */}
            <MetricsDashboard metrics={analysisResult.metrics} />

            {/* Numbered Strategic Recommendations */}
            <RecommendationsCard
              recommendations={analysisResult.recommendations}
              improvedDrafts={analysisResult.improvedDrafts}
              aiGenerated={analysisResult.aiGenerated}
            />

            {/* Platform Compatibility Simulator */}
            <PlatformPreview
              text={analysisResult.extractedContent.text}
              suitability={analysisResult.metrics.platformSuitability}
            />
          </div>
        )}
      </main>

      {/* Editorial Minimal Footer */}
      <footer className="border-t border-zinc-200 bg-white py-6 text-center text-xs text-zinc-500 mt-12">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 font-mono text-[11px]">
          <span>Social Media Content Analyzer · Assessment Deliverable</span>
          <span>PDF Stream Parsing · Tesseract OCR · Engagement Intelligence</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
