# Title Property — Team Randomiser Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an optional `title` property that renders as a Fluent UI heading above the toolbar when non-empty.

**Architecture:** Thread `title?: string` through the web part props interface and component props interface, expose it in the property pane under a new "Display" group, and conditionally render a `<Text variant="xLarge">` in the component.

**Tech Stack:** SPFx, React, Fluent UI (`@fluentui/react`), TypeScript, Jest

## Global Constraints

- All paths are relative to `samples/react-team-randomiser/`
- Do not add dependencies
- Empty/undefined title must produce zero rendered output (no gap, no placeholder)

---

### Task 1: Fix stale grouping test

The earlier bugfix (removing the distribution branch from `buildGroups`) changed the behaviour for 10 people / group size 3 from `[4,3,3]` to `[3,3,3,1]`. Update the test to match the new behaviour before proceeding.

**Files:**
- Modify: `src/webparts/teamRandomiser/utils/__tests__/grouping.test.ts:36-43`

- [ ] **Step 1: Run the existing tests to confirm the failure**

```bash
cd samples/react-team-randomiser
npm test -- --testPathPattern=grouping
```

Expected output includes:
```
● distributes remainder: 10 people size 3 → sizes 4,3,3
  expect(received).toHaveLength(3)
  Received array: [["A","B","C"],["D","E","F"],["G","H","I"],["J"]]
```

- [ ] **Step 2: Update the failing test**

Replace lines 36-43 in `src/webparts/teamRandomiser/utils/__tests__/grouping.test.ts`:

```typescript
  it('caps group size: 10 people size 3 → groups of [3,3,3,1]', () => {
    const names = ['A','B','C','D','E','F','G','H','I','J'];
    const result = buildGroups(names, 3);
    expect(result).toHaveLength(4);
    const sizes = result.map(g => g.length).sort((a, b) => b - a);
    expect(sizes).toEqual([3, 3, 3, 1]);
  });
```

- [ ] **Step 3: Run tests to confirm they pass**

```bash
npm test -- --testPathPattern=grouping
```

Expected: all tests PASS

- [ ] **Step 4: Commit**

```bash
git add src/webparts/teamRandomiser/utils/__tests__/grouping.test.ts
git commit -m "test: update grouping test to match capped group size behaviour"
```

---

### Task 2: Add title property

Wire `title?: string` through all layers and render it in the component.

**Files:**
- Modify: `src/webparts/teamRandomiser/types/ITeamRandomiserWebPartProps.ts`
- Modify: `src/webparts/teamRandomiser/components/ITeamRandomiserProps.ts`
- Modify: `src/webparts/teamRandomiser/TeamRandomiserWebPart.ts`
- Modify: `src/webparts/teamRandomiser/components/TeamRandomiser.tsx`
- Modify: `src/webparts/teamRandomiser/loc/mystrings.d.ts`
- Modify: `src/webparts/teamRandomiser/loc/en-us.js`

**Interfaces:**
- Produces: `ITeamRandomiserProps.title?: string` consumed by `TeamRandomiser.tsx`

- [ ] **Step 1: Add `title` to the web part props interface**

Replace the full contents of `src/webparts/teamRandomiser/types/ITeamRandomiserWebPartProps.ts`:

```typescript
export interface ITeamRandomiserWebPartProps {
  title: string;
  names: string;
  groupSize: number;
}
```

- [ ] **Step 2: Add `title` to the component props interface**

Replace the full contents of `src/webparts/teamRandomiser/components/ITeamRandomiserProps.ts`:

```typescript
export interface ITeamRandomiserProps {
  title: string;
  names: string[];
  groupSize: number;
}
```

- [ ] **Step 3: Add the string key to the locale type declaration**

Replace the full contents of `src/webparts/teamRandomiser/loc/mystrings.d.ts`:

