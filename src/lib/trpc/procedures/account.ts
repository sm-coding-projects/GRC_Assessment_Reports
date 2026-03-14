import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../init";
import { sanitizeText } from "@/lib/sanitize";
import { recordAudit } from "@/lib/audit";

export const accountRouter = router({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
      },
    });
    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }
    return user;
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z
          .string()
          .min(1, "Display name is required")
          .max(100)
          .transform(sanitizeText),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.update({
        where: { id: ctx.userId },
        data: { name: input.name },
        select: { id: true, email: true, name: true, avatarUrl: true },
      });

      recordAudit({
        userId: ctx.userId,
        action: "account.updateProfile",
        entityType: "user",
        entityId: ctx.userId,
        metadata: { name: input.name },
      });

      return user;
    }),

  deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.$transaction(async (tx) => {
      await tx.assessmentResponse.deleteMany({
        where: { assessment: { userId: ctx.userId } },
      });
      await tx.assessment.deleteMany({ where: { userId: ctx.userId } });
      await tx.templateControl.deleteMany({
        where: { template: { userId: ctx.userId } },
      });
      await tx.template.deleteMany({ where: { userId: ctx.userId } });
      await tx.auditLog.deleteMany({ where: { userId: ctx.userId } });
      await tx.user.delete({ where: { id: ctx.userId } });
    });

    recordAudit({
      userId: ctx.userId,
      action: "account.delete",
      entityType: "user",
      entityId: ctx.userId,
      metadata: {},
    });

    return { success: true };
  }),
});
