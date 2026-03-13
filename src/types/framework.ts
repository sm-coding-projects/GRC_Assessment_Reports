export interface FrameworkControl {
  id: string;
  name: string;
  description: string;
  domain: string;
  framework: FrameworkId;
}

export interface FrameworkDomain {
  id: string;
  name: string;
  controls: FrameworkControl[];
}

export interface Framework {
  id: FrameworkId;
  name: string;
  description: string;
  version: string;
  domains: FrameworkDomain[];
}

export type FrameworkId = "iso27001" | "soc2" | "nist_csf" | "pci_dss" | "hipaa" | "gdpr";
