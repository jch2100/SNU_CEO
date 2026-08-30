from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "assets" / "hero" / "tiles"
OUTPUT_DIR = ROOT / "assets" / "hero" / "tiles-normalized"
SIZE = (1000, 1500)


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    sources = sorted(SOURCE_DIR.glob("tile-*.png")) + sorted(SOURCE_DIR.glob("tile-*.jpg"))
    sources = sorted(sources, key=lambda path: int(path.stem.split("-")[-1]))
    for source in sources:
        with Image.open(source) as image:
            original = image.convert("RGB")
            contained = ImageOps.contain(original, SIZE, method=Image.Resampling.LANCZOS)
            normalized = Image.new("RGB", SIZE, (245, 242, 235))
            offset = ((SIZE[0] - contained.width) // 2, (SIZE[1] - contained.height) // 2)
            normalized.paste(contained, offset)
            target = OUTPUT_DIR / f"{source.stem}.jpg"
            normalized.save(target, "JPEG", quality=90, optimize=True, progressive=True)
            print(f"{source.name} -> {target.name} {normalized.size}")


if __name__ == "__main__":
    main()
