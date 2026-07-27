#!/usr/bin/env python3
"""Structural depth + demo-tour tests for the Neural Capture monograph.

Drives real shipped files under site/ — no hard-coded success without reading them.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

SITE = Path(__file__).resolve().parents[1]
M = SITE / "m"

REQUIRED_CHAPTERS = [
    "architecture",
    "hardware",
    "bluetooth",
    "capture",
    "session",
    "gui",
    "protocol",
    "outdoor",
    "evaluation",
    "status",
    "build",
    "glossary",
    "show",
]

DEPTH_MARKERS = [
    r"chapter-contract|Chapter contract",
    r"workflow-section|End-to-end|Workflow|per-position|StartSequence|Operator path",
    r"class=\"algo|Algorithm ·|Algorithm\.",
    r"class=\"decision\"|Decision</span>|design decisions",
    r"source-map|Source map",
    r"class=\"plate\"|Fig\.|Plate ",
]


def read(p: Path) -> str:
    return p.read_text(encoding="utf-8")


def test_files_exist() -> list[str]:
    errs: list[str] = []
    if not (SITE / "index.html").is_file():
        errs.append("missing index.html")
    if not (SITE / "styles.css").is_file():
        errs.append("missing styles.css")
    for name in ("chrome.js", "glossary.js", "glossary-data.js", "demo-tour.js"):
        if not (SITE / "js" / name).is_file():
            errs.append(f"missing js/{name}")
    for c in REQUIRED_CHAPTERS:
        if not (M / f"{c}.html").is_file():
            errs.append(f"missing m/{c}.html")
    for plate in ("system_spine.svg", "capture_loop.svg"):
        if not (SITE / "assets" / "plates" / plate).is_file():
            errs.append(f"missing assets/plates/{plate}")
    return errs


def test_chapter_depth() -> list[str]:
    errs: list[str] = []
    deep = ["architecture", "hardware", "capture", "session", "gui"]
    for c in deep:
        text = read(M / f"{c}.html")
        hits = sum(1 for pat in DEPTH_MARKERS if re.search(pat, text, re.I))
        if hits < 4:
            errs.append(f"{c}.html only {hits}/6 depth markers (need ≥4)")
        if not re.search(r"chapter-contract|Chapter contract", text, re.I):
            errs.append(f"{c}.html missing chapter contract")
        if "file-map" in text and "workflow-section" not in text and "algo" not in text and "steps" not in text:
            errs.append(f"{c}.html looks file-map-only")
    cap = read(M / "capture.html")
    for must in ("CaptureStateMachine", "IsValidTransition", "workflow-section"):
        if must not in cap:
            errs.append(f"capture.html missing flagship marker {must}")
    if 'class="algo' not in cap and "class='algo" not in cap:
        errs.append('capture.html missing flagship marker class="algo…"')
    return errs


def test_demo_tour() -> list[str]:
    """Acceptance: linear multi-stop tour with talk tracks, keyboard, media."""
    errs: list[str] = []
    show = read(M / "show.html")
    js = read(SITE / "js" / "demo-tour.js")

    # 5 stops in markup
    for n in range(1, 6):
        if f'id="stop-{n}"' not in show and f"id='stop-{n}'" not in show:
            errs.append(f"show.html missing stop-{n}")
        if f'data-stop="{n}"' not in show:
            errs.append(f"show.html missing data-stop={n}")

    # Talk tracks
    if show.count("say-label") < 5 and show.count("You say") < 5:
        errs.append("show.html needs talk tracks on each stop")

    # Keyboard handling in shipped JS
    if "keydown" not in js:
        errs.append("demo-tour.js missing keydown handler")
    if "ArrowRight" not in js or "ArrowLeft" not in js:
        errs.append("demo-tour.js missing arrow key navigation")
    if not re.search(r'e\.key\s*>=\s*"1"|e\.key\s*>=\s*\'1\'', js):
        # also accept Number(e.key) pattern with 1-5
        if '"1"' not in js and "'1'" not in js:
            errs.append("demo-tour.js missing numbered stop keys")

    # goStop API
    if "goStop" not in js and "function goStop" not in js:
        errs.append("demo-tour.js missing goStop")

    # Cover / index launches tour
    idx = read(SITE / "index.html")
    if "show.html" not in idx:
        errs.append("index.html must link Demo tour")
    if "Demo tour" not in idx and "demo tour" not in idx.lower():
        errs.append("index.html should promote Demo tour")

    # TOC promotes show first
    if "Demo tour" not in show:
        errs.append("show.html TOC should label Demo tour")

    return errs


def _is_stub_image(path: Path) -> str | None:
    """Return reason if path looks like a placeholder/stub plate, else None.

    Real thesis photos/renders are tens–hundreds of KB+. Near-solid PLACEHOLDER
    PNGs compress tiny relative to pixel area (e.g. 1600×900 ~20KB gray stub).
    """
    if not path.is_file():
        return "missing"
    data = path.read_bytes()
    name = path.name.lower()
    if "placeholder" in name or name.startswith("stub_") or name.endswith("_stub.png"):
        return "stub filename"
    # embedded text chunks / ASCII label
    for needle in (b"PLACEHOLDER", b"Placeholder", b"TODO_STUB", b"lorem ipsum"):
        if needle in data:
            return f"contains {needle.decode('latin-1')}"
    suffix = path.suffix.lower()
    size = len(data)
    if suffix in {".png", ".jpg", ".jpeg", ".webp"}:
        # tiny files used as "result" plates are almost always stubs
        if size < 25_000:
            return f"too small for result plate ({size} bytes)"
        # large dimensions + tiny filesize → uniform placeholder art
        if suffix == ".png" and size < 40_000:
            # parse IHDR width/height
            if data[:8] == b"\x89PNG\r\n\x1a\n" and len(data) >= 24:
                import struct

                w, h = struct.unpack(">II", data[16:24])
                pixels = max(1, w * h)
                bpp = size / pixels
                if w >= 800 and h >= 450 and bpp < 0.05:
                    return f"png looks flat stub ({w}x{h}, {size}B, {bpp:.4f} B/px)"
    return None


def test_demo_media_paths_resolve() -> list[str]:
    """Every relative asset under show.html + evaluation plates must exist and not be stubs."""
    errs: list[str] = []
    pages = [M / "show.html", M / "evaluation.html", M / "outdoor.html"]
    seen: set[Path] = set()
    for page in pages:
        if not page.is_file():
            errs.append(f"missing {page.name}")
            continue
        text = read(page)
        for m in re.finditer(r'''(?:src|href)=["'](\.\./assets/[^"']+)["']''', text):
            rel = m.group(1)
            target = (M / rel).resolve()
            if target in seen:
                continue
            seen.add(target)
            if not target.is_file():
                errs.append(f"{page.name} broken media path: {rel}")
                continue
            # only police image plates for stubs (videos can be small encodings)
            if "/assets/images/" in rel.replace("\\", "/"):
                reason = _is_stub_image(target)
                if reason:
                    errs.append(f"{page.name} stub/placeholder plate {rel}: {reason}")
    show = read(M / "show.html")
    videos = re.findall(r'''src=["'](\.\./assets/videos/[^"']+)["']''', show)
    images = re.findall(r'''src=["'](\.\./assets/images/[^"']+)["']''', show)
    if not videos:
        errs.append("show.html needs ≥1 video result")
    if not images:
        errs.append("show.html needs ≥1 image plate")
    # ban known deleted stub name
    if "rc_granso_model" in show or "rc_granso_model" in read(M / "evaluation.html"):
        errs.append("rc_granso_model placeholder must not be referenced")
    return errs


def test_results_gallery_organized() -> list[str]:
    errs: list[str] = []
    ev = read(M / "evaluation.html")
    if "show.html" not in ev:
        errs.append("evaluation.html should point presenters to Demo tour")
    # Must still have real result media
    if "thesis_objects_overview" not in ev and "pipeline_overview" not in ev:
        errs.append("evaluation.html missing thesis result plates")
    if "thesis_pot" not in ev and "3dgs" not in ev.lower():
        errs.append("evaluation.html missing neural result videos")
    return errs


def test_no_forbidden_claims() -> list[str]:
    errs: list[str] = []
    bad = re.compile(
        r"inverse.?rendering.{0,60}\b(is production|is complete|fully shipped|shipped as thesis)\b",
        re.I | re.S,
    )
    for p in list(M.glob("*.html")) + [SITE / "index.html"]:
        t = read(p)
        if bad.search(t):
            errs.append(f"{p.name}: forbidden shipped-inverse claim")
    return errs


def test_glossary_keys() -> list[str]:
    errs: list[str] = []
    g = read(SITE / "js" / "glossary-data.js")
    for key in ("Sapera", "GigE", "ArUco", "NeRF", "Splatfacto", "SfM"):
        if key not in g:
            errs.append(f"glossary missing {key}")
    return errs


def test_deep_links_from_demo() -> list[str]:
    errs: list[str] = []
    show = read(M / "show.html")
    for target in ("architecture.html", "capture.html", "evaluation.html", "outdoor.html", "status.html"):
        if target not in show:
            errs.append(f"show.html missing dig-deeper link to {target}")
    return errs


def main() -> int:
    errs: list[str] = []
    errs += test_files_exist()
    errs += test_chapter_depth()
    errs += test_demo_tour()
    errs += test_demo_media_paths_resolve()
    errs += test_results_gallery_organized()
    errs += test_no_forbidden_claims()
    errs += test_glossary_keys()
    errs += test_deep_links_from_demo()
    if errs:
        print("FAIL")
        for e in errs:
            print(" -", e)
        return 1
    print("OK — monograph structure + demo-tour checks passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
