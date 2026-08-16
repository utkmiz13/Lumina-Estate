@echo off
REM ============================================
REM  LUMINA ESTATE - GitHub Pages Deploy (Windows)
REM ============================================
REM  Pehle ye 2 kaam karo (sirf ek baar):
REM   1. GitHub.com par "New Repository" banao -> naam: lumina-estate
REM      -> Public ->  Create repository  (README mat banwana)
REM   2. Git for Windows install karo: https://git-scm.com/download/win
REM
REM  Phir is file par DOUBLE-CLICK karo aur username daalo.

cd /d "%~dp0"
if exist lumina-estate cd lumina-estate

echo.
echo ============================================
echo  LUMINA ESTATE - GitHub Pages Deploy
echo ============================================
echo.

set /p GITUSER=Apna GitHub username daalo (e.g. utkarsh123): 

echo.
echo [1/4] Git repo initialize ho raha hai...
git init

echo [2/4] Files add ho rahi hain...
git add .

echo [3/4] Commit ho raha hai...
git commit -m "Lumina Estate - initial release (PRD v2.0 demo)"

echo [4/4] GitHub se connect karke push ho raha hai...
git branch -M main
git remote add origin https://github.com/%GITUSER%/lumina-estate.git
git push -u origin main

echo.
echo ============================================
echo  PUSH HO GAYA! Ab aakhri step:
echo   1. GitHub.com -> apna repo "lumina-estate" kholo
echo   2. Settings -> Pages (left menu)
echo   3. "Branch" mein: main  |  folder: /(root)  -> Save
echo   4. 1-2 minute mein app live:
echo      https://%GITUSER%.github.io/lumina-estate/
echo ============================================
echo.
pause
