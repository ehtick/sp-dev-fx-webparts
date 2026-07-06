# Title Property — Team Randomiser Web Part

## Summary

Add an optional `title` property that renders as a heading above the toolbar when non-empty.

## Files Changed

| File | Change |
|------|--------|
| `types/ITeamRandomiserWebPartProps.ts` | Add `title?: string` |
| `components/ITeamRandomiserProps.ts` | Add `title?: string` |
| `TeamRandomiserWebPart.ts` | Pass `title` in `render()`, add `PropertyPaneTextField` in new "Display" group |
| `components/TeamRandomiser.tsx` | Render `<Text variant="xLarge">` above toolbar when `props.title` is truthy |
| `loc/mystrings.d.ts` | Add `TitleFieldLabel: string` |
| `loc/en-us.js` | Add `"TitleFieldLabel": "Title"` |

## Design Decisions

- `title` is optional (`?`) — no default value; empty string = nothing rendered
- Rendered using Fluent UI `<Text variant="xLarge">` consistent with existing Fluent UI usage
- Property pane group named **"Display"** placed above the existing "People" and "Groups" groups
- No styling changes needed beyond what the existing `styles.container` already provides
