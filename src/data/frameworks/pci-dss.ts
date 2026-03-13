import type { Framework } from "@/types/framework";

export const pciDss: Framework = {
  id: "pci_dss",
  name: "PCI DSS v4.0",
  description: "Payment Card Industry Data Security Standard",
  version: "4.0",
  domains: [
    {
      id: "req1",
      name: "Req 1 — Install and Maintain Network Security Controls",
      controls: [
        { id: "1.1", name: "Processes and mechanisms for installing and maintaining network security controls are defined and understood", description: "All security policies and operational procedures identified in Requirement 1 are documented, kept up to date, in use, and known to all affected parties.", domain: "Req 1 — Install and Maintain Network Security Controls", framework: "pci_dss" },
        { id: "1.2", name: "Network security controls are configured and maintained", description: "Network security control configurations are defined, implemented, and maintained to restrict inbound and outbound network traffic to that which is necessary for the cardholder data environment.", domain: "Req 1 — Install and Maintain Network Security Controls", framework: "pci_dss" },
        { id: "1.3", name: "Network access to and from the cardholder data environment is restricted", description: "Network access to and from the cardholder data environment is restricted to only necessary and authorised traffic, and controls are in place to minimise the risk of unauthorised access.", domain: "Req 1 — Install and Maintain Network Security Controls", framework: "pci_dss" },
        { id: "1.4", name: "Network connections between trusted and untrusted networks are controlled", description: "Network connections between trusted and untrusted networks are controlled through firewall configurations and other network security controls to protect the cardholder data environment.", domain: "Req 1 — Install and Maintain Network Security Controls", framework: "pci_dss" },
        { id: "1.5", name: "Risks to the CDE from computing devices that are able to connect to both untrusted networks and the CDE are mitigated", description: "Risks to the cardholder data environment from computing devices that are able to connect to both untrusted networks and the CDE are identified and mitigated through appropriate security controls.", domain: "Req 1 — Install and Maintain Network Security Controls", framework: "pci_dss" },
      ],
    },
    {
      id: "req2",
      name: "Req 2 — Apply Secure Configurations to All System Components",
      controls: [
        { id: "2.1", name: "Processes and mechanisms for applying secure configurations to all system components are defined and understood", description: "All security policies and operational procedures identified in Requirement 2 are documented, kept up to date, in use, and known to all affected parties.", domain: "Req 2 — Apply Secure Configurations to All System Components", framework: "pci_dss" },
        { id: "2.2", name: "System components are configured and managed securely", description: "Vendor-supplied defaults and other security parameters are managed to reduce the risk of compromise. System components are configured with only necessary services, protocols, daemons, and functions.", domain: "Req 2 — Apply Secure Configurations to All System Components", framework: "pci_dss" },
        { id: "2.3", name: "Wireless environments are configured and managed securely", description: "Wireless environments connected to or that could impact the cardholder data environment are configured and managed securely, with appropriate security settings and strong encryption.", domain: "Req 2 — Apply Secure Configurations to All System Components", framework: "pci_dss" },
      ],
    },
    {
      id: "req3",
      name: "Req 3 — Protect Stored Account Data",
      controls: [
        { id: "3.1", name: "Processes and mechanisms for protecting stored account data are defined and understood", description: "All security policies and operational procedures identified in Requirement 3 are documented, kept up to date, in use, and known to all affected parties.", domain: "Req 3 — Protect Stored Account Data", framework: "pci_dss" },
        { id: "3.2", name: "Storage of account data is kept to a minimum", description: "Data retention and disposal policies, procedures, and processes are implemented to minimise storage of account data. Storage amount and retention time are limited to that which is required for business, legal, and regulatory purposes.", domain: "Req 3 — Protect Stored Account Data", framework: "pci_dss" },
        { id: "3.3", name: "Sensitive authentication data is not stored after authorisation", description: "Sensitive authentication data (SAD) is not stored after authorisation, even if encrypted. All sensitive authentication data received is rendered unrecoverable upon completion of the authorisation process.", domain: "Req 3 — Protect Stored Account Data", framework: "pci_dss" },
        { id: "3.4", name: "Access to displays of full PAN and ability to copy cardholder data are restricted", description: "Access to displays of full primary account number (PAN) and the ability to copy cardholder data are restricted to those with a legitimate business need, with PAN masked when displayed.", domain: "Req 3 — Protect Stored Account Data", framework: "pci_dss" },
        { id: "3.5", name: "Primary account number is secured wherever it is stored", description: "The primary account number (PAN) is secured wherever it is stored through strong cryptography, truncation, masking, or hashing to render it unreadable.", domain: "Req 3 — Protect Stored Account Data", framework: "pci_dss" },
        { id: "3.6", name: "Cryptographic keys used to protect stored account data are secured", description: "Cryptographic keys used to protect stored account data are secured with strong key management processes and procedures, restricting access to the fewest number of custodians necessary.", domain: "Req 3 — Protect Stored Account Data", framework: "pci_dss" },
        { id: "3.7", name: "Where cryptography is used to protect stored account data, key management processes and procedures covering all aspects of the key lifecycle are defined and implemented", description: "Key management processes and procedures are implemented for cryptographic keys used to protect stored account data, covering generation, distribution, storage, access, retirement, and destruction of keys throughout their lifecycle.", domain: "Req 3 — Protect Stored Account Data", framework: "pci_dss" },
      ],
    },
    {
      id: "req4",
      name: "Req 4 — Protect Cardholder Data During Transmission",
      controls: [
        { id: "4.1", name: "Processes and mechanisms for protecting cardholder data with strong cryptography during transmission over open, public networks are defined and understood", description: "All security policies and operational procedures identified in Requirement 4 are documented, kept up to date, in use, and known to all affected parties.", domain: "Req 4 — Protect Cardholder Data During Transmission", framework: "pci_dss" },
        { id: "4.2", name: "PAN is protected with strong cryptography during transmission", description: "PAN is protected with strong cryptography whenever it is transmitted over open, public networks. Trusted keys and certificates are managed to ensure the integrity of the secure communication.", domain: "Req 4 — Protect Cardholder Data During Transmission", framework: "pci_dss" },
      ],
    },
    {
      id: "req5",
      name: "Req 5 — Protect All Systems and Networks from Malicious Software",
      controls: [
        { id: "5.1", name: "Processes and mechanisms for protecting all systems and networks from malicious software are defined and understood", description: "All security policies and operational procedures identified in Requirement 5 are documented, kept up to date, in use, and known to all affected parties.", domain: "Req 5 — Protect All Systems and Networks from Malicious Software", framework: "pci_dss" },
        { id: "5.2", name: "Malicious software is prevented or detected and addressed", description: "Anti-malware solutions are deployed on all systems commonly affected by malicious software. The solutions detect and address all known types of malware.", domain: "Req 5 — Protect All Systems and Networks from Malicious Software", framework: "pci_dss" },
        { id: "5.3", name: "Anti-malware mechanisms and processes are active, maintained, and monitored", description: "Anti-malware mechanisms and processes are active on all systems, kept current with latest definitions, perform periodic scans, and generate audit logs that are monitored.", domain: "Req 5 — Protect All Systems and Networks from Malicious Software", framework: "pci_dss" },
        { id: "5.4", name: "Anti-phishing mechanisms protect users against phishing attacks", description: "Technical controls are in place to detect and protect personnel against phishing attacks, including processes to identify and report suspected phishing attempts.", domain: "Req 5 — Protect All Systems and Networks from Malicious Software", framework: "pci_dss" },
      ],
    },
    {
      id: "req6",
      name: "Req 6 — Develop and Maintain Secure Systems and Software",
      controls: [
        { id: "6.1", name: "Processes and mechanisms for developing and maintaining secure systems and software are defined and understood", description: "All security policies and operational procedures identified in Requirement 6 are documented, kept up to date, in use, and known to all affected parties.", domain: "Req 6 — Develop and Maintain Secure Systems and Software", framework: "pci_dss" },
        { id: "6.2", name: "Bespoke and custom software are developed securely", description: "Bespoke and custom software is developed securely, incorporating security throughout the software development lifecycle with secure coding techniques and practices.", domain: "Req 6 — Develop and Maintain Secure Systems and Software", framework: "pci_dss" },
        { id: "6.3", name: "Security vulnerabilities are identified and addressed", description: "Security vulnerabilities are identified and addressed through the installation of applicable vendor-supplied security patches and updates in a timely manner, with critical patches installed within one month of release.", domain: "Req 6 — Develop and Maintain Secure Systems and Software", framework: "pci_dss" },
        { id: "6.4", name: "Public-facing web applications are protected against attacks", description: "Public-facing web applications are protected against known attacks by applying secure development practices, vulnerability assessments, and deploying automated technical solutions that detect and prevent web-based attacks.", domain: "Req 6 — Develop and Maintain Secure Systems and Software", framework: "pci_dss" },
        { id: "6.5", name: "Changes to all system components are managed securely", description: "Changes to all system components in the production environment are managed securely through formal change control procedures that include documentation, approval, testing, and rollback processes.", domain: "Req 6 — Develop and Maintain Secure Systems and Software", framework: "pci_dss" },
      ],
    },
    {
      id: "req7",
      name: "Req 7 — Restrict Access to Cardholder Data by Business Need to Know",
      controls: [
        { id: "7.1", name: "Processes and mechanisms for restricting access to system components and cardholder data by business need to know are defined and understood", description: "All security policies and operational procedures identified in Requirement 7 are documented, kept up to date, in use, and known to all affected parties.", domain: "Req 7 — Restrict Access to Cardholder Data by Business Need to Know", framework: "pci_dss" },
        { id: "7.2", name: "Access to system components and data is appropriately defined and assigned", description: "Access to system components and cardholder data is limited to only those individuals whose job requires such access. Access rights are granted based on individual personnel's job classification and function.", domain: "Req 7 — Restrict Access to Cardholder Data by Business Need to Know", framework: "pci_dss" },
        { id: "7.3", name: "Access to system components and data is managed via an access control system", description: "An access control system is in place for system components that restricts access based on a user's need to know and is set to deny all unless specifically allowed.", domain: "Req 7 — Restrict Access to Cardholder Data by Business Need to Know", framework: "pci_dss" },
      ],
    },
    {
      id: "req8",
      name: "Req 8 — Identify Users and Authenticate Access",
      controls: [
        { id: "8.1", name: "Processes and mechanisms for identifying users and authenticating access to system components are defined and understood", description: "All security policies and operational procedures identified in Requirement 8 are documented, kept up to date, in use, and known to all affected parties.", domain: "Req 8 — Identify Users and Authenticate Access", framework: "pci_dss" },
        { id: "8.2", name: "User identification and related accounts for users and administrators are strictly managed throughout an account's lifecycle", description: "User identification and related accounts for users and administrators are strictly managed throughout the account lifecycle, including provisioning, modification, and revocation of access.", domain: "Req 8 — Identify Users and Authenticate Access", framework: "pci_dss" },
        { id: "8.3", name: "Strong authentication for users and administrators is established and managed", description: "Strong authentication for users and administrators is established and managed using password/passphrase policies, multi-factor authentication, and other strong authentication mechanisms.", domain: "Req 8 — Identify Users and Authenticate Access", framework: "pci_dss" },
        { id: "8.4", name: "Multi-factor authentication is implemented to secure access into the CDE", description: "Multi-factor authentication (MFA) is implemented for all non-console access into the cardholder data environment and for all remote network access originating from outside the entity's network.", domain: "Req 8 — Identify Users and Authenticate Access", framework: "pci_dss" },
        { id: "8.5", name: "Multi-factor authentication systems are configured to prevent misuse", description: "Multi-factor authentication systems are configured to prevent misuse, including protection against replay attacks and ensuring that MFA cannot be bypassed by any users.", domain: "Req 8 — Identify Users and Authenticate Access", framework: "pci_dss" },
        { id: "8.6", name: "Use of application and system accounts and associated authentication factors is strictly managed", description: "Use of application and system accounts and associated authentication factors is strictly managed, with interactive use prevented where possible and passwords/passphrases changed periodically.", domain: "Req 8 — Identify Users and Authenticate Access", framework: "pci_dss" },
      ],
    },
    {
      id: "req9",
      name: "Req 9 — Restrict Physical Access to Cardholder Data",
      controls: [
        { id: "9.1", name: "Processes and mechanisms for restricting physical access to cardholder data are defined and understood", description: "All security policies and operational procedures identified in Requirement 9 are documented, kept up to date, in use, and known to all affected parties.", domain: "Req 9 — Restrict Physical Access to Cardholder Data", framework: "pci_dss" },
        { id: "9.2", name: "Physical access controls manage entry into facilities and systems containing cardholder data", description: "Physical access controls are in place to manage entry into facilities and systems containing cardholder data, using appropriate facility entry mechanisms to limit and monitor physical access.", domain: "Req 9 — Restrict Physical Access to Cardholder Data", framework: "pci_dss" },
        { id: "9.3", name: "Physical access for personnel and visitors is authorised and managed", description: "Physical access for personnel and visitors is authorised and managed through identification, authentication, and access control procedures for on-site personnel and visitors.", domain: "Req 9 — Restrict Physical Access to Cardholder Data", framework: "pci_dss" },
        { id: "9.4", name: "Media with cardholder data is securely stored, accessed, distributed, and destroyed", description: "Media with cardholder data is physically secured, controlled during internal and external distribution, and destroyed when no longer needed for business or legal reasons.", domain: "Req 9 — Restrict Physical Access to Cardholder Data", framework: "pci_dss" },
        { id: "9.5", name: "Point of interaction devices are protected from tampering and unauthorised substitution", description: "Point of interaction (POI) devices are protected from tampering and unauthorised substitution through regular inspections, training of personnel, and maintaining an inventory of devices.", domain: "Req 9 — Restrict Physical Access to Cardholder Data", framework: "pci_dss" },
      ],
    },
    {
      id: "req10",
      name: "Req 10 — Log and Monitor All Access to System Components and Cardholder Data",
      controls: [
        { id: "10.1", name: "Processes and mechanisms for logging and monitoring all access to system components and cardholder data are defined and understood", description: "All security policies and operational procedures identified in Requirement 10 are documented, kept up to date, in use, and known to all affected parties.", domain: "Req 10 — Log and Monitor All Access to System Components and Cardholder Data", framework: "pci_dss" },
        { id: "10.2", name: "Audit logs are implemented to support the detection of anomalies and suspicious activity", description: "Audit logs are enabled and active for all system components and cardholder data, recording all individual user accesses, actions taken by any individual with administrative privileges, and all access to audit logs.", domain: "Req 10 — Log and Monitor All Access to System Components and Cardholder Data", framework: "pci_dss" },
        { id: "10.3", name: "Audit logs are protected from destruction and unauthorised modifications", description: "Audit logs are protected from destruction and unauthorised modifications through access controls, physical security, and separation of duties between personnel managing logs and those being audited.", domain: "Req 10 — Log and Monitor All Access to System Components and Cardholder Data", framework: "pci_dss" },
        { id: "10.4", name: "Audit logs are reviewed to identify anomalies or suspicious activity", description: "Audit logs are reviewed at least daily to identify anomalies or suspicious activity using automated log review mechanisms, SIEM tools, or equivalent processes.", domain: "Req 10 — Log and Monitor All Access to System Components and Cardholder Data", framework: "pci_dss" },
        { id: "10.5", name: "Audit log history is retained and available for analysis", description: "Audit log history is retained for at least 12 months, with at least the most recent three months immediately available for analysis to support incident investigation and compliance verification.", domain: "Req 10 — Log and Monitor All Access to System Components and Cardholder Data", framework: "pci_dss" },
        { id: "10.6", name: "Time-synchronisation mechanisms support consistent time settings across all systems", description: "Time-synchronisation technology is implemented and kept current to synchronise clocks across all critical systems, ensuring consistent time settings for accurate audit log timestamps.", domain: "Req 10 — Log and Monitor All Access to System Components and Cardholder Data", framework: "pci_dss" },
        { id: "10.7", name: "Failures of critical security control systems are detected, reported, and responded to promptly", description: "Failures of critical security control systems are detected, alerted, and addressed promptly. Processes are in place to respond to failures in a timely manner, including restoring security functions and investigating the cause.", domain: "Req 10 — Log and Monitor All Access to System Components and Cardholder Data", framework: "pci_dss" },
      ],
    },
    {
      id: "req11",
      name: "Req 11 — Test Security of Systems and Networks Regularly",
      controls: [
        { id: "11.1", name: "Processes and mechanisms for regularly testing security of systems and networks are defined and understood", description: "All security policies and operational procedures identified in Requirement 11 are documented, kept up to date, in use, and known to all affected parties.", domain: "Req 11 — Test Security of Systems and Networks Regularly", framework: "pci_dss" },
        { id: "11.2", name: "Wireless access points are identified and monitored, and unauthorised wireless access points are addressed", description: "Wireless access points are identified and monitored on a quarterly basis, and unauthorised wireless access points are detected and addressed through incident response procedures.", domain: "Req 11 — Test Security of Systems and Networks Regularly", framework: "pci_dss" },
        { id: "11.3", name: "External and internal vulnerabilities are regularly identified, prioritised, and addressed", description: "Internal and external vulnerability scans are performed regularly — internal scans at least quarterly and after significant changes, and external scans at least quarterly and after significant changes by an approved scanning vendor (ASV).", domain: "Req 11 — Test Security of Systems and Networks Regularly", framework: "pci_dss" },
        { id: "11.4", name: "External and internal penetration testing is regularly performed, and exploitable vulnerabilities and security weaknesses are corrected", description: "External and internal penetration testing is performed at least annually and after significant infrastructure or application changes. Exploitable vulnerabilities found during testing are corrected and retested.", domain: "Req 11 — Test Security of Systems and Networks Regularly", framework: "pci_dss" },
        { id: "11.5", name: "Network intrusions and unexpected file changes are detected and responded to", description: "Intrusion-detection and intrusion-prevention techniques are used to detect and alert on network intrusions. Change-detection mechanisms are deployed to alert personnel to unauthorised modifications of critical files.", domain: "Req 11 — Test Security of Systems and Networks Regularly", framework: "pci_dss" },
        { id: "11.6", name: "Unauthorised changes on payment pages are detected and responded to", description: "A change- and tamper-detection mechanism is deployed on payment pages to alert personnel to unauthorised modifications to HTTP headers and the contents of payment pages as received by the consumer browser.", domain: "Req 11 — Test Security of Systems and Networks Regularly", framework: "pci_dss" },
      ],
    },
    {
      id: "req12",
      name: "Req 12 — Support Information Security with Organisational Policies and Programmes",
      controls: [
        { id: "12.1", name: "A comprehensive information security policy that governs and provides direction for protection of the entity's information assets is known and current", description: "An information security policy is established, published, maintained, and disseminated to all relevant personnel and vendors. The policy is reviewed at least annually and updated when the environment changes.", domain: "Req 12 — Support Information Security with Organisational Policies and Programmes", framework: "pci_dss" },
        { id: "12.2", name: "Acceptable use policies for end-user technologies are defined and implemented", description: "Acceptable use policies for end-user technologies are documented, implemented, and communicated, covering approved usage, approved products, and requirements for corporate-approved locations and networks.", domain: "Req 12 — Support Information Security with Organisational Policies and Programmes", framework: "pci_dss" },
        { id: "12.3", name: "Risks to the cardholder data environment are formally identified, evaluated, and managed", description: "A formal risk assessment process is implemented that identifies threats, vulnerabilities, and their potential impact on the cardholder data environment. Risk assessments are performed at least annually and upon significant changes.", domain: "Req 12 — Support Information Security with Organisational Policies and Programmes", framework: "pci_dss" },
        { id: "12.4", name: "PCI DSS compliance is managed", description: "PCI DSS compliance is managed with established responsibility for the protection of cardholder data and a PCI DSS compliance programme. Executive management assigns overall accountability for maintaining PCI DSS compliance.", domain: "Req 12 — Support Information Security with Organisational Policies and Programmes", framework: "pci_dss" },
        { id: "12.5", name: "PCI DSS scope is documented and validated", description: "PCI DSS scope is documented and confirmed by identifying and documenting all locations and flows of account data, all system components in the CDE, and validating scope accuracy at least annually and upon significant changes.", domain: "Req 12 — Support Information Security with Organisational Policies and Programmes", framework: "pci_dss" },
        { id: "12.6", name: "Security awareness education is an ongoing activity", description: "A formal security awareness programme is implemented to make all personnel aware of the cardholder data security policies and procedures. Personnel receive security awareness training upon hire and at least annually thereafter.", domain: "Req 12 — Support Information Security with Organisational Policies and Programmes", framework: "pci_dss" },
        { id: "12.7", name: "Personnel are screened to reduce risks from insider threats", description: "Potential personnel who will have access to the cardholder data environment are screened prior to hire to minimise the risk of attacks from internal sources, within the constraints of local laws.", domain: "Req 12 — Support Information Security with Organisational Policies and Programmes", framework: "pci_dss" },
        { id: "12.8", name: "Risk to information assets associated with third-party service provider relationships is managed", description: "A process is maintained for engaging third-party service providers, including proper due diligence, maintaining a list of providers with access to account data, and monitoring their PCI DSS compliance status.", domain: "Req 12 — Support Information Security with Organisational Policies and Programmes", framework: "pci_dss" },
        { id: "12.9", name: "Third-party service providers support PCI DSS compliance of their customers", description: "Third-party service providers acknowledge in writing their responsibility for the security of account data they possess, store, process, or transmit on behalf of the entity, or to the extent they could impact the security of the CDE.", domain: "Req 12 — Support Information Security with Organisational Policies and Programmes", framework: "pci_dss" },
        { id: "12.10", name: "Security incidents and vulnerabilities are responded to promptly", description: "An incident response plan is implemented and ready to be activated immediately upon a suspected or confirmed security incident, covering roles, communication strategies, notification requirements, and lessons learned processes.", domain: "Req 12 — Support Information Security with Organisational Policies and Programmes", framework: "pci_dss" },
      ],
    },
  ],
};
