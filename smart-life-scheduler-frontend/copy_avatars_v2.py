import shutil
import os

src_dir = r"C:\Users\pehla\.gemini\antigravity\brain\58cc9d40-35c8-4ffa-978c-8bdcbed4cff6"
dest_dir = r"c:\Users\pehla\OneDrive\Desktop\smart life scheduler\smart-life-scheduler-frontend\public\assets"

files = {
    "male_3d_avatar_1774251745202.png": "male_avatar.png",
    "female_3d_avatar_1774251763378.png": "female_avatar.png"
}

if not os.path.exists(dest_dir):
    os.makedirs(dest_dir)

for src_name, dest_name in files.items():
    src_path = os.path.join(src_dir, src_name)
    dest_path = os.path.join(dest_dir, dest_name)
    if os.path.exists(src_path):
        print(f"Copying {src_path} to {dest_path}")
        shutil.copy2(src_path, dest_path)
    else:
        print(f"Source NOT found: {src_path}")
