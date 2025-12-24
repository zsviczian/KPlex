# KPlex - Knowledge Plex Plugin

**A visual personal knowledge management tool for Obsidian using React and the Obsidian Bases API**

## 🎯 Project Status: **COMPLETE** ✅

All components have been implemented, tested, and documented. Ready for use and deployment.

---

## 📖 Documentation Index

Start here based on your needs:

### 👤 **For Users**
1. **[QUICKSTART.md](QUICKSTART.md)** - Get started in 5 minutes
2. **[README_KPLEX.md](README_KPLEX.md)** - Full feature documentation
3. **Settings Panel** - In Obsidian Settings → KPlex

### 👨‍💻 **For Developers**
1. **[ARCHITECTURE.md](ARCHITECTURE.md)** - Technical overview
2. **[BUILD.md](BUILD.md)** - Setup & development guide
3. **[IMPLEMENTATION.md](IMPLEMENTATION.md)** - Implementation details
4. **Source Code** - Well-commented TypeScript/React

### 📊 **Project Information**
1. **[COMPLETE.md](COMPLETE.md)** - Completion summary
2. **[MANIFEST.md](MANIFEST.md)** - File manifest
3. **[This File](#)** - Navigation

---

## 🚀 Quick Start

### Installation
```bash
cd /workspaces/KPlex
npm install
npm run build
```

### Usage
1. Copy `main.js`, `manifest.json`, `styles.css` to `.obsidian/plugins/kplex/`
2. Enable plugin in Obsidian
3. Use Command Palette → "Toggle KPlex view"

### First Steps
1. Open any note
2. KPlex shows the knowledge graph
3. Click nodes to navigate
4. Configure settings as needed

---

## 📁 Project Structure

```
KPlex/
├── src/
│   ├── core/              # Graph engine (no UI dependencies)
│   ├── ui/                # React components & Obsidian integration
│   ├── utils/             # Helper functions
│   ├── styles/            # CSS styling
│   └── main.ts            # Plugin entry point
├── Documentation/
│   ├── QUICKSTART.md      # 5-minute guide
│   ├── README_KPLEX.md    # User features
│   ├── ARCHITECTURE.md    # Technical details
│   ├── BUILD.md           # Development guide
│   ├── IMPLEMENTATION.md  # Implementation details
│   ├── MANIFEST.md        # File manifest
│   └── COMPLETE.md        # Completion summary
└── Configuration Files
    ├── manifest.json      # Plugin metadata
    ├── package.json       # Dependencies
    ├── tsconfig.json      # TypeScript config
    └── rollup.config.js   # Build configuration
```

---

## ✨ Key Features

### 🗺️ Spatial Visualization
- Cardinal directions for relationships (N/S/E/W)
- Central node with surrounding neighbors
- Visual hierarchy with meaningful colors
- Responsive design

### 🔗 Dual Relationship System
- **Explicit**: Define in YAML frontmatter
- **Inferred**: Automatic from standard links
- Intelligent merging with proper precedence
- Configurable behavior

### 👻 Virtual Nodes
- Ghost nodes for unresolved links
- Plan structure before writing
- Auto-created as needed
- Filterable display

### ⚙️ Customizable Ontology
- Define field names for each relationship type
- Case-insensitive matching
- Multiple fields per type
- Real-time reconfiguration

### 🎨 Rich UI
- Dark mode support
- Mobile responsive
- Role-based colors
- Smooth interactions

---

## 🏗️ Architecture

### Layer 1: Core Engine
- **GraphNode**: Individual node with relationships
- **GraphIndex**: Central index using Obsidian Bases API
- **GraphQueryService**: Query and navigation interface
- **URLParser**: HTTP link extraction

### Layer 2: UI Components
- **KPlexView**: React spatial visualization
- **KPlexViewContainer**: Obsidian integration
- **KPlexSettingTab**: Settings UI

### Layer 3: Support
- **Helpers**: Utility functions
- **Types**: Complete type system
- **Styles**: Responsive CSS

---

## 💡 Key Concepts

### Relationship Types
- **DEFINED**: Explicitly set in frontmatter (takes precedence)
- **INFERRED**: Automatically derived from links

### Node Roles
- **PARENT** (North) - Broader categories
- **CHILD** (South) - Subcategories
- **LEFT_FRIEND** (West) - Similar ideas
- **RIGHT_FRIEND** (East) - Opposing ideas
- **PREVIOUS** / **NEXT** - Sequential

### Link Directions
- **TO** (→) - One-way to target
- **FROM** (←) - One-way from source
- **BOTH** (↔) - Bidirectional

---

## 📊 Technical Details

| Aspect | Details |
|--------|---------|
| **Language** | TypeScript 5 with strict mode |
| **Framework** | React 18 |
| **Plugin API** | Obsidian SDK |
| **Build Tool** | Rollup |
| **Bundle Size** | ~150-200 KB (minified) |
| **Performance** | O(n) indexing, O(1) lookups |
| **Browser Support** | Modern browsers (Electron) |

---

## 🔄 Workflow Examples

### Example 1: Create a Learning Hierarchy
```yaml
# biology.md
---
title: Biology
---
```

```yaml
# cells.md
---
title: Cell Biology
parent: "[[biology]]"
---
```

Open any file → KPlex shows the hierarchy visually!

### Example 2: Map Opposing Ideas
```yaml
---
title: Idea A
opposes: "[[Idea B]]"
friends: "[[Similar Idea]]"
---
```

### Example 3: Plan with Virtual Nodes
Just write `[[Planned Research Topic]]` → Ghost node appears → Reminder to create the note

---

## ⚙️ Configuration

### In Obsidian Settings → KPlex:

**Link Inference**
- Inverse: Treat forward links as parent (toggle)
- As Friends: Treat all links as lateral

**Display**
- Show virtual nodes (ghosts for unresolved)
- Show inferred (standard link relationships)
- Show folders, tags, attachments

**Layout**
- Compact view (reduce spacing)
- Max label length (truncation)

**Ontology**
- Customize field names for each type
- Add/remove fields as needed

---

## 🛠️ Development

### Setup
```bash
npm install
npm run dev        # Watch mode
npm run build      # Production
npm run lint       # Check quality
```

### Making Changes
1. Edit TypeScript/React files
2. Rebuild automatically (watch mode)
3. Reload Obsidian plugin
4. Test changes

### Understanding the Code
- Start with `ARCHITECTURE.md`
- Review type definitions in `src/core/types.ts`
- Check `GraphIndex` for vault integration
- Review React component in `kplex-view.tsx`

---

## 📈 Performance

- **Indexing**: O(n) where n = files
- **Node Lookup**: O(1) via HashMap
- **Graph Query**: O(m) where m = degree
- **Rendering**: React memoization optimized
- **Memory**: Efficient relationship storage

Large vaults (1000+ files) handled efficiently.

---

## 🐛 Troubleshooting

### Graph Not Showing
- Ensure file has YAML frontmatter (between ---)
- Check syntax: `parent: "[[filename]]"`
- Run: "Rebuild graph index" command

### Settings Not Applied
- Restart Obsidian
- Check field names match frontmatter
- Clear browser cache

### Performance Issues
- Enable compact view
- Hide virtual nodes
- Hide inferred relationships

See [BUILD.md](BUILD.md) for more troubleshooting.

---

## 📚 Documentation Files

| File | Purpose | Audience |
|------|---------|----------|
| [QUICKSTART.md](QUICKSTART.md) | 5-minute setup | Everyone |
| [README_KPLEX.md](README_KPLEX.md) | User features | Users |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Technical design | Developers |
| [BUILD.md](BUILD.md) | Dev setup & build | Developers |
| [IMPLEMENTATION.md](IMPLEMENTATION.md) | Implementation details | Contributors |
| [MANIFEST.md](MANIFEST.md) | File & structure | Reference |
| [COMPLETE.md](COMPLETE.md) | Completion summary | Overview |

---

## 🎯 Next Steps

### To Use KPlex
→ Follow [QUICKSTART.md](QUICKSTART.md)

### To Understand the Code
→ Read [ARCHITECTURE.md](ARCHITECTURE.md)

### To Develop/Contribute
→ Follow [BUILD.md](BUILD.md)

### For Full Features
→ See [README_KPLEX.md](README_KPLEX.md)

---

## ✅ What's Included

✅ Complete graph engine with Bases API  
✅ React UI with spatial visualization  
✅ Settings system with customization  
✅ URL link extraction and indexing  
✅ Virtual nodes for planning  
✅ Tag hierarchy support  
✅ Type-safe TypeScript implementation  
✅ Responsive, mobile-optimized design  
✅ Dark mode support  
✅ Comprehensive documentation  
✅ Production-ready code  

---

## 📝 License

MIT License - Free to use, modify, and distribute

---

## 🤝 Contributing

Contributions welcome! 
- Found a bug? Open an issue
- Have a feature idea? Create a PR
- Want to improve docs? Contribute!

See [ARCHITECTURE.md](ARCHITECTURE.md) for code guidelines.

---

## 🌟 Inspiration

Built with ideas from:
- **TheBrain** - Spatial mind mapping pioneer
- **ExcaliBrain** - Original visual graph concept
- **Obsidian** - Powerful PKM platform

---

## 📞 Support

- **Documentation**: See files in this directory
- **Code Comments**: Source code is well-commented
- **GitHub Issues**: Report problems or request features
- **Obsidian Forums**: Community discussion

---

## 🎉 Ready to Go!

KPlex is fully implemented and ready for:
- ✅ Testing with your vault
- ✅ Customization and enhancement
- ✅ Community distribution
- ✅ Daily PKM workflow

**Start visualizing your knowledge today!**

---

**Last Updated**: December 24, 2025  
**Status**: Complete and Production-Ready  
**Version**: 0.1.0  

---

[← Back to Documentation Index](#-documentation-index)
