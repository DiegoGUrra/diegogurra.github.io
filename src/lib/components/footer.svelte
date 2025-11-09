<script>
	import { bio } from '@/data/bio';
	import { Mail, Github, Linkedin } from '@lucide/svelte';
	import { Separator } from '$lib/components/ui/separator/index.js';
</script>

<footer id="contacto" class="bg-gradient-to-b from-background to-sidebar ps-6 pt-4 pb-4">
	<Separator />
	<h1 class="pt-4 pb-2 text-xl font-bold text-secondary-foreground sm:text-4xl">Contacto</h1>
	<div class="flex items-center space-x-4">
		<a href={bio.contacto[0].link} target="_blank" class="flex items-center space-x-2">
			<Mail class="h-6 w-6 sm:h-8 sm:w-8" /><span>{bio.contacto[0].val}</span>
		</a>
		<a href={bio.contacto[1].link} target="_blank" class="flex items-center space-x-2">
			<Github class="h-6 w-6 sm:h-8 sm:w-8" />
		</a>
		<a href={bio.contacto[2].link} target="_blank" class="flex items-center space-x-2">
			<Linkedin class="h-6 w-6 sm:h-8 sm:w-8" />
		</a>
	</div>
</footer>
