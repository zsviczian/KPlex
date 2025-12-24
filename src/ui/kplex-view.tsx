/**
 * KPlex React Components
 * Visualization layer for the knowledge graph
 */

import React from "react";
import type { GraphNode } from "../core/graph-node";
import type { NodeRole, GraphSnapshot } from "../core/types";
import { NodeRole as Role } from "../core/types";
import {
  getNodeClasses,
  getNodeIcon,
  truncateName,
  getRoleLabel,
  getRoleAreaClass,
} from "../utils/helpers";

interface KPlexNodeProps {
  node: GraphNode;
  isCentral?: boolean;
  isInferred?: boolean;
  onClick?: () => void;
  onCtrlClick?: () => void;
  maxLabelLength?: number;
}

/**
 * Individual node display component
 */
const KPlexNode: React.FC<KPlexNodeProps> = ({
  node,
  isCentral = false,
  isInferred = false,
  onClick,
  onCtrlClick,
  maxLabelLength = 30,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      onCtrlClick?.();
    } else {
      onClick?.();
    }
  };

  const classes = getNodeClasses(node, isCentral, isInferred).join(" ");
  const prefix = getNodeIcon(node);
  const displayName = truncateName(node.name, maxLabelLength);

  return (
    <div className={classes} onClick={handleClick} title={node.path}>
      <div className="kplex-node__icon">{prefix}</div>
      <div className="kplex-node__name">
        {displayName}
      </div>
    </div>
  );
};

interface NeighborhoodProps {
  role: NodeRole;
  nodes: GraphNode[];
  onNodeClick: (nodeId: string) => void;
  settings: any;
}

/**
 * Display a neighborhood of nodes (parents, children, friends)
 */
const Neighborhood: React.FC<NeighborhoodProps> = ({
  role,
  nodes,
  onNodeClick,
  settings,
}) => {
  if (nodes.length === 0) return null;

  return (
    <div className={`kplex-neighborhood ${getRoleAreaClass(role)}`}>
      <div className="kplex-neighborhood__label">{getRoleLabel(role)}</div>
      <div className="kplex-neighborhood__nodes">
        {nodes.map((node) => (
          <KPlexNode
            key={node.id}
            node={node}
            isInferred={node.relations.some((r) => r.role === role && r.type === 2)}
            onClick={() => onNodeClick(node.id)}
            maxLabelLength={settings.maxLabelLength}
          />
        ))}
      </div>
    </div>
  );
};

interface KPlexViewProps {
  snapshot: GraphSnapshot | null;
  settings: any;
  onNodeClick: (nodeId: string) => void;
  isLoading?: boolean;
}

/**
 * Main KPlex view component - displays spatial graph
 */
export const KPlexView: React.FC<KPlexViewProps> = ({
  snapshot,
  settings,
  onNodeClick,
  isLoading = false,
}) => {
  if (isLoading) {
    return <div className="kplex-view kplex-view--loading">Loading graph...</div>;
  }

  if (!snapshot) {
    return <div className="kplex-view kplex-view--empty">Select a note to view its graph</div>;
  }

  const { central, neighbors } = snapshot;

  return (
    <div className="kplex-view">
      {/* North: Parents */}
      <div className="kplex-north">
        <Neighborhood
          role={Role.PARENT}
          nodes={(neighbors.get(Role.PARENT) || []) as any}
          onNodeClick={onNodeClick}
          settings={settings}
        />
      </div>

      {/* Main row: West Friends - Central - East Friends */}
      <div className="kplex-main-row">
        {/* West */}
        <div className="kplex-west">
          <Neighborhood
            role={Role.LEFT_FRIEND}
            nodes={(neighbors.get(Role.LEFT_FRIEND) || []) as any}
            onNodeClick={onNodeClick}
            settings={settings}
          />
          <Neighborhood
            role={Role.PREVIOUS}
            nodes={(neighbors.get(Role.PREVIOUS) || []) as any}
            onNodeClick={onNodeClick}
            settings={settings}
          />
        </div>

        {/* Central */}
        <div className="kplex-central">
          <KPlexNode 
            node={central as any}
            isCentral 
            onClick={() => {}}
            maxLabelLength={settings.maxLabelLength}
          />
        </div>

        {/* East */}
        <div className="kplex-east">
          <Neighborhood
            role={Role.RIGHT_FRIEND}
            nodes={(neighbors.get(Role.RIGHT_FRIEND) || []) as any}
            onNodeClick={onNodeClick}
            settings={settings}
          />
          <Neighborhood
            role={Role.NEXT}
            nodes={(neighbors.get(Role.NEXT) || []) as any}
            onNodeClick={onNodeClick}
            settings={settings}
          />
        </div>
      </div>

      {/* South: Children */}
      <div className="kplex-south">
        <Neighborhood
          role={Role.CHILD}
          nodes={(neighbors.get(Role.CHILD) || []) as any}
          onNodeClick={onNodeClick}
          settings={settings}
        />
      </div>
    </div>
  );
};

export default KPlexView;
