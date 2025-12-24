/**
 * Graph Node Implementation
 * Core data structure for knowledge graph nodes
 */

import type { TFile } from "obsidian";
import {
  INode,
  NodeRelation,
  NodeRole,
  LinkDirection,
  RelationType,
  NodeStyle,
} from "./types";

/**
 * Graph Node - represents a single entity in the knowledge graph
 */
export class GraphNode implements INode {
  id: string;
  path: string;
  name: string;
  type: "file" | "folder" | "tag" | "virtual" | "url" | "attachment";
  file?: TFile;
  mtime?: number;
  isVirtual: boolean;
  url?: string;
  relations: NodeRelation[] = [];
  metadata?: Record<string, unknown>;
  primaryTag?: string;
  tags?: string[];
  style?: NodeStyle;

  constructor(config: {
    id: string;
    path: string;
    name: string;
    type: "file" | "folder" | "tag" | "virtual" | "url" | "attachment";
    file?: TFile;
    mtime?: number;
    isVirtual?: boolean;
    url?: string;
    metadata?: Record<string, unknown>;
  }) {
    this.id = config.id;
    this.path = config.path;
    this.name = config.name;
    this.type = config.type;
    this.file = config.file;
    this.mtime = config.mtime;
    this.isVirtual = config.isVirtual ?? false;
    this.url = config.url;
    this.metadata = config.metadata;
    this.relations = [];
  }

  /**
   * Add or update a relationship to another node
   */
  addRelation(
    targetId: string,
    role: NodeRole,
    direction: LinkDirection,
    type: RelationType,
    definition?: string
  ): void {
    // Find existing relation
    const existing = this.relations.find(
      (r) => r.targetId === targetId && r.role === role
    );

    if (existing) {
      // Update direction and type (keeping precedence)
      existing.direction = this.mergeDirection(existing.direction, direction);
      existing.type = this.mergeType(existing.type, type);
      if (definition) existing.definition = definition;
    } else {
      this.relations.push({
        targetId,
        role,
        direction,
        type,
        definition,
        isHidden: false,
      });
    }
  }

  /**
   * Merge two link directions
   */
  private mergeDirection(
    current: LinkDirection,
    new_: LinkDirection
  ): LinkDirection {
    if (
      current === LinkDirection.BOTH ||
      current === new_ ||
      (current === LinkDirection.TO && new_ === LinkDirection.FROM) ||
      (current === LinkDirection.FROM && new_ === LinkDirection.TO)
    ) {
      return LinkDirection.BOTH;
    }
    return current || new_;
  }

  /**
   * Merge two relation types (DEFINED takes precedence)
   */
  private mergeType(
    current: RelationType,
    new_: RelationType
  ): RelationType {
    return current === RelationType.DEFINED ? RelationType.DEFINED : new_;
  }

  /**
   * Get all neighbors of a specific role
   */
  getNeighborsByRole(role: NodeRole): string[] {
    return this.relations
      .filter((r) => r.role === role && !r.isHidden)
      .map((r) => r.targetId);
  }

  /**
   * Remove a relationship
   */
  removeRelation(targetId: string, role?: NodeRole): void {
    this.relations = this.relations.filter(
      (r) => !(r.targetId === targetId && (!role || r.role === role))
    );
  }

  /**
   * Check if this node has any relationships
   */
  hasRelations(): boolean {
    return this.relations.length > 0;
  }

  /**
   * Get all visible neighbors (for rendering)
   */
  getVisibleNeighbors(): NodeRelation[] {
    return this.relations.filter((r) => !r.isHidden);
  }

  /**
   * Apply styling to this node
   */
  setStyle(style: NodeStyle): void {
    this.style = { ...this.style, ...style };
  }

  /**
   * Check if node is a leaf (no children)
   */
  isLeaf(): boolean {
    return this.getNeighborsByRole(NodeRole.CHILD).length === 0;
  }

  /**
   * Check if node is a root (no parents)
   */
  isRoot(): boolean {
    return this.getNeighborsByRole(NodeRole.PARENT).length === 0;
  }
}
