import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# Fix the specific styles
content = content.replace('style="', 'style={{').replace('">VISHWA LEADER', '}}>VISHWA LEADER')
content = content.replace('style={{margin-top: 18px; font-family: \'Outfit\', sans-serif; font-weight: 900; font-size: 15px; letter-spacing: 0.04em; color: #0056CA;', 'style={{marginTop: 18, fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: 15, letterSpacing: "0.04em", color: "#0056CA"}}')
content = content.replace('style="font-family: \'Inter\', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 0.18em; color: #0056CA; opacity: 0.55; text-transform: uppercase; margin-top: 2px;"', 'style={{fontFamily: "Inter, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", color: "#0056CA", opacity: 0.55, textTransform: "uppercase", marginTop: 2}}')
content = content.replace('''style={{
        position: fixed; inset: 0; z-index: 9999;
        background: #ffffff;
        display: flex; align-items: center; justify-content: center; flex-direction: column;
        transition: opacity 0.55s cubic-bezier(0.4,0,0.2,1);
    "''', '''style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#ffffff',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
        transition: 'opacity 0.55s cubic-bezier(0.4,0,0.2,1)'
    }}''')

# SVG attributes
content = content.replace('stroke-width', 'strokeWidth')
content = content.replace('stroke-linecap', 'strokeLinecap')
content = content.replace('stroke-linejoin', 'strokeLinejoin')
content = content.replace('fill-rule', 'fillRule')
content = content.replace('clip-rule', 'clipRule')
content = content.replace('stroke-miterlimit', 'strokeMiterlimit')
content = content.replace('stroke-dasharray', 'strokeDasharray')
content = content.replace('stroke-dashoffset', 'strokeDashoffset')
content = content.replace('fill-opacity', 'fillOpacity')
content = content.replace('stop-color', 'stopColor')

# Fix a href="#"
# content = content.replace('href="#"', 'href="/"')

# Fix <br> without self closing, already fixed by earlier regex mostly, but just in case
content = content.replace('<br>', '<br/>')
content = content.replace('<hr>', '<hr/>')

with open('src/app/page.tsx', 'w') as f:
    f.write(content)
