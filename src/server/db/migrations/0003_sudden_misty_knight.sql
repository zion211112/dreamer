CREATE TABLE "audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid,
	"actor_person_id" uuid NOT NULL,
	"action" varchar(80) NOT NULL,
	"subject_type" varchar(40) NOT NULL,
	"subject_id" uuid NOT NULL,
	"details" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "undertaking_interests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"undertaking_id" uuid NOT NULL,
	"person_id" uuid NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "undertaking_offers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"undertaking_id" uuid NOT NULL,
	"interest_id" uuid NOT NULL,
	"issued_by_person_id" uuid NOT NULL,
	"offered_to_person_id" uuid NOT NULL,
	"proposal" text NOT NULL,
	"status" varchar(24) DEFAULT 'pending' NOT NULL,
	"decided_by_person_id" uuid,
	"decided_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "undertaking_offers_status_check" CHECK ("undertaking_offers"."status" in ('pending', 'accepted', 'declined')),
	CONSTRAINT "undertaking_offers_no_self_offer_check" CHECK ("undertaking_offers"."issued_by_person_id" <> "undertaking_offers"."offered_to_person_id")
);
--> statement-breakpoint
CREATE TABLE "undertaking_participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"undertaking_id" uuid NOT NULL,
	"person_id" uuid NOT NULL,
	"offer_id" uuid NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "undertakings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"created_by_person_id" uuid NOT NULL,
	"title" varchar(200) NOT NULL,
	"scope" text NOT NULL,
	"status" varchar(24) DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "undertakings_status_check" CHECK ("undertakings"."status" in ('open', 'active', 'closed'))
);
--> statement-breakpoint
CREATE TABLE "work_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"undertaking_id" uuid NOT NULL,
	"author_person_id" uuid NOT NULL,
	"report" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "work_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" uuid NOT NULL,
	"reviewer_person_id" uuid NOT NULL,
	"decision" varchar(24) NOT NULL,
	"rationale" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "work_reviews_decision_check" CHECK ("work_reviews"."decision" in ('accepted', 'disputed', 'needs_revision'))
);
--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_actor_person_id_apt_persons_id_fk" FOREIGN KEY ("actor_person_id") REFERENCES "public"."apt_persons"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "undertaking_interests" ADD CONSTRAINT "undertaking_interests_undertaking_id_undertakings_id_fk" FOREIGN KEY ("undertaking_id") REFERENCES "public"."undertakings"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "undertaking_interests" ADD CONSTRAINT "undertaking_interests_person_id_apt_persons_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."apt_persons"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "undertaking_offers" ADD CONSTRAINT "undertaking_offers_undertaking_id_undertakings_id_fk" FOREIGN KEY ("undertaking_id") REFERENCES "public"."undertakings"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "undertaking_offers" ADD CONSTRAINT "undertaking_offers_interest_id_undertaking_interests_id_fk" FOREIGN KEY ("interest_id") REFERENCES "public"."undertaking_interests"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "undertaking_offers" ADD CONSTRAINT "undertaking_offers_issued_by_person_id_apt_persons_id_fk" FOREIGN KEY ("issued_by_person_id") REFERENCES "public"."apt_persons"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "undertaking_offers" ADD CONSTRAINT "undertaking_offers_offered_to_person_id_apt_persons_id_fk" FOREIGN KEY ("offered_to_person_id") REFERENCES "public"."apt_persons"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "undertaking_offers" ADD CONSTRAINT "undertaking_offers_decided_by_person_id_apt_persons_id_fk" FOREIGN KEY ("decided_by_person_id") REFERENCES "public"."apt_persons"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "undertaking_participants" ADD CONSTRAINT "undertaking_participants_undertaking_id_undertakings_id_fk" FOREIGN KEY ("undertaking_id") REFERENCES "public"."undertakings"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "undertaking_participants" ADD CONSTRAINT "undertaking_participants_person_id_apt_persons_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."apt_persons"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "undertaking_participants" ADD CONSTRAINT "undertaking_participants_offer_id_undertaking_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."undertaking_offers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "undertakings" ADD CONSTRAINT "undertakings_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "undertakings" ADD CONSTRAINT "undertakings_created_by_person_id_apt_persons_id_fk" FOREIGN KEY ("created_by_person_id") REFERENCES "public"."apt_persons"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_reports" ADD CONSTRAINT "work_reports_undertaking_id_undertakings_id_fk" FOREIGN KEY ("undertaking_id") REFERENCES "public"."undertakings"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_reports" ADD CONSTRAINT "work_reports_author_person_id_apt_persons_id_fk" FOREIGN KEY ("author_person_id") REFERENCES "public"."apt_persons"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_reviews" ADD CONSTRAINT "work_reviews_report_id_work_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."work_reports"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_reviews" ADD CONSTRAINT "work_reviews_reviewer_person_id_apt_persons_id_fk" FOREIGN KEY ("reviewer_person_id") REFERENCES "public"."apt_persons"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_events_org_time_idx" ON "audit_events" USING btree ("organization_id","occurred_at");--> statement-breakpoint
CREATE INDEX "undertaking_interests_undertaking_idx" ON "undertaking_interests" USING btree ("undertaking_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "undertaking_interests_person_unique" ON "undertaking_interests" USING btree ("undertaking_id","person_id");--> statement-breakpoint
CREATE INDEX "undertaking_offers_undertaking_idx" ON "undertaking_offers" USING btree ("undertaking_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "undertaking_offers_recipient_unique" ON "undertaking_offers" USING btree ("undertaking_id","offered_to_person_id");--> statement-breakpoint
CREATE UNIQUE INDEX "undertaking_participants_unique" ON "undertaking_participants" USING btree ("undertaking_id","person_id");--> statement-breakpoint
CREATE INDEX "undertakings_org_status_idx" ON "undertakings" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "work_reports_undertaking_idx" ON "work_reports" USING btree ("undertaking_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "work_reviews_report_unique" ON "work_reviews" USING btree ("report_id");