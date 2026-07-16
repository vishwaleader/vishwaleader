import os
import json
import random

gallery_dir = "public/gallery"
gallery_data = []

for root, dirs, files in os.walk(gallery_dir):
    for file in files:
        if file.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
            rel_path = os.path.relpath(os.path.join(root, file), "public")
            src = f"/{rel_path}"
            
            # Use parent dir as category if not the base gallery dir
            category = os.path.basename(root)
            if category == "gallery":
                category = "General"
                
            title = file.rsplit('.', 1)[0].replace('_', ' ').replace('-', ' ').title()
            
            gallery_data.append({
                "src": src,
                "title": title,
                "desc": f"{title} - Vishwa Leader historical archive.",
                "category": category,
                "tags": [f"#{category.replace(' ', '')}"],
                "isPopular": random.choice([True, False, False, False]),
                "isFeatured": random.choice([True, False, False]),
                "date": "2026-07-01"
            })

with open("src/app/gallery/gallery_data.json", "w") as f:
    json.dump(gallery_data, f, indent=2)

print(f"Generated {len(gallery_data)} items.")
