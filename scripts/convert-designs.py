"""
Convert design-reference/*.dc.html mockups into React view components.

Each mockup becomes apps/web/src/views/<theme>/<Name>.view.tsx: the exact markup and inline
styles of the approved design, with:
  - {{bindings}} -> props on `v` (or the current loop alias)
  - <sc-for>/<sc-if> -> .map() / && conditionals
  - links to other mockups -> react-router <Link> with the app route
  - the screen's <style> scoped to the view root (keyframes renamed per screen)
  - core theme colours -> CSS variables from src/styles/themes.css
  - the fixed 390x844 frame -> a full-height screen with a scrolling content layer;
    bottom-anchored overlays (nav, SOS, sheets, toasts) stay pinned

The screen logic (renderVals in each mockup) is written by hand in a hook per screen.
Views are scaffolding: once hand-edited, re-run only with --only <Name> --force.

Usage: python scripts/convert-designs.py [--force] [--only Name ...]
"""
from __future__ import annotations

import html
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DESIGN = ROOT / "design-reference"
OUT = ROOT / "apps" / "web" / "src" / "views"

# Mockup file (without Deccan prefix) -> app route
ROUTES = {
    "Main": "/", "Home": "/", "HomeSetup": "/",
    "Explore": "/explore", "Filters": "/explore/filters",
    "Map": "/map", "Navigation": "/directions", "Plan": "/plan", "Place": "/place",
    "SOS": "/sos",
    "Profile": "/profile",  # Classic: settings list; Deccan: passport
    "Settings": "/settings",
    "EditProfile": "/settings/profile", "Contacts": "/settings/contacts",
    "ContactEdit": "/settings/contacts/edit", "ContactAdd": "/settings/contacts/new",
    "Medical": "/settings/medical", "Offline": "/settings/offline",
    "Language": "/settings/language", "Theme": "/settings/theme", "SignOut": "/settings/sign-out",
    "Login": "/login", "SignUp": "/signup", "Otp": "/otp", "PhoneName": "/almost-there",
    "Onboard": "/first-contact", "ForgotPassword": "/forgot",
    "Splash": "/welcome", "Intro": "/intro", "Permissions": "/permissions",
}

# Theme colour -> CSS variable (per theme, so other palettes in a file stay literal)
TOKENS = {
    "classic": {
        "#F6F6F3": "var(--bg)", "#FFFFFF": "var(--surface)", "#111614": "var(--ink)",
        "#5E6763": "var(--muted)", "#E4E6E2": "var(--line)", "#0F4C42": "var(--primary)",
        "#0A3730": "var(--primary-strong)",
    },
    "deccan": {
        "#F3EADB": "var(--bg)", "#FFFBF3": "var(--surface)", "#231C17": "var(--ink)",
        "#6B5D50": "var(--muted)", "#E2D4BE": "var(--line)", "#7A1F4E": "var(--primary)",
        "#5C1239": "var(--primary-strong)", "#C59A3A": "var(--gold)",
    },
}

FONTS = {
    "classic": {
        "'Instrument Serif', serif": "var(--font-display)",
        "'Hanken Grotesk', sans-serif": "var(--font-body)",
    },
    "deccan": {
        "'DM Serif Display', serif": "var(--font-display)",
        "'Mukta', sans-serif": "var(--font-body)",
        "'Yatra One', 'Mukta', sans-serif": "var(--font-accent)",
        "'Yatra One', sans-serif": "var(--font-accent)",
    },
}

