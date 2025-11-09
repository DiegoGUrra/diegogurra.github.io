import { error } from '@sveltejs/kit';
const posts = import.meta.glob("$lib/md/portafolio/*.md", {query:"?raw", eager:true})

/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
  const post = await posts[`/src/lib/md/portafolio/${params.slug}.md`];
  if (!post) {
    error(404, 'Not found');
  }
  return {
    content: post.default
  }

}
