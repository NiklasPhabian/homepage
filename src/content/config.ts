import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
	// Type-check frontmatter using a schema
	type: 'content', // v2.5.0 and later
	schema: z.object({
		title: z.string(),
		description: z.string(),
		// Transform string to Date object
		date: z
			.string()
			.or(z.date())
			.transform((val) => new Date(val)),		
		heroImage: z.string().optional(),
	}),
});

export const collections = { 'blog': blogCollection };
