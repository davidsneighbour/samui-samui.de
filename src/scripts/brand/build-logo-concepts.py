# /// script
# dependencies = ["fonttools==4.66.1"]
# ///
"""Render draft logo comparisons using the repository's actual Panton Heavy font.

Run: uv run src/scripts/brand/build-logo-concepts.py
"""
from pathlib import Path
import re
import json
import subprocess
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.svgLib.path import parse_path

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / 'src/assets/brand/samui/concepts'
OUT.mkdir(parents=True, exist_ok=True)
font = TTFont(ROOT / 'public/assets/webfonts/900/heavy/panton-heavy-webfont.ttf')
glyphs = font.getGlyphSet()
cmap = font.getBestCmap()
scale = 192 / font['head'].unitsPerEm
kern = {}
if 'kern' in font:
    for table in font['kern'].kernTables:
        kern.update(table.kernTable)


def lettering(text):
    pen = SVGPathPen(glyphs)
    x = 0
    previous = None
    for char in text:
        name = cmap[ord(char)]
        x += kern.get((previous, name), 0)
        glyphs[name].draw(TransformPen(pen, (scale, 0, 0, -scale, x * scale, 0)))
        x += font['hmtx'][name][0]
        previous = name
    return pen.getCommands(), x * scale


master = (ROOT / 'src/assets/brand/samui/selected/symbol-reversed.svg').read_text()
path = re.search(r' d="([^"]+)"', master).group(1)
island, holes = path.split('Z ', 1)
island += 'Z'
# The selected master already includes A's shift. Recover the comparison baseline.
original_holes = SVGPathPen(None)
parse_path(holes, TransformPen(original_holes, (1, 0, 0, 1, 8, 0)))
holes = original_holes.getCommands()
wordmark, word_width = lettering('SAMUI? SAMUI!')
# Compact reusable outlines retain the exact Panton letterforms.
from fontTools.pens.boundsPen import BoundsPen
bounds = BoundsPen(glyphs)
glyphs[cmap[ord('S')]].draw(bounds)
cap_height = bounds.bounds[3] * scale
normalise = 48 / cap_height
kit_words = {}
for text in ['SAMUI?', 'SAMUI!', 'SAMUI? SAMUI!']:
    outlined, width = lettering(text)
    kit_words[text.lower()] = transformed_word = SVGPathPen(None)
    parse_path(outlined, TransformPen(transformed_word, (normalise, 0, 0, normalise, 0, 48)))
    kit_words[text.lower()] = transformed_word.getCommands()
(ROOT / 'src/assets/brand/samui/panton-wordmark.json').write_text(json.dumps(kit_words, indent=2) + '\n')


def transformed(path, matrix):
    pen = SVGPathPen(None)
    parse_path(path, TransformPen(pen, matrix))
    return pen.getCommands()


def svg(body, width, height, title):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}"><title>{title}</title>{body}</svg>\n'


# A retains punctuation proportions; B tightens its horizontal rhythm;
# C reduces punctuation size. All move the punctuation's optical centre left.
options = [('a', 'A — Left balance', (1, 0, 0, 1, -8, 0)),
           ('b', 'B — Tighter pair', (.92, 0, 0, 1, 2, 0)),
           ('c', 'C — More breathing room', (.9, 0, 0, .9, 5, 12.4))]
board = '<rect width="1600" height="1260" fill="#f5f1e6"/>'
board += '<text x="48" y="52" font-family="sans-serif" font-size="26" fill="#290e1c">Samui? Samui! — Panton 900 · draft logo studies</text>'
for index, (key, title, matrix) in enumerate(options):
    symbol = island + ' ' + transformed(holes, matrix)
    art = f'<path fill="#ec7263" fill-rule="evenodd" d="{symbol}"/>'
    lockup = art + f'<path fill="#f5f1e6" transform="translate(288 164) scale(.72)" d="{wordmark}"/>'
    width = round(288 + word_width * .72 + 32)
    (OUT / f'{key}-symbol.svg').write_text(svg(art, 256, 256, title))
    (OUT / f'{key}-horizontal.svg').write_text(svg(lockup, width, 256, title))
    y = 90 + index * 380
    board += f'<text x="48" y="{y}" font-family="sans-serif" font-size="22" fill="#290e1c">{title}</text>'
    board += f'<rect x="48" y="{y+20}" width="1504" height="240" rx="12" fill="#290e1c"/>'
    board += f'<g transform="translate(68 {y+28}) scale({min(1, 1450/width)})">{lockup}</g>'
    for j, size in enumerate([64, 32, 16]):
        x = 48 + j * 112
        board += f'<g transform="translate({x} {y+276}) scale({size/256})"><path fill="#290e1c" fill-rule="evenodd" d="{symbol if size > 32 else island}"/></g>'
        board += f'<text x="{x+72}" y="{y+300}" font-family="sans-serif" font-size="14" fill="#290e1c">{size}px</text>'
    board += f'<g transform="translate(440 {y+275}) scale(.25)"><path fill="#290e1c" d="{island}"/></g>'
    board += f'<text x="520" y="{y+310}" font-family="sans-serif" font-size="16" fill="#290e1c">Island-only small-size alternative</text>'
(OUT / 'comparison.svg').write_text(svg(board, 1600, 1260, 'Draft logo comparison'))
subprocess.run(['rsvg-convert', '-w', '1600', '-o', str(OUT / 'comparison.png'), str(OUT / 'comparison.svg')], check=True)
print(f'Built three draft concepts in {OUT}')
