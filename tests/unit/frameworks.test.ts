import { describe, expect, it } from "vitest";
import { frameworks, frameworkList } from "@/data";
import type { Framework, FrameworkControl } from "@/types/framework";

function getAllControls(framework: Framework): FrameworkControl[] {
  return framework.domains.flatMap((domain) => domain.controls);
}

describe("Framework data integrity", () => {
  it("exports all 6 frameworks", () => {
    expect(Object.keys(frameworks)).toHaveLength(6);
    expect(Object.keys(frameworks)).toEqual(
      expect.arrayContaining([
        "iso27001",
        "soc2",
        "nist_csf",
        "pci_dss",
        "hipaa",
        "gdpr",
      ])
    );
  });

  it("frameworkList contains the same frameworks", () => {
    expect(frameworkList).toHaveLength(6);
  });

  describe.each(frameworkList)("$name ($id)", (framework) => {
    it("has required top-level fields", () => {
      expect(framework.id).toBeTruthy();
      expect(framework.name).toBeTruthy();
      expect(framework.description).toBeTruthy();
      expect(framework.version).toBeTruthy();
    });

    it("has at least one domain", () => {
      expect(framework.domains.length).toBeGreaterThan(0);
    });

    it("every domain has an id and name", () => {
      for (const domain of framework.domains) {
        expect(domain.id).toBeTruthy();
        expect(domain.name).toBeTruthy();
      }
    });

    it("has no duplicate domain ids", () => {
      const domainIds = framework.domains.map((d) => d.id);
      expect(new Set(domainIds).size).toBe(domainIds.length);
    });

    it("every control has all required fields", () => {
      const controls = getAllControls(framework);
      expect(controls.length).toBeGreaterThan(0);

      for (const control of controls) {
        expect(control.id, `control missing id`).toBeTruthy();
        expect(control.name, `control ${control.id} missing name`).toBeTruthy();
        expect(
          control.description,
          `control ${control.id} missing description`
        ).toBeTruthy();
        expect(
          control.domain,
          `control ${control.id} missing domain`
        ).toBeTruthy();
        expect(
          control.framework,
          `control ${control.id} missing framework`
        ).toBe(framework.id);
      }
    });

    it("has no duplicate control ids within the framework", () => {
      const controls = getAllControls(framework);
      const controlIds = controls.map((c) => c.id);
      const duplicates = controlIds.filter(
        (id, index) => controlIds.indexOf(id) !== index
      );
      expect(duplicates, `duplicate control ids: ${duplicates.join(", ")}`).toHaveLength(0);
    });

    it("control domain field matches parent domain name", () => {
      for (const domain of framework.domains) {
        for (const control of domain.controls) {
          expect(
            control.domain,
            `control ${control.id} domain "${control.domain}" does not match parent "${domain.name}"`
          ).toBe(domain.name);
        }
      }
    });

    it("control descriptions are non-trivial (more than 20 characters)", () => {
      const controls = getAllControls(framework);
      for (const control of controls) {
        expect(
          control.description.length,
          `control ${control.id} has a too-short description: "${control.description}"`
        ).toBeGreaterThan(20);
      }
    });

    it("every domain has at least one control", () => {
      for (const domain of framework.domains) {
        expect(
          domain.controls.length,
          `domain "${domain.name}" has no controls`
        ).toBeGreaterThan(0);
      }
    });
  });
});

describe("Framework-specific control counts", () => {
  it("ISO 27001 has 93 controls across 4 domains", () => {
    const fw = frameworks.iso27001;
    expect(fw.domains).toHaveLength(4);
    expect(getAllControls(fw)).toHaveLength(93);
  });

  it("SOC 2 has controls across all Trust Services Criteria domains", () => {
    const fw = frameworks.soc2;
    expect(fw.domains.length).toBeGreaterThanOrEqual(9); // CC1-CC9 minimum
    expect(getAllControls(fw).length).toBeGreaterThanOrEqual(33); // minimum common criteria
  });

  it("NIST CSF 2.0 has 6 function domains", () => {
    const fw = frameworks.nist_csf;
    expect(fw.domains).toHaveLength(6);
    expect(getAllControls(fw).length).toBeGreaterThanOrEqual(100);
  });

  it("PCI DSS has 12 requirement domains", () => {
    const fw = frameworks.pci_dss;
    expect(fw.domains).toHaveLength(12);
    expect(getAllControls(fw).length).toBeGreaterThanOrEqual(50);
  });

  it("HIPAA has 3 safeguard domains", () => {
    const fw = frameworks.hipaa;
    expect(fw.domains).toHaveLength(3);
    expect(getAllControls(fw).length).toBeGreaterThanOrEqual(40);
  });

  it("GDPR has operational area domains", () => {
    const fw = frameworks.gdpr;
    expect(fw.domains.length).toBeGreaterThanOrEqual(8);
    expect(getAllControls(fw).length).toBeGreaterThanOrEqual(40);
  });
});
