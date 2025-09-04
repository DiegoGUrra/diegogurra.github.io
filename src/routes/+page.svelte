<script>
  import * as Card from "$lib/components/ui/card/index.js";
  import { buttonVariants } from "$lib/components/ui/button/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";

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
    md:
      `
# Resumen de Incidente

**Empresa:** CyberSafe Solutions (ficticia)  

### Resumen del incidente
CyberSafe Solutions detectó un acceso no autorizado a información confidencial a través de la cuenta de un usuario, quien reportó actividad sospechosa. El análisis inicial reveló que las credenciales del usuario fueron comprometidas mediante un ataque de phishing, permitiendo que la cuenta fuera utilizada para extraer datos hacia una dirección IP externa.

### Análisis de la situación
El incidente parece haberse originado a partir de un ataque de phishing dirigido, mediante el cual se logró instalar un malware tipo keylogger en el equipo del usuario. Este tipo de malware registra la información ingresada por teclado y la envía al atacante, permitiendo la captura de credenciales y otros datos sensibles.  

Una vez obtenidas estas credenciales, los atacantes accedieron a sistemas internos sin restricciones adicionales, debido a que la cuenta no contaba con autenticación multifactor (MFA).  

Posteriormente, se identificó tráfico de datos inusual hacia una IP externa, lo que sugiere una posible exfiltración de información confidencial. La combinación de phishing, malware y ausencia de MFA facilitó un acceso no autorizado y persistente a la infraestructura interna, aumentando el riesgo para los activos críticos de la organización.

# Prueba de Metasploit

## I. Generación de Payload
Se creó un payload de malware utilizando \`msfvenom\` con \`reverse_tcp\`, apuntando a la máquina atacante y seleccionando un puerto no utilizado.

![Generación del Payload](/images/Imagen1.png)
## II. Detección del Malware
Un escaneo en VirusTotal indicó que el archivo era detectado como malware por 59 motores antivirus.

![Detección de Malware](/images/Imagen2.png)
## III. Distribución del Archivo Malicioso
El archivo se distribuyó mediante un servidor HTTP creado con Python.

![Creación de servidor HTTP](/images/Imagen3.png)

## IV. Ejecución y Conexión Inversa
El payload establece un “shell inverso” hacia la máquina del atacante.
![Ejecución del archivo malicioso](/images/Imagen4.png)
![Conexión en Metasploit](/images/Imagen5.png)
![Sesión en Metasploit](/images/Imagen6.png)


## V. Actividad del Keylogger
Con la sesión establecida, se puede observar la actividad del keylogger, capturando credenciales y otra información sensible.
![Keylogger en Metasploit](/images/Imagen7.png)
`},
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
  <div class="flex item-center justify-center">
    {#each bio.portafolio as port}
    <Card.Root class="w-160 shadow-lg">
    <Card.Header>
      <div class="flex justify-between items-center">
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
