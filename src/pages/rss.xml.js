import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import setup from '@data/setup.json';

export async function GET(context) {
  let posts = await getCollection('posts', ({ data }) => {
    return data?.draft !== true;
  });
  posts.sort((a, b) => Date.parse(b.data.date) - Date.parse(a.data.date));
  posts = posts.slice(0, 10);
  return rss({
    description: setup.description,
    items: posts.map((post) => {
      const normalizedUrl = (post.data.url ?? post.id).replace(/^\/+|\/+$/g, '');
      return {
        categories: post.data.tags || [],
        description: post.data.description,
        link: `/${normalizedUrl}/`,
        pubDate: post.data.date,
        title: post.data.title,
      };
    }),
    site: context.site,
    title: setup.title,
  });
}
