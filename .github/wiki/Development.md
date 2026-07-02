# Development Guide

## Prerequisites

- Node.js ≥ 18
- npm ≥ 9

## Setup

```sh
npm install
```

## Daily commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite dev server with hot-reload |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run test:unit` | Run unit tests with Vitest |
| `npm run lint` | Lint and auto-fix with ESLint |
| `npm run format` | Format source files with Prettier |

## Environment variables

Copy `.env.example` to `.env.local` and fill in the values.

| Variable | Description |
|----------|-------------|
| `VITE_SENTRY_DSN` | Sentry DSN (leave empty to disable error tracking) |

## Project structure

```
src/
  App.vue                  # Root component (layout, routing)
  main.js                  # App entry point
  router/index.js          # Vue Router routes
  stores/
    app.js                 # UI state (language, loaded flag, map toggle …)
    data.js                # Data state (trenches, items, preferences …)
  components/
    TheHeader.vue           # Top navigation bar
    TheHeaderLang.vue       # Language switcher
    TheHeaderProfile.vue    # Profile / connection panel
    TheControlSearch.vue    # Search input
    TheControlTrenches.vue  # Sector selection sidebar
    TheControlFields.vue    # Type & field selection sidebar
    TheControlExport.vue    # Export buttons
    TheTable.vue            # Tabulator-based data table
    TheMap.vue              # Leaflet map
    TheItem.vue             # Item detail panel
    TheItemStandalone.vue   # Standalone item route
    ThePatches.vue          # Conflict resolution UI
    TheSpinner.vue          # Loading indicator
    base/                   # Reusable primitives (BaseButton, BaseCheckbox, BaseAccordion)
  services/
    ApiClient.js            # iDig server HTTP client (Axios)
    json2geojson.js         # Convert iDig serialised geometry to GeoJSON
    coordinateUtils.js      # CRS detection and coordinate transforms (proj4)
    coloring.js             # Field-value colouring helpers
    mapExport.js            # Map PDF/SVG export (jsPDF)
    mapItemsLayers.js       # Leaflet layer helpers
    mapOverlays.js          # GeoTIFF raster overlay loader
    CustomLayersTree.js     # Leaflet layer tree control
    fieldDefinition.js      # Native field schema
    localStorageManager.js  # Typed localStorage helpers
    indexedDbManager.js     # IndexedDB helpers for offline caching
    pushSurveyService.js    # Push changes back to iDig server
  assets/
    nativeFields.js         # Built-in iDig field definitions
  locales/                  # i18n JSON files (en, fr, de, it, el)
```

## Recommended IDE

[VSCode](https://code.visualstudio.com/) with the
[Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) extension
(disable Vetur if installed).

## Key dependencies

| Package | Purpose |
|---------|---------|
| Vue 3 | UI framework |
| Vite | Build tool |
| Pinia | State management |
| Quasar | UI component library |
| Leaflet | Interactive maps |
| Tabulator | Data table |
| vue-i18n | Internationalisation |
| proj4 | CRS / coordinate transforms |
| axios | HTTP client |
| dayjs / luxon | Date handling |
| jsPDF | PDF / SVG export |
| Sentry | Error monitoring |

## Branch and PR conventions

- Active development happens on the `dev` branch.
- Feature branches are named after the issue number and a short slug, e.g. `123-feature-slug`.
- PRs reference the issue in the template (`https://github.com/esag-swiss/iDig-Webapp/issues/____`).
- Merges to `dev` trigger the wiki update workflow automatically.

## Wiki automation

The wiki is updated automatically on every push to `dev` by the
`.github/workflows/update-wiki.yml` workflow. Static pages live in
`.github/wiki/` and a `Changelog` page is generated from the 30 most
recent merge commits.
