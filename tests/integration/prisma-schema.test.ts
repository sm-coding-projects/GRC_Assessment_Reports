import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { PrismaClient } from "@prisma/generated";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";

const TEST_DB_PATH = path.resolve(__dirname, "../../prisma/test.db");
const TEST_DB_URL = `file:${TEST_DB_PATH}`;

let prisma: PrismaClient;

beforeAll(async () => {
  // Clean up any previous test db
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }

  // Push schema to test database
  execSync(`npx prisma db push`, {
    env: { ...process.env, DATABASE_URL: TEST_DB_URL },
    cwd: path.resolve(__dirname, "../.."),
    stdio: "pipe",
  });

  const adapter = new PrismaBetterSqlite3({ url: TEST_DB_URL });
  prisma = new PrismaClient({ adapter });
});

afterAll(async () => {
  await prisma.$disconnect();
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }
});

beforeEach(async () => {
  // Clear tables in dependency order
  await prisma.assessmentResponse.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.templateControl.deleteMany();
  await prisma.template.deleteMany();
  await prisma.user.deleteMany();
});

describe("User model", () => {
  it("creates a user with required fields", async () => {
    const user = await prisma.user.create({
      data: { email: "analyst@example.com" },
    });

    expect(user.id).toBeDefined();
    expect(user.email).toBe("analyst@example.com");
    expect(user.name).toBeNull();
    expect(user.avatarUrl).toBeNull();
    expect(user.createdAt).toBeInstanceOf(Date);
  });

  it("creates a user with all fields", async () => {
    const user = await prisma.user.create({
      data: {
        email: "jane@example.com",
        name: "Jane Doe",
        avatarUrl: "https://example.com/avatar.png",
      },
    });

    expect(user.name).toBe("Jane Doe");
    expect(user.avatarUrl).toBe("https://example.com/avatar.png");
  });

  it("enforces unique email constraint", async () => {
    await prisma.user.create({ data: { email: "dup@example.com" } });

    await expect(
      prisma.user.create({ data: { email: "dup@example.com" } })
    ).rejects.toThrow();
  });
});

describe("Template model", () => {
  it("creates a template linked to a user", async () => {
    const user = await prisma.user.create({
      data: { email: "owner@example.com" },
    });

    const template = await prisma.template.create({
      data: {
        name: "SOC 2 Readiness",
        description: "SOC 2 Type II readiness checklist",
        userId: user.id,
      },
    });

    expect(template.name).toBe("SOC 2 Readiness");
    expect(template.userId).toBe(user.id);
    expect(template.createdAt).toBeInstanceOf(Date);
    expect(template.updatedAt).toBeInstanceOf(Date);
  });

  it("loads templates via user relation", async () => {
    const user = await prisma.user.create({
      data: { email: "multi@example.com" },
    });

    await prisma.template.createMany({
      data: [
        { name: "Template A", userId: user.id },
        { name: "Template B", userId: user.id },
      ],
    });

    const userWithTemplates = await prisma.user.findUnique({
      where: { id: user.id },
      include: { templates: true },
    });

    expect(userWithTemplates?.templates).toHaveLength(2);
  });
});

