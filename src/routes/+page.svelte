<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { bio } from '$lib/data/bio';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	// import * as Item from '$lib/components/ui/item/index.js';
	//TODO: check tailwindcss.com/docs/float for the first part. it seems good? maybe
</script>

<section class="p-2 sm:p-6">
	<div
		class="grid grid-cols-2 content-end items-end justify-center gap-2 pb-12 sm:flex sm:flex-row sm:content-center sm:items-center sm:gap-6"
	>
		<div class="contents sm:flex sm:flex-col">
			<h1 class="col-span-full pl-2 text-2xl font-black sm:col-span-1 sm:px-10 sm:text-6xl">
				{bio.nombre}
			</h1>
			<p
				class="jusitfy-self-end align-self-end max-w-140 pt-6 text-left text-xs leading-tight sm:mr-10 sm:px-16 sm:text-xl sm:leading-relaxed"
			>
				{bio.desc}
			</p>
		</div>
		<img
			src="draw.png"
			alt="profile"
			class="aspect-square h-36 shrink-0 rounded-full sm:h-64 md:h-82"
		/>
	</div>
</section>
<Separator />

<section id="experiencia" class="p-2 sm:p-6">
	<h2 class="p-6 text-2xl font-bold text-foreground sm:text-5xl">Experiencia</h2>
	<div class="item-center flex justify-center">
		{#each bio.experiencia as exp (exp.id)}
			<Card.Root class="max-w-200 shadow-lg">
				<Card.Header>
					<div class="flex items-center justify-between sm:text-2xl">
						<div class="contents">
							<Card.Title>{exp.empresa}</Card.Title>
							<Card.Title>{exp.fechaInicio} - {exp.fechaTermino}</Card.Title>
						</div>
					</div>
					<Card.Description class="text-xs sm:text-xl">{exp.cargo}</Card.Description>
				</Card.Header>
				<Card.Content>
					<ul class="list-inside list-disc pl-4 text-xs leading-relaxed sm:text-lg">
						{#each exp.desc as tarea, i (i)}
							<li class="text-left">{tarea}</li>
						{/each}
					</ul>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>
</section>
<Separator />

<section id="proyectos" class="p-2 sm:p-6">
	<h2 class="p-6 text-2xl font-bold text-foreground sm:text-5xl">Proyectos</h2>
	<div class="item-center flex flex-col justify-center gap-6 sm:flex-row sm:justify-center">
		{#each bio.portafolio as port (port.id)}
			<Card.Root class="max-w-200 shadow-lg">
				<Card.Header class="flex flex-row">
					<Card.Title class="flex-3 sm:text-2xl">{port.nombre}</Card.Title>
					<Card.Action class="shrink-0">
						<Button class="text-xs sm:text-lg" variant="link" href="portafolio/{port.id}"
							>Ver más</Button
						>
					</Card.Action>
				</Card.Header>
				<Card.Content>
					<Card.Description class="text-xs sm:text-lg">{port.resumen}</Card.Description>
				</Card.Content>
				<Card.Footer>
					<div class="flex flex-wrap gap-2">
						{#each port.habilidades as tarea, i (i)}
							<Badge class="text-xs shadow-sm sm:text-lg" variant="destructive">{tarea}</Badge>
							<!-- <span -->
							<!-- 	class="cursor-default rounded-full bg-chart-2 px-3 py-1 text-justify text-xs font-medium hover:bg-destructive sm:text-lg" -->
							<!-- 	>{tarea}</span -->
							<!-- > -->
						{/each}
					</div>
				</Card.Footer>
			</Card.Root>
		{/each}
	</div>
</section>
<Separator />
<section id="formacion" class="p-2 sm:p-6">
	<h2 class="p-6 text-2xl font-bold text-foreground sm:text-5xl">Formación y Cursos</h2>
	<div class="item-center flex flex-col justify-center gap-6 sm:flex-row sm:justify-center">
		{#each bio.formacion as f (f.id)}
			<Card.Root class="max-w-200 shadow-lg">
				<Card.Header class="flex justify-between leading-normal sm:text-2xl">
					<Card.Title>{f.carrera}</Card.Title>
					<Card.Title>{f.fechaInicio} - {f.fechaTermino}</Card.Title>
				</Card.Header>
				<Card.Content>
					<Card.Description class="text-xs sm:text-lg">{f.universidad}</Card.Description>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>
</section>
