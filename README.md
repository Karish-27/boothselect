# Interactive Booth Selector

A premium, minimal booth reservation UI built with React, TypeScript, Tailwind CSS, and Motion. Booths are styled as small exhibition stalls (canopy / open interior / base), and confirming a reservation issues a die-cut ticket.

**Live demo:** _<add-live-demo-url>_
**Repository:** _<add-github-repo-url>_

## Overview

Users browse a grid of 8 booths, each with a status (`available`, `reserved`, `sold`, `blocked`) and a price. Only available booths can be selected. Selecting one opens a side panel (desktop) or draggable bottom sheet (mobile) where the user can **reserve** it.

Reserving flips the booth to `reserved` and starts a **30-second hold** with a live countdown. During the hold the user must **confirm** to finalize the booking — on confirm the panel becomes a ticket/receipt. If the hold expires without confirmation, the booth automatically returns to `available`.

## Tech Stack

- React 19 + TypeScript
- Tailwind CSS v4 (design tokens in `src/styles.css`)
- Motion (the Framer Motion successor) for all animations
- TanStack Start / TanStack Router for the app shell (SSR)

No extra state libraries, no glassmorphism — just clean primitives.

## Folder Structure

```
src/
├─ components/
│  └─ booth/
│     ├─ BoothCard.tsx        # A booth rendered as an exhibition stall (canopy/interior/base)
│     ├─ BoothGrid.tsx        # Responsive grid + roving-tabindex keyboard navigation
│     ├─ SelectionPanel.tsx   # Panel content: details, countdown, confirm, and the ticket
│     ├─ StatusBadge.tsx      # Status label (available/reserved/sold/blocked)
│     └─ statusStyles.ts      # Single source of truth for per-status colors + labels
├─ data/
│  └─ booths.ts               # The 8 seed booths
├─ hooks/
│  └─ useNow.ts               # Ticking clock, pauses when no reservation is active
├─ types/
│  └─ booth.ts                # Booth + BoothStatus interfaces
└─ routes/
   └─ index.tsx               # Page: owns state, composes grid + panel + RTL toggle
```

`statusStyles.ts` keeps every status's tint, canopy color, and label in one place so the card, badge, and panel can never drift out of sync.

## Architecture

The page (`routes/index.tsx`) owns all state; child components are presentational and receive props + callbacks. This keeps the mental model small and easy to explain.

- `booths` — array of booth records; only mutated when a status changes.
- `selectedId` — the currently selected booth id, or `null`.
- `reservations` — `Record<boothId, expiresAtMs>` for booths whose hold is still counting down.
- `dir` — `"ltr" | "rtl"` applied via the root `dir` attribute.

A single ticking clock (`useNow`) drives the countdown. It runs **only** while at least one reservation is active, so idle sessions schedule no intervals. An effect watches `now` and expires any hold whose end time has passed, restoring the booth to `available` and removing its `reservations` entry.

A booth being `reserved` is distinguished from being **held vs. confirmed** by a derived flag: `isHolding = selectedBooth is reserved && still has a reservations entry`. Confirming removes the `reservations` entry (which stops its countdown/expiry) while leaving the status `reserved` — so the booth stays booked permanently.

## State Management

Plain React hooks — `useState`, `useEffect`, `useMemo`. No context, reducers, or external stores. Derived values (selected booth, remaining seconds, holding state) are computed with `useMemo` / simple expressions from the source-of-truth state.

## Reservation Flow

1. Click an `available` booth → `selectedId` updates; the panel animates in.
2. **Reserve booth** → status becomes `reserved`; `reservations[id] = Date.now() + 30_000`. `useNow` starts ticking (500 ms) and the panel shows a live `m:ss` countdown + shrinking progress bar (which turns red in the final 10 s).
3. **Confirm reservation** (during the hold) → the `reservations` entry is deleted so the countdown/expiry stops; the booth stays `reserved` and the panel swaps to a die-cut **ticket** (ticket id, amount, date, barcode).
4. If the hold expires first → the effect resets the booth to `available` and clears the entry. When no reservations remain, the ticking clock stops.

## Accessibility

- Booths are real `<button>`s with `aria-pressed` / `aria-disabled` and descriptive `aria-label`s.
- **Keyboard navigation**: the grid uses a roving `tabIndex` so arrow keys (plus Home/End) move focus across the floor plan; Enter/Space select. Horizontal arrows respect RTL.
- Visible `:focus-visible` rings, and a `prefers-reduced-motion` guard that disables the looping animations.
- RTL/LTR is a segmented control; the whole layout flips via the root `dir` and logical Tailwind utilities (`ms-*`, `text-start`, `end-*`).

## Edge Cases Handled

- Clicks on `reserved`, `sold`, or `blocked` booths are ignored (guarded in the handler, `aria-disabled`, no hover/lift); sold shows a struck-through price.
- Clicking the currently selected booth toggles the selection off.
- The **Reserve** button can't double-reserve; **Confirm** only acts while a hold is active.
- Timers are cleaned up on unmount via `clearInterval`, and the clock only runs while reservations exist (no wasted work).
- A balanced empty state renders when nothing is selected.
- **Desktop**: the booth grid scrolls within the viewport (scrollbar hidden) while header/heading/panel stay put; a tall confirmed ticket instead grows the page so it can be scrolled to fully, with the panel kept sticky.
- **Mobile**: a 2-column grid and a **draggable bottom sheet** — drag it down (or flick) to dismiss; a spacer keeps the grid clear of the sheet.
- Reserving does not deselect the booth, so the countdown stays visible.

## Local Setup

```bash
npm install   # or: bun install
npm run dev   # or: bun dev
```

Then open the printed local URL (the dev server runs on port **8080**).

Other scripts: `npm run build` (production build), `npm run lint`, `npm run format`.

## AI Usage Disclosure

This project was scaffolded and iterated on with the help of an AI coding assistant. All architectural decisions, component boundaries, animation choices, accessibility work, and edge-case handling were directed and reviewed by a human, and every change was verified end-to-end (typecheck, lint, build, and running the app).

---

_Replace the demo and repo placeholders above before sharing._
