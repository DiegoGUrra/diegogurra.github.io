# Acceso no autorizado mediante phishing y keylogger

**Empresa:** CyberSafe Solutions (ficticia)

### Resumen del incidente

CyberSafe Solutions detectó un acceso no autorizado a información confidencial a través de la cuenta de un usuario, quien reportó actividad sospechosa. El análisis inicial reveló que las credenciales del usuario fueron comprometidas mediante un ataque de phishing, permitiendo que la cuenta fuera utilizada para extraer datos hacia una dirección IP externa.

### Análisis de la situación

El incidente parece haberse originado a partir de un ataque de phishing dirigido, mediante el cual se logró instalar un malware tipo keylogger en el equipo del usuario. Este tipo de malware registra la información ingresada por teclado y la envía al atacante, permitiendo la captura de credenciales y otros datos sensibles.

Una vez obtenidas estas credenciales, los atacantes accedieron a sistemas internos sin restricciones adicionales, debido a que la cuenta no contaba con autenticación multifactor (MFA).

Posteriormente, se identificó tráfico de datos inusual hacia una IP externa, lo que sugiere una posible exfiltración de información confidencial. La combinación de phishing, malware y ausencia de MFA facilitó un acceso no autorizado y persistente a la infraestructura interna, aumentando el riesgo para los activos críticos de la organización.

# Prueba de Metasploit

## I. Generación de Payload

Se creó un payload de malware utilizando `msfvenom` con `reverse_tcp`, apuntando a la máquina atacante y seleccionando un puerto no utilizado.

![Generación del Payload](/images/keylogger/Imagen1.png)

## II. Detección del Malware

Un escaneo en VirusTotal indicó que el archivo era detectado como malware por 59 motores antivirus.

![Detección de Malware](/images/keylogger/Imagen2.png)

## III. Distribución del Archivo Malicioso

El archivo se distribuyó mediante un servidor HTTP creado con Python.

![Creación de servidor HTTP](/images/keylogger/Imagen3.png)

## IV. Ejecución y Conexión Inversa

El payload establece un “shell inverso” hacia la máquina del atacante.
![Ejecución del archivo malicioso](/images/keylogger/Imagen4.png)
![Conexión en Metasploit](/images/keylogger/Imagen5.png)
![Sesión en Metasploit](/images/keylogger/Imagen6.png)

## V. Actividad del Keylogger

Con la sesión establecida, se puede observar la actividad del keylogger, capturando credenciales y otra información sensible.
![Keylogger en Metasploit](/images/keylogger/Imagen7.png)
