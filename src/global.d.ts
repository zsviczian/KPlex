import { Plugin } from "obsidian";

declare module "obsidian" {
  interface App {
    plugins: {
      disablePlugin(plugin: string): Promise<any>;
      plugins: { [key: string]: Plugin };
    };
  }
  interface WorkspaceLeaf {
    id: string;
    activeTime: number;
  }
}