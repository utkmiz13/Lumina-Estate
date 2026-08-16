#!/bin/bash
# ============================================
#  LUMINA ESTATE - GitHub Pages Deploy (Mac/Linux)
# ============================================
#  Pehle:
#   1. GitHub.com par "New Repository" banao -> naam: lumina-estate
#      -> Public -> Create repository (README mat banwana)
#   2. git install: https://git-scm.com
#
#  Phir terminal mein chalayen:
#   chmod +x deploy-to-github.sh
#   ./deploy-to-github.sh

if [ -d "$(dirname "$0")/lumina-estate" ]; then
    cd "$(dirname "$0")/lumina-estate"
else
    cd "$(dirname "$0")"
fi

echo ""
echo "============================================"
echo " LUMINA ESTATE - GitHub Pages Deploy"
echo "============================================"
echo ""
read -p "Apna GitHub username daalo (e.g. utkarsh123): " GITUSER

echo ""
echo "[1/4] Git repo initialize..."
git init

echo "[2/4] Files add..."
git add .

echo "[3/4] Commit..."
git commit -m "Lumina Estate - initial release (PRD v2.0 demo)"

echo "[4/4] Push to GitHub..."
git branch -M main
git remote add origin https://github.com/$GITUSER/lumina-estate.git
git push -u origin main

echo ""
echo "============================================"
echo " PUSH HO GAYA! Ab aakhri step:"
echo "  1. GitHub.com -> apna repo 'lumina-estate' kholo"
echo "  2. Settings -> Pages (left menu)"
echo "  3. Branch: main | folder: /(root) -> Save"
echo "  4. 1-2 minute mein live:"
echo "     https://$GITUSER.github.io/lumina-estate/"
echo "============================================"
