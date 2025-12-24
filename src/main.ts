/**
 * KPlex Plugin - Main Entry Point
 * Knowledge Plex - Visual personal knowledge management using Obsidian Bases API
 */

import { Plugin, WorkspaceLeaf } from "obsidian";
import { GraphIndex } from "./core/graph-index";
import { KPlexViewContainer, VIEW_TYPE } from "./ui/kplex-view-container";
import { KPlexSettingTab } from "./ui/settings-tab";
import { DEFAULT_SETTINGS } from "./core/types";
import type { KPlexSettings } from "./core/types";

export default class KPlexPlugin extends Plugin {
  settings: KPlexSettings;
  graphIndex: GraphIndex | null = null;
  viewContainer: KPlexViewContainer | null = null;

  async onload() {
    console.log("Loading KPlex plugin...");

    // Load settings
    await this.loadSettings();

    // Register the view
    this.registerView(VIEW_TYPE, (leaf: WorkspaceLeaf) => {
      const view = new KPlexViewContainer(
        leaf,
        this.app,
        this.graphIndex!,
        this.settings
      );
      this.viewContainer = view;
      return view;
    });

    // Initialize graph index
    this.graphIndex = new GraphIndex(this.app, this.settings.ontology);

    // Add settings tab
    this.addSettingTab(new KPlexSettingTab(this.app, this));

    // Add command to toggle view
    this.addCommand({
      id: "kplex-toggle-view",
      name: "Toggle KPlex view",
      callback: () => this.toggleView(),
    });

    // Add command to rebuild graph
    this.addCommand({
      id: "kplex-rebuild-graph",
      name: "Rebuild graph index",
      callback: async () => {
        console.log("Rebuilding KPlex graph...");
        if (this.viewContainer) {
          await this.viewContainer.rebuildGraph();
        }
      },
    });

    // Create view on startup
    this.app.workspace.onLayoutReady(() => {
      this.initializeView();
    });

    console.log("KPlex plugin loaded successfully");
  }

  async onunload() {
    console.log("Unloading KPlex plugin");
  }

  /**
   * Initialize the view
   */
  private async initializeView() {
    // Check if view already exists
    const existing = this.app.workspace.getLeavesOfType(VIEW_TYPE);
    if (existing.length > 0) {
      return;
    }

    // Create new view in right sidebar
    const rightLeaf = this.app.workspace.getRightLeaf(false);
    if (rightLeaf) {
      await rightLeaf.setViewState({
        type: VIEW_TYPE,
      });
    }
  }

  /**
   * Toggle the view
   */
  private async toggleView() {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE);

    if (leaves.length > 0) {
      leaves.forEach((leaf) => leaf.detach());
    } else {
      await this.initializeView();
    }
  }

  /**
   * Load settings from disk
   */
  private async loadSettings() {
    const saved = await this.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, saved);
  }

  /**
   * Save settings to disk
   */
  async saveSettings() {
    await this.saveData(this.settings);
  }
}
