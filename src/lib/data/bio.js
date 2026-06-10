import * as m from '$lib/paraglide/messages.js';

export function getBio() {
  return {
    nombre: "Diego González Urra",
    origen: "Talca, Chile",
    desc: m.bio_desc(),
    ocupacion: m.bio_ocupacion(),
    experiencia: [{
      id: "haulmer",
      empresa: "Haulmer",
      cargo: m.exp_haulmer_cargo(),
      desc: [
        m.exp_haulmer_desc1(),
        m.exp_haulmer_desc2(),
        m.exp_haulmer_desc3(),
        m.exp_haulmer_desc4(),
      ],
      fechaInicio: m.exp_haulmer_inicio(),
      fechaTermino: m.exp_haulmer_termino(),
    }],
    portafolio: [{
      nombre: m.port_keylogger_nombre(),
      resumen: m.port_keylogger_resumen(),
      habilidades: ["Kali Linux", "Metasploit", "Python"],
      id: "keylogger"
    },
    {
      nombre: m.port_firewall_nombre(),
      resumen: m.port_firewall_resumen(),
      habilidades: ["Firewall ASA", "OSPF", "Hardening", "Telnet", "VPN Site-to-Site"],
      id: "firewall_y_vpn"
    },
    {
      nombre: m.port_ftp_nombre(),
      resumen: m.port_ftp_resumen(),
      habilidades: ["Python", "Sockets", "Threading", m.habilidad_redes()],
      id: "ftp_server"
    },
    {
      id: "linux_audit",
      nombre: m.port_linux_audit_nombre(),
      resumen: m.port_linux_audit_resumen(),
      habilidades: ["Python", "Linux", "CIS Benchmark", "Bash", m.habilidad_ciberseguridad()]

    }
    ]
  }
}
