# **Servidor y cliente de FTP en Python con Sockets**

Este proyecto implementa un servidor y cliente tipo FTP completamente funcionales en Python. El cliente permite subir archivos, descargarlos, listar contenidos (**LS**) y cambiar de directorio, mientras que el servidor puede administrar clientes conectados, expulsarlos (**kick**), cerrar el servidor y manejar múltiples conexiones simultáneas mediante hilos.

## **Objetivo del proyecto**

El proyecto fue desarrollado para demostrar cómo dos programas pueden comunicarse entre sí utilizando sockets.  
Permite enviar y recibir archivos y mensajes, sirviendo como base para aplicaciones de red más complejas.
**¿Para qué fue creado?**

Principalmente para aprender conceptos fundamentales de redes:

- Uso de sockets
- Manejo de conexiones cliente-servidor
- Envío y recepción de datos
- Transferencia de archivos
- Procesamiento concurrente mediante hilos

## **Características Principales**

- Comunicación cliente-servidor mediante códigos.
- Autenticación de usuarios.
- Soporte para múltiples clientes simultáneos.
- Acciones administrativas desde la consola del servidor.
- Gestión de hilos para cada cliente.
- Bloqueos para evitar condiciones de carrera.
- Comandos del servidor: `list`, `kick`, `exit`.
- Comandos del cliente: `cd`, `salir`, `subir`, `listar`, `descargar`.
- Autocompletado interactivo en el cliente (readline).

## **Arquitectura / Diseño Técnico**

### **Lenguaje y Librerias:**

- Python 3
- `argparse` — manejo de argumentos en CLI
- `json` — envio/recepción de datos estructurados
- `readline` — autocompletado en el cliente
- `socket` — comunicación en red
- `sys` — cierre del programa
- `getpass` — entrada de contraseñas sin mostrar
- `threading` — manejo de múltiples clientes
- `os.path` — validación de rutas seguras

### **Componentes principales:**

Ambos componentes están implementados en un solo archivo Python, organizados por clases.

- **Cliente:**  
   Interactúa con el servidor FTP. Puede iniciar sesión, listar contenido, cambiar directorio, subir y descargar archivos, y desconectarse.
- **Servidor:**  
   Expone un directorio raíz para que los clientes puedan interactuar con los archivos.  
   Asigna un hilo por cliente y ofrece comandos administrativos (`kick`, `list`, `exit`).

### **Flujo general de datos**

- El servidor inicia y queda escuchando conexiones.
- El cliente se conecta al servidor por un socket de control.
- El servidor envía un mensaje inicial y espera respuesta.
- El cliente responde y espera el siguiente comando.
- El ciclo continúa hasta que una de las partes cierra la conexión.

## **Retos Técnicos y Soluciones**

### **1. Sockets quedaban colgados**

Los sockets quedaban en estado **TIME_WAIT**, impidiendo reiniciar el servidor inmediatamente.  
La solución fue habilitar:

```python
socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
```

Permitió reutilizar el puerto sin esperar varios segundos.

### **2. Socket de datos efímero (estilo FTP)**

Para evitar mezclar comandos con datos binarios, implementé un segundo socket temporal, igual que FTP:

- El canal principal es para comandos.
- Un socket aparte se abre solo para enviar/recibir archivos o listas.
- Ese socket se destruye inmediatamente después.

**Beneficios:**

- El canal de control siempre está libre.
- No se mezclan comandos y archivos.
- La arquitectura es más limpia y escalable.

### **3. Prevención de Path Traversal**

Para impedir que un cliente navegue fuera del `root_dir`, cada operación de cambio de directorio (`cd`) valida la ruta final:

- Se convierte la ruta a absoluta.
- Se compara con `root_dir` usando `os.path.commonpath`.
- Si no pertenece a la misma base, se bloquea la petición.

Ejemplo de la validación:

```python
...
if path.commonpath([self.root_dir, next_dir]) != self.root_dir:
 self.send_message(conn, "ACCESS_DENIED")
 return curr_dir
```

