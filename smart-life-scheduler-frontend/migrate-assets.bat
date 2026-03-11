@echo off
set "SRC=C:\Users\pehla\.gemini\antigravity\brain\d27c5697-ffdc-46ae-baff-363c69783ae7"
set "DEST=c:\Users\pehla\OneDrive\Desktop\smart life scheduler\smart-life-scheduler-frontend\public\assets\3d"

if not exist "%DEST%" mkdir "%DEST%"

copy /Y "%SRC%\3d_productivity_cube_subtle_1773253300095.png" "%DEST%\productivity_cube.png"
copy /Y "%SRC%\3d_ai_assistant_orb_subtle_1773253332681.png" "%DEST%\ai_assistant_orb.png"
copy /Y "%SRC%\3d_analytics_chart_subtle_1773253316736.png" "%DEST%\analytics_chart.png"
copy /Y "%SRC%\3d_reports_doc_1773255336707.png" "%DEST%\reports_doc.png"
copy /Y "%SRC%\3d_health_heart_1773255358453.png" "%DEST%\health_heart.png"

echo Done copying assets.
