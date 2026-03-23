@echo off
set PROJECT_DIR=c:\Users\pehla\OneDrive\Desktop\smart life scheduler\smart-life-scheduler-frontend
set BRAIN_DIR=C:\Users\pehla\.gemini\antigravity\brain\58cc9d40-35c8-4ffa-978c-8bdcbed4cff6

echo Creating assets directory...
if not exist "%PROJECT_DIR%\public\assets" mkdir "%PROJECT_DIR%\public\assets"

echo Copying Avatar images...
copy /Y "%BRAIN_DIR%\male_3d_avatar_1774251745202.png" "%PROJECT_DIR%\public\assets\male_avatar.png"
copy /Y "%BRAIN_DIR%\female_3d_avatar_1774251763378.png" "%PROJECT_DIR%\public\assets\female_avatar.png"

echo Done! Now push your changes to GitHub to fix the Vercel deployment.
pause