Esto evita rutas maliciosas como `../../etc/passwd`.

### 4. Permitir multiples clientes

Para permitir múltiples clientes simultáneos evalué dos enfoques:

1. **Usar funciones asíncronas con `asyncio`**
2. **Crear un hilo por cliente utilizando `threading`**

Finalmente elegí la segunda opción porque:

- Es más intuitiva para este tipo de proyecto.
- Encaja mejor con un servidor estilo FTP tradicional.
- El código queda más simple y más alineado con el flujo secuencial de comandos.
- No requiere reescribir toda la lógica usando `await`, lo cual en una primera versión podría añadir complejidad innecesaria.

Además, agregué un hilo dedicado exclusivamente a la consola interna del servidor, permitiendo al administrador ejecutar comandos (`list`, `kick`, `exit`) sin bloquear la atención de las conexiones entrantes.

El esquema general queda así:

```python
# consola
threading.Thread(target=self.console, daemon=True).start()
while self.running:
 ...
  conn, addr = self.server_socket.accept()
 ...
 # Hilo por cliente que se conecte
 threading.Thread(
  target=self.handle_client, args=(conn, addr), daemon=True
 ).start()
```

#### **Explicación del funcionamiento**

- El hilo principal se queda esperando conexiones con `accept()`.
- Cada vez que un cliente se conecta, se crea un nuevo hilo que ejecuta `handle_client()`.
- Ese hilo queda completamente aislado y dedicado a:
  - manejar mensajes del cliente,
  - validar rutas,
  - abrir sockets de datos,
  - enviar y recibir archivos,
  - cerrar la sesión cuando el cliente se desconecta.
- Paralelamente, el hilo de la consola del servidor se mantiene activo esperando comandos del administrador.

Esto permite

- Atender múltiples clientes al mismo tiempo.
- Listar clientes activos sin detener al servidor.
- Expulsar clientes específicos (`kick`).
- Apagar el servidor de forma ordenada (`exit`).

#### Ventajas del modelo basado en hilos

- Concurrencia real en cada conexión.
- Fácil de extender y depurar.
- Permite agregar nuevas funciones sin romper el flujo (p. ej., logs por cliente, throttling, etc.).

Si luego el servidor creciera demasiado, podría migrarse a un modelo híbrido o a `asyncio`, pero para este caso, este enfoque era ideal.

## **Ejecución del programa**

- **Servidor**

```bash
python3 ftp_server.py server
```

Ver ayuda:

```bash
python3 ftp_server.py server --h
usage: Servidor FTP server [-h] [-H HOST] [-C CONTROL_PORT] [-D DATA_PORT] [-R ROOT_DIR]

options:
 -h, --help            show this help message and exit
 -H, --host HOST       IP de Host
 -C, --control_port CONTROL_PORT
                       Puerto de control
 -D, --data_port DATA_PORT
                       Puerto de data
 -R, --root_dir ROOT_DIR
                       raiz de directorio
```

- **Cliente**

```bash
python3 ftp_server.py client 192.168.1.104
```

Ver ayuda:

```bash
python3 ftp_server.py client --h
usage: Servidor FTP client [-h] [-p PORT] target_ip

positional arguments:
 target_ip             IP del servidor al cual conectarse

options:
 -h, --help            show this help message and exit
 -p PORT, --port PORT  Puerto de control
```

### Login

- **Cliente**

```bash
220 - Bienvenido al servidor FTP
USUARIO: diego
331 - Usuario correcto, ingrese la clave
PASS:  
230 - Login exitoso
```

- **Servidor**

```bash
Iniciando Servidor en 0.0.0.0: 5000
ftp> Se conectó ('127.0.0.1', 33270), en path: /home/diegog
Comandos: list, kick <id> y exit
ftp> list
ID: 0, Addr: ('127.0.0.1', 33270), User: diego
```

y con multiple usuarios:

```bash
ftp> list
ID: 0, Addr: ('192.168.1.93', 38106), User: diego
ID: 1, Addr: ('127.0.0.1', 40706), User: diego
```

### Listar

