#!/usr/bin/env python3
"""Detect and fix leaked next-question contexts in D1 `questions.explanation`.

Reads rows from remote Cloudflare D1 (`preexam`) via `npx wrangler d1 execute`
(or an existing Wrangler JSON dump via `--input`), strips trailing blocks that
leaked from the next question or range, propagates helpful summaries/tables/
equations/translations right after the `ข้อสอบจริง ก.พ. ปี ...` header on the
target questions when not already present, and writes:
  - D:\\DEV\\PreExamV2\\worker\\fix_leaked_explanations.sql

Also provides `--verify` to run a post-execution scan on live remote D1 and
confirm zero remaining leaks.
"""

from __future__ import annotations

import argparse
import json
import re
import sqlite3
import subprocess
import sys
from collections import defaultdict
from pathlib import Path
from typing import Any

WORKER_DIR = Path(r"D:\DEV\PreExamV2\worker")
DEFAULT_SQL_PATH = WORKER_DIR / "fix_leaked_explanations.sql"

RANGE_RE = re.compile(r"(\d+)\s*[-–—]\s*(\d+)")
RANGE_IN_TEXT_RE = re.compile(
    r"(?:ข้อ(?:ที่)?\s*|\()\s*(\d+)\s*[-–—]\s*(\d+)\s*\)?"
)

RANGE_HEADER_PREFIXES = (
    "จากข้อมูลในตาราง",
    "จากตาราง",
    "จากเงื่อนไข",
    "จากโจทย์ที่กำหนดให้สำหรับ",
    "จงอ่านบทสนทนา",
    "จงอ่านบทความ",
    "คำแปลบทสนทนา",
    "คำแปลบทความ",
    "หลักในการทำคำตอบ",
    "บทสนทนาข้อที่",
    "Directions",
    "Situation",
    "Conversation",
)

HELPFUL_MARKERS = (
    "ได้ตารางสรุป",
    "สามารถสร้าง",
    "สร้างเป็นตาราง",
    "ตารางข้อมูล",
    "แปลงออกมาเป็นข้อมูล",
    "เรียบเรียงเงื่อนไข",
    "เรียบเรียงสมการ",
    "จัดเรียงสมการ",
    "แปลงเงื่อนไข",
    "แปลงสัญลักษณ์",
    "สามารถเรียงลำดับ",
    "จากโจทย์เรียงลำดับ",
    "จงอ่านบทสนทนา",
    "บทสนทนาข้อที่",
    "คำแปล",
    "Conversation",
    "Reading",
    "สถานการณ์:",
    "At present I’m",
    "At present I'm",
)


def query_remote_d1(sql: str) -> list[dict[str, Any]]:
    """Run a read-only Wrangler D1 query and return its result rows."""
    cmd = [
        "npx",
        "wrangler",
        "d1",
        "execute",
        "preexam",
        "--remote",
        "--json",
        f"--command={sql}",
    ]
    proc = subprocess.run(
        cmd,
        cwd=str(WORKER_DIR),
        capture_output=True,
        text=True,
        encoding="utf-8",
        shell=True,
        check=True,
    )
    payload = json.loads(proc.stdout.lstrip("\ufeff"))
    return payload[0]["results"]


def load_rows_from_json(path: Path) -> list[dict[str, Any]]:
    """Load rows from a Wrangler `--json` output file."""
    with path.open("r", encoding="utf-8-sig") as f:
        payload = json.load(f)
    return payload[0]["results"]


def extract_range_pairs(text: str) -> set[tuple[int, int]]:
    """Return all (start, end) integer ranges in a question/header string."""
    pairs: set[tuple[int, int]] = set()
    for m in RANGE_IN_TEXT_RE.finditer(text or ""):
        a, b = int(m.group(1)), int(m.group(2))
        if a < b:
            pairs.add((a, b))
    return pairs


def extract_named_section(line: str) -> str | None:
    """Return normalized section prefix like 'Conversation 2' or 'Reading 1'."""
    m = re.match(r"^(Conversation\s+\d+|Reading\s+\d+)\b", line.strip(), re.I)
    if m:
        return re.sub(r"\s+", " ", m.group(1)).lower()
    return None


def detect_leak_start(
    row: dict[str, Any],
    next_row: dict[str, Any] | None,
) -> tuple[int, str, tuple[int, int] | None, str | None] | None:
    """Detect if `row['explanation']` has a leaked trailing block from next Q.

    Returns `(line_index, kind, range_pair, target_hint)` or None.
    - `kind` is one of: `'range'`, `'named_section'`, `'raw_table'`,
      `'sdom_header'`, `'cloze_next'`, `'orphan_condition'`, `'situation'`.
    """
    exp = row.get("explanation") or ""
    lines = exp.splitlines()
    if len(lines) <= 2:
        return None

    qtext = row.get("question_text") or ""
    q_ranges = extract_range_pairs(qtext)
    nqtext = (next_row.get("question_text") or "") if next_row else ""
    nq_first = nqtext.splitlines()[0].strip() if nqtext.strip() else ""

    for idx in range(2, len(lines)):
        s = lines[idx].strip()
        if not s:
            continue

        # 1. Stray สดมภ์ table header line at the end of a preceding solution
        if re.match(r"^ข้อ\s*\|\s*สดมภ์", s):
            return (idx, "sdom_header", None, None)

        # 2. Raw table title leaked before a table question (e.g. 2566_Paper_017)
        if s.startswith("ตารางแสดงข้อมูล") and s not in qtext and s in nqtext:
            return (idx, "raw_table", extract_range_pairs(nqtext).pop() if extract_range_pairs(nqtext) else None, s)

        # 3. Range-annotated shared header
        if any(s.startswith(p) for p in RANGE_HEADER_PREFIXES):
            rpairs = extract_range_pairs(s)
            if not rpairs:
                # Try plain X - Y in header line if keyword matched
                m = RANGE_RE.search(s)
                if m and int(m.group(1)) < int(m.group(2)):
                    rpairs = {(int(m.group(1)), int(m.group(2)))}
            if rpairs:
                # Valid only if question_text shares one of those ranges
                if not (rpairs & q_ranges):
                    rng = next(iter(rpairs))
                    if s.startswith("จากข้อมูลในตาราง") or s.startswith("จากตาราง"):
                        return (idx, "raw_table", rng, s)
                    return (idx, "range", rng, None)
            else:
                # Named section without range: Conversation 2, Reading 1, Reading 2
                sec = extract_named_section(s)
                if sec:
                    q_sec = extract_named_section(qtext.lstrip())
                    if q_sec != sec:
                        return (idx, "named_section", None, sec)

        # 4. Reading 1 / Reading 2 (not in RANGE_HEADER_PREFIXES)
        sec = extract_named_section(s)
        if sec and sec.startswith("reading "):
            q_sec = extract_named_section(qtext.lstrip())
            if q_sec != sec:
                return (idx, "named_section", None, sec)

        # 5. Situation header in Thai (e.g. สถานการณ์: สัมภาษณ์งาน -> Situation : Job interview)
        if s.startswith("สถานการณ์:") and nq_first.lower().startswith("situation"):
            if not qtext.lstrip().lower().startswith("situation"):
                return (idx, "situation", None, "situation")

        # 6. Exact orphan 'เงื่อนไข' block whose bullet matches next question
        if s == "เงื่อนไข" and idx + 1 < len(lines):
            nxt_line = lines[idx + 1].strip()
            if nxt_line.startswith("-") and nxt_line[:25] in nqtext and nxt_line[:25] not in qtext:
                return (idx, "orphan_condition", None, nxt_line[:35])

        # 7. Next question's English Cloze passage leaked after choices 1..4
        if (
            row.get("category") == "ภาษาอังกฤษ"
            and nq_first
            and len(s) >= 25
            and (s == nq_first or nq_first.startswith(s))
            and s not in qtext
        ):
            return (idx, "cloze_next", None, nq_first)

    return None


def is_helpful_block(block: str, kind: str) -> bool:
    """Return True if the stripped block should be propagated to target Qs."""
    if kind in ("raw_table", "sdom_header"):
        return False
    return any(marker in block for marker in HELPFUL_MARKERS)


