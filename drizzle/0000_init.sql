CREATE TABLE "conversations" (
	"id" text PRIMARY KEY NOT NULL,
	"parent_id" text NOT NULL,
	"mentor_id" text NOT NULL,
	"mentee_name" text NOT NULL,
	"mentee_age" integer NOT NULL,
	"school_year" text NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"last_read_parent" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"last_read_mentor" timestamp(3) with time zone DEFAULT 'epoch' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mentors" (
	"seq" bigint GENERATED ALWAYS AS IDENTITY (sequence name "mentors_seq_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"user_id" text NOT NULL,
	"honorific" text,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"role" text NOT NULL,
	"org" text NOT NULL,
	"field" text NOT NULL,
	"city" text NOT NULL,
	"region" text NOT NULL,
	"heritage" text NOT NULL,
	"languages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"years" integer NOT NULL,
	"education" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"specialities" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"ask_me_about" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"headline" text NOT NULL,
	"bio" text NOT NULL,
	"story" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"quote" text DEFAULT '' NOT NULL,
	"photo" text,
	"session_length" integer DEFAULT 45 NOT NULL,
	"age_groups" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"availability" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"verified_dbs" boolean DEFAULT false NOT NULL,
	"verified_id" boolean DEFAULT false NOT NULL,
	"verified_references" boolean DEFAULT false NOT NULL,
	"replies" text NOT NULL,
	"joined" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"approved_at" timestamp(3) with time zone
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"seq" bigint GENERATED ALWAYS AS IDENTITY (sequence name "messages_seq_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"id" text PRIMARY KEY NOT NULL,
	"conversation_id" text NOT NULL,
	"sender_id" text NOT NULL,
	"kind" text NOT NULL,
	"body" text NOT NULL,
	"session_id" text,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"conversation_id" text NOT NULL,
	"mentor_id" text NOT NULL,
	"parent_id" text NOT NULL,
	"start" timestamp(3) with time zone NOT NULL,
	"duration_min" integer NOT NULL,
	"topic" text NOT NULL,
	"goals" text NOT NULL,
	"status" text NOT NULL,
	"meeting_url" text,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"responded_at" timestamp(3) with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"role" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"mentor_id" text,
	"city" text,
	"children" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"digest_sent_at" timestamp(3) with time zone
);
--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_parent_id_users_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_mentor_id_mentors_id_fk" FOREIGN KEY ("mentor_id") REFERENCES "public"."mentors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentors" ADD CONSTRAINT "mentors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_mentor_id_mentors_id_fk" FOREIGN KEY ("mentor_id") REFERENCES "public"."mentors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_parent_id_users_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "conversations_parent_idx" ON "conversations" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "conversations_mentor_idx" ON "conversations" USING btree ("mentor_id");--> statement-breakpoint
CREATE UNIQUE INDEX "mentors_slug_key" ON "mentors" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "mentors_user_id_key" ON "mentors" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "mentors_status_idx" ON "mentors" USING btree ("status");--> statement-breakpoint
CREATE INDEX "messages_conversation_idx" ON "messages" USING btree ("conversation_id","seq");--> statement-breakpoint
CREATE INDEX "sessions_conversation_idx" ON "sessions" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "sessions_parent_idx" ON "sessions" USING btree ("parent_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sessions_live_slot_key" ON "sessions" USING btree ("mentor_id","start") WHERE "sessions"."status" in ('pending', 'accepted');--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_key" ON "users" USING btree ("email");