```bash
ftp> listar
150 - Preparado para recibir datos
226 - Transferencia completada


nvim-notes.txt
ftp_python
src
diegogurra.github.io
ftp>
```

Carpetas en azul, archivos en blanco:

```python
def ls(self, s, port):
 ...
 if message["code"] == 226:
  for e in data.values():
   if e["isDir"]:
    print(f"{bcolors['OKBLUE']}{e['name']}{bcolors['ENDC']}")
   else:
    print(f"{e['name']}")
```

Códigos de error en rojo e informativos en verde:

```python
def recv_message(self, s):
        """
        Receives a json messages decodes it and print it formated code - message
        """
        data = s.recv(BUFFER_SIZE)
        message = json.loads(data.decode())
        color = bcolors['FAIL'] if message['code']>=500 or message['code'] == 421  else bcolors['OKGREEN']
        print(f"{color}{message['code']} - {message['message']}{bcolors['ENDC']}")
        return message
```

> esto nos dejaria todos los mensajes con codigo 500 o el 421 como color rojo.
> Ya que estos son errores o que algo no funcionó correctamente.

Aquí un pantallazo de como se veria en la consola:
![pantallazo ftp](/images/ftp_server/image1.png)

### Cambiar Directorio

Ejemplos de seguridad:

```bash
ftp> cd ..
550 - Acceso denegado
ftp> cd /etc/
550 - Acceso denegado
```

Otras pruebas

```bash
550 - Acceso denegado
ftp> cd /Projects/ftp_python
550 - No es directorio
ftp> cd projects
550 - No es directorio
ftp> cd Projects/ftp_python
250 - Directorio cambiado correctamente
```

Aquí un screenshot del mismo funcionamiento:
![cambio de directorio](/images/ftp_server/image2.png)

### Descargar archivo

Para la descarga de archivos, el cliente debe enviar el comando `descargar <nombre_archivo>`.
El servidor entonces abre un **socket de datos efímero**,
envía el archivo en binario y cierra ese socket apenas termina la transferencia.
Primero confirmamos qué archivos tiene el cliente antes de ejecutar la descarga:

```bash
diegog@diegopi:~/projects $ ls
dir1  ftp_server.py  __pycache__  socket...
```

Iniciamos el programa y vamos a la carpeta Projects/ftp_python

```bash
diegog@diegopi:~/projects $ python3 ftp_server.py client 192.168.1.104
220 - Bienvenido al servidor FTP
USUARIO: diego
331 - Usuario correcto, ingrese la clave
PASS:  
230 - Login exitoso
ftp> cd Projects/ftp_python
250 - Directorio cambiado correctamente
ftp> listar
150 - Preparado para recibir datos
226 - Transferencia completada

prueba.txt
ftp_server.py
LICENSE
.git
.gitignore
```

Descargamos el archivo prueba.txt

```bash
ftp> DESCARGAR prueba.txt
150 - Preparado para recibir datos
Intentando conexión en 192.168.1.104 - 5050
226 - Transferencia completada
```

Volvemos a la terminal y verificamos si se descargó y realizamos un shasum para ver si concuerda con el archivo del servidor.

```bash
diegog@diegopi:~/projects $ ls
dir1  ftp_server.py  prueba.txt  __pycache__  socket_conn.py  todo.txt
diegog@diegopi:~/projects $ shasum prueba.txt  
dac5f31099fdd3d2252e5b5814103498020d2d41  prueba.txt
```

Desde el PC del servidor.

```bash
diegog@Diego-PC ~/Projects/ftp_python (git)-[main] % shasum prueba.txt  
dac5f31099fdd3d2252e5b5814103498020d2d41  prueba.txt
```

Esto nos verifica que se ha descargado de forma integra el archivo.

El flujo fue:

1. Cliente ejecuta `descargar prueba.txt`
2. Servidor valida que el archivo exista en el directorio actual del cliente
3. Servidor abre un socket de datos efímero (puerto temporal)
4. Envía el archivo en chunks configurados por `BUFFER_SIZE`
5. Cierra el socket y envía un mensaje `226 - Transferencia completada`
6. Cliente guarda el archivo en su directorio local

