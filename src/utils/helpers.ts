/**
 * KPlex Utility Functions
 * Helper functions for node filtering, styling, and graph operations
 */

import type { GraphNode } from "../core/graph-node";
import type { KPlexSettings } from "../core/types";
import { NodeRole, RelationType } from "../core/types";

/**
 * Filter nodes based on settings
 */
export function filterNodes(
  nodes: GraphNode[],
  settings: KPlexSettings
): GraphNode[] {
  return nodes.filter((node) => {
    // Filter by type
    if (node.type === "folder" && !settings.showFolders) return false;
    if (node.type === "tag" && !settings.showTags) return false;
    if (node.type === "virtual" && !settings.showVirtualNodes) return false;
    if (node.type === "attachment" && !settings.showAttachments) return false;

    return true;
  });
}

/**
 * Filter relationships based on settings
 */
export function filterRelations(
  node: GraphNode,
  settings: KPlexSettings
): GraphNode["relations"] {
  return node.relations.filter((relation) => {
    // Hide inferred if setting is off
    if (
      relation.type === RelationType.INFERRED &&
      !settings.showInferredNodes
    ) {
      return false;
    }

    return !relation.isHidden;
  });
}

/**
 * Get CSS classes for a node based on its properties
 */
export function getNodeClasses(
  node: GraphNode,
  isCentral: boolean = false,
  isInferred: boolean = false
): string[] {
  const classes = ["kplex-node"];

  if (isCentral) classes.push("kplex-node--central");
  if (isInferred) classes.push("kplex-node--inferred");
  if (node.isVirtual) classes.push("kplex-node--virtual");

  classes.push(`kplex-node--${node.type}`);

  return classes;
}

/**
 * Get icon for a node type
 */
export function getNodeIcon(node: GraphNode): string {
  switch (node.type) {
    case "folder":
      return "📁";
    case "tag":
      return "#";
    case "url":
      return "🌐";
    case "virtual":
      return "🔗";
    case "attachment":
      return "📎";
    default:
      return "📄";
  }
}

/**
 * Truncate node name to max length
 */
export function truncateName(name: string, maxLength: number): string {
  if (name.length > maxLength) {
    return `${name.substring(0, maxLength - 3)}...`;
  }
  return name;
}

/**
 * Get display name for a role
 */
export function getRoleLabel(role: NodeRole): string {
  switch (role) {
    case NodeRole.PARENT:
      return "Parents";
    case NodeRole.CHILD:
      return "Children";
    case NodeRole.LEFT_FRIEND:
      return "Friends";
    case NodeRole.RIGHT_FRIEND:
      return "Opposing";
    case NodeRole.PREVIOUS:
      return "Previous";
    case NodeRole.NEXT:
      return "Next";
    case NodeRole.SIBLING:
      return "Siblings";
    default:
      return role;
  }
}

/**
 * Get CSS class for a role area
 */
export function getRoleAreaClass(role: NodeRole): string {
  switch (role) {
    case NodeRole.PARENT:
      return "kplex-neighborhood--north";
    case NodeRole.CHILD:
      return "kplex-neighborhood--south";
    case NodeRole.LEFT_FRIEND:
      return "kplex-neighborhood--west";
    case NodeRole.RIGHT_FRIEND:
      return "kplex-neighborhood--east";
    case NodeRole.PREVIOUS:
      return "kplex-neighborhood--prev";
    case NodeRole.NEXT:
      return "kplex-neighborhood--next";
    default:
      return "";
  }
}

/**
 * Check if a node is hidden based on settings
 */
export function isNodeHidden(node: GraphNode, settings: KPlexSettings): boolean {
  if (node.type === "folder" && !settings.showFolders) return true;
  if (node.type === "tag" && !settings.showTags) return true;
  if (node.type === "virtual" && !settings.showVirtualNodes) return true;
  if (node.type === "attachment" && !settings.showAttachments) return true;

  return false;
}

/**
 * Get a URL-safe ID for a node (for React keys)
 */
export function getNodeKey(nodeId: string): string {
  return nodeId.replace(/[^\w-]/g, "-");
}

/**
 * Parse field name from ontology config
 */
export function parseOntologyField(fieldName: string): string {
  return fieldName.toLowerCase().replace(/\s+/g, "-");
}

/**
 * Format path for display
 */
export function formatPath(path: string): string {
  return path
    .split("/")
    .pop()
    ?.replace(/\.md$/, "") ||
    path;
}

/**
 * Get breadcrumb path for navigation
 */
export function getBreadcrumbPath(path: string): string[] {
  return path
    .split("/")
    .slice(0, -1)
    .map((p) => p);
}

/**
 * Check if a node should be displayed as inferred
 */
export function isInferredRelation(node: GraphNode, targetId: string): boolean {
  const relation = node.relations.find((r) => r.targetId === targetId);
  return relation ? relation.type === RelationType.INFERRED : false;
}
