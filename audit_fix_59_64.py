# -*- coding: utf-8 -*-
"""audit_fix_59_64.py - Rebuild the 2559-2564 ก.พ. question bank (7 sets) from the original
GO ราชการ question + answer-key PDFs (pdfplumber geometric extraction) and emit
worker/fixed_2559_2564.sql.

Usage: python audit_fix_59_64.py
"""
import pdfplumber, os, re, unicodedata
from collections import Counter

SUP_MAP = str.maketrans('0123456789+-', '⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻')
SUB_MAP = str.maketrans('0123456789+-', '₀₁₂₃₄₅₆₇₈₉₊₋')
PUA_MAP = {'\uf0b9': '≠', '\uf0a3': '≤', '\uf0b3': '≥', '\uf0b4': '×', '\uf0b8': '÷'}
THAI_TONES = '\u0e48\u0e49\u0e4a\u0e4b'
THAI_MARKS = set('\u0e31\u0e34\u0e35\u0e36\u0e37\u0e38\u0e39\u0e3a\u0e47\u0e48\u0e49\u0e4a\u0e4b\u0e4c\u0e4d\u0e4e')

def is_thai(ch):
    return '\u0e00' <= ch <= '\u0e7f'

def norm_char(ch):
    if ch in PUA_MAP:
        return PUA_MAP[ch]
    o = ord(ch)
    if 0x1D400 <= o <= 0x1D7FF:
        return unicodedata.normalize('NFKC', ch)
    return ch

def clean_chars_in_box(raw_chars):
    chars = []
    for idx, c in enumerate(raw_chars):
        txt = norm_char(c['text'])
        chars.append({**c, 'text': txt, '_ord': idx})
    out = []
    i = 0
    n = len(chars)
    while i < n:
        c = chars[i]
        if c['text'] == ' ' and i + 1 < n:
            c2 = chars[i+1]
            if abs(c['top'] - c2['top']) < 2.5 and abs(c['x0'] - c2['x0']) < 2.5:
                if c2['text'] == 'า':
                    out.append({**c2, 'text': 'ำ', '_ord': c['_ord']})
                    i += 2
                    continue
                if c2['text'] in THAI_TONES and i + 2 < n:
                    c3 = chars[i+2]
                    if c3['text'] == 'า' and abs(c['top'] - c3['top']) < 2.5 and abs(c2['x0'] - c3['x0']) < 3.5:
                        out.append(c2)
                        out.append({**c3, 'text': 'ำ', '_ord': c['_ord']})
                        i += 3
                        continue
            if out and abs(c['top'] - out[-1]['top']) < 2.0 and abs(c['x0'] - out[-1]['x0']) < 1.5 and out[-1]['text'] in THAI_MARKS:
                i += 1
                continue
        out.append(c)
        i += 1
    return out

def format_sup(s):
    s_clean = s.strip().replace('−', '-').replace('–', '-')
    if s_clean and all(ch in '0123456789+-' for ch in s_clean):
        return s_clean.translate(SUP_MAP)
    if s_clean == 'n':
        return 'ⁿ'
    if s_clean in ('th', 'st', 'nd', 'rd', 'TH', 'ST', 'ND', 'RD'):
        return s_clean
    return f'^({s_clean})'

def format_sub(s):
    s_clean = s.strip().replace('−', '-').replace('–', '-')
    if s_clean and all(ch in '0123456789+-' for ch in s_clean):
        return s_clean.translate(SUB_MAP)
    return f'_({s_clean})'

def extract_tokens_to_lines(tokens, base_sz=None, allow_scripts=True, return_meta=False):
    if not tokens:
        return [] if return_meta else ''
    if base_sz is None:
        sizes = Counter(round(t['size'], 1) for t in tokens if t['text'].strip())
        base_sz = sizes.most_common(1)[0][0] if sizes else 14.0
    # Cluster main tokens into lines by mid_y
    # Note: Thai chars and normal math bases (including 11pt equation bases like 3 in 3^(x^2)) are main_toks
    main_toks = [t for t in tokens if t.get('is_frac') or is_thai(t['text']) or (t['size'] >= base_sz * 0.68)]
    if not main_toks:
        main_toks = list(tokens)
    main_toks.sort(key=lambda t: (t['top'] + t['bottom'])/2)
    lines = []
    for t in main_toks:
        my = (t['top'] + t['bottom'])/2
        placed = False
        for ln in lines:
            if abs(my - ln['mid_y']) <= max(4.5, base_sz * 0.35):
                ln['toks'].append(t)
                ln['mid_y'] = sum((x['top']+x['bottom'])/2 for x in ln['toks'])/len(ln['toks'])
                ln['top'] = min(ln['top'], t['top'])
                ln['bottom'] = max(ln['bottom'], t['bottom'])
                placed = True
                break
        if not placed:
            lines.append({'mid_y': my, 'top': t['top'], 'bottom': t['bottom'], 'toks': [t]})
    # Attach small tokens
    small_toks = [t for t in tokens if t not in main_toks]
    for t in small_toks:
        if not t['text'].strip():
            continue
        my = (t['top'] + t['bottom'])/2
        best_ln = min(lines, key=lambda ln: abs(my - ln['mid_y']))
        best_ln['toks'].append(t)

    lines.sort(key=lambda ln: ln['mid_y'])
    out_lines = []
    for ln in lines:
        # Thai combining marks (zero-width) must stay attached right after their base char in stream order
        by_ord = sorted(ln['toks'], key=lambda t: t.get('_ord', 0))
        keys = {}
        prev_key = None
        prev_tok = None
        for t in by_ord:
            if t['text'] in THAI_MARKS and prev_key is not None and abs(t['x0'] - prev_tok['x1']) < 3.0:
                k = (prev_key[0], prev_key[1], prev_key[2] + 1)
            else:
                k = (round(t['x0'], 1), t.get('_ord', 0), 0)
            keys[id(t)] = k
            prev_key, prev_tok = k, t
        toks = sorted(ln['toks'], key=lambda t: keys[id(t)])
        if allow_scripts:
            # Tag super/subscripts relative to their immediate left/adjacent larger base token
            # Find dominant baseline size on this line
            ln_sizes = Counter(round(t['size'], 1) for t in toks if t['text'].strip())
            ln_sz = max(ln_sizes.keys()) if ln_sizes else base_sz
            # Detect local scripts relative to preceding non-space token
            last_base = None
            for idx, t in enumerate(toks):
                if not t['text'].strip() or t.get('is_frac') or is_thai(t['text']):
                    if t['text'].strip():
                        last_base = t
                    continue
                if t['text'] in ('=', '<', '>', '≤', '≥', '≠', ':', '+', '×', '÷', ',', '.', '(', ')', '[', ']', '{', '}'):
                    if t['size'] >= ln_sz * 0.65:
                        last_base = t
                        continue
                if last_base is not None:
                    # Check if t is noticeably smaller and vertically shifted relative to last_base (or previous script)
                    is_smaller = t['size'] < last_base['size'] * 0.85
                    if is_smaller and t['bottom'] < last_base['bottom'] - 1.5 and (t['top'] + t['bottom'])/2 < (last_base['top'] + last_base['bottom'])/2 - 1.2:
                        t['script'] = 'sup'
                        # Check for nested superscript like 3^(x^2): if next token is even smaller & higher, handle in pass
                        continue
                    elif is_smaller and t['top'] > last_base['top'] + 2.5 and t['bottom'] > last_base['bottom'] + 1.2:
                        t['script'] = 'sub'
                        continue
                # Check if t is a cube root index directly before √
                if t['size'] < ln_sz * 0.72 and t['text'].isdigit() and idx + 1 < len(toks) and toks[idx+1]['text'] == '√':
                    t['script'] = 'root_idx'
                    continue
                last_base = t
        # Build string from toks
        s = ''
        i = 0
        prev_x1 = None
        while i < len(toks):
            t = toks[i]
            if not t['text'].strip():
                if (t['x1'] - t['x0']) > 1.0 and s and not s.endswith(' ') and t.get('script') is None:
                    nxt = toks[i+1] if i + 1 < len(toks) else None
                    if nxt is not None and nxt['text'].strip() and nxt['x0'] >= t['x0'] - 0.5:
                        s += ' '
                        prev_x1 = t['x1']
                i += 1
                continue
            sc = t.get('script')
            if sc == 'root_idx' and i + 1 < len(toks) and toks[i+1]['text'] == '√':
                if prev_x1 is not None and t['x0'] - prev_x1 > max(2.2, 0.22 * base_sz):
                    s += ' '
                s += '∛' if t['text'] == '3' else f"{format_sup(t['text'])}√"
                prev_x1 = toks[i+1]['x1']
                i += 2
                continue
            if sc in ('sup', 'sub'):
                # Collect contiguous run of same script; check nested sup inside sup (like x^2 inside 3^(x^2))
                run_toks = [t]
                rx1 = t['x1']
                j = i + 1
                while j < len(toks) and toks[j].get('script') == sc and toks[j]['x0'] - rx1 < 4.5:
                    run_toks.append(toks[j])
                    rx1 = toks[j]['x1']
                    j += 1
                # Check nested script inside run_toks (e.g. x followed by smaller 2 higher up)
                run_str = ''
                k = 0
                while k < len(run_toks):
                    rt = run_toks[k]
                    if k > 0 and rt['size'] < run_toks[k-1]['size'] * 0.85 and rt['bottom'] < run_toks[k-1]['bottom'] - 1.0:
                        run_str += format_sup(rt['text'])
                    else:
                        run_str += rt['text']
                    k += 1
                s += format_sup(run_str) if sc == 'sup' else format_sub(run_str)
                prev_x1 = rx1
                i = j
                continue
            if prev_x1 is not None and t['x0'] - prev_x1 > max(2.2, 0.22 * base_sz):
                if not (s.endswith(' ') or t['text'].startswith(' ')):
                    s += ' '
            elif t.get('is_frac') and s and s[-1].isdigit() and t['text'][0].isdigit():
                s += ' '
            s += t['text']
            prev_x1 = t['x1'] if prev_x1 is None or t['text'] not in THAI_MARKS else max(prev_x1, t['x1'])
            i += 1
        if s.strip():
            vis = [t for t in toks if t['text'].strip()]
            trail_sp = bool(toks) and not toks[-1]['text'].strip() and (toks[-1]['x1'] - toks[-1]['x0']) > 1.0
            out_lines.append({'text': s.strip(), 'x0': min(t['x0'] for t in vis), 'x1': max(t['x1'] for t in vis),
                              'top': ln['top'], 'bottom': ln['bottom'], 'trail_sp': trail_sp})
    if return_meta:
        return out_lines
    return '\n'.join(l['text'] for l in out_lines)

