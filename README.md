# CNAPP Dashboard (Angular)

Dynamic, JSON-driven security dashboard with add/remove widgets, search, and persisted state.

## Tech
Angular (standalone components, signals, new control flow) · NgRx SignalStore · Reactive Forms · OnPush · Vitest unit tests

## Run locally
1. Install Node.js LTS (v20+) and Angular CLI: `npm i -g @angular/cli`
2. `git clone <repo-url>` and `cd cnapp-dashboard`
3. `npm install`
4. `ng serve` and open http://localhost:4200
5. `ng test` to run unit tests

## Features
- Dashboard built from `public/dashboard.json` (categories, each with widgets)
- "+ Add Widget" opens a drawer: tabs per category, checkbox select, Cancel/Confirm
- Create a custom widget (name + text) with form validation
- Remove with the cross icon on the card or by unchecking in the drawer
- Search across all widgets (header filters the dashboard, drawer searches every category)
- State persisted in localStorage; Reset restores the JSON defaults

## Architecture
- `core/`: models and the SignalStore (single source of truth)
- `shared/ui/`: reusable presentational charts (SVG donut, stacked bar)
- `features/dashboard/`: page and feature components

## Design decisions
- Each widget has a `selected` flag, so the cross icon and the drawer checkboxes share one state.
- The drawer keeps a draft selection, so Cancel discards changes.
- Immutable updates plus OnPush for predictable rendering.