import os, sys, subprocess

all_sets = [
    ("2559", "Paper"),
    ("2560", "Paper"),
    ("2561", "Paper"),
    ("2562", "Paper"),
    ("2563", "Paper"),
    ("2564", "Paper"),
    ("2564", "e-Exam"),
    ("2565", "Paper"),
    ("2565", "e-Exam1"),
    ("2565", "e-Exam2"),
    ("2566", "Paper"),
    ("2566", "e-Exam1"),
    ("2566", "e-Exam2"),
    ("2566", "e-Exam3"),
    ("2566", "รอบพิเศษ"),
    ("2567", "Paper"),
    ("2567", "e-Exam1"),
    ("2567", "e-Exam2"),
    ("2567", "e-Exam3"),
    ("2567", "รอบพิเศษ")
]

worker_dir = r"D:\DEV\PreExam\worker"

print("Uploading all 20 clean sets to Cloudflare D1...")

for year, name in all_sets:
    sql_file = f"import_{year}_{name}.sql"
    sql_path = os.path.join(worker_dir, sql_file)
    if not os.path.exists(sql_path):
        print(f"File not found: {sql_file}")
        continue
        
    cmd = f"npx wrangler d1 execute preexam --remote --file={sql_file}"
    sub = subprocess.run(cmd, cwd=worker_dir, capture_output=True, encoding="utf-8", errors="ignore", shell=True)
    if sub.returncode == 0:
        print(f"[SUCCESS] {year} {name}")
    else:
        print(f"[FAILED] {year} {name}: {sub.stderr}")

print("\nAll sets uploaded!")
