import { error } from '@sveltejs/kit';
import { getLocale } from '$lib/paraglide/runtime.js';

const posts = import.meta.glob("$lib/md/portafolio/**/*.md", { query: "?raw", eager: true, import: 'default' })

/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
  const locale = getLocale();
  const post = await posts[`/src/lib/md/portafolio/${locale}/${params.slug}.md`];
  if (!post) {
    error(404, 'Not found');
  }
  return {
    content: post
  }

}
