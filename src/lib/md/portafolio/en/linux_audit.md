# Linux CIS Benchmark Audit Tool

## Overview

A Python tool that automates security auditing of Linux systems against the
CIS (Center for Internet Security) Ubuntu 24.04 Benchmark. The tool translates
complex bash audit scripts into structured Python checks, producing results in
multiple formats for different use cases.

## Motivation

CIS benchmarks are the industry standard for Linux system hardening. The official
audit scripts are written in bash, which makes it difficult to aggregate results,
automate reporting, or integrate with other tools. This project reimplements those
checks in Python with structured output, progress tracking, and multiple export formats.

## How It Works

### 1. Context Loading

At startup the tool runs a set of system commands once and stores the results:

```python
def load_context():
    return {
        "lsmod": run_cmd(["lsmod"]),
        "modprobe_config": run_cmd(["modprobe", "--showconfig"]).splitlines(),
        "tmp": run_cmd(["findmnt", "-n", "/tmp"]),
        ...
    }
```

This avoids running the same expensive commands repeatedly across checks that
need the same data — for example all 9 kernel module checks share the same
`lsmod` and `modprobe` output.

### 2. Check Registry

Checks are registered as lambdas in a list, separating their definition from
their execution:

```python
{"section": "1.1.1.1", "profile": 1, "check": lambda: check_module("cramfs", context)},
```

This allows filtering by section or profile before running anything, and enables
the progress tracker to show which check is currently running.

### 3. Deferred Execution & Progress Tracking

Since checks are lambdas they only execute when called. The progress tracker
calls each one individually while updating the terminal:

```python
for i, item in enumerate(checks, 1):
    print(f"\r[{i}/{total}] Section {item['section']}...", end="", flush=True)
    result = item["check"]()
```

### 4. Check Results

Every check returns a standardized dictionary:

```python
# automated check
{"check": "module_cramfs_disabled", "status": "FAIL", "detail": "cramfs is not blacklisted"}

# manual check
{"check": "gpg_keys_configured", "status": "MANUAL", "detail": "Run with --manual to execute"}

# skipped due to permissions
{"check": "apparmor_at_bootloader", "status": "SKIPPED", "detail": "Permission denied: /boot/grub/grub.cfg - run with sudo"}
```

### 5. Output Formats

Results are passed through formatters that produce different output types:

- **Text** — human readable terminal output with optional `--fail-only` flag
- **JSON** — machine readable, useful for integration with other tools
- **CSV** — spreadsheet friendly for tracking findings over time
- **HTML** — visual report with color coded statuses and summary counters

## Technical Challenges

### Translating Bash to Python

The original CIS audit scripts use bash features that require careful translation:

**Bash:**

```bash
modprobe --showconfig | grep -P '\b(install|blacklist)\h+'"${l_mod_chk_name//-/_}"'\b'
```

**Python:**

```python
re.search(rf"\b(install|blacklist)\s+{mod_chk_name}\b", line)
```

Key differences:

- `\h` (horizontal whitespace) in Perl regex becomes `\s` in Python
- `${var//-/_}` (bash string replacement) becomes `.replace("-", "_")`
- Shell pipelines become chained function calls

### Lambda Closure Gotcha

When generating checks in a loop, all lambdas would capture the same final
loop variable without a default argument:

```python
# wrong - all lambdas use last value of m
[lambda: check_module(m, context) for m in modules]

# correct - each lambda captures its own value
[lambda m=m: check_module(m, context) for m in modules]
```

### Permission Handling

Some checks require root access. Rather than crashing, the tool returns a
`SKIPPED` status with a clear message:

```python
try:
    apparmor = get_lines_missing_key("apparmor=1", r"^\s*linux", "/boot/grub/grub.cfg")
except PermissionError:
    return permission_denied_result("apparmor_at_bootloader", "/boot/grub/grub.cfg")
```

## Sections Covered

### 1.1 — Filesystem

Verifies that unused filesystem kernel modules are disabled (not loaded,
blacklisted, and not loadable) and that critical partitions like `/tmp`,
`/var`, `/home` are mounted with appropriate security options (`nodev`,
`nosuid`, `noexec`).

### 1.2 — Package Manager

Checks GPG key configuration and available package updates. These are manual
checks since they require human judgment to verify correctness.

### 1.3 — AppArmor

Verifies AppArmor is installed, enabled at bootloader level via GRUB parameters
(`apparmor=1 security=apparmor`), and that profiles are loaded and enforcing.

### 1.4 — Bootloader

Checks that GRUB has a password set and that the configuration file has
correct permissions.

### 1.5 — Process Hardening

Verifies kernel parameters for ASLR (`kernel.randomize_va_space=2`), ptrace
scope, coredump restrictions, and that tools like `prelink` and `apport`
are not enabled.

### 1.6 — Warning Banners

Checks that `/etc/motd`, `/etc/issue` and `/etc/issue.net` are configured
without OS fingerprinting information and have correct permissions.

### 1.7 — GDM

If the GNOME display manager is installed, verifies login banner, user list
visibility, screen lock timeout, automount settings and XDMCP is disabled.

## Real Findings

Running against a fresh Ubuntu 24.04 VM revealed several findings:

| Section | Finding                                            |
| ------- | -------------------------------------------------- |
| 1.1.1.x | All filesystem modules unblacklisted               |
| 1.1.2.x | No separate partitions for `/tmp`, `/var`, `/home` |
| 1.3.1.2 | AppArmor missing from GRUB boot entries            |
| 1.4.1   | No GRUB password set                               |
| 1.5.1   | ASLR not set in persistent config                  |
| 1.5.3   | Coredumps not restricted                           |
| 1.6.2   | `/etc/issue` contains OS fingerprinting info       |

These are expected on a default installation — the benchmark exists precisely
to identify and remediate these gaps.

## Source Code

[github.com/diegoGUrra/linux-audit](https://github.com/diegoGUrra/linux-audit)
