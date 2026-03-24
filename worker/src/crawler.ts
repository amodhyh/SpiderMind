import axios from 'axios';
import * as cheerio from 'cheerio';
import { Queue } from './data-structures/Queue.js';

// 1. Define our Type Contracts
interface CrawlTask {
  url: string;
  depth: number;
}

interface CrawlerOptions {
  maxDepth: number;
  maxConcurrency: number;
  timeoutMs: number;
}

export class WebCrawler {
  private visited = new Set<string>();
  private queue = new Queue<CrawlTask>();
  private activeWorkers = 0;

  constructor(private options: CrawlerOptions) {}

  /**
   * The Entry Point
   */
  async start(startUrl: string) {
    const normalizedRoot = this.normalizeUrl(startUrl, startUrl);
    if (!normalizedRoot) throw new Error("Invalid Start URL");

    this.queue.enqueue({ url: normalizedRoot, depth: 0 });

    // Create a "Pool" of workers running in parallel
    const workers = Array.from({ length: this.options.maxConcurrency }, () => this.worker());
    
    console.log(`Starting crawl with ${this.options.maxConcurrency} workers...`);
    await Promise.all(workers);
    console.log(`Crawl finished. Total pages visited: ${this.visited.size}`);
  }

  /**
   * The Engine: Each worker runs this loop independently
   */
  private async worker(): Promise<void> {
    while (true) {
      const task = this.queue.dequeue();

      // IF QUEUE IS EMPTY:
      if (!task) {
        // If others are still working, they might find more links. Sleep and retry.
        if (this.activeWorkers > 0) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          continue;
        }
        // If no one is working and queue is empty, this worker's job is done.
        break;
      }

      // GUARD: Skip if visited or too deep
      if (this.visited.has(task.url) || task.depth > this.options.maxDepth) {
        continue;
      }

      // EXECUTION: Fetch and Parse
      await this.processTask(task);
    }
  }

  /**
   * The Processor: Handles the I/O and data extraction
   */
  private async processTask(task: CrawlTask) {
    this.visited.add(task.url);
    this.activeWorkers++;

    try {
      console.log(`[Depth ${task.depth}] Fetching: ${task.url}`);
      
      const { data: html } = await axios.get(task.url, { 
        timeout: this.options.timeoutMs,
        headers: { 'User-Agent': 'MyTechLeadCrawler/1.0' }
      });

      const links = this.extractLinks(html, task.url);

      for (const link of links) {
        if (!this.visited.has(link)) {
          this.queue.enqueue({ url: link, depth: task.depth + 1 });
        }
      }
    } catch (error: any) {
      console.error(`Failed to crawl ${task.url}: ${error.message}`);
    } finally {
      this.activeWorkers--;
    }
  }

  /**
   * The Parser: Extracting "New Work" from HTML
   */
  private extractLinks(html: string, baseUrl: string): string[] {
    const $ = cheerio.load(html);
    const discoveredLinks: string[] = [];

    $('a[href]').each((_, element) => {
      const rawHref = $(element).attr('href');
      if (rawHref) {
        const normalized = this.normalizeUrl(rawHref, baseUrl);
        if (normalized) discoveredLinks.push(normalized);
      }
    });

    return discoveredLinks;
  }

  /**
   * The Sanitizer: Preventing Infinite Loops
   */
  private normalizeUrl(rawUrl: string, baseUrl: string): string | null {
    try {
      const url = new URL(rawUrl, baseUrl);
      url.hash = ''; // Remove #section identifiers
      // Ensure we only crawl web pages, not images/pdfs
      if (!['http:', 'https:'].includes(url.protocol)) return null;
      
      return url.toString();
    } catch {
      return null;
    }
  }
}