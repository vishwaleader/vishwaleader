import json

file_path = 'src/app/gallery/gallery_data.json'
with open(file_path, 'r') as f:
    data = json.load(f)

# Filter out Magazine Covers
filtered_data = []
for item in data:
    # Check if any tag or category relates to Magazine Covers or if it is from magazine-covers folder
    if item.get('category') == 'Magazine Covers' or '/magazine-covers/' in item.get('src', ''):
        continue
    if '#MagazineCovers' in item.get('tags', []):
        continue
    filtered_data.append(item)

with open(file_path, 'w') as f:
    json.dump(filtered_data, f, indent=2)

print(f"Original length: {len(data)}")
print(f"Filtered length: {len(filtered_data)}")