def needs_parens_num(s):
    depth = 0
    for idx, ch in enumerate(s):
        if ch == '(': depth += 1
        elif ch == ')': depth -= 1
        elif depth == 0:
            if ch in '+×÷ ': return True
            if ch == '-' and idx > 0: return True
    return False

def needs_parens_den(s):
    if needs_parens_num(s): return True
    if re.search(r'\d[A-Za-z]|[A-Za-z]{2,}', s):
        return True
    return False

def is_table_grid_rect(r, table_cell_bboxes):
    rx0, rtop, rx1, rbot = r['x0'], r['top'], r['x1'], r['bottom']
    rw = r['width']
    for cb in table_cell_bboxes:
        cx0, ctop, cx1, cbot = cb
        # Check if rect lies along the top or bottom border of a cell and spans near full cell width
        if (abs(rtop - ctop) < 2.0 or abs(rbot - cbot) < 2.0 or abs((rtop+rbot)/2 - ctop) < 2.0 or abs((rtop+rbot)/2 - cbot) < 2.0):
            if rw >= (cx1 - cx0) * 0.75 and rx0 >= cx0 - 3 and rx1 <= cx1 + 3:
                return True
    return False

def normalize_thai_text(s):
    # Normalize decomposed sara-am: นิหิต + [วรรณยุกต์] + สระอา -> [วรรณยุกต์] + สระอำ
    s = re.sub('\u0e4d([\u0e48-\u0e4b]?)\u0e32', '\\1\u0e33', s)
    # Fix ordering: ำ + tone -> tone + ำ (e.g. น้ำ = น + ้ + ำ)
    s = re.sub('\u0e33([\u0e48-\u0e4b])', '\\1\u0e33', s)
    return s

def is_sqrt_overbar(b, chars):
    # A Word Equation radical overbar has '√' immediately to the left of b['x0'] at matching vertical range
    for c in chars:
        if c['text'] == '√':
            if -6.0 <= (b['x0'] - c['x1']) <= 4.0 or abs(c['x0'] - b['x0']) <= 5.0:
                if c['top'] - 4.0 <= b['top'] <= c['bottom'] + 4.0:
                    return True
    return False

def is_subtraction_line(b, chars):
    if b['width'] < 28:
        return False
    for c in chars:
        if c['text'] == '=' and (b['x1'] - 12 <= c['x0'] <= b['x1'] + 15) and (-2 <= (b['top'] - c['bottom']) <= 10):
            return True
    return False

def extract_box_text(page, bbox, table_cell_bboxes=None, inside_cell=False, return_meta=False, exclude_bboxes=None):
    x0, top, x1, bot = bbox
    if inside_cell:
        raw_chars = [
            c for c in page.chars
            if (x0 - 0.5 <= (c['x0'] + c['x1'])/2 <= x1 + 0.5)
            and (top - 0.5 <= (c['top'] + c['bottom'])/2 <= bot + 0.5)
        ]
    else:
        raw_chars = [c for c in page.chars if c['x0'] >= x0-1 and c['x1'] <= x1+1 and c['top'] >= top-1 and c['bottom'] <= bot+1]
    if exclude_bboxes:
        raw_chars = [c for c in raw_chars if not any(e[0]-1 <= (c['x0']+c['x1'])/2 <= e[2]+1 and e[1]-1 <= (c['top']+c['bottom'])/2 <= e[3]+1 for e in exclude_bboxes)]
    chars = clean_chars_in_box(raw_chars)
    if not chars:
        return [] if return_meta else ''
    sizes = Counter(round(c['size'], 1) for c in chars if c['text'].strip())
    main_sz = sizes.most_common(1)[0][0] if sizes else 14.0
    bars = []
    for r in page.rects:
        if not inside_cell and table_cell_bboxes and is_table_grid_rect(r, table_cell_bboxes):
            continue
        if inside_cell and table_cell_bboxes and is_table_grid_rect(r, table_cell_bboxes):
            continue
        if 0.1 <= r['height'] <= 2.8 and 3.0 <= r['width'] <= 160.0:
            rmx = (r['x0'] + r['x1']) / 2
            rmy = (r['top'] + r['bottom']) / 2
            if x0 - 1.5 <= rmx <= x1 + 1.5 and top - 1.5 <= rmy <= bot + 1.5:
                if is_sqrt_overbar(r, chars) or is_subtraction_line(r, chars):
                    continue
                bars.append(r)
    bars.sort(key=lambda r: r['width'])
    consumed = set()
    frac_tokens = []
    # Map each char to closest candidate bar vertically if horizontally inside bar.
    # Allow slightly larger vertical distance for small exponent/subscript chars attached to num/den!
    char_to_bar = {}
    for ci, c in enumerate(chars):
        if not c['text'].strip():
            continue
        cmx = (c['x0'] + c['x1']) / 2
        cmy = (c['top'] + c['bottom']) / 2
        best_b = None
        best_dist = 999
        is_small_math = (not is_thai(c['text'])) and (c['size'] <= main_sz * 0.72)
        max_gap_above = 10.5 if is_small_math else 6.2
        max_gap_below = 10.5 if is_small_math else 6.8
        for bi, b in enumerate(bars):
            if b['x0'] - 2.0 <= cmx <= b['x1'] + 2.0:
                if cmy < b['top'] and (b['top'] - c['bottom']) <= max_gap_above and (b['top'] - cmy) <= 15.5:
                    d = b['top'] - c['bottom']
                elif cmy > b['bottom'] and (c['top'] - b['bottom']) <= max_gap_below and (cmy - b['bottom']) <= 15.5:
                    d = c['top'] - b['bottom']
                else:
                    continue
                if d < best_dist:
                    best_dist = d
                    best_b = bi
        if best_b is not None:
            char_to_bar[ci] = best_b

    for bi, b in enumerate(bars):
        num_chars = [(ci, chars[ci]) for ci, cbi in char_to_bar.items() if cbi == bi and ci not in consumed and (chars[ci]['top']+chars[ci]['bottom'])/2 < b['top']]
        den_chars = [(ci, chars[ci]) for ci, cbi in char_to_bar.items() if cbi == bi and ci not in consumed and (chars[ci]['top']+chars[ci]['bottom'])/2 > b['bottom']]
        if num_chars and den_chars:
            # Ensure there actually is a base char close to the bar on both sides (so stray exponent above empty bar isn't grabbed)
            if min(b['top'] - c['bottom'] for _, c in num_chars) > 6.5 or min(c['top'] - b['bottom'] for _, c in den_chars) > 6.8:
                continue
            # Reject prose accidental grabs
            if any(is_thai(c['text']) and c['size'] >= main_sz * 0.95 for _, c in num_chars + den_chars):
                if any(c['size'] >= 15.0 for _, c in num_chars + den_chars):
                    continue
            if any(ord(c['text']) < 128 and c['text'].isalpha() and c['size'] >= main_sz * 0.95 for _, c in num_chars) and sum(c['text'].isalpha() for _, c in num_chars) >= 5:
                continue
            for ci, _ in num_chars + den_chars:
                consumed.add(ci)
            f_sz = max(c['size'] for _, c in num_chars + den_chars)
            # In a fraction, the base size for numerator/denominator scripts is the largest char INSIDE num or den respectively!
            n_base = max(c['size'] for _, c in num_chars)
            d_base = max(c['size'] for _, c in den_chars)
            num_str = extract_tokens_to_lines([c for _, c in num_chars], base_sz=n_base).replace('\n', ' ').strip()
            den_str = extract_tokens_to_lines([c for _, c in den_chars], base_sz=d_base).replace('\n', ' ').strip()
            n_fmt = f'({num_str})' if needs_parens_num(num_str) and not (num_str.startswith('(') and num_str.endswith(')')) else num_str
            d_fmt = f'({den_str})' if needs_parens_den(den_str) and not (den_str.startswith('(') and den_str.endswith(')')) else den_str
            avg_sz = sum(c['size'] for _, c in num_chars + den_chars) / (len(num_chars) + len(den_chars))
            left_base = [c for ci, c in enumerate(chars) if ci not in consumed and c['text'].strip() and 0 < b['x0'] - c['x1'] < 12 and c['size'] >= main_sz * 0.7]
            is_exp_frac = False
            frac_txt = f'{n_fmt}/{d_fmt}'
            if not is_exp_frac and not (n_fmt.startswith('(') or d_fmt.startswith('(')):
                right_c = [c for ci, c in enumerate(chars) if ci not in consumed and c['text'].strip() and 0 <= c['x0'] - b['x1'] < 6 and abs((c['top']+c['bottom'])/2 - (b['top']+b['bottom'])/2) < 8]
                if right_c and re.match(r'[A-Za-zก-ฮ(]', right_c[0]['text']):
                    frac_txt = f'({frac_txt})'
            all_c = [c for _, c in num_chars + den_chars]
            frac_tokens.append({
                'text': frac_txt,
                'x0': min(b['x0'], min(c['x0'] for c in all_c)),
                'x1': max(b['x1'], max(c['x1'] for c in all_c)),
                'top': (b['top'] + b['bottom'])/2 - main_sz*0.5,
                'bottom': (b['top'] + b['bottom'])/2 + main_sz*0.5,
                'size': main_sz,
                'is_frac': True,
                '_ord': min(c['_ord'] for c in all_c),
            })
    rem_tokens = [c for ci, c in enumerate(chars) if ci not in consumed] + frac_tokens
    if return_meta:
        recs = extract_tokens_to_lines(rem_tokens, base_sz=main_sz, return_meta=True)
        for r in recs:
            r['text'] = normalize_thai_text(r['text'])
        return recs
    return normalize_thai_text(extract_tokens_to_lines(rem_tokens, base_sz=main_sz))


