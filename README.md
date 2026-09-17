# iDig Webapp

## Overview

iDig Webapp is a Vue 3 / Vite application used to connect to an iDig server, inspect trench data, and work with maps, tables, and exports.

## Development progress

### Current features

- Server connection through reusable local profiles
- Profile import/export and backward compatibility with older saved connections
- Multilingual UI: French, English, Greek, Italian, and German
- Sector/trench selection with grouped navigation for large projects
- Search with quoted terms, `AND` / `OR`, and field-based filters
- Type and field selection driven by project preferences
- Hide archived items with the `RightsStatus` toggle
- Table and map views with quick switching
- Exports in `.json`, `.tab`, and `GeoJSON` formats
- Standalone item route for direct item access
- Preferences import from local files or from an existing trench

### Typical workflow

1. Create or select a profile.
2. Connect to the iDig server.
3. Load trench preferences.
4. Select sectors and fields.
5. Search, inspect, and export the selected data.

## Project setup

```sh
npm install
```

### Run the app in development

```sh
npm run dev
```

### Build for production

```sh
npm run build
```

### Run unit tests

```sh
npm run test:unit
```

### Lint the codebase

```sh
npm run lint
```

## Notes

- iDig Webapp requires an iDig server connection to load data.
- A public demo is available at https://idig.archaiodata.com/.
- Connection details are stored locally after a successful login.
