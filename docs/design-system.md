# YEC Design System

**Product:** Young Entrepreneur Camp (YEC) Competition Management Platform
**Version:** 1.0
**Status:** Baseline UI/UX Source of Truth

---

## 1. Design Direction

Visual identity mengambil DNA dari referensi visual YEC yang diberikan: nature, forest, camp, warm sunset, youthful event, editorial typography, dan premium-but-playful composition.

### Keywords

```text
Adventure
Young Entrepreneur
Warm
Premium
Organic
Playful
Outdoor
Editorial
```

### Design Principle

Landing page = expressive event experience.

Participant portal = friendly and clear.

Admin = professional and data-oriented.

Judge = focused evaluation workspace.

Jangan menggunakan satu tingkat visual/animation yang sama untuk seluruh role.

---

## 2. Brand Color Tokens

### Core Colors

| Token | Hex | Usage |
|---|---|---|
| `yec-amber` | `#DF7F06` | Primary CTA, active, highlights |
| `yec-amber-dark` | `#A94F05` | Hover/emphasis |
| `yec-forest` | `#18352B` | Dark sections, headings, contrast |
| `yec-brown` | `#511E00` | Footer, dark cards, emphasis |
| `yec-cream` | `#FFF0C9` | Hero cards, highlights |
| `yec-paper` | `#FFF8EA` | Main warm page background |
| `yec-white` | `#FFFFFF` | Cards/forms |
| `yec-text` | `#24170F` | Main body text |
| `yec-text-secondary` | `#6F6258` | Supporting text |
| `yec-text-muted` | `#9C9187` | Caption/disabled |

### Semantic Colors

| Token | Hex | Usage |
|---|---|---|
| `success` | `#26845A` | Passed/completed |
| `warning` | `#D97706` | Pending |
| `danger` | `#B54747` | Failed/destructive |
| `info` | `#3478A6` | Informational |

### Color Ratio Guidance

```text
Cream / White   55%
Forest / Brown  20%
Amber / Orange  15%
Gold / Accent    5%
Other            5%
```

Amber harus terasa sebagai accent, bukan warna seluruh halaman.

---

## 3. Typography

### Primary UI Font

Preferred:

```text
Inter
```

Alternative:

```text
DM Sans
```

Digunakan untuk:

- Navigation.
- Body.
- Table.
- Form.
- Button.
- Dashboard.

### Display Font

Preferred:

```text
DM Serif Display
```

Alternative:

```text
Playfair Display
```

Digunakan untuk hero/editorial heading secara selektif.

### Typography Scale

| Role | Desktop | Mobile |
|---|---:|---:|
| Hero | 64–80px | 40–44px |
| H1 | 48px | 36px |
| H2 | 36px | 30px |
| H3 | 24px | 22px |
| Body | 16px | 16px |
| Small | 14px | 14px |
| Caption | 12px | 12px |

Body line-height target: 1.6.

Display heading dapat memakai line-height 0.95–1.1 untuk karakter editorial.

---

## 4. Spacing

Base 4px/8px rhythm.

Recommended tokens:

```text
4px
8px
12px
16px
20px
24px
32px
40px
48px
64px
80px
96px
120px
```

Landing page section spacing:

```text
Desktop: 96–140px vertical
Mobile: 64–88px vertical
```

Application spacing lebih rapat:

```text
16–32px typical
```

---

## 5. Border Radius

```text
radius-sm   8px
radius-md   12px
radius-lg   20px
radius-xl   28px
radius-2xl  32px
radius-pill 999px
```

Guidance:

- Form controls: 10–14px.
- Standard cards: 16–20px.
- Hero image/card: 28–32px.
- Badge: pill.

---

## 6. Shadows

Preferred style: soft, warm, natural.

```text
shadow-card:
0 8px 30px rgba(81, 30, 0, 0.08)

shadow-large:
0 20px 50px rgba(81, 30, 0, 0.12)
```

Avoid dark, harsh, high-opacity shadows.

---

## 7. Backgrounds

### Paper

```text
#FFF8EA
```

Primary application and page background.

### Cream

```text
#FFF0C9
```

Hero highlights and warm sections.

### Forest

```text
#18352B
```

Dark section / contrast.

### Brown

```text
#511E00
```

Footer / special event block.

---

## 8. Buttons

### Primary

```text
background: #DF7F06
color: #FFFFFF
radius: 12–16px
```

### Primary Hover

```text
background: #A94F05
```

### Secondary

```text
background: #FFF0C9
color: #511E00
```

### Dark

```text
background: #511E00
color: #FFFFFF
```

### Outline

```text
background: transparent
border: #D9CFC2
```

Buttons should have a clear hover/focus/disabled state.

---

## 9. Inputs

