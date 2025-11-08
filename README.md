# DPUI - Display Manager

A macOS application for managing display layouts using [displayplacer](https://github.com/jakehilborn/displayplacer) with a beautiful graphical interface.

## ✨ Features

- 🖥️ **Multi-Monitor Support**: Automatically creates windows on all connected displays
- 🎨 **Visual Layout Editor**: Drag and drop displays to arrange them
- 💾 **Preset Management**: Save and quickly switch between display configurations
- ⌨️ **Hotkey Support**: Assign keyboard shortcuts to presets (planned)
- 🎯 **Real-time Preview**: See your display configuration visually before applying

## 🚀 Getting Started

### Prerequisites

1. **macOS** (required)
2. **displayplacer** - Install via Homebrew:
   ```bash
   brew install displayplacer
   ```

### Installation

#### Option 1: Download Pre-built Binary (Coming Soon)
Download the latest release from the [Releases](https://github.com/dev-jelly/dpui/releases) page.

#### Option 2: Build from Source

1. **Install Dependencies**:
   ```bash
   # Install Rust
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

   # Install Node.js (if not already installed)
   brew install node
   ```

2. **Clone and Build**:
   ```bash
   git clone https://github.com/dev-jelly/dpui.git
   cd dpui
   npm install
   npm run tauri build
   ```

3. **Run the App**:
   ```bash
   npm run tauri dev
   ```

## 🎮 Usage

### Basic Workflow

1. **Launch DPUI** - The app will create windows on all connected displays
2. **View Current Layout** - See your current display arrangement in the canvas
3. **Adjust Positions** - Drag displays to rearrange them
4. **Save Preset** - Click "Save Current Layout" to save your configuration
5. **Quick Switch** - Click "Apply" on any saved preset to instantly switch layouts

### Saving a Preset

1. Arrange your displays as desired (either in System Settings or by dragging in DPUI)
2. Click the **"+ Save Current Layout"** button
3. Enter a name (e.g., "Dual Monitor - Work")
4. Optionally add a hotkey (e.g., "Cmd+Shift+1")
5. Click **"Save Preset"**

### Applying a Preset

Simply click the **"Apply"** button next to any saved preset to instantly apply that display configuration.

## 🏗️ Architecture

### Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Rust (Tauri)
- **State Management**: Zustand
- **CLI Integration**: displayplacer

### Project Structure

```
dpui/
├── src/                    # React frontend
│   ├── components/         # UI components
│   │   ├── DisplayCanvas.tsx
│   │   ├── DisplayCard.tsx
│   │   └── PresetManager.tsx
│   ├── store/              # Zustand stores
│   │   └── useDisplayStore.ts
│   ├── types/              # TypeScript types
│   │   └── display.ts
│   └── App.tsx
├── src-tauri/              # Rust backend
│   ├── src/
│   │   ├── displayplacer.rs  # displayplacer integration
│   │   ├── presets.rs        # Preset management
│   │   └── lib.rs            # Main app logic
│   └── Cargo.toml
└── README.md
```

## 🛠️ Development

### Running in Development Mode

```bash
npm run tauri dev
```

This will start the Vite dev server and launch the Tauri app in development mode.

### Building for Production

```bash
npm run tauri build
```

The built app will be in `src-tauri/target/release/bundle/`.

### Testing displayplacer Integration

You can test displayplacer commands directly:

```bash
# List current display configuration
displayplacer list

# Apply a configuration
displayplacer "id:1 res:2560x1440 origin:(0,0) degree:0"
```

## 📋 Roadmap

- [x] Basic display visualization
- [x] Preset save/load functionality
- [x] Multi-window support
- [x] Drag and drop layout editing
- [ ] Global hotkey support
- [ ] System tray integration
- [ ] Auto-apply presets on display connection
- [ ] Export/import presets
- [ ] Dark mode support

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [displayplacer](https://github.com/jakehilborn/displayplacer) - The excellent CLI tool that powers this app
- [Tauri](https://tauri.app/) - For making it easy to build lightweight desktop apps
- [React](https://react.dev/) - The UI framework
- [Tailwind CSS](https://tailwindcss.com/) - For beautiful styling

## 📞 Support

If you encounter any issues or have questions:

1. Check existing [Issues](https://github.com/dev-jelly/dpui/issues)
2. Create a new issue with details about your problem
3. Include your macOS version and displayplacer version (`displayplacer --version`)

---

Made with ❤️ for macOS power users
