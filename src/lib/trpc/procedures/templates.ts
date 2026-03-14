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

const controlSchema = z.object({
  framework: z.enum(FRAMEWORK_IDS),
  domain: z.string().max(200),
  controlId: z.string().max(50),
  controlName: z.string().max(200),
  description: z.string().max(5000).optional(),
});

export const templatesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.template.findMany({
      where: { userId: ctx.userId },
      include: { controls: { orderBy: { sortOrder: "asc" } } },
      orderBy: { updatedAt: "desc" },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().max(50) }))
    .query(async ({ ctx, input }) => {
      const template = await ctx.prisma.template.findFirst({
        where: { id: input.id, userId: ctx.userId },
        include: { controls: { orderBy: { sortOrder: "asc" } } },
      });
      if (!template) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Template not found" });
      }
      return template;
    }),

  create: writeProcedure
    .input(
      z.object({
        name: z.string().min(1, "Template name is required").max(255),
        description: z.string().max(5000).optional(),
        controls: z.array(controlSchema).min(1, "Select at least one control").max(500),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const template = await ctx.prisma.template.create({
        data: {
          name: sanitizeText(input.name),
          description: input.description ? sanitizeText(input.description) : null,
          userId: ctx.userId,
          controls: {
            create: input.controls.map((c, i) => ({
              framework: c.framework,
              domain: c.domain,
              controlId: c.controlId,
              controlName: c.controlName,
              description: c.description ?? null,
              sortOrder: i,
            })),
          },
        },
        include: { controls: { orderBy: { sortOrder: "asc" } } },
      });

      recordAudit({
        userId: ctx.userId,
        action: "template.create",
        entityType: "template",
        entityId: template.id,
        metadata: { name: template.name, controlCount: input.controls.length },
      });

      return template;
    }),

  update: writeProcedure
    .input(
      z.object({
        id: z.string().max(50),
        name: z.string().min(1, "Template name is required").max(255).optional(),
        description: z.string().max(5000).optional(),
        controls: z.array(controlSchema).max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.template.findFirst({
        where: { id: input.id, userId: ctx.userId },
      });
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Template not found" });
      }

      const nameData = input.name !== undefined ? { name: sanitizeText(input.name) } : {};
      const descData = input.description !== undefined ? { description: sanitizeText(input.description) } : {};

      let template;

      if (input.controls) {
        template = await ctx.prisma.$transaction(async (tx) => {
          await tx.templateControl.deleteMany({ where: { templateId: input.id } });
          return tx.template.update({
            where: { id: input.id },
            data: {
              ...nameData,
              ...descData,
              controls: {
                create: input.controls!.map((c, i) => ({
                  framework: c.framework,
                  domain: c.domain,
                  controlId: c.controlId,
                  controlName: c.controlName,
                  description: c.description ?? null,
                  sortOrder: i,
                })),
              },
            },
            include: { controls: { orderBy: { sortOrder: "asc" } } },
          });
        });
      } else {
        template = await ctx.prisma.template.update({
          where: { id: input.id },
          data: { ...nameData, ...descData },
          include: { controls: { orderBy: { sortOrder: "asc" } } },
        });
      }

      recordAudit({
        userId: ctx.userId,
        action: "template.update",
        entityType: "template",
        entityId: input.id,
        metadata: {
          fieldsUpdated: [
            input.name !== undefined && "name",
            input.description !== undefined && "description",
            input.controls !== undefined && "controls",
          ].filter(Boolean),
        },
      });

      return template;
    }),

  duplicate: writeProcedure
    .input(z.object({ id: z.string().max(50) }))
    .mutation(async ({ ctx, input }) => {
      const template = await ctx.prisma.template.findFirst({
        where: { id: input.id, userId: ctx.userId },
        include: { controls: { orderBy: { sortOrder: "asc" } } },
      });
      if (!template) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Template not found" });
      }

      const duplicate = await ctx.prisma.template.create({
        data: {
          name: `${template.name} (Copy)`,
          description: template.description,
          userId: ctx.userId,
          controls: {
            create: template.controls.map((c, i) => ({
              framework: c.framework,
              domain: c.domain,
              controlId: c.controlId,
              controlName: c.controlName,
              description: c.description,
              sortOrder: i,
            })),
          },
        },
        include: { controls: { orderBy: { sortOrder: "asc" } } },
      });

      recordAudit({
        userId: ctx.userId,
        action: "template.duplicate",
        entityType: "template",
        entityId: duplicate.id,
        metadata: { sourceTemplateId: input.id },
      });

      return duplicate;
    }),

  delete: writeProcedure
    .input(z.object({ id: z.string().max(50) }))
    .mutation(async ({ ctx, input }) => {
      const template = await ctx.prisma.template.findFirst({
        where: { id: input.id, userId: ctx.userId },
      });
      if (!template) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Template not found" });
      }

      await ctx.prisma.template.delete({ where: { id: input.id } });

      recordAudit({
        userId: ctx.userId,
        action: "template.delete",
        entityType: "template",
        entityId: input.id,
        metadata: { name: template.name },
      });

      return { success: true };
    }),
});
