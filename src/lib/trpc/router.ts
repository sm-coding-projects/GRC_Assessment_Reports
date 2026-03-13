import { router } from "./init";
import { templatesRouter } from "./procedures/templates";
import { assessmentsRouter } from "./procedures/assessments";
import { reportsRouter } from "./procedures/reports";
import { accountRouter } from "./procedures/account";

export const appRouter = router({
  templates: templatesRouter,
  assessments: assessmentsRouter,
  reports: reportsRouter,
  account: accountRouter,
});

export type AppRouter = typeof appRouter;
