/**
 * Graph Index
 * Central index managing all nodes in the knowledge graph
 * Uses Obsidian's Bases API instead of Dataview
 */

import { App, TFile, TFolder, TAbstractFile } from "obsidian";
import { GraphNode } from "./graph-node";
import type { INode, NodeRole } from "./types";
import {
  NodeRole as Role,
  RelationType,
  LinkDirection,
  Ontology,
} from "./types";

/**
 * Graph Index - maintains complete node graph
 */
export class GraphIndex {
  private nodes: Map<string, GraphNode> = new Map();
  private pathToNodeId: Map<string, string> = new Map();
  private lowercasePathMap: Map<string, string> = new Map(); // case sensitivity workaround
  private app: App;
  private ontology: Ontology;
  private ready: boolean = false;

  constructor(app: App, ontology: Ontology) {
    this.app = app;
    this.ontology = ontology;
  }

  /**
   * Initialize the index from the vault
   */
  async initialize(): Promise<void> {
    this.nodes.clear();
    this.pathToNodeId.clear();
    this.lowercasePathMap.clear();

    // Index files and folders
    await this.indexVault();

    // Index tags from metadata
    this.indexTags();

    // Build relationships
    await this.buildRelationships();

    this.ready = true;
  }

  /**
   * Index all files and folders in vault
   */
  private async indexVault(): Promise<void> {
    const root = this.app.vault.getRoot();
    if (root && root.children) {
      root.children.forEach((item: TAbstractFile) => {
        this.indexItem(item);
      });
    }
  }

  /**
   * Recursively index vault items
   */
  private indexItem(item: TAbstractFile, _parentPath?: string): void {
    if (item instanceof TFolder) {
      const folderPath = item.path;
      const nodeId = `folder:${folderPath}`;

      const node = new GraphNode({
        id: nodeId,
        path: folderPath,
        name: item.name,
        type: "folder",
        isVirtual: false,
      });

      this.addNode(node);

      // Recursively index children
      item.children?.forEach((child) => this.indexItem(child, folderPath));
    } else if (item instanceof TFile) {
      const filePath = item.path;
      const nodeId = `file:${filePath}`;

      // Extract metadata if available
      const metadata = this.app.metadataCache.getFileCache(item);

      const node = new GraphNode({
        id: nodeId,
        path: filePath,
        name: item.basename,
        type: item.extension === "md" ? "file" : "attachment",
        file: item,
        mtime: item.stat.mtime,
        metadata: {
          extension: item.extension,
          size: item.stat.size,
          ...metadata?.frontmatter,
        },
      });

      // Extract tags
      if (metadata?.tags) {
        node.tags = metadata.tags.map((t) => t.tag);
      }

      this.addNode(node);

      // Index lowercase path for case-insensitive lookups
      this.lowercasePathMap.set(filePath.toLowerCase(), filePath);
    }
  }