# ============================================================================
# PART 2: PDF -> line streams (Q + S) with table / sodom markers
# ============================================================================
import json, hashlib, html

BASE = r'D:\DEV\PreExamV2'
Q_DIR = os.path.join(BASE, 'bin', 'ข้อสอบ', 'ข้อสอบเก่าปี 59 - 68')
S_DIR = os.path.join(BASE, 'bin', 'ข้อสอบ', 'เฉลยข้อสอบเก่าปี 59 - 68')
OUT_SQL = os.path.join(BASE, 'worker', 'fixed_2559_2564.sql')
REPORT_JSON = os.path.join(BASE, 'worker', 'fixed_2559_2564_report.json')

SETS = [
    ('2559', 'Paper', 'ข้อสอบ ก.พ. 2559 - GO ราชการ.pdf', 'เฉลยข้อสอบ ก.พ. 2559 - GO ราชการ.pdf'),
    ('2560', 'Paper', 'ข้อสอบ ก.พ. 2560 - GO ราชการ.pdf', 'เฉลยข้อสอบ ก.พ. 2560 - GO ราชการ.pdf'),
    ('2561', 'Paper', 'ข้อสอบ ก.พ. 2561 - GO ราชการ.pdf', 'เฉลยข้อสอบ ก.พ. 2561 - GO ราชการ.pdf'),
    ('2562', 'Paper', 'ข้อสอบ ก.พ. 2562 - GO ราชการ.pdf', 'เฉลยข้อสอบ ก.พ. 2562 - GO ราชการ.pdf'),
    ('2563', 'Paper', 'ข้อสอบ ก.พ. 2563 - GO ราชการ.pdf', 'เฉลยข้อสอบ ก.พ. 2563 - GO ราชการ.pdf'),
    ('2564', 'Paper', 'ข้อสอบ ก.พ. 2564 Paper - GO ราชการ.pdf', 'เฉลยข้อสอบ ก.พ. 2564 Paper - GO ราชการ.pdf'),
    ('2564', 'e-Exam', 'ข้อสอบ ก.พ. 2564 e-Exam - GO ราชการ.pdf', 'เฉลยข้อสอบ ก.พ. 2564 e-Exam - GO ราชการ.pdf'),
]

HEADER_CUT = 48.0


def cell_text(page, cell, cell_bboxes):
    if not cell:
        return ''
    t = extract_box_text(page, cell, cell_bboxes, inside_cell=True)
    return re.sub(r'[ \t]+', ' ', t.replace('\n', ' ')).strip()


def cell_lines(page, cell, cell_bboxes):
    if not cell:
        return []
    t = extract_box_text(page, cell, cell_bboxes, inside_cell=True)
    return [re.sub(r'[ \t]+', ' ', x).strip() for x in t.split('\n') if x.strip()]


def is_sodom_table(rows_txt):
    flat = ' '.join(' '.join(r) for r in rows_txt)
    if 'สดมภ์' in flat:
        return True
    # continuation page of a sodom table: every row starts with a question number and has 4 columns
    if rows_txt and all(len(r) == 4 and re.fullmatch(r'\d{1,3}', (r[0] or '').split(' ')[0] or '') for r in rows_txt):
        return True
    return False


def page_stream(page, pno, kind):
    """Return list of line records for one page, with tables replaced by markers."""
    W, H = page.width, page.height
    tabs = page.find_tables()
    cell_bboxes = []
    for tb in tabs:
        cell_bboxes.extend([c for c in tb.cells if c])
    recs = []
    excl = []
    tables = []
    for ti, tb in enumerate(tabs):
        if tb.bbox[3] < HEADER_CUT:
            continue
        rows = []
        for row in tb.rows:
            rows.append([cell_text(page, c, cell_bboxes) if c else None for c in row.cells])
        rows_txt = [[(c or '') for c in r] for r in rows]
        if all(not ''.join(r).strip() for r in rows_txt):
            continue
        excl.append(tb.bbox)
        if kind == 'S':
            # Answer key: keep table rows as text lines (multi-line cells kept as-is), plus sodom answers
            for ri, row in enumerate(tb.rows):
                cells = [cell_lines(page, c, cell_bboxes) if c else [] for c in row.cells]
                if not any(cells):
                    continue
                top = min(c[1] for c in row.cells if c)
                first = ' '.join(cells[0]) if cells else ''
                m = re.match(r'^(\d{1,3})\s*ตอบ\s*([1-4])', first)
                if m and len(cells) == 4:
                    recs.append({'t': f'{m.group(1)}. ตอบ {m.group(2)})', 'x0': 0, 'x1': 0, 'top': top, 'page': pno,
                                 'kind': 'sodom_ans', 'cells': cells})
                else:
                    recs.append({'t': ' | '.join(' '.join(c) for c in cells if c), 'x0': 60, 'x1': 300, 'top': top,
                                 'page': pno, 'kind': 'text', 'trail_sp': False})
            continue
        if is_sodom_table(rows_txt):
            for ri, row in enumerate(tb.rows):
                r = rows_txt[ri]
                if not r or not re.fullmatch(r'\d{1,3}', r[0].strip() or 'x'):
                    continue
                top = min(c[1] for c in row.cells if c)
                cells = [r[i] if i < len(r) else '' for i in range(4)]
                recs.append({'t': f'[[SODOM:{r[0].strip()}]]', 'x0': 0, 'x1': 0, 'top': top, 'page': pno,
                             'kind': 'sodom', 'cells': cells})
        else:
            # data table: drop columns whose header is empty; merge their content leftwards
            hdr = rows_txt[0]
            keep = [i for i, h in enumerate(hdr) if h.strip()]
            clean_rows = []
            for r in rows_txt:
                out = {i: r[i] for i in keep}
                for i, v in enumerate(r):
                    if i in keep or not v.strip():
                        continue
                    left = [k for k in keep if k < i]
                    tgt = left[-1] if left else keep[0]
                    if not out[tgt].strip():
                        out[tgt] = v
                    else:
                        out[tgt] = out[tgt] + ' ' + v
                clean_rows.append([out[i] for i in keep])
            tid = f'p{pno}t{ti}'
            tables.append({'id': tid, 'rows': clean_rows})
            recs.append({'t': f'[[TABLE:{tid}]]', 'x0': 0, 'x1': 0, 'top': tb.bbox[1], 'page': pno, 'kind': 'table',
                         'rows': clean_rows})
    lines = extract_box_text(page, (0, HEADER_CUT, W, H), cell_bboxes, return_meta=True, exclude_bboxes=excl)
    for ln in lines:
        t = ln['text'].strip()
        if not t:
            continue
        if ln['top'] > H - 45 and re.fullmatch(r'[-–\s]*\d{1,3}[-–\s]*', t):
            continue  # page number
        if t.startswith('GO! ราชการ') or 'สงวนลิขสิทธิ์ตามกฎหมาย' in t:
            continue
        recs.append({'t': t, 'x0': ln['x0'], 'x1': ln['x1'], 'top': ln['top'], 'page': pno, 'kind': 'text',
                     'trail_sp': ln.get('trail_sp', False)})
    recs.sort(key=lambda r: r['top'])
    return recs


