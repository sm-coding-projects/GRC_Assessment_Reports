-- Row Level Security (RLS) policies for Supabase PostgreSQL
-- Run this migration against your Supabase database after deploying the Prisma schema.
-- These policies ensure users can only access their own data, even if application-level
-- checks are bypassed.

-- Enable RLS on all user-owned tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Template" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TemplateControl" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Assessment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AssessmentResponse" ENABLE ROW LEVEL SECURITY;

-- User table: users can only read/update their own row
CREATE POLICY "users_select_own" ON "User"
  FOR SELECT USING (id = auth.uid()::text);

CREATE POLICY "users_update_own" ON "User"
  FOR UPDATE USING (id = auth.uid()::text);

-- Template table: users can only CRUD their own templates
CREATE POLICY "templates_select_own" ON "Template"
  FOR SELECT USING ("userId" = auth.uid()::text);

CREATE POLICY "templates_insert_own" ON "Template"
  FOR INSERT WITH CHECK ("userId" = auth.uid()::text);

CREATE POLICY "templates_update_own" ON "Template"
  FOR UPDATE USING ("userId" = auth.uid()::text);

CREATE POLICY "templates_delete_own" ON "Template"
  FOR DELETE USING ("userId" = auth.uid()::text);

-- TemplateControl: access through template ownership
CREATE POLICY "template_controls_select" ON "TemplateControl"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "Template"
      WHERE "Template".id = "TemplateControl"."templateId"
      AND "Template"."userId" = auth.uid()::text
    )
  );

CREATE POLICY "template_controls_insert" ON "TemplateControl"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Template"
      WHERE "Template".id = "TemplateControl"."templateId"
      AND "Template"."userId" = auth.uid()::text
    )
  );

CREATE POLICY "template_controls_update" ON "TemplateControl"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM "Template"
      WHERE "Template".id = "TemplateControl"."templateId"
      AND "Template"."userId" = auth.uid()::text
    )
  );

CREATE POLICY "template_controls_delete" ON "TemplateControl"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM "Template"
      WHERE "Template".id = "TemplateControl"."templateId"
      AND "Template"."userId" = auth.uid()::text
    )
  );

-- Assessment table: users can only CRUD their own assessments
CREATE POLICY "assessments_select_own" ON "Assessment"
  FOR SELECT USING ("userId" = auth.uid()::text);

CREATE POLICY "assessments_insert_own" ON "Assessment"
  FOR INSERT WITH CHECK ("userId" = auth.uid()::text);

CREATE POLICY "assessments_update_own" ON "Assessment"
  FOR UPDATE USING ("userId" = auth.uid()::text);

CREATE POLICY "assessments_delete_own" ON "Assessment"
  FOR DELETE USING ("userId" = auth.uid()::text);

-- AssessmentResponse: access through assessment ownership
CREATE POLICY "assessment_responses_select" ON "AssessmentResponse"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "Assessment"
      WHERE "Assessment".id = "AssessmentResponse"."assessmentId"
      AND "Assessment"."userId" = auth.uid()::text
    )
  );

CREATE POLICY "assessment_responses_insert" ON "AssessmentResponse"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Assessment"
      WHERE "Assessment".id = "AssessmentResponse"."assessmentId"
      AND "Assessment"."userId" = auth.uid()::text
    )
  );

CREATE POLICY "assessment_responses_update" ON "AssessmentResponse"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM "Assessment"
      WHERE "Assessment".id = "AssessmentResponse"."assessmentId"
      AND "Assessment"."userId" = auth.uid()::text
    )
  );

CREATE POLICY "assessment_responses_delete" ON "AssessmentResponse"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM "Assessment"
      WHERE "Assessment".id = "AssessmentResponse"."assessmentId"
      AND "Assessment"."userId" = auth.uid()::text
    )
  );

-- AuditLog: users can only read their own audit entries.
-- Writes are done server-side via Prisma (service_role key bypasses RLS).
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_log_select_own" ON "AuditLog"
  FOR SELECT USING ("userId" = auth.uid()::text);

-- Grant service_role bypass for server-side operations via Prisma
-- The service_role key (used by Prisma on the server) bypasses RLS by default.
-- The anon key (used by client-side Supabase) is subject to RLS.
