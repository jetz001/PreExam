---
name: preexam-social-content
description: Manage alternating Facebook Page content for PreExam (สอบ ก.พ. 70 mini-quizzes from D1, live OCSC government job recruitment alerts, and exam prep tips), including 1200x1200 visual generation, Cloudflare R2 upload, and safe community distribution.
---

# PreExam Social Content & Alternating Page Workflow

Use this skill whenever creating, scheduling, or automating social media content for the **PreExam** Facebook Page (`preexam.online`).

## 1. 3-Pillar Alternating Content Calendar

Rotate posts across these three pillars so followers get consistent value and never suffer feed fatigue:

| Pillar | Content Focus | Target Frequency | Primary Link |
| :--- | :--- | :--- | :--- |
| **Pillar 1: มินิควิซข้อสอบจริง ก.พ. 70** | Pick 1 short, engaging real past question (อนุกรม, อุปมาอุปไมย, ภาษาไทย, อังกฤษ, กฎหมาย) from D1 `questions` and challenge followers to comment before checking the solution. | Mon / Wed / Fri | `https://preexam.online` |
| **Pillar 2: ข่าวรับสมัครงานราชการล่าสุด** | Highlight 4–5 open government agencies or urgent deadlines (`ปิดรับสมัครเร็วๆ นี้`) from D1 `news` synced with OCSC. | Tue / Thu | `https://preexam.online/news/` |
| **Pillar 3: ทริคสอบ ก.พ. 70 & ห้องสอบกลุ่ม** | Share ก.พ. 70 timeline updates, study checklists, e-Exam vs Paper tips, and invite friends into real-time study rooms / arcade mode. | Sat / Sun | `https://preexam.online` |

---

## 2. Ready-to-Run D1 Queries (Verified Schema)

Run these from `d:\DEV\PreExam` against remote D1 `preexam`:

### Pull Fresh Non-Duplicate Quiz Questions (`questions`)
```powershell
npx --prefix worker wrangler d1 execute preexam --remote --command "SELECT id, exam_year, exam_set, subject, category, skill, question_text, choices, correct_answer, substr(explanation, 1, 200) AS hint FROM questions WHERE is_custom = 0 AND length(question_text) BETWEEN 15 AND 160 AND exam_year IN ('2568','2567','2566','2565') ORDER BY RANDOM() LIMIT 5;"
```
- **Selection rule:** Avoid posting duplicate `id`s recently published; prefer visual/short questions (number series, analogy, vocabulary, short grammar) that fit cleanly inside a `1200×1200` graphic card.
- Note `choices` is stored as JSON; `correct_answer` may be numeric (`"1"-"4"`), Thai letter (`"ก"-"ง"`), or Latin (`"A"-"D"`). Double-check the math/explanation before publishing the answer key.

### Pull Top Open Government Job Recruitment Alerts (`news`)
```powershell
npx --prefix worker wrangler d1 execute preexam --remote --command "SELECT agency, json_extract(metadata,'$.position_type') AS pos_type, count(*) AS positions, sum(CAST(json_extract(metadata,'$.vacancy_count') AS INTEGER)) AS total_vacancies, min(application_start) AS start_date, max(application_end) AS end_date FROM news WHERE status = 'published' GROUP BY agency, pos_type ORDER BY total_vacancies DESC LIMIT 15;"
```
- Always verify `application_end` against today's Thai Buddhist Era date (`พ.ศ. = ค.ศ. + 543`) so expired announcements are excluded.
- Also query individual top positions with `external_link` when featuring a single agency spotlight:
```powershell
npx --prefix worker wrangler d1 execute preexam --remote --command "SELECT trim(title) AS title, content, agency, external_link, application_start, application_end, json_extract(metadata,'$.position_type') AS pos_type, CAST(json_extract(metadata,'$.vacancy_count') AS INTEGER) AS vacancies FROM news WHERE status = 'published' ORDER BY vacancies DESC, created_at DESC LIMIT 15;"
```

---

## 3. Visual Asset Spec & Cloudflare R2 Upload

### Design Standards (`1200×1200` Square Feed Poster)
1. **Engine:** Render HTML/CSS via Playwright Chromium (`@playwright/test` in `d:\DEV\PreExam\node_modules`) + optimize PNG with `sharp` (`d:\DEV\PreExam\node_modules`). Do **not** pollute `src/` or `public/` with temporary post graphics; write temporary scripts/output under the conversation scratch directory.
2. **File Size Constraint:** Facebook Page photo uploads recommend PNGs strictly **under 1 MB** (`< 980 KB`) so Facebook does not downscale/pixelate text. Use `sharp(buf).png({ compressionLevel: 9 })`, falling back to `palette: true` if needed.
3. **Brand Consistency:**
   - Place `d:\DEV\PreExam\public\logo.png` inside a crisp white/frosted pill top-left (`rgba(255,255,255,0.96)`) so the dark-navy wordmark remains high contrast.
   - **Pillar 1 (Quiz / App Promo):** Cosmic Indigo-Purple gradient (`#090d24` -> `#241b5e`), gold CTA pill (`preexam.online`), and PreExam's 4 choice colors: ก Red (`#e11d48`), ข Blue (`#2563eb`), ค Amber (`#d97706`), ง Green (`#16a34a`).
   - **Pillar 2 (Gov Job Roundup):** Deep Navy-Emerald gradient (`#071124` -> `#113044`), urgent crimson highlight (`#f43f5e`) for deadlines closing within 3–5 days, and gold CTA pill (`preexam.online/news/`).
