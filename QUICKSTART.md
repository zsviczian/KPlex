# KPlex Quick Start

## 5-Minute Setup

### 1. Install & Build
```bash
cd /workspaces/KPlex
npm install
npm run build
```

### 2. Copy to Obsidian
```bash
# Create plugin directory
mkdir -p ~/.obsidian/plugins/kplex

# Copy built files
cp main.js manifest.json styles.css ~/.obsidian/plugins/kplex/
```

### 3. Enable Plugin
1. Open Obsidian
2. Settings → Community plugins → Reload
3. Enable "KPlex"

### 4. Open View
1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type "Toggle KPlex"
3. View appears in right sidebar

## First Use

### Create Test Notes
Create three notes with these frontmatters:

**parent.md**
```yaml
---
title: Parent Concept
---
This is a parent concept.
```

**child.md**
```yaml
---
title: Child Concept
parent: "[[parent]]"
---
This is a child concept connected to parent.
```

**sibling.md**
```yaml
---
title: Sibling Concept
parent: "[[parent]]"
friends: "[[child]]"
---
This is a sibling concept.
```

### View the Graph
1. Open `parent.md`
2. KPlex shows:
   - Central node: "Parent Concept"
   - South (Children): "Child Concept", "Sibling Concept"

3. Open `child.md`
2. KPlex shows:
   - North (Parents): "Parent Concept"
   - West (Friends): "Sibling Concept" (from friends field)

## Key Concepts

### Spatial Layout
```
        ⬆ Parents (North)
        
⬅ Friends   [CENTRAL]   Friends ➜
(West)        NODE        (East)

        ⬇ Children (South)
```

### Two Types of Relationships

**Inferred** (Automatic)
- Standard `[[wiki links]]` 
- By default: A→B means A is parent of B
- Toggle with settings

**Explicit** (Defined in frontmatter)
```yaml
parent: "[[Parent File]]"
child: ["[[Child 1]]", "[[Child 2]]"]
friends: "[[Related Note]]"
opposes: "[[Opposing Idea]]"
previous: "[[Earlier Step]]"
next: "[[Later Step]]"
```

### Customizable Fields

Go to Settings → KPlex to change field names:
- Parent fields: `parent`, `up`, `origin`, etc.
- Child fields: `child`, `down`, `leads to`, etc.
- Friend fields: `friends`, `similar`, `supports`, etc.
- Opposing: `opposes`, `disadvantages`, etc.
- Sequence: `previous`, `next`, `before`, `after`, etc.

## Common Workflows

### Workflow 1: Bottom-up Building
1. Create detailed notes (children)
2. Link them: `[[parent]]`
3. Create parent notes as you go
4. KPlex shows emerging structure

### Workflow 2: Top-down Planning
1. Create parent topics
2. Add `child` fields with unresolved links
3. See ghost nodes for planned structure
4. Create child notes to fill them in

### Workflow 3: Lateral Connections
1. Create standalone notes
2. Use `friends` field: similar, supporting, or related ideas
3. Use `opposes` for contrasting views
4. KPlex shows idea network

## Commands

| Action | Method |
|--------|--------|
| Toggle view | `Ctrl+Shift+P` → "Toggle KPlex" |
| Refresh graph | `Ctrl+Shift+P` → "Rebuild graph index" |
| Navigate nodes | Click any node in KPlex |
| View settings | Settings → KPlex |

## Settings Overview

**Link Inference**
- Inverse: Treat forward links as parent (opposite of default)
- As friends: Treat all links as lateral connections

**Display**
- Show virtual nodes: Display unresolved links as ghosts
- Show inferred: Show standard link relationships
- Show folders/tags: Include in graph
- Compact: Reduce spacing

**Ontology**
- Customize field names for each relationship type
- Add new fields as needed

## Troubleshooting

### Graph not showing
- Confirm file has YAML frontmatter (between ---)
- Check syntax: `parent: "[[filename]]"` (with quotes)
- Run: Rebuild graph index command

### Settings not working
- Restart Obsidian
- Check field names match your frontmatter
- Use exact case as configured

### Performance slow
- Enable compact view
- Hide virtual nodes
- Hide inferred relationships
- Close other plugins

## Advanced Tips

### Multi-level Hierarchies
```yaml
---
parent: "[[Main Topic]]"
child: 
  - "[[Subtopic 1]]"
  - "[[Subtopic 2]]"
friends: "[[Related Topic]]"
---
```

### Linking Multiple Parents
```yaml
---
parent:
  - "[[Parent 1]]"
  - "[[Parent 2]]"
---
```

### Mixed Relationships
```yaml
---
parent: "[[Theory]]"
child: "[[Application]]"
friends: "[[Similar Idea]]"
opposes: "[[Counterargument]]"
---
```

### Virtual Node Planning
Create link without creating file:
```
[[Planned Note About XYZ]]
```
Ghost node appears in graph, reminding you to create the note.

## Development

To modify or develop:

```bash
npm run dev  # Watch mode
# Edit files, rebuild automatically

# Test changes
npm run lint
npm run build
```

See `BUILD.md` for full development guide.

## Where to Go Next

- **USER**: Read [README_KPLEX.md](README_KPLEX.md) for full features
- **DEVELOPER**: Read [ARCHITECTURE.md](ARCHITECTURE.md) for technical details
- **BUILDER**: Read [BUILD.md](BUILD.md) for build instructions

## Getting Help

1. Check [README_KPLEX.md](README_KPLEX.md) Features section
2. Review [ARCHITECTURE.md](ARCHITECTURE.md) How-To section
3. Check Obsidian console for errors: `Ctrl+Shift+I`
4. Create issue on [GitHub](https://github.com/zsviczian/KPlex)

## Examples to Try

### Example 1: Learning Path
```
Biology (parent)
  └─ Cells (child)
     └─ Organelles (child)
        └─ Mitochondria (child)
        └─ Nucleus (child)
           └─ DNA (child)
```

### Example 2: Interconnected Ideas
```
Machine Learning (central)
  Parents: AI, Computer Science
  Children: Neural Networks, Algorithms, Data Processing
  Friends: Statistics, Pattern Recognition
  Opposes: Symbolic AI
```

### Example 3: Project Planning
```
Project Name (central)
  Previous: Research Phase
  Next: Implementation Phase, Testing Phase
  Child: Component 1, Component 2
  Opposes: Alternative Approach
```

## Tips for Best Results

1. **Use consistent formatting** - Always use `[[filename]]` syntax
2. **Add descriptions** - Fill note content for better understanding
3. **Link bidirectionally** - Use both directions for mutual relationships
4. **Create explicit links** - Don't rely only on inferred links
5. **Review periodically** - Check KPlex view to catch missed connections
6. **Use virtual nodes** - Plan structure before writing content

---

**Ready?** Open your Obsidian vault and toggle KPlex view now!
