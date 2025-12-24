# KPlex Architecture & Implementation Guide

## Overview

KPlex is a complete rewrite of the original ExcaliBrain plugin, reimagined as a visual PKM tool using React and Obsidian's Bases API instead of Dataview. It follows a spatial hierarchy model inspired by TheBrain.

## Architecture

### Layer 1: Data Model (`src/core/types.ts`)

Core type definitions and interfaces:

- **NodeRole**: Enum for spatial positions (PARENT, CHILD, LEFT_FRIEND, RIGHT_FRIEND, PREVIOUS, NEXT, SIBLING)
- **RelationType**: DEFINED (explicit) vs INFERRED (automatic)
- **LinkDirection**: TO, FROM, BOTH
- **INode**: Interface defining node properties
- **Ontology**: Configuration for field-based relationships

### Layer 2: Graph Core (`src/core/`)

**GraphNode** - Individual node representation
- Manages its own relationships
- Methods: `addRelation()`, `removeRelation()`, `getNeighborsByRole()`, `getVisibleNeighbors()`
- Handles relation merging (direction and type precedence)

**GraphIndex** - Central index for all nodes
- Uses Obsidian Bases API (not Dataview)
- Maintains multiple maps: `nodes`, `pathToNodeId`, `lowercasePathMap`
- Key methods:
  - `initialize()`: Full vault indexing
  - `indexVault()`: Files and folders
  - `indexTags()`: Tag hierarchy
  - `buildRelationships()`: Resolved links, unresolved links, tag relations, explicit fields

**GraphQueryService** - Query interface
- `getGraphSnapshot()`: Central node with all neighbors at specified depth
- `getSiblings()`: Find sibling nodes
- `getPath()`: Breadcrumb navigation
- `searchNodes()`: Full-text search
- `getConnectedComponent()`: Network traversal

**URLParser** - HTTP link extraction and indexing
- Regex-based URL detection
- Maintains file-to-URL mappings
- Creates URL and origin nodes automatically

### Layer 3: React Visualization (`src/ui/`)

**KPlexView** - React component
- Spatial layout: North/South/East/West/Center
- Neighborhood display with role labels
- Individual node rendering with icons and truncation

**KPlexViewContainer** - Obsidian integration
- Extends `ItemView`
- Manages graph lifecycle
- Event listeners for file changes
- Navigation integration

**KPlexSettingTab** - Settings UI
- All configurable options
- Real-time settings persistence
- Graph rebuild triggers

### Layer 4: Utilities (`src/utils/`)

Helper functions for:
- Node filtering based on settings
- CSS class generation
- Name truncation
- Role labels and areas
- Path formatting

## Data Flow

```
Vault Changes
    ↓
GraphIndex.initialize()
    ├→ indexVault() [files/folders]
    ├→ indexTags() [tag hierarchy]
    └→ buildRelationships()
        ├→ indexResolvedLinks() [standard links]
        ├→ indexUnresolvedLinks() [ghost nodes]
        ├→ indexTagRelationships()
        └→ indexExplicitRelationships() [frontmatter]
    ↓
User clicks node
    ↓
KPlexViewContainer.handleNodeClick()
    ↓
GraphQueryService.getGraphSnapshot()
    ↓
KPlexView.render()
    ↓
Spatial visualization displayed
```

## Relationship Building

### Step 1: Resolved Links
```typescript
// File A links to File B
A → B
// A's children include B
// B's parents include A
```

### Step 2: Unresolved Links
```typescript
// File A links to [[Nonexistent File]]
// Create virtual node for Nonexistent File
// Add relationship same as resolved link
```

### Step 3: Tag Relationships
```typescript
// #topic/subtopic inherits from #topic
// subtopic.parent = topic
```

### Step 4: Explicit Relationships
```yaml
parent: "[[Parent File]]"
child: 
  - "[[Child 1]]"
  - "[[Child 2]]"
friends: "[[Related]]"
```

Parse frontmatter fields and create relationships based on ontology config.

## Key Algorithms

### Relationship Merging

When multiple relationship types exist between same nodes:

```typescript
// Type precedence: DEFINED > INFERRED
// Direction precedence: TO/FROM → BOTH

private mergeType(current, new) {
  return current === DEFINED ? DEFINED : new
}

private mergeDirection(current, new) {
  if (current === BOTH || current === new) return current
  if (to/from mix) return BOTH
  return current || new
}
```

### Sibling Discovery

```typescript
getSiblings(node: Node) {
  const parents = getNeighbors(node, PARENT)
  const siblings = new Set()
  
  parents.forEach(parent => {
    const parentChildren = getNeighbors(parent, CHILD)
    parentChildren.forEach(child => {
      if (child !== node) siblings.add(child)
    })
  })
  
  return siblings
}
```

### Case-Insensitive Path Resolution

```typescript
// Obsidian inconsistent with path case sensitivity
lowercasePathMap = new Map()
// When resolving: check exact first, then lowercase lookup
const node = getByPath(path) || getByPath(lowercasePath)
```

## Settings System

All settings stored in `plugin-data.json`:

```typescript
{
  inverseInfer: boolean,
  inferAllLinksAsFriends: boolean,
  showVirtualNodes: boolean,
  showInferredNodes: boolean,
  showFolders: boolean,
  showTags: boolean,
  showAttachments: boolean,
  compactView: boolean,
  maxLabelLength: number,
  ontology: {
    parents: string[],
    children: string[],
    leftFriends: string[],
    rightFriends: string[],
    previous: string[],
    next: string[],
    hidden: string[]
  }
}
```

Changes trigger:
- `updateSettings()`: Live view update
- `rebuildGraph()`: Full re-index needed

## Styling System

CSS classes applied to nodes:

- `.kplex-node`: Base
- `.kplex-node--central`: Central node
- `.kplex-node--{type}`: file, folder, tag, virtual, url, attachment
- `.kplex-node--virtual`: Virtual/ghost node
- `.kplex-node--inferred`: Inferred relationship
- `.kplex-neighborhood--north/south/west/east/prev/next`: Directional areas

Directional border colors:
- North: Blue (#1976d2)
- South: Purple (#7b1fa2)
- West: Teal (#00796b)
- East: Orange (#f57c00)

## Event Handling

Plugin listens to:

1. **Vault changes**:
   - `vault.on('create')`: New file → add to index
   - `vault.on('modify')`: File changed → update index if current file
   - `vault.on('rename')`: Path changed → remap in index
   - `vault.on('delete')`: File deleted → remove from index

2. **Workspace changes**:
   - `workspace.on('active-leaf-change')`: Active file changed → render new snapshot

3. **Settings changes**:
   - Settings tab → `saveSettings()` → trigger view update or rebuild

## Performance Considerations

### Indexing
- Full index: O(n) where n = number of files
- Incremental update: O(1) per file change
- Graph query: O(m) where m = degree of node

### Rendering
- KPlexView renders max depth levels
- Neighborhood filtering pre-computed
- React memoization prevents unnecessary re-renders

### Optimization Strategies
- Lazy load graph on first open
- Cache snapshot for active file
- Debounce frequent settings changes
- Use virtual scrolling for large neighborhoods

## Testing Strategy

### Unit Tests
- GraphNode: relation merging, direction handling
- GraphIndex: path resolution, case sensitivity
- GraphQueryService: path finding, neighborhood queries

### Integration Tests
- Full indexing pipeline
- Settings persistence
- React rendering updates

### Manual Testing
- Large vault (1000+ files)
- Deep hierarchies (5+ levels)
- Virtual nodes (unresolved links)
- Edge cases: cycles, self-references

## Future Enhancements

1. **Advanced Filtering**: More sophisticated relationship filters
2. **Custom Colors**: Per-tag styling configuration
3. **Link Embeds**: Show file previews on hover
4. **Export**: Save graph as image/SVG
5. **Navigation History**: Back/forward buttons
6. **Search Integration**: Quick search from graph
7. **URL Node Display**: Web content integration
8. **Performance**: Incremental graph updates
