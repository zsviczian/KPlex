/**
 * KPlexView - Obsidian Integration
 * Integrates React component with Obsidian's plugin API
 */

import { ItemView, WorkspaceLeaf, TFile, App, Events } from "obsidian";
import React from "react";
import ReactDOM from "react-dom";
import { GraphIndex } from "../core/graph-index";
import { GraphQueryService } from "../core/graph-query-service";
import { KPlexView } from "./kplex-view";
import type { KPlexSettings } from "../core/types";

export const VIEW_TYPE = "kplex-view";

/**
 * Obsidian view for KPlex
 */
export class KPlexViewContainer extends ItemView {
  private graphIndex: GraphIndex;
  private queryService: GraphQueryService;
  private settings: KPlexSettings;
  private currentFile: TFile | null = null;
  private events: Events;
  private isLoading: boolean = false;

  constructor(
    leaf: WorkspaceLeaf,
    _app: App,
    graphIndex: GraphIndex,
    settings: KPlexSettings
  ) {
    super(leaf);
    this.graphIndex = graphIndex;
    this.queryService = new GraphQueryService(graphIndex);
    this.settings = settings;
    this.events = new Events();
  }

  getViewType(): string {
    return VIEW_TYPE;
  }

  getDisplayText(): string {
    return "KPlex";
  }

  getIcon(): string {
    return "network";
  }

  async onOpen(): Promise<void> {
    // Wait for index to be ready
    if (!this.graphIndex.isReady()) {
      this.isLoading = true;
      this.render();
      await this.graphIndex.initialize();
      this.isLoading = false;
    }

    // Listen for active file changes
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", () => {
        this.onActiveFileChange();
      })
    );

    // Listen for file changes
    this.registerEvent(
      this.app.vault.on("modify", (file: TFile) => {
        if (file === this.currentFile) {
          this.render();
        }
      })
    );

    // Initial render
    this.onActiveFileChange();
  }

  async onClose(): Promise<void> {
    // Cleanup
  }

  /**
   * Handle active file change
   */
  private onActiveFileChange(): void {
    const activeFile = this.app.workspace.getActiveFile();

    if (activeFile && activeFile !== this.currentFile) {
      this.currentFile = activeFile;
      this.render();
    }
  }

  /**
   * Render the view
   */
  private render(): void {
    const snapshot = this.currentFile
      ? this.queryService.getGraphSnapshot(`file:${this.currentFile.path}`)
      : null;

    const root = this.containerEl.children[1];
    root.empty();

    const container = root.createDiv("kplex-container");

    ReactDOM.render(
      React.createElement(KPlexView, {
        snapshot,
        settings: this.settings,
        onNodeClick: (nodeId: string) => this.handleNodeClick(nodeId),
        isLoading: this.isLoading,
      }),
      container
    );
  }

  /**
   * Handle node click
   */
  private handleNodeClick(nodeId: string): void {
    const node = this.graphIndex.getNode(nodeId);
    if (!node || node.type !== "file") return;

    // Extract path from ID (remove "file:" prefix)
    const path = node.path;
    const file = this.app.vault.getAbstractFileByPath(path);

    if (file instanceof TFile) {
      this.app.workspace.openLinkText(path, "", false);
      this.currentFile = file;
      this.render();
    }
  }

  /**
   * Update settings
   */
  updateSettings(settings: KPlexSettings): void {
    this.settings = settings;
    this.render();
  }

  /**
   * Rebuild the graph
   */
  async rebuildGraph(): Promise<void> {
    this.isLoading = true;
    this.render();
    await this.graphIndex.rebuild();
    this.isLoading = false;
    this.render();
  }
}
