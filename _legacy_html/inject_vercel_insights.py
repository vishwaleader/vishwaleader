import glob

html_files = glob.glob('*.html')

vercel_scripts = """
    <!-- Vercel Web Analytics -->
    <script>
        window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
    </script>
    <script defer src="/_vercel/insights/script.js"></script>

    <!-- Vercel Speed Insights -->
    <script>
        window.si = window.si || function () { (window.siq = window.siq || []).push(arguments); };
    </script>
    <script defer src="/_vercel/speed-insights/script.js"></script>
"""

for file in html_files:
    with open(file, 'r') as f:
        content = f.read()

    if '_vercel/insights' not in content:
        content = content.replace('</head>', vercel_scripts + '\n</head>')
        
        with open(file, 'w') as f:
            f.write(content)

print("Vercel scripts injected successfully.")
