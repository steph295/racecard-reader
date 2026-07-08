import { z } from "zod";

export const reportItemSchema = z.object({
  cat: z.string(),
  tag: z.string().nullish(),
  detail: z.string(),
});

export const reportSchema = z.object({
  date: z.string(),
  time: z.string().nullish(),
  track: z.string().nullish(),
  items: z.array(reportItemSchema).default([]),
});

export const runnerSchema = z.object({
  no: z.number().int(),
  draw: z.number().int().nullish(),
  form: z.string().nullish(),
  or: z.number().int().nullish(),
  name: z.string(),
  nr: z.boolean().default(false),
  subnote: z.string().nullish(),
  sire: z.string().nullish(),
  dam: z.string().nullish(),
  ageSex: z.string().nullish(),
  weight: z.string().nullish(),
  jockey: z.string().nullish(),
  trainer: z.string().nullish(),
  owner: z.string().nullish(),
  reports: z.array(reportSchema).default([]),
});

export const raceSchema = z.object({
  time: z.string(),
  name: z.string(),
  going: z.string().nullish(),
  distance: z.string().nullish(),
  runners: z.array(runnerSchema).min(1),
});

export const meetingExtractionSchema = z.object({
  courseName: z.string().nullish(),
  meetingDate: z.string().nullish(),
  races: z.array(raceSchema).min(1),
});

export type MeetingExtraction = z.infer<typeof meetingExtractionSchema>;