def pdf_stream(path, kind):
    out = []
    with pdfplumber.open(path) as pdf:
        for pi, page in enumerate(pdf.pages, 1):
            out.extend(page_stream(page, pi, kind))
    return out


# ============================================================================
# PART 3: Parsing Q & S streams, context propagation, choices, answer keys
# ============================================================================

SECTION_MAP = {
    'ความสามารถในการคิดวิเคราะห์': ('ความสามารถในการคิดวิเคราะห์', 'ความสามารถทั่วไป'),
    'ภาษาอังกฤษ': ('ภาษาอังกฤษ', 'ภาษาอังกฤษ'),
    'วิชาภาษาอังกฤษ': ('ภาษาอังกฤษ', 'ภาษาอังกฤษ'),
    'ความรู้และลักษณะการเป็นข้าราชการที่ดี': ('ความรู้และลักษณะการเป็นข้าราชการที่ดี', 'กฎหมาย'),
}

SODOM_CHOICES = [
    'ค่าในสดมภ์ ก มากกว่าค่าในสดมภ์ ข',
    'ค่าในสดมภ์ ข มากกว่าค่าในสดมภ์ ก',
    'ค่าในสดมภ์ ก เท่ากับค่าในสดมภ์ ข',
    'ไม่สามารถสรุปได้แน่ชัด',
]

CONDITION_CHOICES = [
    'ข้อสรุปทั้งสองเป็นจริงตามเงื่อนไข',
    'ข้อสรุปทั้งสองไม่เป็นจริงตามเงื่อนไข',
    'ข้อสรุปทั้งสองไม่แน่ชัด (ไม่สามารถสรุปได้ว่าจริงหรือไม่จริง)',
    'ข้อสรุปทั้งสองมีข้อสรุปใดข้อสรุปหนึ่งที่เป็นจริง หรือไม่จริง หรือไม่แน่ชัด ซึ่งไม่ซ้ำกัน',
]

Q38_2564_EEXAM_FIG = (
    '<div style="margin:12px 0;display:inline-block;padding:10px 14px;border-radius:10px;'
    'background:rgba(15,23,42,0.55);border:1px solid rgba(148,163,184,0.3);">'
    '<div style="position:relative;width:136px;height:136px;border:2px solid #e2e8f0;'
    'background:rgba(148,163,184,0.42);margin:6px 18px 14px 12px;">'
    '<span style="position:absolute;left:-14px;top:-16px;font-weight:700;font-size:0.85rem;">A</span>'
    '<span style="position:absolute;right:-14px;top:-16px;font-weight:700;font-size:0.85rem;">B</span>'
    '<span style="position:absolute;right:-14px;bottom:-16px;font-weight:700;font-size:0.85rem;">C</span>'
    '<span style="position:absolute;left:-14px;bottom:-16px;font-weight:700;font-size:0.85rem;">D</span>'
    '<span style="position:absolute;right:8px;top:7px;font-size:0.78rem;font-weight:600;">3 ฟุต</span>'
    '<span style="position:absolute;right:5px;bottom:8px;font-size:0.78rem;font-weight:600;">3 ฟุต</span>'
    '<div style="position:absolute;left:0;bottom:0;width:96px;height:96px;background:#0f172a;'
    'border-top:2px solid #e2e8f0;border-right:2px solid #e2e8f0;display:flex;align-items:center;'
    'justify-content:center;font-size:0.76rem;color:#94a3b8;">สี่เหลี่ยมจัตุรัสใน</div>'
    '</div>'
    '<div style="font-size:0.8rem;color:#cbd5e1;">(แถบแรเงาด้านบนและด้านขวากว้าง 3 ฟุต พื้นที่แรเงารวม = 45 ตร.ฟุต)</div>'
    '</div>'
)


def render_data_table_html(rows):
    if not rows:
        return ''
    hdr = [r.replace('ยางราพา', 'ยางพารา') for r in rows[0]]
    ths = ''.join(
        f'<th style="padding:7px 10px;border:1px solid rgba(255,255,255,0.22);background:rgba(30,41,59,0.75);'
        f'text-align:center;font-weight:600;">{html.escape(c)}</th>'
        for c in hdr
    )
    trs = []
    for row in rows[1:]:
        tds = []
        for ci, c in enumerate(row):
            align = 'left' if (ci == 0 and not c.strip().isdigit()) or (ci == 1 and row[0].strip().isdigit()) else 'center'
            tds.append(f'<td style="padding:6px 10px;border:1px solid rgba(255,255,255,0.16);text-align:{align};">{html.escape(c)}</td>')
        trs.append('<tr style="text-align:center;">' + ''.join(tds) + '</tr>')
    return (
        '<div style="overflow-x:auto;margin:10px 0;">'
        '<table style="width:100%;border-collapse:collapse;font-size:0.92rem;border:1px solid rgba(255,255,255,0.3);">'
        f'<thead><tr>{ths}</tr></thead><tbody>{"".join(trs)}</tbody></table></div>'
    )


def render_sodom_html(cells):
    _, g, k, c = (cells + ['', '', '', ''])[:4]
    if c.strip() == 'x, y = 0':
        c = 'x, y ≠ 0 (ต้นฉบับพิมพ์ x, y = 0)'
    return (
        'ให้พิจารณาเปรียบเทียบข้อมูลระหว่างสดมภ์ ก กับสดมภ์ ข โดยใช้ข้อมูลในสดมภ์ ค\n\n'
        '<div style="overflow-x:auto;margin:10px 0;">'
        '<table style="width:100%;border-collapse:collapse;font-size:0.92rem;border:1px solid rgba(255,255,255,0.3);">'
        '<thead><tr>'
        '<th style="width:30%;padding:7px 10px;border:1px solid rgba(255,255,255,0.22);background:rgba(30,41,59,0.75);text-align:center;">สดมภ์ ก</th>'
        '<th style="width:30%;padding:7px 10px;border:1px solid rgba(255,255,255,0.22);background:rgba(30,41,59,0.75);text-align:center;">สดมภ์ ข</th>'
        '<th style="width:40%;padding:7px 10px;border:1px solid rgba(255,255,255,0.22);background:rgba(30,41,59,0.75);text-align:center;">สดมภ์ ค</th>'
        '</tr></thead><tbody><tr>'
        f'<td style="padding:8px 10px;border:1px solid rgba(255,255,255,0.16);text-align:center;">{html.escape(g)}</td>'
        f'<td style="padding:8px 10px;border:1px solid rgba(255,255,255,0.16);text-align:center;">{html.escape(k)}</td>'
        f'<td style="padding:8px 10px;border:1px solid rgba(255,255,255,0.16);text-align:center;">{html.escape(c)}</td>'
        '</tr></tbody></table></div>'
    )


def join_wrap(a, b, a_rec=None):
    """Join two wrapped PDF lines without mid-word breaks while keeping English/number spacing."""
    a, b = a.rstrip(), b.lstrip()
    if not a:
        return b
    if not b:
        return a
    ca, cb = a[-1], b[0]
    # English/digit hyphenated or word boundary
    if ca == '-' and len(a) >= 2 and a[-2].isalpha() and cb.isalpha() and ord(cb) < 128:
        return a + b
    if (ord(ca) < 128 and (ca.isalnum() or ca in ',.;:?!)\'"%')) and (ord(cb) < 128 and (cb.isalnum() or cb in '(\'"$')):
        return a + ' ' + b
    if (is_thai(ca) and ord(cb) < 128 and cb.isalnum()) or (ord(ca) < 128 and ca.isalnum() and is_thai(cb)):
        return a + ' ' + b
    if is_thai(ca) and is_thai(cb):
        if a_rec and a_rec.get('trail_sp'):
            return a + ' ' + b
        if a.endswith(('เช่น', 'ได้แก่', 'คือ', 'และ', 'หรือ')) and a_rec and a_rec.get('x1', 500) < 470:
            return a + ' ' + b
        return a + b
    if a_rec and a_rec.get('trail_sp'):
        return a + ' ' + b
    return a + ' ' + b


def is_intentional_newline(prev_ln, cur_ln, prev_rec=None):
    p, c = prev_ln.strip(), cur_ln.strip()
    if not p or not c:
        return True
    if c.startswith(('<div', '<table', '[[', '-', '•', 'ข้อสรุปที่', 'สดมภ์', 'หมายเหตุ', 'ทุกตัวอักษร')):
        return True
    if p.startswith(('<div', '<table', '[[', 'ข้อสรุปที่', 'จากข้อมูล', 'จากเงื่อนไข', 'จงอ่านบทความ', 'Directions', 'Instruction', 'Situation', 'Conversation', 'Read the')):
        return True
    if re.match(r'^([1-4]\)|[ก-ง]\.|[A-Z][a-zA-Z ]{0,16}\s*:)\s*', c):
        return True
    if re.match(r'^(TO|FROM|DATE|SUBJECT|PLACE|Food|Dress code|Merit|Lunch|Dear|Sincerely|Thank you|Books|Foods)\b', c):
        return True
    if re.search(r'\*\s*\S+\s*=', p) or re.search(r'\*\s*\S+\s*=', c):
        return True
    if re.match(r'^(A B C|B B|2 0 7)\b', p) or re.match(r'^(A B C|B B|2 0 7)\b', c):
        return True
    # Short indented paragraph / address lines in letters
    if prev_rec and prev_rec.get('x1', 520) < 360 and not is_thai(p[-1]):
        return True
    return False


