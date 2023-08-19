// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = "Niklas Griessbaum";
export const SITE_DESCRIPTION = 'Welcome to my website!';
export const GITHUB= 'https://github.com/NiklasPhabian';
export const MY_NAME = "Niklas Griessbaum";

// setup in astro.config.mjs
const BASE_URL = new URL(import.meta.env.SITE);
export const SITE_URL = BASE_URL.origin;

export const BASE  = import.meta.env.BASE_URL;

