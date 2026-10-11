"""Move flex/padding layout from a view's root onto its scrolling content layer."""
import re, glob, sys

LAYOUT = ("padding", "paddingTop", "paddingBottom", "paddingLeft", "paddingRight", "display", "flexDirection",
          "gap", "rowGap", "columnGap", "justifyContent", "alignItems", "flexWrap", "textAlign")

def split_props(body):
    out, depth, buf, q = [], 0, "", None
    for ch in body:
        if q:
            buf += ch
            if ch == q: q = None
            continue
        if ch in "\"'`": q = ch
        elif ch in "({[": depth += 1
        elif ch in ")}]": depth -= 1
        if ch == "," and depth == 0:
            out.append(buf.strip()); buf = ""
        else:
            buf += ch
    if buf.strip(): out.append(buf.strip())
    return out

for f in sys.argv[1:] or glob.glob("apps/web/src/views/*/*.view.tsx"):
    s = open(f, encoding="utf-8").read()
    m = re.search(r'(<div className="scr [^"]+"[^>]*?style=\{\{ )(.*?)( \}\}>)', s)
    if not m: continue
    props = split_props(m.group(2))
    keep = [p for p in props if p.split(":")[0].strip() not in LAYOUT]
    move = [p for p in props if p.split(":")[0].strip() in LAYOUT]
    if not move: continue
    sm = re.search(r'(<div data-scroll="" style=\{\{ )(.*?)( \}\}>)', s)
    if not sm:
        print("no scroll layer, skipped:", f); continue
    scroll_props = split_props(sm.group(2))
    # keep the scroll layer's own padding-bottom (nav clearance) after the moved padding
    new_scroll = scroll_props[:4] + move + scroll_props[4:]
    flex = any(p.startswith("display") and "flex" in p for p in move)
    attr = ' data-flex=""' if flex else ""
    s = s[:sm.start()] + f'<div data-scroll=""{attr} style={{{{ ' + ", ".join(new_scroll) + " }}>" + s[sm.end():]
    m = re.search(r'(<div className="scr [^"]+"[^>]*?style=\{\{ )(.*?)( \}\}>)', s)
    s = s[:m.start()] + m.group(1) + ", ".join(keep) + m.group(3) + s[m.end():]
    open(f, "w", encoding="utf-8").write(s)
    print("fixed", f)
