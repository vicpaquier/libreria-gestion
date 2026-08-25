# Agent Guide

## Project

- This is a single Angular application, not a monorepo. The application is rooted at `src/`; `src/main.ts` bootstraps the standalone `App` component and `src/app/app.routes.ts` owns routing.
- Angular CLI is 22.1.5, dependencies resolve to Angular 22.1.x, and the project uses standalone components with Vitest through the Angular unit-test builder.
- Angular Material and CDK are installed; global styles are loaded in `angular.json` from `src/material-theme.scss` and `src/styles.css`.
- `sss.md` contains the repository's Angular/TypeScript conventions. In particular, use signals, native `@if`/`@for`/`@switch` control flow, `inject()`, signal inputs/outputs, and do not add `standalone: true` or explicit `OnPush` metadata.

## Setup And Commands

- Use pnpm, pinned by `package.json` to `pnpm@12.0.0-rc.11`; preserve `pnpm-lock.yaml` when changing dependencies. Angular 22 requires Node `22.22.3+` (or Node 24/26 versions supported by the installed CLI).
- Install dependencies with `pnpm install`.
- Start the dev server with `pnpm start` and open `http://localhost:4200/`.
- Build with `pnpm run build` (the default is the production configuration); use `pnpm run watch` for a development watch build.
- Run all unit tests with `pnpm test` or deterministically with `pnpm exec ng test --watch=false`.
- Run a focused test with `pnpm exec ng test --watch=false --include src/app/app.spec.ts --filter 'test name or suite'`.
- Do not forward test flags as `pnpm test -- --watch=false`; this setup passes the separator through and Angular rejects the resulting arguments. Use `pnpm exec ng test` for flags.
- There are no configured lint, typecheck, or e2e scripts/targets. Do not assume `pnpm lint`, `pnpm typecheck`, or `ng e2e` exists; use the build and Vitest commands above for verification.

## Formatting

- Prettier is configured with 100-character lines, single quotes, and the Angular parser for HTML. Check relevant files with `pnpm exec prettier --check <files>`; format only the files you intentionally change.

You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.
## TypeScript Best Practices
- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain
## Angular Best Practices
- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Do NOT set `changeDetection: ChangeDetectionStrategy.OnPush` explicitly. `OnPush` is the default in Angular v22+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.
## Accessibility Requirements
- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.
### Components
- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `model()` for two-way bound properties with `[(prop)]` syntax instead of pairing `input()` with `output()`
- Use `computed()` for derived state
- Use `linkedSignal()` for state derived from multiple reactive sources that must stay synchronized
- Prefer inline templates for small components
- Prefer Signal Forms (`@angular/forms/signals`) for new forms. They are stable in Angular v22+ and provide signal-based state, type-safe field access, and schema-based validation
- When not using Signal Forms, prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.
## State Management
- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead
## Templates
- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.
## Services
- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Prefer the `@Service` decorator over `@Injectable({providedIn: 'root'})` for new singleton services (Angular v22+)
- Use the `inject()` function instead of constructor injection