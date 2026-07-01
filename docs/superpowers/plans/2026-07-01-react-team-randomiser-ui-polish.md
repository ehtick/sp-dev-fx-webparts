# React Team Randomiser UI Polish — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish the react-team-randomiser web part's visual design — richer group cards with coloured accents and member-count badges, a spinner-feedback shuffle interaction, and improved layout/spacing — without changing any logic or adding new dependencies.

**Architecture:** Three sequential tasks touching four files: (1) extend the `IGroupCardProps` interface and rewrite the SCSS module with all new styles, (2) refactor `GroupCard.tsx` to use SCSS classes and the new header/badge/list structure, (3) update `TeamRandomiser.tsx` with shuffle-spinner state, `DefaultButton`, toolbar subtitle, and `MessageBar` empty state. All style decisions live in SCSS; the only remaining inline style is the dynamic per-card accent border colour.

**Tech Stack:** React 17, Fluent UI v8 (`@fluentui/react`), SCSS Modules, SPFx 1.20, TypeScript 4.7

## Global Constraints

- No new npm dependencies — only packages already in `package.json`
- All Fluent UI components used must be from `@fluentui/react` v8 (already installed)
- All commands run from: `c:\SPFx\sp-dev-fx-webparts\samples\react-team-randomiser\`
- TypeScript strict mode is on — no implicit `any`, no unused variables
- No changes to `grouping.ts`, `grouping.test.ts`, the property pane, or the web part manifest

---

## File Map

| File | Action | What changes |
|------|--------|--------------|
| `src/webparts/teamRandomiser/components/IGroupCardProps.ts` | Modify | Add `accentColor: string` field |
| `src/webparts/teamRandomiser/components/TeamRandomiser.module.scss` | Modify | Replace/extend all styles — container, toolbar, grid, card, header, badge, member list, empty state |
| `src/webparts/teamRandomiser/components/GroupCard.tsx` | Modify | Remove all inline style objects; use SCSS classes; add accent border, count badge, ul/li member list |
| `src/webparts/teamRandomiser/components/TeamRandomiser.tsx` | Modify | Add `GROUP_ACCENT_COLORS`, `isShuffling` state, `DefaultButton`+`Spinner`, toolbar subtitle, `MessageBar` empty state, pass `accentColor` prop |

---

## Task 1: Extend IGroupCardProps and Rewrite SCSS

**Files:**
- Modify: `src/webparts/teamRandomiser/components/IGroupCardProps.ts`
- Modify: `src/webparts/teamRandomiser/components/TeamRandomiser.module.scss`

**Interfaces:**
- Produces: `IGroupCardProps.accentColor: string` — consumed by Task 2
- Produces: CSS module classes `.card`, `.cardHeader`, `.cardHeaderTitle`, `.cardBadge`, `.memberList`, `.memberItem`, `.toolbar`, `.toolbarSubtitle`, `.grid`, `.emptyState`, `.container` — consumed by Tasks 2 and 3

- [ ] **Step 1: Update IGroupCardProps**

Replace the entire file `src/webparts/teamRandomiser/components/IGroupCardProps.ts` with:

```typescript
export interface IGroupCardProps {
  groupNumber: number;
  members: string[];
  accentColor: string;
}
```

- [ ] **Step 2: Rewrite the SCSS module**

Replace the entire file `src/webparts/teamRandomiser/components/TeamRandomiser.module.scss` with:

```scss
@import '~@fluentui/react/dist/sass/References.scss';

.container {
  padding: 24px;
  max-width: 1200px;
  font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
}

.toolbar {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #edebe9;
}

.toolbarSubtitle {
  margin-top: 8px;
  color: #605e5c;
  display: block;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}

.emptyState {
  margin-top: 8px;
}

.card {
  background-color: #ffffff;
  border-radius: 4px;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  padding: 16px;
  padding-left: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.cardHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  margin-bottom: 12px;
  border-bottom: 1px solid #edebe9;
}

.cardHeaderTitle {
  font-weight: 600;
}

.cardBadge {
  background-color: #f3f2f1;
  border-radius: 10px;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 600;
  color: #605e5c;
}

.memberList {
  list-style: none;
  padding: 0;
  margin: 0;
}

