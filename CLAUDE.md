# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CapitalCasually is a React educational app for casual financial exploration - helping users understand revenue structures of publicly traded companies and country budgets/debt. Built with TypeScript, React 19, Vite, Tailwind CSS 4, and Zustand for state management.

## Common Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production (TypeScript compilation + Vite build)
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build
- `npm run build:schemas` - Generate JSON schemas from TypeScript types

## Architecture

### Data Architecture
The app uses a hierarchical JSON-based data structure:

- **Data Index** (`public/data/dataIndex.json`): Main navigation structure with sections and subsections
- **Metadata files** (`public/data/companies/[name]/metadata.json`): Entity descriptions and available datasets
- **Data files** (`public/data/companies/[name]/[period].json`): Actual financial data by period

### Type System
Core types are defined in `src/dataTypes.ts`:
- `CapitalType`: Supports "company", "countryBudget", "countryIncome", "countryDebt"
- `DataIndex`: Hierarchical navigation structure
- `CapitalMetadata`: Entity metadata with datasets list
- `CapitalData`: Financial data structure

### Schema Generation
JSON schemas are auto-generated from TypeScript types using `scripts/build-schemas.cjs`. Schemas are stored in `public/data/schemas/` and referenced by data files for validation.

### Tech Stack
- React 19 with TypeScript
- Vite for build tooling
- Tailwind CSS 4 for styling
- Zustand for state management
- D3.js for data visualization
- ESLint with JSON schema validation

The app structure separates data concerns (public/data/) from UI components (src/), with schemas ensuring data integrity across the application.