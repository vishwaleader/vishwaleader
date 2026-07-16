import re

with open("src/app/home-client.tsx", "r") as f:
    content = f.read()

# Find Patron Recognition Section
patron_regex = re.compile(r'(    \{/\* Patron Recognition Section \*/\}.*?    </section>\n)', re.DOTALL)
patron_match = patron_regex.search(content)
if not patron_match:
    print("Patron section not found")
    exit(1)
patron_section = patron_match.group(1)

# Find Contact Section
contact_regex = re.compile(r'(    \{/\* Contact Section \*/\}.*?    </section>\n)', re.DOTALL)
contact_match = contact_regex.search(content)
if not contact_match:
    print("Contact section not found")
    exit(1)
contact_section = contact_match.group(1)

# Add Google Map to Contact Section
map_iframe = """
                    <div className="mt-8 rounded-xl overflow-hidden border border-slate-200 shadow-sm h-64 bg-slate-100">
                        <iframe 
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3770.7925828828557!2d72.91263431536648!3d19.072834387089454!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c61f2215c2cf%3A0xb363c4c81b95b87!2sPatanwala%20Industrial%20Estate!5e0!3m2!1sen!2sin!4v1684824345244!5m2!1sen!2sin" 
                            width="100%" 
                            height="100%" 
                            style={{ border: 0 }} 
                            allowFullScreen={false} 
                            loading="lazy" 
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </div>
"""

# Insert map inside Contact Section (Info Column)
contact_section = contact_section.replace('                        </div>\n                    </div>\n                </div>', '                        </div>\n                    </div>\n' + map_iframe + '                </div>')

# Replace the original content
# Remove both from original text first
content = content.replace(patron_section, "")
content = content.replace(contact_section, "")

# Find where to insert them. Patron was first, Contact was second. 
# It was right after:
#     </section>
# (end of previous section which is likely `partners`)
# Then Patron, then Contact, then Footer
# So we can just find Footer and insert Contact then Patron before it.

footer_idx = content.find("    {/* Footer */}")
if footer_idx == -1:
    print("Footer not found")
    exit(1)

new_content = content[:footer_idx] + contact_section + "\n" + patron_section + "\n" + content[footer_idx:]

with open("src/app/home-client.tsx", "w") as f:
    f.write(new_content)

print("Done")
