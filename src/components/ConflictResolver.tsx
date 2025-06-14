import React from 'react';
import { ArrowRight, ArrowLeft, AlertTriangle, Check, X, Eye, EyeOff } from 'lucide-react';
import { ConflictedPassword } from '../types/password';

interface ConflictResolverProps {
  conflicts: ConflictedPassword[];
  onResolveConflict: (conflictId: string, chosenSource: 'apple' | 'google') => void;
  onResolveAll: (source: 'apple' | 'google') => void;
}

const ConflictResolver: React.FC<ConflictResolverProps> = ({
  conflicts,
  onResolveConflict,
  onResolveAll
}) => {
  const [showPasswords, setShowPasswords] = React.useState<Set<string>>(new Set());
  const [expandedConflicts, setExpandedConflicts] = React.useState<Set<string>>(new Set());

  const unresolvedConflicts = conflicts.filter(c => !c.resolved);
  const resolvedConflicts = conflicts.filter(c => c.resolved);

  const togglePasswordVisibility = (conflictId: string) => {
    const newSet = new Set(showPasswords);
    if (newSet.has(conflictId)) {
      newSet.delete(conflictId);
    } else {
      newSet.add(conflictId);
    }
    setShowPasswords(newSet);
  };

  const toggleConflictExpansion = (conflictId: string) => {
    const newSet = new Set(expandedConflicts);
    if (newSet.has(conflictId)) {
      newSet.delete(conflictId);
    } else {
      newSet.add(conflictId);
    }
    setExpandedConflicts(newSet);
  };

  if (conflicts.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
          Resolve Conflicts ({unresolvedConflicts.length} remaining)
        </h3>
        
        {unresolvedConflicts.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => onResolveAll('apple')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              Choose All Apple
            </button>
            <button
              onClick={() => onResolveAll('google')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Choose All Google
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {unresolvedConflicts.map((conflict) => {
          const isExpanded = expandedConflicts.has(conflict.id);
          const showPassword = showPasswords.has(conflict.id);
          
          return (
            <div key={conflict.id} className="border border-yellow-200 rounded-lg bg-yellow-50">
              {/* Conflict Header */}
              <div 
                className="p-4 cursor-pointer hover:bg-yellow-100 transition-colors"
                onClick={() => toggleConflictExpansion(conflict.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {conflict.apple.title || conflict.google.title}
                    </h4>
                    <p className="text-sm text-gray-600">{conflict.reason}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {conflict.apple.url} • {conflict.apple.username}
                    </p>
                  </div>
                  <div className="text-gray-400">
                    {isExpanded ? '−' : '+'}
                  </div>
                </div>
              </div>

              {/* Expanded Conflict Details */}
              {isExpanded && (
                <div className="border-t border-yellow-200 p-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Apple Version */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium text-gray-700 flex items-center">
                          <div className="w-3 h-3 bg-gray-600 rounded-full mr-2" />
                          Apple Version
                        </h5>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onResolveConflict(conflict.id, 'apple');
                          }}
                          className="flex items-center px-3 py-1 bg-gray-600 text-white rounded text-sm font-medium hover:bg-gray-700 transition-colors"
                        >
                          <ArrowLeft className="w-3 h-3 mr-1" />
                          Choose This
                        </button>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-500">URL:</span>
                          <p className="text-gray-900 break-all">{conflict.apple.url}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Username:</span>
                          <p className="text-blue-600">{conflict.apple.username}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Password:</span>
                          <div className="flex items-center gap-2">
                            <p className="text-gray-900 font-mono">
                              {showPassword ? conflict.apple.password : '••••••••'}
                            </p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePasswordVisibility(conflict.id);
                              }}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        {conflict.apple.notes && (
                          <div>
                            <span className="text-gray-500">Notes:</span>
                            <p className="text-gray-700">{conflict.apple.notes}</p>
                          </div>
                        )}
                        {conflict.apple.otpAuth && (
                          <div>
                            <span className="text-gray-500">2FA:</span>
                            <p className="text-green-600">✓ Available</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Google Version */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium text-gray-700 flex items-center">
                          <div className="w-3 h-3 bg-blue-600 rounded-full mr-2" />
                          Google Version
                        </h5>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onResolveConflict(conflict.id, 'google');
                          }}
                          className="flex items-center px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          Choose This
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </button>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-500">URL:</span>
                          <p className="text-gray-900 break-all">{conflict.google.url}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Username:</span>
                          <p className="text-blue-600">{conflict.google.username}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Password:</span>
                          <div className="flex items-center gap-2">
                            <p className="text-gray-900 font-mono">
                              {showPassword ? conflict.google.password : '••••••••'}
                            </p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePasswordVisibility(conflict.id);
                              }}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        {conflict.google.notes && (
                          <div>
                            <span className="text-gray-500">Notes:</span>
                            <p className="text-gray-700">{conflict.google.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Resolved Conflicts Summary */}
        {resolvedConflicts.length > 0 && (
          <div className="border border-green-200 rounded-lg bg-green-50 p-4">
            <h4 className="font-medium text-green-800 flex items-center mb-2">
              <Check className="w-4 h-4 mr-2" />
              Resolved Conflicts ({resolvedConflicts.length})
            </h4>
            <div className="text-sm text-green-700">
              {resolvedConflicts.map((conflict) => (
                <div key={conflict.id} className="flex items-center justify-between py-1">
                  <span>{conflict.apple.title || conflict.google.title}</span>
                  <span className="font-medium">
                    Chose {conflict.chosenSource === 'apple' ? 'Apple' : 'Google'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConflictResolver;