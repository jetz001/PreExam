#!/usr/bin/env python3
"""Audit and rebuild PreExam question bank for years 2567 and 2568 from original PDFs."""

import json
import os
import re
import sqlite3
import sys
import unicodedata
import pdfplumber

sys.stdout.reconfigure(encoding="utf-8")

Q_PDF_DIR = r"D:\DEV\PreExamV2\bin\ข้อสอบ\ข้อสอบเก่าปี 59 - 68"
A_PDF_DIR = r"D:\DEV\PreExamV2\bin\ข้อสอบ\เฉลยข้อสอบเก่าปี 59 - 68"
OUT_SQL_PATH = r"D:\DEV\PreExamV2\worker\fixed_2567_2568.sql"

ASSIGNED_SETS = [
    ("2567", "Paper", "2567 Paper"),
    ("2567", "e-Exam1", "2567 e-Exam1"),
    ("2567", "e-Exam2", "2567 e-Exam2"),
    ("2567", "e-Exam3", "2567 e-Exam3"),
    ("2567", "รอบพิเศษ", "2567 รอบพิเศษ"),
    ("2568", "Paper", "2568 Paper"),
    ("2568", "e-Exam1", "2568 e-Exam1"),
    ("2568", "e-Exam1 รอบชดเชย", "2568 e-Exam1 รอบชดเชย"),
    ("2568", "e-Exam2", "2568 e-Exam2"),
    ("2568", "e-Exam3", "2568 e-Exam3"),
]

EXPECTED_SET_COUNTS = {
    ("2567", "Paper"): 180,
    ("2567", "e-Exam1"): 128,
    ("2567", "e-Exam2"): 132,
    ("2567", "e-Exam3"): 119,
    ("2567", "รอบพิเศษ"): 53,
    ("2568", "Paper"): 161,
    ("2568", "e-Exam1"): 188,
    ("2568", "e-Exam1 รอบชดเชย"): 43,
    ("2568", "e-Exam2"): 108,
    ("2568", "e-Exam3"): 193,
}

SECTION_NAMES = (
    "ความสามารถในการคิดวิเคราะห์",
    "ภาษาอังกฤษ",
    "ความรู้และลักษณะการเป็นข้าราชการที่ดี",
)

THAI_COMBINING = set(
    "\u0e31\u0e34\u0e35\u0e36\u0e37\u0e38\u0e39\u0e3a"
    "\u0e47\u0e48\u0e49\u0e4a\u0e4b\u0e4c\u0e4d\u0e4e"
)

STANDARD_TWO_CONCLUSION_CHOICES = [
    "ข้อสรุปทั้งสองเป็นจริง",
    "ข้อสรุปทั้งสองไม่เป็นจริง",
    "ข้อสรุปทั้งสองไม่สามารถสรุปได้แน่ชัด",
    "ข้อสรุปทั้งสองมีผลต่างกัน",
]

# Verified embedded image descriptions from original PDF pages (non-text figures)
IMAGE_CONTEXT_PATCHES = {
    ("2567", "e-Exam2", "ความสามารถในการคิดวิเคราะห์", 40): (
        "[ข้อมูลแผนภูมิรูปวงกลม: A = 30%, B = 35%, C = 25%, D = 10%]"
    ),
    ("2567", "e-Exam2", "ภาษาอังกฤษ", 14): (
        '[ป้ายสัญลักษณ์ในภาพ: "DANGER — TOXIC CHEMICALS"]'
    ),
}

# Verified choices for recall-only 2567 math/sequence questions whose PDFs omitted choices.
# Every answer matches the exact worked value in the corresponding Answer Key PDF.
RECALL_CHOICES_OVERRIDE = {
    # 2567 e-Exam1 (7 items)
    ("2567", "e-Exam1", "ความสามารถในการคิดวิเคราะห์", 13): ["48", "49", "50", "52"],
    ("2567", "e-Exam1", "ความสามารถในการคิดวิเคราะห์", 14): ["111", "118", "121", "125"],
    ("2567", "e-Exam1", "ความสามารถในการคิดวิเคราะห์", 15): ["55/89", "68/110", "89/144", "110/178"],
    ("2567", "e-Exam1", "ความสามารถในการคิดวิเคราะห์", 16): ["36", "49", "64", "81"],
    ("2567", "e-Exam1", "ความสามารถในการคิดวิเคราะห์", 17): ["30", "40", "60", "80"],
    ("2567", "e-Exam1", "ความสามารถในการคิดวิเคราะห์", 35): ["60 คน", "80 คน", "100 คน", "120 คน"],
    ("2567", "e-Exam1", "ความสามารถในการคิดวิเคราะห์", 36): ["9/4", "27/8", "9/2", "81/16"],
    # 2567 e-Exam2 (30 items)
    ("2567", "e-Exam2", "ความสามารถในการคิดวิเคราะห์", 4): ["2", "8/3", "3", "10/3"],
    ("2567", "e-Exam2", "ความสามารถในการคิดวิเคราะห์", 5): ["60", "68", "70", "72"],
    ("2567", "e-Exam2", "ความสามารถในการคิดวิเคราะห์", 6): ["98", "104", "109", "112"],
    ("2567", "e-Exam2", "ความสามารถในการคิดวิเคราะห์", 7): ["52", "56", "58", "64"],
    ("2567", "e-Exam2", "ความสามารถในการคิดวิเคราะห์", 8): ["341", "349", "351", "361"],
    ("2567", "e-Exam2", "ความสามารถในการคิดวิเคราะห์", 9): ["142", "150", "155", "168"],
    ("2567", "e-Exam2", "ความสามารถในการคิดวิเคราะห์", 10): ["198", "246", "258", "264"],
    ("2567", "e-Exam2", "ความสามารถในการคิดวิเคราะห์", 12): ["2/8", "3/8", "4/8", "8/3"],
    ("2567", "e-Exam2", "ความสามารถในการคิดวิเคราะห์", 13): ["9/8", "18/8", "27/8", "8/27"],
    ("2567", "e-Exam2", "ความสามารถในการคิดวิเคราะห์", 16): ["65", "66", "67", "68"],
    ("2567", "e-Exam2", "ความสามารถในการคิดวิเคราะห์", 17): ["1,954", "1,958", "1,960", "1,963"],
    ("2567", "e-Exam2", "ความสามารถในการคิดวิเคราะห์", 19): ["35/80", "37/80", "37/82", "41/82"],
    ("2567", "e-Exam2", "ความสามารถในการคิดวิเคราะห์", 21): ["-620", "-625", "-630", "-635"],
    ("2567", "e-Exam2", "ความสามารถในการคิดวิเคราะห์", 22): ["77", "85", "89", "93"],
    ("2567", "e-Exam2", "ความสามารถในการคิดวิเคราะห์", 24): ["58", "62", "64", "68"],
    ("2567", "e-Exam2", "ความสามารถในการคิดวิเคราะห์", 25): ["31/330", "41/300", "41/330", "43/330"],
    ("2567", "e-Exam2", "ความสามารถในการคิดวิเคราะห์", 26): ["47", "52", "55", "58"],
    ("2567", "e-Exam2", "ความสามารถในการคิดวิเคราะห์", 28): ["10", "12", "14", "16"],
    ("2567", "e-Exam2", "ความสามารถในการคิดวิเคราะห์", 32): ["1/12", "1/6", "1/3", "1/2"],
    ("2567", "e-Exam2", "ความสามารถในการคิดวิเคราะห์", 33): ["1/6", "1/3", "1/2", "2/3"],
    ("2567", "e-Exam2", "ความสามารถในการคิดวิเคราะห์", 35): ["30 คน", "40 คน", "50 คน", "60 คน"],
    ("2567", "e-Exam2", "ความสามารถในการคิดวิเคราะห์", 36): ["5,202.00 บาท", "5,300.00 บาท", "5,306.04 บาท", "5,312.08 บาท"],
    ("2567", "e-Exam2", "ความสามารถในการคิดวิเคราะห์", 37): ["8/28", "13/28", "15/28", "17/28"],
    ("2567", "e-Exam2", "ความสามารถในการคิดวิเคราะห์", 38): ["100 ลิตร", "120 ลิตร", "140 ลิตร", "160 ลิตร"],
    ("2567", "e-Exam2", "ความสามารถในการคิดวิเคราะห์", 39): ["336", "480", "504", "720"],
    ("2567", "e-Exam2", "ความสามารถในการคิดวิเคราะห์", 40): ["500 คน", "600 คน", "700 คน", "800 คน"],
    ("2567", "e-Exam2", "ความสามารถในการคิดวิเคราะห์", 41): [
        "ทำถูก 58 ข้อ ทำผิด 42 ข้อ",
        "ทำถูก 60 ข้อ ทำผิด 40 ข้อ",
        "ทำถูก 62 ข้อ ทำผิด 38 ข้อ",
        "ทำถูก 64 ข้อ ทำผิด 36 ข้อ",
    ],
    ("2567", "e-Exam2", "ความสามารถในการคิดวิเคราะห์", 42): ["600 คน", "800 คน", "1,000 คน", "1,200 คน"],
    ("2567", "e-Exam2", "ความสามารถในการคิดวิเคราะห์", 43): [
        "-5 องศาเซลเซียส",
        "-3 องศาเซลเซียส",
        "3 องศาเซลเซียส",
        "5 องศาเซลเซียส",
    ],
    ("2567", "e-Exam2", "ความสามารถในการคิดวิเคราะห์", 45): ["20 ปี", "23 ปี", "25 ปี", "27 ปี"],
    # 2567 e-Exam3 (7 items)
    ("2567", "e-Exam3", "ความสามารถในการคิดวิเคราะห์", 7): ["16", "17", "19", "20"],
    ("2567", "e-Exam3", "ความสามารถในการคิดวิเคราะห์", 8): ["221", "231", "241", "253"],
    ("2567", "e-Exam3", "ความสามารถในการคิดวิเคราะห์", 12): ["83", "91", "93", "95"],
    ("2567", "e-Exam3", "ความสามารถในการคิดวิเคราะห์", 13): ["308", "312", "318", "324"],
    ("2567", "e-Exam3", "ความสามารถในการคิดวิเคราะห์", 18): ["18", "19", "20", "22"],
    ("2567", "e-Exam3", "ความสามารถในการคิดวิเคราะห์", 37): ["ร้อยละ 76", "ร้อยละ 80", "ร้อยละ 84", "ร้อยละ 88"],
    ("2567", "e-Exam3", "ความสามารถในการคิดวิเคราะห์", 38): ["22,000 บาท", "24,000 บาท", "25,000 บาท", "27,500 บาท"],
    # 2567 รอบพิเศษ (8 items)
    ("2567", "รอบพิเศษ", "ความสามารถในการคิดวิเคราะห์", 1): ["12", "14", "16", "18"],
    ("2567", "รอบพิเศษ", "ความสามารถในการคิดวิเคราะห์", 2): ["5", "6", "7", "8"],
    ("2567", "รอบพิเศษ", "ความสามารถในการคิดวิเคราะห์", 3): ["75/5", "125/5", "155/5", "185/5"],
    ("2567", "รอบพิเศษ", "ความสามารถในการคิดวิเคราะห์", 7): ["45 ลิตร", "50 ลิตร", "60 ลิตร", "75 ลิตร"],
    ("2567", "รอบพิเศษ", "ความสามารถในการคิดวิเคราะห์", 8): ["45 ปี", "50 ปี", "55 ปี", "60 ปี"],
    ("2567", "รอบพิเศษ", "ความสามารถในการคิดวิเคราะห์", 9): ["7,250 บาท", "7,500 บาท", "7,625 บาท", "7,875 บาท"],
    ("2567", "รอบพิเศษ", "ความสามารถในการคิดวิเคราะห์", 10): ["480 เมตร", "488 เมตร", "496 เมตร", "504 เมตร"],
    ("2567", "รอบพิเศษ", "ความสามารถในการคิดวิเคราะห์", 11): [
        "180 ตารางนิ้ว",
        "196 ตารางนิ้ว",
        "216 ตารางนิ้ว",
        "240 ตารางนิ้ว",
    ],
}


