import re

with open('admin.html', 'r') as f:
    content = f.read()

replacements = {
    r'\bbg-brandDark\b': 'bg-slate-50',
    r'\bbg-slate-900/60\b': 'bg-white',
    r'\bbg-slate-900\b': 'bg-white',
    r'\bborder-slate-800/80\b': 'border-slate-200',
    r'\bborder-slate-800/60\b': 'border-slate-200',
    r'\bborder-slate-800\b': 'border-slate-200',
    r'\bbg-slate-950/40\b': 'bg-slate-50',
    r'\bbg-slate-950\b': 'bg-slate-50',
    r'\bbg-slate-800\b': 'bg-slate-100',
    r'\bborder-slate-700\b': 'border-slate-300',
    r'\bbg-slate-700\b': 'bg-slate-200',
    r'\btext-slate-100\b': 'text-slate-800',
    r'\btext-white\b': 'text-slate-900',
    r'\btext-slate-200\b': 'text-slate-700',
    r'\btext-slate-300\b': 'text-slate-600',
    r'\btext-slate-350\b': 'text-slate-600',
    r'\btext-slate-400\b': 'text-slate-500',
    r'\btext-slate-450\b': 'text-slate-500',
    r'\btext-slate-500\b': 'text-slate-400',
    # Adjust some specific colors for visibility
    r'\btext-brandBlue\b': 'text-brandBlue',
    r'\btext-amber-500\b': 'text-amber-600',
}

for pattern, repl in replacements.items():
    content = re.sub(pattern, repl, content)

with open('admin.html', 'w') as f:
    f.write(content)

print("Replacement complete.")
