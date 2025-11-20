import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import setup from '@data/setup.json';

export async function GET(context) {
	const posts = await getCollection('cPosts');
	return rss({
		title: setup.title,
		description: setup.description,
		site: context.site,
		items: posts.map((post) => {
			const normalizedUrl = (post.data.url ?? post.id).replace(/^\/+|\/+$/g, '');
			return {
				...post.data,
				link: `/${normalizedUrl}/`,
			};
		}),
	});
}
