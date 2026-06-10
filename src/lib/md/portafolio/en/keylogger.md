# Unauthorized Access via Phishing and Keylogger

**Company:** CyberSafe Solutions (fictional)

### Incident Summary

CyberSafe Solutions detected unauthorized access to confidential information through a user account, after the user reported suspicious activity. Initial analysis revealed that the user's credentials were compromised via a phishing attack, allowing the account to be used to exfiltrate data to an external IP address.

### Situation Analysis

The incident appears to have originated from a targeted phishing attack, through which a keylogger malware was installed on the user's machine. This type of malware records keystrokes and sends them to the attacker, enabling the capture of credentials and other sensitive data.

Once these credentials were obtained, the attackers accessed internal systems without additional restrictions, as the account lacked multi-factor authentication (MFA).

Subsequently, unusual data traffic toward an external IP was identified, suggesting a possible exfiltration of confidential information. The combination of phishing, malware and the absence of MFA facilitated unauthorized and persistent access to the internal infrastructure, increasing the risk to the organization's critical assets.

# Metasploit Proof of Concept

## I. Payload Generation

A malware payload was created using `msfvenom` with `reverse_tcp`, pointing to the attacker's machine and selecting an unused port.

![Payload Generation](/images/keylogger/Imagen1.png)

## II. Malware Detection

A VirusTotal scan indicated the file was detected as malware by 59 antivirus engines.

![Malware Detection](/images/keylogger/Imagen2.png)

## III. Malicious File Distribution

The file was distributed via an HTTP server created with Python.

![HTTP Server Creation](/images/keylogger/Imagen3.png)

## IV. Execution and Reverse Connection

The payload establishes a reverse shell back to the attacker's machine.

![Malicious File Execution](/images/keylogger/Imagen4.png)

![Metasploit Connection](/images/keylogger/Imagen5.png)

![Metasploit Session](/images/keylogger/Imagen6.png)

## V. Keylogger Activity

With the session established, the keylogger activity can be observed, capturing credentials and other sensitive information.

![Keylogger in Metasploit](/images/keylogger/Imagen7.png)
