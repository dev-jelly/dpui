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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            DPUI - Display Manager
          </h1>
          <p className="text-gray-600">
            Manage your display layouts with displayplacer
          </p>
        </header>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="mb-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg">
            Loading...
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
