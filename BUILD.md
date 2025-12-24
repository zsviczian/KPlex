# KPlex Build & Development Guide

## Prerequisites

- Node.js 16+ and npm
- Obsidian 1.4.0 or higher
- Git (optional, for version control)

## Setup

### 1. Install Dependencies

```bash
cd /workspaces/KPlex
npm install
```

This installs:
- Obsidian SDK
- React 18
- TypeScript 5
- Rollup build tools
- ESLint

### 2. Project Structure

```
kplex/
├── src/
│   ├── core/              # Graph engine (non-UI)
│   │   ├── types.ts       # Type definitions
│   │   ├── graph-node.ts  # Node implementation
│   │   ├── graph-index.ts # Index manager
│   │   ├── graph-query-service.ts
│   │   ├── url-parser.ts
│   │   └── index.ts       # Exports
│   ├── ui/                # React & Obsidian integration
│   │   ├── kplex-view.tsx # React component
│   │   ├── kplex-view-container.ts
│   │   ├── settings-tab.ts
│   │   └── index.ts
│   ├── utils/
│   │   └── helpers.ts     # Utility functions
│   ├── styles/
│   │   └── kplex-view.css
│   └── main.ts            # Plugin entry point
├── package.json
├── manifest.json          # Plugin metadata
├── tsconfig.json
├── rollup.config.js       # Build config
├── eslint.config.js
└── README.md
```

## Development

### Development Build

```bash
npm run dev
```

This:
- Runs ESLint checks
- Compiles TypeScript to JavaScript
- Watches for file changes
- Outputs to `main.js`, `manifest.json`, `styles.css`

### Production Build

```bash
npm run build
```

This:
- Runs full linting
- Compiles to production-optimized output
- Generates minified bundle

### Linting

```bash
npm run lint
```

Check for TypeScript errors and code style issues.

## Installation for Testing

### Method 1: Symlink (Recommended for Development)

```bash
# Copy built files to Obsidian plugins folder
cp main.js manifest.json styles.css ~/.obsidian/plugins/kplex/

# Or create a symlink (Linux/Mac)
ln -s /workspaces/KPlex ~/.obsidian/plugins/kplex
```

### Method 2: Direct File Copy

```bash
mkdir -p ~/.obsidian/plugins/kplex
cp main.js manifest.json styles.css ~/.obsidian/plugins/kplex/
```

### Method 3: Hot Reload

Obsidian detects changes if you:
1. Keep `npm run dev` running
2. Use symlink to plugin folder
3. Restart Obsidian or reload plugin in settings

## Testing

### Run Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

## Debugging

### Console Output

Errors appear in:
- Obsidian console: Ctrl+Shift+I (or Cmd+Shift+I on Mac)
- Browser DevTools: F12

KPlex logs to console with `console.log()`:

```typescript
console.log("KPlex: Loading plugin...");
```

### Breakpoints

In VSCode DevTools:
1. Open DevTools (Ctrl+Shift+I)
2. Sources tab
3. Set breakpoints in `main.js`
4. Reload Obsidian

### Common Issues

#### Plugin not loading
- Check manifest.json format
- Verify main.js exists
- Check Obsidian console for errors
- Restart Obsidian completely

#### Settings not persisting
- Check `.obsidian/plugins/kplex/data.json`
- Verify `saveSettings()` is called
- Check browser console for save errors

#### Graph not updating
- Run "Rebuild graph index" command
- Check files have YAML frontmatter
- Verify field names in settings match frontmatter

## Release Build

### Create Release Bundle

```bash
npm run build
```

Output files:
- `main.js` - Plugin code
- `manifest.json` - Metadata
- `styles.css` - Styles

### Package for Distribution

```bash
mkdir kplex-release
cp main.js manifest.json styles.css kplex-release/
zip -r kplex.zip kplex-release/
```

## Environment Variables

None required for basic development. Optional:

```bash
# Enable verbose logging
DEBUG=kplex:*

# Set custom Obsidian vault path
OBSIDIAN_VAULT=~/MyVault
```

## Performance Profiling

### Memory Usage

```typescript
// In console
console.memory
console.profile("KPlexInit")
// ... perform action ...
console.profileEnd("KPlexInit")
```

### Graph Query Performance

Add timing to GraphQueryService:

```typescript
const start = performance.now()
const result = this.getGraphSnapshot(nodeId)
const elapsed = performance.now() - start
console.log(`Query took ${elapsed}ms`)
```

## TypeScript Configuration

`tsconfig.json` is configured for:
- ES2020 target
- Module: ESNext
- React JSX support
- Path resolution

Key compilation options:
- `strict: true` - Strict type checking
- `declaration: true` - Generate .d.ts files
- `sourceMap: true` - Debug support

## Build Configuration (Rollup)

`rollup.config.js` bundles:
- TypeScript → JavaScript
- React JSX support (via Babel)
- CSS bundling
- Node modules resolution
- Production minification (terser)

## Troubleshooting

### Build fails with TypeScript errors

```bash
npm run lint  # See detailed errors
# Fix errors then rebuild
npm run build
```

### React component not rendering

1. Check React 18 DOM mount in KPlexViewContainer
2. Verify CSS imported and loaded
3. Check browser console for React errors

### Settings not showing in UI

1. Verify SettingTab registered in onload()
2. Check Settings tab isn't hidden by other plugin
3. Restart Obsidian plugin

### Performance degradation with large vault

1. Profile with DevTools Performance tab
2. Check GraphIndex.getAllNodes() size
3. Consider incremental indexing for 10k+ files
4. Profile React render times

## Development Tips

### Use TypeScript Strict Mode

Always catch type errors early:

```typescript
// Good - explicitly typed
const node: GraphNode = this.getNode(id)

// Avoid - implicit any
const node = this.getNode(id)
```

### Test with Sample Vault

Create minimal test vault with:
- Parent-child hierarchy
- Lateral connections
- Virtual nodes
- Custom frontmatter fields

```yaml
---
parent: "[[Topic]]"
child: 
  - "[[Subtopic A]]"
friends: "[[Related Note]]"
---
```

### Use React DevTools

Install React DevTools browser extension:
1. Open Obsidian DevTools
2. React tab shows component tree
3. Profile renders and identify bottlenecks

### Clear Cache Between Builds

```bash
rm -rf node_modules/.cache
npm run build
```

## Continuous Integration

For GitHub Actions, add `.github/workflows/build.yml`:

```yaml
name: Build KPlex
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run lint
      - run: npm run build
```

## Next Steps

1. Run development build: `npm run dev`
2. Install to Obsidian: Copy files to `.obsidian/plugins/kplex/`
3. Restart Obsidian
4. Open KPlex view from command palette
5. Create test notes with relationships
6. Verify spatial visualization works