SVG_ATTRS = {
    "viewbox": "viewBox", "patternunits": "patternUnits", "preserveaspectratio": "preserveAspectRatio",
    "gradientunits": "gradientUnits", "patterntransform": "patternTransform",
}
HTML_ATTRS = {
    "class": "className", "for": "htmlFor", "tabindex": "tabIndex", "readonly": "readOnly",
    "maxlength": "maxLength", "minlength": "minLength", "autocomplete": "autoComplete",
    "inputmode": "inputMode", "autofocus": "autoFocus", "enterkeyhint": "enterKeyHint",
    "onclick": "onClick", "oninput": "onInput", "onscroll": "onScroll", "onchange": "onChange",
    "spellcheck": "spellCheck", "autocapitalize": "autoCapitalize", "crossorigin": "crossOrigin",
    "srcset": "srcSet", "colspan": "colSpan", "rowspan": "rowSpan",
}
DROP_ATTRS = {"data-props", "hint-placeholder-val", "hint-placeholder-count", "hint-size"}
VOID = {"input", "img", "br", "hr", "meta", "link", "source", "area", "col", "wbr"}
SVG_TAGS = {"lineargradient": "linearGradient", "radialgradient": "radialGradient", "clippath": "clipPath",
            "textpath": "textPath", "fegaussianblur": "feGaussianBlur"}

BIND = re.compile(r"\{\{\s*([A-Za-z_][\w]*(?:\.[\w]+)*)\s*\}\}")


class Node:
    def __init__(self, tag, attrs=None, parent=None):
        self.tag, self.attrs, self.parent, self.children = tag, attrs or [], parent, []


