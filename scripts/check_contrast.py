import re
import sys
from pathlib import Path

css = Path("styles.css").read_text(encoding="utf-8")

def luminance(color):
    channels = [int(color[index:index + 2], 16) / 255 for index in (1, 3, 5)]
    linear = [value / 12.92 if value <= 0.04045 else ((value + 0.055) / 1.055) ** 2.4 for value in channels]
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]

def contrast(first, second):
    high, low = sorted((luminance(first), luminance(second)), reverse=True)
    return (high + 0.05) / (low + 0.05)

def variables_for(selector):
    match = re.search(re.escape(selector) + r"\s*\{([^}]*)\}", css)
    if not match:
        sys.exit(f"Could not find CSS theme block: {selector}")
    return dict(re.findall(r"--([\w-]+):(#[0-9a-fA-F]{6})", match.group(1)))

failures = []
for theme_name, selector in (("dark", ":root"), ("light", "body.light")):
    values = variables_for(selector)
    for foreground in ("text", "muted", "accent", "purple"):
        for background in ("bg", "panel", "panel2"):
            score = contrast(values[foreground], values[background])
            if score < 4.5:
                failures.append(f"{theme_name}: {foreground} on {background} is {score:.2f}:1 (needs 4.5:1)")
    button_score = contrast(values["accent-contrast"], values["accent"])
    if button_score < 4.5:
        failures.append(f"{theme_name}: text on accent button is {button_score:.2f}:1 (needs 4.5:1)")

if failures:
    sys.exit("\n".join(failures))
print("Text, muted text, accent links, tags, and accent buttons meet the 4.5:1 contrast target in both themes.")
