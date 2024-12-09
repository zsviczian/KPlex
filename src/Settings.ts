import { App, PluginSettingTab } from "obsidian";
import KPlex from "src";

export interface KPlexSettings {
  inferAllLinksAsFriends: boolean;
  inverseInfer: boolean;
}

export const DEFAULT_SETTINGS: KPlexSettings = {
  inferAllLinksAsFriends: false,
  inverseInfer: false,
}

export class KPlexSettingTab extends PluginSettingTab {
  plugin: KPlex;
  
  constructor(app: App, plugin: KPlex) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    let {containerEl} = this;
    containerEl.empty();
    containerEl.createEl("h2", {text: "Settings for KPlex"});
  }
} 