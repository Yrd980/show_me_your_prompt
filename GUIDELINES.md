# Guidelines for Prompt-Based Mini Projects

> Lessons learned from building 001_mealPlanner and best practices for 30-60 minute projects

## Project Methodology

### Scope Definition
- **Target**: 30-60 minute projects (500-900 lines of code)
- **Format**: Single-page applications
- **No external APIs or backends**
- **Focus on real user needs**, not fancy features
- **Use COCOMO/scc** for code estimation before starting

### Tech Stack (Proven)
- React 18 + TypeScript (type safety)
- Vite (fast dev server)
- Tailwind CSS (rapid styling)
- shadcn/ui (pre-built components)
- localStorage (simple persistence)
- lucide-react (icons)

### Project Structure
```
src/
├── data/           # JSON mock data
├── types/          # TypeScript interfaces
├── hooks/          # Custom hooks (useLocalStorage, etc.)
├── components/     # Feature components
│   └── ui/        # shadcn/ui components
├── lib/           # Utilities (cn helper)
├── App.tsx        # Main layout & state
└── index.css      # Global styles
```

## Development Process

### Planning Phase
1. Identify real-world problem
2. Define 3-5 core features (no more!)
3. Estimate code size with scc
4. Break into components
5. Plan data structure

### Implementation Order
1. Create project from template
2. Define TypeScript types/interfaces
3. Create mock data (JSON)
4. Build utility hooks
5. Build individual components (bottom-up)
6. Wire everything in App.tsx
7. Test with MCP tools (Chrome DevTools)

### Component Design Principles
- Keep components under 150 lines
- Single responsibility
- Props over context for simple apps
- Use controlled components
- Aggregate logic in parent (App.tsx)

## Key Success Factors

### What Worked Well
- **JSON mock data in separate file** - keeps data clean and readable
- **localStorage hook** - reusable persistence without complexity
- **Component isolation** - each component independent
- **Incremental testing** - test each feature as built
- **Category-based organization** - group data logically
- **Simple state management** - useState in App.tsx sufficient

### Complexity Sweet Spots
- 3-5 components per project
- 1-2 custom hooks
- 20-30 data items (meals, tasks, etc.)
- 2-3 shadcn/ui components
- 1 main data structure

## Reusable Patterns

### 1. Data Aggregation Pattern
```typescript
// Collect from multiple sources, dedupe, group
const aggregated = useMemo(() => {
  const map = new Map();

  // Collect and merge items
  sources.forEach(source => {
    source.items.forEach(item => {
      const key = item.id;
      if (map.has(key)) {
        // Merge logic
        map.get(key).amount += item.amount;
      } else {
        map.set(key, { ...item });
      }
    });
  });

  // Group by category
  const grouped = {};
  map.forEach(item => {
    if (!grouped[item.category]) {
      grouped[item.category] = [];
    }
    grouped[item.category].push(item);
  });

  return grouped;
}, [dependencies]);
```

### 2. Slot Selection Pattern
```typescript
// Parent component
const [selectedSlot, setSelectedSlot] = useState(null);

const handleSelectSlot = (id, type) => {
  setSelectedSlot({ id, type });
};

const handleSelectItem = (item) => {
  if (!selectedSlot) return;
  // Update data with selected item
  setSelectedSlot(null); // Close selector
};

// Click opens selector with context
// Selector closes on selection
```

### 3. localStorage Pattern
```typescript
// useLocalStorage.ts
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  return [storedValue, setValue] as const;
}

// Usage in component
const [data, setData] = useLocalStorage('myKey', initialValue);
// Auto-saves on every change
```

### 4. Checkbox Tracking Pattern
```typescript
const [checked, setChecked] = useState<Set<string>>(new Set());

const toggle = (id: string) => {
  setChecked(prev => {
    const next = new Set(prev);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    return next;
  });
};

// Check if item is checked
const isChecked = checked.has(itemId);
```

## Project Ideas That Work

### Characteristics
- **Practical** - solves daily problems
- **Visual** - grid/list/cards
- **Interactive** - clicking, checking, selecting
- **Stateful** - worth saving data
- **Self-contained** - no external dependencies

