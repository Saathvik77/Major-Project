import base64
import os

src_dir = r"C:\Users\pehla\.gemini\antigravity\brain\58cc9d40-35c8-4ffa-978c-8bdcbed4cff6"
files = {
    "male_3d_avatar_1774251745202.png": "male",
    "female_3d_avatar_1774251763378.png": "female"
}

for src_name, label in files.items():
    path = os.path.join(src_dir, src_name)
    if os.path.exists(path):
        with open(path, "rb") as f:
            encoded = base64.b64encode(f.read()).decode("utf-8")
            print(f"---{label}---")
            print(encoded)
            print(f"---end---")
