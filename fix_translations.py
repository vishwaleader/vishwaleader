import glob

files = glob.glob('src/**/*.tsx', recursive=True)
for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()
        
    old_content = content
    
    # The logo span
    content = content.replace(
        '<span className="font-sans font-bold tracking-tight text-sm text-slate-900">Vishwa Leader</span>',
        '<span translate="no" className="notranslate font-sans font-bold tracking-tight text-sm text-slate-900">Vishwa Leader</span>'
    )
    
    # The gallery logo span
    content = content.replace(
        '<span className="text-white font-bold tracking-tight text-md uppercase font-display">VISHWA LEADER</span>',
        '<span translate="no" className="notranslate text-white font-bold tracking-tight text-md uppercase font-display">VISHWA LEADER</span>'
    )
    
    # The footer copyright
    content = content.replace(
        '© 2026 Vishwa Leader Techmedia Private Limited',
        '© 2026 <span translate="no" className="notranslate">Vishwa Leader</span> Techmedia Private Limited'
    )
    
    # The address text (various casings)
    content = content.replace(
        'M/s. VISHWA LEADER TECHMEDIA PVT LTD',
        'M/s. <span translate="no" className="notranslate">VISHWA LEADER</span> TECHMEDIA PVT LTD'
    )
    content = content.replace(
        'M/s. VISHWA LEADER TECHMEDIA PRIVATE LIMITED',
        'M/s. <span translate="no" className="notranslate">VISHWA LEADER</span> TECHMEDIA PRIVATE LIMITED'
    )
    
    # Text mentions in descriptions
    content = content.replace(
        'Vishwa Leader Dr. B. R. Ambedkar',
        '<span translate="no" className="notranslate">Vishwa Leader</span> Dr. B. R. Ambedkar'
    )
    
    if old_content != content:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Fixed {filepath}")
