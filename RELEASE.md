# DPUI Release Checklist

## Pre-Release Checklist

### 1. Code Quality
- [ ] All features tested and working
- [ ] No console errors or warnings
- [ ] Code documentation complete
- [ ] ESLint and TypeScript checks pass
- [ ] Rust code compiles without warnings

### 2. Version Updates
- [ ] Update version in `package.json`
- [ ] Update version in `src-tauri/Cargo.toml`
- [ ] Update version in `src-tauri/tauri.conf.json`
- [ ] Update CHANGELOG.md with release notes

### 3. Testing
- [ ] Test display ON/OFF toggle
- [ ] Test 15-second countdown and auto-rollback
- [ ] Test last display protection
- [ ] Test drag and drop positioning
- [ ] Test preset save/load/delete
- [ ] Test global keyboard shortcuts
- [ ] Test system tray menu
- [ ] Test error handling and recovery

### 4. Build Process
- [ ] Run `./scripts/build-release.sh`
- [ ] Verify DMG file created
- [ ] Test DMG installation on clean macOS
- [ ] Verify app launches correctly
- [ ] Test all features in production build

## Release Process

### 1. Build for Production
```bash
# Clean and build
pnpm run tauri build

# Or use the build script
./scripts/build-release.sh
```

### 2. Code Signing (Optional)
If you have an Apple Developer certificate:
```bash
# Sign the app
codesign --deep --force --verify --verbose --sign "Developer ID Application: Your Name" \
  src-tauri/target/release/bundle/macos/DPUI.app

# Verify signature
codesign --verify --verbose src-tauri/target/release/bundle/macos/DPUI.app
```

### 3. Notarization (Optional)
For distribution outside Mac App Store:
```bash
# Create a zip for notarization
ditto -c -k --keepParent src-tauri/target/release/bundle/macos/DPUI.app DPUI.zip

# Submit for notarization
xcrun altool --notarize-app --primary-bundle-id "com.jelly.dpui" \
  --username "your@email.com" --password "@keychain:AC_PASSWORD" \
  --file DPUI.zip

# Staple the notarization
xcrun stapler staple src-tauri/target/release/bundle/macos/DPUI.app
```

### 4. Create GitHub Release
1. Go to https://github.com/dev-jelly/dpui/releases
2. Click "Draft a new release"
3. Create tag (e.g., v1.0.0)
4. Set release title: "DPUI v1.0.0"
5. Add release notes from CHANGELOG.md
6. Upload DMG files:
   - `DPUI_1.0.0_aarch64.dmg` (Apple Silicon)
   - `DPUI_1.0.0_x64.dmg` (Intel)
7. Mark as pre-release if beta
8. Publish release

### 5. Post-Release
- [ ] Update README with latest version badge
- [ ] Announce on social media/forums
- [ ] Monitor issues for bug reports
- [ ] Plan next version features

## Distribution Files

### Required Files
- `DPUI_[version]_aarch64.dmg` - Apple Silicon Macs
- `DPUI_[version]_x64.dmg` - Intel Macs
- `README.md` - Documentation
- `LICENSE` - MIT License
- `CHANGELOG.md` - Release notes

### File Locations
- DMG files: `src-tauri/target/release/bundle/dmg/`
- App bundle: `src-tauri/target/release/bundle/macos/`
- Windows (if built): `src-tauri/target/release/bundle/msi/`

## Troubleshooting

### Build Errors
- Ensure Rust is up to date: `rustup update`
- Clear cache: `cargo clean`
- Reinstall dependencies: `pnpm install`

### Signing Issues
- Check Developer ID certificate: `security find-identity -p codesigning`
- Ensure certificate not expired
- Check keychain access permissions

### Notarization Issues
- Check Apple Developer account status
- Ensure app meets notarization requirements
- Review altool output for specific errors

## Version History

- v1.0.0 - Initial release with full feature set
  - Display ON/OFF toggle with safety features
  - Preset management system
  - Global keyboard shortcuts
  - System tray integration
  - Modern UI with Korean localization