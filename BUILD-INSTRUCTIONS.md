# Building Password Sync App

## Option 1: GitHub Actions (Free & Easy)

1. **Create GitHub Repository:**
   - Go to https://github.com/new
   - Upload all your project files
   - Make sure to include the `.github/workflows/build.yml` file

2. **Trigger Build:**
   - Go to your repository
   - Click "Actions" tab
   - Click "Build Electron App" workflow
   - Click "Run workflow" button
   - Wait 5-10 minutes for build to complete

3. **Download Your App:**
   - Once build completes, click on the workflow run
   - Download the "mac-app" artifact
   - Extract the ZIP to get your DMG file

## Option 2: CodeSandbox (Online IDE)

1. Go to https://codesandbox.io
2. Import your GitHub repository
3. Open terminal and run:
   ```bash
   npm install
   npm run build
   npm run electron:build:mac
   ```

## Option 3: Gitpod (Free Online VS Code)

1. Go to https://gitpod.io
2. Connect your GitHub account
3. Open your repository in Gitpod
4. Run build commands in terminal

## Option 4: Replit (Simple Online IDE)

1. Go to https://replit.com
2. Import from GitHub
3. Install dependencies and build

## Local Build Commands (If You Want to Try)

If you do want to build locally, you'll need:

```bash
# Install Node.js from https://nodejs.org
# Then run these commands:

npm install
npm run build
npm run electron:build:mac
```

The DMG file will be created in the `release/` folder.

## What You Get

The build process creates:
- **Password Sync.dmg** - Mac installer
- Users can drag the app to Applications folder
- App works offline with no internet required
- All password processing happens locally for security

## Troubleshooting

- **Build fails**: Make sure all files are uploaded to GitHub
- **Can't open app**: Users need to right-click → Open first time (unsigned app)
- **Missing dependencies**: The GitHub Action installs everything automatically

Choose **Option 1 (GitHub Actions)** - it's the easiest and completely free!