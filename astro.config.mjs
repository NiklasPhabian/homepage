import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

import tailwind from "@astrojs/tailwind";
import remarkToc from 'remark-toc';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

const SERVER_PORT = 3000;
const LOCALHOST_URL = `http://localhost:${SERVER_PORT}`;
const LIVE_URL = "https://niklasphabian.github.io";
const SCRIPT = process.env.npm_lifecycle_script || "";
const isBuild = SCRIPT.includes("astro build");
let BASE_URL = LOCALHOST_URL;

if (isBuild) {
  BASE_URL = LIVE_URL;
}

// https://astro.build/config
export default defineConfig({
    server: {
      port: SERVER_PORT
    },
    site: BASE_URL,
    base: "/homepage/",
	integrations: [
		mdx(), 
		sitemap(),
//		tailwind(),
	],
    markdown: {
    // Applied to .md and .mdx files
        remarkPlugins: [
            [remarkToc, {
              heading: "Contents", 
              tight: true, 
              maxDepth: 3,
              //ordered: true,
              skip: 'delta',
              parents: ['root', 'listItem']}]],
    rehypePlugins: [
      rehypeSlug, 
      [rehypeAutolinkHeadings, {behavior: 'wrap',content: ''}]
    ],
    
  }
});


