# Project M Task Board (Figma UI)

Kanban-style task management board that matches the “Project M” Figma layout.

## Tech stack
- React + TypeScript + Vite
- Redux Toolkit + React Redux
- `@dnd-kit` drag-and-drop
- Persistence via `localStorage`

## Core features (Level 1)
- Add tasks in each column (dynamic title/description)
- Move tasks across columns (drag and drop)
- Reorder tasks inside a column (drag and drop)
- Search + filters (status + priority)

## Level 2 features implemented (4/6)
- Due date + reminder + reminder banner (due soon / overdue)
- Subtasks (add + complete)
- Customizable task fields (custom priorities + tags)
- Per-task activity log (captures moves, due date updates, subtasks changes, etc.)

## Notes / assumptions
- Only task title and description are fully dynamic; other UI fields are lightweight/hardcoded for the demo.
- State is stored in `localStorage` under key `taskboard:v1`.
- If you change the state schema and see UI issues, clear `taskboard:v1` in DevTools → Application → Local Storage.

## Run locally
```bash
npm install
npm run dev
```
Then open the URL shown in the terminal (usually `http://localhost:5173`).

## Build
```bash
npm run build
npm run preview
```

## Deployment (Vercel / Netlify)
- Build command: `npm run build`
- Output directory: `dist`

## Demo video checklist
- Add task in each column
- Drag task across columns + reorder within column
- Open card menu → Details (due date, reminder, subtasks, activity log)
- Custom fields (add a priority + tag, then use them when creating a task)
- Refresh page to show persistence