Input height target:

```text
44–48px
```

Style:

```text
background: #FFFFFF
border: #DDD3C7
radius: 12px
```

Focus:

```text
border: #DF7F06
box-shadow: subtle amber ring
```

Error:

```text
border: #B54747
```

Labels must always be visible; placeholder is not a replacement for a label.

---

## 10. Cards

### Public Event Card

- Stronger radius.
- Warm background.
- Editorial title.
- Optional decorative SVG.
- Minimal shadow.

### Participant Card

- White.
- Simple status.
- Clear primary action.

### Admin Card

- White.
- Compact.
- Data hierarchy first.

### Judge Card

- White.
- Minimal decoration.
- Focus on task and deadline/status.

---

## 11. Status Badges

Use text + color.

Examples:

```text
SUBMITTED
PENDING
COMPLETED
LOLOS
TIDAK LOLOS
LOCKED
```

Recommended mapping:

```text
Completed/PASS  → success
Pending         → warning
Failed          → danger
Info            → info
```

Never encode meaning through color alone.

---

## 12. Iconography

Use:

```text
Lucide React
```

Weight:

```text
1.8–2.0
```

Administrative icons should remain simple.

Nature/event illustrations should use custom SVG or image assets rather than turning every decorative item into a UI icon.

---

## 13. Photography & Illustration

Photo direction:

- Outdoor.
- Forest.
- Camp.
- Warm sunlight.
- Youth/entrepreneurship.
- Authentic rather than corporate stock.

Treatment:

- 28–32px rounded corners.
- Optional amber overlay.
- Use natural cropping.
- Keep text away from busy photo areas.

Illustration direction:

- Leaves.
- Branches.
- Birds.
- Tent.
- Mountain.
- Sun.
- Path.
- Stars.

Decorative opacity generally 5–15% when used as background pattern.

---

## 14. Public Landing Page Layout

Recommended order:

```text
Navbar
Hero
Event Introduction
Highlights
Journey
Competition Stages
Announcement
FAQ
Final CTA
Footer
```

### Navbar

Desktop:

```text
YEC                About  Journey  FAQ  Contact    [Portal Tim]
```

Mobile:

```text
YEC                                      Menu
```

### Hero

Composition:

```text
60% editorial copy
40% visual
```

Suggested copy structure:

```text
YOUNG ENTREPRENEUR CAMP
BUILD YOUR IDEA.
BUILD YOUR CHARACTER.

Short event description.

[ Akses Portal Tim ]
```

Do not make the entire screen a photo. Use a strong image/visual container paired with typography.

---

## 15. Highlight Cards

Three main values:

```text
01 — Mentorship
02 — Leadership
03 — Pitching
```

Cards may use alternating:

```text
Cream
Amber
Brown
```

Avoid making all three identical.

---

## 16. Journey Section

The competition should feel like a journey rather than an admin process.

Recommended stages:

```text
01 BUILD
Business Model Canvas

02 SELECT
Evaluation & Selection

03 PITCH
Present Your Idea

04 WIN
Final Result
```

Possible visual:

```text
●──────●──────●──────🏆
BUILD  SELECT  PITCH   WIN
```

Scroll-driven path animation is allowed on desktop; static fallback on reduced motion/mobile if needed.

---

## 17. Animation System

### Libraries

```text
Framer Motion = standard UI animation
GSAP          = hero/complex timeline
Lenis         = landing page smooth scroll
```

### Motion Character

Motion should feel:

```text
organic
smooth
confident
not bouncy
not gimmicky
```

### Common animation durations

```text
Fast: 150–220ms
Normal: 250–450ms
Large reveal: 600–900ms
Hero sequence: 1–2s total staged composition
```

### Easing

Prefer ease-out / custom smooth curves.

### Landing animations

Allowed:

- Fade in.
- Slide up.
- Stagger cards.
- Image scale 1.04 → 1.
- Subtle leaf floating.
- Parallax.
- Scroll reveal.
- Journey path drawing.

### Application animations

Use only:

- Modal.
- Drawer.
- Toast.
- Form state.
- Hover.
- Loading.
- Success check.

Avoid large page transitions in Admin/Juri workflows.

---

## 18. Reduced Motion

Respect:

```text
prefers-reduced-motion: reduce
```

When enabled:

- Disable parallax.
- Disable infinite decorative motion.
- Remove long entrance sequences.
- Keep only necessary feedback transitions.
- Keep content immediately accessible.

---

## 19. Judge Workspace Design

Signature UI:

```text
┌───────────────────────────┬───────────────────────────┐
│                           │                           │
│        PDF / WORK         │      EVALUATION FORM      │
│                           │                           │
│                           │  Criteria                 │
│                           │  Point [score]            │
│                           │  Point [score]            │
│                           │                           │
│                           │  Note                     │
│                           │  [...................]    │
│                           │                           │
│                           │  [Simpan Penilaian]       │
└───────────────────────────┴───────────────────────────┘
```

No tab switching.
No forced download.
No new browser tab as the primary workflow.

PDF viewer should allow scrolling/zooming.

---

## 20. Admin UI

Admin should resemble a calm operations console.

```text
background: #F7F5F1 / #FFF8EA
cards: #FFFFFF
primary: #DF7F06
secondary: #18352B
```

Sidebar section labels are uppercase/small.

Tables should prioritize:

```text
Team
Status
Submission
Judge progress
Score
Action
```

Do not flood the table with every detail. Use a detail drawer/modal for deeper information.

---

## 21. Participant Portal UI

Participant portal should feel like a guided journey.

Key component:

```text
YOUR JOURNEY
● BMC
│
● EVALUATION
│
○ PITCHING
│
○ FINAL
```

Primary action should always be obvious.

At each state, show:

- Current stage.
- What happened.
- What the participant should do next.

---

## 22. Empty / Loading / Error States

### Empty

Use warm, neutral illustration and short message.

Example:

```text
Belum ada tim yang perlu dinilai.
```

### Loading

Use skeleton or lightweight spinner; avoid large animated illustrations.

### Error

Use concise explanation + recovery action.

---

## 23. Forms

Form hierarchy:

```text
Section title
Description
Field label
Input
Helper/error
```

Long Admin forms should be grouped into cards/sections.

Dynamic evaluation template must clearly show:

```text
Criteria name
Weight
Points
Total weight
Validation state
```

---

## 24. Table Rules

Desktop tables:

- Sticky header if table is tall.
- Row height 56–68px.
- Keep actions at the right.
- Use status badge.

Mobile:

- Convert to cards where data becomes too wide.
- Otherwise use horizontal scrolling inside the table container.

---

## 25. Accessibility

Minimum baseline:

- WCAG AA contrast.
- Keyboard access.
- Visible focus.
- Semantic headings.
- Labelled form controls.
- `aria-*` only when necessary.
- Do not use color as the only status signal.
- Motion reduction support.

---

## 26. Responsive Breakpoints

Reference breakpoints:

```text
sm   640px
md   768px
lg   1024px
xl   1280px
2xl  1536px
```

Public landing page hero may switch to single column below `lg`.

Judge split-screen should switch to vertical below `md`.

---

## 27. Content Tone

Language:

- Bahasa Indonesia for operational UI.
- English can be used for selected editorial phrases.

Tone:

```text
optimistic
warm
confident
clear
not overly formal
```

Good:

```text
Karya berhasil dikirim.
Tim kamu lolos ke tahap Pitching.
```

Avoid:

```text
Data has been successfully persisted.
```

---

## 28. Do / Don't

### Do

- Use cream/amber/forest consistently.
- Let typography carry the brand.
- Use nature-inspired accents.
- Keep forms clear.
- Animate only where animation adds meaning.
- Use generous whitespace on public pages.
- Keep Admin/Juri functional.

### Don't

- Neon colors.
- Excessive gradients.
- Excessive glassmorphism.
- Large animations on every section.
- Auto-playing heavy video backgrounds.
- Full-photo backgrounds behind every block.
- Overuse of decorative icons.
- 3D/Three.js unless a future requirement truly justifies it.

---

## 29. Tailwind Token Mapping

Recommended naming:

```text
yec-amber
yec-amber-dark
yec-forest
yec-brown
yec-cream
yec-paper
yec-text
yec-text-secondary
yec-muted
```

Example:

```jsx
<button className="bg-yec-amber hover:bg-yec-amber-dark text-white rounded-xl px-5 py-3">
  Akses Portal Tim
</button>
```

---

## 30. Design QA Checklist

Before accepting a page:

- [ ] Uses YEC color tokens.
- [ ] Typography follows the defined hierarchy.
- [ ] Radius is consistent.
- [ ] Shadows are soft.
- [ ] Button states are complete.
- [ ] Form labels are present.
- [ ] Status colors are semantic.
- [ ] Desktop layout works.
- [ ] Mobile layout works.
- [ ] Reduced motion works.
- [ ] Landing animation does not hurt performance.
- [ ] Admin/Juri animation does not interrupt work.

---

## 31. Source of Truth

`design-system.md` adalah acuan visual utama untuk seluruh frontend.

Urutan prioritas:

```text
Design tokens
   ↓
Component rules
   ↓
Page layout
   ↓
Animation rules
```

Perubahan visual yang mengubah brand harus dilakukan pada token/rules terlebih dahulu, bukan melalui override acak per halaman.