def find_target_rows(
    rows: list[dict[str, Any]],
    src_idx: int,
    kind: str,
    rng: tuple[int, int] | None,
    hint: str | None,
) -> list[dict[str, Any]]:
    """Locate contiguous target rows immediately following `src_idx`."""
    src = rows[src_idx]
    targets: list[dict[str, Any]] = []
    for j in range(src_idx + 1, len(rows)):
        cand = rows[j]
        if (
            cand["exam_year"] != src["exam_year"]
            or cand["exam_set"] != src["exam_set"]
            or cand["category"] != src["category"]
        ):
            break
        qt = cand.get("question_text") or ""
        matched = False
        if kind == "range" and rng is not None:
            matched = rng in extract_range_pairs(qt)
        elif kind == "named_section" and hint is not None:
            matched = extract_named_section(qt.lstrip()) == hint
        elif kind == "situation":
            matched = qt.lstrip().lower().startswith("situation")
        elif kind == "orphan_condition" and hint is not None:
            matched = hint in qt
        elif kind == "cloze_next" and hint is not None:
            cand_first = qt.splitlines()[0].strip() if qt.strip() else ""
            matched = bool(cand_first and (cand_first == hint or cand_first.startswith(hint[:25])))

        if matched:
            targets.append(cand)
        elif targets:
            # Stop once we leave the contiguous target block
            break
        else:
            break
    return targets


def split_header_and_body(exp: str) -> tuple[str, str, str]:
    """Split explanation into (header_line, body, newline_sep)."""
    sep = "\r\n" if "\r\n" in exp else "\n"
    lines = exp.splitlines()
    if lines and lines[0].startswith("ข้อสอบจริง ก.พ. ปี"):
        body = sep.join(lines[1:]).lstrip("\r\n")
        return lines[0], body, sep
    return "", exp, sep


def already_contains_block(target_exp: str, block: str) -> bool:
    """Check whether `target_exp` already contains the leaked summary/context."""
    block_lines = [l.strip() for l in block.splitlines() if l.strip()]
    if not block_lines:
        return True
    target_lines = {l.strip() for l in target_exp.splitlines() if l.strip()}
    first = block_lines[0]
    if first in target_lines:
        return True
    if len(first) >= 20 and first in target_exp:
        return True
    if len(block_lines) > 1 and len(block_lines[1]) >= 20 and block_lines[1] in target_exp:
        return True
    return False


def sql_escape(text: str) -> str:
    """Escape single quotes for SQLite string literals."""
    return text.replace("'", "''")


def process_rows(rows: list[dict[str, Any]]) -> tuple[dict[str, str], list[dict[str, Any]]]:
    """Compute updated explanations `{id: new_explanation}` and audit log."""
    by_set: dict[tuple[str, str], list[dict[str, Any]]] = defaultdict(list)
    for r in rows:
        by_set[(r["exam_year"], r["exam_set"])].append(r)

    updates: dict[str, str] = {}
    pending_prepends: list[tuple[list[dict[str, Any]], str, dict[str, Any]]] = []
    events: list[dict[str, Any]] = []

    # Pass 1: detect leaks and strip strictly on original row text
    for (_, _), qlist in sorted(by_set.items()):
        for idx, row in enumerate(qlist):
            nxt = qlist[idx + 1] if idx + 1 < len(qlist) else None
            hit = detect_leak_start(row, nxt)
            if not hit:
                continue

            line_idx, kind, rng, hint = hit
            orig_exp = row.get("explanation") or ""
            sep = "\r\n" if "\r\n" in orig_exp else "\n"
            lines = orig_exp.splitlines()
            kept = sep.join(lines[:line_idx]).rstrip("\r\n")
            leaked = sep.join(lines[line_idx:]).strip("\r\n")

            if not kept.strip():
                raise RuntimeError(
                    f"Refusing to leave empty explanation for {row['id']}"
                )

            updates[row["id"]] = kept
            ev: dict[str, Any] = {
                "source_id": row["id"],
                "kind": kind,
                "range": rng,
                "leaked_preview": leaked.splitlines()[0][:80],
                "stripped_lines": len(lines) - line_idx,
                "propagated_to": [],
            }
            events.append(ev)

            if is_helpful_block(leaked, kind):
                targets = find_target_rows(qlist, idx, kind, rng, hint)
                if targets:
                    pending_prepends.append((targets, leaked, ev))

    # Pass 2: prepend helpful blocks after header without affecting Pass 1 indices
    for targets, leaked, ev in pending_prepends:
        for trow in targets:
            cur_texp = updates.get(trow["id"], trow.get("explanation") or "")
            if already_contains_block(cur_texp, leaked):
                continue
            hdr, body, tsep = split_header_and_body(cur_texp)
            if hdr:
                new_texp = f"{hdr}{tsep}{tsep}{leaked}{tsep}{tsep}{body}"
            else:
                new_texp = f"{leaked}{tsep}{tsep}{body}"
            updates[trow["id"]] = new_texp
            ev["propagated_to"].append(trow["id"])

    return updates, events


