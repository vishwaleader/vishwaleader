import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# Fix the double closing brackets
content = content.replace('}}}}>VISHWA', '}}>VISHWA')

# Fix any unclosed img tags that might have slipped through
content = re.sub(r'(<img[^>]+)(?<!/)>', r'\1 />', content)

with open('src/app/page.tsx', 'w') as f:
    f.write(content)
