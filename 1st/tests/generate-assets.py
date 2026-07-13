from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from reportlab.graphics.barcode import qr
from reportlab.graphics.shapes import Drawing
from reportlab.graphics import renderSVG

ROOT = Path(__file__).resolve().parents[1]
SHARE = ROOT / "assets" / "share"
SHARE.mkdir(parents=True, exist_ok=True)


def font(name: str, size: int):
    candidates = {
        "sans": [Path("C:/Windows/Fonts/malgun.ttf"), Path("C:/Windows/Fonts/gulim.ttc")],
        "serif": [Path("C:/Windows/Fonts/batang.ttc"), Path("C:/Windows/Fonts/malgun.ttf")],
    }[name]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size=size)
    return ImageFont.load_default()


def generate_og():
    image = Image.new("RGB", (1200, 630), "#0b1d32")
    draw = ImageDraw.Draw(image)
    draw.rectangle((0, 0, 1200, 630), outline="#071421", width=18)
    draw.line((72, 112, 1128, 112), fill="#536175", width=1)
    draw.text((72, 60), "경영자를 위한 AI 마스터과정 · FIRST COHORT", fill="#d6bb82", font=font("sans", 23))

    title_font = font("serif", 76)
    draw.text((72, 176), "1기의 8주,", fill="#f4eddf", font=title_font)
    draw.text((72, 276), "배움이 작품으로", fill="#d6bb82", font=title_font)
    draw.text((72, 376), "남았습니다.", fill="#f4eddf", font=title_font)
    draw.text((76, 556), "2026.06.01 — 07.20 · 수료 기념관", fill="#f4eddf", font=font("sans", 21))

    draw.text((860, 106), "1", fill="#142941", font=font("serif", 470), anchor="ma")
    draw.ellipse((1000, 50, 1130, 180), fill="#d6bb82")
    badge_font = font("sans", 18)
    draw.multiline_text((1065, 115), "1ST\nCOHORT", fill="#071421", font=badge_font, anchor="mm", align="center", spacing=3)
    image.save(SHARE / "og-1st.png", format="PNG", optimize=True)


def generate_qr():
    widget = qr.QrCodeWidget("https://ceo-ai.org/1st/")
    x1, y1, x2, y2 = widget.getBounds()
    size = 420
    drawing = Drawing(size, size, transform=[size / (x2 - x1), 0, 0, size / (y2 - y1), 0, 0])
    drawing.add(widget)
    renderSVG.drawToFile(drawing, str(SHARE / "qr-1st.svg"))


if __name__ == "__main__":
    generate_og()
    generate_qr()
    print("GENERATED: og-1st.png, qr-1st.svg")
