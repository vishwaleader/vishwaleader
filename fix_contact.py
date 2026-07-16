import re

with open("src/app/home-client.tsx", "r") as f:
    content = f.read()

# 1. Remove the first duplicate of the Contact Section
contact_pattern = re.compile(r'(    \{/\* Contact Section \*/\}.*?    </section>\n)', re.DOTALL)
matches = list(contact_pattern.finditer(content))
if len(matches) > 1:
    # Remove the first one
    first_match = matches[0]
    content = content[:first_match.start()] + content[first_match.end():]
    print("Removed duplicate Contact Section.")
else:
    print("Only one Contact Section found.")

# 2. Update Google Maps to Satellite
old_map = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3770.7925828828557!2d72.91263431536648!3d19.072834387089454!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c61f2215c2cf%3A0xb363c4c81b95b87!2sPatanwala%20Industrial%20Estate!5e0!3m2!1sen!2sin!4v1684824345244!5m2!1sen!2sin'
new_map = 'https://maps.google.com/maps?q=Patanwala%20Industrial%20Estate,%20Mumbai&t=k&z=17&ie=UTF8&iwloc=&output=embed'
if old_map in content:
    content = content.replace(old_map, new_map)
    print("Updated map to satellite view.")

# 3. Remove Inquiry Category
category_block = """                                <div className="space-y-1">
                                    <label className="font-bold uppercase tracking-wider text-slate-500">Inquiry Category</label>
                                    <select name="category" className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-3 text-slate-800 focus:outline-none focus:border-brandBlue focus:ring-1 focus:ring-brandBlue text-xs">
                                        <option>SOAS Conference 2026 - Article Submission</option>
                                        <option>Dr. Ambedkar Awards - Attendee Registration</option>
                                        <option>Vishwa Leader Magazine - Subscriptions & Print Ads</option>
                                        <option>General Information Inquiry</option>
                                    </select>
                                </div>"""

if category_block in content:
    content = content.replace(category_block, "")
    print("Removed Inquiry Category.")
else:
    # Try regex fallback if whitespace mismatch
    cat_re = re.compile(r'                                <div className="space-y-1">\s*<label className="font-bold uppercase tracking-wider text-slate-500">Inquiry Category</label>\s*<select name="category".*?</select>\s*</div>\n', re.DOTALL)
    content, num = cat_re.subn("", content)
    if num > 0:
        print("Removed Inquiry Category (regex).")
    else:
        print("Could not find Inquiry Category.")

with open("src/app/home-client.tsx", "w") as f:
    f.write(content)

