# Firewall and Site-to-Site VPN Configuration in Cisco Packet Tracer

**Company:** CyberSafe Solutions

CyberSafe Solutions is expanding its branches and wants to better protect its assets. An ASA 5505 Firewall will be installed at the main branch, internal networks will be segmented, and a Site-to-Site VPN will be implemented to encrypt communication between branches.

### Implementation Objectives

- Protect the internal network of the main branch (INSIDE).
- Provide services accessible from the Internet through the DMZ (NAT).
- Implement a secure VPN between branches.
- Configure switch security to prevent unauthorized access, MitM attacks, traffic storms and VLAN hopping.

# Packet Tracer Diagram

![Packet Tracer Diagram](/images/fw_y_vpn/image1.png)

The diagram shows the connection between the ASA, routers, switches and PCs across branches.

# Device Configuration

## ASA Configuration

The ASA 5505 works with internal VLANs rather than direct physical interfaces. Each physical port is assigned to a VLAN, which corresponds to a security zone.

### VLANs and Port Assignment

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

### DHCP for Internal Network

```shell
dhcpd address 172.16.15.3-172.16.15.18 INSIDE
dhcpd enable INSIDE
```

- **VLAN10 / INSIDE**: Internal network for users. DHCP enabled to assign IPs automatically.
- **VLAN11 / DMZ**: Servers accessible from the Internet. Static NAT configured to allow access from OUTSIDE.
- **VLAN12 / OUTSIDE**: Internet connection and link to Router RA for Site-to-Site VPN.
- `no forward interface vlan10` blocks direct traffic between DMZ and INSIDE.
- The DHCP server is configured for the internal zone, with the range from `172.16.15.3` to `172.16.15.18` in the INSIDE zone.

### Static Route to External Network

```shell
route OUTSIDE 0.0.0.0 0.0.0.0 172.16.5.1
```

Sets the static default route pointing to router RA.

### NAT

```shell
object network DMZ-NET
host 172.16.20.3
nat (DMZ,OUTSIDE) static 172.16.5.3
```

Static NAT configured for PC-DMZ.

```shell
object network INSIDE-NET
subnet 172.16.15.0 255.255.255.0
nat (INSIDE,OUTSIDE) dynamic interface
```

Dynamic NAT configured for the internal network.

### Allow ICMP from Outside

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

This configuration allows pings from DMZ and INSIDE networks and enables receiving replies on the devices.

### Administrative Access

```shell
username admin password cisco
aaa authentication telnet console LOCAL
telnet 172.16.250.3 255.255.255.255 OUTSIDE
```

The ASA is configured to allow remote management from the SERVICES server IP. Note that Telnet is not recommended in production since it transmits in plain text.

## RA Router Configuration

A Cisco 2911 Router. The Site-to-Site VPN and OSPF are configured here.

### Interfaces and OSPF

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

OSPF authentication is enabled on the interface connecting to Router RB to prevent unauthorized neighbors.

```shell
router ospf 1
router-id 1.1.1.1
network 172.16.100.0 0.0.0.3 area 0
network 172.16.10.0 0.0.0.255 area 0
network 172.16.5.0 0.0.0.255 area 0
passive-interface g0/0
passive-interface g0/1
```

Interfaces connecting to FW-ASA and PC-VPN are set as passive.

### Site-to-Site VPN

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

Steps to configure the VPN:

- ACLs created
- ISAKMP configured with key `ciscovpn` for peer `172.16.200.1`
- IPsec configured with AES encryption
- IPsec policy applied toward peer `172.16.200.1`, traffic matching ACL 110 will be encrypted
- Configuration applied to Serial 0/0/0 interface

## RB Router Configuration

The most important thing here is that OSPF is running correctly.

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

## RC Router Configuration

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

Interface configuration above, VPN configuration below. The difference here is the peer, which points to router RA, and the ACLs which are the mirror of RA's.

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

## Testing

## PC IP via DHCP

![PC IP DHCP](/images/fw_y_vpn/image2.png)

## Pings

### Ping from Inside PC to RA

![Ping PC INSIDE to RA](/images/fw_y_vpn/image3.png)

### Ping from DMZ PC to RA

![Ping PC DMZ to RA](/images/fw_y_vpn/image4.png)

## Telnet

### Telnet from Services to ASA

![Telnet Services to ASA](/images/fw_y_vpn/image5.png)

## VPN

The `show crypto ipsec sa` command is used to verify the VPN tunnel is working correctly.

### Router RA

![VPN 172.16.5.0/24 - 172.16.250.0/24](/images/fw_y_vpn/image6.png)
![VPN 172.16.10.0/24 - 172.16.250.0/24](/images/fw_y_vpn/image7.png)

### Router RC

![VPN 172.16.250.0/24 - 172.16.5.0/24](/images/fw_y_vpn/image8.png)
![VPN 172.16.250.0/24 - 172.16.10.0/24](/images/fw_y_vpn/image9.png)
