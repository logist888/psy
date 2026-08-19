"""
Разбор ключей IPIP (ipip.ori.org) в структурированный вид.

Пул пунктов IPIP — общественное достояние с 1999 года, коммерческое
использование разрешено явно. Это единственный источник такого масштаба,
пригодный для коммерческого продукта без лицензионных договоров.
Разбираются только опубликованные страницы ключей.

Формат заголовков на страницах разный (NEO: "N1: ANXIETY", CPI: строка
капсом, AB5C: имя в конце строки с альфой), а пункты местами разорваны
вёрсткой Word. Поэтому опорой служит маркер "+ keyed", а не вид заголовка:
имя шкалы берётся из строк непосредственно перед ним.
"""
import re, html, json, pathlib

RAW = pathlib.Path("/tmp/ipip_raw")
OUT = pathlib.Path("/tmp/ipip_parsed.json")

KEYED_PLUS = re.compile(r"^\+\s*keyed", re.I)
KEYED_MINUS = re.compile(r"^[–\-−]\s*keyed", re.I)
ALPHA = re.compile(r"\(\s*(?:IPIP\s*Scale\s*)?(?:Alpha\s*=\s*)?\.(\d{2})\s*\)|Alpha\s*=\s*\.(\d{2})")
NOISE = re.compile(r"^(mso-|/\*|table\.|\d+$|\d{4}-\d{2}-\d{2}|Clean$|Microsoft)", re.I)

def clean_lines(path: pathlib.Path) -> list[str]:
    text = html.unescape(re.sub(r"<[^>]+>", "\n", path.read_text(encoding="utf8", errors="replace")))
    return [l.strip() for l in text.split("\n") if l.strip() and not NOISE.match(l.strip())]

def scale_name(heading: list[str]) -> str | None:
    """Имя шкалы — самая «названиеподобная» строка из накопленных перед '+ keyed'."""
    for line in reversed(heading[-4:]):
        # AB5C: "vs I-/I- (Alpha = .83) GREGARIOUSNESS" — имя после скобки
        m = re.search(r"\)\s*([A-Z][A-Z \-/&']{3,60})$", line)
        if m:
            return m.group(1).strip()
        stripped = re.sub(r"\(.*?\)|\[.*?\]", "", line).strip(" :.-")
        if not stripped or len(stripped) > 70:
            continue
        # "N1: ANXIETY" -> ANXIETY
        if ":" in stripped:
            tail = stripped.split(":", 1)[1].strip()
            if 2 < len(tail) < 60 and not tail.endswith("."):
                return tail
        if stripped.isupper() and 2 < len(stripped) < 60:
            return stripped
        if stripped.istitle() and 2 < len(stripped) < 60 and not stripped.endswith("."):
            return stripped
    return None

def looks_like_heading(line: str) -> bool:
    if line.endswith(".") or not line[:1].isupper() or len(line) > 90:
        return False
    letters = [c for c in line if c.isalpha()]
    upper_ratio = sum(c.isupper() for c in letters) / len(letters) if letters else 0
    return upper_ratio > 0.8 or bool(ALPHA.search(line)) or bool(re.match(r"^[A-Za-z]{1,4}\d?\s*[:.]", line))


def parse_page(path: pathlib.Path) -> list[dict]:
    lines = clean_lines(path)
    scales: list[dict] = []
    heading: list[str] = []
    current: dict | None = None
    keying: str | None = None
    buffer = ""

    def flush_item():
        nonlocal buffer
        text = re.sub(r"\s+", " ", buffer).strip()
        buffer = ""
        if not (current and keying and re.search(r'[.!?]["\u201d]?$', text)):
            return
        # Служебные примечания под блоком ключей — не пункты опросника
        if re.match(r"^\(?No |^For further information|^see |^Note", text, re.I):
            return
        # Вёрстка местами склеивает два пункта в одну строку — разделяем обратно
        for part in re.split(r'(?<=[.!?"])\s+(?=[A-Z])', text):
            part = part.strip()
            # Пункт может оканчиваться кавычкой после точки: Want it "just right."
            if 8 < len(part) < 200 and re.search(r'[.!?]["\u201d]?$', part):
                current["items"].append({"text": part, "key": keying})

    for line in lines:
        if KEYED_PLUS.match(line) or KEYED_MINUS.match(line):
            flush_item()
            plus = bool(KEYED_PLUS.match(line))
            if plus and (current is None or current["items"]):
                name = scale_name(heading)
                if name:
                    alpha = None
                    for h in heading[-3:]:
                        m = ALPHA.search(h)
                        if m:
                            alpha = float("0." + (m.group(1) or m.group(2)))
                    current = {"name": name, "alpha": alpha, "items": []}
                    scales.append(current)
                heading = []
            keying = "+" if plus else "-"
            continue

        if keying and current is not None:
            # Между блоками пунктов встречается заголовок следующей шкалы. Отличаем
            # его от разорванного вёрсткой пункта: заголовок не заканчивается точкой,
            # начинается с заглавной и либо набран капсом, либо несёт альфу или код.
            if not buffer and looks_like_heading(line):
                keying = None
                heading = [line]
                continue
            buffer = f"{buffer} {line}".strip()
            if line.endswith("."):
                flush_item()
            continue

        heading.append(line)

    flush_item()
    return [s for s in scales if len(s["items"]) >= 4]

def main() -> None:
    out: dict[str, list[dict]] = {}
    total_scales = total_items = 0
    for path in sorted(RAW.glob("*.htm")):
        scales = parse_page(path)
        if not scales:
            print(f"{path.stem:28} — не разобрано")
            continue
        inv = re.sub(r"^new|Keys?$|_key$", "", path.stem).replace("_", " ").strip() or path.stem
        out[inv] = scales
        items = sum(len(s["items"]) for s in scales)
        total_scales += len(scales)
        total_items += items
        print(f"{inv:28} шкал: {len(scales):3}  пунктов: {items:5}")
    print(f"\nИТОГО: {total_scales} шкал, {total_items} пунктов")
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf8")

if __name__ == "__main__":
    main()
