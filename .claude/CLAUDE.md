# Show Me Your Prompt - Project Instructions

## Purpose
30-60 minute MVP React projects. Constraint breeds creativity.

## Constraints
- 3-5 features | Single page | No APIs
- Stack: React 18 + TypeScript + Vite + Tailwind + shadcn/ui
- Persistence: localStorage only

## Workflow

### 1. Planning (propose before coding)
- Define real problem + 3-5 features
- Design data structures first

### 2. Implementation (in order)
1. `./create-project.sh 00x_project_name`
2. Define types in `types/index.ts`
3. Create `data/*.json` (20-30 items)
4. Create components (<150 lines each)
5. Wire in `App.tsx`

### 3. Completion
- Test all features
- Commit with descriptive message

## Code Patterns

Reference: `template/src/` (self-contained)

- **State**: App.tsx owns state (useState), computed via useMemo
- **Components**: <150 lines, single responsibility, props not context
- **Persistence**: Use `hooks/useLocalStorage.ts`
- **Data**: JSON in `data/`, types in `types/`
- **shadcn/ui**: Button, Card, Checkbox (always); Input, Select, Badge, Dialog (as needed)

## Naming
- Projects: `00x_descriptive_name` (next: 005)
- Components: PascalCase
- Data files: kebab-case.json

## Targets
- 3-5 features
- 3-5 components (<150 lines each)
- 30-60 minutes
