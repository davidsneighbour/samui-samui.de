import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import setup from '@data/setup.json';
import { getPostUrl } from '@utils/posts';

export async function GET(context) {
  let posts = await getCollection('posts');
  posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
  posts = posts.slice(0, 10);
  return rss({
    description: setup.description,
    items: posts.map((post) => ({
      categories: post.data.tags || [],
      description: post.data.description,
      link: getPostUrl(post),
      pubDate: post.data.date,
      title: post.data.title,
    })),
    site: context.site,
    title: setup.title,
  });
}
