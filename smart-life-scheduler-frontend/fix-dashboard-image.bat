@echo off
set PROJECT_DIR=c:\Users\pehla\OneDrive\Desktop\smart life scheduler\smart-life-scheduler-frontend
set BRAIN_DIR=C:\Users\pehla\.gemini\antigravity\brain\fbc32a63-5171-4ebd-8ab7-0b1c34942e21

echo Creating assets directory if missing...
if not exist "%PROJECT_DIR%\public\assets\3d" mkdir "%PROJECT_DIR%\public\assets\3d"

echo Copying Dashboard Illustration...
copy /Y "%BRAIN_DIR%\glassmorphism_illustration_1773285388495.png" "%PROJECT_DIR%\public\assets\3d\glass_illustration.png"
echo Done!
