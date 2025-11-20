import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '@data/constants';

export async function GET(context) {
const posts = await getCollection('cPosts');
return rss({
title: SITE_TITLE,
description: SITE_DESCRIPTION,
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
