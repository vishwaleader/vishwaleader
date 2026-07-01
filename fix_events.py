import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# Fix onerror string
# We need to map `this.src='...'` to `e.currentTarget.src='...'`
content = re.sub(r'onerror="([^"]+)"', r'onError={(e) => { \1 }}', content)
content = content.replace('this.src', 'e.currentTarget.src')

# Fix onclick string
content = re.sub(r'onclick="([^"]+)"', r'onClick={() => { \1 }}', content)

# Fix onsubmit string
content = re.sub(r'onsubmit="([^"]+)"', r'onSubmit={(e) => { \1 }}', content)

# Fix onchange string
content = re.sub(r'onchange="([^"]+)"', r'onChange={(e) => { \1 }}', content)

with open('src/app/page.tsx', 'w') as f:
    f.write(content)
