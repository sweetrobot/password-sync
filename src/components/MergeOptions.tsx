import React from 'react';
import { ArrowRight, ArrowLeft, ArrowLeftRight, Shield, Users } from 'lucide-react';
import { MergeDirection } from '../types/password';

interface MergeOptionsProps {
  direction: MergeDirection;
  onDirectionChange: (direction: MergeDirection) => void;
  appleCount: number;
  googleCount: number;
}

const MergeOptions: React.FC<MergeOptionsProps> = ({
  direction,
  onDirectionChange,
  appleCount,
  googleCount
}) => {
  const options = [
    {
      id: 'bidirectional' as MergeDirection,
      title: 'Smart Merge',
      description: 'Merge both collections intelligently',
      icon: ArrowLeftRight,
      color: 'from-purple-600 to-blue-600',
      detail: 'Best of both worlds - combines unique passwords from both sources'
    },
    {
      id: 'google-to-apple' as MergeDirection,
      title: 'Merge Google → Apple',
      description: `Add Google passwords to Apple (${googleCount} → ${appleCount})`,
      icon: ArrowRight,
      color: 'from-blue-600 to-gray-600',
      detail: 'Keep Apple as primary, add missing Google passwords'
    },
    {
      id: 'apple-to-google' as MergeDirection,
      title: 'Merge Apple → Google',
      description: `Add Apple passwords to Google (${appleCount} → ${googleCount})`,
      icon: ArrowLeft,
      color: 'from-gray-600 to-blue-600',
      detail: 'Keep Google as primary, add missing Apple passwords'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
        <ArrowLeftRight className="w-5 h-5 mr-2 text-purple-600" />
        Choose Merge Direction
      </h3>
      
      <div className="grid gap-4">
        {options.map((option) => {
          const Icon = option.icon;
          const isSelected = direction === option.id;
          
          return (
            <div
              key={option.id}
              onClick={() => onDirectionChange(option.id)}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'border-purple-500 bg-purple-50 shadow-md'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start">
                <div className={`inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r ${option.color} rounded-full mr-4 flex-shrink-0`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-gray-900">{option.title}</h4>
                    {isSelected && (
                      <div className="w-4 h-4 bg-purple-600 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{option.description}</p>
                  <p className="text-xs text-gray-500">{option.detail}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MergeOptions;