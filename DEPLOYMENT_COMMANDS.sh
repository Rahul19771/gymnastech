#!/bin/bash

# GymnaTech - GitHub Deployment Script
# This script helps you rename the folder and push to GitHub

echo "🏆 GymnaTech - GitHub Deployment Script"
echo "========================================"
echo ""

# Step 1: Rename folder
echo "📁 Step 1: Renaming folder from 'gym' to 'gymnastech'..."
echo ""
echo "Please run these commands manually:"
echo ""
echo "  cd /Users/rahulgush/projects/"
echo "  mv gym gymnastech"
echo "  cd gymnastech"
echo ""
read -p "Press Enter when you've completed the folder rename..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Make sure you're in the gymnastech directory."
    exit 1
fi

echo ""
echo "✅ Folder renamed successfully!"
echo ""

# Step 2: Initialize Git
echo "📝 Step 2: Initializing Git repository..."
git init
echo ""

# Step 3: Add all files
echo "➕ Step 3: Adding all files..."
git add .
echo ""

# Step 4: Create initial commit
echo "💾 Step 4: Creating initial commit..."
git commit -m "Initial commit: GymnaTech - Professional Gymnastics Scoring Platform

- Complete backend API with Express, TypeScript, PostgreSQL
- React frontend with real-time updates
- Multi-judge scoring system with FIG WAG compliance
- Real-time leaderboards with WebSocket support
- Role-based access control (Admin, Judge, Official, Athlete, Public)
- Complete audit trail and transparency features
- Comprehensive documentation and setup guides"
echo ""

# Step 5: Create main branch
echo "🌿 Step 5: Setting up main branch..."
git branch -M main
echo ""

# Step 6: Get GitHub username
echo "🔗 Step 6: GitHub Setup"
echo ""
read -p "Enter your GitHub username: " GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    echo "❌ Error: GitHub username is required"
    exit 1
fi

# Step 7: Add remote
echo ""
echo "🔗 Step 7: Adding remote origin..."
git remote add origin "https://github.com/$GITHUB_USERNAME/gymnastech.git"
echo ""

# Step 8: Instructions for GitHub repo creation
echo "📋 Step 8: Create GitHub Repository"
echo ""
echo "Please create a new repository on GitHub:"
echo ""
echo "1. Go to: https://github.com/new"
echo "2. Repository name: gymnastech"
echo "3. Description: GymnaTech - Professional Gymnastics Scoring Platform for Women's Artistic Gymnastics"
echo "4. Visibility: Public (or Private if you prefer)"
echo "5. DO NOT initialize with README, .gitignore, or license"
echo "6. Click 'Create repository'"
echo ""
read -p "Press Enter when you've created the GitHub repository..."

# Step 9: Push to GitHub
echo ""
echo "🚀 Step 9: Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    
    # Step 10: Create release tag
    echo "🏷️  Step 10: Creating release tag v1.0.0..."
    git tag -a v1.0.0 -m "GymnaTech v1.0.0 - Initial Release

Features:
- Multi-judge scoring system
- Real-time leaderboards
- FIG WAG 2025-2028 compliance
- Role-based access control
- Complete audit trail
- WebSocket real-time updates
- Comprehensive documentation"
    
    git push origin v1.0.0
    
    echo ""
    echo "🎉 Deployment Complete!"
    echo ""
    echo "📍 Your repository is available at:"
    echo "   https://github.com/$GITHUB_USERNAME/gymnastech"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Add repository topics/tags"
    echo "   2. Update repository description"
    echo "   3. Enable GitHub Issues and Discussions"
    echo "   4. Create a release on GitHub"
    echo "   5. Update badge URLs in README.md with your username"
    echo ""
    echo "🔧 To update badge URLs, run:"
    echo "   sed -i '' 's/YOUR_USERNAME/$GITHUB_USERNAME/g' README.md"
    echo ""
else
    echo ""
    echo "❌ Error: Failed to push to GitHub"
    echo "   Make sure you have the correct permissions and the repository exists"
    echo ""
    exit 1
fi

echo "✨ All done! Happy coding! 🚀"

