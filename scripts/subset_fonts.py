"""Keep the Latin and punctuation glyphs used by the portfolio."""
from pathlib import Path
from fontTools import subset

ROOT = Path(__file__).resolve().parent.parent
FONTS = (
    ("inter", "inter-latin-wght-normal.woff2", "inter-latin.woff2"),
    ("plus-jakarta-sans", "plus-jakarta-sans-latin-wght-normal.woff2", "jakarta-latin.woff2"),
)

for family, filename, target in FONTS:
    options = subset.Options()
    options.flavor = "woff2"
    options.hinting = False
    font = subset.load_font(
        str(ROOT / "node_modules" / "@fontsource-variable" / family / "files" / filename),
        options,
    )
    subsetter = subset.Subsetter(options=options)
    subsetter.populate(unicodes=list(range(0x20, 0x100)) + list(range(0x2000, 0x2070)) + [0x2191, 0x2193, 0x2197, 0x2192])
    subsetter.subset(font)
    subset.save_font(font, str(ROOT / "docs" / "assets" / "fonts" / target), options)
