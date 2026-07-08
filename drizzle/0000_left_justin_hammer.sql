CREATE TYPE "public"."meeting_status" AS ENUM('pending', 'processing', 'ready', 'failed');--> statement-breakpoint
CREATE TABLE "meetings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" text NOT NULL,
	"source_file_name" text NOT NULL,
	"course_name" text,
	"meeting_date" text,
	"status" "meeting_status" DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"raw_extracted_text" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"runner_id" uuid NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "races" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"meeting_id" uuid NOT NULL,
	"number" integer NOT NULL,
	"time" text NOT NULL,
	"name" text NOT NULL,
	"going" text,
	"distance" text
);
--> statement-breakpoint
CREATE TABLE "report_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" uuid NOT NULL,
	"category" text NOT NULL,
	"tag" text,
	"detail" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"runner_id" uuid NOT NULL,
	"date" text NOT NULL,
	"time" text,
	"track" text,
	"order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "runners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"race_id" uuid NOT NULL,
	"no" integer NOT NULL,
	"draw" integer,
	"form" text,
	"official_rating" integer,
	"name" text NOT NULL,
	"sire" text,
	"dam" text,
	"age_sex" text,
	"weight" text,
	"jockey" text,
	"trainer" text,
	"owner" text,
	"non_runner" boolean DEFAULT false NOT NULL,
	"subnote" text,
	"silk_asset_key" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_runner_id_runners_id_fk" FOREIGN KEY ("runner_id") REFERENCES "public"."runners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "races" ADD CONSTRAINT "races_meeting_id_meetings_id_fk" FOREIGN KEY ("meeting_id") REFERENCES "public"."meetings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_items" ADD CONSTRAINT "report_items_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_runner_id_runners_id_fk" FOREIGN KEY ("runner_id") REFERENCES "public"."runners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "runners" ADD CONSTRAINT "runners_race_id_races_id_fk" FOREIGN KEY ("race_id") REFERENCES "public"."races"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "meetings_owner_idx" ON "meetings" USING btree ("owner_id");--> statement-breakpoint
CREATE UNIQUE INDEX "notes_user_runner_idx" ON "notes" USING btree ("user_id","runner_id");--> statement-breakpoint
CREATE INDEX "races_meeting_idx" ON "races" USING btree ("meeting_id");--> statement-breakpoint
CREATE UNIQUE INDEX "races_meeting_number_idx" ON "races" USING btree ("meeting_id","number");--> statement-breakpoint
CREATE INDEX "report_items_report_idx" ON "report_items" USING btree ("report_id");--> statement-breakpoint
CREATE INDEX "reports_runner_idx" ON "reports" USING btree ("runner_id");--> statement-breakpoint
CREATE INDEX "runners_race_idx" ON "runners" USING btree ("race_id");--> statement-breakpoint
CREATE UNIQUE INDEX "runners_race_no_idx" ON "runners" USING btree ("race_id","no");