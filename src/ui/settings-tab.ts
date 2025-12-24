/**
 * KPlex Settings Tab
 * User settings interface
 */

import { App, PluginSettingTab, Setting } from "obsidian";
import type KPlexPlugin from "../main";

export class KPlexSettingTab extends PluginSettingTab {
  plugin: KPlexPlugin;

  constructor(app: App, plugin: KPlexPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "KPlex Settings" });

    // Inference Settings
    containerEl.createEl("h3", { text: "Link Inference" });

    new Setting(containerEl)
      .setName("Inverse inference")
      .setDesc(
        "If enabled, forward links are treated as parent relationships instead of child relationships"
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.inverseInfer)
          .onChange(async (value) => {
            this.plugin.settings.inverseInfer = value;
            await this.plugin.saveSettings();
            await this.plugin.viewContainer?.rebuildGraph();
          })
      );

    new Setting(containerEl)
      .setName("Infer all links as friends")
      .setDesc(
        "If enabled, all inferred relationships will be treated as lateral connections instead of parent-child"
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.inferAllLinksAsFriends)
          .onChange(async (value) => {
            this.plugin.settings.inferAllLinksAsFriends = value;
            await this.plugin.saveSettings();
            await this.plugin.viewContainer?.rebuildGraph();
          })
      );

    // Display Settings
    containerEl.createEl("h3", { text: "Display Options" });

    new Setting(containerEl)
      .setName("Show virtual nodes")
      .setDesc(
        "Display ghost nodes for unresolved links (files that don't exist yet)"
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showVirtualNodes)
          .onChange(async (value) => {
            this.plugin.settings.showVirtualNodes = value;
            await this.plugin.saveSettings();
            this.plugin.viewContainer?.updateSettings(this.plugin.settings);
          })
      );

    new Setting(containerEl)
      .setName("Show inferred nodes")
      .setDesc("Display nodes connected via inferred relationships")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showInferredNodes)
          .onChange(async (value) => {
            this.plugin.settings.showInferredNodes = value;
            await this.plugin.saveSettings();
            this.plugin.viewContainer?.updateSettings(this.plugin.settings);
          })
      );

    new Setting(containerEl)
      .setName("Show folders")
      .setDesc("Display folder nodes in the graph")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showFolders)
          .onChange(async (value) => {
            this.plugin.settings.showFolders = value;
            await this.plugin.saveSettings();
            this.plugin.viewContainer?.updateSettings(this.plugin.settings);
          })
      );

    new Setting(containerEl)
      .setName("Show tags")
      .setDesc("Display tag nodes in the graph")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showTags)
          .onChange(async (value) => {
            this.plugin.settings.showTags = value;
            await this.plugin.saveSettings();
            this.plugin.viewContainer?.updateSettings(this.plugin.settings);
          })
      );

    new Setting(containerEl)
      .setName("Show attachments")
      .setDesc("Display attachment nodes in the graph")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showAttachments)
          .onChange(async (value) => {
            this.plugin.settings.showAttachments = value;
            await this.plugin.saveSettings();
            this.plugin.viewContainer?.updateSettings(this.plugin.settings);
          })
      );

    // Layout Settings
    containerEl.createEl("h3", { text: "Layout" });

    new Setting(containerEl)
      .setName("Compact view")
      .setDesc("Reduce spacing for a denser visualization")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.compactView)
          .onChange(async (value) => {
            this.plugin.settings.compactView = value;
            await this.plugin.saveSettings();
            this.plugin.viewContainer?.updateSettings(this.plugin.settings);
          })
      );

    new Setting(containerEl)
      .setName("Maximum label length")
      .setDesc("Maximum characters to display in node labels")
      .addSlider((slider) =>
        slider
          .setLimits(10, 50, 5)
          .setValue(this.plugin.settings.maxLabelLength)
          .onChange(async (value) => {
            this.plugin.settings.maxLabelLength = value;
            await this.plugin.saveSettings();
            this.plugin.viewContainer?.updateSettings(this.plugin.settings);
          })
      );

    // Ontology Settings
    containerEl.createEl("h3", { text: "Ontology Fields" });

    new Setting(containerEl)
      .setName("Parent fields")
      .setDesc(
        "Comma-separated field names that define parent relationships (e.g., parent, up, origin)"
      )
      .addTextArea((text) => {
        text
          .setValue(this.plugin.settings.ontology.parents.join(", "))
          .onChange(async (value) => {
            this.plugin.settings.ontology.parents = value
              .split(",")
              .map((s) => s.trim())
              .filter((s) => s);
            await this.plugin.saveSettings();
            await this.plugin.viewContainer?.rebuildGraph();
          });
        text.inputEl.rows = 3;
      });

    new Setting(containerEl)
      .setName("Child fields")
      .setDesc("Comma-separated field names that define child relationships")
      .addTextArea((text) => {
        text
          .setValue(this.plugin.settings.ontology.children.join(", "))
          .onChange(async (value) => {
            this.plugin.settings.ontology.children = value
              .split(",")
              .map((s) => s.trim())
              .filter((s) => s);
            await this.plugin.saveSettings();
            await this.plugin.viewContainer?.rebuildGraph();
          });
        text.inputEl.rows = 3;
      });

    new Setting(containerEl)
      .setName("Left friend fields")
      .setDesc(
        "Comma-separated field names that define lateral connections (left/west)"
      )
      .addTextArea((text) => {
        text
          .setValue(this.plugin.settings.ontology.leftFriends.join(", "))
          .onChange(async (value) => {
            this.plugin.settings.ontology.leftFriends = value
              .split(",")
              .map((s) => s.trim())
              .filter((s) => s);
            await this.plugin.saveSettings();
            await this.plugin.viewContainer?.rebuildGraph();
          });
        text.inputEl.rows = 3;
      });

    new Setting(containerEl)
      .setName("Right friend fields")
      .setDesc(
        "Comma-separated field names that define lateral connections (right/east)"
      )
      .addTextArea((text) => {
        text
          .setValue(this.plugin.settings.ontology.rightFriends.join(", "))
          .onChange(async (value) => {
            this.plugin.settings.ontology.rightFriends = value
              .split(",")
              .map((s) => s.trim())
              .filter((s) => s);
            await this.plugin.saveSettings();
            await this.plugin.viewContainer?.rebuildGraph();
          });
        text.inputEl.rows = 3;
      });

    new Setting(containerEl)
      .setName("Previous fields")
      .setDesc(
        "Comma-separated field names that define sequence (previous/before)"
      )
      .addTextArea((text) => {
        text
          .setValue(this.plugin.settings.ontology.previous.join(", "))
          .onChange(async (value) => {
            this.plugin.settings.ontology.previous = value
              .split(",")
              .map((s) => s.trim())
              .filter((s) => s);
            await this.plugin.saveSettings();
            await this.plugin.viewContainer?.rebuildGraph();
          });
        text.inputEl.rows = 3;
      });

    new Setting(containerEl)
      .setName("Next fields")
      .setDesc("Comma-separated field names that define sequence (next/after)")
      .addTextArea((text) => {
        text
          .setValue(this.plugin.settings.ontology.next.join(", "))
          .onChange(async (value) => {
            this.plugin.settings.ontology.next = value
              .split(",")
              .map((s) => s.trim())
              .filter((s) => s);
            await this.plugin.saveSettings();
            await this.plugin.viewContainer?.rebuildGraph();
          });
        text.inputEl.rows = 3;
      });
  }
}
