<script lang="ts">
	import * as NavigationMenu from '$lib/components/ui/navigation-menu/index.js';
	import { navigationMenuTriggerStyle } from '$lib/components/ui/navigation-menu/navigation-menu-trigger.svelte';
	import { House, Languages } from '@lucide/svelte';
	import DarkmodeButton from './darkmode-button.svelte';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as RadioGroup from '$lib/components/ui/radio-group/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { getLocale, localizeHref, setLocale } from '$lib/paraglide/runtime.js';
	import * as m from '$lib/paraglide/messages.js';
	const currentValue = getLocale();
</script>

<header
	class="item-center flex w-full shrink grow-0 flex-row justify-between justify-items-center px-0.5 py-0.5 sm:px-6"
>
	<NavigationMenu.Root
		viewport={false}
		class="flex shrink items-center justify-between justify-self-start"
	>
		<NavigationMenu.List class="flex items-end justify-between">
			<NavigationMenu.Item class="">
				<NavigationMenu.Link>
					{#snippet child()}
						<a href={localizeHref('/') + '#inicio'} class={navigationMenuTriggerStyle()}
							><House class="sm:size-[36px]" /></a
						>
					{/snippet}
				</NavigationMenu.Link>
			</NavigationMenu.Item>

			<NavigationMenu.Item class="shrink">
				<NavigationMenu.Link>
					{#snippet child()}
						<a
							href={localizeHref('/') + '#proyectos'}
							class={`${navigationMenuTriggerStyle()}  text-xs text-ellipsis sm:text-sm`}
							>{m.nav_portafolio()}</a
						>
					{/snippet}
				</NavigationMenu.Link>
			</NavigationMenu.Item>

			<NavigationMenu.Item class="shrink">
				<NavigationMenu.Link>
					{#snippet child()}
						<a
							href={localizeHref('/') + '#experiencia'}
							class={`${navigationMenuTriggerStyle()}  text-xs text-ellipsis sm:text-sm`}
							>{m.nav_experiencia()}</a
						>
					{/snippet}
				</NavigationMenu.Link>
			</NavigationMenu.Item>

			<!-- <NavigationMenu.Item class="shrink"> -->
			<!-- 	<NavigationMenu.Link> -->
			<!-- 		{#snippet child()} -->
			<!-- 			<a -->
			<!-- 				href="/#formacion" -->
			<!-- 				class={`${navigationMenuTriggerStyle()} text-xs text-ellipsis sm:text-sm`} -->
			<!-- 				>{m.nav_formacion()}</a -->
			<!-- 			> -->
			<!-- 		{/snippet} -->
			<!-- 	</NavigationMenu.Link> -->
			<!-- </NavigationMenu.Item> -->
		</NavigationMenu.List>
	</NavigationMenu.Root>
	<div class="flex justify-end-safe gap-2 sm:gap-4">
		<!-- <Separator class="justify-self-end-safe" orientation="vertical" /> -->
		<Popover.Root>
			<Popover.Trigger class="touch-manipulation justify-self-end-safe">
				<Languages class="sm:size-[36px]" />
			</Popover.Trigger>
			<Popover.Content class="w-22">
				<RadioGroup.Root value={currentValue} onValueChange={(v) => setLocale(v as 'es' | 'en')}>
					<div class="flex items-center space-x-2">
						<RadioGroup.Item value="es" id="r1"></RadioGroup.Item>
						<Label for="r1">Español</Label>
					</div>
					<div class="flex items-center space-x-2">
						<RadioGroup.Item value="en" id="r2" />
						<Label for="r2">English</Label>
					</div>
				</RadioGroup.Root>
			</Popover.Content>
		</Popover.Root>
		<DarkmodeButton class="grow-0 justify-self-end-safe" />
	</div>
</header>
<Separator />
