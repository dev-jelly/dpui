import React from 'react';
import { DisplayCanvas } from './components/DisplayCanvas';
import { PresetManager } from './components/PresetManager';
import { useDisplayStore } from './store/useDisplayStore';

function App() {
  const { fetchDisplays, fetchPresets, loading, error } = useDisplayStore();

  React.useEffect(() => {
    // Load initial data
    fetchDisplays();
    fetchPresets();
  }, [fetchDisplays, fetchPresets]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg flex items-center justify-center">
              <span className="text-2xl">🖥️</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                DPUI
              </h1>
              <p className="text-sm text-gray-500 font-medium">
                Display Manager
              </p>
            </div>
          </div>
          <p className="text-gray-600 text-sm ml-16">
            macOS 디스플레이 레이아웃을 간편하게 관리하세요
          </p>
        </header>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg shadow-sm animate-fadeIn">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-semibold text-red-800">오류 발생</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg shadow-sm animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <p className="font-medium text-blue-800">로딩 중...</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="space-y-6">
          {/* Display Canvas */}
          <DisplayCanvas />

          {/* Preset Manager */}
          <PresetManager />
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>
            Powered by{' '}
            <a
              href="https://github.com/jakehilborn/displayplacer"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              displayplacer
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
