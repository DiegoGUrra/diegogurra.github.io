# Configuración de Firewall y VPN Site-to-Site Cisco Packet Tracer

**Empresa:** CyberSafe Solutions

CyberSafe Solutions está ampliando sus sucursales y desea proteger mejor sus activos. Para ello se instalará un Firewall ASA 5505 en la sucursal principal, se segmentarán las redes internas y se implementará un VPN Site-to-Site para cifrar la comunicación entre sucursales.

### Objetivos de la implementación

- Proteger la red interna de la sucursal principal (INSIDE).

- Proveer servicios accesibles desde Internet a través de la DMZ (NAT).

- Implementar un VPN seguro entre sucursales.

- Configurar seguridad en switches para prevenir accesos no autorizados, ataques MitM, tormentas de tráfico y VLAN hopping.

# Esquema en Packet Tracer

![Esquema Packet Tracer](/images/fw_y_vpn/image1.png)

El esquema muestra la conexión entre ASA, routers, switches y PCs de las sucursales

# Configuración de dispositivos

## Configuración ASA

El ASA 5505 funciona con VLANs internas y no con interfaces físicas directas. Cada puerto físico se asigna a una VLAN, que corresponde a una zona de seguridad.

### VLANs y asignación de puertos

```shell
int vlan10
nameif INSIDE
security-level 100
ip addr 172.16.15.2 255.255.255.0
exit

int et0/0
switchport access vlan 10
exit

int vlan11
nameif DMZ
security-level 40
ip addr 172.16.20.2 255.255.255.0
no forward interface vlan10
exit

int et0/5
switchport access vlan 11
exit

int vlan12
nameif OUTSIDE
security-level 20
ip addr 172.16.5.2 255.255.255.0
exit
int et0/3
switchport access vlan 12
exit
```

### DHCP para red interna

```shell
dhcpd address 172.16.15.3-172.16.15.18 INSIDE
dhcpd enable INSIDE
```

- **VLAN10 / INSIDE**: Red interna para usuarios. DHCP habilitado para asignar IPs automáticamente.
- **VLAN11 / DMZ**: Servidores accesibles desde Internet. NAT estático configurado para permitir acceso desde OUTSIDE.
- **VLAN12 / OUTSIDE**: Conexión a Internet y al Router RA para VPN Site-to-Site.
- no forward interface vlan10 bloquea tráfico directo entre DMZ e INSIDE.
- configuramos el servidor DHCP para la zona interna, dejando el rango desde la ip `172.16.15.3` a la `172.16.15.18` en la zona INSIDE.

### Ruta estática hacia red externa

```shell
route OUTSIDE 0.0.0.0 0.0.0.0 172.16.5.1
```

Fijamos al ruta estatica que sea el router RA.

### NAT

```shell
object network DMZ-NET
host 172.16.20.3
nat (DMZ,OUTSIDE) static 172.16.5.3
```

Configuramos un NAT estatico para la PC-DMZ.

```shell
object network INSIDE-NET
subnet 172.16.15.0 255.255.255.0
nat (INSIDE,OUTSIDE) dynamic interface
```

Y un NAT dinamico para la red interna.

### Permitir ICMP desde el exterior

```shell
access-list ICMP-ACL extended permit icmp any any
access-group ICMP-ACL in interface OUTSIDE
class-map ICMP-TRAFFIC
match access-list ICMP-ACL
policy-map ICMP-POLICY
class ICMP-TRAFFIC
inspect icmp
exit
service-policy ICMP-POLICY interface DMZ
service-policy ICMP-POLICY interface INSIDE
```

Para probar las redes igual tendremos esta configuración, lo que nos permitiría hacer pings desde nuestra red DMZ e INSIDE y podamos recibir las respuestas en los dispositivos.

### Acceso administrativo

```shell
username admin password cisco
aaa authentication telnet console LOCAL
telnet 172.16.250.3 255.255.255.255 OUTSIDE
```

Finalmente en el FW ASA dejamos que sea configurable desde la IP del servidor SERVICIOS (Aunque igual no es recomendado utilizar servios telnet porque este va en texto plano).

## Configuración RA

Configuramos un Router 2911 Cisco. Aquí debemos configurar el VPN Site-to-Site y OSPF.

### Interfaces y OSPF

```shell
int s0/0/0
ip addr 172.16.100.1 255.255.255.252
ip ospf authentication
ip ospf authentication-key cisco
exit

int g0/0
ip addr 172.16.5.1 255.255.255.0
exit

int g0/1
ip addr 172.16.10.1 255.255.255.0
exit
```

Activamos autenticación OSPF en la interfaz que conecta con el Router RB para evitar vecinos no autorizados.

```shell
router ospf 1
router-id 1.1.1.1
network 172.16.100.0 0.0.0.3 area 0
network 172.16.10.0 0.0.0.255 area 0
network 172.16.5.0 0.0.0.255 area 0
passive-interface g0/0
passive-interface g0/1
```

Luego la configuración del OSPF en sí. Dejamos como interfaces pasivas las que conectan a FW-ASA y a PC-VPN.

### VPN Site-to-Site

