import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  uuid,
  pgEnum,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/**
 * Users are provisioned lazily from Clerk (SSO via Google/Microsoft).
 * `id` is the Clerk user id (a stable string), not a generated uuid,
 * so we never have to look anything up before writing owned rows.
 */
export const users = pgTable("users", {
  id: text("id").primaryKey(), // Clerk user id
  email: text("email").notNull(),
  name: text("name"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const meetingStatusEnum = pgEnum("meeting_status", [
  "pending",
  "processing",
  "ready",
  "failed",
]);

/**
 * One uploaded racecard (PDF/CSV) = one meeting, containing many races.
 * Owned by the uploading user (uploads are scoped per user).
 */
export const meetings = pgTable("meetings", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  sourceFileName: text("source_file_name").notNull(),
  courseName: text("course_name"),
  meetingDate: text("meeting_date"), // free-text as printed on the racecard
  status: meetingStatusEnum("status").notNull().default("pending"),
  errorMessage: text("error_message"),
  rawExtractedText: text("raw_extracted_text"), // kept for debugging/re-parsing
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  ownerIdx: index("meetings_owner_idx").on(t.ownerId),
}));

export const races = pgTable("races", {
  id: uuid("id").primaryKey().defaultRandom(),
  meetingId: uuid("meeting_id")
    .notNull()
    .references(() => meetings.id, { onDelete: "cascade" }),
  number: integer("number").notNull(), // 1-based order on the card
  time: text("time").notNull(), // "2:15"
  name: text("name").notNull(),
  going: text("going"),
  distance: text("distance"),
}, (t) => ({
  meetingIdx: index("races_meeting_idx").on(t.meetingId),
  meetingNumberIdx: uniqueIndex("races_meeting_number_idx").on(t.meetingId, t.number),
}));

export const runners = pgTable("runners", {
  id: uuid("id").primaryKey().defaultRandom(),
  raceId: uuid("race_id")
    .notNull()
    .references(() => races.id, { onDelete: "cascade" }),
  no: integer("no").notNull(), // saddlecloth number, as printed
  draw: integer("draw"),
  form: text("form"),
  officialRating: integer("official_rating"),
  name: text("name").notNull(),
  sire: text("sire"),
  dam: text("dam"),
  ageSex: text("age_sex"),
  weight: text("weight"),
  jockey: text("jockey"),
  trainer: text("trainer"),
  owner: text("owner"),
  nonRunner: boolean("non_runner").notNull().default(false),
  subnote: text("subnote"),
  silkAssetKey: text("silk_asset_key"),
}, (t) => ({
  raceIdx: index("runners_race_idx").on(t.raceId),
  raceNoIdx: uniqueIndex("runners_race_no_idx").on(t.raceId, t.no),
}));

/** One dated stewards/vet entry for a runner; may contain several report items. */
export const reports = pgTable("reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  runnerId: uuid("runner_id")
    .notNull()
    .references(() => runners.id, { onDelete: "cascade" }),
  date: text("date").notNull(), // "21 May"
  time: text("time"),
  track: text("track"),
  order: integer("order").notNull().default(0),
}, (t) => ({
  runnerIdx: index("reports_runner_idx").on(t.runnerId),
}));

export const reportItems = pgTable("report_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  reportId: uuid("report_id")
    .notNull()
    .references(() => reports.id, { onDelete: "cascade" }),
  category: text("category").notNull(),
  tag: text("tag"),
  detail: text("detail").notNull(),
  order: integer("order").notNull().default(0),
}, (t) => ({
  reportIdx: index("report_items_report_idx").on(t.reportId),
}));

/** Free-text "My Notes", one per (user, runner). */
export const notes = pgTable("notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  runnerId: uuid("runner_id")
    .notNull()
    .references(() => runners.id, { onDelete: "cascade" }),
  body: text("body").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  userRunnerIdx: uniqueIndex("notes_user_runner_idx").on(t.userId, t.runnerId),
}));

// ---- relations (for the query builder's `with` API) ----

export const usersRelations = relations(users, ({ many }) => ({
  meetings: many(meetings),
  notes: many(notes),
}));

export const meetingsRelations = relations(meetings, ({ one, many }) => ({
  owner: one(users, { fields: [meetings.ownerId], references: [users.id] }),
  races: many(races),
}));

export const racesRelations = relations(races, ({ one, many }) => ({
  meeting: one(meetings, { fields: [races.meetingId], references: [meetings.id] }),
  runners: many(runners),
}));

export const runnersRelations = relations(runners, ({ one, many }) => ({
  race: one(races, { fields: [runners.raceId], references: [races.id] }),
  reports: many(reports),
  notes: many(notes),
}));

export const reportsRelations = relations(reports, ({ one, many }) => ({
  runner: one(runners, { fields: [reports.runnerId], references: [runners.id] }),
  items: many(reportItems),
}));

export const reportItemsRelations = relations(reportItems, ({ one }) => ({
  report: one(reports, { fields: [reportItems.reportId], references: [reports.id] }),
}));

export const notesRelations = relations(notes, ({ one }) => ({
  user: one(users, { fields: [notes.userId], references: [users.id] }),
  runner: one(runners, { fields: [notes.runnerId], references: [runners.id] }),
}));