describe("TemplateControl model", () => {
  it("creates controls linked to a template", async () => {
    const user = await prisma.user.create({
      data: { email: "ctrl@example.com" },
    });
    const template = await prisma.template.create({
      data: { name: "ISO 27001 Audit", userId: user.id },
    });

    const control = await prisma.templateControl.create({
      data: {
        templateId: template.id,
        framework: "iso27001",
        domain: "A.5 – Organisational Controls",
        controlId: "5.1",
        controlName: "Policies for information security",
        description: "Management direction for information security",
        sortOrder: 1,
      },
    });

    expect(control.framework).toBe("iso27001");
    expect(control.controlId).toBe("5.1");
    expect(control.sortOrder).toBe(1);
  });

  it("enforces unique constraint on [templateId, framework, controlId]", async () => {
    const user = await prisma.user.create({
      data: { email: "uniq@example.com" },
    });
    const template = await prisma.template.create({
      data: { name: "Dup Test", userId: user.id },
    });

    const controlData = {
      templateId: template.id,
      framework: "soc2",
      domain: "CC1",
      controlId: "CC1.1",
      controlName: "Control Environment",
    };

    await prisma.templateControl.create({ data: controlData });

    await expect(
      prisma.templateControl.create({ data: controlData })
    ).rejects.toThrow();
  });

  it("cascade deletes controls when template is deleted", async () => {
    const user = await prisma.user.create({
      data: { email: "cascade@example.com" },
    });
    const template = await prisma.template.create({
      data: { name: "To Delete", userId: user.id },
    });

    await prisma.templateControl.createMany({
      data: [
        {
          templateId: template.id,
          framework: "nist",
          domain: "ID",
          controlId: "ID.AM-1",
          controlName: "Asset Management",
        },
        {
          templateId: template.id,
          framework: "nist",
          domain: "ID",
          controlId: "ID.AM-2",
          controlName: "Software Inventory",
        },
      ],
    });

    await prisma.template.delete({ where: { id: template.id } });

    const orphanedControls = await prisma.templateControl.findMany({
      where: { templateId: template.id },
    });
    expect(orphanedControls).toHaveLength(0);
  });
});

describe("Assessment model", () => {
  it("creates an assessment with default status", async () => {
    const user = await prisma.user.create({
      data: { email: "assess@example.com" },
    });
    const template = await prisma.template.create({
      data: { name: "Assessment Template", userId: user.id },
    });

    const assessment = await prisma.assessment.create({
      data: {
        name: "Q1 2026 Audit",
        templateId: template.id,
        userId: user.id,
      },
    });

    expect(assessment.status).toBe("IN_PROGRESS");
    expect(assessment.templateId).toBe(template.id);
    expect(assessment.userId).toBe(user.id);
  });

  it("updates assessment status", async () => {
    const user = await prisma.user.create({
      data: { email: "status@example.com" },
    });
    const template = await prisma.template.create({
      data: { name: "Status Test", userId: user.id },
    });
    const assessment = await prisma.assessment.create({
      data: { name: "Test", templateId: template.id, userId: user.id },
    });

    const updated = await prisma.assessment.update({
      where: { id: assessment.id },
      data: { status: "COMPLETED" },
    });

    expect(updated.status).toBe("COMPLETED");
  });

  it("loads assessments via template and user relations", async () => {
    const user = await prisma.user.create({
      data: { email: "rel@example.com" },
    });
    const template = await prisma.template.create({
      data: { name: "Rel Template", userId: user.id },
    });

    await prisma.assessment.create({
      data: { name: "Assessment 1", templateId: template.id, userId: user.id },
    });

    const templateWithAssessments = await prisma.template.findUnique({
      where: { id: template.id },
      include: { assessments: true },
    });
    expect(templateWithAssessments?.assessments).toHaveLength(1);

    const userWithAssessments = await prisma.user.findUnique({
      where: { id: user.id },
      include: { assessments: true },
    });
    expect(userWithAssessments?.assessments).toHaveLength(1);
  });
});

