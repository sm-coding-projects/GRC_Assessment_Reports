import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure, writeProcedure } from "../init";
import { sanitizeText } from "@/lib/sanitize";
import { recordAudit } from "@/lib/audit";

const FRAMEWORK_IDS = [
  "iso27001",
  "soc2",
  "nist_csf",
  "pci_dss",
  "hipaa",
  "gdpr",
] as const;

const complianceStatusSchema = z.enum([
  "NOT_ASSESSED",
  "COMPLIANT",
  "PARTIALLY_COMPLIANT",
  "NON_COMPLIANT",
  "NOT_APPLICABLE",
]);

const responseUpdateSchema = z.object({
  framework: z.enum(FRAMEWORK_IDS),
  controlId: z.string().max(50),
  status: complianceStatusSchema,
  notes: z.string().max(10000).optional(),
  evidence: z.string().max(10000).optional(),
});

export const assessmentsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.assessment.findMany({
      where: { userId: ctx.userId },
      include: {
        template: { select: { name: true } },
        responses: true,
      },
      orderBy: { updatedAt: "desc" },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().max(50) }))
    .query(async ({ ctx, input }) => {
      const assessment = await ctx.prisma.assessment.findFirst({
        where: { id: input.id, userId: ctx.userId },
        include: {
          template: {
            include: {
              controls: { orderBy: { sortOrder: "asc" } },
            },
          },
          responses: {
            include: {
              evidenceFiles: {
                orderBy: { createdAt: "desc" },
              },
            },
          },
        },
      });
      if (!assessment) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Assessment not found" });
      }
      return assessment;
    }),

  listEvidenceFiles: protectedProcedure
    .input(
      z.object({
        assessmentId: z.string().max(50),
        framework: z.string().max(50),
        controlId: z.string().max(50),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Verify ownership
      const assessment = await ctx.prisma.assessment.findFirst({
        where: { id: input.assessmentId, userId: ctx.userId },
      });
      if (!assessment) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Assessment not found" });
      }

      const response = await ctx.prisma.assessmentResponse.findUnique({
        where: {
          assessmentId_framework_controlId: {
            assessmentId: input.assessmentId,
            framework: input.framework,
            controlId: input.controlId,
          },
        },
        include: {
          evidenceFiles: { orderBy: { createdAt: "desc" } },
        },
      });

      return response?.evidenceFiles ?? [];
    }),

  create: writeProcedure
    .input(
      z.object({
        name: z.string().min(1, "Assessment name is required").max(255),
        templateId: z.string().min(1, "Template is required").max(50),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const template = await ctx.prisma.template.findFirst({
        where: { id: input.templateId, userId: ctx.userId },
        include: { controls: true },
      });
      if (!template) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Template not found" });
      }

      const assessment = await ctx.prisma.assessment.create({
        data: {
          name: sanitizeText(input.name),
          templateId: input.templateId,
          userId: ctx.userId,
          responses: {
            create: template.controls.map((c) => ({
              framework: c.framework,
              controlId: c.controlId,
              status: "NOT_ASSESSED" as const,
            })),
          },
        },
        include: {
          template: { select: { name: true } },
          responses: true,
        },
      });

      recordAudit({
        userId: ctx.userId,
        action: "assessment.create",
        entityType: "assessment",
        entityId: assessment.id,
        metadata: {
          name: assessment.name,
          templateId: input.templateId,
          controlCount: template.controls.length,
        },
      });

      return assessment;
    }),

  updateResponses: writeProcedure
    .input(
      z.object({
        id: z.string().max(50),
        responses: z.array(responseUpdateSchema).max(500),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const assessment = await ctx.prisma.assessment.findFirst({
        where: { id: input.id, userId: ctx.userId },
      });
      if (!assessment) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Assessment not found" });
      }

      const ops = input.responses.map((r) =>
        ctx.prisma.assessmentResponse.upsert({
          where: {
            assessmentId_framework_controlId: {
              assessmentId: input.id,
              framework: r.framework,
              controlId: r.controlId,
            },
          },
          create: {
            assessmentId: input.id,
            framework: r.framework,
            controlId: r.controlId,
            status: r.status,
            notes: r.notes ? sanitizeText(r.notes) : null,
            evidence: r.evidence ? sanitizeText(r.evidence) : null,
          },
          update: {
            status: r.status,
            notes: r.notes ? sanitizeText(r.notes) : null,
            evidence: r.evidence ? sanitizeText(r.evidence) : null,
          },
        }),
      );

      await ctx.prisma.$transaction(ops);

      await ctx.prisma.assessment.update({
        where: { id: input.id },
        data: { updatedAt: new Date() },
      });

      return { success: true };
    }),

  complete: writeProcedure
    .input(z.object({ id: z.string().max(50) }))
    .mutation(async ({ ctx, input }) => {
      const assessment = await ctx.prisma.assessment.findFirst({
        where: { id: input.id, userId: ctx.userId },
      });
      if (!assessment) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Assessment not found" });
      }

      const updated = await ctx.prisma.assessment.update({
        where: { id: input.id },
        data: { status: "COMPLETED" },
      });

      recordAudit({
        userId: ctx.userId,
        action: "assessment.complete",
        entityType: "assessment",
        entityId: input.id,
      });

      return updated;
    }),

  archive: writeProcedure
    .input(z.object({ id: z.string().max(50) }))
    .mutation(async ({ ctx, input }) => {
      const assessment = await ctx.prisma.assessment.findFirst({
        where: { id: input.id, userId: ctx.userId },
      });
      if (!assessment) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Assessment not found" });
      }

      const updated = await ctx.prisma.assessment.update({
        where: { id: input.id },
        data: { status: "ARCHIVED" },
      });

      recordAudit({
        userId: ctx.userId,
        action: "assessment.archive",
        entityType: "assessment",
        entityId: input.id,
      });

      return updated;
    }),

  delete: writeProcedure
    .input(z.object({ id: z.string().max(50) }))
    .mutation(async ({ ctx, input }) => {
      const assessment = await ctx.prisma.assessment.findFirst({
        where: { id: input.id, userId: ctx.userId },
      });
      if (!assessment) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Assessment not found" });
      }

      await ctx.prisma.assessment.delete({ where: { id: input.id } });

      recordAudit({
        userId: ctx.userId,
        action: "assessment.delete",
        entityType: "assessment",
        entityId: input.id,
        metadata: { name: assessment.name },
      });

      return { success: true };
    }),
});
