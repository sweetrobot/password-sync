# Upload Project to GitHub - Terminal Commands

## Step 1: Open Terminal and Navigate to Project
```bash
cd ~/Downloads/project
```

## Step 2: Initialize Git Repository
```bash
git init
```

## Step 3: Add All Files
```bash
git add .
```

## Step 4: Make Initial Commit
```bash
git commit -m "Initial commit - Password Sync App"
```

## Step 5: Connect to Your GitHub Repository
```bash
git remote add origin https://github.com/sweetrobot/password-sync.git
```

## Step 6: Set Main Branch
```bash
git branch -M main
```

## Step 7: Push to GitHub
```bash
git push -u origin main
```

## If You Get Authentication Errors:
You might need to use a personal access token instead of password.

### Option A: Use GitHub CLI (Recommended)
```bash
# Install GitHub CLI first (if not installed)
brew install gh

# Login to GitHub
gh auth login

# Then push
git push -u origin main
```

### Option B: Use Personal Access Token
1. Go to GitHub.com → Settings → Developer settings → Personal access tokens
2. Generate new token with repo permissions
3. Use token as password when prompted

## After Upload Success:
1. Go to https://github.com/sweetrobot/password-sync
2. Click "Actions" tab
3. Click "Build Password Sync App"
4. Click "Run workflow"
5. Wait 5-10 minutes for build to complete
6. Download your Mac app from artifacts!

## Troubleshooting:
- If "git" command not found: Install Xcode Command Line Tools with `xcode-select --install`
- If repository already exists error: The repo might have files, try `git pull origin main` first