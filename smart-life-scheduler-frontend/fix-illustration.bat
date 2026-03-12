@echo off
echo Fixing Dashboard Illustration...
set SOURCE=C:\Users\pehla\.gemini\antigravity\brain\fbc32a63-5171-4ebd-8ab7-0b1c34942e21\glassmorphism_illustration_1773285388495.png
set DEST=%~dp0public\assets\3d\glass_illustration.png

if exist "%SOURCE%" (
    copy /Y "%SOURCE%" "%DEST%"
    echo Success! Image copied to public\assets\3d\glass_illustration.png
) else (
    echo Error: Source image not found at %SOURCE%
)
pause
