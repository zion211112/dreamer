CREATE TABLE "participant_reflections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reflection_id" uuid NOT NULL,
	"undertaking_id" uuid NOT NULL,
	"author_person_id" uuid NOT NULL,
	"learning" text NOT NULL,
	"local_value" text NOT NULL,
	"financial_record_assessment" varchar(24) NOT NULL,
	"financial_record_rationale" text NOT NULL,
	"version" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "participant_reflections_financial_assessment_check" CHECK ("participant_reflections"."financial_record_assessment" in ('consider', 'not_indicated', 'uncertain'))
);
--> statement-breakpoint
ALTER TABLE "participant_reflections" ADD CONSTRAINT "participant_reflections_undertaking_id_undertakings_id_fk" FOREIGN KEY ("undertaking_id") REFERENCES "public"."undertakings"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participant_reflections" ADD CONSTRAINT "participant_reflections_author_person_id_apt_persons_id_fk" FOREIGN KEY ("author_person_id") REFERENCES "public"."apt_persons"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "participant_reflections_reflection_version_unique" ON "participant_reflections" USING btree ("reflection_id","version");--> statement-breakpoint
CREATE UNIQUE INDEX "participant_reflections_author_undertaking_version_unique" ON "participant_reflections" USING btree ("undertaking_id","author_person_id","version");--> statement-breakpoint
CREATE INDEX "participant_reflections_undertaking_idx" ON "participant_reflections" USING btree ("undertaking_id","created_at");--> statement-breakpoint
CREATE OR REPLACE FUNCTION apt_participant_reflections_no_mutation() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'participant_reflections are append-only';
END;
$$;
--> statement-breakpoint
CREATE TRIGGER participant_reflections_append_only
BEFORE UPDATE OR DELETE ON participant_reflections
FOR EACH ROW EXECUTE FUNCTION apt_participant_reflections_no_mutation();