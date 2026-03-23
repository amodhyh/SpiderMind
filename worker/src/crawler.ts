import { Queue } from "./data-structures/Queue.js";

// make a one selected task to track down the depthj
interface CrawlTask {
  url: string;
  depth: number;
}

interface CrawlerOption{
    maxDepth: number;
    maxConcurrency: number;

}

function normalizeUrl(rawUrl: string, baseUrl: string): string | null {
  try {
    const url = new URL(rawUrl, baseUrl);
    url.hash = ''; // Remove fragments (e.g., #section1)
    return url.toString();
  } catch {
    return null; // Ignore invalid URLs
  }
}

async function crawl(options:CrawlerOption) {

    const urlList= new Queue<CrawlTask> 
}