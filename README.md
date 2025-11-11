# DPUI - Display Manager for macOS

<div align="center">
  <img src="https://img.shields.io/badge/macOS-10.15+-blue?style=flat-square" alt="macOS">
  <img src="https://img.shields.io/badge/Tauri-2.0-yellow?style=flat-square" alt="Tauri">
  <img src="https://img.shields.io/badge/React-19.1-61DAFB?style=flat-square" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square" alt="TypeScript">
  <img src="https://img.shields.io/badge/Rust-1.83-orange?style=flat-square" alt="Rust">
</div>

[한국어](#한국어) | [English](#english)

---

## 한국어

### 📋 개요

DPUI는 macOS에서 다중 모니터 레이아웃을 쉽게 관리할 수 있는 모던한 GUI 애플리케이션입니다. `displayplacer` CLI 도구를 Tauri와 React로 감싸서 직관적인 인터페이스를 제공합니다.

### ✨ 주요 기능

- 🖥️ **디스플레이 ON/OFF 토글**: 15초 카운트다운 확인 대화상자로 안전하게 관리
- 🛡️ **마지막 디스플레이 보호**: 모든 디스플레이를 끌 수 없도록 보호
- 🎯 **드래그 앤 드롭**: 디스플레이 위치를 쉽게 조정
- 💾 **프리셋 시스템**: 레이아웃을 저장하고 빠르게 불러오기
- 🎨 **모던 UI**: 그라데이션 디자인과 부드러운 애니메이션
- 🇰🇷 **한국어 지원**: 완전히 한국어화된 인터페이스

### 📦 요구사항

- **macOS** 10.15 (Catalina) 이상
- **[displayplacer](https://github.com/jakehilborn/displayplacer)** CLI 도구

#### displayplacer 설치

```bash
# Homebrew를 사용한 설치
brew install displayplacer

# 또는 직접 다운로드
curl -LO https://github.com/jakehilborn/displayplacer/releases/latest/download/displayplacer
chmod +x displayplacer
sudo mv displayplacer /usr/local/bin/
```

### 🚀 설치 방법

#### 옵션 1: 릴리스 다운로드 (권장)

1. [Releases](https://github.com/dev-jelly/dpui/releases) 페이지에서 최신 `.dmg` 파일 다운로드
2. DMG 파일을 열고 DPUI를 Applications 폴더로 드래그
3. 앱 실행 (처음 실행 시 보안 허용 필요)

#### 옵션 2: 소스에서 빌드

```bash
# 저장소 클론
git clone https://github.com/dev-jelly/dpui.git
cd dpui

# 의존성 설치 (pnpm 사용)
pnpm install

# 개발 모드 실행
pnpm run tauri dev

# 프로덕션 빌드
pnpm run tauri build
```

### 📖 사용 가이드

#### 기본 사용법

1. **앱 실행**: DPUI를 실행하면 현재 연결된 모든 디스플레이가 표시됩니다.

2. **디스플레이 관리**:
   - 🟢 **켜기**: 꺼진 디스플레이의 "켜기" 버튼 클릭
   - 🔴 **끄기**: 켜진 디스플레이의 "끄기" 버튼 클릭 → 15초 확인 대화상자 표시
   - ✋ **안전 장치**: 마지막 활성 디스플레이는 끌 수 없습니다

3. **위치 조정**:
   - 디스플레이 카드를 드래그하여 원하는 위치로 이동
   - 변경사항은 실시간으로 적용됩니다

4. **프리셋 관리**:
   - **저장**: "현재 레이아웃 저장" 버튼 클릭 → 이름 입력
   - **불러오기**: 저장된 프리셋의 "적용" 버튼 클릭
   - **삭제**: 프리셋의 "✕" 버튼 클릭

### 🛠️ 개발 환경 설정

#### 필수 도구

- [Node.js](https://nodejs.org/) 20+
- [Rust](https://www.rust-lang.org/) 1.70+
- [pnpm](https://pnpm.io/) 9+

#### 개발 시작

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행 (Hot Reload 지원)
pnpm run tauri dev

# 린트 실행
pnpm run lint

# 타입 체크
pnpm run type-check

# 프로덕션 빌드
pnpm run tauri build
```

#### 프로젝트 구조

```
dpui/
├── src/                    # React 프론트엔드
│   ├── components/        # React 컴포넌트
│   │   ├── AlertDialog.tsx      # 경고 대화상자
│   │   ├── ConfirmDialog.tsx    # 확인 대화상자 (15초 타이머)
│   │   ├── DisplayCanvas.tsx    # 디스플레이 레이아웃 캔버스
│   │   ├── DisplayCard.tsx      # 개별 디스플레이 카드
│   │   └── PresetManager.tsx    # 프리셋 관리자
│   ├── store/            # Zustand 상태 관리
│   └── types/            # TypeScript 타입 정의
├── src-tauri/            # Rust 백엔드
│   ├── src/
│   │   ├── displayplacer.rs    # displayplacer 통합
│   │   ├── presets.rs          # 프리셋 관리
│   │   └── lib.rs              # 메인 앱 로직
│   └── Cargo.toml
└── package.json
```

### 🔧 트러블슈팅

#### displayplacer를 찾을 수 없음

```bash
# displayplacer 설치 확인
which displayplacer

# 설치되어 있지 않다면
brew install displayplacer
```

#### 디스플레이가 표시되지 않음

1. displayplacer가 정상적으로 작동하는지 확인:
   ```bash
   displayplacer list
   ```
2. 시스템 환경설정 > 보안 및 개인 정보 보호에서 권한 확인
3. 앱 재시작

#### 빌드 오류

```bash
# Rust 툴체인 업데이트
rustup update

# 캐시 정리 후 재빌드
cargo clean
pnpm run tauri build
```

---

## English

### 📋 Overview

DPUI is a modern GUI application for easily managing multiple monitor layouts on macOS. It wraps the `displayplacer` CLI tool with Tauri and React to provide an intuitive interface.

### ✨ Key Features

- 🖥️ **Display ON/OFF Toggle**: Safely manage with 15-second countdown confirmation
- 🛡️ **Last Display Protection**: Prevents turning off all displays
- 🎯 **Drag & Drop**: Easily adjust display positions
- 💾 **Preset System**: Save and quickly load layouts
- 🎨 **Modern UI**: Gradient design with smooth animations
- 🇰🇷 **Korean Support**: Fully localized interface

### 📦 Requirements

- **macOS** 10.15 (Catalina) or later
- **[displayplacer](https://github.com/jakehilborn/displayplacer)** CLI tool

#### Installing displayplacer

```bash
# Install via Homebrew
brew install displayplacer

# Or download directly
curl -LO https://github.com/jakehilborn/displayplacer/releases/latest/download/displayplacer
chmod +x displayplacer
sudo mv displayplacer /usr/local/bin/
```

### 🚀 Installation

#### Option 1: Download Release (Recommended)

1. Download the latest `.dmg` file from [Releases](https://github.com/dev-jelly/dpui/releases)
2. Open the DMG and drag DPUI to Applications folder
3. Run the app (security permission required on first launch)

#### Option 2: Build from Source

```bash
# Clone repository
git clone https://github.com/dev-jelly/dpui.git
cd dpui

# Install dependencies (using pnpm)
pnpm install

# Run in development mode
pnpm run tauri dev

# Build for production
pnpm run tauri build
```

### 📖 Usage Guide

#### Basic Usage

1. **Launch App**: Run DPUI to see all connected displays

2. **Manage Displays**:
   - 🟢 **Turn On**: Click "Turn On" button on disabled display
   - 🔴 **Turn Off**: Click "Turn Off" button → 15-second confirmation dialog
   - ✋ **Safety**: Cannot turn off the last active display

3. **Adjust Positions**:
   - Drag display cards to desired positions
   - Changes apply in real-time

4. **Manage Presets**:
   - **Save**: Click "Save Current Layout" → Enter name
   - **Load**: Click "Apply" on saved preset
   - **Delete**: Click "✕" on preset

### 🛠️ Development Setup

#### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [Rust](https://www.rust-lang.org/) 1.70+
- [pnpm](https://pnpm.io/) 9+

#### Getting Started

```bash
# Install dependencies
pnpm install

# Run development server (with Hot Reload)
pnpm run tauri dev

# Run linting
pnpm run lint

# Type checking
pnpm run type-check

# Build for production
pnpm run tauri build
```

### 🎨 Tech Stack

- **Frontend**: React 19.1, TypeScript, Tailwind CSS
- **Backend**: Rust, Tauri 2.0
- **State Management**: Zustand
- **Build Tool**: Vite
- **External Dependency**: displayplacer CLI

### 📋 Roadmap

- [x] Basic display visualization
- [x] Preset save/load functionality
- [x] Drag and drop layout editing
- [x] Display ON/OFF toggle with safety features
- [x] Custom confirmation dialogs
- [x] Korean localization
- [ ] Global hotkey support
- [ ] System tray integration
- [ ] Auto-apply presets on display connection
- [ ] Export/import presets
- [ ] Dark mode support

### 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

### 🙏 Acknowledgments

- [displayplacer](https://github.com/jakehilborn/displayplacer) - Core display management functionality
- [Tauri](https://tauri.app/) - Desktop application framework
- [React](https://react.dev/) - UI framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

### 📞 Support

If you encounter any issues or have questions:

1. Check existing [Issues](https://github.com/dev-jelly/dpui/issues)
2. Create a new issue with details about your problem
3. Include your macOS version and displayplacer version (`displayplacer --version`)

---

<div align="center">
  Made with ❤️ for macOS users with multiple displays
</div>