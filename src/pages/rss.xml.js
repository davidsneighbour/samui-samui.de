import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import setup from '@data/setup.json';
import { getPostUrl } from '@utils/posts';
import { isPromotable } from '@utils/relic';

export async function GET(context) {
  let posts = (await getCollection('posts')).filter(isPromotable);
  posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
  posts = posts.slice(0, 10);
  return rss({
    description: setup.siteDescription,
    items: posts.map((post) => ({
      categories: post.data.themen || [],
      description: post.data.description,
      link: getPostUrl(post),
      pubDate: post.data.date,
      title: post.data.title,
    })),
    site: context.site,
    title: setup.title,
  });
}
