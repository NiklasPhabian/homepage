# SRC for Niklas Griessbaum's homepage

Page is based on 
- [Blogster sleek template](https://blogster-sleek.netlify.app) by [Dinesh Pandiyan](https://github.com/flexdinesh)


## Build locally
```bash
sudo apt install npm
npm run astro dev
```


## Notes:
- don't forget to edit `astro.config.mjs` to include a 'base' pointing to the GH pages
- It seems like all links need to be adapted as well


## Getting started
Official examples:

https://github.com/withastro/astro/tree/main/examples

```bash
npm create astro@latest -- --template blog
npm run astro dev
```

## Add tailwind
```bash
npx astro add tailwind
```

## TOC
```bash
npm install remark-toc
```

## Adding Header-links
```bash
npm install rehype-autolink-headings
npm install rehype-slug
```


## Add mdx support 
I think this is not elegant; we might want to be able to parse md with e.g. pandoc

```bash
npx astro add mdx
```

## makdoc
```bash
npm install @markdoc/markdoc
```

## Render stuff
`const h = Markdoc.renderers.html(content)`

- https://github.com/withastro/docs/blob/882e0b0a9d16d1c822cb8c230a62a4bfcd308605/src/util/generateToc.ts
- https://kld.dev/building-table-of-contents/

# Links don't work

- https://dev.to/stivncastillo/how-to-implement-toc-in-astro-4k4e
- https://daily-dev-tips.com/posts/adding-a-toc-in-astro/
- https://www.omarpg.com/blog/table-of-contents/
