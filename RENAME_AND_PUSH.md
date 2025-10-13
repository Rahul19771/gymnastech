# 🚀 Quick Commands: Rename Folder & Push to GitHub

Follow these commands in order to rename your folder and push to GitHub.

## ⚡ Quick Commands (Copy & Paste)

### Step 1: Rename the Folder
```bash
cd /Users/rahulgush/projects/
mv gym gymnastech
cd gymnastech
```

### Step 2: Initialize Git & Create Initial Commit
```bash
# Initialize git
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: GymnaTech - Professional Gymnastics Scoring Platform"

# Set main branch
git branch -M main
```

### Step 3: Create GitHub Repository

**Go to:** https://github.com/new

**Settings:**
- Repository name: `gymnastech`
- Description: `GymnaTech - Professional Gymnastics Scoring Platform for Women's Artistic Gymnastics`
- Visibility: Public ✅ (or Private)
- **IMPORTANT:** DO NOT check any initialization options (no README, .gitignore, or license)

**Click:** "Create repository"

### Step 4: Connect to GitHub and Push

**Replace `YOUR_USERNAME` with your actual GitHub username:**

```bash
# Add remote (replace YOUR_USERNAME!)
git remote add origin https://github.com/YOUR_USERNAME/gymnastech.git

# Push to GitHub
git push -u origin main
```

### Step 5: Create Release Tag
```bash
# Create version tag
git tag -a v1.0.0 -m "GymnaTech v1.0.0 - Initial Release"

# Push tag
git push origin v1.0.0
```

### Step 6: Update README Badges (Optional)
```bash
# Update YOUR_USERNAME in README to your actual username
sed -i '' 's/YOUR_USERNAME/your-actual-username/g' README.md

# Commit the change
git add README.md
git commit -m "docs: update badge URLs"
git push
```

## ✅ Verification

After pushing, verify everything worked:

```bash
# Check remote
git remote -v

# Check status
git status

# View your repo
open https://github.com/YOUR_USERNAME/gymnastech
```

## 🎯 Expected Result

Your repository will be available at:
```
https://github.com/YOUR_USERNAME/gymnastech
```

## 📋 Repository Setup Checklist

After pushing, enhance your GitHub repository:

- [ ] Add repository topics/tags: `gymnastics`, `scoring-system`, `typescript`, `react`, `nodejs`, `postgresql`, `websocket`
- [ ] Enable GitHub Issues
- [ ] Enable GitHub Discussions
- [ ] Create first release from tag v1.0.0
- [ ] Update "About" section with website (when available)
- [ ] Star your own repo! ⭐

## 🔄 Alternative: Using GitHub CLI

If you have GitHub CLI installed:

```bash
# After renaming folder and being in gymnastech directory
cd /Users/rahulgush/projects/gymnastech

# Initialize and commit
git init
git add .
git commit -m "Initial commit: GymnaTech - Professional Gymnastics Scoring Platform"

# Create repo and push (all in one!)
gh repo create gymnastech --public --description "GymnaTech - Professional Gymnastics Scoring Platform" --source=. --remote=origin --push

# Create release
gh release create v1.0.0 --title "GymnaTech v1.0.0" --notes "Initial release - Professional Gymnastics Scoring Platform"
```

## 🐛 Troubleshooting

**Permission Denied?**
```bash
# Set up SSH key or use personal access token
# For HTTPS: Use personal access token as password
# For SSH: Set up SSH key in GitHub settings
```

**Remote Already Exists?**
```bash
# Remove existing remote
git remote remove origin

# Add correct remote
git remote add origin https://github.com/YOUR_USERNAME/gymnastech.git
```

**Push Rejected?**
```bash
# Pull first (if repo not empty)
git pull origin main --allow-unrelated-histories

# Then push
git push -u origin main
```

## 📚 Next Steps

1. ✅ Update badge URLs in README with your username
2. ✅ Add repository topics on GitHub
3. ✅ Enable Issues and Discussions
4. ✅ Create your first release
5. ✅ Share with the gymnastics community!

---

**Need help?** Check [GITHUB_SETUP.md](GITHUB_SETUP.md) for detailed instructions.

