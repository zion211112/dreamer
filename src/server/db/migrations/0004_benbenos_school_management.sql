CREATE TABLE "bb_academic_years" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"name" varchar(40) NOT NULL,
	"starts_on" date NOT NULL,
	"ends_on" date NOT NULL,
	CONSTRAINT "bb_years_dates_ck" CHECK ("bb_academic_years"."ends_on" > "bb_academic_years"."starts_on")
);
--> statement-breakpoint
CREATE TABLE "bb_assessments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"year_id" uuid NOT NULL,
	"term_id" uuid NOT NULL,
	"class_id" uuid NOT NULL,
	"subject_id" uuid NOT NULL,
	"title" varchar(160) NOT NULL,
	"kind" varchar(12) NOT NULL,
	"max_score" integer NOT NULL,
	"scheme" jsonb,
	"created_by_member_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bb_assessments_kind_ck" CHECK ("bb_assessments"."kind" in ('formative','summative')),
	CONSTRAINT "bb_assessments_max_ck" CHECK ("bb_assessments"."max_score" > 0)
);
--> statement-breakpoint
CREATE TABLE "bb_attendance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"class_id" uuid NOT NULL,
	"learner_id" uuid NOT NULL,
	"day" date NOT NULL,
	"status" varchar(10) NOT NULL,
	"marked_by_member_id" uuid,
	"marked_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bb_attendance_status_ck" CHECK ("bb_attendance"."status" in ('present','absent','late','excused'))
);
--> statement-breakpoint
CREATE TABLE "bb_audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"member_id" uuid,
	"action" varchar(60) NOT NULL,
	"subject_type" varchar(40) NOT NULL,
	"subject_id" uuid,
	"details" jsonb,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bb_classes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"year_id" uuid NOT NULL,
	"name" varchar(60) NOT NULL,
	"grade_level" integer NOT NULL,
	CONSTRAINT "bb_classes_grade_ck" CHECK ("bb_classes"."grade_level" between 4 and 9)
);
--> statement-breakpoint
CREATE TABLE "bb_enrolments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"year_id" uuid NOT NULL,
	"learner_id" uuid NOT NULL,
	"class_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bb_fee_structures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"year_id" uuid NOT NULL,
	"name" varchar(120) NOT NULL,
	"grade_level" integer,
	"amount_cents" integer NOT NULL,
	CONSTRAINT "bb_fees_amount_ck" CHECK ("bb_fee_structures"."amount_cents" > 0)
);
--> statement-breakpoint
CREATE TABLE "bb_guardians" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"learner_id" uuid NOT NULL,
	"name" varchar(120) NOT NULL,
	"phone" varchar(30),
	"relationship" varchar(40),
	"is_primary" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bb_invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"term_id" uuid NOT NULL,
	"learner_id" uuid NOT NULL,
	"fee_structure_id" uuid NOT NULL,
	"amount_cents" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bb_learners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"admission_no" varchar(40) NOT NULL,
	"first_name" varchar(80) NOT NULL,
	"last_name" varchar(80) NOT NULL,
	"date_of_birth" date,
	"status" varchar(12) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bb_learners_status_ck" CHECK ("bb_learners"."status" in ('active','transferred','withdrawn','graduated'))
);
--> statement-breakpoint
CREATE TABLE "bb_marks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"assessment_id" uuid NOT NULL,
	"learner_id" uuid NOT NULL,
	"score" integer NOT NULL,
	"source" varchar(10) NOT NULL,
	"status" varchar(10) DEFAULT 'draft' NOT NULL,
	"answers" jsonb,
	"comment" varchar(300),
	"entered_by_member_id" uuid,
	"confirmed_by_member_id" uuid,
	"confirmed_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bb_marks_source_ck" CHECK ("bb_marks"."source" in ('manual','auto')),
	CONSTRAINT "bb_marks_status_ck" CHECK ("bb_marks"."status" in ('draft','confirmed')),
	CONSTRAINT "bb_marks_score_ck" CHECK ("bb_marks"."score" >= 0)
);
--> statement-breakpoint
CREATE TABLE "bb_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"auth_user_id" text,
	"email" varchar(254) NOT NULL,
	"display_name" varchar(120) NOT NULL,
	"role" varchar(20) NOT NULL,
	"status" varchar(12) DEFAULT 'invited' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bb_members_role_ck" CHECK ("bb_members"."role" in ('principal','registrar','teacher','bursar')),
	CONSTRAINT "bb_members_status_ck" CHECK ("bb_members"."status" in ('invited','active','disabled'))
);
--> statement-breakpoint
CREATE TABLE "bb_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"learner_id" uuid NOT NULL,
	"amount_cents" integer NOT NULL,
	"method" varchar(10) NOT NULL,
	"reference" varchar(80),
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"recorded_by_member_id" uuid,
	CONSTRAINT "bb_payments_method_ck" CHECK ("bb_payments"."method" in ('cash','mpesa','bank','other')),
	CONSTRAINT "bb_payments_amount_ck" CHECK ("bb_payments"."amount_cents" > 0)
);
--> statement-breakpoint
CREATE TABLE "bb_schools" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"code" varchar(30) NOT NULL,
	"county" varchar(80),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bb_schools_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "bb_subjects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"code" varchar(12) NOT NULL,
	"name" varchar(120) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bb_teaching_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"class_id" uuid NOT NULL,
	"subject_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bb_tender_drafts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"title" varchar(160) NOT NULL,
	"scope" text NOT NULL,
	"estimated_cents" integer,
	"created_by_member_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bb_terms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"year_id" uuid NOT NULL,
	"name" varchar(40) NOT NULL,
	"ordinal" integer NOT NULL,
	"starts_on" date NOT NULL,
	"ends_on" date NOT NULL,
	CONSTRAINT "bb_terms_dates_ck" CHECK ("bb_terms"."ends_on" >= "bb_terms"."starts_on")
);
--> statement-breakpoint
ALTER TABLE "bb_academic_years" ADD CONSTRAINT "bb_academic_years_school_id_bb_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."bb_schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bb_assessments" ADD CONSTRAINT "bb_assessments_school_id_bb_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."bb_schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bb_assessments" ADD CONSTRAINT "bb_assessments_year_id_bb_academic_years_id_fk" FOREIGN KEY ("year_id") REFERENCES "public"."bb_academic_years"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bb_assessments" ADD CONSTRAINT "bb_assessments_term_id_bb_terms_id_fk" FOREIGN KEY ("term_id") REFERENCES "public"."bb_terms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bb_assessments" ADD CONSTRAINT "bb_assessments_class_id_bb_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."bb_classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bb_assessments" ADD CONSTRAINT "bb_assessments_subject_id_bb_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."bb_subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bb_assessments" ADD CONSTRAINT "bb_assessments_created_by_member_id_bb_members_id_fk" FOREIGN KEY ("created_by_member_id") REFERENCES "public"."bb_members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bb_attendance" ADD CONSTRAINT "bb_attendance_school_id_bb_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."bb_schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bb_attendance" ADD CONSTRAINT "bb_attendance_class_id_bb_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."bb_classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bb_attendance" ADD CONSTRAINT "bb_attendance_learner_id_bb_learners_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."bb_learners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bb_attendance" ADD CONSTRAINT "bb_attendance_marked_by_member_id_bb_members_id_fk" FOREIGN KEY ("marked_by_member_id") REFERENCES "public"."bb_members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bb_audit_events" ADD CONSTRAINT "bb_audit_events_school_id_bb_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."bb_schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bb_audit_events" ADD CONSTRAINT "bb_audit_events_member_id_bb_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."bb_members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bb_classes" ADD CONSTRAINT "bb_classes_school_id_bb_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."bb_schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bb_classes" ADD CONSTRAINT "bb_classes_year_id_bb_academic_years_id_fk" FOREIGN KEY ("year_id") REFERENCES "public"."bb_academic_years"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bb_enrolments" ADD CONSTRAINT "bb_enrolments_school_id_bb_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."bb_schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bb_enrolments" ADD CONSTRAINT "bb_enrolments_year_id_bb_academic_years_id_fk" FOREIGN KEY ("year_id") REFERENCES "public"."bb_academic_years"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bb_enrolments" ADD CONSTRAINT "bb_enrolments_learner_id_bb_learners_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."bb_learners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bb_enrolments" ADD CONSTRAINT "bb_enrolments_class_id_bb_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."bb_classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bb_fee_structures" ADD CONSTRAINT "bb_fee_structures_school_id_bb_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."bb_schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bb_fee_structures" ADD CONSTRAINT "bb_fee_structures_year_id_bb_academic_years_id_fk" FOREIGN KEY ("year_id") REFERENCES "public"."bb_academic_years"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bb_guardians" ADD CONSTRAINT "bb_guardians_school_id_bb_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."bb_schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bb_guardians" ADD CONSTRAINT "bb_guardians_learner_id_bb_learners_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."bb_learners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bb_invoices" ADD CONSTRAINT "bb_invoices_school_id_bb_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."bb_schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bb_invoices" ADD CONSTRAINT "bb_invoices_term_id_bb_terms_id_fk" FOREIGN KEY ("term_id") REFERENCES "public"."bb_terms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bb_invoices" ADD CONSTRAINT "bb_invoices_learner_id_bb_learners_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."bb_learners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bb_invoices" ADD CONSTRAINT "bb_invoices_fee_structure_id_bb_fee_structures_id_fk" FOREIGN KEY ("fee_structure_id") REFERENCES "public"."bb_fee_structures"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bb_learners" ADD CONSTRAINT "bb_learners_school_id_bb_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."bb_schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bb_marks" ADD CONSTRAINT "bb_marks_school_id_bb_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."bb_schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bb_marks" ADD CONSTRAINT "bb_marks_assessment_id_bb_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."bb_assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bb_marks" ADD CONSTRAINT "bb_marks_learner_id_bb_learners_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."bb_learners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bb_marks" ADD CONSTRAINT "bb_marks_entered_by_member_id_bb_members_id_fk" FOREIGN KEY ("entered_by_member_id") REFERENCES "public"."bb_members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bb_marks" ADD CONSTRAINT "bb_marks_confirmed_by_member_id_bb_members_id_fk" FOREIGN KEY ("confirmed_by_member_id") REFERENCES "public"."bb_members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bb_members" ADD CONSTRAINT "bb_members_school_id_bb_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."bb_schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bb_payments" ADD CONSTRAINT "bb_payments_school_id_bb_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."bb_schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bb_payments" ADD CONSTRAINT "bb_payments_learner_id_bb_learners_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."bb_learners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bb_payments" ADD CONSTRAINT "bb_payments_recorded_by_member_id_bb_members_id_fk" FOREIGN KEY ("recorded_by_member_id") REFERENCES "public"."bb_members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bb_subjects" ADD CONSTRAINT "bb_subjects_school_id_bb_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."bb_schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bb_teaching_assignments" ADD CONSTRAINT "bb_teaching_assignments_school_id_bb_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."bb_schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bb_teaching_assignments" ADD CONSTRAINT "bb_teaching_assignments_member_id_bb_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."bb_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bb_teaching_assignments" ADD CONSTRAINT "bb_teaching_assignments_class_id_bb_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."bb_classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bb_teaching_assignments" ADD CONSTRAINT "bb_teaching_assignments_subject_id_bb_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."bb_subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bb_tender_drafts" ADD CONSTRAINT "bb_tender_drafts_school_id_bb_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."bb_schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bb_tender_drafts" ADD CONSTRAINT "bb_tender_drafts_created_by_member_id_bb_members_id_fk" FOREIGN KEY ("created_by_member_id") REFERENCES "public"."bb_members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bb_terms" ADD CONSTRAINT "bb_terms_school_id_bb_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."bb_schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bb_terms" ADD CONSTRAINT "bb_terms_year_id_bb_academic_years_id_fk" FOREIGN KEY ("year_id") REFERENCES "public"."bb_academic_years"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "bb_years_school_name_uq" ON "bb_academic_years" USING btree ("school_id","name");--> statement-breakpoint
CREATE INDEX "bb_assessments_class_idx" ON "bb_assessments" USING btree ("class_id","term_id");--> statement-breakpoint
CREATE UNIQUE INDEX "bb_attendance_uq" ON "bb_attendance" USING btree ("class_id","learner_id","day");--> statement-breakpoint
CREATE INDEX "bb_audit_school_time_idx" ON "bb_audit_events" USING btree ("school_id","occurred_at");--> statement-breakpoint
CREATE UNIQUE INDEX "bb_classes_year_name_uq" ON "bb_classes" USING btree ("year_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "bb_enrolments_year_learner_uq" ON "bb_enrolments" USING btree ("year_id","learner_id");--> statement-breakpoint
CREATE INDEX "bb_guardians_learner_idx" ON "bb_guardians" USING btree ("learner_id");--> statement-breakpoint
CREATE UNIQUE INDEX "bb_invoices_term_fee_learner_uq" ON "bb_invoices" USING btree ("term_id","fee_structure_id","learner_id");--> statement-breakpoint
CREATE UNIQUE INDEX "bb_learners_school_admission_uq" ON "bb_learners" USING btree ("school_id","admission_no");--> statement-breakpoint
CREATE UNIQUE INDEX "bb_marks_assessment_learner_uq" ON "bb_marks" USING btree ("assessment_id","learner_id");--> statement-breakpoint
CREATE UNIQUE INDEX "bb_members_school_email_uq" ON "bb_members" USING btree ("school_id","email");--> statement-breakpoint
CREATE UNIQUE INDEX "bb_members_auth_user_uq" ON "bb_members" USING btree ("school_id","auth_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "bb_payments_reference_uq" ON "bb_payments" USING btree ("school_id","reference") WHERE "bb_payments"."reference" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "bb_subjects_school_code_uq" ON "bb_subjects" USING btree ("school_id","code");--> statement-breakpoint
CREATE UNIQUE INDEX "bb_assignments_uq" ON "bb_teaching_assignments" USING btree ("member_id","class_id","subject_id");--> statement-breakpoint
CREATE UNIQUE INDEX "bb_terms_year_ordinal_uq" ON "bb_terms" USING btree ("year_id","ordinal");