def write_sql_file(updates: dict[str, str], sql_path: Path) -> None:
    """Write UPDATE statements to `sql_path` preserving exact newline bytes."""
    stmts = [
        "-- Fix leaked next-question contexts in questions.explanation",
        f"-- Total rows updated: {len(updates)}",
        "",
    ]
    for qid in sorted(updates):
        escaped_exp = sql_escape(updates[qid])
        escaped_id = sql_escape(qid)
        stmts.append(
            f"UPDATE questions SET explanation = '{escaped_exp}' WHERE id = '{escaped_id}';"
        )
    with sql_path.open("w", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(stmts) + "\n")


def validate_sql_in_sqlite(rows: list[dict[str, Any]], sql_path: Path) -> list[dict[str, Any]]:
    """Apply `sql_path` in an in-memory SQLite copy and re-run leak scan."""
    conn = sqlite3.connect(":memory:")
    conn.execute(
        """
        CREATE TABLE questions (
            id TEXT PRIMARY KEY,
            question_text TEXT,
            explanation TEXT,
            category TEXT,
            exam_year TEXT,
            exam_set TEXT
        )
        """
    )
    conn.executemany(
        "INSERT INTO questions (id, question_text, explanation, category, exam_year, exam_set) VALUES (?, ?, ?, ?, ?, ?)",
        [
            (
                r["id"],
                r.get("question_text"),
                r.get("explanation"),
                r.get("category"),
                r.get("exam_year"),
                r.get("exam_set"),
            )
            for r in rows
        ],
    )
    conn.executescript(sql_path.read_text(encoding="utf-8"))
    cur = conn.execute(
        "SELECT id, exam_year, exam_set, category, question_text, explanation FROM questions ORDER BY id"
    )
    cols = [d[0] for d in cur.description]
    post_rows = [dict(zip(cols, rec)) for rec in cur.fetchall()]
    conn.close()

    # Check zero empty explanations & zero remaining leaks
    empty_ids = [r["id"] for r in post_rows if not (r.get("explanation") or "").strip()]
    if empty_ids:
        raise RuntimeError(f"Empty explanations after SQL: {empty_ids}")

    _, remaining = process_rows(post_rows)
    if remaining:
        raise RuntimeError(f"Remaining leaks detected after SQL: {remaining}")
    return post_rows


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--input",
        type=Path,
        default=None,
        help="Optional path to Wrangler D1 JSON dump (defaults to live remote D1 query).",
    )
    parser.add_argument(
        "--output-sql",
        type=Path,
        default=DEFAULT_SQL_PATH,
        help="Path for generated SQL file.",
    )
    parser.add_argument(
        "--verify",
        action="store_true",
        help="Query live remote D1 and confirm 0 remaining leaks (without writing SQL).",
    )
    args = parser.parse_args()

    sql = "SELECT id, exam_year, exam_set, category, question_text, explanation FROM questions ORDER BY id"
    rows = load_rows_from_json(args.input) if args.input else query_remote_d1(sql)
    print(f"Loaded {len(rows)} rows")

    updates, events = process_rows(rows)
    stripped_count = len(events)
    propagated_count = sum(len(e["propagated_to"]) for e in events)
    print(
        f"Detected {stripped_count} leaked source rows; "
        f"propagated to {propagated_count} target rows; "
        f"total unique rows to update: {len(updates)}"
    )

    for ev in events:
        targets_str = ",".join(ev["propagated_to"]) if ev["propagated_to"] else "(strip-only)"
        print(
            f"  - {ev['source_id']} [{ev['kind']} {ev['range'] or ''}] "
            f"(-{ev['stripped_lines']} lines: {ev['leaked_preview']}) -> {targets_str}"
        )

    if args.verify:
        if events:
            print("FAIL: leaks still present on remote D1!", file=sys.stderr)
            return 1
        print("PASS: 0 remaining leaked explanations on remote D1.")
        return 0

    write_sql_file(updates, args.output_sql)
    print(f"Wrote SQL to {args.output_sql} ({args.output_sql.stat().st_size:,} bytes)")
    validate_sql_in_sqlite(rows, args.output_sql)
    print("In-memory SQLite validation passed: 0 empty explanations, 0 remaining leaks.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
