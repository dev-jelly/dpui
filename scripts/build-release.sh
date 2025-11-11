#!/bin/bash

# Build script for DPUI production release
# This script builds the application and creates a DMG installer

set -e

echo "🚀 Building DPUI for production..."

# Clean previous builds
echo "📦 Cleaning previous builds..."
rm -rf src-tauri/target/release/bundle

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Build the application
echo "🔨 Building application..."
pnpm run tauri build

# Check if build was successful
if [ -f "src-tauri/target/release/bundle/dmg/DPUI_1.0.0_aarch64.dmg" ] || [ -f "src-tauri/target/release/bundle/dmg/DPUI_1.0.0_x64.dmg" ]; then
    echo "✅ Build successful!"
    echo ""
    echo "📦 DMG files created in:"
    ls -la src-tauri/target/release/bundle/dmg/*.dmg
    echo ""
    echo "📱 App bundle created in:"
    ls -la src-tauri/target/release/bundle/macos/*.app
else
    echo "❌ Build failed!"
    exit 1
fi

echo ""
echo "🎉 DPUI build complete!"
echo ""
echo "Next steps:"
echo "1. Test the DMG installer"
echo "2. Code sign the application (if you have certificates)"
echo "3. Notarize for macOS Gatekeeper"
echo "4. Upload to GitHub Releases"