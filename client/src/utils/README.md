# Utilities Directory

This directory contains reusable utility functions organized by domain. These utilities are used throughout the application to maintain consistent functionality.

## Organization

- `coordinates.ts` - Coordinate transformation utilities for floorplan viewer
- `date-time.ts` - Date and time formatting utilities
- `exportUtils.ts` - Export utilities for various formats (PDF, Excel, CSV)
- `gateway-calculator.ts` - Camera gateway calculation utilities
- `gemini.ts` - Gemini AI integration utilities
- `ui.ts` - UI helper functions (className merging, column helpers, etc.)

## Usage Guidelines

1. **Import from the correct file** - Utilities are grouped by domain to make them easier to find.
2. **Maintain documentation** - Keep JSDoc comments updated for all utility functions.
3. **Avoid duplicating functionality** - If you need a utility that might already exist, look here first.
4. **Maintain type safety** - All utilities should be properly typed.

## Legacy Utilities

Some components may still import from `@/lib/*` paths. These imports are gradually being migrated to the consolidated utilities in this folder.

The following mappings show where to find functionality previously located in other files:

| Old Import Location | New Import Location |
|--------------------|---------------------|
| `@/lib/utils` | `@/utils/ui` |
| `@/lib/time-utils` | `@/utils/date-time` |
| `@/lib/coordinate-utils` | `@/utils/coordinates` |
| `@/lib/gateway-calculator` | `@/utils/gateway-calculator` |