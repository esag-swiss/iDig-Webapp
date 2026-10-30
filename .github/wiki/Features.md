# Features

## Connection and profiles

- Named connection profiles stored in `localStorage` (server, project, username, password, language).
- Profile picker on login — one click to reconnect to a previous project.
- Import / export profiles as a `.json` file for backup or sharing across browsers.
- Backward compatibility with the older "connections" format automatically migrated to profiles on first launch.
- Automatic preference loading from the iDig server on connection.
- Preferences can be re-loaded at any time from any trench or from a local `.json` file.

## Sector (trench) selection

- Full list of trenches fetched from the server.
- Individual checkbox per trench; grouped accordion view for projects with 15 or more trenches (groups are formed from the first five characters of the trench name, matching the iDig convention).
- Select-all / select-none with a confirmation dialog when more than 15 trenches would be loaded.

## Item type and field selection

- Type / sub-type dropdown driven by project preferences.
- Fields organised in collapsible accordion groups, also from project preferences.
- Field visibility persisted per type in `localStorage` and restored on next visit.
- Bulk check / uncheck per field group.
- `RightsStatus` field includes a dedicated toggle to hide archived items.

## Search

- Full-text search across all loaded items.
- Case- and diacritic-insensitive by default.
- Exact (case/diacritic-sensitive) match when terms are wrapped in double quotes.
- Boolean `AND` and `OR` operators (not combinable).
- Field-scoped search using the label in the current language followed by a colon — e.g. `Title:"Fusaï" OR spindle`.

## Table view

- Sortable, resizable, and reorderable columns via drag-and-drop.
- Column visibility synced to the field-selection panel.
- Pagination for large datasets.
- Item count badge showing how many records match the current filters.
- Field-group bulk selection shortcut directly from the column headers.

## Item detail panel

- Click any row to open a detailed item form in a side panel.
- Multi-line fields are truncated in the table but displayed in full in the panel.
- Editable fields for items when the server supports write access.
- Photos / attachments rendered inline (including items of type `Stratigraphy`, `Profile`, etc.).
- Direct link to open an item in a standalone route (`/Item/:trench/:id`) for sharing.

## Map view

- Leaflet-based map rendered alongside the table.
- Toggle between table and map with a floating button.
- GeoTIFF raster overlays supported.
- Custom layer tree control for managing base layers and overlays.
- Map export to SVG/PDF.

## Exports

| Format | Content |
|--------|---------|
| `.json` | All fields of items from selected trenches (non-empty only) |
| `.tab` | Tab-separated table of all fields used for the selected type |
| `GeoJSON` | All geo-localised items from selected trenches |

## Internationalisation

- UI available in French, English, Greek, Italian, and German.
- Language switcher in the header; preference saved to `localStorage`.
- Field labels follow the language set in the project preferences.

## Monitoring

- Sentry integration for production error tracking (opt-in via environment variable).

## Typical workflow

```
Create / select profile → Connect → Select sectors → Choose type & fields
→ Search / filter → Browse table → Open item detail → Export
```
