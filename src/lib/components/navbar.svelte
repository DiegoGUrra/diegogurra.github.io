<script>
	import * as NavigationMenu from '$lib/components/ui/navigation-menu/index.js';
	import { navigationMenuTriggerStyle } from '$lib/components/ui/navigation-menu/navigation-menu-trigger.svelte';
	import { House } from '@lucide/svelte';
	import DarkmodeButton from './darkmode-button.svelte';
	import { Separator } from '$lib/components/ui/separator/index.js';
</script>

<header
	class="item-center flex w-full shrink grow-0 flex-row justify-between justify-items-center px-0.5 py-0.5 sm:px-6"
>
	<NavigationMenu.Root
		viewport={false}
		class="flex shrink items-center justify-between justify-self-start"
	>
		<NavigationMenu.List class="flex list-none items-end justify-between">
			<NavigationMenu.Item class="flex-none self-end">
				<NavigationMenu.Link>
					{#snippet child()}
						<a href="/#inicio" class={navigationMenuTriggerStyle()}
							><House class="h-[1.2rem] w-[1.2rem]" /></a
						>
					{/snippet}
				</NavigationMenu.Link>
			</NavigationMenu.Item>
			<NavigationMenu.Item class="shrink">
				<NavigationMenu.Link>
					{#snippet child()}
						<a
							href="/#experiencia"
							class={`${navigationMenuTriggerStyle()}  text-xs text-ellipsis sm:text-sm`}
							>Experiencia</a
						>
					{/snippet}
				</NavigationMenu.Link>
			</NavigationMenu.Item>

			<NavigationMenu.Item class="shrink">
				<NavigationMenu.Link>
					{#snippet child()}
						<a
							href="/#proyectos"
							class={`${navigationMenuTriggerStyle()}  text-xs text-ellipsis sm:text-sm`}
							>Proyectos</a
						>
					{/snippet}
				</NavigationMenu.Link>
			</NavigationMenu.Item>

			<NavigationMenu.Item class="shrink">
				<NavigationMenu.Link>
					{#snippet child()}
						<a
							href="/#formacion"
							class={`${navigationMenuTriggerStyle()} text-xs text-ellipsis sm:text-sm`}
							>Formación</a
						>
					{/snippet}
				</NavigationMenu.Link>
			</NavigationMenu.Item>
		</NavigationMenu.List>
	</NavigationMenu.Root>
	<Separator class="justify-self-end-safe" orientation="vertical" />
	<DarkmodeButton class="grow-0 justify-self-end-safe" />
</header>
<Separator />
