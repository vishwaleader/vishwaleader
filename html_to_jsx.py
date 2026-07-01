import re
import sys

def convert(html):
    # Basic JSX conversions
    html = html.replace('class=', 'className=')
    html = html.replace('for=', 'htmlFor=')
    html = html.replace('<!--', '{/*')
    html = html.replace('-->', '*/}')
    
    # Self close common tags
    html = re.sub(r'<(img|input|br|hr|source|link|meta)([^>]*?)(?<!/)>', r'<\1\2 />', html)
    
    # Handle style tags (very rough, better to remove them or move to globals.css)
    # For now, let's just strip script and style tags to avoid massive JSX errors
    html = re.sub(r'<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>', '', html, flags=re.IGNORECASE)
    html = re.sub(r'<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>', '', html, flags=re.IGNORECASE)
    
    # Extract body content (since Next.js handles head and html/body tags)
    body_match = re.search(r'<body[^>]*>(.*?)</body>', html, flags=re.IGNORECASE | re.DOTALL)
    if body_match:
        html = body_match.group(1)
        
    return f"""export default function Page() {{
  return (
    <>
      {html}
    </>
  )
}}
"""

with open(sys.argv[1], 'r') as f:
    content = f.read()
    
with open(sys.argv[2], 'w') as f:
    f.write(convert(content))
