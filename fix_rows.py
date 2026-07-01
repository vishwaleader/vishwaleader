import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# Fix rows="X" to rows={X} for textareas
content = re.sub(r'rows="(\d+)"', r'rows={\1}', content)

# Also fix tabindex="X" to tabIndex={X} just in case
content = re.sub(r'tabindex="(-?\d+)"', r'tabIndex={\1}', content)

with open('src/app/page.tsx', 'w') as f:
    f.write(content)
