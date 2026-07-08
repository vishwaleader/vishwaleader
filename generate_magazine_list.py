import os
import json

path = '/home/cube/Desktop/syncstack/Vishwa Leader/public/magazine-covers'
files = sorted(os.listdir(path))

out = "const magazineCoversList = [\n"
for f in files:
    if f.endswith(('.jpg', '.png', '.jpeg')):
        title = f.replace('.jpg', '').replace('.png', '').replace('.jpeg', '')
        title = title.replace('-', ' ').replace('_', ' ').strip()
        out += f"  {{ src: '{f}', title: '{title}', date: '{title}' }},\n"
out += "];"

print(out)