### Subir archivo

Para subir archivos, se usa el comando `subir <archivo>`.  
Este proceso es simétrico al de descarga, pero a la inversa:

1. Cliente verifica que el archivo exista en su sistema
2. Cliente abre un socket de datos hacia el servidor
3. Envía el archivo en binario
4. Servidor guarda el archivo en la carpeta del usuario
5. Servidor responde con un código `226`

Ejemplo:

```bash
diegog@diegopi:~/projects $ python3 ftp_server.py client 192.168.1.104
220 - Bienvenido al servidor FTP
USUARIO: diego
331 - Usuario correcto, ingrese la clave
PASS:  
230 - Login exitoso
ftp> cd Projects/ftp_python
250 - Directorio cambiado correctamente
ftp> SUBIR prueba_subir.txt
150 - Preparado para recibir datos
Intentando conexión en 192.168.1.104 - 5050
226 - Transferencia completada
```

Comprobación de shasum:
En PC cliente:

```bash
diegog@diegopi:~/projects $ shasum prueba_subir.txt  
7e7e756270ceaa9f444e9ec9512e6a20e1ac7c41  prueba_subir.txt
```

En PC servidor:

```bash
diegog@Diego-PC ~/Projects/ftp_python (git)-[main] % shasum prueba_subir.txt  
7e7e756270ceaa9f444e9ec9512e6a20e1ac7c41  prueba_subir.txt
```

Tambien podemos observar que son el mismo archivo.

### Desconectarse y kick

Por parte del cliente:

```bash
diegog@diegopi:~/projects $ python3 ftp_server.py client 192.168.1.104
220 - Bienvenido al servidor FTP
USUARIO: diego
331 - Usuario correcto, ingrese la clave
PASS:  
230 - Login exitoso
ftp> SALIR
221 - Cerrando conexión
```

Ademas podemos kickear a usuarios por el servidor:

```bash
Comandos: list, kick <id> y exit
ftp> list
ID: 0, Addr: ('192.168.1.93', 49842), User: diego
ftp> kick 0
Expulsado el cliente {'addr': ('192.168.1.93', 49842), 'user': 'diego', 'logged': True, 'conn': <socket.socket fd=4, family=2, type=1, proto=0, laddr=('192.168.1.104', 5000), raddr=('192.16
8.1.93', 49842)>}
ftp> list
ftp>
```

## **Conclusiones**

El proyecto cumplió con su objetivo principal: comprender y aplicar los conceptos fundamentales de la programación con sockets, el intercambio de mensajes mediante códigos de estado y la gestión básica de clientes en un servidor.  
La experiencia permitió entender de forma práctica cómo funciona un protocolo sencillo de transferencia de archivos y cómo se coordinan canales de control y datos, tal como ocurre en FTP.

Si bien el resultado es funcional, sigue siendo un programa básico. Tiene mucho espacio para crecer, aunque no es mi intención expandirlo más allá de esta versión, ya que el propósito era únicamente experimentar con estos conceptos.

### **Puntos de mejora identificados**

- Mejorar la consola tanto del cliente como del servidor, e implementar un autocompleter más robusto.
- Migrar el modelo de concurrencia de hilos a uno asincrónico para evitar depender del número de threads del sistema.
- Permitir la subida y descarga de directorios completos.
- Implementar logs más detallados y estructurados en el servidor.
- Cifrar la comunicación para evitar que sea vulnerable a ataques de sniffing.
- Agregar más funcionalidades típicas del protocolo FTP.

Finalmente, aunque este enfoque con sockets es útil para aprender, en un entorno real puede ser más eficiente y práctico implementar un servidor HTTP para la transferencia de archivos. HTTP ofrece herramientas más modernas, una interacción más simple con archivos y directorios, y compatibilidad inmediata con navegadores, lo cual facilita bastante la experiencia de usuario y el mantenimiento del sistema.

## **Repositorio**

<https://github.com/DiegoGUrra/ftp_python>