4. **Visual QA:** Always inspect every generated PNG via `read_file` before uploading to ensure crisp Thai tone marks (`ิ ี ุ ู ่ ้`) and zero overflow/clipping.

### Upload to Cloudflare R2 & Verify HTTP 200
```powershell
npx --prefix worker wrangler r2 object put preexam-assets/uploads/<filename>.png --file "<abs_path_to_png>" --content-type "image/png" --remote
curl.exe -s -o NUL -w "%{http_code} %{content_type} %{size_download}`n" "https://preexam.online/api/media/uploads/<filename>.png"
```
- Wait for `200 image/png` on `GET` (`HEAD` is not routed on `/api/media/*`, so verify with `GET`) before passing the public URL to Facebook Page publishing.

---

## 4. Safe Community Distribution Rules ("สอบ ก.พ. 70" Groups)

Never use bots or automated comment-spam scripts on third-party Facebook Pages or Groups (violates Meta platform rules and risks domain/page restrictions on `preexam.online`).

1. **Publish on the official PreExam Page first** (`PreExam` Page ID `531327006721248`) via connected Page automation.
2. **Share organically into relevant study groups** using Facebook's native **Share to Group** button from an admin/personal profile:
   - Target search keywords: `"ติวสอบ ก.พ. 2570"`, `"สอบ ก.พ. 70"`, `"100ข้อ สอบ ก.พ."`, `"กลุ่มติวสอบ ก.พ. ภาค ก"`.
3. **Lead with value, not raw ads:** Include the quiz question or job-deadline summary directly in the share caption so members benefit immediately in-feed, and always respect each group's posting rules and frequency limits (1–2 value-first shares per group per week).

---

## 5. Live Web Discovery (Parallel) & Vertical Reels Pipeline

### Supplementing D1 News with Live Web Discovery
- For Pillar 2 (Gov Jobs) and Pillar 3 (ก.พ. 70 Timeline), use Parallel web search alongside D1 `news` to verify fresh ministry openings (e.g., `กระทรวงการต่างประเทศ`, `อย.`, `กรมท่าอากาศยาน`) and official `job.ocsc.go.th/portal/news` updates.
- Always double-check closing dates against current Thai Buddhist Era dates (`พ.ศ. = ค.ศ. + 543`) before featuring them on a poster or caption.

### Zero-Cost 9:16 Vertical Reels Video (`1080×1920` MP4)
- Render deterministic `1080×1920` @ 25fps H.264 MP4 clips using Playwright Chromium + `ffmpeg` (`-c:v libx264 -pix_fmt yuv420p -crf 19 -movflags +faststart`) for Facebook Reels & TikTok without audio, letting admins attach trending platform music directly in-app.
- Keep all key text inside the Reels/TikTok safe box (top `>= 180px`, bottom `>= 320px`, right `>= 110px`) and inspect at least 4 keyframes via `read_file` before uploading to Cloudflare R2 (`preexam-assets/uploads/<name>.mp4`, verified `200 video/mp4` via `GET`).
- Optionally, when Kling AI credits are topped up, short cinematic background plates (`kling-video-v4_0`, `9:16`) can also be generated after explicit user confirmation.

---

## 6. Preferred Fast Publishing Path: Direct Meta Graph API (`scripts/fb-graph.mjs`)

When `d:\DEV\PreExam\.env.facebook` is configured (`FB_PAGE_ACCESS_TOKEN`), **always prefer `node scripts/fb-graph.mjs`** over Zapier or desktop UI automation:
- Runs in **1–2 seconds**, uploads local PNGs/MP4s directly (no R2 intermediate hop required for photos/Reels), and supports Cover Photo, Profile Picture, Page Bio/About, and Reels uploads cleanly.

### Common Commands
```powershell
node scripts/fb-graph.mjs recent-posts --limit 5
node scripts/fb-graph.mjs post-photo --image "<path_to_png>" --message-file "<utf8_caption.txt>"
node scripts/fb-graph.mjs post-reel --video "<path_to_mp4>" --description-file "<utf8_caption.txt>"
node scripts/fb-graph.mjs set-cover --image "<path_to_cover_png>"
node scripts/fb-graph.mjs set-profile --image "<path_to_avatar_png>"
node scripts/fb-graph.mjs update-info --bio-file "<utf8_bio.txt>"
```
- **Fallback:** If `.env.facebook` does not exist yet or returns a missing-token error, fall back cleanly to the saved Zapier Page workflow (for feed photo/text posts + avatar) after uploading images to Cloudflare R2 (`preexam-assets/uploads/...`).


