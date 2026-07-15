# Interactive Booth Selector

A premium, minimal SaaS-style booth reservation UI built with React, TypeScript, Tailwind CSS, and Motion.

**Live demo:** _<add-live-demo-url>_
**Repository:** _<add-github-repo-url>_

## Overview

Users browse a grid of 8 booths, each with a status (`available`, `reserved`, `sold`, `blocked`) and a price. Only available booths can be selected. Selecting a booth opens a side panel (desktop) or bottom sheet (mobile) where the user can reserve it. A reservation flips the booth to `reserved` for 30 seconds with a live countdown; once the timer expires, the booth automatically returns to `available`.

## Tech Stack

- React 19 + TypeScript
- Tailwind CSS v4 (design tokens in `src/styles.css`)
- Motion (Framer Motion successor) for all animations
- TanStack Start / TanStack Router for the app shell

No extra state libraries, no glassmorphism, no neon — just clean primitives.

## Folder Structure

```
src/
├─ components/
│  └─ booth/
│     ├─ BoothCard.tsx        # Single booth card (hover/select/disabled states)
│     ├─ BoothGrid.tsx        # Responsive grid, staggered mount animation
│     ├─ SelectionPanel.tsx   # Sticky panel + bottom sheet content
│     └─ StatusBadge.tsx      # Status pill (available/reserved/sold/blocked)
├─ data/
│  └─ booths.ts               # The 8 seed booths
├─ hooks/
│  └─ useNow.ts               # Ticking clock, pauses when no reservation is active
├─ types/
│  └─ booth.ts                # Booth + BoothStatus interfaces
└─ routes/
   └─ index.tsx               # Page: composes grid + panel + RTL toggle
```

## Architecture

The page owns all state; child components are presentational and receive props + callbacks. This keeps the mental model small and interview-friendly.

- `booths` — array of booth records, mutated only when status changes.
- `selectedId` — the currently selected booth id, or `null`.
- `reservations` — `Record<boothId, expiresAtMs>` for active reservations.
- `dir` — `"ltr" | "rtl"` applied via the top-level `dir` attribute.

A single ticking clock (`useNow`) drives the countdown. It runs only while at least one reservation is active, so idle sessions do not schedule intervals. An effect watches `now` and expires booths whose end time has passed, restoring their status to `available` and removing the reservation entry.

## State Management

Plain React hooks — `useState`, `useEffect`, and `useMemo`. No context, reducers, or external stores. Derived values (selected booth, remaining seconds) are computed with `useMemo` from the source-of-truth state.

## Reservation Flow

1. User clicks an `available` booth → `selectedId` updates; card animates in the panel.
2. User clicks **Reserve Booth** → booth's status becomes `reserved`; an entry is added to `reservations` with `Date.now() + 30_000`.
3. `useNow` starts ticking (500 ms). The panel shows a live `m:ss` countdown and a shrinking progress bar.
4. When `now >= expiresAt`, the effect resets the booth to `available` and clears the entry. If no reservations remain, the ticking clock stops.

## Edge Cases Handled

- Clicks on `reserved`, `sold`, or `blocked` booths are ignored (`aria-disabled`, pointer disabled, opacity reduced).
- Clicking the currently selected booth toggles selection off.
- The **Reserve** button is disabled once a booth is reserved (no double-reserve).
- Timers are cleaned up on unmount via `clearInterval` in `useNow`.
- The ticking clock only runs while reservations exist (no wasted work).
- Empty state is rendered when nothing is selected.
- On mobile the panel is a bottom sheet; a spacer prevents the grid from being obscured.
- RTL flips the entire layout via the root `dir` attribute, and logical Tailwind classes (`me-*`, `text-start`) keep spacing correct in both directions.
- Reserving a booth does not deselect it — the user sees the countdown live.

## Local Setup

```bash
bun install
bun dev
```

Then open the printed local URL.

## AI Usage Disclosure

This project was scaffolded and iterated on with the assistance of an AI coding agent. All architectural decisions, component boundaries, animation choices, and edge-case handling were reviewed and shaped through the prompt above; the AI produced the initial implementation which was then verified end-to-end.

---

_Replace the demo and repo placeholders above before sharing._