import os
import re

files_to_check = []
for root, _, files in os.walk('.'):
    if 'node_modules' in root or '.git' in root or '.next' in root:
        continue
    for f in files:
        if f.endswith(('.html', '.sh', '.js', '.ts', '.tsx', '.json', '.env', '.md')):
            files_to_check.append(os.path.join(root, f))

pattern = re.compile(r'AIzaSy[0-9a-zA-Z-_]{33}')

for filepath in files_to_check:
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    if pattern.search(content):
        # replace with placeholder
        new_content = pattern.sub('REMOVED_SECURE_API_KEY', content)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Removed keys from {filepath}")