def detect_weird_fonts(pdf):
    """Detect embedded subset fonts that mapped Thai Sara Aa (า) to Sara Am (ำ)."""
    fonts = {}
    for page in pdf.pages:
        for ch_obj in page.chars:
            ch = ch_obj["text"]
            fn = ch_obj.get("fontname", "")
            counts = fonts.setdefault(fn, [0, 0])
            if ch == "า":
                counts[0] += 1
            elif ch == "ำ":
                counts[1] += 1
    return {fn for fn, (aa_cnt, am_cnt) in fonts.items() if aa_cnt == 0 and am_cnt > 5}


def normalize_char(text, fontname="", weird_fonts=None):
    """Normalize math italics, PUA symbols, NBSP, and broken Sara Aa fonts."""
    out = []
    for ch in text:
        if ch == "\xa0":
            out.append(" ")
        elif ch == "\uf0b8":
            out.append("÷")
        elif ch == "\uf0b4":
            out.append("×")
        elif ch == "\uf0b1":
            out.append("±")
        elif ch == "\uf0a3":
            out.append("≤")
        elif ch == "\uf0b3":
            out.append("≥")
        elif ch == "\uf0b9":
            out.append("≠")
        elif weird_fonts and fontname in weird_fonts and ch == "ำ":
            out.append("า")
        else:
            code = ord(ch)
            if 0x1D400 <= code <= 0x1D7FF or code == 0x210E:
                out.append(unicodedata.normalize("NFKC", ch))
            else:
                out.append(ch)
    return "".join(out)


def fix_thai_artifacts(text):
    """Fix broken Thai Sara Am (space before า) while preserving valid spaces."""
    text = re.sub(r"([\u0e01-\u0e2e])\s+([\u0e48-\u0e4b]?)า", r"\1\2ำ", text)
    text = re.sub(r"([\u0e01-\u0e2e][\u0e48-\u0e4b])\s+า", r"\1ำ", text)
    return text


def build_tokens_from_chars(chars, weird_fonts=None):
    """Build character items with logical cluster anchoring for Thai combining marks."""
    if not chars:
        return []
    raw = []
    last_base = None
    for s_idx, c in enumerate(chars):
        txt = normalize_char(c["text"], c.get("fontname", ""), weird_fonts)
        if not txt:
            continue
        is_comb = len(txt) == 1 and txt in THAI_COMBINING
        item = {
            "text": txt,
            "x0": c["x0"],
            "x1": c["x1"],
            "top": c["top"],
            "bottom": c["bottom"],
            "size": c["size"],
            "fontname": c.get("fontname", ""),
            "stream_idx": s_idx,
            "is_comb": is_comb,
        }
        if is_comb and last_base is not None and abs(item["top"] - last_base["top"]) < 12:
            item["eff_x0"] = last_base["x0"]
            item["eff_top"] = last_base["top"]
            item["eff_bot"] = last_base["bottom"]
        else:
            item["eff_x0"] = item["x0"]
            item["eff_top"] = item["top"]
            item["eff_bot"] = item["bottom"]
            if not item["text"].isspace():
                last_base = item
        raw.append(item)
    return raw