### Good Examples
- ✅ Meal planner (001_mealPlanner)
- ✅ Habit tracker
- ✅ Budget calculator
- ✅ Workout logger
- ✅ Recipe manager
- ✅ Reading list
- ✅ Time tracker
- ✅ Expense splitter
- ✅ Password generator
- ✅ Pomodoro timer
- ✅ Note-taking app
- ✅ Todo list with categories
- ✅ Flashcard app
- ✅ Contact organizer

### Avoid
- ❌ Real-time collaboration
- ❌ Complex algorithms
- ❌ Heavy data processing
- ❌ Authentication systems
- ❌ File uploads/processing
- ❌ Video/audio processing
- ❌ Maps integration
- ❌ Payment processing

## Testing Strategy

### Use MCP Chrome DevTools
1. Navigate to localhost
2. Take snapshot (accessibility tree)
3. Click through user flows
4. Verify data aggregation
5. Test localStorage persistence (refresh page)
6. Check responsive layout
7. Take screenshot for documentation

### Test Checklist
- [ ] All buttons work
- [ ] Data persists on refresh
- [ ] No console errors
- [ ] Forms validate properly
- [ ] Lists update correctly
- [ ] Checkboxes toggle
- [ ] Remove/delete functions work
- [ ] Mobile responsive

## Documentation

### Include in Each Project
- Screenshot of working app
- Feature list with checkmarks
- Code statistics (scc output)
- Quick start instructions
- Tech stack summary

### Example Project README
```markdown
# Project Name

Brief description of what it does and the problem it solves.

## Features
- ✅ Feature 1
- ✅ Feature 2
- ✅ Feature 3

## Tech Stack
React • TypeScript • Tailwind • shadcn/ui

## Getting Started
\`\`\`bash
npm install
npm run dev
\`\`\`

## Code Stats
- Lines of Code: XXX
- Components: X
- Time to Build: 30-60 min
```

## Estimation Accuracy

### For 30-60 min projects
- **TypeScript**: 400-600 lines
- **JSON data**: 100-300 lines
- **CSS**: 60-100 lines
- **Total**: 600-900 lines
- **Complexity**: < 100
- **Components**: 5-8 files

### Example from 001_mealPlanner
- Total: 846 lines ✅
- TypeScript: 520 lines ✅
- JSON: 260 lines ✅
- CSS: 66 lines ✅
- Complexity: 65 ✅
- Time: ~45 minutes ✅

## Common Components to Reuse

### From shadcn/ui
- Button (always needed)
- Card (main containers)
- Checkbox (lists, settings)
- Input (forms)
- Select (dropdowns)
- Badge (categories, tags)
- Dialog (modals, confirmations)
- Tabs (multiple views)

### Custom Hooks
- `useLocalStorage` - data persistence
- `useDebounce` - search inputs
- `useToggle` - boolean states

## Troubleshooting

### Common Issues

**JSON imports not working**
- Already configured in template, no action needed

**localStorage not syncing**
- Use the useLocalStorage hook pattern above
- Listen to 'storage' event for cross-tab sync

**Type errors with JSON data**
- Cast imported JSON: `as MyType[]`
- Define proper TypeScript interfaces

**Components too large**
- Break into smaller sub-components
- Extract repeated UI patterns
- Move logic to custom hooks

**State management complex**
- For small projects, useState in App.tsx is enough
- Use useMemo for computed/derived state
- Don't over-engineer with Redux/Zustand

## Next Project Checklist

Before starting a new project, verify:

- [ ] Real user need identified?
- [ ] 3-5 core features defined?
- [ ] Code estimate 600-900 lines?
- [ ] Data structure designed?
- [ ] No external APIs needed?
- [ ] Can use template?
- [ ] Testable with MCP tools?
- [ ] Achievable in 30-60 minutes?

## Philosophy

> Keep it simple, make it work, ship it fast.

These projects are perfect for:
- Learning new concepts
- Rapid prototyping
- Portfolio building
- Practice coding
- Solving personal problems

Don't overthink it. Build, test, iterate. The goal is to create something useful quickly, not to build a production-ready enterprise application.

---

**Remember**: Constraint breeds creativity. The 30-60 minute limit forces you to focus on what really matters.