```shell
access-list 110 permit ip 172.16.5.0 0.0.0.255 172.16.250.0 0.0.0.255
access-list 110 permit ip 172.16.10.0 0.0.0.255 172.16.250.0 0.0.0.255
crypto isakmp policy 10
encryption aes 256
authentication pre-share
group 5
exit

crypto isakmp key ciscovpn addr 172.16.200.1
crypto ipsec transform-set VPN-SET esp-aes esp-sha-hmac

crypto map VPN-MAP 10 ipsec-isakmp
set peer 172.16.200.1
set transform-set VPN-SET
match address 110
exit

int s0/0/0
crypto map VPN-MAP
exit
```

Finalmente hacemos todo lo necesario para configurar el VPN:

- Creamos los ACLs
- Configuramos ISAKMP con la clave de ciscovpn para el peer que será 172.16.200.1
- Configuramos IPsec con sifrado AES.
- Aplicamos la politica IPsec creada hacia el peer 172.16.200.1 e indicamos que el trafico de la ACL 110 será cifrado.
- Aplicamos la configuración a la interfaz Serial 0/0/0

## Configuración RB

Aquí no hay mucho que decir, lo mas importante es que este router tenga su OSPF funcionando.

```shell
int s0/0/0
ip addr 172.16.100.2 255.255.255.252
ip ospf authentication
ip ospf authentication-key cisco
no shut
exit

int s0/0/1
ip addr 172.16.200.2 255.255.255.252
ip ospf authentication
ip ospf authentication-key cisco
no shut
exit

router ospf 1
router-id 2.2.2.2
network 172.16.200.0 0.0.0.3 area 0
network 172.16.100.0 0.0.0.3 area 0
```

## Configuración RC

```shell
int g0/0
ip addr 172.16.250.1 255.255.255.0
exit

int s0/0/1
ip addr 172.16.200.1 255.255.255.252
ip ospf authentication-key cisco
exit

router ospf 1
router-id 3.3.3.3
network 172.16.200.0 0.0.0.3 area 0
network 172.16.250.0 0.0.0.255 area 0
passive-interface g0/0
```

Tenemos la configuración de las interfaces

```shell
access-list 110 permit ip 172.16.250.0 0.0.0.255 172.16.5.0 0.0.0.255
access-list 110 permit ip 172.16.250.0 0.0.0.255 172.16.10.0 0.0.0.255
crypto isakmp policy 10
encryption aes 256
authentication pre-share
group 5
exit
crypto isakmp key ciscovpn addr 172.16.100.1
crypto ipsec transform-set VPN-SET esp-aes esp-sha-hmac
crypto map VPN-MAP 10 ipsec-isakmp
set peer 172.16.100.1
set transform-set VPN-SET
match address 110
exit
int s0/0/1
crypto map VPN-MAP
exit
```

Y del VPN, lo que cambia aquí es el peer, seria el router RA y tambien las ACLs que serian "inversas".

## Configuración Switches

### Port Security

```shell
switchport port-security
switchport port-security maximum 1
switchport port-security violation shutdown
switchport port-security mac-address sticky
```

En todos los puertos dejamos `port-security` para evitar ataques de Man-in-the-middle, ataques de sniffing o ataques de MAC flooding.

### STP y protección de puertos

```shell
spanning-tree bpduguard enable
spanning-tree portfast
```

Esta configuración para evitar que se conecten otros switches y se realicen ataques de STP.

### Storm Control

```shell
storm-control broadcast level 20.0
```

Para evitar ataques de tormenta.

### VLANs y Trunks

```shell
switchport mode trunk
switchport nonegotiate
switchport trunk native vlan 10
```

Cambiamos la VLAN nativa a la que se necesite. Por ejemplo la 10 y 11 para la zona INSIDE y DMZ. en el Switch SWC puede ser cualquiera que no sea la por defecto. De esta forma podemos evitar ataques de VLAN hopping.

### Puertos de acceso

```shell
switchport mode access
switchport access vlan 10
```

En los puertos que vayan a dispositivos finales como PCs o Servidores dejamos el switchport en modo access.

### Black Hole VLAN

```shell
vlan 999
name BLACKHOLE
exit

interface range f0/1-5 #las que sean necesarias
switchport mode access
switchport access vlan 999
swicthport nonegotiate
shutdown
```

## Pruebas

## IP de PC con DHCP

![IP PC DHCP](/images/fw_y_vpn/image2.png)

## Pings

### Ping desde PC Inside a RA

![Ping PC INSIDE a RA](/images/fw_y_vpn/image3.png)

### Ping desde PC DMZ a RA

![Ping PC DMZ a RA](/images/fw_y_vpn/image4.png)

## Telnet

### Telnet desde Servicios a ASA

![Telnet Servicios a ASA](/images/fw_y_vpn/image5.png)

## VPN

Utilizamos el comando `show crypto ipsec sa` para verificar si el tunel VPN esta funcionando correctamente.

### Router RA

![VPN 172.16.5.0/24 - 172.16.250.0/24](/images/fw_y_vpn/image6.png)
![VPN 172.16.10.0/24 - 172.16.250.0/24](/images/fw_y_vpn/image7.png)

### Router RC

![VPN 172.16.250.0/24 - 172.16.5.0/24](/images/fw_y_vpn/image8.png)
![VPN 172.16.250.0/24 - 172.16.10.0/24](/images/fw_y_vpn/image9.png)
