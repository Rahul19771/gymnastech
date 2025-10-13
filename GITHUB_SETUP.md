# GitHub Setup Guide for GymnaTech

## Step 1: Rename the Folder

First, let's rename the project folder from `gym` to `gymnastech`:

```bash
# Navigate to parent directory
cd /Users/rahulgush/projects/

# Rename the folder
mv gym gymnastech

# Navigate into the new folder
cd gymnastech
```

## Step 2: Initialize Git Repository

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: GymnaTech - Professional Gymnastics Scoring Platform"
```

## Step 3: Create GitHub Repository

### Option A: Using GitHub CLI (Recommended)

If you have GitHub CLI installed:

```bash
# Login to GitHub (if not already logged in)
gh auth login

# Create repository
gh repo create gymnastech --public --description "GymnaTech - Professional Gymnastics Scoring Platform for Women's Artistic Gymnastics" --source=. --remote=origin --push
```

### Option B: Using GitHub Web Interface

1. Go to https://github.com/new
2. Fill in repository details:
   - **Repository name:** `gymnastech`
   - **Description:** `GymnaTech - Professional Gymnastics Scoring Platform for Women's Artistic Gymnastics`
   - **Visibility:** Public or Private (your choice)
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
3. Click "Create repository"

4. Connect your local repo to GitHub:

```bash
# Add remote origin (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/gymnastech.git

# Rename default branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 4: Verify Everything is Pushed

```bash
# Check repository status
git status

# View remote
git remote -v

# Check what's been pushed
git log --oneline
```

## Repository Structure on GitHub

Your GitHub repository will have this structure:

```
gymnastech/
├── .gitignore
├── README.md
├── SETUP.md
├── QUICKSTART.md
├── API_DOCUMENTATION.md
├── BRANDING.md
├── GITHUB_SETUP.md
├── REBRANDING_SUMMARY.md
├── Software_Requirement.MD
├── package.json
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
└── frontend/
    ├── package.json
    ├── tsconfig.json
    ├── index.html
    └── src/
```

## Recommended GitHub Repository Settings

### About Section
- **Description:** GymnaTech - Professional Gymnastics Scoring Platform
- **Website:** https://gymnastech.io (when available)
- **Topics/Tags:** 
  - `gymnastics`
  - `scoring-system`
  - `typescript`
  - `react`
  - `nodejs`
  - `postgresql`
  - `websocket`
  - `real-time`
  - `sports-technology`
  - `fig-gymnastics`

### Branch Protection (Optional but Recommended)

For the `main` branch:
1. Go to Settings → Branches
2. Add branch protection rule for `main`:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass before merging
   - ✅ Include administrators

## Create Additional GitHub Assets

### 1. Add Topics/Tags

```bash
# Using GitHub CLI
gh repo edit --add-topic gymnastics,scoring-system,typescript,react,nodejs,postgresql,websocket,real-time,sports-technology
```

Or manually through GitHub web interface: Repository → About → ⚙️ Settings → Topics

### 2. Create GitHub Releases

After pushing:

```bash
# Create a release tag
git tag -a v1.0.0 -m "GymnaTech v1.0.0 - Initial Release"
git push origin v1.0.0

# Or using GitHub CLI
gh release create v1.0.0 --title "GymnaTech v1.0.0" --notes "Initial release of GymnaTech - Professional Gymnastics Scoring Platform"
```

### 3. Enable GitHub Pages (Optional)

If you want to host documentation:
1. Go to Settings → Pages
2. Source: Deploy from branch `main`
3. Folder: `/` (root) or `/docs` if you create one

## Future Git Workflow

### Daily Development

```bash
# Check status
git status

# Add changes
git add .

# Commit with meaningful message
git commit -m "feat: add new feature"

# Push to GitHub
git push origin main
```

### Commit Message Conventions

Use conventional commits:

```bash
# New features
git commit -m "feat: add athlete management UI"

# Bug fixes
git commit -m "fix: correct score calculation for vault"

# Documentation
git commit -m "docs: update API documentation"

# Styling
git commit -m "style: improve leaderboard layout"

# Refactoring
git commit -m "refactor: optimize scoring service"

# Performance
git commit -m "perf: improve database query performance"

# Tests
git commit -m "test: add unit tests for scoring logic"
```

## Collaboration Features

### Issues
Enable GitHub Issues for bug tracking and feature requests

### Projects
Create GitHub Projects for task management

### Wiki
Enable Wiki for extended documentation

### Discussions
Enable Discussions for community Q&A

## Clone Instructions for Team Members

Add this to your README for team members:

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/gymnastech.git

# Navigate into directory
cd gymnastech

# Install dependencies
npm install

# Follow SETUP.md for complete installation
```

## CI/CD Setup (Future)

Consider adding GitHub Actions for:
- Automated testing
- Linting
- Build verification
- Deployment

Create `.github/workflows/ci.yml` for continuous integration.

## Repository Links

After setup, your repository will be available at:
- **HTTPS:** `https://github.com/YOUR_USERNAME/gymnastech`
- **SSH:** `git@github.com:YOUR_USERNAME/gymnastech.git`
- **Web:** `https://github.com/YOUR_USERNAME/gymnastech`

## Quick Reference Commands

```bash
# Rename folder
cd /Users/rahulgush/projects/
mv gym gymnastech
cd gymnastech

# Git setup
git init
git add .
git commit -m "Initial commit: GymnaTech - Professional Gymnastics Scoring Platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/gymnastech.git
git push -u origin main

# Create release
git tag -a v1.0.0 -m "Initial Release"
git push origin v1.0.0
```

---

**Ready to share GymnaTech with the world! 🚀**

