# Changelog

All notable changes to DPUI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-11-11

### Added
- **Core Features**
  - Display ON/OFF toggle functionality with displayplacer integration
  - 15-second countdown confirmation dialog with auto-rollback
  - Last display protection to prevent turning off all displays
  - Real-time drag and drop display positioning
  - Visual feedback for display states (enabled/disabled)

- **Preset System**
  - Save current display layouts as presets
  - Quick apply saved presets
  - Delete unwanted presets
  - Persistent preset storage

- **Global Keyboard Shortcuts**
  - System-wide hotkeys for preset activation
  - Customizable shortcut assignments
  - Conflict detection and validation
  - Visual feedback on activation

- **System Tray Integration**
  - macOS menu bar icon
  - Quick access to presets from tray
  - Show/hide main window
  - Refresh displays command

- **User Interface**
  - Modern gradient design with smooth animations
  - Korean language support (한국어 지원)
  - Responsive hover and active states
  - Custom modal dialogs (ConfirmDialog, AlertDialog, ErrorDialog)
  - Real-time display canvas visualization

- **Error Handling**
  - Comprehensive error dialog with Korean translations
  - Troubleshooting hints for common issues
  - Recovery suggestions
  - Retry functionality
  - Debug logging for diagnostics

- **Developer Experience**
  - Complete JSDoc and Rust documentation
  - Comprehensive README in Korean and English
  - Build and release scripts
  - Production optimization settings

### Technical Stack
- Frontend: React 19.1.0, TypeScript, Tailwind CSS 4.x
- Backend: Rust, Tauri 2.0
- State Management: Zustand
- Build Tool: Vite
- External: displayplacer CLI integration

### Security
- Safe command execution with validation
- Protection against disabling all displays
- Proper error boundaries

### Performance
- Optimized production builds with LTO
- Efficient state management
- Minimal bundle size

## [0.1.0] - 2024-11-08 (Initial Development)

### Added
- Initial Tauri + React + TypeScript setup
- Basic displayplacer integration
- Simple preset management

---

## Upcoming Features (Roadmap)

### [1.1.0] - Planned
- Dark mode support
- Auto-apply presets on display connection
- Export/import presets
- Display resolution changing

### [1.2.0] - Future
- Multi-language support (beyond Korean/English)
- Cloud preset synchronization
- Display profiles for different scenarios
- Advanced display settings (refresh rate, color profile)