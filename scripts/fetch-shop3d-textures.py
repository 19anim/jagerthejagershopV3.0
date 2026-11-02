"""Download the CC0 Poly Haven textures used by the 3D shop and write 1K webp
files to src/assets/shop3d-textures/ (plus CREDITS.md).

Run from the repo root:  python -I scripts/fetch-shop3d-textures.py
Downloads land in a fresh temporary folder; only Pillow reads them.
"""
import json
import os
import tempfile
import urllib.request

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "src", "assets", "shop3d-textures")

# output name -> (Poly Haven asset id, map key in the files API)
TEXTURES = {
    "asphalt_diff": ("asphalt_02", "Diffuse"),
    "asphalt_nor": ("asphalt_02", "nor_gl"),
    "paver_diff": ("concrete_pavers_02", "Diffuse"),
    "paver_nor": ("concrete_pavers_02", "nor_gl"),
    "tiles_white_diff": ("long_white_tiles", "Diffuse"),
    "tiles_white_nor": ("long_white_tiles", "nor_gl"),
    "tiles_dark_diff": ("rectangular_facade_tiles", "Diffuse"),
    "tiles_dark_nor": ("rectangular_facade_tiles", "nor_gl"),
    "oak_diff": ("oak_wood_planks", "Diffuse"),
    "oak_nor": ("oak_wood_planks", "nor_gl"),
    "brick_diff": ("brick_wall_001", "Diffuse"),
    "brick_nor": ("brick_wall_001", "nor_gl"),
    "plaster_diff": ("white_plaster_02", "Diffuse"),
    "dark_wood_diff": ("dark_wood", "Diffuse"),
}


# Poly Haven refuses urllib's default user agent.
HEADERS = {"User-Agent": "jagershop-texture-fetch/1.0 (+https://polyhaven.com/license)"}


def open_url(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers=HEADERS), timeout=60)


def fetch(url, dest):
    with open_url(url) as response, open(dest, "wb") as out:
        out.write(response.read())


def main():
    os.makedirs(OUT, exist_ok=True)
    tmp = tempfile.mkdtemp(prefix="shop3d-tex-")
    files_cache = {}
    credits = ["# 3D shop textures", "", "All textures are CC0 (public domain) from Poly Haven, https://polyhaven.com/license.", ""]
    for name, (asset, key) in TEXTURES.items():
        if asset not in files_cache:
            with open_url(f"https://api.polyhaven.com/files/{asset}") as response:
                files_cache[asset] = json.load(response)
        url = files_cache[asset][key]["1k"]["jpg"]["url"]
        src = os.path.join(tmp, f"{name}.jpg")
        fetch(url, src)
        image = Image.open(src).convert("RGB")
        if image.size != (1024, 1024):
            image = image.resize((1024, 1024), Image.LANCZOS)
        dest = os.path.join(OUT, f"{name}.webp")
        image.save(dest, "WEBP", quality=90 if name.endswith("_nor") else 80, method=6)
        credits.append(f"- `{name}.webp` — {asset} ({key}), https://polyhaven.com/a/{asset}")
        print(f"{name}.webp  {os.path.getsize(dest) // 1024} KB")
    with open(os.path.join(OUT, "CREDITS.md"), "w", encoding="utf-8") as handle:
        handle.write("\n".join(credits) + "\n")


if __name__ == "__main__":
    main()
