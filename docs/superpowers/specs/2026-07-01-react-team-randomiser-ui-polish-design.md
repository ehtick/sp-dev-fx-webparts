# React Team Randomiser — UI Polish Design

**Date:** 2026-07-01
**Scope:** Visual polish of the existing react-team-randomiser SPFx web part
**Direction:** More polished & professional, within Fluent UI v8, no new dependencies

---

## Background

The react-team-randomiser web part randomly divides a list of names (entered via the property pane) into balanced groups and displays them in a card grid. The core functionality is solid and well-tested. The current UI is functional but visually minimal: flat white cards with inline styles, a plain PrimaryButton, and an italic text empty state.

---

## Goals

1. Improve the visual hierarchy of group cards (header vs. members)
2. Add shuffle interaction feedback (spinner cue)
3. Improve overall layout structure and spacing
4. Move all styles into SCSS (eliminate inline styles from components)

## Non-Goals

- No Persona chips — member names remain plain text
- No theme-variant plumbing (ThemeProvider integration is a separate task)
- No changes to the grouping algorithm or property pane
- No new npm dependencies

---

## Design

### 1. Group Cards

**Coloured left-accent border:**
Each group card gets a 4px solid left border, cycling through 6 colours using a fixed palette indexed by group position:
```
0: themePrimary (#0078d4)
1: #107C10  (green)
2: #008272  (teal)
3: #5C2D91  (purple)
4: #B4009E  (magenta)
5: #CA5010  (orange)
```
The colour index is `groupIndex % 6`, passed as a prop to `GroupCard`.

**Card structure:**
- White background, `box-shadow: 0 2px 8px rgba(0,0,0,0.08)` (replaces flat border)
- 4px border-radius, 0px left border-radius (to join the accent cleanly)
- 16px padding (unchanged internally, but padding-left becomes 12px to account for border)

**Card header — two-part row:**
- Left: group label — `Text` variant `mediumPlus`, font-weight 600 (e.g. "Group 1")
- Right: member count badge — small pill (`<span>`), background `#f3f2f1`, border-radius 10px, padding `2px 8px`, font-size 12px, font-weight 600, colour `#605e5c` (e.g. "4 members")
- Header row uses flexbox: `justify-content: space-between; align-items: center`
- 8px padding-bottom, `border-bottom: 1px solid #edebe9`, 12px margin-bottom

**Member list:**
- `<ul>` with `list-style: none`, `padding: 0`, `margin: 0`
- Each `<li>` uses `Text` variant `medium`, colour `#323130`, `padding: 4px 0`
- No bullet icons — clean vertical list

**Style location:** All styles move into `TeamRandomiser.module.scss`. `GroupCard.tsx` uses only CSS module class names — no inline styles.

**Props change:** `IGroupCardProps` gains an `accentColor: string` prop (the hex value for the left border).

---

### 2. Shuffle Interaction

**Button:**
- Replace `PrimaryButton` with `DefaultButton` (variant: secondary style, less visually heavy)
- Add `iconProps={{ iconName: 'Sync' }}` (Sync icon from Fluent UI MDL2 icon set, already available via Fluent UI v8)
- Label: "Shuffle Groups"
- Disabled state unchanged (when < 2 names)

**Spinner feedback:**
- New state variable: `isShuffling: boolean` (default `false`)
- On button click:
  1. Set `isShuffling = true`
  2. `setTimeout` for 600ms, then call `buildGroups` and set new groups, set `isShuffling = false`
- While `isShuffling` is true: render Fluent UI `Spinner` (`size: SpinnerSize.small`, `label: "Shuffling..."`, `labelPosition: "right"`) in place of the button
- When `isShuffling` is false: render the button as normal

**Toolbar subtitle:**
- Below the button/spinner row, add a `Text` variant `small`, colour `#605e5c` (muted)
- Content: `"{names.length} people · {groupSize} per group"` — derived from existing props
- Hidden (or shows a dash) when names.length < 2

---

### 3. Layout & Spacing

**Container:**
- Padding: `24px` (up from 16px)
- Max-width: `1200px` (prevents extreme stretching on full-page layouts)
- Font-family stays Segoe UI (unchanged)

**Toolbar area:**
- `margin-bottom: 16px`
- `padding-bottom: 16px`
- `border-bottom: 1px solid #edebe9` — separates controls from content

**Grid:**
- Moves from inline `gridTemplateColumns` style to SCSS
- `grid-template-columns: repeat(auto-fill, minmax(240px, 1fr))` (min-width up from 220px)
- `gap: 12px` (down from 16px — tighter, more intentional)

**Empty state:**
- Replace plain italic `<p>` with Fluent UI `MessageBar` (type: `MessageBarType.info`)
- Message: "Add names in the property pane to get started."
- No dismiss button — informational only

---

## Files Changed

| File | Change |
|------|--------|
| `components/TeamRandomiser.tsx` | Add `isShuffling` state, `DefaultButton` + `Spinner`, toolbar subtitle, `MessageBar` empty state, pass `accentColor` prop to `GroupCard`, move grid styles to SCSS |
| `components/TeamRandomiser.module.scss` | Add toolbar separator, grid styles, empty state layout, card styles, header styles, member list styles |
| `components/GroupCard.tsx` | Remove all inline styles, use CSS module classes, accept `accentColor` prop for left border, add count badge, restructure header |
| `components/IGroupCardProps.ts` | Add `accentColor: string` field |

---

## Accent Colour Palette

```typescript
const GROUP_ACCENT_COLORS = [
  '#0078d4', // themePrimary (blue)
  '#107C10', // green
  '#008272', // teal
  '#5C2D91', // purple
  '#B4009E', // magenta
  '#CA5010', // orange
];
```
Defined as a constant in `TeamRandomiser.tsx`, indexed as `GROUP_ACCENT_COLORS[index % GROUP_ACCENT_COLORS.length]`.

---

## Open Questions / Decisions Made

- **Spinner duration**: 600ms chosen as noticeable but not slow. Since grouping is synchronous, this is purely a UX cue. During this window the button is replaced by the spinner, so re-clicking is not possible — no debounce needed.
- **Left border radius**: The left side of the card (where the accent border is) uses `border-radius: 0` to create a flush join; right side retains `4px`.
- **Count badge singular/plural**: "1 member" vs "2 members" — use simple ternary: `${count} member${count === 1 ? '' : 's'}`.
- **Max-width**: `1200px` aligns with standard SharePoint page content width.
