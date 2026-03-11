# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains custom ArcGIS Experience Builder (ExB) 1.18 widgets built for SDMA drillhole/survey data management. Widgets integrate with ArcGIS GP Services and webhooks to manage RPAS, TLS, and topographic survey data.

## Build & Dev Commands

All commands run from `D:\STUFF\drillhole\SDMA\ArcGIS\arcgis-experience-builder-1.18\client\`:

```bash
npm start              # Dev server with hot reload (webpack watch)
npm run build:dev      # Development build
npm run build:prod     # Production build
npm test               # Run all Jest tests (--runInBand)
npm test -- --watch    # Watch mode
npm test -- --coverage # With coverage report
npm run lint           # ESLint
```

To run tests for a single widget:
```bash
npm test -- --testPathPattern="rpas-data-loader"
```

## Widget Directory Structure

```
your-extensions/widgets/
├── rpas-data-loader/          # Most complex widget — RPAS/TLS/Small Project Imagery loader
├── analysis-widget-custom/
├── custom-coordinates/
├── dxf-reprojector/
├── roads-compliance/
├── topsoil-volume-calculator/
├── weekly-volume-calculator/
├── finalise-data/             # Current widget (stub/template)
├── go-to-location/            # Stub
├── ground-control-exporter/   # Stub
├── surface-loader/            # Stub
├── volume-calculator/         # Stub
└── simple/                    # Minimal reference template
```

Each widget follows this layout:
```
widget-name/
├── manifest.json       # Widget metadata, ExB version, defaultSize, hasSettingPage
├── config.json         # Default config values
├── icon.svg
└── src/
    ├── config.ts       # TypeScript Config interface + IMConfig type + helper functions
    ├── runtime/
    │   ├── widget.tsx  # Main widget entry point (AllWidgetProps<Config>)
    │   ├── *.tsx       # Sub-components (complex widgets)
    │   ├── *Service.ts # Business logic services (static classes)
    │   └── styles.css
    ├── setting/        # Optional — admin config panel (AllWidgetSettingProps)
    │   └── setting.tsx
    └── __tests__/
```

## Architecture Patterns

### Jimu Framework
- Import React from `jimu-core`, not directly from `react`
- Widget entry point signature: `AllWidgetProps<IMConfig>` from `jimu-core`
- Config is immutable: `IMConfig = ImmutableObject<Config>` from `seamless-immutable`
- Theme access: `useTheme2()` hook from `jimu-theme`
- Settings panel signature: `AllWidgetSettingProps<IMConfig>` from `jimu-for-builder`

### GP Service Integration
- GP utilities are configured in the settings panel via `UtilitySelector` from `jimu-for-builder`
- The utility object is stored in config; resolve the actual URL at runtime using `UtilityManager` from `jimu-core`, with a Redux state fallback
- See `rpas-data-loader/src/config.ts` for the `resolveGPTaskUrl()` pattern

### Settings Panel
- Enable with `"hasSettingPage": true` in `manifest.json`
- Use `SettingSection`/`SettingRow` layout components from `jimu-ui`
- GP service selection uses `UtilitySelector` from `jimu-for-builder`

### Component Style
- `widget.tsx` uses functional components with hooks
- Sub-form components (e.g., RPASElevation, TLSElevation) use class components
- CSS-in-JS via Emotion; theme colors via `theme.sys.color.primary.*`

### Config Helper Pattern
The `config.ts` file is the right place for:
- TypeScript interfaces (`Config`, `IMConfig`)
- Utility functions used across sub-components (e.g., projection options, URL resolvers)
- Constants (e.g., `PROJECTIONS` array for Australian coordinate systems)

## DataFinalizeWidget (`data-finalize`) Architecture

### Purpose
Queries an ArcGIS FeatureServer for edit statistics per layer (Edited / ReEdited / New / Deleted), displays them in a table with a total count, and triggers a Jenkins `buildWithParameters` job on finalise.

### System Flow
```
widget.tsx (useEffect on config change)
  └─► Promise.all(layers.map(queryLayerStatistics))   ← FeatureService.ts
        └─► ArcGIS REST: /query?groupByFieldsForStatistics=FeatureStatus
              └─► statisticsParser.ts: buildLayerStatRows + calcTotalEdits
                    └─► DataTable + TotalCounter (render)
                          └─► FinalizeButton click
                                └─► JenkinsService.triggerJenkins (POST form-encoded)
```

### Folder Layout
```
data-finalize/src/
├── config.ts                     # Config + IMConfig interfaces
├── types.ts                      # FeatureStatus, LayerStatRow, QueryStatus
├── runtime/
│   ├── widget.tsx                # Orchestrator: fetch → state → render
│   ├── components/
│   │   ├── DataTable.tsx         # Statistics table (HTML table, CSS vars for theming)
│   │   ├── TotalCounter.tsx      # Total edits badge
│   │   └── FinalizeButton.tsx    # Disabled when totalEdits === 0
│   ├── services/
│   │   ├── FeatureService.ts     # queryLayerStatistics() — ArcGIS stats query
│   │   └── JenkinsService.ts     # triggerJenkins() — POST to buildWithParameters
│   └── utils/
│       └── statisticsParser.ts  # Pure functions: buildLayerStatRows, calcTotalEdits
└── setting/
    └── setting.tsx               # Dynamic layer list + Jenkins params config
```

### ArcGIS Statistics Query Pattern
```
GET {featureServiceUrl}/{layerIndex}/query
  ?where=Loader='pathgi@APAC'          (or 1=1 if no loaderFilter)
  &groupByFieldsForStatistics=FeatureStatus
  &outStatistics=[{"statisticType":"count","onStatisticField":"FeatureStatus","outStatisticFieldName":"FeatureCount"}]
  &f=json
```
Response features are parsed into `FeatureStatus` — missing statuses default to `0`.

### Jenkins Integration
- HTTP POST with `Content-Type: application/x-www-form-urlencoded`
- Jenkins `buildWithParameters` returns **201 Created** (not 200) on success
- Always sends: `loader`, `totalEdits`, `timestamp`; extra static params from config are merged in
- **Never store auth tokens in widget config** — point the URL at a proxy that injects credentials

### Config Update Pattern (Settings Panel)
```typescript
// Preferred — type-safe single-field update:
onSettingChange({ id, config: config.set('featureServiceUrl', value) })

// Multi-field shallow merge:
onSettingChange({ id, config: config.merge({ jenkinsUrl, jenkinsParams }) })

// Mutating an immutable array:
const layers = Array.from(config.featureLayers)  // spreads ImmutableArray → plain array
update({ featureLayers: [...layers, newLayer] })
```

---

## Key Reference Widget

**`rpas-data-loader`** is the most complete example demonstrating:
- GP Service integration with retry/webhook support
- Settings panel with `UtilitySelector` and multi-select projections
- Validation service pattern (`ValidationService.ts`)
- Webhook service with exponential backoff (`WebhookService.ts`)
- File upload to ArcGIS (`ArcGISFileUploadService.ts`)
- Full test suite under `src/__tests__/`
