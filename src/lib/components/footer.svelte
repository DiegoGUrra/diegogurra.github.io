<script>
	import contact from '@/data/contact.json';
	import { Mail } from '@lucide/svelte';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import Icon from '@iconify/svelte';
	import * as m from '$lib/paraglide/messages.js';
</script>

<footer id="contacto" class="bg-gradient-to-b from-background to-sidebar ps-6 pt-4 pb-4">
	<Separator />
	<h1 class="pt-4 pb-2 text-xl font-bold text-secondary-foreground sm:text-2xl">
		{m.nav_contacto()}
	</h1>
	<div class="flex items-center space-x-4">
		<a href={contact[0].link} target="_blank" class="flex items-center space-x-2">
			<Mail class="h-6 w-6 sm:h-8 sm:w-8" /><span>{contact[0].val}</span>
		</a>
		<a href={contact[1].link} target="_blank" class="flex items-center space-x-2">
			<Icon icon="bi:github" class="h-6 w-6 sm:h-8 sm:w-8" />
		</a>
		<a href={contact[2].link} target="_blank" class="flex items-center space-x-2">
			<Icon icon="bi:linkedin" class="h-6 w-6 sm:h-8 sm:w-8" />
		</a>
	</div>
</footer>
