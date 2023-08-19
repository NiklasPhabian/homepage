# SRC for Niklas Griessbaum's homepage

Page is based on 
- [Blogster sleek template](https://blogster-sleek.netlify.app) by [Dinesh Pandiyan](https://github.com/flexdinesh)
- 

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
npm install remark-toc

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




