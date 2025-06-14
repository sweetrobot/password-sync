import React, { useRef } from 'react';
import { Upload, FileText, Check } from 'lucide-react';

interface FileUploadProps {
  title: string;
  description: string;
  file: File | null;
  onFileSelect: (file: File) => void;
  accept: string;
  icon: 'apple' | 'google';
}

const FileUpload: React.FC<FileUploadProps> = ({
  title,
  description,
  file,
  onFileSelect,
  accept,
  icon
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'text/csv') {
      onFileSelect(droppedFile);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  const iconColor = icon === 'apple' ? 'from-gray-600 to-gray-800' : 'from-blue-600 to-blue-800';
  const borderColor = file ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-blue-400';

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${borderColor} hover:shadow-lg`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileInput}
        className="hidden"
      />
      
      <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r ${iconColor} rounded-full mb-4`}>
        {file ? (
          <Check className="w-6 h-6 text-white" />
        ) : (
          <Upload className="w-6 h-6 text-white" />
        )}
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      
      {file ? (
        <div className="flex items-center justify-center text-green-700">
          <FileText className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">{file.name}</span>
        </div>
      ) : (
        <p className="text-xs text-gray-500">
          Click to browse or drag and drop your CSV file
        </p>
      )}
    </div>
  );
};

export default FileUpload;