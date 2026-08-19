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
# Альфа записана по-разному: "(Alpha = .83)", "Alpha = .84", а на CPI — просто "[.73]"
ALPHA = re.compile(
    r"\(\s*(?:IPIP\s*Scale\s*)?(?:Alpha\s*=\s*)?\.(\d{2})\s*\)"
    r"|Alpha\s*=\s*\.(\d{2})"
    r"|\[\s*\.(\d{2})\s*\]"
)
NOISE = re.compile(r"^(mso-|/\*|table\.|\d+$|\d{4}-\d{2}-\d{2}|Clean$|Microsoft)", re.I)

def clean_lines(path: pathlib.Path) -> list[str]:
    text = html.unescape(re.sub(r"<[^>]+>", "\n", path.read_text(encoding="utf8", errors="replace")))
    return [l.strip() for l in text.split("\n") if l.strip() and not NOISE.match(l.strip())]

# Служебные слова внутри названия пишутся строчными: "Locus of Control",
# "Need for Cognition". str.istitle() их не пропускает, поэтому свой тест.
PARTICLES = {"of", "for", "and", "to", "in", "on", "or", "the", "a", "an", "with", "via"}


def is_name_case(text: str) -> bool:
    words = re.findall(r"[A-Za-z][A-Za-z'\-/]*", text)
    if not words or not text[:1].isupper():
        return False
    return all(w[:1].isupper() or w.lower() in PARTICLES for w in words)


def scale_name(heading: list[str]) -> str | None:
    """Имя шкалы — та строка перед «+ keyed», что называет саму шкалу IPIP.

    Рядом с ней страница ставит ссылку на исходный опросник в скобках
    («POWER-SEEKING (MPQ Social Potency [SP])», «COMPLEXITY (CPI: Capacity
    for Status [Cs])»), а вёрстка рвёт эту скобку на несколько строк. Обрывок
    скобки читается как название («Social Potency )») и раньше подменял имя
    шкалы — поэтому кандидаты с непарной скобкой отбрасываются, а имя IPIP,
    набранное капсом, имеет приоритет над оставшимися.
    """
    window = heading[-5:]

    # AB5C/HEXACO: "vs I-/I- (Alpha = .83) GREGARIOUSNESS" — имя после скобки
    for line in reversed(window):
        m = re.search(r"\)\s*([A-Z][A-Z \-/&']{3,60})$", line)
        if m:
            return m.group(1).strip()

    upper: list[str] = []
    titled: list[str] = []
    for line in window:
        stripped = re.sub(r"\(.*?\)|\[.*?\]", "", line).strip(" :.-")
        if not stripped or len(stripped) > 70:
            continue
        # Скобка открылась или закрылась на другой строке — это обрывок ссылки, не имя
        if re.search(r"[()\[\]]", stripped):
            continue
        # NEO: "N1: ANXIETY" -> ANXIETY. Режем только по короткому коду слева,
        # иначе теряется половина имени ("Locus of Control: Internality").
        m = re.match(r"^[A-Za-z]{1,4}\d?\s*:\s*(.+)$", stripped)
        if m:
            stripped = m.group(1).strip()
        if not (2 < len(stripped) < 60) or stripped.endswith("."):
            continue
        if stripped.isupper():
            upper.append(stripped)
        elif is_name_case(stripped):
            titled.append(stripped)

    # Имя шкалы IPIP набрано капсом; Title Case остаётся для страниц без капса
    if upper:
        return upper[-1]
    if titled:
        return titled[-1]
    return None


def heading_ahead(lines: list[str], i: int) -> bool:
    """Заголовок шкалы узнаётся по тому, что за ним следует: строка с альфой
    в скобках либо сразу блок ключей. На части страниц имя набрано Title Case
    («Leadership», «Cognitive Failures»), и по одному виду строки его не отличить
    от обрывка пункта, разорванного вёрсткой."""
    for nxt in lines[i + 1 : i + 3]:
        if re.match(r"^[\(\[]", nxt) or "Alpha" in nxt or ALPHA.search(nxt):
            return True
        if KEYED_PLUS.match(nxt):
            return True
    return False


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

    for i, line in enumerate(lines):
        if KEYED_PLUS.match(line) or KEYED_MINUS.match(line):
            flush_item()
            plus = bool(KEYED_PLUS.match(line))
            if plus and (current is None or current["items"]):
                # NEO даёт домен дважды: "NEUROTICISM / 10-item scale" и следом
                # безымянный "20-item scale" — это тот же конструкт длиннее.
                name = scale_name(heading)
                if not name:
                    m = re.search(r"(\d+)-item scale", " ".join(heading[-3:]))
                    if m and scales:
                        base = re.sub(r" \(\d+-item\)$", "", scales[-1]["name"])
                        name = f"{base} ({m.group(1)}-item)"
                # Имя так и не опознано — заводим шкалу с меткой «?»: пункты не должны
                # молча дописываться к предыдущей шкале, это порча данных.
                name = name or f"?{path.stem}-{len(scales) + 1}"
                # Скобка с альфой тоже рвётся вёрсткой ("(Alpha" / "= .83)"),
                # поэтому ищем в склейке последних строк заголовка, а не построчно.
                alpha = None
                joined = " ".join(heading[-3:])
                for m in ALPHA.finditer(joined):
                    alpha = float("0." + (m.group(1) or m.group(2) or m.group(3)))
                current = {"name": name, "alpha": alpha, "items": []}
                scales.append(current)
                heading = []
            keying = "+" if plus else "-"
            continue

        if keying and current is not None:
            # Между блоками пунктов встречается заголовок следующей шкалы. Отличаем
            # его от разорванного вёрсткой пункта: заголовок не заканчивается точкой,
            # начинается с заглавной и либо набран капсом, либо несёт альфу или код.
            if not buffer and not line.endswith(".") and (looks_like_heading(line) or heading_ahead(lines, i)):
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
        unnamed = sum(1 for x in scales if x["name"].startswith("?"))
        flag = f"  ⚠ без имени: {unnamed}" if unnamed else ""
        print(f"{inv:28} шкал: {len(scales):3}  пунктов: {items:5}{flag}")
    print(f"\nИТОГО: {total_scales} шкал, {total_items} пунктов")
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf8")

if __name__ == "__main__":
    main()
