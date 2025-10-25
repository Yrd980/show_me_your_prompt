# Prompt-Based Mini Projects Workflow

> **Purpose**: Reusable Claude workflow for building 30-60 minute React projects
> **Usage**: Reference this file at project start to apply proven patterns and save tokens
> **Based on**: 001_mealPlanner (846 lines, 45 minutes)

## Quick Reference

**Constraints**: 600-900 LOC | 3-5 features | 30-60 min | No APIs | Single page
**Stack**: React 18 • TypeScript • Vite • Tailwind • shadcn/ui • localStorage
**Structure**: `data/` `types/` `hooks/` `components/` `App.tsx`

## Standard Workflow

**PLANNING** (propose to user before coding):
1. Real problem + 3-5 features
2. Run `scc template/src` estimate
3. Component breakdown
4. Data structure design

**IMPLEMENTATION** (execute in order):
1. `./create-project.sh <name>`
2. Create `types/*.ts` interfaces
3. Create `data/*.json` mock data (20-30 items)
4. Create `hooks/useLocalStorage.ts`
5. Create components (under 150 lines each)
6. Wire in `App.tsx` (state + layout)
7. Test with MCP Chrome DevTools

**COMPLETION**:
- Run `scc <project>/src` for stats
- Test all features via MCP
- Screenshot for docs

## Design Rules

- Components < 150 lines, single responsibility
- State in App.tsx (useState), computed via useMemo
- Props not context, controlled components
- JSON in `data/`, types in `types/`
- 3-5 components, 1-2 hooks, 20-30 data items
- Use: Button, Card, Checkbox (always), Input, Select, Badge, Dialog (as needed)

## Code Patterns (copy from 001_mealPlanner)

**1. useLocalStorage**: `001_mealPlanner/src/hooks/useLocalStorage.ts`
**2. Data Aggregation**: See `ShoppingList.tsx` useMemo pattern
**3. Slot Selection**: See `App.tsx` selectedSlot state pattern
**4. Checkbox Set**: `useState<Set<string>>(new Set())` + toggle pattern

## Project Scope Guide

**✅ Good**: Meal planner, Habit tracker, Budget calc, Workout log, Reading list, Timer, Todo, Flashcards, Expense splitter, Password gen, Notes, Contacts
**❌ Avoid**: Real-time collab, Auth, File upload, Video/audio, Maps, Payment, Complex algos, Heavy data processing

**Criteria**: Practical + Visual + Interactive + Stateful + Self-contained

## Testing (MCP Chrome DevTools)

```bash
cd <project> && npm run dev  # Background mode
# Navigate localhost:5173
# Take snapshot → Click features → Check localStorage (refresh) → Screenshot
```

**Verify**: Buttons work | Data persists | No errors | Forms validate | Lists update | Checkboxes toggle | Delete works | Mobile responsive

## Common Issues

- **JSON imports**: Already configured
- **localStorage**: Use hook from 001_mealPlanner
- **Type errors**: Cast JSON `as MyType[]`
- **Large components**: Split or extract to hooks
- **Complex state**: useState + useMemo enough, no Redux

## Estimation Target

| Metric | Target | 001_mealPlanner |
|--------|--------|-----------------|
| Total LOC | 600-900 | 846 ✅ |
| TypeScript | 400-600 | 520 ✅ |
| JSON | 100-300 | 260 ✅ |
| Complexity | < 100 | 65 ✅ |
| Time | 30-60min | 45min ✅ |

## Pre-Flight Checklist

- [ ] Real need? 3-5 features? 600-900 LOC estimate?
- [ ] Data structure designed? No APIs? Template ready?
- [ ] Testable with MCP? 30-60 min achievable?

---

**Philosophy**: Constraint breeds creativity. Keep it simple, make it work, ship it fast.
