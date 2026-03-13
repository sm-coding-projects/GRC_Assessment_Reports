import type { Framework, FrameworkId } from "@/types/framework";
import { iso27001 } from "./frameworks/iso27001";
import { soc2 } from "./frameworks/soc2";
import { nistCsf } from "./frameworks/nist-csf";
import { pciDss } from "./frameworks/pci-dss";
import { hipaa } from "./frameworks/hipaa";
import { gdpr } from "./frameworks/gdpr";

export const frameworks: Record<FrameworkId, Framework> = {
  iso27001,
  soc2,
  nist_csf: nistCsf,
  pci_dss: pciDss,
  hipaa,
  gdpr,
};

export const frameworkList: Framework[] = Object.values(frameworks);

export { iso27001, soc2, nistCsf, pciDss, hipaa, gdpr };
