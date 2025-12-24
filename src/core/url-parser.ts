/**
 * URL Parser for KPlex
 * Extracts and indexes HTTP links from vault content
 */

import type { TFile } from "obsidian";
import { GraphNode } from "./graph-node";
import { GraphIndex } from "./graph-index";

/**
 * Represents an extracted URL with metadata
 */
export interface ExtractedURL {
  url: string;
  alias?: string;
  origin: string; // protocol + domain
  from: string; // path of file containing the URL
}

/**
 * URL Parser - extracts and indexes HTTP links
 */
export class URLParser {
  private urls: Map<string, ExtractedURL[]> = new Map();
  private origins: Set<string> = new Set();
  private graphIndex: GraphIndex;

  // Regex patterns for link detection
  private linkRegex = /(?:\[([^\[\]]+)\]\()((?:(?:ftp|https?|sftp|shttp|tftp):\/\/|www\.)[^\)]+)\)|(?:^|\s)((?:(?:ftp|https?|sftp|shttp|tftp):\/\/|www\.)[^\s\)]+)/gim;

  constructor(graphIndex: GraphIndex) {
    this.graphIndex = graphIndex;
  }

  /**
   * Index URLs from a file
   */
  indexFile(file: TFile, content: string): void {
    const urls: ExtractedURL[] = [];
    const filePath = file.path;

    let match;
    while ((match = this.linkRegex.exec(content)) !== null) {
      let url: string;
      let alias: string | undefined;

      if (match[2]) {
        // Markdown link: [text](url)
        alias = match[1];
        url = match[2];
      } else if (match[3]) {
        // Direct URL
        url = match[3];
      } else {
        continue;
      }

      // Normalize URL
      url = this.normalizeURL(url);

      const origin = this.extractOrigin(url);

      if (!origin) continue;

      urls.push({
        url,
        alias,
        origin,
        from: filePath,
      });

      this.origins.add(origin);
    }

    if (urls.length > 0) {
      this.urls.set(filePath, urls);
    }
  }

  /**
   * Remove URLs from a file
   */
  removeFile(filePath: string): void {
    this.urls.delete(filePath);
  }

  /**
   * Add indexed URLs to the graph
   */
  addToGraph(): void {
    this.urls.forEach((fileURLs, filePath) => {
      const fileNode = this.graphIndex.getNodeByPath(filePath);
      if (!fileNode) return;

      // Track unique origins in this graph
      const processedOrigins = new Set<string>();

      fileURLs.forEach((urlData) => {
        // Create or get URL node
        let urlNode = this.graphIndex.getNode(`url:${urlData.url}`);
        if (!urlNode) {
          urlNode = new GraphNode({
            id: `url:${urlData.url}`,
            path: urlData.url,
            name: urlData.alias || this.extractDomain(urlData.url),
            type: "url",
            url: urlData.url,
            isVirtual: false,
          });
          this.graphIndex.addNode(urlNode);
        }

        // Create or get origin node
        let originNode = this.graphIndex.getNode(`origin:${urlData.origin}`);
        if (!originNode) {
          originNode = new GraphNode({
            id: `origin:${urlData.origin}`,
            path: urlData.origin,
            name: this.extractDomain(urlData.origin),
            type: "url",
            url: urlData.origin,
            isVirtual: false,
          });
          this.graphIndex.addNode(originNode);
        }

        // Link file → URL → Origin
        fileNode.addRelation(
          urlNode.id,
          "child" as any,
          1 as any,
          1 as any,
          "url-reference"
        );

        // Link URL → Origin (only once per origin)
        if (!processedOrigins.has(urlData.origin)) {
          urlNode.addRelation(
            originNode.id,
            "parent" as any,
            1 as any,
            1 as any,
            "url-origin"
          );
          processedOrigins.add(urlData.origin);
        }
      });
    });
  }

  /**
   * Normalize URL (add protocol if needed)
   */
  private normalizeURL(url: string): string {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      if (url.startsWith("www.")) {
        return "https://" + url;
      }
    }
    return url;
  }

  /**
   * Extract origin (protocol + domain) from URL
   */
  private extractOrigin(url: string): string {
    try {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.hostname}`;
    } catch {
      return "";
    }
  }

  /**
   * Extract domain name from URL
   */
  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace("www.", "");
    } catch {
      return url;
    }
  }

  /**
   * Get all URLs
   */
  getAllURLs(): ExtractedURL[] {
    const all: ExtractedURL[] = [];
    this.urls.forEach((urls) => all.push(...urls));
    return all;
  }

  /**
   * Get all unique origins
   */
  getAllOrigins(): string[] {
    return Array.from(this.origins);
  }

  /**
   * Get URLs from a specific file
   */
  getFileURLs(filePath: string): ExtractedURL[] {
    return this.urls.get(filePath) || [];
  }
}
