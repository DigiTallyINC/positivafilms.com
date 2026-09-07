#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Derives the three Gyaan Daily post templates from the live blog index pages.

Gyaan Daily posts publish in English, Hindi and Tamil. Each language needs its own chrome —
a translated nav, a translated footer, its own `<html lang>` and its own og:locale — and NONE
of that may be typed by hand. `web/CLAUDE.md` in the Gyaan Daily repo puts it plainly:
"Nobody retypes Indic. Eighteen Tamil rows in this project were once damaged by transcribing
them by eye."

So the chrome is taken verbatim from the three generated blog index pages, which are
themselves built from the site's own strings files. This script only:

  1. cuts each index at `<main>` / `</main>`,
  2. swaps the page-specific values (title, description, canonical, alternates, og:*)
     for `{{PLACEHOLDER}}` tokens the cron fills in,
  3. puts a post-shaped `<main>` between the two halves.

Every other byte, including every Indic character, is copied.

⚠️ Re-run this whenever the site's chrome changes (a new nav item, a new footer column).
The templates are a snapshot, not a live include.

⚠️ The stylesheet href carries a content hash. It becomes `{{CSS_V}}` here and the cron
reads the real value off the live blog index at publish time — a post shipped with a stale
hash renders half-built.

Usage:
    python tools/build_gyaandaily_templates.py [--gyaan-repo PATH] [--check]

`--check` writes nothing and exits 1 if the templates on disk are not what this script
would produce, which is what CI and the close-out sweep should call.
"""
import argparse
import os
import re
import sys

for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8", errors="replace")
    except AttributeError:
        pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_GYAAN_REPO = r"E:\26-07-27 - GYAANDAILY APP"

# language code -> (index page relative to web/, output template name)
LANGS = {
    "en": ("blog/index.html", "gyaandaily-post-en.html"),
    "hi": ("hindi/blog/index.html", "gyaandaily-post-hi.html"),
    "ta": ("tamil/blog/index.html", "gyaandaily-post-ta.html"),
}

# The post body region. `{{BODY}}` is the model's prose with the verse block spliced in;
# everything around it is fixed so the chrome stamper's file-wide regexes never see a
# `</head>`, `<footer` or `</body>` inside `<main>`.
MAIN = """<main id="main" class="wrap narrow doc">
  <p class="eyebrow">{{DATE}}</p>
  <h1>{{TITLE}}</h1>