def merge_wrapped_lines(rec_list):
    if not rec_list:
        return ''
    out = [rec_list[0]['t'].strip()]
    prev_rec = rec_list[0]
    for r in rec_list[1:]:
        t = r['t'].strip()
        if not t:
            continue
        if is_intentional_newline(out[-1], t, prev_rec):
            out.append(t)
        else:
            out[-1] = join_wrap(out[-1], t, prev_rec)
        prev_rec = r
    txt = '\n'.join(out)
    # Clean spacing artifacts around Thai punctuation / numbers
    txt = re.sub(r'\s+([)\]])', r'\1', txt)
    return txt.strip()


# ============================================================================
# PART 4: Stream -> Questions + Answer-Key matching + Distractor builder
# ============================================================================

CTX_START_RE = re.compile(
    r'^(?:'
    r'จาก(?:ข้อมูล|เงื่อนไข)(?:ในตาราง)?ต่อไปนี้|จากข้อมูลในตาราง|'
    r'จงอ่านบทความนี้|'
    r'หลักในการทำคำตอบ|ให้พิจารณาเปรียบเทียบข้อมูลระหว่างสดมภ์|'
    r'Instruction\s*:|Directions\s*:|'
    r'\(?Conversation\s*\d|'
    r'Situation\s*:|'
    r'Travelling with children\s*:|'
    r'In the hotel$|'
    r'Reading\s*\d|'
    r'Read the following (?:letter|passage|article)|'
    r'At present I[’\']m ____\(22\)____'
    r')',
    re.I
)

SODOM_INSTR_RE = re.compile(r'^(?:ให้พิจารณาเปรียบเทียบข้อมูลระหว่างสดมภ์|หลักในการทำคำตอบ|ตอบ\s*[1-4]\s*ถ้าค่าในสดมภ์|ตอบ\s*4\s*ถ้าไม่สามารถสรุป)')


def infer_ctx_range(yr, st, cat, cur_qno, ctx_lines):
    blob = '\n'.join(r['t'] for r in ctx_lines)
    m = re.search(r'ข้อ\s*(\d{1,3})\s*[-–—]\s*(\d{1,3})', blob)
    if m:
        return int(m.group(1)), int(m.group(2))
    # Blank numbers inside cloze/dialogue: (1)...(5), (22)...(23), etc.
    blanks = [int(x) for x in re.findall(r'(?:\.\s*\.\s*\.\s*|_{2,})\s*\((\d{1,2})\)\s*(?:\.\s*\.\s*\.|_{2,})', blob)]
    if blanks:
        return min(blanks), max(blanks)
    # Known English reading passages without explicit range header
    nxt = cur_qno + 1
    if 'Reading1' in blob or 'John Lennon' in blob:
        return 19, 23
    if 'Reading2' in blob and 'Sphinx' in blob:
        return 24, 28
    if 'Mid-City Savings Bank' in blob:
        return 21, 25
    if 'Thomas Malthus' in blob or 'population of the world' in blob:
        return 26, 30
    if 'Hillton Toy' in blob or 'Miss Jenny Wong' in blob:
        return 31, 35
    if 'Songkran event' in blob:
        return 36, 40
    if 'Elementary schools' in blob or 'integrated learning' in blob:
        return 41, 45
    return nxt, nxt + 4


def format_ctx_block(ctx_recs):
    out_recs = []
    for r in ctx_recs:
        if r['kind'] == 'table':
            out_recs.append({'t': render_data_table_html(r['rows']), 'x0': 0, 'x1': 500, 'top': r['top'], 'page': r['page'], 'kind': 'html'})
        else:
            t = r['t']
            t = re.sub(r'^\(Conversation\s*(\d+)\)/\(Inthecafeteria\)', r'Conversation \1 (In the cafeteria)', t)
            t = re.sub(r'^\(Conversation\s*(\d+)\)/\(Tourassistant\s*:\)', r'Conversation \1\nTour assistant :', t)
            t = re.sub(r'^Reading\s*(\d+)/\(([A-Za-z]+)\)', r'Reading \1\n\2', t)
            for sub in t.split('\n'):
                out_recs.append({**r, 't': sub})
    # Join broken first word after Reading1/(So)\nmeone or Reading2/(Th)\ne
    fixed = []
    i = 0
    while i < len(out_recs):
        cur = out_recs[i]
        if cur['t'] in ('So', 'Th', 'Customer') and i + 1 < len(out_recs):
            nxt = out_recs[i + 1]
            joiner = '' if cur['t'] in ('So', 'Th') else ' '
            fixed.append({**nxt, 't': cur['t'] + joiner + nxt['t'].lstrip()})
            i += 2
            continue
        fixed.append(cur)
        i += 1
    return merge_wrapped_lines(fixed)


def split_inline_choices(line_txt):
    """Split a line containing inline choices '1. ... 2. ... 3. ... 4. ...' (or ก./ข./ค./ง. and typos like '`3.' or '4 ชีววิทยา')."""
    t = line_txt.strip()
    t = re.sub(r'`([1-4]\.)', r'\1', t)
    # Pattern A: all 4 on one line: 1. a 2. b [34]. c 4. d
    m4 = re.match(r'^1\.\s*(.+?)\s+2\.\s*(.+?)\s+[34]\.\s*(.+?)\s+(?<![-–—]\s)4(?:\.|\s+(?![-–—\d]))\s*(.+)$', t)
    if m4:
        return [(1, m4.group(1).strip()), (2, m4.group(2).strip()), (3, m4.group(3).strip()), (4, m4.group(4).strip())]
    # Pattern B: 2 choices on one line: 1. a 2. b  OR  3. c 4. d (including '4 ชีววิทยา' missing dot, or ก./ข. and ค./ง.)
    m12 = re.match(r'^(?:1|ก)\.\s*(.+?)\s+(?:2|ข)\.\s*(.+)$', t)
    if m12:
        return [(1, m12.group(1).strip()), (2, m12.group(2).strip())]
    m34 = re.match(r'^(?:3|ค)\.\s*(.+?)\s+(?<![-–—]\s)(?:4(?:\.|\s+(?![-–—\d]))|ง\.)\s*(.+)$', t)
    if m34:
        return [(3, m34.group(1).strip()), (4, m34.group(2).strip())]
    # Pattern C: single choice line 'k. ...' or 'ก..ง. ...'
    m1 = re.match(r'^([1-4])\.\s*(.+)$', t)
    if m1:
        return [(int(m1.group(1)), m1.group(2).strip())]
    mg = re.match(r'^([กขคง])\.\s*(.+)$', t)
    if mg:
        return [({'ก': 1, 'ข': 2, 'ค': 3, 'ง': 4}[mg.group(1)], mg.group(2).strip())]
    return None


def parse_q_item(yr, st, cat, qno, item_recs, active_ctx):
    if len(item_recs) == 1 and item_recs[0]['kind'] == 'sodom':
        stem = render_sodom_html(item_recs[0]['cells'])
        return {'qno': qno, 'cat': cat, 'stem': stem, 'choices': list(SODOM_CHOICES), 'is_sodom': True}

    # Check if item begins with 'qno. 1. c1 2. c2 3. c3 4. c4' (cloze question with empty stem)
    first = item_recs[0]['t'].strip()
    first = re.sub(r'^\d{1,3}\.\s*', '', first)
    body_recs = [{**item_recs[0], 't': first}] + item_recs[1:]

    # Special formatting for 2562 Q17 vertical subtraction
    if yr == '2562' and cat == 'ความสามารถในการคิดวิเคราะห์' and qno == 17:
        stem = 'A B C –\n  B B =\n2 0 7\nโดยที่ A, B และ C เป็นจำนวนเต็มบวกที่มีค่า 1-9 และ A > B จงหาค่า C ว่ามีค่าเท่าไร'
        return {'qno': qno, 'cat': cat, 'stem': stem, 'choices': ['1', '5', '7', '8']}

    # Separate stem lines from choice lines at the tail
    # Scan forward: once we hit choice 1 ('1. ...') after stem (or immediately for cloze), collect choices 1..4
    stem_recs = []
    choice_map = {}
    cur_c = None
    for idx, r in enumerate(body_recs):
        t = r['t'].strip()
        if not t:
            continue
        sp = split_inline_choices(t)
        if sp:
            first_cno = sp[0][0]
            if (cur_c is None and first_cno == 1 and (stem_recs or not first or re.match(r'^1\.\s', first))) or (cur_c is not None and first_cno >= cur_c):
                for cno, ctxt in sp:
                    choice_map[cno] = [ {**r, 't': ctxt} ]
                    cur_c = cno
                continue
        if cur_c is not None:
            choice_map[cur_c].append(r)
        else:
            stem_recs.append(r)

    stem_txt = merge_wrapped_lines(stem_recs)
    # Standardize condition conclusion lines: 'ข้อสรุปที่1 ...' -> 'ข้อสรุปที่ 1 : ...'
    if 'ข้อสรุปที่' in stem_txt:
        norm_lns = []
        for ln in stem_txt.split('\n'):
            ln = re.sub(r'^ข้อสรุปที่\s*([12])\s*:?\s*', r'ข้อสรุปที่ \1: ', ln.strip())
            norm_lns.append(ln)
        stem_txt = '\n'.join(norm_lns)

    if yr == '2564' and st == 'e-Exam' and cat == 'ความสามารถในการคิดวิเคราะห์' and qno == 38:
        stem_txt = stem_txt + '\n' + Q38_2564_EEXAM_FIG

    if not stem_txt and active_ctx:
        stem_txt = f'Select the best word/phrase to fill in blank ({qno}).'

    if active_ctx:
        if active_ctx not in stem_txt:
            stem_txt = active_ctx + '\n\n' + stem_txt

    choices = []
    if len(choice_map) == 4 and all(k in choice_map for k in (1, 2, 3, 4)):
        choices = [merge_wrapped_lines(choice_map[k]).replace('\n', ' ').strip() for k in (1, 2, 3, 4)]
    elif 'ข้อสรุปที่ 1' in stem_txt:
        choices = list(CONDITION_CHOICES)

    return {'qno': qno, 'cat': cat, 'stem': stem_txt.strip(), 'choices': choices}


