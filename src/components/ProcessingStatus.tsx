import React from 'react';
import { Loader2 } from 'lucide-react';

interface ProcessingStatusProps {
  stage: string;
  progress: number;
}

const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ stage, progress }) => {
  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="flex items-center justify-center mb-4">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
        Processing Files
      </h3>
      
      <p className="text-sm text-gray-600 text-center mb-4">{stage}</p>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <p className="text-xs text-gray-500 text-center mt-2">{progress}% complete</p>
    </div>
  );
};

export default ProcessingStatus;