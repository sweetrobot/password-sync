import React, { useState } from 'react';
import { Download, RefreshCw, AlertTriangle, CheckCircle, Users, Shield, Settings } from 'lucide-react';
import { SyncResult, Password } from '../types/password';
import { exportToCsv, exportToAppleFormat, exportToGoogleFormat } from '../utils/csvExport';

interface ResultsDisplayProps {
  results: SyncResult;
  onReset: () => void;
  showConflictResolver: boolean;
  onToggleConflictResolver: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ 
  results, 
  onReset, 
  showConflictResolver,
  onToggleConflictResolver 
}) => {
  const [activeTab, setActiveTab] = useState<'merged' | 'conflicts'>('merged');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPasswords = results.merged.filter(password => 
    password.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    password.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
    password.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unresolvedConflicts = results.conflicts.filter(c => !c.resolved);
  const resolvedConflicts = results.conflicts.filter(c => c.resolved);

  const handleExportMerged = () => {
    exportToCsv(results.merged, 'synced-passwords.csv');
  };

  const handleExportApple = () => {
    exportToAppleFormat(results.merged, 'apple-passwords.csv');
  };

  const handleExportGoogle = () => {
    exportToGoogleFormat(results.merged, 'google-passwords.csv');
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{results.stats.mergedCount}</p>
              <p className="text-sm text-gray-600">Total Merged</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {unresolvedConflicts.length}
                {resolvedConflicts.length > 0 && (
                  <span className="text-sm text-green-600 ml-1">
                    (+{resolvedConflicts.length} resolved)
                  </span>
                )}
              </p>
              <p className="text-sm text-gray-600">Conflicts</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center">
            <Shield className="w-8 h-8 text-gray-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{results.stats.uniqueFromApple}</p>
              <p className="text-sm text-gray-600">From Apple</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{results.stats.uniqueFromGoogle}</p>
              <p className="text-sm text-gray-600">From Google</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleExportApple}
            className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Download className="w-5 h-5 mr-2" />
            Export for Apple
          </button>
          
          <button
            onClick={handleExportGoogle}
            className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Download className="w-5 h-5 mr-2" />
            Export for Google
          </button>
        </div>
        
        <button
          onClick={handleExportMerged}
          className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Download className="w-5 h-5 mr-2" />
          Export All Merged
        </button>

        {/* Conflict Resolver Toggle */}
        {results.conflicts.length > 0 && (
          <button
            onClick={onToggleConflictResolver}
            className={`flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              showConflictResolver
                ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
            }`}
          >
            <Settings className="w-5 h-5 mr-2" />
            {showConflictResolver ? 'Hide' : 'Resolve'} Conflicts
          </button>
        )}
        
        <button
          onClick={onReset}
          className="flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors duration-200"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          Start Over
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('merged')}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'merged'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Merged Passwords ({results.stats.mergedCount})
            </button>
            {results.stats.conflictCount > 0 && (
              <button
                onClick={() => setActiveTab('conflicts')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'conflicts'
                    ? 'border-yellow-600 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Conflicts ({unresolvedConflicts.length} unresolved)
              </button>
            )}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'merged' && (
            <>
              {/* Search */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Search passwords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Password List */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredPasswords.map((password) => (
                  <div key={password.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{password.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{password.url}</p>
                        <p className="text-sm text-blue-600 mt-1">{password.username}</p>
                        {password.notes && (
                          <p className="text-xs text-gray-500 mt-2">{password.notes}</p>
                        )}
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        password.source === 'apple' 
                          ? 'bg-gray-100 text-gray-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {password.source === 'apple' ? 'Apple' : 'Google'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'conflicts' && results.conflicts.length > 0 && (
            <div className="space-y-6">
              {/* Unresolved Conflicts */}
              {unresolvedConflicts.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">
                    Unresolved Conflicts ({unresolvedConflicts.length})
                  </h4>
                  {unresolvedConflicts.map((conflict, index) => (
                    <div key={conflict.id} className="border border-yellow-200 rounded-lg p-4 bg-yellow-50 mb-4">
                      <h5 className="font-semibold text-gray-900 mb-2">Conflict: {conflict.reason}</h5>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="border border-gray-200 rounded p-3 bg-white">
                          <h6 className="font-medium text-gray-700 mb-2">Apple Version</h6>
                          <p className="text-sm text-gray-600">{conflict.apple.url}</p>
                          <p className="text-sm text-blue-600">{conflict.apple.username}</p>
                        </div>
                        <div className="border border-gray-200 rounded p-3 bg-white">
                          <h6 className="font-medium text-gray-700 mb-2">Google Version</h6>
                          <p className="text-sm text-gray-600">{conflict.google.url}</p>
                          <p className="text-sm text-blue-600">{conflict.google.username}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Resolved Conflicts */}
              {resolvedConflicts.length > 0 && (
                <div className="border border-green-200 rounded-lg bg-green-50 p-4">
                  <h4 className="font-medium text-green-800 flex items-center mb-2">
                    <CheckCircle className="w-4 h-4 mr-2" />
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
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;