# ============================================================================
# PART 5: Full Q-stream walker + Answer-Key walker + Reconciliation
# ============================================================================

def is_q_start(rec, cur_qno, cat, has_c1, has_c4):
    """Return integer qno if rec starts a new question item, else None."""
    if rec['kind'] == 'sodom':
        m = re.match(r'^\[\[SODOM:(\d+)\]\]$', rec['t'])
        return int(m.group(1)) if m else None
    if rec['kind'] != 'text':
        return None
    t = rec['t'].strip()
    m = re.match(r'^(\d{1,3})\.\s*(.*)$', t)
    if not m:
        return None
    n = int(m.group(1))
    rest = m.group(2).strip()
    if cur_qno == 0 and n == 1:
        return 1
    if n in (1, 2, 3, 4) and cur_qno >= 1:
        if re.match(r'^1\.\s+\S', rest):
            return n if n == cur_qno + 1 else None
        if n == cur_qno + 1 and has_c4:
            return n
        if n == cur_qno + 1 and not has_c1 and not has_c4:
            if (any(w in rest for w in ('จงหา', 'เท่าไร', 'เท่าใด', 'กี่', 'ข้อใด', 'กำหนดให้', 'ต้องการทราบ', 'อยากทราบ', 'อัตราส่วน', 'ร้อยละ'))
                or re.search(r'\?\s*$', rest)
                or re.search(r'(\.\s*){3,}|_{3,}', rest)):
                return n
        return None
    if n == cur_qno + 1:
        return n
    if n == cur_qno and n == 31:  # 2563 duplicate Q31 (printed 31 twice instead of 31, 32)
        return 32
    if n == cur_qno and n == 52:  # 2562 duplicate Q52 (both Q52s exist before Q53)
        return 52
    if n == cur_qno + 2 and cur_qno == 12:  # 2564 e-Exam skipped Q13
        return n
    return None


def parse_q_stream(yr, st, recs):
    cat = 'ความสามารถในการคิดวิเคราะห์'
    cur_qno = 0
    items = []
    cur_recs = []
    has_c1 = False
    has_c4 = False
    contexts = []  # list of (cat, q_start, q_end, text)
    i = 0
    N = len(recs)

    def flush():
        nonlocal cur_recs, has_c1, has_c4
        if not cur_recs:
            return
        act = [c_txt for c_cat, qs, qe, c_txt in contexts if c_cat == cat and qs <= cur_qno <= qe]
        act_str = '\n\n'.join(act) if act else ''
        if yr == '2562' and cat == 'ความสามารถในการคิดวิเคราะห์' and cur_qno == 52:
            joined = ' '.join(r['t'] for r in cur_recs)
            if '::' in joined:
                act_str = ''
        items.append(parse_q_item(yr, st, cat, cur_qno, cur_recs, act_str))
        cur_recs = []
        has_c1 = False
        has_c4 = False

    def update_choice_flags(rec_t, is_first_line=False):
        nonlocal has_c1, has_c4
        check_t = re.sub(r'^\d{1,3}\.\s*', '', rec_t) if is_first_line else rec_t
        if not is_first_line or re.match(r'^1\.\s', check_t):
            sp = split_inline_choices(check_t)
            if sp:
                cnos = [cno for cno, _ in sp]
                if 1 in cnos:
                    has_c1 = True
                if 4 in cnos and has_c1:
                    has_c4 = True

    while i < N:
        r = recs[i]
        t = r['t'].strip()
        if r['kind'] == 'text' and t in SECTION_MAP:
            flush()
            cat = SECTION_MAP[t][0]
            cur_qno = 0
            i += 1
            continue
        if r['kind'] == 'text' and (SODOM_INSTR_RE.match(t) or t == 'ข้อ สดมภ์ ก สดมภ์ ข สดมภ์ ค'):
            flush()
            i += 1
            continue
        if r['kind'] == 'text' and CTX_START_RE.match(t):
            flush()
            ctx_recs = [r]
            i += 1
            while i < N:
                nr = recs[i]
                nt = nr['t'].strip()
                if nr['kind'] == 'text' and nt in SECTION_MAP:
                    break
                q_cand = is_q_start(nr, cur_qno, cat, False, True)
                if q_cand is not None:
                    break
                m_q = re.match(r'^(\d{1,3})\.\s+', nt) if nr['kind'] == 'text' else None
                if m_q and int(m_q.group(1)) in (cur_qno + 1, cur_qno):
                    break
                ctx_recs.append(nr)
                i += 1
            qs, qe = infer_ctx_range(yr, st, cat, cur_qno, ctx_recs)
            ctx_txt = format_ctx_block(ctx_recs)
            if ctx_txt:
                contexts.append((cat, qs, qe, ctx_txt))
            continue

        q_cand = is_q_start(r, cur_qno, cat, has_c1, has_c4)
        if q_cand is not None:
            flush()
            cur_qno = q_cand
            cur_recs = [r]
            if r['kind'] == 'sodom':
                has_c1 = has_c4 = True
            elif r['kind'] == 'text':
                update_choice_flags(t, is_first_line=True)
            i += 1
            continue

        if cur_recs:
            cur_recs.append(r)
            if r['kind'] == 'text':
                update_choice_flags(t, is_first_line=False)
        i += 1

    flush()
    return items


# ============================================================================
# PART 6: Answer-Key Parser, Choice Synthesizer, Catalogs, SQL Writer & Checks
# ============================================================================
import math
import sqlite3
import sys
from fractions import Fraction

sys.stdout.reconfigure(encoding='utf-8')

CACHE_59_64_PATH = r'C:\Users\Boss-QA\.gemini\antigravity\brain\eb38cd11-f6b1-437f-84db-2cb8f4b5082c\scratch\cache_59_64.json'


def parse_s_stream(yr, st, s_recs):
    cat = 'ความสามารถในการคิดวิเคราะห์'
    cur_qno = 0
    sols = {}
    cur_lines = []

    def flush():
        nonlocal cur_lines
        if cur_qno > 0 and cur_lines:
            sols.setdefault((cat, cur_qno), []).append('\n'.join(cur_lines).strip())
        cur_lines = []

    for r in s_recs:
        t = r['t'].strip()
        if not t or t.startswith('เฉลยข้อสอบ'):
            continue
        if t in SECTION_MAP:
            flush()
            cat = SECTION_MAP[t][0]
            cur_qno = 0
            continue
        m = re.match(r'^(\d{1,3})[\.\)]\s*(.*)$', t)
        if m:
            n = int(m.group(1))
            rest = m.group(2).strip()
            has_kw = bool(re.search(r'(?:^ตอบ|ตอบ\s|ข้อสรุปที่|วิธีคิด|คำอธิบาย|กรณีที่)', rest)) or bool(re.match(r'^[1-4]\s*\)', rest))
            is_next = False
            if yr == '2559' and cat == 'ความสามารถในการคิดวิเคราะห์' and cur_qno == 24 and n == 26 and '60,200' in rest:
                n = 25
                is_next = True
            elif cur_qno == 0 and n == 1:
                is_next = True
            elif n in (1, 2, 3, 4) and not has_kw and cur_qno >= 1:
                is_next = False
            elif n == cur_qno + 1:
                is_next = True
            elif n == cur_qno and n in (31, 52) and has_kw:
                is_next = True
            elif cur_qno < n <= cur_qno + 4 and has_kw:
                is_next = True
            if is_next:
                flush()
                cur_qno = n
                cur_lines = [t]
                continue
        if cur_qno > 0:
            cur_lines.append(t)
    flush()
    return sols


