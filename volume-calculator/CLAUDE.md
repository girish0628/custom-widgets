# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Context

This is the `volume-calculator` widget — currently a stub/template awaiting full implementation. For all shared architecture patterns (Jimu framework, GP Service integration, settings panel conventions, config update patterns), refer to the parent `../CLAUDE.md`.

## Current State

This widget is a minimal scaffold:
- `src/config.ts` — placeholder `exampleConfigProperty` only; replace with real config fields
- `src/runtime/widget.tsx` — renders the config property directly; replace with actual UI
- `config.json` — default config values matching `Config` interface
- `manifest.json` — no settings page (`hasSettingPage` absent), size 800×500
- `tests/` — note: tests live in `tests/` (not `src/__tests__/` as per the pattern in other widgets)

## Build & Test

Commands run from `D:\STUFF\drillhole\SDMA\ArcGIS\arcgis-experience-builder-1.18\client\`:

```bash
npm test -- --testPathPattern="volume-calculator"   # Run this widget's tests only
npm start                                            # Dev server
```

## Reference

**`../rpas-data-loader`** is the most complete widget example for GP Service integration, settings panels, validation, and webhooks.
**`../data-finalize`** is a good simpler reference for FeatureService queries + settings panel config update patterns.
