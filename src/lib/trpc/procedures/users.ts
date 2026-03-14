import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, adminProcedure } from "../init";
import { hashPassword, validatePasswordStrength } from "@/lib/auth/password";
import { sanitizeText } from "@/lib/sanitize";
import { recordAudit } from "@/lib/audit";

const USER_ROLE_VALUES = ["ADMIN", "READ_WRITE", "READ_ONLY"] as const;

export const usersRouter = router({
  list: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "asc" },
    });
  }),

  create: adminProcedure
    .input(
      z.object({
        email: z.string().email().max(255),
        name: z.string().min(1).max(100),
        password: z.string().min(1).max(200),
        role: z.enum(USER_ROLE_VALUES),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const strengthError = validatePasswordStrength(input.password);
      if (strengthError) {
        throw new TRPCError({ code: "BAD_REQUEST", message: strengthError });
      }

      const existing = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A user with this email already exists.",
        });
      }

      const passwordHash = await hashPassword(input.password);
      const user = await ctx.prisma.user.create({
        data: {
          email: input.email,
          name: sanitizeText(input.name),
          passwordHash,
          role: input.role,
        },
        select: { id: true, email: true, name: true, role: true },
      });

      recordAudit({
        userId: ctx.userId,
        action: "user.create",
        entityType: "user",
        entityId: user.id,
        metadata: { email: user.email, role: user.role },
      });

      return user;
    }),

  updateRole: adminProcedure
    .input(
      z.object({
        id: z.string().max(50),
        role: z.enum(USER_ROLE_VALUES),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.id === ctx.userId && input.role !== "ADMIN") {
        const adminCount = await ctx.prisma.user.count({
          where: { role: "ADMIN" },
        });
        if (adminCount <= 1) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot remove the last administrator.",
          });
        }
      }

      const user = await ctx.prisma.user.update({
        where: { id: input.id },
        data: { role: input.role },
        select: { id: true, email: true, name: true, role: true },
      });

      recordAudit({
        userId: ctx.userId,
        action: "user.updateRole",
        entityType: "user",
        entityId: input.id,
        metadata: { newRole: input.role },
      });

      return user;
    }),

  resetPassword: adminProcedure
    .input(
      z.object({
        id: z.string().max(50),
        newPassword: z.string().min(1).max(200),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const strengthError = validatePasswordStrength(input.newPassword);
      if (strengthError) {
        throw new TRPCError({ code: "BAD_REQUEST", message: strengthError });
      }

      const passwordHash = await hashPassword(input.newPassword);
      await ctx.prisma.user.update({
        where: { id: input.id },
        data: { passwordHash },
      });

      recordAudit({
        userId: ctx.userId,
        action: "user.resetPassword",
        entityType: "user",
        entityId: input.id,
      });

      return { success: true };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string().max(50) }))
    .mutation(async ({ ctx, input }) => {
      if (input.id === ctx.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot delete your own account from admin panel.",
        });
      }

      await ctx.prisma.$transaction(async (tx) => {
        await tx.assessmentResponse.deleteMany({
          where: { assessment: { userId: input.id } },
        });
        await tx.assessment.deleteMany({ where: { userId: input.id } });
        await tx.templateControl.deleteMany({
          where: { template: { userId: input.id } },
        });
        await tx.template.deleteMany({ where: { userId: input.id } });
        await tx.auditLog.deleteMany({ where: { userId: input.id } });
        await tx.user.delete({ where: { id: input.id } });
      });

      recordAudit({
        userId: ctx.userId,
        action: "user.delete",
        entityType: "user",
        entityId: input.id,
      });

      return { success: true };
    }),
});
