export const bio = {
  nombre: "Diego González Urra",
  origen: "Talca, Chile",
  desc: "Ingeniero Civil Informático con interés en ciberseguridad y experiencia en desarrollo backend con Laravel y frontend con Angular. Familiarizado con redes, firewalls y análisis de vulnerabilidades en entornos reales.",
  ocupacion: "Ciberseguridad | Desarrollador Web",
  formacion: [{
    id: "pregrado",
    carrera: "Ingeniería Civil Informática",
    universidad: "Universidad Católica del Maule",
    fechaInicio: "2019",
    fechaTermino: "2024",
  }],
  experiencia: [{
    id: "haulmer",
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
    { tipo: "Email", val: "diegonurr@hotmail.com", link: "mailto:diegonurr@hotmail.com" },
    { tipo: "Github", val: "github.com/DiegoGUrra", link: "https://github.com/DiegoGUrra" },
    { tipo: "Linkedin", val: "diegonurr", link: "https://www.linkedin.com/in/diegonurr/" }
  ],
  portafolio: [{
    nombre: "Acceso no autorizado mediante phishing y keylogger",
    resumen: "Phishing y keylogger comprometieron una cuenta, permitiendo extracción de datos y acceso remoto vía Metasploit.",
    habilidades: ["Kali Linux", "Metasploit", "Python"],
    id: "keylogger"
  },
  {
    nombre: "Configuración Firewall y VPN Cisco Packet Tracer",
    resumen: "Configuración de Firewall ASA y VPN Site-to-Site utilizando Cisco Packet Tracer",
    habilidades: ["Firewall ASA", "OSPF", "Hardening", "Telnet", "VPN Site-to-Site"],
    id: "firewall_y_vpn"
  },
  {
    nombre: "Servidor FTP básico con sockets en Python",
    resumen: "Implementación de un servidor y cliente FTP con soporte para múltiples clientes mediante threads, consola administrativa y transferencia binaria por sockets.",
    habilidades: ["Python", "Sockets", "Threading", "Redes"],
    id: "ftp_server"
  }
  ]
}
