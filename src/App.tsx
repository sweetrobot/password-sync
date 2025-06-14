import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import ProcessingStatus from './components/ProcessingStatus';
import ResultsDisplay from './components/ResultsDisplay';
import MergeOptions from './components/MergeOptions';
import ConflictResolver from './components/ConflictResolver';
import { Password, SyncResult, ProcessingState, MergeDirection, ConflictedPassword } from './types/password';
import { syncPasswords, applyConflictResolutions } from './utils/passwordSync';
import { Shield, Zap } from 'lucide-react';

function App() {
  const [appleFile, setAppleFile] = useState<File | null>(null);
  const [googleFile, setGoogleFile] = useState<File | null>(null);
  const [mergeDirection, setMergeDirection] = useState<MergeDirection>('bidirectional');
  const [processing, setProcessing] = useState<ProcessingState>({
    isProcessing: false,
    stage: '',
    progress: 0
  });
  const [results, setResults] = useState<SyncResult | null>(null);
  const [error, setError] = useState<string>('');
  const [showConflictResolver, setShowConflictResolver] = useState(false);

  const handleSync = async () => {
    if (!appleFile || !googleFile) {
      setError('Please upload both Apple and Google password files');
      return;
    }

    setError('');
    setProcessing({ isProcessing: true, stage: 'Reading files...', progress: 20 });

    try {
      const result = await syncPasswords(
        appleFile, 
        googleFile,
        mergeDirection,
        (stage, progress) => setProcessing({ isProcessing: true, stage, progress })
      );
      
      setResults(result);
      setProcessing({ isProcessing: false, stage: '', progress: 100 });
      
      // Show conflict resolver if there are conflicts
      if (result.conflicts.length > 0) {
        setShowConflictResolver(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during sync');
      setProcessing({ isProcessing: false, stage: '', progress: 0 });
    }
  };

  const handleResolveConflict = (conflictId: string, chosenSource: 'apple' | 'google') => {
    if (!results) return;

    const updatedConflicts = results.conflicts.map(conflict => 
      conflict.id === conflictId 
        ? { ...conflict, resolved: true, chosenSource }
        : conflict
    );

    const updatedResults = applyConflictResolutions(results, updatedConflicts);
    setResults(updatedResults);
  };

  const handleResolveAllConflicts = (source: 'apple' | 'google') => {
    if (!results) return;

    const resolvedConflicts = results.conflicts.map(conflict => ({
      ...conflict,
      resolved: true,
      chosenSource: source
    }));

    const updatedResults = applyConflictResolutions(results, resolvedConflicts);
    setResults(updatedResults);
  };

  const handleReset = () => {
    setAppleFile(null);
    setGoogleFile(null);
    setResults(null);
    setError('');
    setProcessing({ isProcessing: false, stage: '', progress: 0 });
    setShowConflictResolver(false);
    setMergeDirection('bidirectional');
  };

  const unresolvedConflicts = results?.conflicts.filter(c => !c.resolved) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Password Sync
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Securely merge your Apple and Google password exports into a unified collection. 
            All processing happens locally in your browser.
          </p>
        </div>

        {/* Main Content */}
        {!results ? (
          <div className="max-w-4xl mx-auto">
            {/* File Upload Section */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <FileUpload
                title="Apple Passwords"
                description="Upload your Apple passwords CSV export"
                file={appleFile}
                onFileSelect={setAppleFile}
                accept=".csv"
                icon="apple"
              />
              <FileUpload
                title="Google Passwords"
                description="Upload your Google passwords CSV export"
                file={googleFile}
                onFileSelect={setGoogleFile}
                accept=".csv"
                icon="google"
              />
            </div>

            {/* Merge Options */}
            {appleFile && googleFile && (
              <MergeOptions
                direction={mergeDirection}
                onDirectionChange={setMergeDirection}
                appleCount={0} // Will be populated after parsing
                googleCount={0} // Will be populated after parsing
              />
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Processing Status */}
            {processing.isProcessing && (
              <ProcessingStatus 
                stage={processing.stage} 
                progress={processing.progress} 
              />
            )}

            {/* Sync Button */}
            {!processing.isProcessing && (
              <div className="text-center">
                <button
                  onClick={handleSync}
                  disabled={!appleFile || !googleFile}
                  className={`inline-flex items-center px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 ${
                    appleFile && googleFile
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 shadow-lg hover:shadow-xl'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Sync Passwords
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            {/* Conflict Resolver */}
            {showConflictResolver && unresolvedConflicts.length > 0 && (
              <ConflictResolver
                conflicts={results.conflicts}
                onResolveConflict={handleResolveConflict}
                onResolveAll={handleResolveAllConflicts}
              />
            )}

            {/* Results Display */}
            <ResultsDisplay 
              results={results} 
              onReset={handleReset}
              showConflictResolver={showConflictResolver}
              onToggleConflictResolver={() => setShowConflictResolver(!showConflictResolver)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;