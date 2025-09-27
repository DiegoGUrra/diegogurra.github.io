<script>
  import * as Card from "$lib/components/ui/card/index.js";
  import { buttonVariants } from "$lib/components/ui/button/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
  import keylogger from "$lib/md/portafolio/keylogger.md?raw";
  import fw_y_vpn from "$lib/md/portafolio/firewall_y_vpn.md?raw";
  import SvelteMarkdown from "@humanspeak/svelte-markdown";
  import {Mail, Github, Linkedin} from '@lucide/svelte';
  const bio = {
    nombre: "Diego González Urra",
    origen: "Talca, Chile",
    desc: "Ingeniero Civil Informático con interés en ciberseguridad y experiencia práctica en programación backend con Laravel y frontend con Angular. Tengo conocimientos en redes, configuración de dispositivos Cisco, firewalls, herramientas de análisis de vulnerabilidades y uso de Kali Linux para prácticas de seguridad. Experiencia en entornos de laboratorio y proyectos profesionales.",
    ocupacion: "Ciberseguridad | Desarrollador Web",
    formacion: [{
      carrera: "Ingeniería Civil Informática",
      universidad: "Universidad Católica del Maule",
      fechaInicio: "2019",
      fechaTermino: "2024",
    }],
    experiencia: [{
        empresa: "Haulmer",
        cargo: "Desarrollador equipo Documentos Electrónicos (Práctica Profesional)",
        desc: ["Mantenimiento y mejora de backends en Laravel y Angular, optimizando procesos de documentos electrónicos",
        "Desarrollo de API en Laravel con GraphQL e integración en frontend",
      "Corrección de bugs y optimización en bases de datos SQL",
    "Uso de Git, Docker y Azure para control de versiones y despliegues"],
        fechaInicio: "Enero 2024",
        fechaTermino: "Marzo 2024"
    }],
    contacto: [
      {tipo: "Email", val: "diegonurr@hotmail.com", link: "mailto:diegonurr@hotmail.com"},
      {tipo: "Github", val: "github.com/DiegoGUrra", link: "https://github.com/DiegoGUrra"},
      {tipo: "Linkedin", val:"diegonurr", link:"https://www.linkedin.com/in/diegonurr/"}
    ],
    portafolio: [{nombre:"Acceso no autorizado mediante phishing y keylogger",
    resumen: "Phishing y keylogger comprometieron una cuenta, permitiendo extracción de datos y acceso remoto vía Metasploit.",
    habilidades: ["Kali Linux","Metasploit","Python"],
    md:keylogger
  },
  {
    nombre:"Configuración Firewall y VPN Cisco Packet Tracer",
    resumen: "Configuración de Firewall ASA y VPN Site-to-Site",
    habilidades: ["Firewall ASA","OSPF","Hardening","Telnet","VPN Site-to-Site"],
    md: fw_y_vpn
  } 
]
  }
</script>


  <section class="bg p-6 shadow-lg">
  <h1 class="scroll-m-20 text-balance text-6xl font-extrabold tracking-tight shadow-lg">
    {bio.nombre}
  </h1>
  <p class="text-secondary-foreground text-xl leading-7 [&:not(:first-child)]:mt-6 text-primary-foreground pl-10">
    {bio.ocupacion}
  </p>
  </section>
<hr class="border"/>  
<section class="bg-secondary p-2 ">
  <h2 class="text-secondary-foreground text-4xl font-bold p-6 shadow-lg">Sobre mí</h2>
  <div class="flex space-x-4  shadow-2xl p-6 justify-between pb-12">
    <div class="p-6 text-lg text-justify clamped-text leading-relaxed flex items-center mr-4 md:mr-8 lg:mr-80">{bio.desc}</div>
    <img src="draw.png" alt="profile" class="w-60 h-60 rounded-full justify-center flex items-center"/>
  </div>
</section>

<section class="bg p-6">
  <h2 class="text-foreground text-4xl font-bold p-6">Experiencia</h2>
  <div class="flex item-center justify-center">
    {#each bio.experiencia as exp}
    <Card.Root class="w-160 shadow-lg">
    <Card.Header>
      <div class="flex justify-between items-center">
        <Card.Title>{exp.empresa}</Card.Title>
        <Card.Title>{exp.fechaInicio} - {exp.fechaTermino}</Card.Title>
      </div>
      <Card.Description>{exp.cargo}</Card.Description>
    </Card.Header>
    <Card.Content>
      <ul class="list-disc pl-4 space-y-2">
        {#each exp.desc as tarea}
        <li class="text-justify">{tarea}</li>
        {/each}
      </ul>
    </Card.Content>
  </Card.Root>
    {/each}
  </div>
  
</section>
<section class="bg-secondary p-6">
  <h2 class="text-foreground text-4xl font-bold p-6">Proyectos</h2>
  <div class="flex item-center justify-center gap-6">
    {#each bio.portafolio as port}
    <Card.Root class="w-160 shadow-lg">
    <Card.Header>
      <div class="flex justify-between items-center p-6">
        <Card.Title>{port.nombre}</Card.Title>
      </div>
      <Card.Description>{port.resumen}</Card.Description>
      <Card.Action>
        <Dialog.Root>
          <Dialog.Trigger class={buttonVariants({variant: "outline"})}>Ver Detalle</Dialog.Trigger>
          <Dialog.Content class="w-full sm:max-w-[90vw] h-[90vh] flex flex-col p-0">
              <ScrollArea class="h-full p-6 rounded-md border flex-1">
              <article class="prose prose-invert max-w-none text-justify">
                <SvelteMarkdown source={port.md}/>
              </article>
            </ScrollArea>
            </Dialog.Content>
        </Dialog.Root>
      </Card.Action>
    </Card.Header>
    <Card.Content>
      <div class="flex flex-wrap gap-2">
        {#each port.habilidades as tarea}
        <span class="text-justify bg-chart-2 rounded-full text-sm font-medium px-3 py-1 hover:bg-destructive cursor-default">{tarea}</span>
        {/each}
      </div>
        
    </Card.Content>
  </Card.Root>
    {/each}
  </div>
</section>

<section class="bg p-6">
  <h2 class="text-foreground text-4xl font-bold p-6">Formación y Cursos</h2>
  <div class="flex item-center justify-center">
    {#each bio.formacion as f}
    <Card.Root class="w-160 shadow-lg">
    <Card.Header>
      <div class="flex justify-between items-center">
        <Card.Title>{f.carrera}</Card.Title>
        <Card.Title>{f.fechaInicio} - {f.fechaTermino}</Card.Title>
      </div>
      <Card.Description>{f.universidad}</Card.Description>
    </Card.Header>
  </Card.Root>
    {/each}
  </div>
</section>

<section class="bg-secondary p-6">
  <h2 class="text-secondary-foreground text-4xl font-bold p-6">Contato</h2>
  <div class="flex space-x-4 items-center">
  <a href={bio.contacto[0].link} target="_blank" class="flex items-center space-x-2">
    <Mail class="w-10 h-10"/><span>{bio.contacto[0].val}</span> 

  </a>
  <a href={bio.contacto[1].link} target="_blank" class="flex items-center space-x-2">
    <Github class="w-10 h-10"/> 
  </a>
  <a href={bio.contacto[2].link} target="_blank" class="flex items-center space-x-2">
    <Linkedin class="w-10 h-10"/> 
  </a>
</div>
</section>
