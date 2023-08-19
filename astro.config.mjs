import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

import tailwind from "@astrojs/tailwind";
import remarkToc from 'remark-toc';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

// https://astro.build/config
export default defineConfig({
    site: "https://niklasphabian.github.io",
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