{{BODY}}
</main>"""


def derive(index_html: str) -> str:
    """Turn one blog index page into a post template."""
    head_end = index_html.index('<main id="main"')
    tail_start = index_html.index("</main>") + len("</main>")
    head, tail = index_html[:head_end], index_html[tail_start:]

    # --- title: keep the site suffix exactly as that language writes it -------------
    m = re.search(r"<title>(.*?)</title>", head, flags=re.S)
    if not m:
        raise SystemExit("no <title> in the index page")
    # "Blog · Gyaan Daily" -> " · Gyaan Daily"; the separator is whatever the strings file used.
    suffix = m.group(1)
    sep = suffix.find("\u00b7")
    if sep == -1:
        raise SystemExit("the index title has no '\u00b7' separator to split on: %r" % suffix)
    site_suffix = suffix[sep - 1:]  # keep the space before the middot
    page_title = "{{TITLE}}" + site_suffix
    head = head.replace("<title>%s</title>" % m.group(1), "<title>%s</title>" % page_title)

    # --- description, canonical, og:* ------------------------------------------------
    head = re.sub(r'(<meta name="description" content=")[^"]*(">)', r"\1{{DESCRIPTION}}\2", head)
    head = re.sub(r'(<link rel="canonical" href=")[^"]*(">)', r"\1{{CANONICAL}}\2", head)
    head = re.sub(r'(<meta property="og:title" content=")[^"]*(">)',
                  lambda mm: mm.group(1) + page_title + mm.group(2), head)
    head = re.sub(r'(<meta property="og:description" content=")[^"]*(">)', r"\1{{DESCRIPTION}}\2", head)
    head = re.sub(r'(<meta property="og:url" content=")[^"]*(">)', r"\1{{CANONICAL}}\2", head)
    # An index is a website; a post is an article. Everything else about the card stays.
    head = head.replace('<meta property="og:type" content="website">',
                        '<meta property="og:type" content="article">')

    # --- hreflang alternates point at THIS post in the other two languages -----------
    for code, token in (("en", "{{URL_EN}}"), ("hi", "{{URL_HI}}"), ("ta", "{{URL_TA}}"),
                        ("x-default", "{{URL_EN}}")):
        head = re.sub(r'(<link rel="alternate" hreflang="%s" href=")[^"]*(">)' % re.escape(code),
                      lambda mm, t=token: mm.group(1) + t + mm.group(2), head)

    # --- the language picker, and ONLY the picker, points at the post ---------------
    # The same three hrefs appear in the nav and the footer, where they must keep pointing
    # at the blog indexes. So the swap is scoped to the <ul class="lp-menu"> block.
    def _picker(mm):
        block = mm.group(0)
        block = block.replace('href="/blog/"', 'href="{{URL_EN}}"')
        block = block.replace('href="/hindi/blog/"', 'href="{{URL_HI}}"')
        block = block.replace('href="/tamil/blog/"', 'href="{{URL_TA}}"')
        return block

    head, n = re.subn(r'<ul class="lp-menu">.*?</ul>', _picker, head, flags=re.S)
    if n != 1:
        raise SystemExit("expected exactly one language picker, found %d" % n)

    # --- stylesheet hash is resolved at publish time, never baked ---------------------
    head = re.sub(r'(<link rel="stylesheet" href="/assets/site\.css\?v=)[^"]*(">)',
                  r"\1{{CSS_V}}\2", head)

    return head + MAIN + tail


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--gyaan-repo", default=os.environ.get("GYAAN_REPO", DEFAULT_GYAAN_REPO))
    ap.add_argument("--check", action="store_true",
                    help="write nothing; exit 1 if the committed templates are out of date")
    args = ap.parse_args()

    web = os.path.join(args.gyaan_repo, "web")
    if not os.path.isdir(web):
        print("Gyaan Daily repo not found at %s" % args.gyaan_repo)
        print("Pass --gyaan-repo or set GYAAN_REPO.")
        return 1

    stale = 0
    for code, (index_rel, out_name) in LANGS.items():
        src = os.path.join(web, index_rel.replace("/", os.sep))
        if not os.path.isfile(src):
            print("  %s: MISSING %s" % (code, src))
            return 1
        built = derive(open(src, encoding="utf-8").read())

        for token in ("{{TITLE}}", "{{DESCRIPTION}}", "{{CANONICAL}}", "{{DATE}}",
                      "{{BODY}}", "{{CSS_V}}", "{{URL_EN}}", "{{URL_HI}}", "{{URL_TA}}"):
            if token not in built:
                print("  %s: placeholder %s never landed" % (code, token))
                return 1

        out = os.path.join(ROOT, "content", out_name)
        current = open(out, encoding="utf-8").read() if os.path.isfile(out) else None
        if current == built:
            print("  %-3s %-28s already current" % (code, out_name))
            continue
        stale += 1
        if args.check:
            print("  %-3s %-28s OUT OF DATE" % (code, out_name))
            continue
        with open(out, "w", encoding="utf-8", newline="\n") as fh:
            fh.write(built)
        print("  %-3s %-28s written (%d bytes)" % (code, out_name, len(built)))

    if args.check and stale:
        print("\n%d template(s) out of date. Run without --check." % stale)
        return 1
    print("\n%d of %d templates %s." % (stale, len(LANGS),
                                        "out of date" if args.check else "rebuilt"))
    return 0


if __name__ == "__main__":
    sys.exit(main())
