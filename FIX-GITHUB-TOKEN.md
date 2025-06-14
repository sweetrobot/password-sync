# Fix GitHub Token Permissions

## The Issue
Your Personal Access Token doesn't have "workflow" permissions, which are needed to upload GitHub Actions files.

## Solution 1: Update Your Token Permissions (Recommended)

1. Go to https://github.com/settings/tokens
2. Find your existing token and click "Edit" 
3. Check the "workflow" checkbox (in addition to "repo")
4. Click "Update token"
5. Try pushing again:
   ```bash
   git push -u origin main
   ```

## Solution 2: Use GitHub CLI (Easier)

```bash
# Install GitHub CLI if you don't have it
brew install gh

# Login (this will handle permissions automatically)
gh auth login

# Push again
git push -u origin main
```

## Solution 3: Manual Upload of Workflow File

If the above doesn't work:

1. Your code files are already uploaded! ✅
2. Go to https://github.com/sweetrobot/password-sync
3. Create the workflow manually:
   - Click "Actions" tab
   - Click "set up a workflow yourself"
   - Replace the default content with the build.yml content
   - Commit the file

## Check if Upload Worked

Go to https://github.com/sweetrobot/password-sync and see if your files are there. If they are, you can proceed to run the GitHub Action even without the workflow file being pushed via git.

## Next Steps Once Fixed

1. Go to your repository: https://github.com/sweetrobot/password-sync
2. Click "Actions" tab
3. You should see "Build Password Sync App" workflow
4. Click "Run workflow" 
5. Wait 5-10 minutes for your Mac app to build!