import React from 'react';
import { DisplayCanvas } from './components/DisplayCanvas';
import { PresetManager } from './components/PresetManager';
import { HotkeyManager } from './components/HotkeyManager';
import { ErrorDialog } from './components/ErrorDialog';
import { useDisplayStore } from './store/useDisplayStore';
import { listen } from '@tauri-apps/api/event';

function App() {
  const { fetchDisplays, fetchPresets, loading, error, presets, applyConfig } = useDisplayStore();
  const [showError, setShowError] = React.useState(false);
  const [errorContext, setErrorContext] = React.useState<string>('');

  // Track error changes
  React.useEffect(() => {
    if (error) {
      setShowError(true);
    }
  }, [error]);

  React.useEffect(() => {
    // Load initial data
    setErrorContext('초기 데이터 로드');
    fetchDisplays();
    fetchPresets();

    // Listen for system tray events
    const unlistenRefresh = listen('refresh-displays', () => {
      setErrorContext('디스플레이 새로고침');
      fetchDisplays();
    });

    const unlistenApplyPreset = listen('apply-preset-from-tray', (event) => {
      const presetId = event.payload as string;
      const preset = presets.find(p => p.id === presetId);
      if (preset) {
        setErrorContext('트레이에서 프리셋 적용');
        applyConfig(preset.config);
      }
    });

    // Cleanup listeners
    return () => {
      unlistenRefresh.then(fn => fn());
      unlistenApplyPreset.then(fn => fn());
    };
  }, [fetchDisplays, fetchPresets, presets, applyConfig]);

  const handleRetry = () => {
    setErrorContext('재시도');
    fetchDisplays();
    fetchPresets();
  };

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

          {/* Hotkey Manager */}
          <HotkeyManager />
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

      {/* Error Dialog */}
      <ErrorDialog
        isOpen={showError}
        errorMessage={error || ''}
        context={errorContext}
        onClose={() => {
          setShowError(false);
          // Clear the error in the store
          useDisplayStore.setState({ error: null });
        }}
        onRetry={handleRetry}
      />
    </div>
  );
}

export default App;
