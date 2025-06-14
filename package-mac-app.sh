#!/bin/bash

# Create a directory for the package
mkdir -p password-sync-package

# Copy the DMG file
cp release/*.dmg password-sync-package/

# Create a README file
cat > password-sync-package/README.txt << 'EOF'
Password Sync App
=================

This package contains the Password Sync application for macOS.

Installation:
1. Open the DMG file
2. Drag the Password Sync app to your Applications folder
3. Open the app from your Applications folder

Usage:
- Upload your Apple and Google password CSV exports
- The app will merge them and allow you to export in both formats
- All processing happens locally on your computer for security

Note: You may need to right-click the app and select "Open" the first time you run it,
since it's not signed with an Apple Developer certificate.
EOF

# Create a zip file
zip -r password-sync-mac.zip password-sync-package

# Clean up
rm -rf password-sync-package

echo "Package created: password-sync-mac.zip"