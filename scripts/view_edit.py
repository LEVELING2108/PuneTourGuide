"""Tiny helper for hand-wiring generated views: exact-substring replacements with expected counts.

Usage from another script:
    from view_edit import edit
    edit("apps/web/src/views/classic/Login.view.tsx", [(old, new, count), ...])
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def edit(rel: str, rules: list[tuple[str, str, int]]):
    p = ROOT / rel
    s = p.read_text(encoding="utf-8")
    for old, new, count in rules:
        found = s.count(old)
        if found != count:
            sys.exit(f"{rel}: expected {count} of {old[:70]!r}, found {found}")
        s = s.replace(old, new)
    p.write_text(s, encoding="utf-8")
    print("edited", rel)
