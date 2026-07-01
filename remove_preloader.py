import os
import re
import glob

# Find all page.tsx files in src/app and its subdirectories
for root, dirs, files in os.walk('src/app'):
    for file in files:
        if file == 'page.tsx':
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()

            # The preloader block starts at the comment and ends at the closing div after Techmedia
            # Use a regex that looks for the start comment and the specific end of the preloader
            pattern = re.compile(r'\{\/\* ═══════════════════════════════════════ PRELOADER ═══════════════════════════════════════ \*\/\}.*?<p[^>]*>Techmedia<\/p>\s*<\/div>', re.DOTALL)
            
            new_content = pattern.sub('', content)
            
            if new_content != content:
                with open(filepath, 'w') as f:
                    f.write(new_content)
                print(f"Removed preloader from {filepath}")
