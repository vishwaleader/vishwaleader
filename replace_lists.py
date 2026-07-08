import re

with open('new_list.txt', 'r') as f:
    new_list_content = f.read().strip()

files_to_update = [
    'src/app/home-client.tsx',
    'src/app/archives/page.tsx'
]

for file_path in files_to_update:
    with open(file_path, 'r') as f:
        content = f.read()
    
    # regex to match const magazineCoversList = [ ... ];
    pattern = re.compile(r'const magazineCoversList = \[\s*\{ src:.*?\n\];', re.DOTALL)
    
    new_content = pattern.sub(new_list_content, content)
    
    with open(file_path, 'w') as f:
        f.write(new_content)
        
print("Updated successfully")
