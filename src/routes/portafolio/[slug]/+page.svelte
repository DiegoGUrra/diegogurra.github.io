<script>
	import SvelteMarkdown from '@humanspeak/svelte-markdown';
	/** @type {import('./$types').PageProps} */
	let { data } = $props();
</script>

<article class="prose max-w-full pl-2 text-left sm:text-2xl dark:prose-invert">
	<SvelteMarkdown source={data.content} />
</article>
