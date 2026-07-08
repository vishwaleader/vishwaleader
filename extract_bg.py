import json

log_path = "/home/cube/.gemini/antigravity-ide/brain/4acb7e0f-af72-43a6-862f-6d1416283f9e/.system_generated/logs/transcript_full.jsonl"

found_content = None
with open(log_path, 'r') as f:
    for line in f:
        data = json.loads(line)
        if data.get('type') == 'USER_INPUT':
            content = data.get('content', '')
            if 'THREE=THREE||{REVISION:"56"}' in content:
                found_content = content
                break

if found_content:
    # Parse the content
    # The format was:
    # html :
    # ...
    # css :
    # ...
    # js :
    # ...
    
    parts = found_content.split('css :')
    html_part = parts[0].replace('html :', '').strip()
    
    if 'js :' in parts[1]:
        css_part = parts[1].split('js :')[0].strip()
        js_part = parts[1].split('js :')[1].strip()
    else:
        css_part = parts[1].strip()
        js_part = ""
        
    full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>3D Background</title>
    <style>
{css_part}
    </style>
</head>
<body>
{html_part}
    <script>
{js_part}
    </script>
</body>
</html>
"""
    with open("public/three-bg.html", "w") as out:
        out.write(full_html)
    print("Successfully extracted to public/three-bg.html")
else:
    print("Could not find the snippet in the logs.")
