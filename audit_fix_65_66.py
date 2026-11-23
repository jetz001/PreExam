import os
import sys
import re
import json
import math
import hashlib
import sqlite3
from fractions import Fraction
import pdfplumber

sys.stdout.reconfigure(encoding='utf-8')

Q_DIR = r'D:\DEV\PreExamV2\bin\ข้อสอบ\ข้อสอบเก่าปี 59 - 68'
S_DIR = r'D:\DEV\PreExamV2\bin\ข้อสอบ\เฉลยข้อสอบเก่าปี 59 - 68'
OUT_SQL = r'D:\DEV\PreExamV2\worker\fixed_2565_2566.sql'
CACHE_PATH = r'C:\Users\Boss-QA\.gemini\antigravity\brain\eb38cd11-f6b1-437f-84db-2cb8f4b5082c\scratch\hybrid_cache_v2.json'

SETS = [
    ('2565', 'Paper'),
    ('2565', 'e-Exam1'),
    ('2565', 'e-Exam2'),
    ('2566', 'Paper'),
    ('2566', 'e-Exam1'),
    ('2566', 'e-Exam2'),
    ('2566', 'e-Exam3'),
    ('2566', 'รอบพิเศษ'),
]

CAT_TO_SKILL = {
    'ความสามารถในการคิดวิเคราะห์': 'ความสามารถทั่วไป',
    'ภาษาอังกฤษ': 'ภาษาอังกฤษ',
    'ความรู้และลักษณะการเป็นข้าราชการที่ดี': 'กฎหมาย',
}

# Known source PDF question-number typos: (year, set_name, cat, current_q, printed_num) -> true_q
Q_NUM_TYPOS = {
    ('2565', 'e-Exam1', 'ความสามารถในการคิดวิเคราะห์', 73, 54): 74,
    ('2566', 'Paper', 'ความสามารถในการคิดวิเคราะห์', 49, 40): 50,
}

# Clean SVG + text diagram for 2566_e-Exam1 Q42 (right triangle ABC with altitude BD, AD=9, DC=16)
Q42_2566_E1_DIAGRAM = (
    '<svg viewBox="0 0 320 135" style="display:block;max-width:300px;width:100%;margin:12px auto;" '
    'role="img" aria-label="รูปสามเหลี่ยมมุมฉาก ABC มีเส้นตั้งฉาก BD โดย AD = 9 และ DC = 16">'
    '<polygon points="30,105 120,25 290,105" fill="none" stroke="currentColor" stroke-width="2"/>'
    '<line x1="120" y1="25" x2="120" y2="105" stroke="currentColor" stroke-width="2"/>'
    '<text x="18" y="112" fill="currentColor" font-size="14" font-weight="bold">A</text>'
    '<text x="115" y="18" fill="currentColor" font-size="14" font-weight="bold">B</text>'
    '<text x="295" y="112" fill="currentColor" font-size="14" font-weight="bold">C</text>'
    '<text x="115" y="123" fill="currentColor" font-size="14" font-weight="bold">D</text>'
    '<text x="72" y="99" fill="#f59e0b" font-size="13" font-weight="bold">9</text>'
    '<text x="200" y="99" fill="#f59e0b" font-size="13" font-weight="bold">16</text>'
    '</svg>'
    '(กำหนดให้รูปสามเหลี่ยมมุมฉาก ABC มีมุม B เป็นมุมฉาก และ BD ตั้งฉากกับด้าน AC ที่จุด D โดย AD = 9 และ DC = 16)'
)


def normalize_math_unicode(s: str) -> str:
    out = []
    for ch in s:
        o = ord(ch)
        if 0x1D400 <= o <= 0x1D419:
            ch = chr(ord('A') + o - 0x1D400)
        elif 0x1D41A <= o <= 0x1D433:
            ch = chr(ord('a') + o - 0x1D41A)
        elif 0x1D434 <= o <= 0x1D44D:
            ch = chr(ord('A') + o - 0x1D434)
        elif 0x1D44E <= o <= 0x1D467:
            ch = chr(ord('a') + o - 0x1D44E)
        elif o == 0x210E:
            ch = 'h'
        elif 0x1D468 <= o <= 0x1D481:
            ch = chr(ord('A') + o - 0x1D468)
        elif 0x1D482 <= o <= 0x1D49B:
            ch = chr(ord('a') + o - 0x1D482)
        elif 0x1D7CE <= o <= 0x1D7D7:
            ch = chr(ord('0') + o - 0x1D7CE)
        elif 0x1D7EC <= o <= 0x1D7F5:
            ch = chr(ord('0') + o - 0x1D7EC)
        elif 0x1D7F6 <= o <= 0x1D7FF:
            ch = chr(ord('0') + o - 0x1D7F6)
        elif ch == '−':
            ch = '-'
        out.append(ch)
    return ''.join(out)


def is_combining_thai(ch: str) -> bool:
    o = ord(ch)
    return (0x0E31 <= o <= 0x0E3A and o not in (0x0E32, 0x0E33)) or (0x0E47 <= o <= 0x0E4E)


def is_thai_char(ch: str) -> bool:
    o = ord(ch)
    return 0x0E01 <= o <= 0x0E5B


def is_math_sup_char(ch: str) -> bool:
    return bool(re.match(r'^[A-Za-z0-9+\-*/()]+$', ch))


def fix_thai_artifacts(text: str) -> str:
    text = re.sub(
        r'([\u0E01-\u0E2E])([\u0E31\u0E34-\u0E3A\u0E47-\u0E4C]*)[ \t]+([\u0E48-\u0E4B]?)า',
        lambda m: m.group(1) + m.group(2) + m.group(3) + 'ำ',
        text,
    )
    text = re.sub(r'ใ\s+ห้', 'ให้', text)
    text = re.sub(r'มอเตอร์ไ\s+ซค์', 'มอเตอร์ไซค์', text)
    return text


def chars_to_str(clist) -> str:
    if not clist:
        return ''
    clusters = []
    for c in clist:
        ch = normalize_math_unicode(c['text'])
        if ch in ('\n', '\r'):
            continue
        if is_combining_thai(ch) and clusters:
            clusters[-1]['text'] += ch
            clusters[-1]['x1'] = max(clusters[-1]['x1'], c['x1'])
        elif ch.strip():
            clusters.append({
                'text': ch,
                'x0': c['x0'],
                'x1': c['x1'],
                'top': c['top'],
                'bottom': c['bottom'],
                'size': c['size'],
                'stream_idx': len(clusters),
            })
    if not clusters:
        return ''
    clusters.sort(key=lambda g: (g['x0'], g['stream_idx']))
    out = []
    sup_buf = []
    base_top = None
    base_bot = None
    base_size = None

    def flush_sup():
        nonlocal base_top, base_bot, base_size
        if sup_buf:
            s = ''.join(sup_buf)
            out.append('^' + s if len(s) == 1 else '^(' + s + ')')
            sup_buf.clear()
        base_top = None
        base_bot = None
        base_size = None

    prev_g = None
    for g in clusters:
        ref_t = base_top if sup_buf else (prev_g['top'] if prev_g else g['top'])
        ref_b = base_bot if sup_buf else (prev_g['bottom'] if prev_g else g['bottom'])
        ref_sz = base_size if sup_buf else (prev_g['size'] if prev_g else g['size'])
        is_sup = (
            prev_g is not None
            and (g['size'] <= ref_sz * 0.87)
            and (g['bottom'] < ref_b - 1.8)
            and (g['top'] <= ref_t + 1.5)
            and (-1.5 <= (g['x0'] - prev_g['x1']) < 4.5)
            and is_math_sup_char(g['text'])
            and (re.match(r'^[A-Za-z0-9)\]]$', prev_g['text']) or bool(sup_buf))
        )
        if is_sup:
            if not sup_buf:
                base_top = prev_g['top']
                base_bot = prev_g['bottom']
                base_size = prev_g['size']
            sup_buf.append(g['text'])
            prev_g = g
            continue
        was_sup = bool(sup_buf)
        flush_sup()
        if prev_g is not None:
            gap = g['x0'] - prev_g['x1']
            if gap > 2.2 or (was_sup and g['text'].isalpha()):
                out.append(' ')
        out.append(g['text'])
        prev_g = g
    flush_sup()
    return ''.join(out).strip()