describe("AssessmentResponse model", () => {
  async function createAssessment(): Promise<{
    userId: string;
    assessmentId: string;
  }> {
    const user = await prisma.user.create({
      data: { email: `resp-${Date.now()}@example.com` },
    });
    const template = await prisma.template.create({
      data: { name: "Resp Template", userId: user.id },
    });
    const assessment = await prisma.assessment.create({
      data: { name: "Resp Assessment", templateId: template.id, userId: user.id },
    });
    return { userId: user.id, assessmentId: assessment.id };
  }

  it("creates a response with default NOT_ASSESSED status", async () => {
    const { assessmentId } = await createAssessment();

    const response = await prisma.assessmentResponse.create({
      data: {
        assessmentId,
        framework: "iso27001",
        controlId: "5.1",
      },
    });

    expect(response.status).toBe("NOT_ASSESSED");
    expect(response.notes).toBeNull();
    expect(response.evidence).toBeNull();
  });

  it("updates response with compliance status, notes, and evidence", async () => {
    const { assessmentId } = await createAssessment();

    const response = await prisma.assessmentResponse.create({
      data: {
        assessmentId,
        framework: "soc2",
        controlId: "CC1.1",
      },
    });

    const updated = await prisma.assessmentResponse.update({
      where: { id: response.id },
      data: {
        status: "COMPLIANT",
        notes: "Policy reviewed and approved by CISO.",
        evidence: "Policy document v3.2, approval email from 2026-01-15",
      },
    });

    expect(updated.status).toBe("COMPLIANT");
    expect(updated.notes).toBe("Policy reviewed and approved by CISO.");
    expect(updated.evidence).toContain("Policy document v3.2");
  });

  it("enforces unique constraint on [assessmentId, framework, controlId]", async () => {
    const { assessmentId } = await createAssessment();

    const data = {
      assessmentId,
      framework: "hipaa",
      controlId: "164.312(a)(1)",
    };

    await prisma.assessmentResponse.create({ data });
    await expect(prisma.assessmentResponse.create({ data })).rejects.toThrow();
  });

  it("cascade deletes responses when assessment is deleted", async () => {
    const { assessmentId } = await createAssessment();

    await prisma.assessmentResponse.createMany({
      data: [
        { assessmentId, framework: "pci", controlId: "1.1" },
        { assessmentId, framework: "pci", controlId: "1.2" },
        { assessmentId, framework: "pci", controlId: "1.3" },
      ],
    });

    const countBefore = await prisma.assessmentResponse.count({
      where: { assessmentId },
    });
    expect(countBefore).toBe(3);

    await prisma.assessment.delete({ where: { id: assessmentId } });

    const countAfter = await prisma.assessmentResponse.count({
      where: { assessmentId },
    });
    expect(countAfter).toBe(0);
  });

  it("supports all ComplianceStatus enum values", async () => {
    const { assessmentId } = await createAssessment();
    const statuses = [
      "NOT_ASSESSED",
      "COMPLIANT",
      "PARTIALLY_COMPLIANT",
      "NON_COMPLIANT",
      "NOT_APPLICABLE",
    ] as const;

    for (const [i, status] of statuses.entries()) {
      const response = await prisma.assessmentResponse.create({
        data: {
          assessmentId,
          framework: "gdpr",
          controlId: `art${i + 1}`,
          status,
        },
      });
      expect(response.status).toBe(status);
    }
  });
});

describe("Cross-model relationships", () => {
  it("loads a full assessment with template, controls, and responses", async () => {
    const user = await prisma.user.create({
      data: { email: "full@example.com" },
    });
    const template = await prisma.template.create({
      data: { name: "Full Test Template", userId: user.id },
    });
    await prisma.templateControl.create({
      data: {
        templateId: template.id,
        framework: "iso27001",
        domain: "A.5",
        controlId: "5.1",
        controlName: "Information Security Policies",
      },
    });

    const assessment = await prisma.assessment.create({
      data: { name: "Full Test", templateId: template.id, userId: user.id },
    });
    await prisma.assessmentResponse.create({
      data: {
        assessmentId: assessment.id,
        framework: "iso27001",
        controlId: "5.1",
        status: "COMPLIANT",
        notes: "Fully documented",
      },
    });

    const fullAssessment = await prisma.assessment.findUnique({
      where: { id: assessment.id },
      include: {
        template: { include: { controls: true } },
        responses: true,
        user: true,
      },
    });

    expect(fullAssessment).not.toBeNull();
    expect(fullAssessment?.template.name).toBe("Full Test Template");
    expect(fullAssessment?.template.controls).toHaveLength(1);
    expect(fullAssessment?.responses).toHaveLength(1);
    expect(fullAssessment?.responses[0].status).toBe("COMPLIANT");
    expect(fullAssessment?.user.email).toBe("full@example.com");
  });
});
