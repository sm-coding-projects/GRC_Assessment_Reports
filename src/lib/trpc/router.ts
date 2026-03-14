import { router } from "./init";
import { templatesRouter } from "./procedures/templates";
import { assessmentsRouter } from "./procedures/assessments";
import { reportsRouter } from "./procedures/reports";
import { accountRouter } from "./procedures/account";
import { usersRouter } from "./procedures/users";

export const appRouter = router({
  templates: templatesRouter,
  assessments: assessmentsRouter,
  reports: reportsRouter,
  account: accountRouter,
  users: usersRouter,
});

export type AppRouter = typeof appRouter;
