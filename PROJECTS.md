# Prompt-Based Projects Collection

This repository contains a collection of small projects created from prompts, built with React, TypeScript, Tailwind CSS, and shadcn/ui.

## Getting Started

### Quick Start

1. Create a new project from the template:
```bash
./create-project.sh my-project-name
cd my-project-name
npm run dev
```

2. Or manually copy the template:
```bash
cp -r template my-project-name
cd my-project-name
npm install
npm run dev
```

## Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - Re-usable component library
- **lucide-react** - Icon library

## Project Structure

```
template/
├── src/
│   ├── components/
│   │   └── ui/          # shadcn/ui components
│   ├── lib/
│   │   └── utils.ts     # Utility functions
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── postcss.config.js
```

## Adding More shadcn/ui Components

The template includes Button and Card components. To add more:

1. Visit [shadcn/ui docs](https://ui.shadcn.com/docs)
2. Browse components
3. Copy the component code to `src/components/ui/`
4. Import and use in your project

Example components to consider:
- Input
- Dialog
- Select
- Tabs
- Form
- Toast
- Badge
- Avatar
- Dropdown Menu

## Tips

- Each project should be completable in 30-60 minutes
- Focus on functionality over perfection
- Use shadcn/ui components to speed up development
- MCP tools (Playwright & Chrome DevTools) available for testing

## Projects

List your completed projects here:

- [ ] Project 1 - Description
- [ ] Project 2 - Description
- [ ] Project 3 - Description
