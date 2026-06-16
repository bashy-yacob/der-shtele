# design-sync notes — der-shtele

## What this repo is (read first)
This is a **Next.js 14 app**, not a packaged component library. There is **no
Storybook** and **no library `dist/`**. The design system is the small set of
RTL/Hebrew UI primitives in `frontend/src/components/ui/`. Scope as synced:
**Button, Card, Input** (chosen by the user — "UI primitives only").

`window.DerShtele` namespace; package id `@der-shtele/frontend`.

## How the build is wired (the non-standard bits)
Because there's no dist and no barrel, two build inputs are generated under
`frontend/.ds-sync-build/` (gitignored — they're machine inputs, regenerate them):

- **`entry.tsx`** — a hand-written barrel re-exporting only Button/Card/Input via
  the `@/` alias. Passed as `cfg.entry` so the bundle stays minimal. Synth-entry
  mode (`export * from` every `src/*.tsx`) is deliberately AVOIDED — it would pull
  the whole Next.js app (pages, `next/font`, server APIs) into one IIFE and likely
  break it. PKG_DIR resolves to `frontend/` because the entry lives inside it.
- **`input.css` + `tailwind.config.js` + `compiled.css`** — the components style
  with Tailwind utility classes, so a stylesheet must be **pre-compiled** (the raw
  `src/styles/globals.css` is unusable: it still has `@tailwind`/`@apply`
  directives). `compiled.css` is the Tailwind output and is pointed at by
  `cfg.cssEntry`. The build's tailwind config scans `src/**` AND
  `.design-sync/previews/**`, so authored-preview utility classes are included too.

### Re-compile the CSS whenever previews or component classes change
```sh
cd frontend && node ../node_modules/tailwindcss/lib/cli.js \
  -c .ds-sync-build/tailwind.config.js -i .ds-sync-build/input.css \
  -o .ds-sync-build/compiled.css --minify
```
The converter does NOT run Tailwind — if you author a preview using a utility
class that doesn't already appear in `src/`, recompile the CSS BEFORE rebuilding
the bundle, or that class ships unstyled.

## Fonts — Heebo
Heebo is loaded via a remote `@import url(https://fonts.googleapis.com/...)`. In
`input.css` that `@import` is hoisted to the **very first line** on purpose: the
package shape never auto-hoists remote imports (that path is Storybook-only), and
`compiled.css` becomes `_ds_bundle.css` verbatim, so a non-leading `@import` would
be ignored by the browser and Heebo would silently fall back to Arial. Keep it
first. `cfg.runtimeFontPrefixes: ["Heebo"]` declares it as runtime-provided so
validate doesn't flag `[FONT_MISSING]`.

## Re-sync risks (what can silently go stale)
- **`frontend/.ds-sync-build/` is gitignored.** A fresh clone has no `entry.tsx`,
  `compiled.css`, or build tailwind config — they must be regenerated before any
  build. (Templates: see "How the build is wired" above. If this becomes painful,
  consider committing them or a small regen script.)
- **`compiled.css` is a build artifact**, not tracked. If the app's theme
  (`frontend/tailwind.config.js`) or component classes change, recompile or the
  bundle ships stale styles.
- **Heebo via remote CDN** — every render depends on Google Fonts being reachable
  at view time. No offline/self-hosted fallback is shipped.
- **`.d.ts` contracts are synth-derived** (no shipped types) — props come from
  ts-morph reading the `.tsx` source. Weaker than a real build's `.d.ts`; if a
  prop body comes out wrong, pin it with `cfg.dtsPropsFor.<Name>`.

## Run state
- **Uploaded (2026-06-16).** Project created on claude.ai/design:
  `דער שטעלע — מערכת עיצוב`, projectId `4c4490d8-7a36-4be8-bf41-4e58f085a9e1`
  (pinned in `config.json`). All 3 components (Button/Card/Input) uploaded via the
  incremental path; render check clean, every preview cell graded `good`. This synced
  the **existing blue design** (per the user's explicit choice "design-sync on the
  existing", NOT the planned navy/olive/sand redesign).
- Re-sync is now anchored: fetch the project's `_ds_sync.json` →
  `.design-sync/.cache/remote-sync.json` and run `resync.mjs --remote …`.
- **Next sync after the visual redesign lands**: when the navy/olive/sand + Frank Ruhl
  Libre redesign is implemented in `frontend/`, recompile `compiled.css`
  (see "Re-compile the CSS" above), rebuild, and re-sync — the conventions header
  (`conventions.md`) still describes the OLD blue palette and must be re-validated /
  rewritten then.