```typescript
declare interface ITeamRandomiserWebPartStrings {
  PropertyPaneDescription: string;
  TitleFieldLabel: string;
  NamesFieldLabel: string;
  NamesFieldDescription: string;
  GroupSizeFieldLabel: string;
}

declare module 'TeamRandomiserWebPartStrings' {
  const strings: ITeamRandomiserWebPartStrings;
  export = strings;
}
```

- [ ] **Step 4: Add the string value to the English locale file**

Replace the full contents of `src/webparts/teamRandomiser/loc/en-us.js`:

```javascript
define([], function() {
  return {
    "PropertyPaneDescription": "Configure the Random Groups web part",
    "TitleFieldLabel": "Title",
    "NamesFieldLabel": "Names (one per line)",
    "NamesFieldDescription": "One name per line",
    "GroupSizeFieldLabel": "People per group"
  }
});
```

- [ ] **Step 5: Update the web part — pass title and add property pane field**

Replace the full contents of `src/webparts/teamRandomiser/TeamRandomiserWebPart.ts`:

```typescript
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneSlider
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import TeamRandomiser from './components/TeamRandomiser';
import { ITeamRandomiserProps } from './components/ITeamRandomiserProps';
import { ITeamRandomiserWebPartProps } from './types/ITeamRandomiserWebPartProps';
import * as strings from 'TeamRandomiserWebPartStrings';

export default class TeamRandomiserWebPart extends BaseClientSideWebPart<ITeamRandomiserWebPartProps> {
  public render(): void {
    const names = (this.properties.names || '')
      .split('\n')
      .map((n: string) => n.trim())
      .filter((n: string) => n !== '');

    const element: React.ReactElement<ITeamRandomiserProps> = React.createElement(
      TeamRandomiser,
      {
        title: this.properties.title || '',
        names,
        groupSize: this.properties.groupSize || 3,
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: strings.PropertyPaneDescription },
          groups: [
            {
              groupName: 'Display',
              groupFields: [
                PropertyPaneTextField('title', {
                  label: strings.TitleFieldLabel,
                }),
              ]
            },
            {
              groupName: 'People',
              groupFields: [
                PropertyPaneTextField('names', {
                  label: strings.NamesFieldLabel,
                  description: strings.NamesFieldDescription,
                  multiline: true,
                  rows: 10,
                }),
              ]
            },
            {
              groupName: 'Groups',
              groupFields: [
                PropertyPaneSlider('groupSize', {
                  label: strings.GroupSizeFieldLabel,
                  min: 2,
                  max: 20,
                  step: 1,
                  showValue: true,
                }),
              ]
            }
          ]
        }
      ]
    };
  }
}
```

- [ ] **Step 6: Render the title in the component**

Replace the full contents of `src/webparts/teamRandomiser/components/TeamRandomiser.tsx`:

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
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const shuffle = (): void => {
    if (isShuffling) return;
    setIsShuffling(true);
    timerRef.current = setTimeout(() => {
      setGroups(buildGroups(props.names, props.groupSize));
      setIsShuffling(false);
    }, 600);
  };

  React.useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const validNames = props.names.filter(n => n.trim() !== '');
  const hasNames = validNames.length > 1;

  return (
    <div className={styles.container}>
      {props.title && (
        <Text variant="xLarge" block>{props.title}</Text>
      )}
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

- [ ] **Step 7: Run tests to confirm nothing is broken**

```bash
npm test
```

Expected: all tests PASS

- [ ] **Step 8: Commit**

```bash
git add src/webparts/teamRandomiser/types/ITeamRandomiserWebPartProps.ts
git add src/webparts/teamRandomiser/components/ITeamRandomiserProps.ts
git add src/webparts/teamRandomiser/loc/mystrings.d.ts
git add src/webparts/teamRandomiser/loc/en-us.js
git add src/webparts/teamRandomiser/TeamRandomiserWebPart.ts
git add src/webparts/teamRandomiser/components/TeamRandomiser.tsx
git commit -m "feat: add optional title property to team randomiser web part"
```