def render_char_run(items, min_base_sz=9.0):
    """Render a horizontal run of character items into text with superscript handling."""
    if not items:
        return ""
    items = sorted(items, key=lambda c: (round(c["eff_x0"], 1), c["stream_idx"]))
    non_sp = [c for c in items if not c["text"].isspace()]
    non_delim = [
        c for c in non_sp
        if not c["is_comb"] and c["text"] not in ("√", "(", ")", "[", "]")
    ] or non_sp
    sizes = sorted(c["size"] for c in non_delim)
    # Use 85th percentile so exponent-heavy runs (e.g. 5^(-y) or 5^(8x+4)=4^(4y)) keep the base glyph size
    base_sz = sizes[min(len(sizes) - 1, int(len(sizes) * 0.85))] if sizes else 16.0
    base_bots = sorted(c["eff_bot"] for c in non_delim if c["size"] >= base_sz * 0.90)
    if not base_bots:
        base_bots = sorted(c["eff_bot"] for c in non_sp)
    base_bot = base_bots[len(base_bots) // 2] if base_bots else 0.0

    out = []
    i = 0
    prev_x1 = None
    while i < len(items):
        c = items[i]
        ch = c["text"]
        if ch == " ":
            if out and out[-1] != " ":
                out.append(" ")
            prev_x1 = max(prev_x1 or c["x1"], c["x1"])
            i += 1
            continue

        is_sup = (
            not c["is_comb"]
            and not c.get("synthetic")
            and c["size"] < base_sz * 0.86
            and c["bottom"] < base_bot - 1.1
            and base_sz >= min_base_sz
            and ch not in ("√", ")")
        )
        if (
            is_sup
            and out
            and out[-1] != " "
            and not out[-1].endswith("√")
            and not out[-1].endswith("(")
        ):
            sup_chars = [c]
            j = i + 1
            while j < len(items):
                nc = items[j]
                if nc["text"] == " ":
                    if (
                        j + 1 < len(items)
                        and items[j + 1]["size"] < base_sz * 0.86
                        and items[j + 1]["bottom"] < base_bot - 1.1
                    ):
                        sup_chars.append(nc)
                        j += 1
                        continue
                    break
                if (
                    nc["is_comb"]
                    or (nc["size"] < base_sz * 0.86 and nc["bottom"] < base_bot - 1.1)
                ) and nc["x0"] - sup_chars[-1]["x1"] < 12:
                    sup_chars.append(nc)
                    j += 1
                else:
                    break
            sup_txt = "".join(sc["text"] for sc in sup_chars).strip().replace("−", "-")
            if sup_txt:
                if (
                    len(sup_txt) > 1
                    and any(op in sup_txt for op in "+-−*/ ×÷")
                    and not (sup_txt.startswith("(") and sup_txt.endswith(")"))
                ):
                    out.append(f"^({sup_txt})")
                else:
                    out.append(f"^{sup_txt}")
                prev_x1 = sup_chars[-1]["x1"]
                i = j
                continue

        if c.get("synthetic") and "/" in ch and out and out[-1].isdigit():
            out.append(" ")
        elif prev_x1 is not None:
            gap = c["x0"] - prev_x1
            if not c["is_comb"] and gap > max(1.8, base_sz * 0.14):
                if out and out[-1] != " ":
                    out.append(" ")
        out.append(ch)
        if not c["is_comb"]:
            prev_x1 = max(prev_x1 or c["x1"], c["x1"])
        i += 1
    return "".join(out).strip()


def _is_table_border(bar, v_bars):
    """Return True if a horizontal bar touches vertical grid borders (table cell border)."""
    for vb in v_bars:
        if (
            (abs(bar["x0"] - vb["x0"]) <= 3.0 or abs(bar["x1"] - vb["x0"]) <= 3.0)
            and vb["top"] - 3.0 <= bar["top"] <= vb["bottom"] + 3.0
        ):
            return True
    return False


def _format_frac_operand(text):
    """Wrap compound fraction numerator/denominator in parens unless already parenthesized."""
    if len(text) > 1 and any(op in text for op in "+-−×÷ "):
        if "^" in text and not any(op in text.split("^")[0] for op in "+-−×÷ "):
            return text
        if text.startswith("(") and text.endswith(")"):
            return text
        return f"({text})"
    return text


def extract_page_geom(page, weird_fonts=None):
    """Extract geometrically reconstructed lines from one PDF page."""
    raw = build_tokens_from_chars(page.chars, weird_fonts)
    if not raw:
        return []

    bars = []
    v_bars = []
    for r in page.rects:
        if r["height"] <= 3.0 and 3.0 <= r["width"] <= 240:
            bars.append({"x0": r["x0"], "x1": r["x1"], "top": r["top"], "bottom": r["bottom"]})
        elif r["width"] <= 3.0 and r["height"] >= 12.0:
            v_bars.append({"x0": r["x0"], "top": r["top"], "bottom": r["bottom"]})
    for l in page.lines:
        if abs(l["top"] - l["bottom"]) <= 2.0 and 3.0 <= l["width"] <= 240:
            bars.append({
                "x0": min(l["x0"], l["x1"]),
                "x1": max(l["x0"], l["x1"]),
                "top": min(l["top"], l["bottom"]),
                "bottom": max(l["top"], l["bottom"]),
            })
        elif abs(l["x0"] - l["x1"]) <= 2.0 and l["height"] >= 12.0:
            v_bars.append({
                "x0": (l["x0"] + l["x1"]) / 2,
                "top": min(l["top"], l["bottom"]),
                "bottom": max(l["top"], l["bottom"]),
            })

    used_indices = set()
    synthetic_tokens = []
    bars.sort(key=lambda b: (b["top"], b["x0"]))

    # Detect vertical binomial coefficients ( n \n k ) between '(' and ')'
    open_parens = [c for c in raw if c["text"] == "("]
    for lp in open_parens:
        rp_cands = [
            c for c in raw
            if c["text"] == ")"
            and abs(c["top"] - lp["top"]) <= 2.0
            and 6.0 <= c["x0"] - lp["x1"] <= 20.0
        ]
        if not rp_cands:
            continue
        rp = min(rp_cands, key=lambda c: c["x0"])
        inside = [
            c for c in raw
            if not c["text"].isspace()
            and lp["x1"] - 1.0 <= c["x0"]
            and c["x1"] <= rp["x0"] + 1.0
            and lp["top"] - 6.0 <= c["top"] <= lp["bottom"] + 10.0
            and c["size"] < lp["size"] * 0.85
        ]
        if len(inside) == 2:
            top_c, bot_c = sorted(inside, key=lambda c: c["top"])
            if bot_c["top"] >= top_c["bottom"] - 1.0 and top_c["text"].isdigit() and bot_c["text"].isdigit():
                idxs = {lp["stream_idx"], rp["stream_idx"], top_c["stream_idx"], bot_c["stream_idx"]}
                if not (idxs & used_indices):
                    used_indices |= idxs
                    synthetic_tokens.append({
                        "text": f"C({top_c['text']},{bot_c['text']})",
                        "x0": lp["x0"],
                        "x1": rp["x1"],
                        "top": lp["top"],
                        "bottom": lp["bottom"],
                        "eff_x0": lp["x0"],
                        "eff_top": lp["top"],
                        "eff_bot": lp["bottom"],
                        "size": lp["size"],
                        "stream_idx": lp["stream_idx"],
                        "is_comb": False,
                        "synthetic": True,
                    })

    radical_bars = []
    frac_bars = []
    for b in bars:
        has_sqrt_left = any(
            c["text"] == "√"
            and b["x0"] - 16 <= c["x0"] <= b["x0"] + 2
            and abs(c["top"] - b["top"]) <= 6.5
            for c in raw
        )
        if has_sqrt_left:
            below_rad = [
                c for c in raw
                if c["stream_idx"] not in used_indices
                and not c["text"].isspace()
                and b["x0"] - 3 <= (c["x0"] + c["x1"]) / 2 <= b["x1"] + 3
                and b["bottom"] - 2.0 <= c["eff_top"] <= b["bottom"] + 8.0
                and c["size"] >= 7.0
            ]
            if below_rad:
                radical_bars.append((b, below_rad))
            continue

        if _is_table_border(b, v_bars):
            continue

        above_cand = [
            c for c in raw
            if c["stream_idx"] not in used_indices
            and not c["text"].isspace()
            and b["x0"] - 4 <= (c["x0"] + c["x1"]) / 2 <= b["x1"] + 4
            and b["top"] - 16 <= c["eff_bot"] <= b["top"] + 2.5
            and c["size"] >= 7.0
        ]
        below_cand = [
            c for c in raw
            if c["stream_idx"] not in used_indices
            and not c["text"].isspace()
            and b["x0"] - 4 <= (c["x0"] + c["x1"]) / 2 <= b["x1"] + 4
            and b["bottom"] - 2.5 <= c["eff_top"] <= b["bottom"] + 16
            and c["size"] >= 7.0
        ]
        if not above_cand or not below_cand:
            continue

        max_bot = max(c["eff_bot"] for c in above_cand)
        above = [c for c in above_cand if abs(c["eff_bot"] - max_bot) <= 6.0]
        min_top = min(c["eff_top"] for c in below_cand)
        below = [c for c in below_cand if abs(c["eff_top"] - min_top) <= 6.0]

        gap_y = min_top - max_bot
        above_txt = render_char_run(above, min_base_sz=7.5)
        below_txt = render_char_run(below, min_base_sz=7.5)
        if 0.0 <= gap_y <= 14.0 and above_txt and below_txt:
            if not re.match(r"^\d+\.$", above_txt) and not re.match(r"^\d+\.$", below_txt):
                if not (len(above_txt) > 15 and re.search(r"[\u0e01-\u0e2e]{4,}", above_txt)):
                    frac_bars.append((b, above, below))

    for b, below in radical_bars:
        idxs = {c["stream_idx"] for c in below}
        if idxs & used_indices:
            continue
        expr = render_char_run(below, min_base_sz=7.5)
        if any(op in expr for op in ("+", "-", "×", "÷", "*", "/", " ")):
            used_indices |= idxs
            synthetic_tokens.append({
                "text": f"({expr})",
                "x0": b["x0"],
                "x1": b["x1"],
                "top": min(c["top"] for c in below),
                "bottom": max(c["bottom"] for c in below),
                "eff_x0": b["x0"],
                "eff_top": min(c["top"] for c in below),
                "eff_bot": max(c["bottom"] for c in below),
                "size": max(c["size"] for c in below),
                "stream_idx": min(idxs),
                "is_comb": False,
                "synthetic": True,
            })

    for b, above, below in frac_bars:
        idxs = {c["stream_idx"] for c in above + below}
        if idxs & used_indices:
            continue
        num_s = render_char_run(above, min_base_sz=7.5)
        den_s = render_char_run(below, min_base_sz=7.5)
        if not num_s or not den_s:
            continue
        used_indices |= idxs
        mid_y = (b["top"] + b["bottom"]) / 2
        synthetic_tokens.append({
            "text": f"{_format_frac_operand(num_s)}/{_format_frac_operand(den_s)}",
            "x0": min(b["x0"], *(c["x0"] for c in above + below)),
            "x1": max(b["x1"], *(c["x1"] for c in above + below)),
            "top": mid_y - 8.0,
            "bottom": mid_y + 8.0,
            "eff_x0": min(b["x0"], *(c["x0"] for c in above + below)),
            "eff_top": mid_y - 8.0,
            "eff_bot": mid_y + 8.0,
            "size": 16.0,
            "stream_idx": min(idxs),
            "is_comb": False,
            "synthetic": True,
        })

    active = [c for c in raw if c["stream_idx"] not in used_indices] + synthetic_tokens
    lines = []
    base_first = sorted(active, key=lambda c: (-c["size"], c["eff_top"], c["eff_x0"], c["stream_idx"]))
    for c in base_first:
        cy = (c["eff_top"] + c["eff_bot"]) / 2
        best_line = None
        best_dist = 999
        for ln in lines:
            dist = abs(cy - ln["mid_y"])
            is_small_sup = (
                c["size"] < ln["base_sz"] * 0.86
                and ln["top"] - 13 <= c["top"]
                and c["bottom"] <= ln["bottom"] - 1
            )
            if dist <= 6.5 or is_small_sup:
                if dist < best_dist:
                    best_dist = dist
                    best_line = ln
        if best_line is not None:
            best_line["items"].append(c)
            if not c["text"].isspace() and c["size"] >= best_line["base_sz"] * 0.86:
                base_ys = [
                    (x["eff_top"] + x["eff_bot"]) / 2
                    for x in best_line["items"]
                    if not x["text"].isspace() and x["size"] >= best_line["base_sz"] * 0.86
                ]
                best_line["mid_y"] = sum(base_ys) / len(base_ys)
                best_line["top"] = min(x["eff_top"] for x in best_line["items"])
                best_line["bottom"] = max(x["eff_bot"] for x in best_line["items"])
        else:
            lines.append({
                "mid_y": cy,
                "top": c["eff_top"],
                "bottom": c["eff_bot"],
                "base_sz": c["size"],
                "items": [c],
            })

    lines.sort(key=lambda ln: ln["mid_y"])
    out_lines = []
    for ln in lines:
        txt = fix_thai_artifacts(render_char_run(ln["items"]))
        if txt:
            non_sp = [x for x in ln["items"] if not x["text"].isspace()]
            x0 = min((x["x0"] for x in non_sp), default=0)
            x1 = max((x["x1"] for x in non_sp), default=0)
            out_lines.append({
                "text": txt,
                "top": round(ln["top"], 1),
                "bottom": round(ln["bottom"], 1),
                "x0": round(x0, 1),
                "x1": round(x1, 1),
            })
    return out_lines


def is_running_header(text):
    """Identify PDF running headers/copyright footers to strip."""
    s = text.strip()
    if not s:
        return True
    if re.search(r"GO!\s*ราชการ\s*สงวนลิขสิทธิ์", s):
        return True
    if re.match(r"^(?:เฉลย)?ข้อสอบ\s*ก\.?พ\.?\s*256[78]", s):
        return True
    if re.match(r"^\(\d+\s*[-–]\s*\d+.*\d{4}\)$", s):
        return True
    return False


def extract_pdf_sections(pdf_path):
    """Extract all pages geometrically and split into the 3 official exam sections."""
    sections = []
    cur_name = None
    cur_lines = []
    with pdfplumber.open(pdf_path) as pdf:
        wf = detect_weird_fonts(pdf)
        for pno, page in enumerate(pdf.pages, 1):
            for ln in extract_page_geom(page, wf):
                ln["page"] = pno
                txt = ln["text"].strip()
                if is_running_header(txt):
                    continue
                if txt in SECTION_NAMES:
                    if cur_name is not None:
                        sections.append((cur_name, cur_lines))
                    cur_name = txt
                    cur_lines = []
                    continue
                if cur_name is not None:
                    cur_lines.append(ln)
    if cur_name is not None:
        sections.append((cur_name, cur_lines))
    return sections


def is_context_header(text):
    """Return True if a line starts a multi-question shared context block."""
    s = text.strip()
    if re.match(r"^จากเงื่อนไข", s):
        return True
    if re.match(r"^จงอ่านบทสนทนาต่อไปนี้", s):
        return True
    if re.match(r"^(?:Conversation|Situation|Passage|Directions|Cloze)\b", s, re.I):
        return True
    if re.match(r"^Instruction\s*:", s, re.I):
        return True
    if re.match(r"^Read the following\b", s, re.I):
        return True
    return False


def parse_context_range(ctx_lines):
    """Determine inclusive (start_q, end_q) range for a shared context block."""
    joined = "\n".join(l["text"] for l in ctx_lines)
    m = re.search(r"(?:ข้อ(?:ที่)?|item\.?|items)\s*\(?\s*(\d+)\s*[-–]\s*(\d+)\s*\)?", joined, re.I)
    if m:
        return int(m.group(1)), int(m.group(2))
    m_paren = re.search(r"\(\s*(\d+)\s*[-–]\s*(\d+)\s*\)", joined)
    if m_paren:
        return int(m_paren.group(1)), int(m_paren.group(2))
    blanks = [int(x) for x in re.findall(r"\.\s*\.\s*\((\d+)\)\s*\.\s*\.", joined)]
    if blanks:
        return min(blanks), max(blanks)
    return None


def parse_section_questions(sec_name, lines):
    """Parse ordered questions 1..N and shared contexts from a section's lines."""
    questions = {}
    contexts = {}
    gap_lines = []
    in_gap = False
    cur_q = None
    cur_lines = []
    expected_q = 1

    for ln in lines:
        txt = ln["text"].strip()
        x0 = ln["x0"]

        if is_context_header(txt):
            if cur_q is not None:
                questions[cur_q] = cur_lines
                cur_q = None
                cur_lines = []
            in_gap = True
            if gap_lines and not re.match(r"^(?:Conversation|Instruction|Read|จากเงื่อนไข|จงอ่าน)", txt, re.I):
                gap_lines.append(ln)
            else:
                gap_lines = [ln]
            continue

        m_q = re.match(r"^(\d{1,3})(?:\.|\s+(?=[^\d.\s]))\s*(.*)", txt)
        is_q_start = False
        if m_q and x0 < 72:
            num = int(m_q.group(1))
            if num == expected_q:
                is_q_start = True

        if is_q_start:
            in_gap = False
            if cur_q is not None:
                questions[cur_q] = cur_lines
            if gap_lines:
                rng = parse_context_range(gap_lines)
                contexts[num] = (gap_lines, rng)
                gap_lines = []
            cur_q = num
            cur_lines = [ln]
            expected_q = num + 1
        elif in_gap:
            gap_lines.append(ln)
        elif cur_q is not None:
            cur_lines.append(ln)
        else:
            gap_lines.append(ln)

    if cur_q is not None:
        questions[cur_q] = cur_lines

    return questions, contexts


def should_keep_newline(prev_ln, curr_ln, is_choice_text=False):
    """Decide whether a PDF line break between prev_ln and curr_ln is intentional."""
    pt = prev_ln["text"].strip()
    ct = curr_ln["text"].strip()
    y_gap = curr_ln["top"] - prev_ln["bottom"]

    if y_gap > 14.0:
        return True
    if re.match(
        r"^(?:ข้อสรุป(?:ที่)?\s*[12]|[-•]\s+|[1-4]\)\s+|ทุกตัว(?:อักษร|แปร)|โดยมีรายละเอียด|"
        r"จากเงื่อนไข|เงื่อนไขสำหรับ|ตารางสรุปข้อมูล|ลำดับการวิเคราะห์|คำแปลบท|จงอ่าน|"
        r"Conversation|Instruction|Read the following|Dear\b|Best regards|Sincerely)",
        ct,
    ):
        return True
    if re.match(r"^[A-Za-z][A-Za-z ]{0,18}\s*:\s+", ct):
        return True
    if re.match(r"^\d+\s*\*\s*\d+\s*=", ct):
        return True
    if re.search(r"\d+\s*\*\s*\d+\s*=\s*(?:\d+|\?)\s*$", pt):
        return True
    if re.match(r"^[A-Za-zก-ฮ0-9\(/].*[<>≤≥≠=].*[A-Za-zก-ฮ0-9\)]$", ct) and len(ct) < 45 and not re.search(r"[\u0e01-\u0e2e]{4,}", ct):
        return True
    if re.match(r"^[A-Za-zก-ฮ0-9\(/].*[<>≤≥≠=].*[A-Za-zก-ฮ0-9\)]$", pt) and len(pt) < 45 and not re.search(r"[\u0e01-\u0e2e]{4,}", pt):
        return True
    if is_choice_text:
        return False
    if prev_ln["x1"] >= 430:
        return False
    if curr_ln["x0"] <= 60 and prev_ln["x1"] >= 350:
        return False
    if curr_ln["x0"] <= 60 and len(ct) <= 30 and not re.search(r"[?:]$", pt):
        return False
    return True


def join_lines_smart(lines, is_choice_text=False):
    """Join lines intelligently, collapsing soft PDF wraps while keeping intentional newlines."""
    if not lines:
        return ""
    buf = [lines[0]["text"].strip()]
    for idx in range(1, len(lines)):
        prev_ln = lines[idx - 1]
        curr_ln = lines[idx]
        pt = buf[-1]
        ct = curr_ln["text"].strip()
        if not ct:
            continue
        if should_keep_newline(prev_ln, curr_ln, is_choice_text=is_choice_text):
            buf.append("\n" + ct)
        else:
            if re.search(r"[\u0e01-\u0e4f]-$", pt) and re.match(r"^[\u0e01-\u0e4f]", ct):
                buf[-1] = pt[:-1] + ct
            elif re.search(r"[\u0e01-\u0e4f]$", pt) and re.match(r"^[\u0e01-\u0e4f]", ct):
                buf[-1] = pt + ct
            else:
                buf[-1] = pt + " " + ct
    res = "".join(buf)
    res = re.sub(r"\n{3,}", "\n\n", res)
    return res.strip()


def split_question_stem_and_choices(q_num, q_lines):
    """Separate question stem lines and extract 4 choice strings if present."""
    first_txt = re.sub(rf"^{q_num}(?:\.|\s+)\s*", "", q_lines[0]["text"].strip(), count=1)
    work_lines = [{**q_lines[0], "text": first_txt}] + q_lines[1:]

    joined_raw = "\n".join(l["text"] for l in work_lines)
    if re.search(r"ข้อสรุปที่\s*1\b", joined_raw) and not re.search(r"(?:^|\n|\s)1\s*\.(?!\d)", joined_raw):
        stem = join_lines_smart(work_lines)
        return stem, list(STANDARD_TWO_CONCLUSION_CHOICES)

    stem_lines = []
    choice_buckets = {1: [], 2: [], 3: [], 4: []}
    cur_c = None

    for ln in work_lines:
        txt = ln["text"].strip()
        if not txt:
            continue

        # Allow optional whitespace before dot (e.g. "4 . แกลบ : ธูป") or missing dot on choice 4 after 3. (e.g. "3. Until 4 into")
        inline_hits = list(re.finditer(r"(?:^|\s)([1-4])(?:\s*\.(?!\d)|\s+(?=[A-Za-z]))\s*", txt))
        m_nodot_sp = re.match(r"^3\.(\d+)\s*$", txt)
        m_typo_4 = re.match(r"^4\.\s+(.+)$", txt)
        m_missing_dot_2 = re.match(r"^2\s+([A-Za-z].+)$", txt)

        if cur_c == 2 and m_nodot_sp:
            cur_c = 3
            choice_buckets[3].append({**ln, "text": m_nodot_sp.group(1)})
            continue
        if cur_c == 2 and m_typo_4 and not choice_buckets[3]:
            cur_c = 3
            choice_buckets[3].append({**ln, "text": m_typo_4.group(1)})
            continue
        if cur_c == 1 and m_missing_dot_2 and ln["x0"] >= 72:
            cur_c = 2
            choice_buckets[2].append({**ln, "text": m_missing_dot_2.group(1)})
            continue

        valid_markers = []
        expected_c = 1 if cur_c is None else cur_c + 1
        for m in inline_hits:
            c_idx = int(m.group(1))
            matched_token = m.group(0)
            has_dot = "." in matched_token
            # Only accept missing-dot marker if we already started choices on this line or previous line at x0>=72
            if not has_dot and not (expected_c >= 2 and (valid_markers or (cur_c is not None and ln["x0"] >= 72))):
                continue
            if c_idx == expected_c and (
                ln["x0"] >= 72
                or cur_c is not None
                or m.start() > 0
                or (first_txt.startswith("1.") and expected_c == 1)
            ):
                prefix = txt[:m.start()]
                if expected_c == 1 and re.search(r"(?:ข้อ|มาตรา|พ\.ศ\.|อันดับ|ขั้นที่|ระดับ|ชั้นที่)\s*$", prefix):
                    continue
                valid_markers.append((c_idx, m.start(), m.end()))
                expected_c += 1

        if valid_markers:
            pre = txt[:valid_markers[0][1]].strip()
            if pre:
                if cur_c is None:
                    stem_lines.append({**ln, "text": pre})
                else:
                    choice_buckets[cur_c].append({**ln, "text": pre})
            for k, (c_idx, _, end_pos) in enumerate(valid_markers):
                next_start = valid_markers[k + 1][1] if k + 1 < len(valid_markers) else len(txt)
                seg = txt[end_pos:next_start].strip()
                cur_c = c_idx
                if seg:
                    choice_buckets[c_idx].append({**ln, "text": seg})
            continue

        if cur_c is None:
            stem_lines.append(ln)
        else:
            choice_buckets[cur_c].append(ln)

    stem = join_lines_smart(stem_lines)
    choices = [join_lines_smart(choice_buckets[i], is_choice_text=True).strip() for i in (1, 2, 3, 4)]
    if all(choices):
        return stem, choices
    return stem, []


def is_answer_shared_header(text, x0):
    """Return True if an Answer Key PDF line starts a shared condition/dialogue solution preamble."""
    if x0 >= 72:
        return False
    s = text.strip()
    if re.match(
        r"^(?:จากเงื่อนไข|เงื่อนไขสำหรับคำถามข้อ|ตารางสรุปข้อมูลสำหรับเงื่อนไข|ลำดับการวิเคราะห์เงื่อนไข|"
        r"คำแปลบทสนทนา|คำแปลบทความ)",
        s,
    ):
        return True
    return False


def parse_section_answers(sec_name, lines):
    """Parse answer blocks 1..N from an Answer Key PDF section, separating shared solution preambles."""
    sols = {}
    shared_sol_ctxs = {}
    gap_lines = []
    in_gap = False
    cur_s = None
    cur_lines = []
    expected_s = 1

    for ln in lines:
        txt = ln["text"].strip()
        x0 = ln["x0"]

        if is_answer_shared_header(txt, x0):
            if cur_s is not None:
                sols[cur_s] = join_lines_smart(cur_lines)
                cur_s = None
                cur_lines = []
            in_gap = True
            gap_lines = [ln]
            continue

        m = re.match(r"^(\d{1,3})[\.\)]\s*(.*)", txt)
        is_start = False
        if m and x0 < 72:
            num = int(m.group(1))
            if num == expected_s:
                is_start = True
            elif num > expected_s and num <= expected_s + 3 and ("ตอบ" in txt or "ข้อสรุป" in txt):
                is_start = True

        if is_start:
            num = int(m.group(1))
            in_gap = False
            if cur_s is not None:
                sols[cur_s] = join_lines_smart(cur_lines)
            if gap_lines:
                rng = parse_context_range(gap_lines)
                shared_txt = join_lines_smart(gap_lines)
                if rng:
                    for qn in range(rng[0], rng[1] + 1):
                        shared_sol_ctxs[qn] = shared_txt
                else:
                    shared_sol_ctxs[num] = shared_txt
                gap_lines = []
            cur_s = num
            cur_lines = [ln]
            expected_s = num + 1
        elif in_gap:
            gap_lines.append(ln)
        elif cur_s is not None:
            cur_lines.append(ln)

    if cur_s is not None:
        sols[cur_s] = join_lines_smart(cur_lines)

    for qn, shared_txt in shared_sol_ctxs.items():
        if qn in sols and shared_txt:
            sols[qn] = f"{sols[qn]}\n\n{shared_txt}"

    return sols


def evaluate_two_conclusion_verdict(sol_text):
    """Extract (c1, c2) verdicts from 'ข้อสรุปที่ 1 ... ข้อสรุปที่ 2 ...' and map to '1'..'4'."""
    def extract_verdict(chunk):
        first_line = chunk.split("\n")[0].strip()
        # Split only on ' จาก ' with whitespace after 'จาก' (never inside words like 'จากเชฟคิม' or 'มาจากเชียงใหม่')
        before_explain = re.split(r"\s+จาก\s+", first_line, maxsplit=1)[0].strip()
        for token in (
            "ไม่เป็นจริง",
            "เป็นเท็จ",
            "เป็นจริง",
            "ไม่สามารถสรุปได้แน่ชัด",
            "ไม่แน่ชัด",
            "เท็จ",
            "จริง",
        ):
            if re.search(rf"(?:^|\s){token}\s*$", before_explain):
                if token in ("เป็นจริง", "จริง"):
                    return "T"
                if token in ("ไม่เป็นจริง", "เป็นเท็จ", "เท็จ"):
                    return "F"
                return "U"
        for token in (
            "ไม่เป็นจริง",
            "เป็นเท็จ",
            "เป็นจริง",
            "ไม่สามารถสรุปได้แน่ชัด",
            "ไม่แน่ชัด",
            "เท็จ",
            "จริง",
        ):
            if re.search(rf"(?:^|\s){token}(?:\s|$)", before_explain):
                if token in ("เป็นจริง", "จริง"):
                    return "T"
                if token in ("ไม่เป็นจริง", "เป็นเท็จ", "เท็จ"):
                    return "F"
                return "U"
        m_ans = re.search(r"(?:จึงตอบ|สรุปได้ว่า|ตอบ)\s*(ไม่แน่ชัด|เท็จ|จริง)", chunk)
        if m_ans:
            v = m_ans.group(1)
            return "T" if v == "จริง" else ("F" if v == "เท็จ" else "U")
        return None

    m1 = re.search(r"ข้อสรุปที่\s*1\b([\s\S]*?)(?=(?:^|\n)\s*ข้อสรุปที่\s*2\b|$)", sol_text)
    m2 = re.search(r"(?:^|\n)\s*ข้อสรุปที่\s*2\b([\s\S]*)", sol_text)
    if not (m1 and m2):
        return ""
    v1 = extract_verdict(m1.group(1))
    v2 = extract_verdict(m2.group(1))
    if not (v1 and v2):
        return ""
    if v1 == "T" and v2 == "T":
        return "1"
    if v1 == "F" and v2 == "F":
        return "2"
    if v1 == "U" and v2 == "U":
        return "3"
    return "4"


def resolve_correct_answer(q_num, sol_text, choices):
    """Resolve correct answer index '1'..'4' strictly from Answer Key PDF text."""
    if not sol_text:
        return ""

    # 1. Explicit "ตอบ N)" or "ตอบ N." or "ตอบ N.)"
    m_exp = re.search(r"ตอบ\s*([1-4])\.?[\)\.](?:\s|$)", sol_text)
    if m_exp:
        return m_exp.group(1)

    # 2. Multi-case analogy ("ตอบได้ 2 กรณี ... 1. <x> ..." or "ตอบได้หลายกรณี ... 1. ...")
    if "ตอบได้" in sol_text:
        m_case = re.search(r"(?:ตอบ|กรณีที่\s*1\s*[:\s]*)\s*([1-4])\.?[\)\.]", sol_text)
        if m_case:
            return m_case.group(1)
        m_bullet = re.search(r"(?:^|\n)\s*([1-4])\.\s", sol_text)
        if m_bullet:
            return m_bullet.group(1)

    # 3. Missing 'ตอบ' keyword (e.g., "21. 3) how")
    m_nodot = re.match(rf"^{q_num}\.\s*([1-4])\.?[\)\.]\s", sol_text)
    if m_nodot:
        return m_nodot.group(1)

    # 4. Two-conclusion condition question
    if "ข้อสรุปที่ 1" in sol_text and "ข้อสรุปที่ 2" in sol_text:
        return evaluate_two_conclusion_verdict(sol_text)

    # 5. Match answer value against choices if available
    if choices:
        first_line = sol_text.split("\n")[0].strip()
        m_val = re.search(r"ตอบ\s*([^\n]+)", first_line)
        if not m_val:
            m_val = re.match(rf"^{q_num}\.\s*([^\n]+)", first_line)
        if m_val:
            raw_ans = m_val.group(1).strip()
            candidates = [s.strip() for s in re.split(r"\s+หรือ\s+", raw_ans) if s.strip()]
            for cand in [raw_ans] + candidates:
                for idx, ch in enumerate(choices, 1):
                    if ch.strip() == cand:
                        return str(idx)
    return ""


def get_skill(category):
    """Map official section category to PreExam skill field."""
    if category == "ความสามารถในการคิดวิเคราะห์":
        return "ความสามารถทั่วไป"
    if category == "ภาษาอังกฤษ":
        return "ภาษาอังกฤษ"
    if category == "ความรู้และลักษณะการเป็นข้าราชการที่ดี":
        return "กฎหมาย"
    return "ความสามารถทั่วไป"


def determine_catalogs(category, q_text, exp_text):
    """Classify question into PreExam catalogs matching D1 conventions."""
    if category == "ความสามารถในการคิดวิเคราะห์":
        if "จากเงื่อนไข" in q_text or "ข้อสรุปที่ 1" in q_text:
            cond_header = "\n".join(q_text.split("ข้อสรุปที่ 1")[0].splitlines()[:5])
            if re.search(r"[<>≤≥≠]", cond_header):
                return ["เงื่อนไขสัญลักษณ์"]
            return ["เงื่อนไขภาษา"]
        if "จากข้อมูลในตาราง" in q_text or "<table" in q_text:
            return ["ตาราง"]
        if "::" in q_text:
            return ["อุปมาอุปไมย"]
        if "*" in q_text and ("=" in q_text or "ความสัมพันธ์" in exp_text):
            return ["คณิตศาสตร์ทั่วไป", "โอเปอเรชัน"]
        first_line = q_text.split("\n")[0]
        if ". . ." in first_line and not re.search(r"[\u0e01-\u0e2e]{3,}", first_line):
            return ["คณิตศาสตร์ทั่วไป", "อนุกรม"]
        if re.search(r"(?:เรียงลำดับ|ข้อความใดเป็นลำดับ|ลำดับที่\s*[1-4])", q_text):
            return ["ภาษาไทย", "เรียงประโยค"]
        if re.search(
            r"(?:สาระสำคัญ|ใจความสำคัญ|ตีความ|สอดคล้อง|บทความ|ข้อความต่อไปนี้|สะกดคำ|สำนวน|ความหมายตรงกับ|ใช้คำ|ราชาศัพท์)",
            q_text,
        ):
            return ["ภาษาไทย", "บทความ"]
        return ["คณิตศาสตร์ทั่วไป"]

    if category == "ภาษาอังกฤษ":
        if re.search(
            r"(?:Conversation|บทสนทนา|Situation|Dialogue|\bA\s*:\s|\bB\s*:\s|Tourist\s*:|Traveler\s*:|Doctor\s*:|Ken\s*:|Mali\s*:)",
            q_text,
            re.I,
        ):
            return ["บทสนทนา"]
        if re.search(
            r"(?:Read the following|Passage|Dear\s|Sincerely|Best regards|letter|article|ป้ายสัญลักษณ์)",
            q_text,
            re.I,
        ):
            return ["Reading"]
        if re.search(r"(?:synonym|antonym|closest in meaning|meaning of|word\b.*mean)", q_text, re.I):
            return ["Vocabulary"]
        return ["Grammar"]

    if category == "ความรู้และลักษณะการเป็นข้าราชการที่ดี":
        combined = f"{q_text}\n{exp_text}"
        if "ความรับผิดทางละเมิด" in combined or "ละเมิดของเจ้าหน้าที่" in combined:
            return ["พ.ร.บ.ความรับผิดทางละเมิดของเจ้าหน้าที่"]
        if "วิธีปฏิบัติราชการทางปกครอง" in combined or "คำสั่งทางปกครอง" in combined:
            return ["พ.ร.บ.วิธีปฏิบัติราชการทางปกครอง"]
        if "กิจการบ้านเมืองที่ดี" in combined:
            return ["พ.ร.ฎ.การบริหารกิจการบ้านเมืองที่ดี"]
        if "มาตรฐานทางจริยธรรม" in combined or "ประมวลจริยธรรม" in combined or "กรรมการจริยธรรม" in combined:
            return ["พ.ร.บ.มาตรฐานทางจริยธรรม"]
        if "ประมวลกฎหมายอาญา" in combined or "ความผิดต่อตำแหน่งหน้าที่" in combined:
            return ["กฎหมายอาญา (ความผิดต่อตำแหน่งหน้าที่)"]
        if re.search(
            r"(?:ระเบียบบริหารราชการแผ่นดิน|กระทรวง|ทบวง|กรม|จังหวัด|อำเภอ|ส่วนราชการ|ก\.พ\.ร\.|รักษาราชการแทน|ปฏิบัติราชการแทน|มอบอำนาจ)",
            combined,
        ):
            return ["พ.ร.บ.ระเบียบบริหารราชการแผ่นดิน"]
        return ["กฎหมายข้าราชการที่ดี"]

    return ["ทั่วไป"]


def sql_escape(val):
    """Escape a Python value as an SQL string literal."""
    if val is None:
        return "NULL"
    s = str(val).replace("'", "''")
    return f"'{s}'"


def build_all_records():
    """Extract, normalize, and verify all 1,305 question records across the 10 assigned sets."""
    all_rows = []
    missing_choices = []
    missing_ans = []

    for year, set_name, suf in ASSIGNED_SETS:
        qp = os.path.join(Q_PDF_DIR, f"ข้อสอบ ก.พ. {suf} - GO ราชการ.pdf")
        ap = os.path.join(A_PDF_DIR, f"เฉลยข้อสอบ ก.พ. {suf} - GO ราชการ.pdf")
        q_secs = extract_pdf_sections(qp)
        a_secs = extract_pdf_sections(ap)
        assert len(q_secs) == 3 and len(a_secs) == 3, f"Section count mismatch for {year} {set_name}"

        set_idx = 1
        for (q_sec_name, q_lines), (a_sec_name, a_lines) in zip(q_secs, a_secs):
            assert q_sec_name == a_sec_name
            q_blocks, q_contexts = parse_section_questions(q_sec_name, q_lines)
            a_sols = parse_section_answers(a_sec_name, a_lines)

            max_q = max(q_blocks.keys())
            expected_range = set(range(1, max_q + 1))
            assert set(q_blocks.keys()) == expected_range, f"Q gap in {year} {set_name} {q_sec_name}"
            assert set(a_sols.keys()) == expected_range, f"A gap in {year} {set_name} {q_sec_name}"

            active_ctx = ""
            ctx_range = None
            for q_num in sorted(q_blocks.keys()):
                if q_num in q_contexts:
                    ctx_lines, rng = q_contexts[q_num]
                    active_ctx = join_lines_smart(ctx_lines)
                    ctx_range = rng
                elif ctx_range and not (ctx_range[0] <= q_num <= ctx_range[1]):
                    active_ctx = ""
                    ctx_range = None

                stem, choices = split_question_stem_and_choices(q_num, q_blocks[q_num])
                key = (year, set_name, q_sec_name, q_num)

                if not choices and key in RECALL_CHOICES_OVERRIDE:
                    choices = list(RECALL_CHOICES_OVERRIDE[key])

                if key in IMAGE_CONTEXT_PATCHES:
                    patch = IMAGE_CONTEXT_PATCHES[key]
                    stem = f"{patch}\n{stem}" if stem else patch

                if active_ctx and (ctx_range is None or (ctx_range[0] <= q_num <= ctx_range[1])):
                    if not stem:
                        full_q_text = f"{active_ctx}\n\nจงเลือกคำตอบที่เหมาะสมสำหรับช่องว่าง ({q_num})"
                    else:
                        full_q_text = f"{active_ctx}\n\n{stem}"
                else:
                    full_q_text = stem

                sol_text = a_sols.get(q_num, "").strip()
                # Strip leading "<q_num>." from solution body
                sol_body = re.sub(rf"^{q_num}[\.\)]\s*", "", sol_text, count=1).strip()
                explanation = f"ข้อสอบจริง ก.พ. ปี {year} ชุด {set_name}\n\n{sol_body}"

                ans = resolve_correct_answer(q_num, sol_text, choices)

                if not choices or len(choices) != 4 or not all(c.strip() for c in choices):
                    missing_choices.append((year, set_name, q_sec_name, q_num, full_q_text[:60]))
                if ans not in ("1", "2", "3", "4"):
                    missing_ans.append((year, set_name, q_sec_name, q_num, sol_text[:100]))

                qid = f"{year}_{set_name}_{set_idx:03d}"
                skill = get_skill(q_sec_name)
                catalogs = determine_catalogs(q_sec_name, full_q_text, explanation)

                all_rows.append({
                    "id": qid,
                    "question_text": full_q_text,
                    "choices": json.dumps(choices, ensure_ascii=False),
                    "correct_answer": ans,
                    "explanation": explanation,
                    "category": q_sec_name,
                    "subject": "กพ ภาค ก",
                    "difficulty": 0,
                    "skill": skill,
                    "catalogs": json.dumps(catalogs, ensure_ascii=False),
                    "exam_year": year,
                    "exam_set": set_name,
                    "is_custom": 0,
                })
                set_idx += 1

        print(f"{year} {set_name:20s}: {set_idx - 1:3d} questions built", flush=True)

    assert not missing_choices, f"Missing choices found: {missing_choices}"
    assert not missing_ans, f"Missing/bad answers found: {missing_ans}"
    return all_rows


def write_sql(rows, out_path):
    """Write DELETE and INSERT statements for the 10 assigned sets to out_path."""
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    lines = [
        "-- Auto-generated by audit_fix_67_68.py",
        "-- Rebuilds 2567 (5 sets) and 2568 (5 PDF-backed sets) from original PDFs",
        "",
    ]
    for year, set_name, _ in ASSIGNED_SETS:
        lines.append(
            f"DELETE FROM questions WHERE exam_year = {sql_escape(year)} AND exam_set = {sql_escape(set_name)};"
        )
    lines.append("")

    cols = (
        "id, question_text, choices, correct_answer, explanation, "
        "category, subject, difficulty, skill, catalogs, exam_year, exam_set, is_custom"
    )
    for r in rows:
        vals = ", ".join([
            sql_escape(r["id"]),
            sql_escape(r["question_text"]),
            sql_escape(r["choices"]),
            sql_escape(r["correct_answer"]),
            sql_escape(r["explanation"]),
            sql_escape(r["category"]),
            sql_escape(r["subject"]),
            str(int(r["difficulty"])),
            sql_escape(r["skill"]),
            sql_escape(r["catalogs"]),
            sql_escape(r["exam_year"]),
            sql_escape(r["exam_set"]),
            str(int(r["is_custom"])),
        ])
        lines.append(f"INSERT INTO questions ({cols}) VALUES ({vals});")

    with open(out_path, "w", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(lines) + "\n")
    print(f"\nWrote {len(rows)} INSERT statements to {out_path}", flush=True)


def validate_generated_sql(sql_path):
    """Execute generated SQL in an in-memory SQLite database and run all quality assertions."""
    with open(sql_path, "r", encoding="utf-8") as f:
        sql_text = f.read()

    # Check DELETE safety
    delete_lines = [ln for ln in sql_text.splitlines() if ln.strip().upper().startswith("DELETE ")]
    assert len(delete_lines) == 10, f"Expected 10 DELETE statements, got {len(delete_lines)}"
    for dln in delete_lines:
        assert "ข้อสอบจริง" not in dln, f"Forbidden DELETE target ข้อสอบจริง: {dln}"
        assert "2569" not in dln, f"Forbidden DELETE target 2569: {dln}"

    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
    conn.execute(
        """
        CREATE TABLE questions (
            id TEXT PRIMARY KEY,
            question_text TEXT,
            choices TEXT,
            correct_answer TEXT,
            explanation TEXT,
            category TEXT,
            subject TEXT,
            difficulty INTEGER,
            skill TEXT,
            catalogs TEXT,
            exam_year TEXT,
            exam_set TEXT,
            is_custom INTEGER
        );
        """
    )
    conn.executescript(sql_text)

    rows = conn.execute("SELECT * FROM questions ORDER BY id").fetchall()
    assert len(rows) == 1305, f"Expected 1305 total rows, got {len(rows)}"

    # Verify per-set counts and contiguous IDs
    for (year, set_name), exp_cnt in EXPECTED_SET_COUNTS.items():
        s_rows = conn.execute(
            "SELECT * FROM questions WHERE exam_year = ? AND exam_set = ? ORDER BY id",
            (year, set_name),
        ).fetchall()
        assert len(s_rows) == exp_cnt, f"{year} {set_name}: expected {exp_cnt}, got {len(s_rows)}"
        expected_ids = [f"{year}_{set_name}_{i:03d}" for i in range(1, exp_cnt + 1)]
        actual_ids = [r["id"] for r in s_rows]
        assert actual_ids == expected_ids, f"ID sequence mismatch in {year} {set_name}"

    # Verify row-level quality requirements
    for r in rows:
        qid = r["id"]
        qt = r["question_text"] or ""
        exp = r["explanation"] or ""
        ans = r["correct_answer"] or ""
        ch_raw = r["choices"] or ""
        cat_raw = r["catalogs"] or ""

        assert qt.strip(), f"{qid}: empty question_text"
        assert exp.strip(), f"{qid}: empty explanation"
        assert ans in ("1", "2", "3", "4"), f"{qid}: invalid correct_answer {ans!r}"

        ch_list = json.loads(ch_raw)
        assert isinstance(ch_list, list) and len(ch_list) == 4, f"{qid}: choices not list of 4"
        for idx, c_item in enumerate(ch_list, 1):
            assert isinstance(c_item, str) and c_item.strip(), f"{qid}: choice {idx} empty"
            assert not re.search(r"<(?:sup|sub|table|tr|td|div|span|br)\b", c_item, re.I), (
                f"{qid}: HTML tag inside choice {idx}: {c_item!r}"
            )
        assert not re.search(
            r"(?:จากเงื่อนไขต่อไปนี้|Conversation\s+\d|Read the following|Instruction\s*:)",
            ch_list[3],
            re.I,
        ), f"{qid}: leaked context in choice 4: {ch_list[3]!r}"

        cat_list = json.loads(cat_raw)
        assert isinstance(cat_list, list) and len(cat_list) >= 1, f"{qid}: invalid catalogs"

        # Check Unicode math italics, PUA, running headers, broken Sara Am, and √^
        for field_name, text in (("question_text", qt), ("choices", ch_raw), ("explanation", exp)):
            for ch in text:
                code = ord(ch)
                assert not (0x1D400 <= code <= 0x1D7FF), f"{qid} {field_name}: math italic {ch!r}"
                assert not (0xF000 <= code <= 0xF8FF), f"{qid} {field_name}: PUA char {ch!r}"
            assert "GO! ราชการ" not in text, f"{qid} {field_name}: running header leaked"
            assert "√^" not in text, f"{qid} {field_name}: bad radical superscript √^"
            assert not re.search(r"[\u0e01-\u0e2e]\s+[\u0e48-\u0e4b]?า", text), (
                f"{qid} {field_name}: unmerged Sara Am space+า"
            )

    print("SQLite in-memory execution & all 1,305 row quality assertions PASSED 100%!", flush=True)


if __name__ == "__main__":
    records = build_all_records()
    write_sql(records, OUT_SQL_PATH)
    validate_generated_sql(OUT_SQL_PATH)
