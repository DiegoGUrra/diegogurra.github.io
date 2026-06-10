<script>
	import SvelteMarkdown from '@humanspeak/svelte-markdown';
	/** @type {import('./$types').PageProps} */
	let { data } = $props();
</script>

<article class="mx-auto prose prose-sm max-w-2xl px-4 py-2 sm:prose-base dark:prose-invert">
	<SvelteMarkdown source={data.content} />
</article>
