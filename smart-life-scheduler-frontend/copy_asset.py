import shutil
import os

source = r"C:\Users\pehla\.gemini\antigravity\brain\be65af77-5f83-4a80-9ec3-38d6a33c961b\user_dashboard_blurred_1773907792776.png"
destination = r"c:\Users\pehla\OneDrive\Desktop\smart life scheduler\smart-life-scheduler-frontend\public\user_dashboard_blurred.png"

try:
    shutil.copy2(source, destination)
    print(f"Successfully copied {source} to {destination}")
except Exception as e:
    print(f"Error: {e}")
    exit(1)
