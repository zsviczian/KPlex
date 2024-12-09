import { ItemView } from "obsidian";
import React from "react";
import ReactDOM from "react-dom/client";  // Import from react-dom/client
import Plex from "./ui/Plex";

export class KPlexView extends ItemView {
  private reactComponent: React.ReactElement;
  private root: ReactDOM.Root | null = null;  // To store the root

  getViewType(): string {
    return VIEW_TYPE;
  }

  getDisplayText(): string {
    return "Dice Roller";
  }

  getIcon(): string {
    return "calendar-with-checkmark";
  }

  async onOpen(): Promise<void> {
    this.reactComponent = React.createElement(Plex);

    // Create a root and render the component using createRoot
    if (this.root === null) {
      const container = (this as any).contentEl;
      this.root = ReactDOM.createRoot(container);  // Create the root here
      this.root.render(this.reactComponent);  // Render the component
    }
  }

  async onClose(): Promise<void> {
    // Clean up when the view is closed
    if (this.root !== null) {
      this.root.unmount();
      this.root = null;
    }
  }
}