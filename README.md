# SRC for Niklas Griessbaum's homepage

Page is based on [Blogster sleek template](https://blogster-sleek.netlify.app) by [Dinesh Pandiyan](https://github.com/flexdinesh)


## Build locally
```bash
sudo apt install npm
npm run astro dev
```


## From scratch
### Purge
```bash
rm -r node_modules
rm package-lock.json
rm package.json
```

### Make a package.json
Need to repopulate the package.json
```json
{
  "name": "homepage",
  "type": "module",
  "version": "0.0.1",
  "scripts": {
    "dev": "astro dev",
    "start": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro"
  },
  "dependencies": {
    "@astrojs/mdx": "^4.2.2",
    "@astrojs/sitemap": "^3.3.0",
    "@astrojs/tailwind": "^6.0.2",
    "astro": "^5.5.5",
    "rehype-autolink-headings": "^7.1.0",
    "rehype-katex": "^7.0.1",
    "rehype-slug": "^6.0.0",
    "remark-math": "^6.0.0",
    "remark-toc": "^9.0.0"
  }
}

```

### Install Dependencies
```bash
npm install astro
npm install @astrojs/mdx
npm install @astrojs/sitemap
npm install @astrojs/tailwind
npm install remark-toc
npm install rehype-slug rehype-autolink-headings
npm install remark-math rehype-katex
```


## Notes:
- don't forget to edit `astro.config.mjs` to include a 'base' pointing to the GH pages
- It seems like all links need to be adapted as well


## Customization
### TOC
```bash
npm install remark-toc
```

- https://dev.to/stivncastillo/how-to-implement-toc-in-astro-4k4e
- https://daily-dev-tips.com/posts/adding-a-toc-in-astro/
- https://www.omarpg.com/blog/table-of-contents/
- https://github.com/withastro/docs/blob/882e0b0a9d16d1c822cb8c230a62a4bfcd308605/src/util/generateToc.ts
- https://kld.dev/building-table-of-contents/


### Adding Header-links
```bash
npm install rehype-autolink-headings
npm install rehype-slug
```

### Adding math support
```bash
npm install remark-math rehype-mathjax
```