  /**
   * Index all tags in the vault
   */
  private indexTags(): void {
    const tags = new Set<string>();
    
    // Collect all tags from file metadata
    this.app.vault.getMarkdownFiles().forEach((file) => {
      const metadata = this.app.metadataCache.getFileCache(file);
      if (metadata?.tags) {
        metadata.tags.forEach((tag) => {
          if (tag.tag) {
            tags.add(tag.tag.substring(1)); // remove # prefix
          }
        });
      }
    });

    // Create tag nodes
    tags.forEach((tagPath) => {
      const nodeId = `tag:${tagPath}`;
      const node = new GraphNode({
        id: nodeId,
        path: tagPath,
        name: tagPath.replace(/#/g, ""),
        type: "tag",
        isVirtual: false,
      });
      this.addNode(node);
    });
  }

  /**
   * Build all relationships in the graph
   */
  private async buildRelationships(): Promise<void> {
    // Add resolved links (forward links)
    this.indexResolvedLinks();

    // Add unresolved links (ghost nodes)
    this.indexUnresolvedLinks();

    // Add tag relationships
    this.indexTagRelationships();

    // Add explicit relationships from metadata (via Obsidian properties/frontmatter)
    await this.indexExplicitRelationships();
  }

  /**
   * Index resolved links between files
   */
  private indexResolvedLinks(): void {
    const resolvedLinks = this.app.metadataCache.resolvedLinks;

    Object.keys(resolvedLinks).forEach((sourcePath) => {
      const sourceNode = this.getNodeByPath(sourcePath);
      if (!sourceNode) return;

      Object.keys(resolvedLinks[sourcePath]).forEach((targetPath) => {
        let targetNode = this.getNodeByPath(targetPath);

        // Handle case sensitivity
        if (!targetNode) {
          const properPath = this.lowercasePathMap.get(targetPath.toLowerCase());
          if (properPath) {
            targetNode = this.getNodeByPath(properPath);
          }
        }

        if (!targetNode) return;

        // Add inferred parent-child relationship
        this.addInferredRelationship(sourceNode, targetNode);
      });
    });
  }

  /**
   * Index unresolved links (ghost nodes)
   */
  private indexUnresolvedLinks(): void {
    const unresolvedLinks = this.app.metadataCache.unresolvedLinks;

    Object.keys(unresolvedLinks).forEach((sourcePath) => {
      const sourceNode = this.getNodeByPath(sourcePath);
      if (!sourceNode) return;

      Object.keys(unresolvedLinks[sourcePath]).forEach((unresolvedPath) => {
        let targetNode = this.getNodeByPath(unresolvedPath);

        // Create virtual node if it doesn't exist
        if (!targetNode) {
          const nodeId = `virtual:${unresolvedPath}`;
          targetNode = new GraphNode({
            id: nodeId,
            path: unresolvedPath,
            name: unresolvedPath.split("/").pop() || unresolvedPath,
            type: "virtual",
            isVirtual: true,
          });
          this.addNode(targetNode);
        }

        // Add inferred relationship
        this.addInferredRelationship(sourceNode, targetNode);
      });
    });
  }

  /**
   * Index tag hierarchy relationships
   */
  private indexTagRelationships(): void {
    // Collect all tags from file metadata
    const tags = new Set<string>();
    this.app.vault.getMarkdownFiles().forEach((file) => {
      const metadata = this.app.metadataCache.getFileCache(file);
      if (metadata?.tags) {
        metadata.tags.forEach((tag) => {
          if (tag.tag) {
            tags.add(tag.tag.substring(1)); // remove # prefix
          }
        });
      }
    });

    if (tags.size === 0) return;

    tags.forEach((tagPath) => {
      const tagNode = this.getNodeByPath(tagPath);
      if (!tagNode) return;

      // Create parent tag relationships
      const parts = tagPath.split("/");
      for (let i = 1; i < parts.length; i++) {
        const parentTag = parts.slice(0, i).join("/");
        const parentNode = this.getNodeByPath(parentTag);

        if (parentNode && tagNode) {
          tagNode.addRelation(
            parentNode.id,
            Role.PARENT,
            LinkDirection.TO,
            RelationType.DEFINED,
            "tag-hierarchy"
          );
        }
      }
    });
  }

  /**
   * Index explicit relationships from file metadata
   */
  private async indexExplicitRelationships(): Promise<void> {
    this.nodes.forEach((node) => {
      if (node.type !== "file" || !node.file) return;

      const metadata = this.app.metadataCache.getFileCache(node.file);
      if (!metadata?.frontmatter) return;

      const fm = metadata.frontmatter;

      // Process each ontology field type
      this.processOntologyField(
        node,
        fm,
        this.ontology.parents,
        Role.PARENT,
        RelationType.DEFINED
      );
      this.processOntologyField(
        node,
        fm,
        this.ontology.children,
        Role.CHILD,
        RelationType.DEFINED
      );
      this.processOntologyField(
        node,
        fm,
        this.ontology.leftFriends,
        Role.LEFT_FRIEND,
        RelationType.DEFINED
      );
      this.processOntologyField(
        node,
        fm,
        this.ontology.rightFriends,
        Role.RIGHT_FRIEND,
        RelationType.DEFINED
      );
      this.processOntologyField(
        node,
        fm,
        this.ontology.previous,
        Role.PREVIOUS,
        RelationType.DEFINED
      );
      this.processOntologyField(
        node,
        fm,
        this.ontology.next,
        Role.NEXT,
        RelationType.DEFINED
      );
    });
  }

  /**
   * Process ontology field and create relationships
   */
  private processOntologyField(
    node: GraphNode,
    frontmatter: Record<string, any>,
    fieldNames: string[],
    role: NodeRole,
    type: RelationType
  ): void {
    fieldNames.forEach((fieldName) => {
      const normalizedField = fieldName.toLowerCase().replace(/\s+/g, "-");

      // Find matching key in frontmatter (case-insensitive)
      const key = Object.keys(frontmatter).find(
        (k) => k.toLowerCase().replace(/\s+/g, "-") === normalizedField
      );

      if (!key) return;

      const value = frontmatter[key];
      const links = this.extractLinksFromValue(value);

      links.forEach((link) => {
        let targetNode = this.getNodeByPath(link);

        // Try case-insensitive lookup
        if (!targetNode) {
          const properPath = this.lowercasePathMap.get(link.toLowerCase());
          if (properPath) {
            targetNode = this.getNodeByPath(properPath);
          }
        }

        // Create virtual node if needed
        if (!targetNode) {
          const nodeId = `virtual:${link}`;
          targetNode = new GraphNode({
            id: nodeId,
            path: link,
            name: link.split("/").pop() || link,
            type: "virtual",
            isVirtual: true,
          });
          this.addNode(targetNode);
        }

        if (targetNode) {
          node.addRelation(
            targetNode.id,
            role,
            LinkDirection.TO,
            type,
            fieldName
          );
        }
      });
    });
  }

  /**
   * Extract links from frontmatter value
   * Handles: [[links]], arrays, strings with links, etc.
   */
  private extractLinksFromValue(value: any): string[] {
    const links: string[] = [];

    if (!value) return links;

    if (typeof value === "string") {
      // Extract [[wiki links]] and plain references
      const linkRegex = /\[\[([^\]]+)\]\]/g;
      let match;
      while ((match = linkRegex.exec(value)) !== null) {
        links.push(match[1]);
      }
      // Also accept plain file references if they exist
      if (value.includes(".md")) {
        const fileMatch = /(\S+\.md)/g;
        while ((match = fileMatch.exec(value)) !== null) {
          links.push(match[1]);
        }
      }
    } else if (Array.isArray(value)) {
      value.forEach((item) => {
        if (typeof item === "string") {
          links.push(...this.extractLinksFromValue(item));
        }
      });
    } else if (typeof value === "object" && value.path) {
      // Handle link objects
      links.push(value.path);
    }

    return links;
  }

