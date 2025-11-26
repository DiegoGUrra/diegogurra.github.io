<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import favicon from '$lib/assets/favicon.svg';
	import Navbar from '$lib/components/navbar.svelte';
	import Footer from '@/components/footer.svelte';

	let { children } = $props();
	//TODO: add custom class to add style to navbar and footer so they stick to top and bottom.
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>
<ModeWatcher defaultMode="dark" />

<div
	class="flex min-h-screen w-full flex-col justify-between gap-2 overflow-x-hidden overflow-y-auto"
>
	<Navbar></Navbar>
	<main class="flex-1 p-2">
		{@render children?.()}
	</main>
	<Footer />
</div>
