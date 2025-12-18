import axios from 'axios';
import * as cheerio from 'cheerio';
// discovery - finding the links
//remember
//stop before infinite like loop

const MAX_PAGES=10;

/* 
States -  this crawler needs to remember the urls that its going visit and the URLs that 
has already visited 
and it uses BFS to go layer by layer 

to-visit -> queue 
why a queue ?
As the 

*/
const visited =new Set<string>();
const urls_q :string[] = [];


async function crawl() {
    // THE ENGINE: Keep running while there are URLs in the queue
    while (urls_q.length > 0) {
        
        //  Get the next URL from the front
        const currentUrl = urls_q.shift(); 

        // queue.shift() can return undefined if empty
        if (!currentUrl) continue;

        //  If we already saw this, skip immediately
        if (visited.has(currentUrl)) {
            continue; 
        }

        //  Record that we are processing this now
        visited.add(currentUrl);
        console.log(`Crawling: ${currentUrl}`);

    
    }
}

crawl(); 