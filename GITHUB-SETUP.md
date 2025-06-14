# GitHub Actions Setup Guide

Follow these steps to build your Mac app using GitHub Actions (completely free!):

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Name your repository (e.g., "password-sync-app")
3. Make it public (required for free Actions)
4. Click "Create repository"

## Step 2: Upload Your Code

### Option A: Using GitHub Web Interface
1. Click "uploading an existing file"
2. Drag and drop ALL your project files
3. Make sure to include the `.github` folder with the workflow
4. Commit the files

### Option B: Using Git (if you have it)
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
git push -u origin main
```

## Step 3: Trigger the Build

1. Go to your repository on GitHub
2. Click the "Actions" tab
3. You should see "Build Password Sync App" workflow
4. Click on it, then click "Run workflow"
5. Click the green "Run workflow" button

## Step 4: Wait for Build (5-10 minutes)

The build process will:
- ✅ Set up macOS environment
- ✅ Install Node.js and dependencies  
- ✅ Build your React app
- ✅ Package it as a Mac app
- ✅ Create a DMG installer

## Step 5: Download Your App

1. Once the build completes (green checkmark)
2. Click on the completed workflow run
3. Scroll down to "Artifacts" section
4. Download "password-sync-mac"
5. Extract the ZIP file
6. You'll find your DMG installer inside!

## 🎉 That's It!

Your Mac app is ready to distribute. Users can:
- Double-click the DMG to install
- Drag the app to Applications
- Right-click → Open (first time only, since it's unsigned)

## Troubleshooting

**Build fails?**
- Make sure all files are uploaded, especially `.github/workflows/build.yml`
- Check that your repository is public (private repos have limited free Actions)

**No artifacts?**
- The build might have failed - check the logs in the Actions tab
- Make sure the workflow completed successfully (green checkmark)

**Can't open the app?**
- This is normal for unsigned apps
- Right-click the app → Open → Open (first time only)
- After that, it opens normally

## Free Tier Limits

GitHub Actions is free for public repositories with these limits:
- 2,000 minutes per month (plenty for occasional builds)
- Each build takes about 5-10 minutes
- You can run ~200 builds per month for free

Perfect for building and distributing your app! 🚀