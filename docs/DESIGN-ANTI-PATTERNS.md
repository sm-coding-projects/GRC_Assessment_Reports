# Design Anti-Patterns — What NOT to Build

This document shows the exact patterns that make an app look AI-generated.
Reference this when reviewing any UI component.

---

## The "AI Slop" Checklist

If your UI has 3 or more of these, it looks AI-generated. Fix immediately.

### Typography Crimes
- [ ] Using Inter, Roboto, or system-ui as the only font
- [ ] Every heading is the same weight and size
- [ ] No font pairing (headings and body use the same family)
- [ ] Letter-spacing is default everywhere
- [ ] Everything is 14px or 16px with no hierarchy

**Our fix**: Instrument Serif for headings (-0.03em tracking), DM Sans for body,
JetBrains Mono for control IDs and data. Three distinct fonts = instant
professional feel.

### Colour Crimes
- [ ] Purple-to-blue gradient as hero/background
- [ ] Using Tailwind defaults (blue-500, gray-100) without customisation
- [ ] Every interactive element is the same shade of blue
- [ ] Status colours are all neon/vibrant (traffic-light palette)
- [ ] White background with light grey cards and blue accents

**Our fix**: Deep, muted palette. Ink (#1B1F23) not black. Accent is
#0550AE (deep corporate blue) not electric. Status colours are desaturated:
success #1A7F37, warning #9A6700, danger #CF222E.

### Layout Crimes
- [ ] Everything is a card with rounded corners and drop shadow
- [ ] Centered card grid with identical spacing
- [ ] Top navigation with tabs instead of sidebar
- [ ] Every section starts with an emoji icon
- [ ] Equal padding everywhere (16px all around)

**Our fix**: Left sidebar navigation. Tables for data (not card grids).
Asymmetric padding (32px left, 24px right). Background colour shifts
instead of borders and shadows. Max 6px border-radius.

### Component Crimes
- [ ] Pill-shaped buttons (border-radius: 9999px)
- [ ] Pill-shaped badges/tags
- [ ] Hover-lift effect on cards (translateY + shadow)
- [ ] Animated gradient borders
- [ ] Emoji as status indicators (✅❌⚠️)
- [ ] Stats dashboard with 4 identical cards in a row

**Our fix**: Buttons at 4px radius. Badges use dot + text (not coloured pills).
No hover-lift. Status shown as: ● Compliant, ◐ Partial, ✕ Non-Compliant.
Lucide icons only.

### Animation Crimes
- [ ] Everything fades in on scroll
- [ ] Cards bounce/spring on hover
- [ ] Loading spinner instead of skeleton
- [ ] Page transitions longer than 200ms
- [ ] Gratuitous confetti/celebration animations

**Our fix**: Animate only what matters: page transitions (150ms), dropdowns,
toasts. Loading = skeleton that matches content shape. No hover animations on
cards.

---

## Reference: What Good Looks Like

### Enterprise SaaS to Study
- **Stripe Dashboard** — Dense, data-focused, excellent typography
- **Linear** — Keyboard-first, clean but not generic
- **Vercel Dashboard** — Information density without clutter
- **GitHub** — Tables, monospace IDs, subtle colour use
- **Notion** — Clean without being sterile

### What They All Share
1. Custom font pairing (never just Inter)
2. Dense information display (not card grids)
3. Tables as primary data view
4. Subtle colour usage (not rainbow)
5. Sidebar navigation
6. Keyboard shortcuts
7. Monospace for IDs/codes
8. Small border-radius (2-6px)
9. Minimal animation
10. Dark subtle borders, not drop shadows

---

## Quick Test

Screenshot your app and ask: "Would a VP of Compliance at a bank use this?"

If it looks like it belongs on a "10 Cool AI Demos" tweet thread,
it needs to be redesigned.

If it looks like it could be a page in Stripe's dashboard,
you're on the right track.
