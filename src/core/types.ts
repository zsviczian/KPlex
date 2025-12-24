/**
 * KPlex Core Types
 * Defines fundamental data structures for Knowledge Plex
 */

import type { TFile } from "obsidian";

/**
 * Relationship type - how nodes are connected
 */
export enum RelationType {
  /** Explicitly defined via Dataview fields */
  DEFINED = 1,
  /** Inferred from standard Obsidian links */
  INFERRED = 2,
}

/**
 * Directional relationship indicator
 */
export enum LinkDirection {
  /** One-way link: source → target */
  TO = 1,
  /** One-way link: source ← target */
  FROM = 2,
  /** Bidirectional link: source ↔ target */
  BOTH = 3,
}

/**
 * Role of a node in the spatial hierarchy
 */
export enum NodeRole {
  /** Parent/broader category (North) */
  PARENT = "parent",
  /** Child/subcategory (South) */
  CHILD = "child",
  /** Lateral connection (West/Left) */
  LEFT_FRIEND = "leftFriend",
  /** Lateral connection (East/Right) */
  RIGHT_FRIEND = "rightFriend",
  /** Previous in sequence (West) */
  PREVIOUS = "previous",
  /** Next in sequence (East) */
  NEXT = "next",
  /** Sibling node */
  SIBLING = "sibling",
}

/**
 * Represents a directed relationship between two nodes
 */
export interface NodeRelation {
  targetId: string;
  role: NodeRole;
  direction: LinkDirection;
  type: RelationType;
  definition?: string; // Field name if DEFINED
  isHidden: boolean;
}

/**
 * Metadata style for a node
 */
export interface NodeStyle {
  color?: string;
  icon?: string;
  prefix?: string;
  fontSize?: number;
  isHidden?: boolean;
}

/**
 * Represents a single node in the knowledge graph
 */
export interface INode {
  id: string; // unique identifier
  path: string; // file path or special path
  name: string; // display name
  type: "file" | "folder" | "tag" | "virtual" | "url" | "attachment";
  file?: TFile;
  mtime?: number;
  isVirtual: boolean; // unresolved link
  url?: string; // for URL nodes
  relations: NodeRelation[];
  metadata?: Record<string, unknown>;
  primaryTag?: string;
  tags?: string[];
  style?: NodeStyle;
}

/**
 * Central focus state for rendering
 */
export interface FocusState {
  centralNodeId: string | null;
  depth: number; // how many levels to show
  selectedRoles: NodeRole[]; // filter which roles to display
}

/**
 * Ontology configuration for field parsing
 */
export interface Ontology {
  parents: string[];
  children: string[];
  leftFriends: string[];
  rightFriends: string[];
  previous: string[];
  next: string[];
  hidden: string[];
}

/**
 * Settings for KPlex
 */
export interface KPlexSettings {
  // Relationship inference
  inverseInfer: boolean; // forward link = parent (true) or child (false)
  inferAllLinksAsFriends: boolean; // treat all inferred links as friends

  // Display options
  showVirtualNodes: boolean;
  showInferredNodes: boolean;
  showFolders: boolean;
  showTags: boolean;
  showAttachments: boolean;

  // Layout options
  compactView: boolean;
  maxLabelLength: number;

  // Styling
  nodeStyles: { [key: string]: NodeStyle };
  ontology: Ontology;

  // Behavior
  autoSyncWithEditor: boolean;
  pinToPane: boolean;
}

/**
 * Default settings
 */
export const DEFAULT_SETTINGS: KPlexSettings = {
  inverseInfer: false,
  inferAllLinksAsFriends: false,
  showVirtualNodes: true,
  showInferredNodes: true,
  showFolders: true,
  showTags: true,
  showAttachments: true,
  compactView: false,
  maxLabelLength: 30,
  nodeStyles: {},
  autoSyncWithEditor: true,
  pinToPane: false,
  ontology: {
    parents: [
      "parent",
      "parents",
      "up",
      "u",
      "north",
      "origin",
      "inception",
    ],
    children: [
      "children",
      "child",
      "down",
      "d",
      "south",
      "leads to",
      "contributes to",
    ],
    leftFriends: [
      "friends",
      "friend",
      "similar",
      "supports",
      "alternatives",
      "advantages",
    ],
    rightFriends: ["opposes", "disadvantages", "missing", "cons"],
    previous: ["previous", "prev", "west", "w", "before"],
    next: ["next", "n", "east", "e", "after"],
    hidden: ["hidden"],
  },
};

/**
 * Graph query results for visualization
 */
export interface GraphSnapshot {
  central: INode;
  neighbors: Map<NodeRole, INode[]>;
  siblings: INode[];
}
