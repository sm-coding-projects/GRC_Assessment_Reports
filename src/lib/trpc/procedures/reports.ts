import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../init";

export const reportsRouter = router({
  /**
   * List assessments that have reports (COMPLETED or ARCHIVED).
   * Returns assessment metadata plus response counts for compliance preview.
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.assessment.findMany({
      where: {
        userId: ctx.userId,
        status: { in: ["COMPLETED", "ARCHIVED"] },
      },
      include: {
        template: {
          select: {
            name: true,
            controls: {
              select: { framework: true },
            },
          },
        },
        responses: {
          select: { status: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
  }),

  /**
   * Get a single report by assessment ID.
   * Only allows access to COMPLETED or ARCHIVED assessments.
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string().max(50) }))
    .query(async ({ ctx, input }) => {
      const assessment = await ctx.prisma.assessment.findFirst({
        where: {
          id: input.id,
          userId: ctx.userId,
          status: { in: ["COMPLETED", "ARCHIVED"] },
        },
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
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Report not found. The assessment may not be completed yet.",
        });
      }

      return assessment;
    }),
});
