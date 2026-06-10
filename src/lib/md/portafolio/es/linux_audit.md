# Herramienta de Auditoría Linux CIS Benchmark

## Descripción General

Herramienta en Python que automatiza la auditoría de seguridad de sistemas Linux
contra el CIS (Center for Internet Security) Benchmark para Ubuntu 24.04. La herramienta
traduce scripts de auditoría en bash a checks estructurados en Python, produciendo
resultados en múltiples formatos para distintos casos de uso.

## Motivación

Los benchmarks CIS son el estándar de la industria para el hardening de sistemas Linux.
Los scripts de auditoría oficiales están escritos en bash, lo que dificulta agregar
resultados, automatizar reportes o integrarse con otras herramientas. Este proyecto
reimplementa esos checks en Python con salida estructurada, seguimiento de progreso
y múltiples formatos de exportación.

## Cómo Funciona

### 1. Carga de Contexto

Al inicio, la herramienta ejecuta un conjunto de comandos del sistema una sola vez
y almacena los resultados:

```python
def load_context():
    return {
        "lsmod": run_cmd(["lsmod"]),
        "modprobe_config": run_cmd(["modprobe", "--showconfig"]).splitlines(),
        "tmp": run_cmd(["findmnt", "-n", "/tmp"]),
        ...
    }
```

Esto evita ejecutar los mismos comandos costosos repetidamente en checks que
necesitan los mismos datos — por ejemplo, los 9 checks de módulos del kernel
comparten la misma salida de `lsmod` y `modprobe`.

### 2. Registro de Checks

Los checks se registran como lambdas en una lista, separando su definición de
su ejecución:

```python
{"section": "1.1.1.1", "profile": 1, "check": lambda: check_module("cramfs", context)},
```

Esto permite filtrar por sección o perfil antes de ejecutar cualquier cosa, y
permite al tracker de progreso mostrar qué check se está ejecutando actualmente.

### 3. Ejecución Diferida y Seguimiento de Progreso

Como los checks son lambdas, solo se ejecutan al ser llamados. El tracker de
progreso llama a cada uno individualmente mientras actualiza la terminal:

```python
for i, item in enumerate(checks, 1):
    print(f"\r[{i}/{total}] Sección {item['section']}...", end="", flush=True)
    result = item["check"]()
```

### 4. Resultados de los Checks

Cada check retorna un diccionario estandarizado:

```python
# check automatizado
{"check": "module_cramfs_disabled", "status": "FAIL", "detail": "cramfs no está en la blacklist"}

# check manual
{"check": "gpg_keys_configured", "status": "MANUAL", "detail": "Ejecutar con --manual para correr"}

# omitido por permisos
{"check": "apparmor_at_bootloader", "status": "SKIPPED", "detail": "Permiso denegado: /boot/grub/grub.cfg - ejecutar con sudo"}
```

### 5. Formatos de Salida

Los resultados pasan por formateadores que producen distintos tipos de salida:

- **Texto** — salida legible en terminal con flag opcional `--fail-only`
- **JSON** — legible por máquinas, útil para integración con otras herramientas
- **CSV** — compatible con hojas de cálculo para rastrear hallazgos a lo largo del tiempo
- **HTML** — reporte visual con estados codificados por color y contadores de resumen

## Desafíos Técnicos

### Traducir Bash a Python

Los scripts de auditoría CIS originales usan características de bash que requieren
una traducción cuidadosa:

**Bash:**

```bash
modprobe --showconfig | grep -P '\b(install|blacklist)\h+'"${l_mod_chk_name//-/_}"'\b'
```

**Python:**

```python
re.search(rf"\b(install|blacklist)\s+{mod_chk_name}\b", line)
```

Diferencias clave:

- `\h` (espacio horizontal) en regex Perl se convierte en `\s` en Python
- `${var//-/_}` (reemplazo de cadena en bash) se convierte en `.replace("-", "_")`
- Las pipelines de shell se convierten en llamadas a funciones encadenadas

### El Problema con el Cierre de Lambdas

Al generar checks en un bucle, todas las lambdas capturarían el mismo valor
final de la variable del bucle sin un argumento por defecto:

```python
# incorrecto - todas las lambdas usan el último valor de m
[lambda: check_module(m, context) for m in modules]

# correcto - cada lambda captura su propio valor
[lambda m=m: check_module(m, context) for m in modules]
```

### Manejo de Permisos

Algunos checks requieren acceso root. En lugar de fallar, la herramienta retorna
un estado `SKIPPED` con un mensaje claro:

```python
try:
    apparmor = get_lines_missing_key("apparmor=1", r"^\s*linux", "/boot/grub/grub.cfg")
except PermissionError:
    return permission_denied_result("apparmor_at_bootloader", "/boot/grub/grub.cfg")
```

## Secciones Cubiertas

### 1.1 — Sistema de Archivos

Verifica que los módulos del kernel de sistemas de archivos no utilizados estén
deshabilitados (no cargados, en blacklist y no cargables) y que las particiones
críticas como `/tmp`, `/var`, `/home` estén montadas con opciones de seguridad
apropiadas (`nodev`, `nosuid`, `noexec`).

### 1.2 — Gestor de Paquetes

Verifica la configuración de claves GPG y las actualizaciones de paquetes disponibles.
Estos son checks manuales ya que requieren criterio humano para verificar su correctitud.

### 1.3 — AppArmor

Verifica que AppArmor esté instalado, habilitado a nivel de bootloader mediante
parámetros de GRUB (`apparmor=1 security=apparmor`), y que los perfiles estén
cargados y en modo enforcing.

### 1.4 — Bootloader

Verifica que GRUB tenga una contraseña configurada y que el archivo de configuración
tenga los permisos correctos.

### 1.5 — Hardening de Procesos

Verifica los parámetros del kernel para ASLR (`kernel.randomize_va_space=2`),
alcance de ptrace, restricciones de coredump, y que herramientas como `prelink`
y `apport` no estén habilitadas.

### 1.6 — Banners de Advertencia

Verifica que `/etc/motd`, `/etc/issue` y `/etc/issue.net` estén configurados
sin información de fingerprinting del sistema operativo y tengan los permisos correctos.

### 1.7 — GDM

Si el gestor de pantalla GNOME está instalado, verifica el banner de inicio de sesión,
visibilidad de la lista de usuarios, tiempo de bloqueo de pantalla, configuración
de automontaje y que XDMCP esté deshabilitado.

## Hallazgos Reales

La ejecución contra una VM Ubuntu 24.04 nueva reveló varios hallazgos:

| Sección | Hallazgo                                               |
| ------- | ------------------------------------------------------ |
| 1.1.1.x | Todos los módulos de sistema de archivos sin blacklist |
| 1.1.2.x | Sin particiones separadas para `/tmp`, `/var`, `/home` |
| 1.3.1.2 | AppArmor ausente en las entradas de arranque de GRUB   |
| 1.4.1   | Sin contraseña de GRUB configurada                     |
| 1.5.1   | ASLR no configurado en config persistente              |
| 1.5.3   | Coredumps sin restricción                              |
| 1.6.2   | `/etc/issue` contiene información de fingerprinting    |

Estos son resultados esperados en una instalación por defecto — el benchmark
existe precisamente para identificar y remediar estas brechas.

## Código Fuente

[github.com/diegoGUrra/linux-audit](https://github.com/diegoGUrra/linux-audit)