  /**
   * Add inferred relationship
   */
  private addInferredRelationship(
    source: GraphNode,
    target: GraphNode
  ): void {
    // Treat as parent-child by default
    source.addRelation(
      target.id,
      Role.CHILD,
      LinkDirection.TO,
      RelationType.INFERRED,
      "link"
    );
    target.addRelation(
      source.id,
      Role.PARENT,
      LinkDirection.FROM,
      RelationType.INFERRED,
      "link"
    );
  }

  /**
   * Add a node to the index
   */
  addNode(node: GraphNode): void {
    this.nodes.set(node.id, node);
    this.pathToNodeId.set(node.path, node.id);
  }

  /**
   * Get node by ID
   */
  getNode(id: string): GraphNode | undefined {
    return this.nodes.get(id);
  }

  /**
   * Get node by path
   */
  getNodeByPath(path: string): GraphNode | undefined {
    const id = this.pathToNodeId.get(path);
    return id ? this.nodes.get(id) : undefined;
  }

  /**
   * Get all nodes
   */
  getAllNodes(): GraphNode[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Is the index ready?
   */
  isReady(): boolean {
    return this.ready;
  }

  /**
   * Rebuild the entire index
   */
  async rebuild(): Promise<void> {
    await this.initialize();
  }

  /**
   * Update a single node
   */
  updateNode(nodeId: string, updates: Partial<INode>): void {
    const node = this.nodes.get(nodeId);
    if (!node) return;

    if (updates.name) node.name = updates.name;
    if (updates.metadata) node.metadata = updates.metadata;
    if (updates.style) node.setStyle(updates.style);
  }

  /**
   * Remove a node and its relationships
   */
  removeNode(nodeId: string): void {
    const node = this.nodes.get(nodeId);
    if (!node) return;

    // Remove from path map
    this.pathToNodeId.delete(node.path);

    // Remove relationships from all other nodes
    this.nodes.forEach((n) => {
      n.removeRelation(nodeId);
    });

    this.nodes.delete(nodeId);
  }

  /**
   * Get neighbors of a node by role
   */
  getNeighbors(
    nodeId: string,
    role?: NodeRole
  ): GraphNode[] {
    const node = this.nodes.get(nodeId);
    if (!node) return [];

    const relations = role
      ? node.getNeighborsByRole(role)
      : node.getVisibleNeighbors().map((r) => r.targetId);

    return relations
      .map((id) => this.nodes.get(id))
      .filter((n) => n !== undefined) as GraphNode[];
  }
}
