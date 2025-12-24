/**
 * Graph Query Service
 * Provides methods to query and navigate the knowledge graph
 */

import { GraphNode } from "./graph-node";
import { GraphIndex } from "./graph-index";
import type { GraphSnapshot, NodeRole } from "./types";
import { NodeRole as Role } from "./types";

/**
 * Service for querying and navigating the graph
 */
export class GraphQueryService {
  constructor(private index: GraphIndex) {}

  /**
   * Get a snapshot of the graph centered on a specific node
   */
  getGraphSnapshot(
    nodeId: string,
    _depth: number = 2,
    selectedRoles?: NodeRole[]
  ): GraphSnapshot | null {
    const central = this.index.getNode(nodeId);
    if (!central) return null;

    const neighbors = new Map<NodeRole, GraphNode[]>();
    const roles =
      selectedRoles ||
      [
        Role.PARENT,
        Role.CHILD,
        Role.LEFT_FRIEND,
        Role.RIGHT_FRIEND,
        Role.SIBLING,
      ];

    roles.forEach((role) => {
      neighbors.set(role, this.index.getNeighbors(nodeId, role));
    });

    const siblings = this.getSiblings(central);

    return {
      central,
      neighbors,
      siblings,
    };
  }

  /**
   * Get sibling nodes (other children of parents)
   */
  getSiblings(node: GraphNode): GraphNode[] {
    const parents = this.index.getNeighbors(node.id, Role.PARENT);
    const siblings = new Set<GraphNode>();

    parents.forEach((parent) => {
      const parentSiblings = this.index.getNeighbors(parent.id, Role.CHILD);
      parentSiblings.forEach((sibling) => {
        if (sibling.id !== node.id) {
          siblings.add(sibling);
        }
      });
    });

    return Array.from(siblings);
  }

  /**
   * Get a path from one node to another (for breadcrumbs)
   */
  getPath(fromNodeId: string, toNodeId: string): GraphNode[] {
    const visited = new Set<string>();
    const path: GraphNode[] = [];

    const traverse = (nodeId: string): boolean => {
      if (visited.has(nodeId)) return false;
      visited.add(nodeId);

      const node = this.index.getNode(nodeId);
      if (!node) return false;

      path.push(node);

      if (nodeId === toNodeId) return true;

      // Try parents first
      const parents = this.index.getNeighbors(nodeId, Role.PARENT);
      for (const parent of parents) {
        if (traverse(parent.id)) return true;
      }

      // Try children
      const children = this.index.getNeighbors(nodeId, Role.CHILD);
      for (const child of children) {
        if (traverse(child.id)) return true;
      }

      // Try friends
      const leftFriends = this.index.getNeighbors(nodeId, Role.LEFT_FRIEND);
      for (const friend of leftFriends) {
        if (traverse(friend.id)) return true;
      }

      path.pop();
      return false;
    };

    traverse(fromNodeId);
    return path;
  }

  /**
   * Get all nodes of a specific type
   */
  getNodesByType(type: "file" | "folder" | "tag" | "virtual" | "url"): GraphNode[] {
    return this.index
      .getAllNodes()
      .filter((node) => node.type === type);
  }

  /**
   * Search nodes by name
   */
  searchNodes(query: string): GraphNode[] {
    const lowerQuery = query.toLowerCase();
    return this.index
      .getAllNodes()
      .filter((node) => node.name.toLowerCase().includes(lowerQuery))
      .sort((a, b) => {
        // Prioritize exact matches and those starting with query
        const aStartsWith = a.name.toLowerCase().startsWith(lowerQuery);
        const bStartsWith = b.name.toLowerCase().startsWith(lowerQuery);
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        return a.name.localeCompare(b.name);
      });
  }

  /**
   * Get all root nodes (no parents)
   */
  getRootNodes(): GraphNode[] {
    return this.index
      .getAllNodes()
      .filter((node) => this.index.getNeighbors(node.id, Role.PARENT).length === 0);
  }

  /**
   * Get all leaf nodes (no children)
   */
  getLeafNodes(): GraphNode[] {
    return this.index
      .getAllNodes()
      .filter((node) => this.index.getNeighbors(node.id, Role.CHILD).length === 0);
  }

  /**
   * Get connected component (all nodes reachable from given node)
   */
  getConnectedComponent(nodeId: string): GraphNode[] {
    const visited = new Set<string>();
    const component: GraphNode[] = [];
    const queue: string[] = [nodeId];

    while (queue.length > 0) {
      const id = queue.shift()!;
      if (visited.has(id)) continue;

      visited.add(id);
      const node = this.index.getNode(id);
      if (!node) continue;

      component.push(node);

      // Add all neighbors to queue
      node.getVisibleNeighbors().forEach((relation) => {
        if (!visited.has(relation.targetId)) {
          queue.push(relation.targetId);
        }
      });
    }

    return component;
  }

  /**
   * Get nodes at a specific distance from a source
   */
  getNodesAtDistance(
    nodeId: string,
    distance: number,
    role?: NodeRole
  ): GraphNode[] {
    if (distance === 0) {
      const node = this.index.getNode(nodeId);
      return node ? [node] : [];
    }

    const visited = new Set<string>();
    const current = [nodeId];

    for (let i = 0; i < distance; i++) {
      const next: string[] = [];

      current.forEach((id) => {
        if (visited.has(id)) return;
        visited.add(id);

        const neighbors = role
          ? this.index.getNeighbors(id, role)
          : this.index.getAllNodes().filter((n) => {
              const relations = n.getVisibleNeighbors();
              return relations.some((r) => r.targetId === id);
            });

        neighbors.forEach((neighbor) => {
          if (!visited.has(neighbor.id)) {
            next.push(neighbor.id);
          }
        });
      });

      current.splice(0, current.length, ...next);
    }

    return current
      .map((id) => this.index.getNode(id))
      .filter((n) => n !== undefined) as GraphNode[];
  }
}
