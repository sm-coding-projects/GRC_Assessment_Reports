import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "./context";
import type { UserRole } from "@prisma/generated";

const t = initTRPC.context<Context>().create();

export const router = t.router;

/**
 * Protected procedure — requires an authenticated user.
 * All roles (ADMIN, READ_WRITE, READ_ONLY) can access these endpoints.
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId || !ctx.userRole) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to perform this action.",
    });
  }
  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
      userRole: ctx.userRole as UserRole,
    },
  });
});

/**
 * Write procedure — requires ADMIN or READ_WRITE role.
 * READ_ONLY users are rejected with FORBIDDEN.
 */
export const writeProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId || !ctx.userRole) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to perform this action.",
    });
  }
  if (ctx.userRole === "READ_ONLY") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You do not have permission to modify data.",
    });
  }
  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
      userRole: ctx.userRole as UserRole,
    },
  });
});

/**
 * Admin procedure — requires ADMIN role.
 */
export const adminProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId || !ctx.userRole) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to perform this action.",
    });
  }
  if (ctx.userRole !== "ADMIN") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "This action requires administrator privileges.",
    });
  }
  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
      userRole: ctx.userRole as UserRole,
    },
  });
});