def evaluate_condition_answer(s_body: str) -> str:
    m1 = re.search(r'ข้อสรุปที่\s*1[\s\S]{0,220}?(ไม่แน่ชัด|ไม่เป็นจริง|เป็นเท็จ|เท็จ|เป็นจริง|จริง)', s_body)
    m2 = re.search(r'ข้อสรุปที่\s*2[\s\S]{0,220}?(ไม่แน่ชัด|ไม่เป็นจริง|เป็นเท็จ|เท็จ|เป็นจริง|จริง)', s_body)
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


def resolve_answer_59_64(sb: str, choices: list, yr: str, st: str, cat: str, qno: int) -> str:
    if yr == '2559' and cat == 'ภาษาอังกฤษ' and qno == 20:
        return '4'
    if yr == '2562' and cat == 'ภาษาอังกฤษ' and qno == 4:
        return '2'
    if yr == '2563' and cat == 'ความสามารถในการคิดวิเคราะห์' and qno == 19:
        return 'VALUE_AT_4:201'
    if yr == '2564' and st == 'Paper' and cat == 'ความสามารถในการคิดวิเคราะห์' and qno in (52, 55):
        return '3'
    if yr == '2564' and st == 'e-Exam' and cat == 'ความสามารถในการคิดวิเคราะห์' and qno == 29:
        return 'VALUE:186'
    if not sb:
        return ''
    m = re.search(r'ตอบ\s*([1-4])\s*[\)\.]', sb)
    if m and len(choices) == 4:
        return m.group(1)
    m_hdr = re.match(r'^\d{1,3}[\.\)]\s*([1-4])\s*\)', sb)
    if m_hdr and len(choices) == 4:
        return m_hdr.group(1)
    if re.search(r'ข้อสรุปที่\s*1', sb) and re.search(r'ข้อสรุปที่\s*2', sb):
        ev = evaluate_condition_answer(sb)
        if ev:
            return ev
    m_any = re.search(r'ตอบ\s*(?:ข้อ\s*)?([1-4])(?:\s|$)', sb.splitlines()[0])
    if m_any and len(choices) == 4:
        cand = m_any.group(1)
        matched = [str(ci) for ci, ch in enumerate(choices, 1) if ch.strip() == cand]
        if matched and not re.search(r'ตอบ\s*' + cand + r'\s*[\)\.]', sb):
            return matched[0]
        return cand
    first_ln = sb.splitlines()[0]
    m_val = re.search(r'ตอบ\s+(.+)$', first_ln)
    if m_val:
        val = m_val.group(1).strip()
        if len(choices) == 4:
            for ci, ch in enumerate(choices, 1):
                c_clean = ch.strip()
                if c_clean and (c_clean == val or val.startswith(c_clean) or c_clean in val):
                    return str(ci)
        return f'VALUE:{val}'
    return ''


def build_choices_for_missing(val_str: str, q_id: str, force_idx=None):
    h = int(hashlib.md5(q_id.encode('utf-8')).hexdigest(), 16)
    target_idx = (force_idx - 1) if force_idx is not None else (h % 4)

    special_map = {
        '7b': ['5b', '6b', '8b'],
        'คนละ 19 แผ่น': ['คนละ 15 แผ่น', 'คนละ 23 แผ่น', 'คนละ 27 แผ่น'],
        '3/(4xy)': ['3/(4(x+y))', '4/(3xy)', '(3x)/(4y)'],
        '3A – x – y': ['A – x – y', '3A + x + y', '(A – x – y)/3'],
        '1 : 2': ['2 : 1', '2 : 3', '3 : 2'],
    }
    if val_str in special_map:
        arr = list(special_map[val_str])
        arr.insert(target_idx, val_str)
        return arr, str(target_idx + 1)

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

    m_num = re.match(r'^(-?[\d,]+(?:\.\d+)?)(.*)$', val_str.strip())
    if m_num:
        raw_num = m_num.group(1)
        unit = m_num.group(2)
        has_comma = ',' in raw_num
        num_clean = raw_num.replace(',', '')
        is_float = '.' in num_clean
        dec_places = len(num_clean.split('.')[1]) if is_float else 0
        val = float(num_clean) if is_float else int(num_clean)

        abs_v = abs(val)
        if abs_v == 0:
            steps = [-2, 2, 4, -4, 6]
        elif is_float:
            steps = [-2.5, 2.5, 5.0, -5.0, 1.5]
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

        dists = []
        for st in steps:
            nv = val + st
            if val > 0 and nv <= 0 and unit:
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
        arr = dists[:3]
        arr.insert(target_idx, val_str)
        return arr, str(target_idx + 1)

    raise ValueError(f'Cannot synthesize distractors for {q_id}: {val_str!r}')


def determine_catalogs(cat: str, q_text: str, exp_text: str, is_sodom=False) -> str:
    if is_sodom or 'สดมภ์' in q_text:
        return json.dumps(['คณิตศาสตร์ทั่วไป', 'สดมภ์'], ensure_ascii=False)
    plain_q = re.sub(r'</?(?:table|thead|tbody|tr|th|td|svg|polygon|line|text|p|strong|br|div|span)\b[^>]*>', ' ', q_text)
    text = (plain_q + ' ' + exp_text).lower()
    if cat == 'ภาษาอังกฤษ':
        if any(w in text for w in ['conversation', 'situation', 'appointment', 'dialogue', 'hotel', 'receptionist', 'waiter', 'customer', 'mr. jim', 'linda']):
            return json.dumps(['บทสนทนา'], ensure_ascii=False)
        if any(w in text for w in ['passage', 'reading', 'letter', 'article', 'paragraph', 'according to', 'john lennon', 'sphinx', 'malthus']):
            return json.dumps(['Reading'], ensure_ascii=False)
        if any(w in text for w in ['meaning', 'synonym', 'antonym', 'definition', 'closest in meaning', 'vocabulary', 'ความหมาย']):
            return json.dumps(['Vocabulary'], ensure_ascii=False)
        return json.dumps(['Grammar'], ensure_ascii=False)

    if cat == 'ความรู้และลักษณะการเป็นข้าราชการที่ดี':
        if any(w in text for w in ['ระเบียบบริหารราชการแผ่นดิน', 'นายกรัฐมนตรี', 'กระทรวง', 'ทบวง', 'กรม', 'จังหวัด', 'อำเภอ', 'ผู้ว่าราชการ']):
            return json.dumps(['พ.ร.บ.ระเบียบบริหารราชการแผ่นดิน'], ensure_ascii=False)
        if any(w in text for w in ['บ้านเมืองที่ดี', 'กิจการบ้านเมืองที่ดี', 'ประโยชน์สุข', 'สัมฤทธิผล', 'ลดขั้นตอน', 'คุ้มค่า', 'ก.พ.ร.']):
            return json.dumps(['พ.ร.ฎ.การบริหารกิจการบ้านเมืองที่ดี'], ensure_ascii=False)
        if any(w in text for w in ['วิธีปฏิบัติราชการทางปกครอง', 'คำสั่งทางปกครอง', 'เจ้าหน้าที่', 'เพิกถอน', 'อุทธรณ์']):
            return json.dumps(['พ.ร.บ.วิธีปฏิบัติราชการทางปกครอง'], ensure_ascii=False)
        if any(w in text for w in ['ละเมิด', 'ความรับผิดทางละเมิด', 'ชดใช้ค่าสินไหม']):
            return json.dumps(['พ.ร.บ.ความรับผิดทางละเมิดของเจ้าหน้าที่'], ensure_ascii=False)
        if any(w in text for w in ['มาตรฐานทางจริยธรรม', 'องค์กรกลางทางจริยธรรม', 'ประมวลจริยธรรม', 'ก.ม.จ.']):
            return json.dumps(['พ.ร.บ.มาตรฐานทางจริยธรรม'], ensure_ascii=False)
        if any(w in text for w in ['อาญา', 'ความผิดต่อตำแหน่งหน้าที่', 'สินบน', 'ทุจริต', 'มาตรา 147', 'มาตรา 148', 'มาตรา 149', 'มาตรา 157']):
            return json.dumps(['กฎหมายอาญา (ความผิดต่อตำแหน่งหน้าที่)'], ensure_ascii=False)
        return json.dumps(['กฎหมายข้าราชการที่ดี'], ensure_ascii=False)

    if '<table' in q_text or any(w in plain_q for w in ['จากข้อมูลในตาราง', 'จากตาราง']):
        return json.dumps(['ตาราง'], ensure_ascii=False)
    if '::' in plain_q or 'อุปมาอุปไมย' in plain_q:
        return json.dumps(['อุปมาอุปไมย'], ensure_ascii=False)
    if 'ข้อสรุปที่ 1' in plain_q or 'ข้อสรุปที่ 2' in plain_q:
        if any(w in plain_q for w in ['ฝ่าย', 'ลูกน้อง', 'ซื้อ', 'ร่ม', 'ผ้าไหม', 'คน', 'ทำงาน', 'ลำดับ', 'ดอกไม้', 'หงอนไก่', 'ผู้หญิง', 'ผู้ชาย', 'โรงแรม']):
            return json.dumps(['เงื่อนไขภาษา'], ensure_ascii=False)
        return json.dumps(['เงื่อนไขสัญลักษณ์'], ensure_ascii=False)
    if any(w in plain_q for w in ['อยู่ในลำดับที่', 'อยู่ลำดับที่', 'เป็นประโยคลำดับที่', 'เรียงลำดับประโยค', 'เรียงลำดับข้อความ', 'เรียงประโยค']):
        return json.dumps(['ภาษาไทย', 'เรียงประโยค'], ensure_ascii=False)
    if any(w in plain_q for w in ['บทความ', 'สาระสำคัญ', 'ใจความสำคัญ', 'ข้อใดสอดคล้อง', 'ข้อความข้างต้น', 'คำสัมภาษณ์']):
        return json.dumps(['ภาษาไทย', 'บทความ'], ensure_ascii=False)
    if '*' in plain_q or 'โอเปอเรชัน' in plain_q:
        return json.dumps(['คณิตศาสตร์ทั่วไป', 'โอเปอเรชัน'], ensure_ascii=False)
    if re.search(r'\.{3,}', plain_q) and re.search(r'(?:-?\d+/\d+|-?\d+)', plain_q):
        return json.dumps(['คณิตศาสตร์ทั่วไป', 'อนุกรม'], ensure_ascii=False)
    return json.dumps(['คณิตศาสตร์ทั่วไป'], ensure_ascii=False)


