import re

with open('src/app/home-client.tsx', 'r') as f:
    content = f.read()

# We need to swap two blocks:
# Block A:
#     {/* Legal Compliance Desk */}
#     <section id="compliance" ... </section>
#
# Block B:
#     {/* Supported Organizations */}
#     <section id="organizations" ... </section>

block_a_regex = re.compile(r'(\s*\{\/\*\s*Legal Compliance Desk\s*\*\/\}\s*\<section id="compliance".*?\<\/section\>)', re.DOTALL)
block_b_regex = re.compile(r'(\s*\{\/\*\s*Supported Organizations\s*\*\/\}\s*\<section id="organizations".*?\<\/section\>)', re.DOTALL)

block_a = block_a_regex.search(content).group(1)
block_b = block_b_regex.search(content).group(1)

# Remove both blocks from the content
temp_content = content.replace(block_a, '[[BLOCK_A]]').replace(block_b, '[[BLOCK_B]]')

# Now insert them in reverse order.
# They were originally A then B. We want B then A.
# Actually, wait. It currently has `[[BLOCK_A]]` followed by `[[BLOCK_B]]`.
# We just replace `[[BLOCK_A]]` with `block_b` and `[[BLOCK_B]]` with `block_a`.

new_content = temp_content.replace('[[BLOCK_A]]', block_b).replace('[[BLOCK_B]]', block_a)

with open('src/app/home-client.tsx', 'w') as f:
    f.write(new_content)

print("Swapped successfully.")
