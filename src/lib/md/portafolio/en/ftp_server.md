# FTP Server and Client in Python with Sockets

This project implements a fully functional FTP-like server and client in Python. The client supports uploading files, downloading them, listing directory contents (**LS**) and changing directories, while the server can manage connected clients, kick them, shut down, and handle multiple simultaneous connections using threads.

## Project Goal

The project was developed to demonstrate how two programs can communicate with each other using sockets.
It allows sending and receiving files and messages, serving as a foundation for more complex network applications.

**Why was it created?**

Primarily to learn fundamental networking concepts:

- Socket usage
- Client-server connection handling
- Sending and receiving data
- File transfer
- Concurrent processing using threads

## Main Features

- Client-server communication via status codes.
- User authentication.
- Support for multiple simultaneous clients.
- Administrative actions from the server console.
- Thread management per client.
- Locks to prevent race conditions.
- Server commands: `list`, `kick`, `exit`.
- Client commands: `cd`, `salir` (quit), `subir` (upload), `listar` (list), `descargar` (download).
- Interactive autocomplete on the client side (readline).

## Architecture / Technical Design

### Language and Libraries

- Python 3
- `argparse` — CLI argument handling
- `json` — structured data send/receive
- `readline` — client autocomplete
- `socket` — network communication
- `sys` — program exit
- `getpass` — password input without display
- `threading` — multiple client handling
- `os.path` — safe path validation

### Main Components

Both components are implemented in a single Python file, organized by classes.

- **Client:**
  Interacts with the FTP server. Can log in, list contents, change directory, upload and download files, and disconnect.
- **Server:**
  Exposes a root directory for clients to interact with files.
  Assigns one thread per client and provides administrative commands (`kick`, `list`, `exit`).

### General Data Flow

- The server starts and listens for connections.
- The client connects to the server via a control socket.
- The server sends an initial message and waits for a response.
- The client responds and waits for the next command.
- The cycle continues until one side closes the connection.

## Technical Challenges and Solutions

### 1. Hanging Sockets

Sockets were left in **TIME_WAIT** state, preventing the server from restarting immediately.
The solution was to enable:

```python
socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
```

This allows reusing the port without waiting several seconds.

### 2. Ephemeral Data Socket (FTP-style)

To avoid mixing commands with binary data, I implemented a second temporary socket, just like FTP:

- The main channel is for commands.
- A separate socket is opened only to send/receive files or directory listings.
- That socket is destroyed immediately after the transfer.

**Benefits:**

- The control channel is always free.
- Commands and files are never mixed.
- The architecture is cleaner and more scalable.

### 3. Path Traversal Prevention

To prevent a client from navigating outside `root_dir`, every directory change (`cd`) validates the final path:

- The path is converted to absolute.
- It is compared against `root_dir` using `os.path.commonpath`.
- If it doesn't belong to the same base, the request is blocked.

Validation example:

```python
...
if path.commonpath([self.root_dir, next_dir]) != self.root_dir:
    self.send_message(conn, "ACCESS_DENIED")
    return curr_dir
```

This prevents malicious paths like `../../etc/passwd`.

### 4. Supporting Multiple Clients

To support multiple simultaneous clients I evaluated two approaches:

1. **Using async functions with `asyncio`**
2. **Creating one thread per client using `threading`**

I chose the second option because:

- It is more intuitive for this type of project.
- It fits better with a traditional FTP-style server.
- The code is simpler and more aligned with the sequential command flow.
- It doesn't require rewriting all the logic using `await`, which in a first version could add unnecessary complexity.

I also added a thread dedicated exclusively to the server's internal console, allowing the administrator to run commands (`list`, `kick`, `exit`) without blocking incoming connections.

The general scheme:

```python
# console thread
threading.Thread(target=self.console, daemon=True).start()
while self.running:
    ...
    conn, addr = self.server_socket.accept()
    ...
    # One thread per connected client
    threading.Thread(
        target=self.handle_client, args=(conn, addr), daemon=True
    ).start()
```

#### How It Works

- The main thread waits for connections with `accept()`.
- Each time a client connects, a new thread is created running `handle_client()`.
- That thread is completely isolated and dedicated to:
  - handling client messages,
  - validating paths,
  - opening data sockets,
  - sending and receiving files,
  - closing the session when the client disconnects.
- In parallel, the server console thread stays active waiting for admin commands.

This allows:

- Serving multiple clients at the same time.
- Listing active clients without stopping the server.
- Kicking specific clients (`kick`).
- Shutting down the server gracefully (`exit`).

#### Advantages of the Thread-Based Model

- Real concurrency per connection.
- Easy to extend and debug.
- New features can be added without breaking the flow (e.g. per-client logs, throttling, etc.).

If the server were to grow significantly, it could be migrated to a hybrid model or `asyncio`, but for this case this approach was ideal.

## Running the Program

- **Server**

```bash
python3 ftp_server.py server
```

Help:

```bash
python3 ftp_server.py server --h
usage: FTP Server server [-h] [-H HOST] [-C CONTROL_PORT] [-D DATA_PORT] [-R ROOT_DIR]

options:
  -h, --help            show this help message and exit
  -H, --host HOST       IP de Host
  -C, --control_port CONTROL_PORT
                        Puerto de control
  -D, --data_port DATA_PORT
                        Puerto de data
  -R, --root_dir ROOT_DIR
                        raiz de directorio
```

- **Client**

```bash
python3 ftp_server.py client 192.168.1.104
```

Help:

```bash
python3 ftp_server.py client --h
usage: FTP Server client [-h] [-p PORT] target_ip

positional arguments:
  target_ip             IP del servidor al cual conectarse

options:
  -h, --help            show this help message and exit
  -p PORT, --port PORT  Puerto de control
```

### Login

- **Client**

```bash
220 - Bienvenido al servidor FTP
USER: diego
331 - Usuario correcto, ingrese la clave
PASS:
230 - Login exitoso
```

- **Server**

```bash
Iniciando Servidor en 0.0.0.0: 5000
ftp> Se conectó ('127.0.0.1', 33270), en path: /home/diegog
Comandos: list, kick <id> y exit
ftp> list
ID: 0, Addr: ('127.0.0.1', 33270), User: diego
```

With multiple users:

```bash
ftp> list
ID: 0, Addr: ('192.168.1.93', 38106), User: diego
ID: 1, Addr: ('127.0.0.1', 40706), User: diego
```

### List Directory

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

Folders in blue, files in white:

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

Error codes in red, informational in green:

```python
def recv_message(self, s):
    """
    Receives a json message, decodes it and prints it formatted as code - message
    """
    data = s.recv(BUFFER_SIZE)
    message = json.loads(data.decode())
    color = bcolors['FAIL'] if message['code'] >= 500 or message['code'] == 421 else bcolors['OKGREEN']
    print(f"{color}{message['code']} - {message['message']}{bcolors['ENDC']}")
    return message
```

> Any message with code 500 or 421 is shown in red, as these represent errors or failed operations.

Screenshot of the console output:
![ftp screenshot](/images/ftp_server/image1.png)

### Change Directory

Security examples:

```bash
ftp> cd ..
550 - Access denied
ftp> cd /etc/
550 - Access denied
```

Other tests:

```bash
550 - Acceso denegado
ftp> cd /Projects/ftp_python
550 - No es directorio
ftp> cd projects
550 - No es directorio
ftp> cd Projects/ftp_python
250 - Directorio cambiado correctamente
```

Screenshot of the same behavior:
![directory change](/images/ftp_server/image2.png)

### Download File

To download a file, the client sends the command `descargar <filename>`.
The server then opens an **ephemeral data socket**, sends the file in binary and closes that socket as soon as the transfer ends.
First we confirm what files the client has before running the download:

```bash
diegog@diegopi:~/projects $ ls
dir1  ftp_server.py  __pycache__  socket...
```

Start the program and navigate to Projects/ftp_python:

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

Download prueba.txt:

```bash
ftp> DESCARGAR prueba.txt
150 - Preparado para recibir datos
Intentando conexión en 192.168.1.104 - 5050
226 - Transferencia completada
```

Back in the terminal, verify the download and run shasum to confirm it matches the server file:

```bash
diegog@diegopi:~/projects $ ls
dir1  ftp_server.py  prueba.txt  __pycache__  socket_conn.py  todo.txt
diegog@diegopi:~/projects $ shasum prueba.txt
dac5f31099fdd3d2252e5b5814103498020d2d41  prueba.txt
```

From the server PC:

```bash
diegog@Diego-PC ~/Projects/ftp_python (git)-[main] % shasum prueba.txt
dac5f31099fdd3d2252e5b5814103498020d2d41  prueba.txt
```

The matching checksums confirm the file was transferred with full integrity.

The flow was:

1. Client runs `download prueba.txt`
2. Server validates the file exists in the client's current directory
3. Server opens an ephemeral data socket (temporary port)
4. Sends the file in chunks configured by `BUFFER_SIZE`
5. Closes the socket and sends `226 - Transfer complete`
6. Client saves the file to its local directory

### Upload File

To upload a file, use the command `upload <filename>`.
This process is symmetric to the download, but in reverse:

1. Client verifies the file exists on its system
2. Client opens a data socket to the server
3. Sends the file in binary
4. Server saves the file to the user's folder
5. Server responds with code `226`

Example:

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

Shasum verification on client PC:

```bash
diegog@diegopi:~/projects $ shasum prueba_subir.txt
7e7e756270ceaa9f444e9ec9512e6a20e1ac7c41  prueba_subir.txt
```

On server PC:

```bash
diegog@Diego-PC ~/Projects/ftp_python (git)-[main] % shasum prueba_subir.txt
7e7e756270ceaa9f444e9ec9512e6a20e1ac7c41  prueba_subir.txt
```

The checksums match, confirming the upload was successful.

### Disconnect and Kick

From the client side:

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

From the server, kicking a client:

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

## Conclusions

The project achieved its main goal: understanding and applying the fundamental concepts of socket programming, status code message exchange and basic client management on a server.
The experience provided practical insight into how a simple file transfer protocol works and how control and data channels are coordinated, just as in FTP.

While the result is functional, it remains a basic program with plenty of room to grow, though expanding it further was never the intention — the purpose was purely to experiment with these concepts.

### Identified Improvements

- Improve both the client and server consoles, and implement a more robust autocompleter.
- Migrate the concurrency model from threads to async to avoid depending on the system's thread count.
- Support uploading and downloading entire directories.
- Implement more detailed and structured server logs.
- Encrypt communication to prevent vulnerability to sniffing attacks.
- Add more typical FTP protocol features.

Finally, while this socket-based approach is useful for learning, in a real environment it may be more efficient and practical to implement an HTTP server for file transfer. HTTP offers more modern tooling, simpler interaction with files and directories, and immediate browser compatibility, which greatly improves the user experience and system maintainability.

## Repository

<https://github.com/DiegoGUrra/ftp_python>
