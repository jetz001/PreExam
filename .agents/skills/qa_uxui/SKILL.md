---
name: qa-uxui-preexam
description: "QA Skill for checking User Interface and User Experience for the PreExamV2 Next.js application. Trigger this when asked to QA UI, review design, check responsiveness, or inspect visual bugs."
---

# PreExamV2 UX/UI Quality Assurance (QA) Guidelines

This skill defines the standard operating procedure for reviewing and testing UX/UI elements in the PreExamV2 system. When acting as a QA for UX/UI, ALWAYS follow these checkpoints.

## 1. Visual Consistency & Styling
- **Typography**: The app primarily uses `Nunito` / `Sarabun` (or `Geist`). Ensure new components inherit these fonts correctly. Check that headings (`h1` to `h6`) and body text sizes (`text-sm`, `text-lg`, etc.) follow the established hierarchy.
- **Glassmorphism & Playful UI**: The application relies heavily on translucent backgrounds (`bg-white/10`, `backdrop-blur-md`) and rounded corners (`rounded-2xl`, `rounded-[2rem]`). Verify that new components do not break this aesthetic (e.g., avoid flat solid colors where a playful translucent style is expected).
- **Alignment & Readability**: Long text passages (like exam questions) should generally be `text-left` or clearly readable, avoiding center-alignment on large blocks of text.

## 2. Responsiveness (Mobile First)
- **Grid & Flexbox**: Always check how components behave on small screens (`md:`, `lg:` prefixes in Tailwind). Are sidebars collapsing? Are grids (like the 2x2 Kahoot-style choices) converting to 1-column layouts on mobile?
- **Touch Targets**: Ensure buttons and interactive elements have sufficient padding (e.g., `p-2`, `p-4`) for touch devices.

## 3. Interactive States
- **Hover & Focus**: All buttons and links must have a visible `hover:` state (e.g., `hover:bg-white/30`, `hover:scale-105`). Inputs must have `focus:ring` or `focus:border-primary`.
- **Transitions**: Smooth transitions (`transition-all duration-200` or `transition`) should be applied to interactive elements to make the UI feel alive.
- **Loading & Disabled States**: Buttons performing asynchronous tasks must have a loading state (spinner or disabled attribute) to prevent double submissions.

## 4. Accessibility (a11y)
- **Contrast**: Check that text on top of translucent or colored backgrounds is readable (e.g., white text on dark purple).
- **Aria Attributes**: Ensure icon-only buttons (like the `Type` or `Flag` icons) have `title` or `aria-label` attributes for screen readers.

## 5. QA Workflow (Agent Instructions)
When asked to QA a specific component or page:
1. Use `view_file` to read the component's `.jsx` file.
2. Check the imports (Lucide icons, React hooks).
3. Validate against the 4 points above.
4. If issues are found, propose the fix using the `replace_file_content` tool and explain the UX reasoning.
5. Remind the user that since the app is running Next.js in production mode, they may need to `npm run build` after fixes are applied to see them live.