class Tree(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node("#root")
        self.cur = self.root

    def handle_starttag(self, tag, attrs):
        n = Node(tag, attrs, self.cur)
        self.cur.children.append(n)
        if tag not in VOID:
            self.cur = n

    def handle_startendtag(self, tag, attrs):
        self.cur.children.append(Node(tag, attrs, self.cur))

    def handle_endtag(self, tag):
        n = self.cur
        while n is not None and n.tag != tag:
            n = n.parent
        if n is not None and n.parent is not None:
            self.cur = n.parent

    def handle_data(self, data):
        self.cur.children.append(data)


def screen_key(file: Path) -> str:
    return file.name.replace(".dc.html", "")


def base_name(key: str) -> str:
    return key[len("Deccan"):] if key.startswith("Deccan") else key


def map_tokens(text: str, theme: str) -> str:
    for hex_, var in TOKENS[theme].items():
        text = re.sub(re.escape(hex_) + r"\b", var, text, flags=re.I)
    return text


def map_fonts(text: str, theme: str) -> str:
    for lit, var in FONTS[theme].items():
        text = text.replace(lit, var)
    return text


class Emitter:
    def __init__(self, theme: str, key: str):
        self.theme, self.key = theme, key
        self.aliases: list[str] = []
        self.uses_link = False
        self.uses_fragment = False
        self.imports: list[str] = []

    # ── bindings ──────────────────────────────────────────
    def ref(self, path: str) -> str:
        head = path.split(".")[0]
        return path if head in self.aliases else f"v.{path}"

    def value_expr(self, raw: str) -> str:
        """Attribute/style value possibly containing {{bindings}} -> JS expression."""
        m = BIND.fullmatch(raw.strip())
        if m:
            return self.ref(m.group(1))
        if BIND.search(raw):
            parts = BIND.sub(lambda mm: "${" + self.ref(mm.group(1)) + "}", raw.replace("`", "\\`"))
            return "`" + parts + "`"
        return json.dumps(raw, ensure_ascii=False)

    # ── style ─────────────────────────────────────────────
    def style_obj(self, css: str) -> str:
        css = map_fonts(map_tokens(css, self.theme), self.theme)
        props = []
        for decl in split_decls(css):
            if ":" not in decl:
                continue
            k, val = decl.split(":", 1)
            k, val = k.strip(), val.strip()
            if not k:
                continue
            if k.startswith("--"):
                name = json.dumps(k)
            else:
                name = re.sub(r"-([a-z])", lambda m: m.group(1).upper(), k)
                if name.startswith("Webkit") or name.startswith("Moz"):
                    pass
            props.append(f"{name}: {self.value_expr(val)}")
        return "{ " + ", ".join(props) + " }"

    # ── attributes ────────────────────────────────────────
    def attrs(self, node: Node) -> tuple[str, str | None]:
        out, link_to = [], None
        tag = node.tag
        for k, val in node.attrs:
            if k in DROP_ATTRS:
                continue
            if k == "style":
                out.append(f"style={{{self.style_obj(val or '')}}}")
                continue
            if tag == "a" and k == "href" and val and val.endswith(".dc.html"):
                link_to = ROUTES.get(base_name(val.replace(".dc.html", "")), "/")
                continue
            name = SVG_ATTRS.get(k) or HTML_ATTRS.get(k)
            if not name:
                if k.startswith("aria-") or k.startswith("data-"):
                    name = k
                elif "-" in k:
                    name = re.sub(r"-([a-z])", lambda m: m.group(1).upper(), k)
                else:
                    name = k
            if tag == "input" and name == "value" and not BIND.search(val or ""):
                name = "defaultValue"
            if tag == "input" and name == "checked" and val is None:
                name = "defaultChecked"
            if val is None:
                out.append(name)
                continue
            if name in ("fill", "stroke", "stopColor", "color", "background"):
                val = map_tokens(val, self.theme)
            expr = self.value_expr(val)
            if name in ("maxLength", "minLength", "tabIndex", "rows", "cols") and re.fullmatch(r"-?\d+", val):
                out.append(f"{name}={{{val}}}")
                continue
            if expr.startswith('"') and name not in ("key", "ref"):
                out.append(f"{name}={expr}")
            else:
                out.append(f"{name}={{{expr}}}")
        if tag == "input" and any(k == "value" and BIND.search(v or "") for k, v in node.attrs) \
                and not any(k in ("oninput", "onchange") for k, _ in node.attrs):
            out.append("readOnly")
        if tag == "input" and any(k == "oninput" for k, _ in node.attrs) \
                and any(k == "value" and BIND.search(v or "") for k, v in node.attrs):
            # React needs onChange for controlled inputs; mockups use onInput
            out = [a.replace("onInput=", "onChange=") for a in out]
        return " ".join(out), link_to

    # ── nodes ─────────────────────────────────────────────
    def text(self, s: str, first: bool, last: bool) -> str:
        if not s.strip():
            return "" if "\n" in s else '{" "}'
        lead = s[0].isspace() and not first
        trail = s[-1].isspace() and not last
        body = re.sub(r"\s+", " ", s.strip())
        def lit(t: str) -> str:
            # Plain JSX text when safe, otherwise a string expression
            if re.search(r"[{}<>]", t) or t != t.strip():
                return "{" + json.dumps(t, ensure_ascii=False) + "}"
            return t
        chunks, pos = [], 0
        for m in BIND.finditer(body):
            if m.start() > pos:
                chunks.append(lit(body[pos:m.start()]) if body[pos:m.start()].strip() == body[pos:m.start()] else "{" + json.dumps(body[pos:m.start()], ensure_ascii=False) + "}")
            chunks.append("{" + self.ref(m.group(1)) + "}")
            pos = m.end()
        if pos < len(body):
            t = body[pos:]
            chunks.append(lit(t) if t.strip() == t else "{" + json.dumps(t, ensure_ascii=False) + "}")
        res = "".join(chunks)
        return ('{" "}' if lead else "") + res + ('{" "}' if trail else "")

    def children(self, node: Node, ind: int) -> list[str]:
        kids = [c for c in node.children if not (isinstance(c, str) and not c.strip() and "\n" in c)]
        lines = []
        for i, c in enumerate(kids):
            if isinstance(c, str):
                t = self.text(c, i == 0, i == len(kids) - 1)
                if t:
                    lines.append(" " * ind + t)
            else:
                lines.extend(self.node(c, ind))
        return lines

    def node(self, n: Node, ind: int) -> list[str]:
        pad = " " * ind
        tag = SVG_TAGS.get(n.tag, n.tag)
        if tag == "sc-for":
            a = dict(n.attrs)
            lst = BIND.fullmatch(a["list"].strip()).group(1)
            alias = a.get("as", "item")
            self.uses_fragment = True
            lines = [f"{pad}{{(({self.ref(lst)} ?? []) as any[]).map(({alias}: any, {alias}Index: number) => (",
                     f"{pad}  <Fragment key={{{alias}?.key ?? {alias}Index}}>"]
            self.aliases.append(alias)
            lines += self.children(n, ind + 4)
            self.aliases.pop()
            lines += [f"{pad}  </Fragment>", f"{pad}))}}"]
            return lines
        if tag == "sc-if":
            cond = BIND.fullmatch(dict(n.attrs)["value"].strip()).group(1)
            return [f"{pad}{{{self.ref(cond)} && (", f"{pad}  <>"] + self.children(n, ind + 4) + [f"{pad}  </>", f"{pad})}}"]
        if tag == "dc-import":
            a = dict(n.attrs)
            self.imports.append(a["name"])
            props = " ".join(f'{k}="{v}"' for k, v in n.attrs if k not in DROP_ATTRS and k != "name")
            return [f"{pad}{{v.underlay /* dc-import {a['name']} {props} */}}"]
        if tag == "helmet":
            return []
        attrs, link_to = self.attrs(n)
        if tag == "a" and link_to is not None:
            self.uses_link = True
            tag_open, tag_close = f'Link to="{link_to}"' + (f" {attrs}" if attrs else ""), "Link"
        else:
            tag_open, tag_close = tag + (f" {attrs}" if attrs else ""), tag
        if tag in VOID or not n.children:
            if tag in ("textarea",):
                return [f"{pad}<{tag_open} />"]
            return [f"{pad}<{tag_open} />"]
        inner = self.children(n, ind + 2)
        if len(inner) == 1 and len(inner[0].strip()) < 60 and not inner[0].strip().startswith("<"):
            return [f"{pad}<{tag_open}>{inner[0].strip()}</{tag_close}>"]
        return [f"{pad}<{tag_open}>"] + inner + [f"{pad}</{tag_close}>"]


def split_decls(css: str) -> list[str]:
    out, depth, buf = [], 0, ""
    for ch in css:
        if ch == "(":
            depth += 1
        elif ch == ")":
            depth -= 1
        if ch == ";" and depth == 0:
            out.append(buf)
            buf = ""
        else:
            buf += ch
    if buf.strip():
        out.append(buf)
    return out


def scope_css(css: str, scope: str, theme: str, prefix: str) -> str:
    css = re.sub(r"body\{margin:0\}", "", css)
    names = re.findall(r"@keyframes\s+([\w-]+)", css)
    for nm in names:
        css = re.sub(r"@keyframes\s+" + re.escape(nm) + r"\b", f"@keyframes {prefix}-{nm}", css)
        css = re.sub(r"(animation:[^;{}]*?)\b" + re.escape(nm) + r"\b", lambda m: m.group(0).replace(nm, f"{prefix}-{nm}"), css)
        css = re.sub(r"(,\s*)" + re.escape(nm) + r"(\s+[\d.]+s)", lambda m: f"{m.group(1)}{prefix}-{nm}{m.group(2)}", css)
    css = map_tokens(css, theme)

    out, i = [], 0
    rules = top_rules(css)
    for r in rules:
        if r.startswith("@keyframes"):
            out.append(r)
        elif r.startswith("@media"):
            head, body = r.split("{", 1)
            inner = body[:-1]
            out.append(head + "{" + "".join(prefix_rule(x, scope) for x in top_rules(inner)) + "}")
        else:
            out.append(prefix_rule(r, scope))
    return "\n".join(out)


def top_rules(css: str) -> list[str]:
    out, depth, buf = [], 0, ""
    for ch in css:
        buf += ch
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                out.append(buf.strip())
                buf = ""
    return [r for r in out if r]


def prefix_rule(rule: str, scope: str) -> str:
    sel, body = rule.split("{", 1)
    sels = []
    for s in sel.split(","):
        s = s.strip()
        if s in ("*", "*::after"):
            sels.append(f"{scope} {s}")
        elif s.startswith("a") and (s == "a" or s.startswith("a:")):
            sels.append(f"{scope} {s}")
        else:
            sels.append(f"{scope} {s}")
    return ",".join(sels) + "{" + body


def classify_overlay(n) -> bool:
    """Root child that should stay pinned while content scrolls."""
    if isinstance(n, str):
        return False
    if n.tag in ("sc-if", "sc-for"):
        return any(classify_overlay(c) for c in n.children)
    if n.tag == "dc-import":
        return True
    st = dict(n.attrs).get("style") or ""
    absolute = re.search(r"position:\s*absolute", st)
    pinned = re.search(r"(^|;)\s*(bottom|inset)\s*:", st)
    return bool(absolute and pinned)


def convert(file: Path, theme: str, force: bool) -> Path | None:
    key = screen_key(file)
    out = OUT / theme / f"{key}.view.tsx"
    if out.exists() and not force:
        return None
    src = file.read_text(encoding="utf-8")
    style_m = re.search(r"<style>(.*?)</style>", src, re.S)
    css = style_m.group(1) if style_m else ""
    body_m = re.search(r"<x-dc>(.*)</x-dc>", src, re.S)
    markup = re.sub(r"<helmet>.*?</helmet>", "", body_m.group(1), flags=re.S)

    t = Tree()
    t.feed(markup)
    root = next(c for c in t.root.children if not isinstance(c, str))
    em = Emitter(theme, key)

    scope_cls = f"scr-{theme}-{key}"
    prefix = f"{theme[0]}{key}"
    scoped = scope_css(css, "." + scope_cls, theme, prefix)

    root_style = dict(root.attrs).get("style", "")
    root_style = re.sub(r"width:\s*390px", "width: 100%", root_style)
    root_style = re.sub(r"height:\s*844px", "height: 100%", root_style)
    root_style = re.sub(r"min-height:\s*844px", "min-height: 100%", root_style)
    if "position" not in root_style:
        root_style += "; position: relative"
    if "overflow" not in root_style:
        root_style += "; overflow: hidden"

    content = [c for c in root.children if not classify_overlay(c)]
    pinned = [c for c in root.children if classify_overlay(c)]
    has_nav = any(not isinstance(c, str) and c.tag == "nav" for c in pinned)

    body = []
    fake_scroll = Node("div", [("data-scroll", ""), ("style", "position: absolute; inset: 0; overflow-y: auto; overflow-x: hidden"
                                                    + ("; padding-bottom: 112px" if has_nav else ""))])
    fake_scroll.children = content
    if any(not isinstance(c, str) or c.strip() for c in content):
        body += em.node(fake_scroll, 6)
    for c in pinned:
        if isinstance(c, str):
            continue
        body += em.node(c, 6)

    root_attrs = Node("div", [("style", root_style)])
    root_attr_str, _ = em.attrs(root_attrs)

    imports = ["import type { ViewProps } from '../types';"]
    if em.uses_fragment:
        imports.insert(0, "import { Fragment } from 'react';")
    if em.uses_link:
        imports.insert(0, "import { Link } from 'react-router';")
    rel = file.relative_to(ROOT).as_posix()
    header = f"// Generated from {rel} by scripts/convert-designs.py, then wired up by hand.\n"
    css_lit = scoped.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")
    code = (
        header
        + "\n".join(imports)
        + f"\n\nconst css = `\n{css_lit}\n`;\n\n"
        + f"export default function {key}View({{ v }}: ViewProps) {{\n"
        + "  return (\n"
        + f"    <div className=\"scr {scope_cls}\" {root_attr_str}>\n"
        + f"      <style href=\"{scope_cls}\" precedence=\"screens\">{{css}}</style>\n"
        + "\n".join(body)
        + "\n    </div>\n  );\n}\n"
    )
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(code, encoding="utf-8")
    return out


def main():
    force = "--force" in sys.argv
    only = set()
    if "--only" in sys.argv:
        only = set(sys.argv[sys.argv.index("--only") + 1:])
    written = []
    for theme in ("classic", "deccan"):
        for f in sorted((DESIGN / theme).glob("*.dc.html")):
            if only and screen_key(f) not in only:
                continue
            res = convert(f, theme, force)
            if res:
                written.append(res.relative_to(ROOT).as_posix())
    if written:
        # Move root flex/padding onto the scrolling content layer
        import subprocess
        subprocess.run([sys.executable, str(ROOT / "scripts" / "fix-root-layout.py"), *[str(ROOT / w) for w in written]], check=True)
    print(f"wrote {len(written)} views")
    for w in written:
        print("  " + w)


if __name__ == "__main__":
    main()
