import re
import glob

html_files = glob.glob('*.html')

fouc_script = """
    <!-- Dark Mode Init (Prevents FOUC) -->
    <script>
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    </script>
"""

toggle_html = """
    <!-- Global Dark Mode Toggle -->
    <button id="theme-toggle" type="button" class="fixed bottom-5 right-5 z-50 p-3 rounded-full bg-white dark:bg-slate-800 text-slate-800 dark:text-amber-400 shadow-xl border border-slate-200 dark:border-slate-700 transition-all hover:scale-110">
        <i id="theme-toggle-dark-icon" class="fa-solid fa-moon hidden"></i>
        <i id="theme-toggle-light-icon" class="fa-solid fa-sun hidden"></i>
    </button>
    <script>
        const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
        const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');
        const themeToggleBtn = document.getElementById('theme-toggle');

        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            themeToggleLightIcon.classList.remove('hidden');
        } else {
            themeToggleDarkIcon.classList.remove('hidden');
        }

        themeToggleBtn.addEventListener('click', function() {
            themeToggleDarkIcon.classList.toggle('hidden');
            themeToggleLightIcon.classList.toggle('hidden');

            if (localStorage.theme === 'light') {
                document.documentElement.classList.add('dark');
                localStorage.theme = 'dark';
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.theme = 'light';
            }
        });
    </script>
"""

class_mappings = {
    r'\bbg-white(?! dark:)': 'bg-white dark:bg-slate-900',
    r'\bbg-slate-50(?! dark:)': 'bg-slate-50 dark:bg-slate-950',
    r'\bbg-slate-100(?! dark:)': 'bg-slate-100 dark:bg-slate-800',
    r'\btext-slate-900(?! dark:)': 'text-slate-900 dark:text-white',
    r'\btext-slate-800(?! dark:)': 'text-slate-800 dark:text-slate-100',
    r'\btext-slate-700(?! dark:)': 'text-slate-700 dark:text-slate-200',
    r'\btext-slate-600(?! dark:)': 'text-slate-600 dark:text-slate-300',
    r'\btext-slate-500(?! dark:)': 'text-slate-500 dark:text-slate-400',
    r'\bborder-slate-200(?! dark:)': 'border-slate-200 dark:border-slate-700',
    r'\bborder-slate-300(?! dark:)': 'border-slate-300 dark:border-slate-700',
    r'\bbg-brandDark(?! dark:)': 'bg-brandDark dark:bg-slate-950',
    r'\btext-brandDark(?! dark:)': 'text-brandDark dark:text-white',
}

for file in html_files:
    with open(file, 'r') as f:
        content = f.read()

    # 1. Enable Tailwind darkMode class
    if "darkMode: 'class'" not in content:
        content = re.sub(r'tailwind\.config = \{', "tailwind.config = {\n            darkMode: 'class',", content)

    # 2. Add FOUC script
    if 'localStorage.theme' not in content:
        content = content.replace('</head>', fouc_script + '\n</head>')

    # 3. Add toggle HTML
    if 'theme-toggle' not in content:
        content = content.replace('</body>', toggle_html + '\n</body>')

    # 4. Global CSS body dark background fix (specifically for index.html which has inline style)
    content = re.sub(r'body\s*{\s*font-family[^;]*;\s*background-color:\s*#F8FAFC;\s*}', 
                     'body {\n            font-family: \'Inter\', sans-serif;\n        }\n        html { background-color: #F8FAFC; }\n        html.dark { background-color: #0f172a; }', content)

    # 5. Inject dark classes
    for pattern, repl in class_mappings.items():
        content = re.sub(pattern, repl, content)

    # 6. Make sure <body> has appropriate dark bg and text if it doesn't use utility classes
    if '<body class="' in content and 'dark:bg-slate-900' not in content:
        content = re.sub(r'<body class="([^"]*)"', r'<body class="\1 dark:bg-slate-900 dark:text-slate-100"', content)

    with open(file, 'w') as f:
        f.write(content)

print("Dark mode implementation complete.")
