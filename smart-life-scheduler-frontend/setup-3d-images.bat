@echo off
set PROJECT_DIR=c:\Users\pehla\OneDrive\Desktop\smart life scheduler\smart-life-scheduler-frontend
set BRAIN_DIR=C:\Users\pehla\.gemini\antigravity\brain\d27c5697-ffdc-46ae-baff-363c69783ae7

echo Creating assets directory...
if not exist "%PROJECT_DIR%\public\assets\3d" mkdir "%PROJECT_DIR%\public\assets\3d"

echo Copying 3D images...
copy /Y "%BRAIN_DIR%\3d_productivity_cube_subtle_1773253300095.png" "%PROJECT_DIR%\public\assets\3d\productivity_cube.png"
copy /Y "%BRAIN_DIR%\3d_ai_assistant_orb_subtle_1773253332681.png" "%PROJECT_DIR%\public\assets\3d\ai_assistant_orb.png"
copy /Y "%BRAIN_DIR%\3d_analytics_chart_subtle_1773253316736.png" "%PROJECT_DIR%\public\assets\3d\analytics_chart.png"
copy /Y "%BRAIN_DIR%\3d_reports_doc_1773255336707.png" "%PROJECT_DIR%\public\assets\3d\reports_doc.png"
copy /Y "%BRAIN_DIR%\3d_health_heart_1773255358453.png" "%PROJECT_DIR%\public\assets\3d\health_heart.png"

echo Done! Now push your changes to GitHub to fix the Vercel deployment.
pause