.memberItem {
  padding: 4px 0;
  color: #323130;
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run from the web part directory:
```
npx tsc --noEmit
```
Expected: no errors. (GroupCard.tsx will show an error about missing `accentColor` prop — that's expected and will be fixed in Task 2.)

> Note: TypeScript will report `accentColor` as missing in `TeamRandomiser.tsx` call sites — ignore this until Task 3. The interface change itself is correct.

- [ ] **Step 4: Commit**

```bash
git add src/webparts/teamRandomiser/components/IGroupCardProps.ts
git add src/webparts/teamRandomiser/components/TeamRandomiser.module.scss
git commit -m "feat: extend GroupCard props and rewrite SCSS for UI polish"
```

---

## Task 2: Refactor GroupCard Component

**Files:**
- Modify: `src/webparts/teamRandomiser/components/GroupCard.tsx`

**Interfaces:**
- Consumes: `IGroupCardProps.accentColor: string` (from Task 1)
- Consumes: CSS module classes `.card`, `.cardHeader`, `.cardHeaderTitle`, `.cardBadge`, `.memberList`, `.memberItem` (from Task 1)
- Produces: `GroupCard` component accepting `{ groupNumber, members, accentColor }` — consumed by Task 3

- [ ] **Step 1: Replace GroupCard.tsx**

Replace the entire file `src/webparts/teamRandomiser/components/GroupCard.tsx` with:

```tsx
import * as React from 'react';
import { Text } from '@fluentui/react';
import { IGroupCardProps } from './IGroupCardProps';
import styles from './TeamRandomiser.module.scss';

const GroupCard: React.FC<IGroupCardProps> = ({ groupNumber, members, accentColor }) => (
  <div className={styles.card} style={{ borderLeft: `4px solid ${accentColor}` }}>
    <div className={styles.cardHeader}>
      <Text variant="mediumPlus" className={styles.cardHeaderTitle}>
        Group {groupNumber}
      </Text>
      <span className={styles.cardBadge}>
        {members.length} {members.length === 1 ? 'member' : 'members'}
      </span>
    </div>
    <ul className={styles.memberList}>
      {members.map((name, i) => (
        <li key={i} className={styles.memberItem}>
          <Text variant="medium">{name}</Text>
        </li>
      ))}
    </ul>
  </div>
);

export default GroupCard;
```

- [ ] **Step 2: Verify TypeScript compiles**

```
npx tsc --noEmit
```
Expected: one remaining error about `accentColor` missing in `TeamRandomiser.tsx` (fixed in Task 3). No errors in `GroupCard.tsx` itself.

- [ ] **Step 3: Run existing tests**

```
npm test
```
Expected: all 8 existing grouping tests pass. GroupCard has no unit tests (it's a pure display component).

- [ ] **Step 4: Commit**

```bash
git add src/webparts/teamRandomiser/components/GroupCard.tsx
git commit -m "feat: refactor GroupCard to use SCSS classes, add accent border and count badge"
```

---

## Task 3: Update TeamRandomiser Main Component

**Files:**
- Modify: `src/webparts/teamRandomiser/components/TeamRandomiser.tsx`

**Interfaces:**
- Consumes: `GroupCard` accepting `{ groupNumber, members, accentColor }` (from Task 2)
- Consumes: CSS module classes `.container`, `.toolbar`, `.toolbarSubtitle`, `.grid`, `.emptyState` (from Task 1)

- [ ] **Step 1: Replace TeamRandomiser.tsx**

Replace the entire file `src/webparts/teamRandomiser/components/TeamRandomiser.tsx` with:

```tsx
import * as React from 'react';
import { useState } from 'react';
import {
  DefaultButton,
  MessageBar,
  MessageBarType,
  Spinner,
  SpinnerSize,
  Text,
} from '@fluentui/react';
import { ITeamRandomiserProps } from './ITeamRandomiserProps';
import { buildGroups } from '../utils/grouping';
import GroupCard from './GroupCard';
import styles from './TeamRandomiser.module.scss';

const GROUP_ACCENT_COLORS = [
  '#0078d4',
  '#107C10',
  '#008272',
  '#5C2D91',
  '#B4009E',
  '#CA5010',
];

const TeamRandomiser: React.FC<ITeamRandomiserProps> = (props) => {
  const [groups, setGroups] = useState<string[][]>(() =>
    buildGroups(props.names, props.groupSize)
  );
  const [isShuffling, setIsShuffling] = useState(false);

  const shuffle = (): void => {
    setIsShuffling(true);
    setTimeout(() => {
      setGroups(buildGroups(props.names, props.groupSize));
      setIsShuffling(false);
    }, 600);
  };

  const validNames = props.names.filter(n => n.trim() !== '');
  const hasNames = validNames.length > 1;

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        {isShuffling ? (
          <Spinner size={SpinnerSize.small} label="Shuffling..." labelPosition="right" />
        ) : (
          <DefaultButton
            text="Shuffle Groups"
            iconProps={{ iconName: 'Sync' }}
            onClick={shuffle}
            disabled={!hasNames}
          />
        )}
        {hasNames && (
          <Text variant="small" className={styles.toolbarSubtitle}>
            {validNames.length} {validNames.length === 1 ? 'person' : 'people'} &middot; {props.groupSize} per group
          </Text>
        )}
      </div>
      {!hasNames ? (
        <div className={styles.emptyState}>
          <MessageBar messageBarType={MessageBarType.info} isMultiline={false}>
            Add names in the property pane to get started.
          </MessageBar>
        </div>
      ) : (
        <div className={styles.grid}>
          {groups.map((members, i) => (
            <GroupCard
              key={i}
              groupNumber={i + 1}
              members={members}
              accentColor={GROUP_ACCENT_COLORS[i % GROUP_ACCENT_COLORS.length]}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamRandomiser;
```

- [ ] **Step 2: Verify TypeScript compiles cleanly**

```
npx tsc --noEmit
```
Expected: **zero errors**.

- [ ] **Step 3: Run existing tests**

```
npm test
```
Expected: all 8 grouping tests pass.

- [ ] **Step 4: Manual verification checklist**

Load the web part in the SharePoint workbench (`gulp serve`) and verify:
- [ ] With no names: `MessageBar` (info style, blue) shows "Add names in the property pane to get started."
- [ ] With 2+ names: group cards appear with coloured left borders (blue for Group 1, green for Group 2, teal for Group 3, etc.)
- [ ] Each card header shows "Group N" on the left and "X members" badge on the right
- [ ] Member names render as a clean vertical list (no bullets)
- [ ] The shuffle button shows a Sync icon and reads "Shuffle Groups"
- [ ] Clicking Shuffle replaces the button with "Shuffling..." spinner for ~600ms, then shows new groups
- [ ] Toolbar subtitle shows e.g. "8 people · 3 per group" below the button
- [ ] Cards with >6 groups cycle back through the colour palette (Group 7 = blue again)

- [ ] **Step 5: Commit**

```bash
git add src/webparts/teamRandomiser/components/TeamRandomiser.tsx
git commit -m "feat: add shuffle spinner, toolbar subtitle, MessageBar empty state, accent colours"
```
