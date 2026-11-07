"""Build Signal Atlas from versioned content. The runtime and build work offline."""
import argparse
import hashlib
import json
from pathlib import Path
import shutil
import sys

ROOT = Path(__file__).resolve().parent
CONTENT = ROOT / "content"
DIST = ROOT / "dist"
WHEEL = ROOT / "third-party" / "Markdown-3.7-py3-none-any.whl"
sys.path.insert(0, str(WHEEL))
import markdown
from markdown.extensions.fenced_code import FencedCodeExtension
from markdown.extensions.tables import TableExtension
from markdown.extensions.sane_lists import SaneListExtension
from model_figures import draw_figures, generate_vowels

def read_json(path):
    return json.loads(path.read_text(encoding="utf-8"))

def read_chapters(curriculum):
    sequence = {row["id"]: row for row in curriculum["chapters"]}
    chapters = []
    for path in sorted((CONTENT / "chapters").glob("*.md")):
        header, body = path.read_text(encoding="utf-8").split("\n\n", 1)
        meta = json.loads(header)
        if path.stem != meta["id"] or meta["id"] not in sequence:
            raise ValueError("Unknown chapter ID in " + path.name)
        meta["html"] = markdown.markdown(body, extensions=[FencedCodeExtension(), TableExtension(), SaneListExtension()])
        chapters.append(meta)
    positions = list(sequence)
    return sorted(chapters, key=lambda ch: positions.index(ch["id"]))

def build():
    curriculum = read_json(CONTENT / "curriculum.json")
    chapters = read_chapters(curriculum)
    sources = [r for path in sorted((CONTENT / "sources").glob("*.json")) for r in read_json(path)]
    for group in [chapters, sources]:
        if len(group) != len({x["id"] for x in group}):
            raise ValueError("Duplicated chapter or source ID")
    data = {"curriculum": curriculum, "chapters": chapters, "sources": sources}
    for name in ["labs", "glossary", "directory"]:
        path = CONTENT / (name + ".json")
        data[name] = read_json(path) if path.exists() else []
    DIST.mkdir(exist_ok=True)
    # Copy only owned app assets. Rebuilding does not remove unrelated files.
    shutil.copytree(ROOT / "app", DIST, dirs_exist_ok=True)
    media = DIST / "media"
    media.mkdir(exist_ok=True)
    draw_figures(media)
    generate_vowels(media / "vowels.wav")
    if (ROOT / "recipes").exists():
        shutil.copytree(ROOT / "recipes", DIST / "recipes", dirs_exist_ok=True, ignore=shutil.ignore_patterns("__pycache__"))
    payload = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    (DIST / "book.js").write_text("window.FIELD_BOOK = " + payload + ";\n", encoding="utf-8")
    digest = hashlib.sha256(payload.encode()).hexdigest()[:12]
    print(f"Built {len(chapters)} chapters, {len(sources)} annotated sources and {len(data['labs'])} labs · {digest}")

if __name__ == "__main__":
    build()
