import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const baseFrontmatter = z.object({
	title: z.string(),
	description: z.string().optional(),
	slug: z.string().optional(),
});

const cPosts = defineCollection({
	loader: glob({ base: "./src/content/posts", pattern: "**/index.md" }),
	schema: baseFrontmatter
		.extend({
			date: z.coerce.date(),
			lastmod: z.coerce.date().optional(),
			tags: z.array(z.string()).optional(),
			url: z.string().optional(),
			video: z.string().optional(),
			featured_image: z.string().optional(),
			resources: z
				.array(
					z.object({
						src: z.string(),
						name: z.string().optional(),
						title: z.string().optional(),
					}),
				)
				.optional(),
			dsq_thread_id: z.array(z.union([z.string(), z.number()])).optional(),
		})
		.passthrough(),
});

const cLeute = defineCollection({
	loader: glob({ base: "./src/content/leute", pattern: "**/_index.md" }),
	schema: baseFrontmatter.extend({
		slug: z.string(),
	}),
});

const cTags = defineCollection({
	loader: glob({ base: "./src/content/tags", pattern: "**/_index.md" }),
	schema: baseFrontmatter.extend({
		slug: z.string(),
	}),
});

export const collections = { cLeute, cPosts, cTags };
