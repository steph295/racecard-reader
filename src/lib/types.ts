/**
 * Shared domain types. `Raw*` shapes mirror the structure of the original
 * prototype's hardcoded fixture / an LLM parse result, before it's written
 * to the database. `*Data` shapes are what the DB layer returns to the UI
 * (flattened, with generated ids) after decoration for rendering.
 */

export interface RawReportItem {
  cat: string;
  tag?: string | null;
  detail: string;
}

export interface RawReport {
  date: string;
  time?: string | null;
  track?: string | null;
  items: RawReportItem[];
}

export interface RawRunner {
  no: number;
  draw?: number | null;
  form?: string | null;
  or?: number | null;
  name: string;
  nr?: boolean | null;
  silkSrc?: string | null;
  subnote?: string | null;
  sire?: string | null;
  dam?: string | null;
  ageSex?: string | null;
  weight?: string | null;
  jockey?: string | null;
  trainer?: string | null;
  owner?: string | null;
  reports: RawReport[];
}

export interface RawRace {
  id?: string;
  time: string;
  name: string;
  going?: string | null;
  distance?: string | null;
  runners: RawRunner[];
}

// ---- column configuration (upload-screen-independent UI state) ----

export const COLUMN_ORDER = ["no", "horse", "jt", "comments", "notes"] as const;
export type ColumnKey = (typeof COLUMN_ORDER)[number];

export interface ColumnWidths {
  no: number;
  horse: number;
  jt: number;
  comments: number;
  notes: number;
}

export const DEFAULT_COLUMN_WIDTHS: ColumnWidths = {
  no: 60,
  horse: 210,
  jt: 150,
  comments: 280,
  notes: 150,
};

export const COLUMN_MIN_WIDTHS: ColumnWidths = {
  no: 50,
  horse: 140,
  jt: 110,
  comments: 200,
  notes: 100,
};

export const SILK_COLUMN_WIDTH = 66;

export interface ColumnVisibility {
  silk: boolean;
  no: boolean;
  horse: boolean;
  jt: boolean;
  notes: boolean;
  // "comments" is always visible - it's the core value prop of the app.
}

export const DEFAULT_COLUMN_VISIBILITY: ColumnVisibility = {
  silk: true,
  no: true,
  horse: true,
  jt: true,
  notes: true,
};

// ---- API response shapes (DB rows -> client) ----

export interface ReportItemDTO {
  id: string;
  category: string;
  tag: string | null;
  detail: string;
}

export interface ReportDTO {
  id: string;
  date: string;
  time: string | null;
  track: string | null;
  items: ReportItemDTO[];
}

export interface RunnerDTO {
  id: string;
  no: number;
  draw: number | null;
  form: string | null;
  officialRating: number | null;
  name: string;
  sire: string | null;
  dam: string | null;
  ageSex: string | null;
  weight: string | null;
  jockey: string | null;
  trainer: string | null;
  owner: string | null;
  nonRunner: boolean;
  subnote: string | null;
  silkAssetKey: string | null;
  reports: ReportDTO[];
  noteBody: string;
}

export interface RaceDTO {
  id: string;
  number: number;
  time: string;
  name: string;
  going: string | null;
  distance: string | null;
  runners: RunnerDTO[];
}

export interface MeetingSummaryDTO {
  id: string;
  sourceFileName: string;
  courseName: string | null;
  meetingDate: string | null;
  status: "pending" | "processing" | "ready" | "failed";
  errorMessage: string | null;
  createdAt: string;
  raceCount: number;
  runnerCount: number;
  reportCount: number;
}

export interface MeetingDetailDTO extends MeetingSummaryDTO {
  races: RaceDTO[];
}
