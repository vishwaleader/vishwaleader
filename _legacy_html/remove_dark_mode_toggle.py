import re
import glob

html_files = glob.glob('*.html')

for file in html_files:
    with open(file, 'r') as f:
        content = f.read()

    # Remove the FOUC script
    content = re.sub(r'\s*<!-- Dark Mode Init \(Prevents FOUC\) -->[\s\S]*?</script>', '', content)

    # Remove the toggle button and its script
    content = re.sub(r'\s*<!-- Global Dark Mode Toggle -->[\s\S]*?</script>', '', content)

    # Revert darkMode: 'class' if needed, but it's harmless
    content = re.sub(r"darkMode:\s*'class',\n\s*", "", content)

    # Also strip out the forced html.dark css rule added to index.html
    content = content.replace('        html.dark { background-color: #0f172a; }', '')

    with open(file, 'w') as f:
        f.write(content)

print("Dark mode toggle removed successfully.")
