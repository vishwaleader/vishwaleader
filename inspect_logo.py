from PIL import Image
import numpy as np

img = Image.open('public/assets/images/DACCI_bak.png').convert("RGBA")
data = np.array(img)
h, w, c = data.shape
print(f"Shape: {w}x{h}")

# The text is usually at the bottom.
# Let's say bottom 40% is text.
text_start = int(h * 0.6)