def extract_page_lines_with_meta(page, ignore_char_bboxes=None, ignore_bar_bboxes=None):
    ignore_char_bboxes = ignore_char_bboxes or []
    ignore_bar_bboxes = ignore_bar_bboxes or []

    def in_bboxes(x0, top, x1, bot, bboxes):
        cx = (x0 + x1) / 2
        cy = (top + bot) / 2
        for (ix0, itop, ix1, ibot) in bboxes:
            if ix0 - 3 <= cx <= ix1 + 3 and itop - 3 <= cy <= ibot + 3:
                return True
        return False

    raw_chars = [
        c for c in page.chars
        if c['top'] > 42 and c['text'] and not in_bboxes(c['x0'], c['top'], c['x1'], c['bottom'], ignore_char_bboxes)
    ]
    if not raw_chars:
        return []

    sizes = sorted(c['size'] for c in raw_chars if c['text'].strip())
    med_size = sizes[len(sizes) // 2] if sizes else 16.0

    cand_bars = [
        r for r in page.rects
        if r['height'] <= 3.5 and 4 <= r['width'] <= 110 and not in_bboxes(r['x0'], r['top'], r['x1'], r['bottom'], ignore_bar_bboxes)
    ]
    cand_bars += [
        l for l in page.lines
        if abs(l['top'] - l['bottom']) <= 2 and 4 <= l['width'] <= 110 and not in_bboxes(l['x0'], l['top'], l['x1'], l['bottom'], ignore_bar_bboxes)
    ]

    used_char_ids = set()
    frac_tokens = []
    for b in sorted(cand_bars, key=lambda r: (r['top'], r['x0'])):
        bx0, bx1 = b['x0'], b['x1']
        btop, bbot = b['top'], b['bottom']
        ymid = (btop + bbot) / 2
        num_c = []
        den_c = []
        for idx, c in enumerate(raw_chars):
            if idx in used_char_ids or not c['text'].strip():
                continue
            cx_mid = (c['x0'] + c['x1']) / 2
            if not (bx0 - 2.5 <= cx_mid <= bx1 + 2.5):
                continue
            if -3.5 <= (btop - c['bottom']) <= 6.0 and c['top'] < btop:
                num_c.append((idx, c))
            elif -3.5 <= (c['top'] - bbot) <= 6.0 and c['bottom'] > bbot:
                den_c.append((idx, c))
        if num_c and den_c:
            seen_pair_ids = {idx for idx, _ in num_c + den_c}
            num_max_sz = max(c['size'] for _, c in num_c)
            num_min_top = min(c['top'] for _, c in num_c)
            num_max_top = max(c['top'] for _, c in num_c)
            den_max_sz = max(c['size'] for _, c in den_c)
            den_max_top = max(c['top'] for _, c in den_c)
            for idx, c in enumerate(raw_chars):
                if idx in used_char_ids or idx in seen_pair_ids or not c['text'].strip():
                    continue
                cx_mid = (c['x0'] + c['x1']) / 2
                if not (bx0 - 2.5 <= cx_mid <= bx1 + 4.5):
                    continue
                c_norm = normalize_math_unicode(c['text'])
                if not is_math_sup_char(c_norm):
                    continue
                if (
                    c['size'] <= num_max_sz * 0.90
                    and num_min_top - 6.0 <= c['top'] < num_max_top
                    and btop - c['bottom'] <= 12.0
                ):
                    num_c.append((idx, c))
                    seen_pair_ids.add(idx)
                elif (
                    c['size'] <= den_max_sz * 0.90
                    and bbot - 1.0 <= c['top'] <= den_max_top + 4.0
                    and c['top'] - bbot <= 8.0
                ):
                    den_c.append((idx, c))
                    seen_pair_ids.add(idx)

            nt = chars_to_str([c for _, c in num_c]).replace(' ', '')
            dt = chars_to_str([c for _, c in den_c]).replace(' ', '')
            if not nt or not dt or len(nt) > 30 or len(dt) > 30:
                continue
            for idx, _ in num_c + den_c:
                used_char_ids.add(idx)
            nt_fmt = f'({nt})' if re.search(r'[+\-*/]', nt) else nt
            dt_fmt = f'({dt})' if re.search(r'[+\-*/]', dt) else dt
            frac_tokens.append({
                'kind': 'frac',
                'text': f'{nt_fmt}/{dt_fmt}',
                'nt': nt,
                'dt': dt,
                'x0': bx0,
                'x1': bx1,
                'top': ymid - 6,
                'bottom': ymid + 6,
                'y_mid': ymid,
                'size': med_size,
            })

    tokens = list(frac_tokens)
    last_cluster = None
    for idx, c in enumerate(raw_chars):
        if idx in used_char_ids:
            last_cluster = None
            continue
        ch = normalize_math_unicode(c['text'])
        if ch in ('\n', '\r'):
            last_cluster = None
            continue
        if is_combining_thai(ch) and last_cluster is not None and abs(c['top'] - last_cluster['top']) < 8:
            last_cluster['text'] += ch
            last_cluster['x1'] = max(last_cluster['x1'], c['x1'])
            continue
        tok = {
            'kind': 'space' if ch == ' ' else 'char',
            'text': ch,
            'x0': c['x0'],
            'x1': c['x1'],
            'top': c['top'],
            'bottom': c['bottom'],
            'y_mid': (c['top'] + c['bottom']) / 2,
            'size': c['size'],
            'stream_idx': idx,
        }
        tokens.append(tok)
        last_cluster = tok if ch != ' ' else None

    tokens.sort(key=lambda t: (t['y_mid'], t['x0']))
    lines = []
    for t in tokens:
        placed = False
        for ln in reversed(lines[-4:]):
            tol = 7.5 if (ln['has_frac'] or t['kind'] == 'frac') else 4.5
            if abs(t['y_mid'] - ln['y_mid']) <= tol:
                ln['items'].append(t)
                if t['kind'] == 'frac':
                    ln['has_frac'] = True
                    f_items = [x for x in ln['items'] if x['kind'] == 'frac']
                    ln['y_mid'] = sum(x['y_mid'] for x in f_items) / len(f_items)
                placed = True
                break
        if not placed:
            lines.append({'y_mid': t['y_mid'], 'items': [t], 'has_frac': t['kind'] == 'frac'})

    lines.sort(key=lambda ln: ln['y_mid'])
    out_lines = []
    for ln in lines:
        items = sorted(ln['items'], key=lambda x: (x['x0'], x.get('stream_idx', 0)))
        non_space = [x for x in items if x['kind'] != 'space']
        if not non_space:
            continue
        had_trailing_space = items[-1]['kind'] == 'space'
        line_x0 = non_space[0]['x0']
        line_x1 = max(x['x1'] for x in non_space)

        parts = []
        prev = None
        sup_buf = []
        base_top_before_sup = None
        base_bot_before_sup = None
        sup_base_size = None

        def flush_sup():
            nonlocal base_top_before_sup, base_bot_before_sup, sup_base_size
            was = bool(sup_buf)
            if sup_buf:
                s = ''.join(sup_buf).strip()
                if s:
                    parts.append('^' + s if len(s) == 1 else '^(' + s + ')')
                sup_buf.clear()
            base_top_before_sup = None
            base_bot_before_sup = None
            sup_base_size = None
            return was

        for it in items:
            if it['kind'] == 'space':
                if sup_buf:
                    continue
                if parts and not parts[-1].endswith(' '):
                    parts.append(' ')
                continue
            if it['kind'] == 'char':
                ref_top = base_top_before_sup if sup_buf else (prev['top'] if prev else it['top'])
                ref_bot = base_bot_before_sup if sup_buf else (prev['bottom'] if prev else it['bottom'])
                ref_sz = sup_base_size if sup_buf else (prev['size'] if prev else med_size)
                gap_sup = (it['x0'] - prev['x1']) if prev else 999
                # Strictly require upward bottom-baseline shift, smaller size, and tight horizontal adjacency
                is_sup = (
                    prev is not None
                    and (it['size'] <= ref_sz * 0.87)
                    and (it['bottom'] < ref_bot - 1.8)
                    and (it['top'] <= ref_top + 1.5)
                    and (-1.5 <= gap_sup < 4.5)
                    and is_math_sup_char(it['text'])
                    and (prev['kind'] == 'frac' or (prev['kind'] == 'char' and (re.match(r'^[A-Za-z0-9)\]]$', prev['text']) or bool(sup_buf))))
                )
                if is_sup:
                    if not sup_buf:
                        base_top_before_sup = prev['top']
                        base_bot_before_sup = prev['bottom']
                        sup_base_size = prev['size']
                    sup_buf.append(it['text'])
                    prev = it
                    continue
                was_sup = flush_sup()

                gap = it['x0'] - prev['x1'] if prev else 0
                if prev and prev['kind'] == 'frac':
                    if prev['nt'].isdigit() and prev['dt'].isdigit() and re.match(r'^[A-Za-z]$', it['text']) and gap < 8:
                        k = len(parts) - 1
                        while k >= 0 and parts[k] == ' ':
                            k -= 1
                        if k >= 0:
                            parts[k] = f"({parts[k]})"
                        while len(parts) - 1 > k:
                            parts.pop()
                        parts.append(it['text'])
                    elif it['text'] in ')=.,' and gap < 6:
                        parts.append(it['text'])
                    else:
                        if not (parts and parts[-1].endswith(' ')):
                            parts.append(' ')
                        parts.append(it['text'])
                else:
                    if prev is not None and (gap > 2.2 or (was_sup and it['text'].isalpha())):
                        if not (parts and parts[-1].endswith(' ')):
                            parts.append('  ' if gap > 10 else ' ')
                    parts.append(it['text'])
            else:
                flush_sup()
                gap = it['x0'] - prev['x1'] if prev else 0
                if prev is not None:
                    if prev['kind'] == 'char' and prev['text'] == '(':
                        pass
                    elif prev['kind'] == 'char' and prev['text'].isdigit() and gap < 6:
                        if not (parts and parts[-1].endswith(' ')):
                            parts.append(' ')
                    elif gap > 10:
                        parts.append('  ')
                    elif gap > 2.0 or prev['kind'] == 'frac':
                        if not (parts and parts[-1].endswith(' ')):
                            parts.append(' ')
                parts.append(it['text'])
            prev = it
        flush_sup()
        line_str = fix_thai_artifacts(''.join(parts)).strip()
        if line_str:
            out_lines.append({
                'text': line_str,
                'has_trailing_space': had_trailing_space,
                'x0': round(line_x0, 1),
                'x1': round(line_x1, 1),
                'y_mid': round(ln['y_mid'], 1),
                'has_frac': ln['has_frac'],
            })
    return out_lines


def render_table_html(tbl, title=None):
    cleaned_rows = []
    for row in tbl:
        cleaned_rows.append([fix_thai_artifacts(normalize_math_unicode((c or '').replace('\n', ' ').strip())) for c in row])
    has_2row_hdr = len(cleaned_rows) >= 3 and any(c is None for c in tbl[0]) and any(c is None for c in tbl[1])
    html = []
    if title:
        html.append(f'<p><strong>{title}</strong></p>')
    html.append('<table style="width:100%; border-collapse:collapse; margin:12px 0; font-size:0.92rem; border:1px solid rgba(255,255,255,0.3);">')
    html.append('<thead>')
    if has_2row_hdr:
        r0, r1 = tbl[0], tbl[1]
        html.append('<tr style="background:rgba(255,255,255,0.18); border-bottom:1px solid rgba(255,255,255,0.3); text-align:center;">')
        c_idx = 0
        while c_idx < len(r0):
            val = fix_thai_artifacts((r0[c_idx] or '').replace('\n', ' ').strip())
            span = 1
            while c_idx + span < len(r0) and r0[c_idx + span] is None:
                span += 1
            if span == 1 and r1[c_idx] is None:
                html.append(f'<th rowspan="2" style="padding:6px; border:1px solid rgba(255,255,255,0.2);">{val}</th>')
            else:
                cs_attr = f' colspan="{span}"' if span > 1 else ''
                html.append(f'<th{cs_attr} style="padding:6px; border:1px solid rgba(255,255,255,0.2);">{val}</th>')
            c_idx += span
        html.append('</tr><tr style="background:rgba(255,255,255,0.14); border-bottom:2px solid rgba(255,255,255,0.4); text-align:center;">')
        for raw_c in r1:
            if raw_c is None:
                continue
            val = fix_thai_artifacts(raw_c.replace('\n', ' ').strip())
            html.append(f'<th style="padding:6px; border:1px solid rgba(255,255,255,0.2);">{val}</th>')
        html.append('</tr>')
        body_rows = cleaned_rows[2:]
    else:
        html.append('<tr style="background:rgba(255,255,255,0.18); border-bottom:2px solid rgba(255,255,255,0.4); text-align:center;">')
        for val in cleaned_rows[0]:
            html.append(f'<th style="padding:6px; border:1px solid rgba(255,255,255,0.2);">{val}</th>')
        html.append('</tr>')
        body_rows = cleaned_rows[1:]
    html.append('</thead><tbody>')
    for r in body_rows:
        html.append('<tr style="text-align:center;">')
        for ci, val in enumerate(r):
            cell_txt = val if val else '-'
            align = 'text-align:left; padding:5px 8px;' if ci == 0 else 'padding:5px;'
            html.append(f'<td style="{align} border:1px solid rgba(255,255,255,0.15);">{cell_txt}</td>')
        html.append('</tr>')
    html.append('</tbody></table>')
    return ''.join(html)


def extract_pdf_data(pdf_path, is_sol=False):
    pages_lines = []
    tables_by_page = {}
    with pdfplumber.open(pdf_path) as pdf:
        for pi, page in enumerate(pdf.pages):
            ignore_char_bboxes = []
            ignore_bar_bboxes = []
            if len(page.rects) >= 6 or len(page.lines) >= 6:
                found_tbls = page.find_tables()
                real_tables = []
                for t in found_tbls:
                    data = t.extract()
                    if data and len(data[0]) >= 2:
                        real_tables.append((list(t.bbox), data))
                        ignore_bar_bboxes.append(t.bbox)
                        if not is_sol:
                            ignore_char_bboxes.append(t.bbox)
                if real_tables and not is_sol:
                    tables_by_page[pi + 1] = real_tables
            lines = extract_page_lines_with_meta(page, ignore_char_bboxes=ignore_char_bboxes, ignore_bar_bboxes=ignore_bar_bboxes)
            for ln in lines:
                ln['page'] = pi + 1
            pages_lines.extend(lines)
    return pages_lines, tables_by_page


def load_all_pdfs(use_cache=True):
    if use_cache and os.path.exists(CACHE_PATH):
        return json.load(open(CACHE_PATH, encoding='utf-8'))
    cache = {}
    for y, s in SETS:
        tag = f'{y}_{s}'
        print(f'Extracting {tag}...', flush=True)
        qp = os.path.join(Q_DIR, f'ข้อสอบ ก.พ. {y} {s} - GO ราชการ.pdf')
        sp = os.path.join(S_DIR, f'เฉลยข้อสอบ ก.พ. {y} {s} - GO ราชการ.pdf')
        qlines, qtbls = extract_pdf_data(qp, is_sol=False)
        slines, _ = extract_pdf_data(sp, is_sol=True)
        cache[tag] = {
            'q_lines': qlines,
            'q_tables': {str(k): v for k, v in qtbls.items()},
            's_lines': slines,
        }
    os.makedirs(os.path.dirname(CACHE_PATH), exist_ok=True)
    with open(CACHE_PATH, 'w', encoding='utf-8') as f:
        json.dump(cache, f, ensure_ascii=False)
    return cache


def is_header_or_noise(text: str) -> bool:
    s = text.strip()
    if not s:
        return True
    if 'GO! ราชการ' in s and 'สงวนลิขสิทธิ์' in s:
        return True
    if re.match(r'^(?:เฉลย)?ข้อสอบ\s*ก\.?พ\.?', s):
        return True
    return False


def split_sections(lines, default_first_cat='ความสามารถในการคิดวิเคราะห์'):
    secs = []
    cur_cat = default_first_cat
    cur = []
    started = False
    for ln in lines:
        s = ln['text'].strip()
        if is_header_or_noise(s):
            continue
        m_cat = re.match(r'^(?:วิชา)?(ความสามารถในการคิดวิเคราะห์|ภาษาอังกฤษ|ความรู้และลักษณะการเป็นข้าราชการที่ดี)\s*$', s)
        if m_cat:
            if started and cur:
                secs.append((cur_cat, cur))
            cur_cat = m_cat.group(1)
            cur = []
            started = True
        else:
            started = True
            cur.append(ln)
    if cur:
        secs.append((cur_cat, cur))
    return secs


def is_context_start_line(s: str) -> bool:
    if re.match(r'^(?:จากเงื่อนไข|จากข้อมูลในตาราง|จากตาราง|จากบทความต่อไปนี้|จงอ่านบทสนทนาต่อไปนี้|หลักในการทำคำตอบ|Directions|Reading\s*\d+|Select the most appropriate)', s, re.I):
        return True
    if re.search(r'(?:จงตอบคำถามข้อ|ตอบคำถามข้อ|for each item\.)\s*\(?\d+\s*[-–]\s*\d+', s, re.I):
        return True
    return False


def join_wrapped_lines(line_objs, is_choice=False):
    if not line_objs:
        return ''
    if isinstance(line_objs[0], str):
        return ' '.join(x.strip() for x in line_objs if x.strip())

    def should_join(prev, nxt):
        pt = prev['text'].strip()
        nt = nxt['text'].strip()
        if is_choice:
            return True
        if nt.startswith('- ') or nt.startswith('ข้อสรุปที่') or nt.startswith('ทุกตัวอักษร') or nt.startswith('ชุดที่'):
            return False
        if re.match(r'^(?:[A-Za-z][A-Za-z.\s]{0,12}|[ก-ฮ]{1,10})\s*:\s*', nt):
            return False
        if re.match(r'^\d+\)\s', nt):
            return False
        if re.match(r'^(?:Reading\s*\d+|Dear\s|Sincerely,|To\s|From\s|Subj\s)', nt):
            return False
        if re.match(r'^(?:Reading\s*\d+|Dear\s|Sincerely,|To\s|From\s|Subj\s|October\s|Max,)', pt):
            return False
        if pt.startswith('จากเงื่อนไข') or pt.startswith('จากตาราง') or pt.startswith('จากบทความ') or pt.startswith('จงอ่านบทสนทนา') or pt.startswith('Select the most'):
            return False
        if pt.startswith('ทุกตัวอักษร') or pt.startswith('ข้อสรุปที่') or pt.startswith('ชุดที่'):
            return False
        if re.search(r'\d+\s*\*\s*\d+\s*=', pt) or re.search(r'\d+\s*\*\s*\d+\s*=', nt):
            return False
        if prev['has_frac'] or nxt['has_frac']:
            if not (is_thai_char(pt[-1]) or is_thai_char(nt[0])):
                return False
        if re.search(r'[<>=≤≥≠]', pt) and not re.search(r'[\u0E00-\u0E7F]{4,}', pt):
            return False
        if prev['x1'] < 420 and (pt.endswith('.') or pt.endswith('?') or pt.startswith('- ') or nxt['x0'] > 65):
            return False
        if prev['x1'] >= 410 or (is_thai_char(pt[-1]) and is_thai_char(nt[0]) and not pt.endswith('?') and not pt.endswith(':')):
            return True
        return False

    out = [line_objs[0]['text'].strip()]
    prev = line_objs[0]
    for nxt in line_objs[1:]:
        nt = nxt['text'].strip()
        if not nt:
            continue
        if should_join(prev, nxt):
            pt = out[-1]
            last_ch = pt[-1]
            first_ch = nt[0]
            if is_thai_char(last_ch) and is_thai_char(first_ch):
                if prev['has_trailing_space'] and not is_choice:
                    sep = ' '
                elif is_choice and prev['has_trailing_space'] and re.search(r'(?:บาท|คน|ปี|วัน|เดือน|ครั้ง|ข้อ|เรื่อง)\s*$', pt):
                    sep = ' '
                else:
                    sep = ''
            else:
                sep = ' '
            out[-1] = pt + sep + nt
        else:
            out.append(nt)
        prev = nxt
    return '\n'.join(out)


def parse_choices_from_lines(choice_line_objs, year, set_name, cat, q_num):
    raw_lines = []
    for ln in choice_line_objs:
        t = ln['text'].strip()
        if year == '2566' and set_name == 'e-Exam1' and cat == 'ความรู้และลักษณะการเป็นข้าราชการที่ดี' and q_num == 15 and t.startswith('1 '):
            t = '1. ' + t[2:]
        raw_lines.append({**ln, 'text': t})

    segments = []
    for ln in raw_lines:
        t = ln['text']
        # Match 1..4 followed by . (even if space before . like "2 .ดำรงตน" or missing space after . like "3.ระลึก"),
        # while avoiding math sequence numbers ending before ellipsis like "1 . . . ."
        matches = list(re.finditer(r'(?:^|\s)([1-4])\s*\.(?!\d|\s*\.\s*\.)\s*', t))
        valid_matches = []
        for m in matches:
            before = t[:m.start()].rstrip()
            # Guard against legal citations ("มาตรา 3") or numbered items ("ข้อ 1", "ข้อ 2") unless preceded by digit ("ถูกทั้ง 2 ข้อ")
            if before:
                if re.search(r'(?:มาตรา|วรรค|ลำดับที่|อันดับที่|กลุ่มที่)\s*$', before) and not re.search(r':\s*มาตรา\s*$', before):
                    continue
                if re.search(r'(?<!\d\s)ข้อ\s*$', before):
                    continue
                if re.search(r'(?:ข้อ|ลำดับที่|อันดับที่|กลุ่มที่|วรรค|มาตรา)\s*[1-4]\.?\s*(?:และ|หรือ|กับ|,)\s*$', before):
                    continue
            valid_matches.append(m)

        if not valid_matches:
            segments.append((None, ln))
        else:
            if valid_matches[0].start() > 0:
                pre = t[:valid_matches[0].start()].strip()
                if pre:
                    segments.append((None, {**ln, 'text': pre}))
            for mi, m in enumerate(valid_matches):
                end_pos = valid_matches[mi + 1].start() if mi + 1 < len(valid_matches) else len(t)
                seg_txt = t[m.end():end_pos].strip()
                lbl = int(m.group(1))
                segments.append((lbl, {**ln, 'text': seg_txt}))

    stem_objs = []
    buckets = []
    for lbl, lobj in segments:
        if lbl is not None and ((not buckets and lbl == 1) or buckets):
            buckets.append([lbl, [lobj]])
        elif not buckets:
            stem_objs.append(lobj)
        else:
            buckets[-1][1].append(lobj)

    if len(buckets) == 4:
        choices = [join_wrapped_lines(b[1], is_choice=True).strip() for b in buckets]
        return stem_objs, choices
    return choice_line_objs, []


def format_math_sequence_stem(stem: str) -> str:
    # Normalize spaced ellipses ". . . ." -> "...." for clean sequence & cloze display
    if re.search(r'(?:\.\s*){2,}\.', stem):
        stem = re.sub(r'(?:\.\s*){2,}\.', '....', stem)
        stem = re.sub(r'(\S)\.\.\.\.', r'\1 ....', stem)
        stem = re.sub(r'\.\.\.\.(?=[^\s\.,?!:;\)\]])', '.... ', stem)
        stem = re.sub(r'\.\.\.\.:', '.... :', stem)
        stem = re.sub(r'\s{3,}', '  ', stem).strip()
        if '/' in stem and '  ' in stem and stem.endswith(' ....') and not stem.endswith('  ....'):
            stem = stem[:-5] + '  ....'
    return stem


def clean_conversation_labels(ctx_txt: str, year: str, set_name: str) -> str:
    # In 2566_รอบพิเศษ English dialogue, PDF omitted speaker names on continuation lines starting with ":"
    if year == '2566' and set_name == 'รอบพิเศษ' and 'Dr. Jo' in ctx_txt:
        lines = []
        last_spk = ''
        for ln in ctx_txt.splitlines():
            st = ln.strip()
            if st.startswith('Dr. Jo'):
                last_spk = 'Dr. Jo'
                lines.append(st)
            elif st.startswith('Vicki'):
                last_spk = 'Vicki'
                lines.append(st)
            elif st.startswith(':') and last_spk:
                lines.append(f'{last_spk} {st}')
            else:
                lines.append(st)
        return '\n'.join(lines)
    return ctx_txt


def parse_questions_in_section(year, set_name, cat, lines, tables_by_page):
    attached_tables = set()
    q_items = []
    gap_lines = []
    in_gap = False
    cur_q = None
    cur_q_lines = []
    choices_seen = 0
    contexts = []

    def get_page_tables_for_pages(pnums):
        htmls = []
        for pn in sorted(set(pnums)):
            if str(pn) in tables_by_page and pn not in attached_tables:
                for _, tbl in tables_by_page[str(pn)]:
                    htmls.append(render_table_html(tbl))
                attached_tables.add(pn)
        return htmls

    def flush_cur_q():
        nonlocal cur_q, cur_q_lines, choices_seen
        if cur_q is not None:
            q_items.append({'q_num': cur_q, 'lines': cur_q_lines})
        cur_q = None
        cur_q_lines = []
        choices_seen = 0

    def flush_gap_to_ctx(next_q):
        nonlocal gap_lines
        if not gap_lines:
            return
        pnums = [x['page'] for x in gap_lines]
        tbl_htmls = get_page_tables_for_pages(pnums)
        ctx_txt = join_wrapped_lines(gap_lines, is_choice=False).strip()
        ctx_txt = clean_conversation_labels(ctx_txt, year, set_name)
        if tbl_htmls:
            ctx_txt = (ctx_txt + '\n\n' + '\n\n'.join(tbl_htmls)).strip()
        gap_lines = []
        if not ctx_txt:
            return
        m_rng = re.search(r'(?:จงตอบคำถามข้อ|ตอบคำถามข้อ|item\.)\s*\(?(\d+)\s*[-–]\s*(\d+)\)?', ctx_txt, re.I)
        if m_rng:
            rng = (int(m_rng.group(1)), int(m_rng.group(2)))
        elif re.search(r'จงตอบคำถามข้อ\s*(\d+)\b', ctx_txt):
            n_single = int(re.search(r'จงตอบคำถามข้อ\s*(\d+)\b', ctx_txt).group(1))
            rng = (n_single, n_single)
        else:
            blanks = [int(m.group(1)) for m in re.finditer(r'\((\d+)\)', ctx_txt)]
            if blanks and min(blanks) == next_q:
                rng = (min(blanks), max(blanks))
            else:
                rng = (next_q, None)
        contexts.append({'text': ctx_txt, 'start': rng[0], 'end': rng[1]})

    i = 0
    while i < len(lines):
        ln = lines[i]
        s = ln['text'].strip()

        if is_context_start_line(s):
            flush_cur_q()
            in_gap = True
            gap_lines.append(ln)
            i += 1
            continue

        m_dot = re.match(r'^(\d+)\.(?!\d)\s*(.*)', s)
        if not m_dot and year == '2566' and set_name == 'e-Exam1' and cat == 'ความรู้และลักษณะการเป็นข้าราชการที่ดี' and cur_q == 15 and s.startswith('1 '):
            m_dot = re.match(r'^(1)\s+(.*)', s)

        if m_dot:
            raw_num = int(m_dot.group(1))
            rest = m_dot.group(2).strip()
            if cur_q is not None and (year, set_name, cat, cur_q, raw_num) in Q_NUM_TYPOS:
                num = Q_NUM_TYPOS[(year, set_name, cat, cur_q, raw_num)]
                is_new_q = True
                is_choice = False
            else:
                num = raw_num
                is_new_q = False
                is_choice = False

                if cur_q is None:
                    if num == 1 or (gap_lines and num <= 120):
                        is_new_q = True
                elif in_gap:
                    is_new_q = True
                elif cur_q in (1, 2, 3, 4):
                    if choices_seen == 0:
                        if num == 1:
                            is_choice = True
                        elif num == cur_q + 1:
                            is_new_q = True
                    else:
                        if num in (2, 3, 4) and choices_seen < 4 and num != cur_q + 1:
                            is_choice = True
                        elif num in (2, 3, 4) and choices_seen < 4 and num == cur_q + 1:
                            is_choice = True
                        elif num == cur_q + 1 and choices_seen >= 4:
                            is_new_q = True
                        elif num > cur_q + 1:
                            is_new_q = True
                else:
                    if num == cur_q + 1:
                        is_new_q = True
                    elif num in (1, 2, 3, 4):
                        if choices_seen < 4:
                            is_choice = True
                    elif cur_q < num <= cur_q + 3:
                        is_new_q = True

            if is_new_q:
                in_gap = False
                flush_cur_q()
                flush_gap_to_ctx(num)
                cur_q = num
                m_dbl = re.match(r'^1\.\s*(.*)', rest)
                if m_dbl and num in (1, 2, 3, 4) and re.search(r'^1\.\s+\S', rest):
                    cur_q_lines = [{**ln, 'text': rest}]
                    choices_seen = 1
                else:
                    cur_q_lines = [{**ln, 'text': rest}] if rest else []
                    choices_seen = 0
                inline_c = re.findall(r'(?:^|\s)([1-4])\s*\.(?!\d|\s*\.\s*\.)\s*', cur_q_lines[-1]['text'] if cur_q_lines else '')
                if inline_c and inline_c[0] == '1':
                    choices_seen = max(choices_seen, len(inline_c))
            elif is_choice:
                inline_c = re.findall(r'(?:^|\s)([1-4])\s*\.(?!\d|\s*\.\s*\.)\s*', s)
                choices_seen += max(1, len(inline_c))
                cur_q_lines.append(ln)
            else:
                if in_gap or cur_q is None:
                    gap_lines.append(ln)
                else:
                    cur_q_lines.append(ln)
        else:
            if in_gap or cur_q is None:
                gap_lines.append(ln)
            else:
                cur_q_lines.append(ln)
        i += 1

    flush_cur_q()

    for ci in range(len(contexts)):
        if contexts[ci]['end'] is None:
            if ci + 1 < len(contexts):
                contexts[ci]['end'] = contexts[ci + 1]['start'] - 1
            else:
                contexts[ci]['end'] = 9999

    parsed = []
    for item in q_items:
        qn = item['q_num']
        stem_objs, choices = parse_choices_from_lines(item['lines'], year, set_name, cat, qn)
        stem = join_wrapped_lines(stem_objs, is_choice=False).strip()
        stem = format_math_sequence_stem(stem)

        # Clean up 2566_e-Exam1 Q42 triangle ASCII fragments and attach clean SVG + text spec
        if year == '2566' and set_name == 'e-Exam1' and cat == 'ความสามารถในการคิดวิเคราะห์' and qn == 42:
            stem = f"จากภาพ จงหาความยาวของ BD\n\n{Q42_2566_E1_DIAGRAM}"

        # Replace "-" placeholder choice in 2566_e-Exam3 English Q7
        if year == '2566' and set_name == 'e-Exam3' and cat == 'ภาษาอังกฤษ' and qn == 7 and len(choices) == 4 and choices[3] == '-':
            choices[3] = 'invitation'

        if not choices and ('ข้อสรุปที่ 1' in stem or 'ข้อสรุปที่ 2' in stem):
            choices = [
                'ข้อสรุปทั้งสองเป็นจริง',
                'ข้อสรุปทั้งสองไม่เป็นจริง',
                'ข้อสรุปทั้งสองไม่สามารถสรุปได้แน่ชัด',
                'ข้อสรุปทั้งสองมีผลต่างกัน',
            ]

        ctx_to_apply = ''
        for ctx in contexts:
            if ctx['start'] <= qn <= ctx['end']:
                ctx_to_apply = ctx['text']
        if ctx_to_apply:
            if stem:
                full_q = f"{ctx_to_apply}\n\n{stem}"
            else:
                full_q = f"{ctx_to_apply}\n\nจงเลือกคำตอบที่เหมาะสมที่สุดสำหรับข้อ {qn}"
        else:
            full_q = stem

        parsed.append({
            'q_num': qn,
            'cat': cat,
            'question_text': full_q,
            'choices': choices,
        })
    return parsed, contexts


def parse_solutions_in_section(year, set_name, cat, lines):
    sols = {}
    cur_s = None
    cur_lines = []
    for ln in lines:
        s = ln['text'].strip()
        m = re.match(r'^(\d+)[\.\)](?!\d)\s*(.*)', s)
        if m:
            num = int(m.group(1))
            rest = m.group(2).strip()
            has_ans_kw = bool(re.search(r'(?:ตอบ|ข้อสรุปที่|กรณีที่|สามารถ|วิธีคิด|คำอธิบาย)', rest))
            is_next = False
            # Guard against choice-breakdown lines like "1. สำนัก... 2. กระทรวง..." inside Q1..Q4 explanations
            if num in (1, 2, 3, 4) and not has_ans_kw and m.group(0).startswith(f'{num}.'):
                if cur_s is not None:
                    is_next = False
                elif num == 1:
                    is_next = True
            elif cur_s is None:
                if num in (1, 2, 3):
                    is_next = True
            else:
                if num == cur_s + 1:
                    is_next = True
                elif cur_s < num <= cur_s + 5 and (has_ans_kw or len(rest) > 0):
                    is_next = True
                elif year == '2566' and set_name == 'Paper' and cat == 'ความสามารถในการคิดวิเคราะห์' and cur_s == 49 and num == 40:
                    num = 50
                    is_next = True

            if is_next:
                if cur_s is not None:
                    sols[cur_s] = '\n'.join(cur_lines).strip()
                cur_s = num
                cur_lines = [s]
                continue
        if cur_s is not None:
            cur_lines.append(s)
    if cur_s is not None:
        sols[cur_s] = '\n'.join(cur_lines).strip()

    if year == '2565' and set_name == 'Paper' and cat == 'ความสามารถในการคิดวิเคราะห์':
        if 69 in sols and 'การติดตั้งระบบไฟฟ้า' in sols[69]:
            p = sols[69].find('การติดตั้งระบบไฟฟ้า')
            p10 = sols[69].rfind('10. ตอบ', 0, p)
            if p10 != -1:
                sols[70] = '70. ตอบ' + sols[69][p10 + 7:].strip()
                sols[69] = sols[69][:p10].strip()
    if year == '2566' and set_name == 'e-Exam3' and cat == 'ความสามารถในการคิดวิเคราะห์':
        if 82 in sols and 93 not in sols:
            sols[93] = re.sub(r'^82\.', '93.', sols[82])
    if year == '2565' and set_name == 'e-Exam2' and cat == 'ความสามารถในการคิดวิเคราะห์':
        if 53 in sols and 'จากเงื่อนไขข้อ 54' in sols[53]:
            sols[53] = sols[53].split('จากเงื่อนไขข้อ 54')[0].strip()

    # Split trailing shared condition/table setup notes ("จากเงื่อนไข... ข้อ X - Y ...") out of sols[prev]
    # and propagate them onto each solution in [X..Y]
    shared_s_notes = []
    for k in sorted(sols.keys()):
        s_lines = sols[k].splitlines()
        split_idx = None
        rng = None
        for li, sl in enumerate(s_lines):
            if li == 0:
                continue
            m_sh = re.match(r'^จากเงื่อนไข.*?(?:ข้อ|คำถาม)\s*(\d+)\s*[-–]\s*(\d+)', sl.strip())
            if m_sh:
                split_idx = li
                rng = (int(m_sh.group(1)), int(m_sh.group(2)))
                break
        if split_idx is not None and rng is not None:
            note_txt = '\n'.join(s_lines[split_idx:]).strip()
            sols[k] = '\n'.join(s_lines[:split_idx]).strip()
            if note_txt:
                shared_s_notes.append((rng[0], rng[1], note_txt))

    for st, en, note_txt in shared_s_notes:
        for qn in range(st, en + 1):
            if qn in sols and note_txt not in sols[qn]:
                sols[qn] = f"{sols[qn]}\n\n{note_txt}"

    return sols


def evaluate_condition_answer(s_body: str) -> str:
    m1 = re.search(r'ข้อสรุปที่\s*1[\s\S]{0,200}?(ไม่แน่ชัด|ไม่เป็นจริง|เป็นเท็จ|เท็จ|เป็นจริง|จริง)', s_body)
    m2 = re.search(r'ข้อสรุปที่\s*2[\s\S]{0,200}?(ไม่แน่ชัด|ไม่เป็นจริง|เป็นเท็จ|เท็จ|เป็นจริง|จริง)', s_body)
    if m1 and m2:
        def norm(w):
            if 'ไม่แน่' in w:
                return 'U'
            if 'เท็จ' in w or 'ไม่เป็นจริง' in w:
                return 'F'
            return 'T'
        a1, a2 = norm(m1.group(1)), norm(m2.group(1))
        if a1 == 'T' and a2 == 'T':
            return '1'
        if a1 == 'F' and a2 == 'F':
            return '2'
        if a1 == 'U' and a2 == 'U':
            return '3'
        return '4'
    return ''


def resolve_answer(s_body: str, choices: list, year='', set_name='', cat='', q_num=0):
    if not s_body:
        return ''
    # Specific verified answer-key overrides for multi-interpretation / typoed headers in source PDF
    if year == '2565' and set_name == 'Paper' and cat == 'ความสามารถในการคิดวิเคราะห์':
        if q_num == 1:
            return 'VALUE:-64'
        if q_num == 14:
            return '3'
        if q_num == 62:
            return '1'
    if year == '2565' and set_name == 'e-Exam2' and cat == 'ความสามารถในการคิดวิเคราะห์':
        if q_num in (42, 58):
            return '3'  # Single conclusion in PDF rated "ไม่แน่ชัด"
        if q_num == 53:
            return 'SPECIAL:CAFE_DIAGRAM'
        if q_num == 68:
            return '1'
    if year == '2566' and set_name == 'e-Exam1' and cat == 'ความสามารถในการคิดวิเคราะห์':
        if q_num == 33:
            return 'VALUE:1'
        if q_num == 50:
            return 'VALUE:51,511.25 บาท'
        if q_num == 94:
            return '1'
        if q_num == 95:
            return '2'

    m = re.search(r'ตอบ\s*([1-4])\s*\)', s_body)
    if m:
        return m.group(1)

    m_d = re.search(r'ตอบ\s*([1-4])(?:\s|$)', s_body.splitlines()[0])
    if m_d and choices and len(choices) == 4:
        cand_idx = m_d.group(1)
        matched = [str(ci) for ci, ch in enumerate(choices, 1) if ch.strip() == cand_idx]
        if matched:
            return matched[0]
        return cand_idx

    if 'ข้อสรุปที่ 1' in s_body and 'ข้อสรุปที่ 2' in s_body:
        ev = evaluate_condition_answer(s_body)
        if ev:
            return ev

    first_ln = s_body.splitlines()[0]
    m_val = re.search(r'ตอบ\s+(.+)$', first_ln)
    if m_val:
        val = m_val.group(1).strip()
        if choices:
            for ci, ch in enumerate(choices, 1):
                c_clean = ch.strip()
                if c_clean and (c_clean == val or val.startswith(c_clean) or c_clean in val):
                    return str(ci)
        return f'VALUE:{val}'
    return ''


def build_choices_for_missing(val_str: str, q_id: str):
    """Build 4 distinct, realistic choices containing exact verified val_str, returning (choices, correct_idx_str)."""
    h = int(hashlib.md5(q_id.encode('utf-8')).hexdigest(), 16)
    target_idx = (h % 4)  # 0..3

    if val_str == 'SPECIAL:CAFE_DIAGRAM':
        correct = 'โต๊ะ 1: กาแฟ (สงขลา, ติวเตอร์/นักเขียน) คู่ ชาเขียว (เชียงใหม่/กระบี่, นางแบบ) | โต๊ะ 2: โกโก้ (นนทบุรี, ดีเจ) คู่ ชาเย็น (เชียงใหม่/กระบี่, ติวเตอร์/นักเขียน) | โต๊ะ 3: มอคค่า (นนทบุรี, โปรแกรมเมอร์)'
        d1 = 'โต๊ะ 1: กาแฟ (สงขลา, นางแบบ) คู่ ชาเขียว (กระบี่, ดีเจ) | โต๊ะ 2: โกโก้ (นนทบุรี, ติวเตอร์) คู่ ชาเย็น (เชียงใหม่, นักเขียน) | โต๊ะ 3: มอคค่า (สงขลา, โปรแกรมเมอร์)'
        d2 = 'โต๊ะ 1: กาแฟ (สงขลา, ติวเตอร์) คู่ ชาเขียว (เชียงใหม่, นางแบบ) | โต๊ะ 2: โกโก้ (กระบี่, ดีเจ) คู่ ชาเย็น (นนทบุรี, นักเขียน) | โต๊ะ 3: มอคค่า (กระบี่, โปรแกรมเมอร์)'
        d3 = 'โต๊ะ 1: กาแฟ (นนทบุรี, นักเขียน) คู่ ชาเขียว (สงขลา, นางแบบ) | โต๊ะ 2: โกโก้ (เชียงใหม่, ดีเจ) คู่ ชาเย็น (กระบี่, ติวเตอร์) | โต๊ะ 3: มอคค่า (เชียงใหม่, โปรแกรมเมอร์)'
        arr = [d1, d2, d3]
        arr.insert(target_idx, correct)
        return arr, str(target_idx + 1)

    # Special compound strings
    special_map = {
        'ดำอายุ 30 ปี, แดงอายุ 70 ปี': [
            'ดำอายุ 25 ปี, แดงอายุ 65 ปี',
            'ดำอายุ 28 ปี, แดงอายุ 68 ปี',
            'ดำอายุ 32 ปี, แดงอายุ 72 ปี',
        ],
        '34 ปี 1 เดือน': ['33 ปี 7 เดือน', '34 ปี 6 เดือน', '35 ปี 2 เดือน'],
        'เพิ่มขึ้น 1 หน่วย': ['ลดลง 1 หน่วย', 'เพิ่มขึ้น 2 หน่วย', 'เท่าเดิม'],
        'เพิ่มขึ้น 0.5': ['เพิ่มขึ้น 1.0', 'ลดลง 0.5', 'เท่าเดิม'],
    }
    if val_str in special_map:
        arr = list(special_map[val_str])
        arr.insert(target_idx, val_str)
        return arr, str(target_idx + 1)

    # Fraction a/b
    m_frac = re.match(r'^(-?\d+)/(\d+)$', val_str)
    if m_frac:
        num = int(m_frac.group(1))
        den = int(m_frac.group(2))
        true_val = Fraction(num, den)
        cands = []
        deltas = [(-2, -2), (-1, -1), (1, 0), (2, 2), (-1, 2), (3, -2), (4, 4), (-3, -1), (2, 1), (-1, 1)]
        for dn, dd in deltas:
            nn, nd = num + dn, max(2, den + dd)
            if nd > 0 and Fraction(nn, nd) != true_val and (math.gcd(abs(nn), nd) == 1 or math.gcd(abs(num), den) > 1):
                s = f'{nn}/{nd}'
                if s not in cands and s != val_str:
                    cands.append(s)
            if len(cands) == 3:
                break
        arr = cands[:3]
        arr.insert(target_idx, val_str)
        return arr, str(target_idx + 1)

    # Numeric value with optional commas, decimals, and trailing unit
    m_num = re.match(r'^(-?[\d,]+(?:\.\d+)?)(.*)$', val_str.strip())
    if m_num:
        raw_num = m_num.group(1)
        unit = m_num.group(2)
        has_comma = ',' in raw_num
        num_clean = raw_num.replace(',', '')
        is_float = '.' in num_clean
        dec_places = len(num_clean.split('.')[1]) if is_float else 0
        val = float(num_clean) if is_float else int(num_clean)

        # Choose natural step size based on magnitude
        abs_v = abs(val)
        if abs_v == 0:
            steps = [-2, 2, 4, -4, 6]
        elif is_float and abs_v > 1000:
            steps = [-511.25, 488.75, 988.75, -11.25, 250.0]
        elif is_float:
            steps = [-1.5, 1.5, 2.5, -2.5, 3.0]
        elif abs_v <= 10:
            steps = [-2, 2, 3, -1, 4, 5]
        elif abs_v <= 50:
            steps = [-4, 4, 8, -2, 6, 10]
        elif abs_v <= 200:
            steps = [-8, 6, 12, -4, 10, 16]
        elif abs_v <= 1000:
            steps = [-20, 15, 30, -10, 25, 40]
        elif abs_v <= 10000:
            steps = [-100, 100, 200, -50, 150, 300]
        else:
            steps = [-5000, 5000, 10000, -2500, 15000, 25000]

        if q_id == '2565_Paper_001':
            # -64: include 64, -32, 128 as realistic distractors
            dists = ['64', '-32', '128']
        else:
            dists = []
            for st in steps:
                nv = val + st
                # Preserve sign positivity for word problems with units unless original was negative
                if val > 0 and nv <= 0 and unit:
                    continue
                if q_id == '2566_e-Exam1_033' and nv == -11:
                    continue
                if is_float:
                    fmt = f'{nv:,.{dec_places}f}' if has_comma else f'{nv:.{dec_places}f}'
                else:
                    nv_int = int(round(nv))
                    fmt = f'{nv_int:,}' if has_comma else str(nv_int)
                cand = f'{fmt}{unit}'
                if cand != val_str and cand not in dists:
                    dists.append(cand)
                if len(dists) == 3:
                    break
            # Fallback if still < 3
            k = 1
            while len(dists) < 3:
                nv = val + k * (5 if not is_float else 1.0)
                fmt = f'{int(round(nv)):,}' if (has_comma and not is_float) else (f'{nv:.{dec_places}f}' if is_float else str(int(round(nv))))
                cand = f'{fmt}{unit}'
                if cand != val_str and cand not in dists:
                    dists.append(cand)
                k += 1

        arr = dists[:3]
        arr.insert(target_idx, val_str)
        return arr, str(target_idx + 1)

    raise ValueError(f'Cannot synthesize distractors for {q_id}: {val_str!r}')


def determine_catalogs(cat: str, q_text: str, exp_text: str) -> str:
    # Only strip real HTML tags (never math inequalities like "A < B ... C > D")
    plain_q = re.sub(r'</?(?:table|thead|tbody|tr|th|td|svg|polygon|line|text|p|strong|br)\b[^>]*>', ' ', q_text)
    text = (plain_q + ' ' + exp_text).lower()
    if cat == 'ภาษาอังกฤษ':
        if any(w in text for w in ['conversation', 'situation', 'appointment', 'dialogue', 'greeting', 'a :', 'b :', 'waiter', 'customer', 'dr. jo', 'vicki', 'somsak']):
            return json.dumps(['บทสนทนา'], ensure_ascii=False)
        if any(w in text for w in ['passage', 'reading', 'letter', 'article', 'paragraph', 'author', 'according to', 'e-mails', 'barn owls', 'skin diseases']):
            return json.dumps(['Reading'], ensure_ascii=False)
        if any(w in text for w in ['meaning', 'synonym', 'antonym', 'definition', 'closest in meaning', 'vocabulary', 'ความหมายใกล้เคียง', 'another word for']):
            return json.dumps(['Vocabulary'], ensure_ascii=False)
        return json.dumps(['Grammar'], ensure_ascii=False)

    if cat == 'ความรู้และลักษณะการเป็นข้าราชการที่ดี':
        if any(w in text for w in ['ระเบียบบริหารราชการแผ่นดิน', 'นายกรัฐมนตรี', 'กระทรวง', 'ทบวง', 'กรม', 'จังหวัด', 'อำเภอ', 'ผู้ว่าราชการ']):
            return json.dumps(['พ.ร.บ.ระเบียบบริหารราชการแผ่นดิน'], ensure_ascii=False)
        if any(w in text for w in ['บ้านเมืองที่ดี', 'กิจการบ้านเมืองที่ดี', 'ประโยชน์สุข', 'สัมฤทธิผล', 'ลดขั้นตอน', 'คุ้มค่า', 'ก.พ.ร.']):
            return json.dumps(['พ.ร.ฎ.การบริหารกิจการบ้านเมืองที่ดี'], ensure_ascii=False)
        if any(w in text for w in ['วิธีปฏิบัติราชการทางปกครอง', 'คำสั่งทางปกครอง', 'เจ้าหน้าที่', 'เพิกถอน', 'อุทธรณ์']):
            return json.dumps(['พ.ร.บ.วิธีปฏิบัติราชการทางปกครอง'], ensure_ascii=False)
        if any(w in text for w in ['ละเมิด', 'ความรับผิดทางละเมิด', 'ชดใช้ค่าสินไหม', 'จงใจหรือประมาทเลินเล่ออย่างร้ายแรง']):
            return json.dumps(['พ.ร.บ.ความรับผิดทางละเมิดของเจ้าหน้าที่'], ensure_ascii=False)
        if any(w in text for w in ['มาตรฐานทางจริยธรรม', 'องค์กรกลางทางจริยธรรม', 'ประมวลจริยธรรม', 'ก.ม.จ.']):
            return json.dumps(['พ.ร.บ.มาตรฐานทางจริยธรรม'], ensure_ascii=False)
        if any(w in text for w in ['อาญา', 'ความผิดต่อตำแหน่งหน้าที่', 'สินบน', 'ทุจริต', 'มาตรา 147', 'มาตรา 148', 'มาตรา 149', 'มาตรา 157']):
            return json.dumps(['กฎหมายอาญา (ความผิดต่อตำแหน่งหน้าที่)'], ensure_ascii=False)
        return json.dumps(['กฎหมายข้าราชการที่ดี'], ensure_ascii=False)

    # ความสามารถในการคิดวิเคราะห์
    if '<table' in q_text or any(w in plain_q for w in ['จากตาราง', 'ข้อมูลในตาราง', 'ตารางแสดงข้อมูล']):
        return json.dumps(['ตาราง'], ensure_ascii=False)
    if 'สดมภ์' in plain_q:
        return json.dumps(['คณิตศาสตร์ทั่วไป', 'สดมภ์'], ensure_ascii=False)
    if '::' in plain_q or 'อุปมาอุปไมย' in plain_q:
        return json.dumps(['อุปมาอุปไมย'], ensure_ascii=False)
    if 'ข้อสรุปที่ 1' in plain_q or 'ข้อสรุปที่ 2' in plain_q:
        if any(w in plain_q for w in ['ฝ่ายการตลาด', 'คน', 'บ้าน', 'นาย', 'เพื่อน', 'ทำงาน', 'แพทย์', 'โรงพยาบาล', 'ห้อง', 'คาเฟ่', 'โต๊ะ', 'ประกวด', 'พี่น้อง', 'ดอกไม้', 'สัตว์']):
            return json.dumps(['เงื่อนไขภาษา'], ensure_ascii=False)
        return json.dumps(['เงื่อนไขสัญลักษณ์'], ensure_ascii=False)
    if any(w in plain_q for w in ['อยู่ในลำดับที่', 'อยู่ลำดับที่', 'เป็นประโยคลำดับที่', 'เรียงลำดับประโยค', 'เรียงลำดับข้อความ', 'เรียงประโยค']):
        return json.dumps(['ภาษาไทย', 'เรียงประโยค'], ensure_ascii=False)
    if any(w in plain_q for w in ['บทความ', 'สาระสำคัญ', 'ใจความสำคัญ', 'ข้อใดสอดคล้อง', 'ข้อความข้างต้น', 'ผู้เขียน']):
        return json.dumps(['ภาษาไทย', 'บทความ'], ensure_ascii=False)
    if '*' in plain_q or 'โอเปอเรชัน' in plain_q:
        return json.dumps(['คณิตศาสตร์ทั่วไป', 'โอเปอเรชัน'], ensure_ascii=False)
    if re.search(r'\.{3,}', plain_q) and re.search(r'(?:-?\d+/\d+|-?\d+)', plain_q):
        return json.dumps(['คณิตศาสตร์ทั่วไป', 'อนุกรม'], ensure_ascii=False)
    return json.dumps(['คณิตศาสตร์ทั่วไป'], ensure_ascii=False)


def build_all_records(use_cache=True):
    cache = load_all_pdfs(use_cache=use_cache)
    all_records = []
    per_set_counts = {}

    for y, s in SETS:
        tag = f'{y}_{s}'
        data = cache[tag]
        q_secs = split_sections(data['q_lines'])
        s_secs = split_sections(data['s_lines'])
        s_map = {cat: slines for cat, slines in s_secs}

        set_rows = []
        for cat, qlines in q_secs:
            qs, _ = parse_questions_in_section(y, s, cat, qlines, data['q_tables'])
            sols = parse_solutions_in_section(y, s, cat, s_map.get(cat, []))
            for q in qs:
                qn = q['q_num']
                sb = sols.get(qn, '')
                set_rows.append((q, sb))

        for idx, (q, sb) in enumerate(set_rows, 1):
            q_id = f'{y}_{s}_{idx:03d}'
            choices = list(q['choices'])
            ans = resolve_answer(sb, choices, y, s, q['cat'], q['q_num'])

            if len(choices) != 4:
                if ans.startswith('VALUE:') or ans.startswith('SPECIAL:'):
                    raw_val = ans.split(':', 1)[1] if ans.startswith('VALUE:') else ans
                    choices, ans = build_choices_for_missing(raw_val, q_id)
                else:
                    raise ValueError(f'{q_id} missing 4 choices and ans={ans!r}')

            if ans not in ('1', '2', '3', '4'):
                raise ValueError(f'{q_id} unresolved answer: {ans!r} | choices={choices} | sb={sb[:100]!r}')

            # Clean explanation
            exp_tag = f'ข้อสอบจริง ก.พ. ปี {y} ชุด {s}'
            exp_body = sb.strip()
            if exp_body:
                exp = f'{exp_tag}\n\n{exp_body}'
            else:
                exp = f'{exp_tag}\n\nเฉลย: {ans}) {choices[int(ans) - 1]}'

            # Strip any CR characters, keep clean \n
            q_text_clean = q['question_text'].replace('\r', '').strip()
            exp_clean = exp.replace('\r', '').strip()
            choices_clean = [c.replace('\r', '').strip() for c in choices]

            all_records.append({
                'id': q_id,
                'question_text': q_text_clean,
                'choices': json.dumps(choices_clean, ensure_ascii=False),
                'correct_answer': ans,
                'explanation': exp_clean,
                'category': q['cat'],
                'subject': 'กพ ภาค ก',
                'difficulty': 0,
                'skill': CAT_TO_SKILL[q['cat']],
                'catalogs': determine_catalogs(q['cat'], q_text_clean, exp_clean),
                'exam_year': y,
                'exam_set': s,
                'is_custom': 0,
            })
        per_set_counts[(y, s)] = len(set_rows)

    return all_records, per_set_counts


def sql_str(v: str) -> str:
    return "'" + v.replace("'", "''") + "'"


def write_sql(records, out_path=OUT_SQL):
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write('-- Audited & Fixed Questions for 2565-2566 (8 sets)\n')
        for y, s in SETS:
            f.write(f"DELETE FROM questions WHERE exam_year = {sql_str(y)} AND exam_set = {sql_str(s)};\n")
        for r in records:
            vals = ', '.join([
                sql_str(r['id']),
                sql_str(r['question_text']),
                sql_str(r['choices']),
                sql_str(r['correct_answer']),
                sql_str(r['explanation']),
                sql_str(r['category']),
                sql_str(r['subject']),
                str(r['difficulty']),
                str(r['skill']) if False else sql_str(r['skill']),
                sql_str(r['catalogs']),
                sql_str(r['exam_year']),
                sql_str(r['exam_set']),
                str(r['is_custom']),
            ])
            f.write(
                'INSERT INTO questions (id, question_text, choices, correct_answer, explanation, '
                'category, subject, difficulty, skill, catalogs, exam_year, exam_set, is_custom) '
                f'VALUES ({vals});\n'
            )


def run_self_checks(records, per_set_counts, sql_path=OUT_SQL):
    print('=== PER-SET COUNTS ===')
    for (y, s), cnt in per_set_counts.items():
        print(f'  {y} / {s}: {cnt}')
    print(f'Total records: {len(records)}')

    # 1. Check unique IDs and schema format
    ids = [r['id'] for r in records]
    assert len(ids) == len(set(ids)), 'Duplicate IDs!'

    # 2. Check every row quality
    for r in records:
        assert r['correct_answer'] in ('1', '2', '3', '4'), f"Bad answer on {r['id']}: {r['correct_answer']}"
        ch = json.loads(r['choices'])
        assert isinstance(ch, list) and len(ch) == 4, f"Not 4 choices on {r['id']}"
        assert all(isinstance(x, str) and len(x.strip()) > 0 for x in ch), f"Empty choice on {r['id']}: {ch}"
        assert len(set(ch)) == 4, f"Duplicate choice text on {r['id']}: {ch}"
        assert all('\n' not in x for x in ch), f"Newline inside choice on {r['id']}: {ch}"
        assert 'GO! ราชการ' not in r['question_text'], f"Header leaked in {r['id']}"
        assert not any(0x1D400 <= ord(c) <= 0x1D7FF for c in r['question_text'] + r['choices'] + r['explanation']), f"Unicode math italic in {r['id']}"
        assert not re.search(r'[\u0E01-\u0E2E][ \t]+[\u0E48-\u0E4B]?า', r['question_text'] + ' ' + r['choices']), f"Broken Sara Am in {r['id']}"
        assert r['question_text'].strip(), f"Empty question_text on {r['id']}"
        json.loads(r['catalogs'])

    # 3. Check user-reported specific bugs
    by_id = {r['id']: r for r in records}
    q44 = by_id['2565_Paper_044']
    assert '5D > (3/2)B > E > A/2 > G/3' in q44['question_text'], f"2565_Paper_044 mismatch: {q44['question_text']}"
    assert '2H > (3/2)E' in q44['question_text'], f"2565_Paper_044 concl2 mismatch: {q44['question_text']}"
    for qid in ['2565_Paper_042', '2565_Paper_043', '2565_Paper_044', '2565_Paper_045', '2565_Paper_046']:
        assert '5D > (3/2)B > E > A/2 > G/3' in by_id[qid]['question_text'], f"Missing shared ctx on {qid}"

    q03 = by_id['2565_Paper_003']
    assert '8/15' in q03['question_text'] and '110/39' in q03['question_text'], f"2565_Paper_003 mismatch: {q03['question_text']}"
    ch03 = json.loads(q03['choices'])
    assert ch03[int(q03['correct_answer']) - 1] == '138/45', f"2565_Paper_003 wrong answer: {ch03} / {q03['correct_answer']}"

    q104 = by_id['2566_e-Exam1_104']
    ch104 = json.loads(q104['choices'])
    assert any('ติดเชื้อได้' in c for c in ch104), f"2566_e-Exam1_104 wrap not fixed: {ch104}"

    # Verify 2566_Paper table ONLY on 018..022 and NOT on English or Law
    for qid, r in by_id.items():
        if qid.startswith('2566_Paper_'):
            num = int(qid[-3:])
            if 18 <= num <= 22:
                assert '<table' in r['question_text'], f"Missing table on {qid}"
            else:
                assert '<table' not in r['question_text'], f"Leaked table on {qid}"

    # 4. Execute SQL into local in-memory SQLite matching D1 schema to verify 100% SQL validity
    conn = sqlite3.connect(':memory:')
    conn.execute('''
        CREATE TABLE questions (
            id TEXT PRIMARY KEY,
            question_text TEXT,
            choices TEXT,
            correct_answer TEXT,
            explanation TEXT,
            category TEXT,
            subject TEXT,
            difficulty INTEGER,
            is_custom INTEGER DEFAULT 0,
            host_user_id TEXT,
            created_at TEXT,
            updated_at TEXT,
            catalogs TEXT,
            skill TEXT,
            exam_year TEXT,
            exam_set TEXT
        );
    ''')
    sql_script = open(sql_path, encoding='utf-8').read()
    conn.executescript(sql_script)
    cnt_db = conn.execute('SELECT COUNT(*) FROM questions').fetchone()[0]
    assert cnt_db == len(records), f'SQLite row count mismatch: {cnt_db} != {len(records)}'
    print(f'SQLite verification PASSED ({cnt_db} rows inserted cleanly, {os.path.getsize(sql_path):,} bytes).')


if __name__ == '__main__':
    use_cache = '--rebuild-cache' not in sys.argv
    records, per_set_counts = build_all_records(use_cache=use_cache)
    write_sql(records, OUT_SQL)
    run_self_checks(records, per_set_counts, OUT_SQL)
