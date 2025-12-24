# KPlex - Knowledge Plex

A visual personal knowledge management (PKM) tool for Obsidian that provides an interactive, spatially-organized mind map of your vault using the Obsidian Bases API.

## Features

- **Spatial Hierarchy Visualization**: Knowledge graph displayed in cardinal directions
  - **Parents (North)**: Broader categories and origins
  - **Children (South)**: Subcategories and examples
  - **Friends Left (West)**: Lateral connections and similar ideas
  - **Friends Right (East)**: Opposing or complementary ideas
  - **Previous/Next**: Sequential relationships

- **Dual Relationship System**:
  - **Inferred Relationships**: Automatically derived from standard Obsidian links
  - **Explicit Relationships**: Defined via frontmatter fields (e.g., `parent::`, `child::`)

- **Virtual Nodes**: Visualize planned knowledge structure with ghost nodes for unresolved links

- **Obsidian Bases API Integration**: Uses native Obsidian metadata instead of Dataview

- **Customizable Ontology**: Define custom fields for any relationship type

- **Rich Filtering**: Show/hide virtual nodes, inferred relationships, folders, tags, and attachments

## Installation

1. Download the latest release from [GitHub Releases](https://github.com/zsviczian/KPlex/releases)
2. Extract to your Obsidian plugins folder: `.obsidian/plugins/kplex/`
3. Enable the plugin in Obsidian settings
4. Open the KPlex view using the command palette: "Toggle KPlex view"

## Usage

### Basic Navigation

1. Open a note in your vault
2. The KPlex view will display the knowledge graph centered on that note
3. Click any node to navigate to it
4. Hover over nodes for tooltips

### Defining Relationships

Use frontmatter fields to explicitly define relationships:

```yaml
---
parent: "[[Broader Topic]]"
child:
  - "[[Subtopic 1]]"
  - "[[Subtopic 2]]"
friends: "[[Related Note]]"
opposes: "[[Opposing Idea]]"
---
```

### Configuring Ontology

In Settings → KPlex, customize which fields define each relationship type:

- **Parent fields**: Broader categories (e.g., `parent`, `up`, `origin`)
- **Child fields**: Subcategories (e.g., `child`, `down`, `leads to`)
- **Left friend fields**: Lateral connections (e.g., `friends`, `similar`)
- **Right friend fields**: Opposing ideas (e.g., `opposes`, `disadvantages`)
- **Previous/Next fields**: Sequences (e.g., `previous`, `next`)

### Display Options

- **Show virtual nodes**: Display unresolved links as ghost nodes
- **Show inferred nodes**: Show relationships from standard links
- **Show folders**: Include folder nodes in the graph
- **Show tags**: Include tag nodes and their hierarchy
- **Show attachments**: Display file attachments

### Layout Options

- **Inverse inference**: Treat forward links as parent relationships (default: child)
- **Infer all links as friends**: Treat all inferred links as lateral connections
- **Compact view**: Reduce spacing for denser visualization
- **Maximum label length**: Limit characters shown in node names

## Architecture

### Core Components

- **GraphNode**: Individual node in the knowledge graph with relationships
- **GraphIndex**: Central index managing all nodes using Obsidian Bases API
- **GraphQueryService**: Query and navigate the graph
- **KPlexViewContainer**: Obsidian view integration
- **KPlexView**: React visualization component

### Data Flow

```
Obsidian Vault
    ↓
GraphIndex (indexes files, folders, tags, links)
    ↓
GraphQueryService (queries graph based on focus)
    ↓
KPlexView (React component renders spatial visualization)
    ↓
User interaction → navigate to different nodes
```

## Relationship Types

### Inferred (Automatic)

- **Forward link** (A → B): By default, A's children include B
- **Backlink** (B ← A): B's parents include A
- **Mutual links** (A ↔ B): Can be treated as friends or parent-child

### Defined (Explicit)

- Any relationship explicitly set via frontmatter fields
- Takes precedence over inferred relationships

### Direction Merging

- TO (→): One-way, source to target
- FROM (←): One-way, target to source
- BOTH (↔): Bidirectional relationship

## Comparison to TheBrain

Like TheBrain, KPlex provides:

- **Spatial mind mapping** with cardinal directions
- **Hierarchical organization** of thoughts
- **Rich linking** with semantic meaning
- **Visual exploration** of knowledge structure

Differences:

- KPlex is integrated into Obsidian (not standalone)
- Uses native Obsidian links and metadata
- Free and open-source
- Lightweight React-based rendering

## Advanced Features

### Virtual Nodes

Unresolved links create ghost nodes that persist until the file is created. Useful for:

- Planning knowledge structure before writing content
- Identifying gaps in vault
- Scaffolding future notes

### Tag Hierarchy

Tags are automatically organized hierarchetically:

```
#topic
  #topic/subtopic
    #topic/subtopic/specific
```

The graph displays these hierarchies with tag parent-child relationships.

### Metadata-Driven Styling

Nodes can be styled based on their type and properties (via CSS classes):

- `.kplex-node--file`: Regular markdown files
- `.kplex-node--folder`: Folder nodes
- `.kplex-node--tag`: Tag nodes
- `.kplex-node--virtual`: Unresolved links
- `.kplex-node--inferred`: Inferred relationships
- `.kplex-node--url`: URL nodes

## Commands

- **Toggle KPlex view**: Show/hide the KPlex sidebar
- **Rebuild graph index**: Manually refresh the graph from vault data

## Settings

All settings are stored in `.obsidian/plugins/kplex/data.json` and can be configured via the settings panel.

## Troubleshooting

### Graph not updating

- Run "Rebuild graph index" command
- Check that files have proper YAML frontmatter
- Ensure field names match configured ontology fields

### Virtual nodes not showing

- Enable "Show virtual nodes" in settings
- Check that unresolved links exist in your notes

### Performance issues

- Reduce number of visible relationship types
- Enable "Compact view"
- Close other resource-intensive plugins

## Development

```bash
# Install dependencies
npm install

# Start development build
npm run dev

# Build for production
npm run build
```

## Contributing

Contributions are welcome! Please open issues and pull requests on [GitHub](https://github.com/zsviczian/KPlex).

## License

MIT License - see LICENSE file for details

## Credits

Inspired by:

- [ExcaliBrain](https://github.com/zsviczian/ExcaliBrain) - Original visual knowledge graph plugin
- [TheBrain](https://www.thebrain.com/) - Pioneering mind mapping application
- [Obsidian Maps](https://github.com/obsidianmd/obsidian-maps) - Bases API reference implementation