def format_stem_ellipses(stem: str) -> str:
    if re.search(r'(?:\.\s*){2,}\.', stem):
        stem = re.sub(r'(?:\.\s*){2,}\.', '....', stem)
        stem = re.sub(r'(\S)\.\.\.\.', r'\1 ....', stem)
        stem = re.sub(r'\.\.\.\.(?=[^\s\.,?!:;\)\]])', '.... ', stem)
        stem = re.sub(r'\.\.\.\.:', '.... :', stem)
    return stem.strip()


def load_streams(use_cache=True):
    if use_cache and os.path.exists(CACHE_59_64_PATH):
        with open(CACHE_59_64_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    cache = {}
    for yr, st, qf, sf in SETS:
        tag = f'{yr}_{st}'
        print(f'Extracting {tag}...', flush=True)
        q_recs = pdf_stream(os.path.join(Q_DIR, qf), 'Q')
        s_recs = pdf_stream(os.path.join(S_DIR, sf), 'S')
        for r in q_recs + s_recs:
            t = r['t']
            if '3₀5_(km)' in t:
                t = '35. ตอบ 2) 103 บาท (0 -> 5 km -> 45 km -> 77 km)'
            if '_(' in t:
                t = re.sub(r'(?<!_)_\(([^)]+)\)(?!_)', r' \1', t)
            if '^(' in t:
                t = re.sub(r'\^\(([^)]+/[^)]+)\)', r'(\1)', t)
            t = re.sub(r'(/\S+?)([=><≥≤≠])', r'\1 \2', t)
            r['t'] = t
        cache[tag] = {'q': q_recs, 's': s_recs}
    os.makedirs(os.path.dirname(CACHE_59_64_PATH), exist_ok=True)
    with open(CACHE_59_64_PATH, 'w', encoding='utf-8') as f:
        json.dump(cache, f, ensure_ascii=False)
    return cache


def build_all_records(use_cache=True):
    cache = load_streams(use_cache=use_cache)
    all_records = []
    per_set_counts = {}

    for yr, st, qf, sf in SETS:
        tag = f'{yr}_{st}'
        qs = parse_q_stream(yr, st, cache[tag]['q'])
        sols = parse_s_stream(yr, st, cache[tag]['s'])
        sol_cursors = {}

        for idx, q in enumerate(qs, 1):
            q_id = f'{yr}_{st}_{idx:03d}'
            key = (q['cat'], q['qno'])
            c_idx = sol_cursors.get(key, 0)
            s_list = sols.get(key, [])
            sb = s_list[c_idx] if c_idx < len(s_list) else (s_list[-1] if s_list else '')
            sol_cursors[key] = c_idx + 1

            choices = list(q['choices'])
            ans = resolve_answer_59_64(sb, choices, yr, st, q['cat'], q['qno'])

            if len(choices) != 4:
                if ans.startswith('VALUE_AT_4:'):
                    raw_val = ans.split(':', 1)[1]
                    choices, ans = build_choices_for_missing(raw_val, q_id, force_idx=4)
                elif ans.startswith('VALUE:'):
                    raw_val = ans.split(':', 1)[1]
                    choices, ans = build_choices_for_missing(raw_val, q_id)
                else:
                    raise ValueError(f'{q_id} missing 4 choices and ans={ans!r}')

            if ans not in ('1', '2', '3', '4'):
                raise ValueError(f'{q_id} unresolved answer: {ans!r}')

            exp_tag = f'ข้อสอบจริง ก.พ. ปี {yr} ชุด {st}'
            exp_body = sb.strip()
            exp = f'{exp_tag}\n\n{exp_body}' if exp_body else f'{exp_tag}\n\nเฉลย: {ans}) {choices[int(ans) - 1]}'

            q_text_clean = format_stem_ellipses(q['stem'].replace('\r', '').strip())
            exp_clean = exp.replace('\r', '').strip()
            choices_clean = [c.replace('\r', '').strip() for c in choices]
            if q_id == '2561_Paper_009' and choices_clean[3] == '32':
                choices_clean[3] = '84'
            elif q_id == '2562_Paper_075' and choices_clean[3] == choices_clean[0]:
                choices_clean[3] = '4 – 2 – 3 - 1'
            elif q_id == '2563_Paper_094' and choices_clean[1] == choices_clean[0]:
                choices_clean[1] = 'เลิก'
            elif q_id == '2563_Paper_146' and choices_clean[3] == choices_clean[1]:
                choices_clean[3] = 'อุทธรณ์ต่อเจ้าหน้าที่ผู้มีอำนาจภายใน 30 วัน นับแต่วันที่ได้รับแจ้ง'
            elif q_id == '2564_Paper_121' and choices_clean[3] == choices_clean[2]:
                choices_clean[3] = 'smoking'
            skill = 'ความสามารถทั่วไป' if q['cat'] == 'ความสามารถในการคิดวิเคราะห์' else ('ภาษาอังกฤษ' if q['cat'] == 'ภาษาอังกฤษ' else 'กฎหมาย')

            all_records.append({
                'id': q_id,
                'question_text': q_text_clean,
                'choices': json.dumps(choices_clean, ensure_ascii=False),
                'correct_answer': ans,
                'explanation': exp_clean,
                'category': q['cat'],
                'subject': 'กพ ภาค ก',
                'difficulty': 0,
                'skill': skill,
                'catalogs': determine_catalogs(q['cat'], q_text_clean, exp_clean, is_sodom=bool(q.get('is_sodom'))),
                'exam_year': yr,
                'exam_set': st,
                'is_custom': 0,
            })

        per_set_counts[(yr, st)] = len(qs)

    return all_records, per_set_counts


def sql_str(v: str) -> str:
    return "'" + v.replace("'", "''") + "'"


def write_sql(records, out_path=OUT_SQL):
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write('-- Audited & Fixed Questions for 2559-2564 (7 sets)\n')
        for yr, st, _, _ in SETS:
            f.write(f"DELETE FROM questions WHERE exam_year = {sql_str(yr)} AND exam_set = {sql_str(st)};\n")
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
                sql_str(r['skill']),
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
    print('=== PER-SET COUNTS (2559-2564) ===')
    for (yr, st), cnt in per_set_counts.items():
        print(f'  {yr} / {st}: {cnt}')
    print(f'Total records: {len(records)}')

    ids = [r['id'] for r in records]
    assert len(ids) == len(set(ids)), 'Duplicate IDs!'

    for r in records:
        assert r['correct_answer'] in ('1', '2', '3', '4'), f"Bad answer on {r['id']}"
        ch = json.loads(r['choices'])
        assert isinstance(ch, list) and len(ch) == 4, f"Not 4 choices on {r['id']}"
        assert all(isinstance(x, str) and len(x.strip()) > 0 for x in ch), f"Empty choice on {r['id']}"
        assert len(set(ch)) == 4, f"Duplicate choice text on {r['id']}: {ch}"
        assert all('\n' not in x for x in ch), f"Newline inside choice on {r['id']}"
        assert 'GO! ราชการ' not in r['question_text'], f"Header leaked in {r['id']}"
        assert not any(0x1D400 <= ord(c) <= 0x1D7FF for c in r['question_text'] + r['choices'] + r['explanation']), f"Unicode math italic in {r['id']}"
        assert not re.search(r'[\u0E01-\u0E2E][ \t]+[\u0E48-\u0E4B]?า', r['question_text'] + ' ' + r['choices']), f"Broken Sara Am in {r['id']}"
        assert r['question_text'].strip(), f"Empty question_text on {r['id']}"
        json.loads(r['catalogs'])

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
